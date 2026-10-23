import {recoverPhotoReservation} from '@/lib/photo-recovery';
import { randomBytes, createHash, randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeInput } from '@/lib/rate-limit';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';
import { getPhotoPortalSettings } from '@/lib/photo-portal';
import { photoCookieName, readPhotoPrincipal } from '@/lib/photo-upload-access';
import { invalidateDashboardCounters } from '@/lib/dashboard-counters';

export const dynamic = 'force-dynamic';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_UPLOADS_PER_SHARING_CODE = 3;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

function isMissingWeddingDaySettingsError(error: unknown) {
    const details = error && typeof error === 'object' ? error as { code?: string; message?: string } : {};
    const message = String(details.message || '');
    return details.code === '42P01'
        || details.code === 'PGRST205'
        || message.includes('wedding_day_settings')
        || (message.includes('relation') && message.includes('does not exist'));
}

export async function POST(req: NextRequest) {
    const rateLimit = createRateLimitMiddleware('PHOTO_UPLOAD');
    const clientIP = getClientIP(req);

    try {
        const form = await req.formData();
        const weddingIdentifier = String(form.get('weddingId') || '');
        const code = sanitizeInput(String(form.get('code') || ''), { maxLength: 32 }).toUpperCase();
        const rawUploaderName = sanitizeInput(String(form.get('uploaderName') || ''), { maxLength: 120 });
        const uploaderName = rawUploaderName || 'Guest';
        const caption = sanitizeInput(String(form.get('caption') || ''), { maxLength: 500, allowNewlines: true });
        const requestId = String(form.get('uploadRequestId') || randomUUID());
        if (!/^[0-9a-f-]{36}$/i.test(requestId)) return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 });
        const rawEditMetadata = String(form.get('editMetadata') || '');
        if(rawEditMetadata.length>4096)return NextResponse.json({error:'Photo edit details are too large.'},{status:400});
        const file = form.get('file');

        if (!weddingIdentifier || !code || !(file instanceof File)) {
            return NextResponse.json({ error: 'Wedding, sharing code, and photo are required.' }, { status: 400 });
        }

        const limited = await rateLimit.check(`${clientIP}:${weddingIdentifier}:${code || 'no-code'}`);
        if (limited.limited) return limited.response;

        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            return NextResponse.json({ error: 'Only JPEG, PNG, WebP, or GIF images can be uploaded.' }, { status: 400 });
        }

        if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) {
            return NextResponse.json({ error: 'Photo must be 10 MB or smaller.' }, { status: 400 });
        }

        const db = getSupabaseAdminClient() as any;
        const { wedding, error: weddingError } = await resolvePublicWeddingByIdentifier(db, weddingIdentifier, 'id');

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        const weddingId = wedding.id;

        const { data: weddingDaySettings, error: weddingDayError } = await db
            .from('wedding_day_settings')
            .select('photo_upload_enabled')
            .eq('wedding_id', weddingId)
            .maybeSingle();

        if (weddingDayError && !isMissingWeddingDaySettingsError(weddingDayError)) {
            throw weddingDayError;
        }
        if (weddingDaySettings?.photo_upload_enabled === false) {
            return NextResponse.json({ error: 'Photo uploads are currently paused by the couple.' }, { status: 403 });
        }

        const settings = await getPhotoPortalSettings(db, weddingId);

        if (settings.disposable_camera_enabled && settings.guest_name_required && !rawUploaderName) {
            return NextResponse.json({ error: 'Your name is required for this photo roll.' }, { status: 400 });
        }

        if (settings.disposable_camera_enabled && !settings.allow_anonymous_uploads && !rawUploaderName) {
            return NextResponse.json({ error: 'Anonymous uploads are not enabled for this photo roll.' }, { status: 400 });
        }

        const { data: sharingCode, error: codeError } = await db
            .from('photo_sharing_codes')
            .select('id, max_uploads, current_uploads, expires_at')
            .eq('wedding_id', weddingId)
            .eq('code', code)
            .eq('is_active', true)
            .maybeSingle();

        if (codeError) throw codeError;
        if (!sharingCode || (sharingCode.expires_at && !(new Date(sharingCode.expires_at).getTime() > Date.now()))) {
            return NextResponse.json({ error: 'Invalid or inactive sharing code. Please check with the couple.' }, { status: 403 });
        }

        const principal = readPhotoPrincipal(req.cookies.get(photoCookieName(weddingId, sharingCode.id))?.value || '', weddingId, sharingCode.id);
        if (!principal) return NextResponse.json({ error: 'Please validate your sharing code before uploading.' }, { status: 403 });
        const guestIdentifier = principal.principal;
        const perGuestLimit = Math.max(1, settings.photo_limit_per_guest || MAX_UPLOADS_PER_SHARING_CODE);
        const autoApprove = settings.disposable_camera_enabled ? !settings.require_approval : false;
        const status = autoApprove ? 'approved' : 'pending';
        let editMetadata: Record<string, unknown> = {};
        try {
            const parsed = rawEditMetadata ? JSON.parse(rawEditMetadata) : {};
            if (parsed && typeof parsed === 'object') {
                editMetadata = parsed;
            }
        } catch {
            editMetadata = {};
        }

        const extension = EXTENSIONS[file.type] || 'jpg';
        let objectPath = `guest-uploads/${weddingId}/${Date.now()}_${randomBytes(12).toString('hex')}.${extension}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { data: privateUrl } = db.storage.from('quickweds-guest-photos').getPublicUrl(objectPath);
        const photoData={uploader_name:uploaderName,caption:caption||null,status,is_approved:autoApprove,cloudinary_url:privateUrl?.publicUrl,metadata:{disposable_camera_enabled:settings.disposable_camera_enabled,file_type:file.type,file_size:file.size,edits:editMetadata}};
        const args={p_wedding:weddingId,p_code:sharingCode.id,p_principal:guestIdentifier,p_request:requestId,p_hash:createHash('sha256').update(buffer).digest('hex'),p_path:objectPath,p_guest_limit:perGuestLimit,p_data:photoData};
        const { data: initialReservation, error: reservationError } = await db.rpc('quickweds_reserve_photo', args);
        let reservation = initialReservation;
        if (reservationError) throw reservationError;
        if(reservation.state==='busy' && reservation.id){
            const recovered=await recoverPhotoReservation(db,weddingId,reservation.id);
            if(recovered.state==='complete')return NextResponse.json({success:true,photoId:recovered.photoId},{headers:limited.headers});
            if(recovered.state==='released'){const retried=await db.rpc('quickweds_reserve_photo',args);if(retried.error)throw retried.error;reservation=retried.data;}
        }
        if (reservation.state === 'complete') return NextResponse.json({ success: true, photoId: reservation.photo_id }, { headers: limited.headers });
        if (reservation.state !== 'reserved') return NextResponse.json({ error: reservation.state === 'limited' ? 'This roll or sharing code has reached its upload limit.' : 'This upload is already processing, or its request changed. Retry the same photo shortly.', code: reservation.state }, { status: reservation.state === 'limited' ? 403 : 409 });
        objectPath = reservation.object_path;
        const { error: uploadError } = await db.storage
            .from('quickweds-guest-photos')
            .upload(objectPath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            // An uncertain storage result must be checked after its lease, never delete a possibly completed object.
            return NextResponse.json({error:'Upload could not be confirmed. Retry the same photo after five minutes; your quota will be reconciled safely.'},{status:503});
        }

        const { data: photoId, error: insertError } = await db.rpc('quickweds_complete_photo',{p_id:reservation.id,p_data:photoData,p_claim:reservation.claim_token});

        if (insertError) {
            console.error('Photo completion needs reconciliation:', reservation.id);
            throw insertError;
        }
        await invalidateDashboardCounters(weddingId);

        return NextResponse.json({ success: true, photoId }, { headers: limited.headers });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to upload photo.';
        console.error('Guest photo upload failed:', message);
        return NextResponse.json({ error: 'Unable to upload photo.' }, { status: 500 });
    }
}

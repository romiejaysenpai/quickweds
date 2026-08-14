import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeInput } from '@/lib/rate-limit';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';
import { getPhotoPortalSettings } from '@/lib/photo-portal';
import { createUploadSession, hasUploadSessionStore, incrementUploadCount, validateUploadSession } from '@/lib/upload-sessions';
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

async function reservePhotoUpload(db: any, codeId: string, limit: number) {
    const { data, error } = await db.rpc('reserve_photo_upload', {
        p_code_id: codeId,
        p_upload_limit: limit,
    });

    if (error) throw error;
    return Boolean(data);
}

async function releasePhotoUploadReservation(db: any, codeId: string) {
    const { error } = await db.rpc('release_photo_upload_reservation', {
        p_code_id: codeId,
    });
    if (error) console.error('Failed to release photo upload reservation:', error);
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
        const guestIdentifierInput = sanitizeInput(String(form.get('guestIdentifier') || ''), { maxLength: 160 });
        const uploadSessionInput = sanitizeInput(String(form.get('uploadSessionId') || ''), { maxLength: 80 });
        const rawEditMetadata = String(form.get('editMetadata') || '');
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
        const settings = await getPhotoPortalSettings(db, weddingId);

        if (settings.disposable_camera_enabled && settings.guest_name_required && !rawUploaderName) {
            return NextResponse.json({ error: 'Your name is required for this photo roll.' }, { status: 400 });
        }

        if (settings.disposable_camera_enabled && !settings.allow_anonymous_uploads && !rawUploaderName) {
            return NextResponse.json({ error: 'Anonymous uploads are not enabled for this photo roll.' }, { status: 400 });
        }

        const { data: sharingCode, error: codeError } = await db
            .from('photo_sharing_codes')
            .select('id, max_uploads, current_uploads')
            .eq('wedding_id', weddingId)
            .eq('code', code)
            .eq('is_active', true)
            .maybeSingle();

        if (codeError) throw codeError;
        if (!sharingCode) {
            return NextResponse.json({ error: 'Invalid or inactive sharing code. Please check with the couple.' }, { status: 403 });
        }

        const currentUploads = Number(sharingCode.current_uploads ?? 0);
        const guestIdentifier = guestIdentifierInput || `${sharingCode.id}:${clientIP}`;
        const configuredLimit = settings.disposable_camera_enabled
            ? settings.photo_limit_per_guest
            : MAX_UPLOADS_PER_SHARING_CODE;
        const codeLimit = Math.min(Number(sharingCode.max_uploads ?? configuredLimit), configuredLimit);
        let uploadSessionId = uploadSessionInput;

        if (currentUploads >= codeLimit) {
            return NextResponse.json({ error: `This sharing code has reached its ${codeLimit}-photo limit.` }, { status: 403 });
        }

        if (hasUploadSessionStore()) {
            const existingSession = uploadSessionId ? await validateUploadSession(uploadSessionId) : null;
            let session = existingSession?.weddingId === weddingId ? existingSession : null;
            if (!session) {
                session = await createUploadSession(weddingId, guestIdentifier, 20);
            }
            uploadSessionId = session.sessionId;

            const sessionCount = await incrementUploadCount(uploadSessionId);
            if (!sessionCount.ok) {
                return NextResponse.json({
                    error: 'This upload session has reached its photo limit. Please refresh the page and try again later.',
                    code: sessionCount.reason,
                    uploadSessionId,
                }, { status: 429 });
            }
        }

        if (settings.disposable_camera_enabled) {
            const { count, error: countError } = await db
                .from('wedding_photos')
                .select('id', { count: 'exact', head: true })
                .eq('wedding_id', weddingId)
                .eq('guest_identifier', guestIdentifier)
                .neq('status', 'rejected');

            if (countError) throw countError;
            if (Number(count || 0) >= settings.photo_limit_per_guest) {
                return NextResponse.json({ error: `You have reached the ${settings.photo_limit_per_guest}-photo limit for this roll.` }, { status: 403 });
            }
        }

        const reserved = await reservePhotoUpload(db, sharingCode.id, codeLimit);
        if (!reserved) {
            return NextResponse.json({ error: `This sharing code has reached its ${codeLimit}-photo limit.` }, { status: 403 });
        }

        const extension = EXTENSIONS[file.type] || 'jpg';
        const objectPath = `guest-uploads/${weddingId}/${Date.now()}_${randomBytes(12).toString('hex')}.${extension}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await db.storage
            .from('quickweds')
            .upload(objectPath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            await releasePhotoUploadReservation(db, sharingCode.id);
            throw uploadError;
        }

        const { data: publicUrlData } = db.storage.from('quickweds').getPublicUrl(objectPath);
        const publicUrl = publicUrlData?.publicUrl;

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

        const { error: insertError } = await db.from('wedding_photos').insert({
            wedding_id: weddingId,
            uploader_name: uploaderName,
            cloudinary_url: publicUrl,
            cloudinary_public_id: objectPath,
            caption: caption || null,
            message: caption || null,
            guest_identifier: guestIdentifier,
            upload_source: 'guest_upload',
            status,
            is_approved: autoApprove,
            approved_at: autoApprove ? new Date().toISOString() : null,
            metadata: {
                disposable_camera_enabled: settings.disposable_camera_enabled,
                file_type: file.type,
                file_size: file.size,
                edits: editMetadata,
            },
        });

        if (insertError) {
            await releasePhotoUploadReservation(db, sharingCode.id);
            throw insertError;
        }
        await invalidateDashboardCounters(weddingId);

        return NextResponse.json({ success: true, uploadSessionId: uploadSessionId || null }, { headers: limited.headers });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to upload photo.';
        console.error('Guest photo upload failed:', message);
        return NextResponse.json({ error: 'Unable to upload photo.' }, { status: 500 });
    }
}

import { randomBytes, randomUUID } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeInput } from '@/lib/rate-limit';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';
import { getPhotoPortalSettings } from '@/lib/photo-portal';
import { invalidateDashboardCounters } from '@/lib/dashboard-counters';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_UPLOAD_SIZE, MEDIA_BUCKET, fileTooLargeMessage } from '@/lib/media-upload';

export const dynamic = 'force-dynamic';

const MAX_UPLOADS_PER_SHARING_CODE = 3;
const EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

type UploadFileMetadata = { name?: unknown; type?: unknown; size?: unknown };

function parseUploadFile(value: UploadFileMetadata | undefined) {
    const name = sanitizeInput(String(value?.name || ''), { maxLength: 180 });
    const type = String(value?.type || '').toLowerCase();
    const size = Number(value?.size || 0);
    if (!name || !ACCEPTED_IMAGE_TYPES.has(type)) {
        throw new Error('This format is not supported. Use a JPEG, PNG, WebP, or GIF photo.');
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_UPLOAD_SIZE) {
        throw new Error(fileTooLargeMessage({ name, size: Number.isFinite(size) ? size : 0 } as File, MAX_IMAGE_UPLOAD_SIZE));
    }
    return { name, type, size };
}

function parseEditMetadata(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function POST(req: NextRequest) {
    const rateLimit = createRateLimitMiddleware('PHOTO_UPLOAD');
    const clientIP = getClientIP(req);

    try {
        const body = await req.json().catch(() => null) as Record<string, unknown> | null;
        if (!body || (body.operation !== 'prepare' && body.operation !== 'complete')) {
            return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 });
        }

        if (body.operation === 'complete') {
            const intentId = sanitizeInput(String(body.intentId || ''), { maxLength: 80 });
            if (!intentId) return NextResponse.json({ error: 'Upload confirmation is missing.' }, { status: 400 });
            const db = getSupabaseAdminClient() as any;
            const { data: intent, error: intentError } = await db
                .from('photo_upload_intents')
                .select('object_path')
                .eq('id', intentId)
                .maybeSingle();
            if (intentError) throw intentError;
            if (!intent) return NextResponse.json({ error: 'This upload has expired. Please select the photo again.' }, { status: 404 });

            const path = String(intent.object_path);
            const separator = path.lastIndexOf('/');
            const { data: objects, error: objectError } = await db.storage
                .from(MEDIA_BUCKET)
                .list(path.slice(0, separator), { limit: 10, search: path.slice(separator + 1) });
            if (objectError) throw objectError;
            const uploadedObject = objects?.find((object: { name: string }) => object.name === path.slice(separator + 1));
            const objectSize = Number((uploadedObject as any)?.metadata?.size || 0);
            if (!uploadedObject || !Number.isFinite(objectSize) || objectSize <= 0 || objectSize > MAX_IMAGE_UPLOAD_SIZE) {
                return NextResponse.json({ error: 'The photo was not received correctly. Please retry the upload.' }, { status: 409 });
            }

            const { data: completed, error: completeError } = await db.rpc('complete_photo_upload_intent', { p_intent_id: intentId });
            if (completeError) throw completeError;
            const completion = Array.isArray(completed) ? completed[0] : completed;
            if (!completion?.success) throw new Error('Unable to save this photo. Please retry.');
            await invalidateDashboardCounters(completion.wedding_id);
            return NextResponse.json({ success: true, alreadyCompleted: Boolean(completion.already_completed) });
        }

        const weddingIdentifier = String(body.weddingId || '');
        const code = sanitizeInput(String(body.code || ''), { maxLength: 32 }).toUpperCase();
        const rawUploaderName = sanitizeInput(String(body.uploaderName || ''), { maxLength: 120 });
        const uploaderName = rawUploaderName || 'Guest';
        const caption = sanitizeInput(String(body.caption || ''), { maxLength: 500, allowNewlines: true });
        const guestIdentifierInput = sanitizeInput(String(body.guestIdentifier || ''), { maxLength: 160 });
        let file: ReturnType<typeof parseUploadFile>;
        try {
            file = parseUploadFile(body.file as UploadFileMetadata | undefined);
        } catch (error) {
            return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid photo file.' }, { status: 400 });
        }
        const editMetadata = parseEditMetadata(body.editMetadata);
        if (!weddingIdentifier || !code) {
            return NextResponse.json({ error: 'Wedding, sharing code, and photo are required.' }, { status: 400 });
        }

        const limited = await rateLimit.check(`${clientIP}:${weddingIdentifier}:${code}`);
        if (limited.limited) return limited.response;

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
        if (!sharingCode) return NextResponse.json({ error: 'Invalid or inactive sharing code. Please check with the couple.' }, { status: 403 });

        const configuredLimit = settings.disposable_camera_enabled ? settings.photo_limit_per_guest : MAX_UPLOADS_PER_SHARING_CODE;
        const codeLimit = Math.min(Number(sharingCode.max_uploads ?? configuredLimit), configuredLimit);
        if (Number(sharingCode.current_uploads ?? 0) >= codeLimit) {
            return NextResponse.json({ error: `This sharing code has reached its ${codeLimit}-photo limit.` }, { status: 403 });
        }

        const guestIdentifier = guestIdentifierInput || `${sharingCode.id}:${clientIP}`;
        const extension = EXTENSIONS[file.type] || 'jpg';
        const objectPath = `guest-uploads/${weddingId}/${Date.now()}_${randomBytes(12).toString('hex')}.${extension}`;
        const { data: publicUrlData } = db.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);
        const autoApprove = settings.disposable_camera_enabled ? !settings.require_approval : false;
        const intentId = randomUUID();
        const { error: intentError } = await db.from('photo_upload_intents').insert({
            id: intentId,
            wedding_id: weddingId,
            sharing_code_id: sharingCode.id,
            object_path: objectPath,
            public_url: publicUrlData.publicUrl,
            uploader_name: uploaderName,
            caption: caption || null,
            guest_identifier: guestIdentifier,
            file_type: file.type,
            file_size: file.size,
            code_limit: codeLimit,
            guest_limit: settings.disposable_camera_enabled ? settings.photo_limit_per_guest : null,
            auto_approve: autoApprove,
            metadata: { disposable_camera_enabled: settings.disposable_camera_enabled, edits: editMetadata },
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });
        if (intentError) throw intentError;

        const { data: signedUpload, error: signedUploadError } = await db.storage
            .from(MEDIA_BUCKET)
            .createSignedUploadUrl(objectPath);
        if (signedUploadError || !signedUpload?.token) throw signedUploadError || new Error('Unable to create a secure upload URL.');

        return NextResponse.json({ success: true, intentId, bucket: MEDIA_BUCKET, path: objectPath, token: signedUpload.token }, { headers: limited.headers });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to upload photo.';
        console.error('Guest photo upload failed:', message);
        return NextResponse.json({ error: message || 'Unable to upload photo.' }, { status: 500 });
    }
}

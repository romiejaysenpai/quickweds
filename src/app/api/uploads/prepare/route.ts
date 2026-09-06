import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import {
    ACCEPTED_IMAGE_TYPES,
    MAX_AUDIO_UPLOAD_SIZE,
    MAX_IMAGE_SOURCE_SIZE,
    MAX_VIDEO_UPLOAD_SIZE,
    MEDIA_BUCKET,
} from '@/lib/media-upload';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
    purpose: z.enum(['builder-media', 'supplier-logo', 'supplier-gallery', 'planner-food-reference']),
    weddingId: z.string().max(64).optional(),
    file: z.object({
        name: z.string().min(1).max(180),
        type: z.string().min(1).max(128),
        size: z.number().int().positive(),
    }),
});

const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);
const AUDIO_TYPES = new Set([
    'audio/aac',
    'audio/flac',
    'audio/m4a',
    'audio/mp4',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'audio/x-m4a',
    'audio/x-wav',
]);
const EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/x-m4a': 'm4a',
    'audio/x-wav': 'wav',
};

function invalidFileResponse(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
}

function validateFile(
    purpose: z.infer<typeof requestSchema>['purpose'],
    file: z.infer<typeof requestSchema>['file']
) {
    const type = file.type.toLowerCase();
    const image = ACCEPTED_IMAGE_TYPES.has(type);
    const video = VIDEO_TYPES.has(type);
    const audio = AUDIO_TYPES.has(type);

    if (purpose === 'builder-media') {
        if (!image && !video && !audio) {
            return 'This file format is not supported. Upload a JPEG, PNG, WebP, GIF, MP4, MOV, WebM, MP3, M4A, WAV, OGG, AAC, or FLAC file.';
        }
        const maximum = image ? MAX_IMAGE_SOURCE_SIZE : video ? MAX_VIDEO_UPLOAD_SIZE : MAX_AUDIO_UPLOAD_SIZE;
        if (file.size > maximum) {
            return `This file is larger than the ${Math.floor(maximum / 1024 / 1024)}MB upload limit.`;
        }
    } else {
        const maximum = purpose === 'supplier-logo' ? 5 * 1024 * 1024 : 8 * 1024 * 1024;
        if (!image) return 'This upload accepts JPEG, PNG, WebP, or GIF images only.';
        if (file.size > maximum) return `This image is larger than the ${Math.floor(maximum / 1024 / 1024)}MB upload limit.`;
    }

    return null;
}

async function authorizeWeddingUpload(
    db: ReturnType<typeof getSupabaseAdminClient>,
    user: Pick<User, 'id' | 'email'>,
    weddingId: string,
    allowNewBuilderWedding: boolean
) {
    const access = await getWeddingAccess(db, user, weddingId);
    if (!access.wedding) {
        return allowNewBuilderWedding
            ? { allowed: true, newWedding: true }
            : { allowed: false, status: 404, error: 'Wedding not found.' };
    }
    if (!access.canManage) {
        return { allowed: false, status: 403, error: 'You do not have permission to upload files for this wedding.' };
    }
    return { allowed: true, newWedding: false };
}

async function authorizeSupplierUpload(db: ReturnType<typeof getSupabaseAdminClient>, user: Pick<User, 'id' | 'email'>) {
    if (isKnownAdminEmail(user.email)) return true;

    const { data, error } = await db
        .from('user_app_profiles')
        .select('account_type')
        .eq('user_id', user.id)
        .maybeSingle();
    if (error) throw error;
    const account = data as unknown as { account_type?: string | null } | null;
    return account?.account_type === 'supplier';
}

export async function POST(req: NextRequest) {
    const { user, error: authError } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

    const parsed = requestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return invalidFileResponse('Invalid upload request.');
    }

    const { purpose, file } = parsed.data;
    const fileError = validateFile(purpose, file);
    if (fileError) return invalidFileResponse(fileError);

    const rateLimit = createRateLimitMiddleware('PHOTO_UPLOAD');
    const limited = await rateLimit.check(`${user.id}:${getClientIP(req)}`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient();
        let objectPath: string;

        if (purpose === 'builder-media' || purpose === 'planner-food-reference') {
            const weddingId = sanitizeWeddingId(parsed.data.weddingId || '');
            if (!weddingId) {
                return NextResponse.json({ error: 'A valid wedding ID is required for this upload.' }, { status: 400 });
            }
            const access = await authorizeWeddingUpload(db, user, weddingId, purpose === 'builder-media');
            if (!access.allowed) {
                return NextResponse.json({ error: access.error }, { status: access.status });
            }
            const prefix = purpose === 'builder-media' ? 'builder-media' : 'planner-food';
            objectPath = `${prefix}/${weddingId}/${randomUUID()}.${EXTENSIONS[file.type.toLowerCase()]}`;
        } else {
            const isSupplier = await authorizeSupplierUpload(db, user);
            if (!isSupplier) {
                return NextResponse.json({ error: 'Only supplier accounts can upload business media.' }, { status: 403 });
            }
            const kind = purpose === 'supplier-logo' ? 'logo' : 'gallery';
            objectPath = `supplier-media/${user.id}/${kind}-${randomUUID()}.${EXTENSIONS[file.type.toLowerCase()]}`;
        }

        const { data: signedUpload, error: signedUploadError } = await db.storage
            .from(MEDIA_BUCKET)
            .createSignedUploadUrl(objectPath);
        if (signedUploadError || !signedUpload?.token) {
            throw signedUploadError || new Error('Unable to create a secure upload URL.');
        }

        const { data: publicUrl } = db.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);
        return NextResponse.json({
            bucket: MEDIA_BUCKET,
            path: objectPath,
            token: signedUpload.token,
            publicUrl: publicUrl.publicUrl,
            contentType: file.type.toLowerCase(),
        }, {
            headers: {
                ...limited.headers,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Authenticated upload preparation failed:', error instanceof Error ? error.message : 'unknown error');
        return NextResponse.json({ error: 'Unable to prepare this upload. Please try again.' }, { status: 500 });
    }
}

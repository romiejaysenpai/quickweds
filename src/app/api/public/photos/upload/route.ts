import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeInput } from '@/lib/rate-limiter';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';

export const dynamic = 'force-dynamic';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

export async function POST(req: NextRequest) {
    const rateLimit = createRateLimitMiddleware('PHOTO_UPLOAD');
    const clientIP = getClientIP(req);

    try {
        const form = await req.formData();
        const weddingIdentifier = String(form.get('weddingId') || '');
        const code = sanitizeInput(String(form.get('code') || ''), { maxLength: 32 }).toUpperCase();
        const uploaderName = sanitizeInput(String(form.get('uploaderName') || 'Guest'), { maxLength: 120 }) || 'Guest';
        const caption = sanitizeInput(String(form.get('caption') || ''), { maxLength: 500, allowNewlines: true });
        const file = form.get('file');

        if (!weddingIdentifier || !code || !(file instanceof File)) {
            return NextResponse.json({ error: 'Wedding, sharing code, and photo are required.' }, { status: 400 });
        }

        const limited = rateLimit.check(`${clientIP}:${weddingIdentifier}`);
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

        const { data: sharingCode, error: codeError } = await db
            .from('photo_sharing_codes')
            .select('id')
            .eq('wedding_id', weddingId)
            .eq('code', code)
            .eq('is_active', true)
            .maybeSingle();

        if (codeError) throw codeError;
        if (!sharingCode) {
            return NextResponse.json({ error: 'Invalid or inactive sharing code. Please check with the couple.' }, { status: 403 });
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

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = db.storage.from('quickweds').getPublicUrl(objectPath);
        const publicUrl = publicUrlData?.publicUrl;

        const { error: insertError } = await db.from('wedding_photos').insert({
            wedding_id: weddingId,
            uploader_name: uploaderName,
            cloudinary_url: publicUrl,
            cloudinary_public_id: objectPath,
            caption: caption || null,
            is_approved: false,
        });

        if (insertError) throw insertError;

        return NextResponse.json({ success: true }, { headers: limited.headers });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to upload photo.';
        console.error('Guest photo upload failed:', message);
        return NextResponse.json({ error: 'Unable to upload photo.' }, { status: 500 });
    }
}

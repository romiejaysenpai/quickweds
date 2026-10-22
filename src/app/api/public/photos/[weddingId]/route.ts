import { hydratePhotoUrls } from '@/lib/photo-urls';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limit';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';
import { getPhotoPortalSettings, isGalleryHiddenByReveal } from '@/lib/photo-portal';

export const dynamic = 'force-dynamic';

function isMissingWeddingDaySettingsError(error: unknown) {
    const details = error && typeof error === 'object' ? error as { code?: string; message?: string } : {};
    const message = String(details.message || '');
    return details.code === '42P01'
        || details.code === 'PGRST205'
        || message.includes('wedding_day_settings')
        || (message.includes('relation') && message.includes('does not exist'));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ weddingId: string }> }) {
    const { weddingId: rawWeddingId } = await params;

    const rateLimit = createRateLimitMiddleware('WEDDING_READ');
    const limited = await rateLimit.check(`${getClientIP(req)}:${rawWeddingId}:photos`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const weddingRes = await resolvePublicWeddingByIdentifier(db, rawWeddingId, 'id, bride_name, groom_name');

        if (weddingRes.error) throw weddingRes.error;
        if (!weddingRes.identifier || !weddingRes.wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        const weddingId = weddingRes.wedding.id;
        const [settings, weddingDayRes] = await Promise.all([
            getPhotoPortalSettings(db, weddingId),
            db
                .from('wedding_day_settings')
                .select('photo_upload_enabled')
                .eq('wedding_id', weddingId)
                .maybeSingle(),
        ]);

        if (weddingDayRes.error && !isMissingWeddingDaySettingsError(weddingDayRes.error)) {
            throw weddingDayRes.error;
        }

        const photoUploadEnabled = weddingDayRes.data?.photo_upload_enabled !== false;
        const galleryHidden = isGalleryHiddenByReveal(settings);
        const photosRes = galleryHidden
            ? { data: [], error: null }
            : await db.from('wedding_photos')
                .select('id, storage_bucket, cloudinary_public_id, cloudinary_url, caption, message, uploader_name')
                .eq('wedding_id', weddingId)
                .eq('is_approved', true)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

        if (photosRes.error) throw photosRes.error;

        return NextResponse.json(
            {
                wedding: weddingRes.wedding,
                photos: await hydratePhotoUrls(db, photosRes.data || [],weddingId),
                settings: { ...settings, photo_upload_enabled: photoUploadEnabled },
                photoUploadEnabled,
                galleryHidden,
            },
            { headers: { ...limited.headers, 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load photos.';
        console.error('Public photo load failed:', message);
        return NextResponse.json({ error: 'Unable to load photos.' }, { status: 500 });
    }
}

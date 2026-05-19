import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limiter';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ weddingId: string }> }) {
    const { weddingId: rawWeddingId } = await params;

    const rateLimit = createRateLimitMiddleware('WEDDING_READ');
    const limited = rateLimit.check(`${getClientIP(req)}:${rawWeddingId}:photos`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const weddingRes = await resolvePublicWeddingByIdentifier(db, rawWeddingId, 'id, bride_name, groom_name');

        if (weddingRes.error) throw weddingRes.error;
        if (!weddingRes.identifier || !weddingRes.wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        const weddingId = weddingRes.wedding.id;
        const [photosRes] = await Promise.all([
            db.from('wedding_photos')
                .select('id, cloudinary_url, caption, uploader_name')
                .eq('wedding_id', weddingId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false }),
        ]);

        if (photosRes.error) throw photosRes.error;

        return NextResponse.json(
            { wedding: weddingRes.wedding, photos: photosRes.data || [] },
            { headers: { ...limited.headers, 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load photos.';
        console.error('Public photo load failed:', message);
        return NextResponse.json({ error: 'Unable to load photos.' }, { status: 500 });
    }
}

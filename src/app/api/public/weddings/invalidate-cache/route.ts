import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { invalidateWeddingPublicCache } from '@/lib/public-wedding';
import { createRateLimitMiddleware, sanitizeWeddingId } from '@/lib/rate-limit';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

    const rateLimit = createRateLimitMiddleware('AUTHENTICATED_DEFAULT');
    const limited = await rateLimit.check(`invalidate-cache:${user.id}`);
    if (limited.limited) return limited.response;

    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));

    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const db = getSupabaseAdminClient() as any;
        const access = await getWeddingAccess(db, user, weddingId, {
            select: 'id, user_id, public_slug',
            collaboratorRoles: ['partner', 'coordinator'],
        });

        if (!access.wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        if (!access.canManage) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Only invalidate keys belonging to this verified wedding (never trust arbitrary body.publicSlug).
        await invalidateWeddingPublicCache(weddingId, access.wedding.public_slug);
        return NextResponse.json({ success: true }, { headers: limited.headers });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to invalidate wedding cache.';
        console.error('Wedding cache invalidation failed:', message);
        return NextResponse.json({ error: 'Unable to invalidate wedding cache.' }, { status: 500 });
    }
}

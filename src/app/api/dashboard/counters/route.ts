import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRequest } from '@/lib/api-rate-limit';
import { getDashboardCounters } from '@/lib/dashboard-counters';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizeWeddingId } from '@/lib/rate-limiter';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedRequest(req, 'AUTHENTICATED_DEFAULT');
    if (auth.response) return auth.response;
    const { user, rateLimitHeaders } = auth;

    const weddingId = sanitizeWeddingId(req.nextUrl.searchParams.get('weddingId') || '');
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const db = getSupabaseAdminClient() as any;
        const access = await getWeddingAccess(db, user, weddingId, {
            select: 'id, user_id',
            collaboratorRoles: ['partner', 'coordinator'],
        });

        if (!access.wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        if (!access.canManage) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const counters = await getDashboardCounters(db, weddingId);
        return NextResponse.json({ counters }, {
            headers: {
                ...rateLimitHeaders,
                'Cache-Control': 'private, max-age=30',
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load dashboard counters.';
        console.error('Dashboard counters failed:', message);
        return NextResponse.json({ error: 'Unable to load dashboard counters.' }, { status: 500 });
    }
}


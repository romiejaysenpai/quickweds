import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getRsvpPageWedding, RSVP_PAGE_COLUMNS } from '@/lib/rsvp-wedding';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
export async function GET(req: NextRequest) {
    const limited = await createRateLimitMiddleware('RSVP_GUEST_SEARCH').check(`rsvp-page:${getClientIP(req)}`);
    if (limited.limited) return limited.response;
    try {
        const db = getSupabaseAdminClient() as any;
        const { wedding, error } = await getRsvpPageWedding(db, req.nextUrl.searchParams.get('weddingId') || '');
        if (error) throw error;
        if (!wedding) return NextResponse.json({ error: 'This RSVP page is not available. Please contact the couple.' }, { status: 404, headers });
        const safe = Object.fromEntries(RSVP_PAGE_COLUMNS.split(',').map(key => [key, wedding[key]]));
        return NextResponse.json({ wedding: safe }, { headers });
    } catch (error) {
        console.error('Standalone RSVP page failed:', error);
        return NextResponse.json({ error: 'Unable to load this RSVP page. Please try again.' }, { status: 503, headers });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limit';
import { escapeLikePattern } from '@/lib/sql-like';
import { resolvePublicWeddingById } from '@/lib/public-wedding-lookup';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const weddingId = sanitizeWeddingId(searchParams.get('weddingId') || '');
    const query = (searchParams.get('q') || '').replace(/[(),]/g, '').trim().slice(0, 200);

    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });
    }

    if (!query || query.length < 2) {
        return NextResponse.json({ guests: [] });
    }

    const rateLimit = createRateLimitMiddleware('RSVP_GUEST_SEARCH');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const { wedding, error: weddingError } = await resolvePublicWeddingById(
            db,
            weddingId,
            'id, rsvp_search_guest_list'
        );

        if (weddingError) throw weddingError;
        if (!wedding) {
            return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        }

        if (wedding.rsvp_search_guest_list === false) {
            return NextResponse.json({ guests: [] });
        }

        const cleanQuery = escapeLikePattern(query);
        const likeFilter = `%${cleanQuery}%`;

        // Search by guest_name, household_name, or plus_one_name
        const safeQuery = cleanQuery.replace(/"/g, '');
        const orFilter = `guest_name.ilike."%${safeQuery}%",household_name.ilike."%${safeQuery}%",plus_one_name.ilike."%${safeQuery}%"`;
        const { data: rows, error: searchError } = await db
            .from('rsvps')
            .select('id, guest_name, guest_email, household_name')
            .eq('wedding_id', weddingId)
            .or(orFilter)
            .limit(10);

        if (searchError) {
            // Fallback for older schemas without household columns
            const fallbackResult = await db
                .from('rsvps')
                .select('id, guest_name, guest_email')
                .eq('wedding_id', weddingId)
                .ilike('guest_name', likeFilter)
                .limit(10);
            if (fallbackResult.error) throw fallbackResult.error;
            const guests = (fallbackResult.data || []).map((row: any) => ({
                id: row.id,
                guestName: row.guest_name,
                householdName: null,
                verificationAvailable: Boolean(row.guest_email),
            }));
            return NextResponse.json({ guests }, { headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
        }

        const guests = (rows || []).map((row: any) => ({
            id: row.id,
            guestName: row.guest_name,
            householdName: row.household_name || null,
            verificationAvailable: Boolean(row.guest_email),
        }));

        return NextResponse.json({ guests }, { headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
    } catch (err) {
        console.error('RSVP guest search error:', err);
        return NextResponse.json({ error: 'Search failed.' }, { status: 500 });
    }
}

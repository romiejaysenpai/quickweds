import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getSeatFinderErrorPayload, getSeatFinderPartySize, isSeatFinderSchemaError } from '@/lib/seat-finder';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

async function buildSeatResponse(db: any, guest: any, source: 'personal_qr' | 'public_lookup') {
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, bride_name, groom_name, wedding_date, seat_finder_enabled, seat_finder_show_map')
        .eq('id', guest.wedding_id)
        .maybeSingle();
    if (weddingError) throw weddingError;
    if (!wedding || wedding.seat_finder_enabled === false) {
        return NextResponse.json({ error: 'Seat finder is not available for this wedding.' }, { status: 404 });
    }

    const { data: assignment, error: assignmentError } = await db
        .from('seating_assignments')
        .select('table_id, seat_number')
        .eq('wedding_id', guest.wedding_id)
        .eq('rsvp_id', guest.id)
        .maybeSingle();
    if (assignmentError) throw assignmentError;

    let tableName = guest.table_assignment || null;
    if (assignment?.table_id) {
        const { data: table, error: tableError } = await db
            .from('seating_tables')
            .select('table_name')
            .eq('id', assignment.table_id)
            .maybeSingle();
        if (tableError) throw tableError;
        tableName = table?.table_name || tableName;
    }

    const partySize = getSeatFinderPartySize(guest);
    const seatNumber = Number(assignment?.seat_number || 0) || null;
    const seatLabel = seatNumber
        ? partySize > 1 ? `Seats ${seatNumber}-${seatNumber + partySize - 1}` : `Seat ${seatNumber}`
        : partySize > 1 ? `Party of ${partySize}` : null;

    return NextResponse.json({
        success: true,
        source,
        wedding: {
            id: wedding.id,
            name: [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || 'Wedding',
            weddingDate: wedding.wedding_date,
            showMap: wedding.seat_finder_show_map !== false,
        },
        guest: {
            id: guest.id,
            name: guest.guest_name,
            partySize,
            guestCode: guest.guest_code,
            checkedInAt: guest.checked_in_at,
        },
        seat: {
            assigned: Boolean(tableName),
            tableName,
            seatNumber,
            seatLabel,
        },
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = String(searchParams.get('token') || '').trim();
    if (!token) return NextResponse.json({ error: 'Seat token is required.' }, { status: 400 });

    const rateLimit = createRateLimitMiddleware('SEAT_LOOKUP');
    const limited = await rateLimit.check(`${getClientIP(req)}:guest-token`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const { data: guest, error } = await db
            .from('rsvps')
            .select('id, wedding_id, guest_name, guest_email, num_guests, table_assignment, plus_one_allowed, plus_one_name, plus_one_rsvp_status, guest_code, checked_in_at')
            .eq('seat_lookup_token', token)
            .maybeSingle();

        if (error) throw error;
        if (!guest) return NextResponse.json({ error: 'Seat link not found.' }, { status: 404 });

        const response = await buildSeatResponse(db, guest, 'personal_qr');
        response.headers.set('Cache-Control', 'no-store');
        for (const [key, value] of Object.entries(limited.headers || {})) response.headers.set(key, value);
        return response;
    } catch (err) {
        const payload = getSeatFinderErrorPayload(err, 'Unable to load seat information.');
        console.error('Unable to load seat information:', payload.details || payload.error);
        return NextResponse.json(payload, { status: isSeatFinderSchemaError(err) ? 400 : 500 });
    }
}

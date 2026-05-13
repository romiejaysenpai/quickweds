import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getSeatFinderErrorPayload, getSeatFinderPartySize, isSeatFinderSchemaError } from '@/lib/seat-finder';

export const dynamic = 'force-dynamic';

function normalize(value: unknown) {
    return String(value || '').trim();
}

async function buildSeatResponse(db: any, guest: any) {
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

    return {
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
    };
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = normalize(body.weddingId);
    const token = normalize(body.token);
    const query = normalize(body.query);

    if (!weddingId || !token || !query) {
        return NextResponse.json({ error: 'Wedding, token, and guest lookup are required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, bride_name, groom_name, wedding_date, public_seat_finder_token, seat_finder_enabled, seat_finder_show_map')
            .eq('id', weddingId)
            .maybeSingle();

        if (weddingError) throw weddingError;
        if (!wedding || wedding.public_seat_finder_token !== token || wedding.seat_finder_enabled === false) {
            return NextResponse.json({ error: 'Seat finder is not available.' }, { status: 404 });
        }

        const selectColumns = 'id, wedding_id, guest_name, guest_email, phone, num_guests, table_assignment, plus_one_allowed, plus_one_name, plus_one_rsvp_status, guest_code, checked_in_at';
        const exactCode = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).ilike('guest_code', query).limit(2);
        if (exactCode.error) throw exactCode.error;

        let matches = exactCode.data || [];
        if (matches.length === 0 && query.includes('@')) {
            const byEmail = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).ilike('guest_email', query).limit(2);
            if (byEmail.error) throw byEmail.error;
            matches = byEmail.data || [];
        }
        if (matches.length === 0) {
            const byPhone = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).eq('phone', query).limit(2);
            if (byPhone.error) throw byPhone.error;
            matches = byPhone.data || [];
        }
        if (matches.length === 0) {
            const byName = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).ilike('guest_name', query).limit(2);
            if (byName.error) throw byName.error;
            matches = byName.data || [];
        }

        if (matches.length !== 1) {
            return NextResponse.json({ error: 'We could not find one exact guest match. Please enter your guest code or ask reception.' }, { status: 404 });
        }

        const seatData = await buildSeatResponse(db, matches[0]);
        return NextResponse.json({
            success: true,
            wedding: {
                id: wedding.id,
                name: [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || 'Wedding',
                weddingDate: wedding.wedding_date,
                showMap: wedding.seat_finder_show_map !== false,
            },
            ...seatData,
        });
    } catch (err) {
        const payload = getSeatFinderErrorPayload(err, 'Unable to find guest seat.');
        console.error('Unable to find guest seat:', payload.details || payload.error);
        return NextResponse.json(payload, { status: isSeatFinderSchemaError(err) ? 400 : 500 });
    }
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { hasPlannerProAccess } from '@/lib/planner-limits';
import {
    getAppBaseUrl,
    getSeatFinderErrorPayload,
    isAttendingGuest,
    isSeatFinderSchemaError,
    makeGuestCode,
    makeSeatLookupToken,
    type SeatFinderRsvp,
} from '@/lib/seat-finder';

export const dynamic = 'force-dynamic';

async function getAuthorizedWedding(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, user_id, bride_name, groom_name, wedding_date, public_seat_finder_token, seat_finder_enabled, is_premium, payment_status')
        .eq('id', weddingId)
        .maybeSingle();

    if (weddingError) throw weddingError;
    if (!wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (wedding.user_id !== user.id && !isKnownAdminEmail(user.email)) {
        return { response: NextResponse.json({ error: 'You do not have permission to manage this seating plan.' }, { status: 403 }) };
    }

    return { db, wedding, user };
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = String(body.weddingId || '');
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getAuthorizedWedding(req, weddingId);
        if (context.response) return context.response;
        const { db, wedding, user } = context;

        const { data: ownerProfile } = await db
            .from('user_app_profiles')
            .select('is_pro, payment_status')
            .eq('user_id', wedding.user_id)
            .maybeSingle();
        const hasPlannerPro = hasPlannerProAccess({
            isAdmin: isKnownAdminEmail(user.email),
            wedding,
            accountProfile: ownerProfile,
        });

        if (!hasPlannerPro) {
            return NextResponse.json({
                error: 'Guest seat links and check-in are part of Planner Pro. Free seating lets you try up to 3 tables before upgrading.',
                code: 'planner_pro_required',
            }, { status: 402 });
        }

        let publicToken = wedding.public_seat_finder_token;
        if (!publicToken) {
            publicToken = makeSeatLookupToken();
            const { error } = await db
                .from('weddings')
                .update({ public_seat_finder_token: publicToken, seat_finder_enabled: true })
                .eq('id', weddingId);
            if (error) throw error;
        } else if (wedding.seat_finder_enabled === false) {
            const { error } = await db
                .from('weddings')
                .update({ seat_finder_enabled: true })
                .eq('id', weddingId);
            if (error) throw error;
        }

        const { data: guests, error: guestsError } = await db
            .from('rsvps')
            .select('id, wedding_id, guest_name, guest_email, rsvp_status, attendance, num_guests, table_assignment, plus_one_allowed, plus_one_name, plus_one_rsvp_status, seat_lookup_token, guest_code, seat_link_last_sent_at, checked_in_at')
            .eq('wedding_id', weddingId);

        if (guestsError) throw guestsError;

        const attendingGuests = ((guests || []) as SeatFinderRsvp[]).filter(isAttendingGuest);
        let generated = 0;

        for (const guest of attendingGuests) {
            const patch: Record<string, string> = {};
            if (!guest.seat_lookup_token) patch.seat_lookup_token = makeSeatLookupToken();
            if (!guest.guest_code) patch.guest_code = makeGuestCode(guest.guest_name);
            if (Object.keys(patch).length > 0) {
                generated += 1;
                const { error } = await db.from('rsvps').update(patch).eq('id', guest.id).eq('wedding_id', weddingId);
                if (error) throw error;
            }
        }

        const assignedGuests = attendingGuests.filter((guest) => Boolean(guest.table_assignment));
        const sentGuests = attendingGuests.filter((guest: any) => Boolean(guest.seat_link_last_sent_at));
        const checkedInGuests = attendingGuests.filter((guest) => Boolean(guest.checked_in_at));
        const appUrl = getAppBaseUrl(req.url);

        return NextResponse.json({
            success: true,
            generated,
            attendingCount: attendingGuests.length,
            assignedCount: assignedGuests.length,
            sentCount: sentGuests.length,
            checkedInCount: checkedInGuests.length,
            publicSeatFinderToken: publicToken,
            publicSeatFinderUrl: `${appUrl}/w/${encodeURIComponent(weddingId)}/seat-finder?token=${encodeURIComponent(publicToken)}`,
        });
    } catch (err) {
        const payload = getSeatFinderErrorPayload(err, 'Unable to generate guest seat links.');
        console.error('Unable to generate guest seat links:', payload.details || payload.error);
        return NextResponse.json(payload, { status: isSeatFinderSchemaError(err) ? 400 : 500 });
    }
}

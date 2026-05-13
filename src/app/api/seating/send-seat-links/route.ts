import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { sendEmail } from '@/lib/email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { hasPlannerProAccess, logPlannerEmailEvent } from '@/lib/planner-limits';
import {
    getAppBaseUrl,
    getSeatFinderErrorPayload,
    getSeatEmailHtml,
    getSeatFinderPartySize,
    isAttendingGuest,
    isSeatFinderSchemaError,
    makeGuestCode,
    makeSeatLookupToken,
    sleep,
    type SeatFinderRsvp,
} from '@/lib/seat-finder';

export const dynamic = 'force-dynamic';

async function getAuthorizedWedding(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, user_id, bride_name, groom_name, public_seat_finder_token, is_premium, payment_status')
        .eq('id', weddingId)
        .maybeSingle();

    if (weddingError) throw weddingError;
    if (!wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (wedding.user_id !== user.id && !isKnownAdminEmail(user.email)) {
        return { response: NextResponse.json({ error: 'You do not have permission to send seat links.' }, { status: 403 }) };
    }

    return { db, wedding, user };
}

function getWeddingName(wedding: any) {
    const names = [wedding?.bride_name, wedding?.groom_name].filter(Boolean).join(' & ');
    return names || 'the wedding';
}

function getSeatLabel(guest: SeatFinderRsvp, seatNumber?: number | null) {
    const partySize = getSeatFinderPartySize(guest);
    if (!seatNumber) return partySize > 1 ? `Party of ${partySize}` : null;
    if (partySize <= 1) return `Seat ${seatNumber}`;
    return `Seats ${seatNumber}-${seatNumber + partySize - 1}`;
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = String(body.weddingId || '');
    const resendAll = body.resendAll === true;
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
                error: 'Seat-link email sending is part of Planner Pro. Free seating lets you try up to 3 tables before upgrading.',
                code: 'planner_pro_required',
            }, { status: 402 });
        }

        const { data: guests, error: guestsError } = await db
            .from('rsvps')
            .select('id, wedding_id, guest_name, guest_email, rsvp_status, attendance, num_guests, table_assignment, plus_one_allowed, plus_one_name, plus_one_rsvp_status, seat_lookup_token, guest_code, seat_link_sent_at, seat_link_last_sent_at, seat_assignment_version')
            .eq('wedding_id', weddingId);
        if (guestsError) throw guestsError;

        const { data: assignments, error: assignmentError } = await db
            .from('seating_assignments')
            .select('rsvp_id, table_id, seat_number')
            .eq('wedding_id', weddingId);
        if (assignmentError) throw assignmentError;

        const { data: tables, error: tableError } = await db
            .from('seating_tables')
            .select('id, table_name')
            .eq('wedding_id', weddingId);
        if (tableError) throw tableError;

        const assignmentMap = new Map<string, { rsvp_id: string; table_id: string; seat_number?: number | null }>((assignments || []).map((assignment: any) => [assignment.rsvp_id, assignment]));
        const tableMap = new Map<string, { id: string; table_name: string }>((tables || []).map((table: any) => [table.id, table]));
        const appUrl = getAppBaseUrl(req.url);
        const weddingName = getWeddingName(wedding);
        const emailErrors: string[] = [];
        let sent = 0;
        let skippedNoEmail = 0;
        let skippedUnassigned = 0;

        const attendingGuests = ((guests || []) as SeatFinderRsvp[]).filter(isAttendingGuest);

        for (const guest of attendingGuests) {
            const assignment = assignmentMap.get(guest.id);
            const tableName = assignment ? tableMap.get(assignment.table_id)?.table_name : guest.table_assignment;
            if (!tableName) {
                skippedUnassigned += 1;
                continue;
            }
            if (!guest.guest_email) {
                skippedNoEmail += 1;
                continue;
            }
            if (!resendAll && guest.seat_link_last_sent_at) continue;

            let seatToken = guest.seat_lookup_token;
            let guestCode = guest.guest_code;
            const patch: Record<string, string> = {};
            if (!seatToken) {
                seatToken = makeSeatLookupToken();
                patch.seat_lookup_token = seatToken;
            }
            if (!guestCode) {
                guestCode = makeGuestCode(guest.guest_name);
                patch.guest_code = guestCode;
            }
            if (Object.keys(patch).length > 0) {
                const { error } = await db.from('rsvps').update(patch).eq('id', guest.id).eq('wedding_id', weddingId);
                if (error) throw error;
            }

            const seatUrl = `${appUrl}/seat/${encodeURIComponent(seatToken)}`;
            const result = await sendEmail({
                to: guest.guest_email,
                subject: `Your seat for ${weddingName}`,
                html: getSeatEmailHtml({
                    guestName: guest.guest_name,
                    weddingName,
                    tableName,
                    seatLabel: getSeatLabel(guest, assignment?.seat_number),
                    guestCode,
                    seatUrl,
                }),
            });

            if (result.success) {
                sent += 1;
                const now = new Date().toISOString();
                const { error } = await db
                    .from('rsvps')
                    .update({
                        seat_link_sent_at: guest.seat_link_sent_at || now,
                        seat_link_last_sent_at: now,
                        seat_assignment_version: Number((guest as any).seat_assignment_version || 0) + 1,
                    })
                    .eq('id', guest.id)
                    .eq('wedding_id', weddingId);
                if (error) throw error;
            } else {
                emailErrors.push(`${guest.guest_email}: ${result.error || 'Email failed'}`);
            }

            await sleep(275);
        }

        await logPlannerEmailEvent(db, {
            weddingId,
            eventType: 'seat_link',
            recipientCount: sent + emailErrors.length,
            successCount: sent,
            userId: user.id,
        });

        return NextResponse.json({
            success: true,
            sent,
            skippedNoEmail,
            skippedUnassigned,
            emailErrors,
            emailErrorCount: emailErrors.length,
        });
    } catch (err) {
        const payload = getSeatFinderErrorPayload(err, 'Unable to send seat links.');
        console.error('Unable to send seat links:', payload.details || payload.error);
        return NextResponse.json(payload, { status: isSeatFinderSchemaError(err) ? 400 : 500 });
    }
}

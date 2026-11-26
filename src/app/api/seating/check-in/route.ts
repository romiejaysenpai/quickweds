import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getSeatFinderErrorPayload, getSeatFinderPartySize, isSeatFinderSchemaError } from '@/lib/seat-finder';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limit';
import { getWeddingAccess } from '@/lib/wedding-access';
import { acquireQrCheckInLock } from '@/lib/qr-check-in-lock';
import { invalidateDashboardCounters } from '@/lib/dashboard-counters';
import { escapeLikePattern } from '@/lib/sql-like';

export const dynamic = 'force-dynamic';

const ALLOWED_CHECKIN_SOURCES = new Set(['personal_qr', 'public_lookup', 'staff_search']);

async function getAuthorizedWedding(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, weddingId, {
        select: 'id, user_id, bride_name, groom_name',
        collaboratorRoles: ['partner', 'coordinator'],
    });

    if (!access.wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (!access.canManage) {
        return { response: NextResponse.json({ error: 'You do not have permission to check in guests.' }, { status: 403 }) };
    }

    return { db, wedding: access.wedding, user };
}

function normalize(value: unknown) {
    return String(value || '').trim();
}

async function resolveGuest(db: any, weddingId: string, body: Record<string, any>) {
    const selectColumns = 'id, wedding_id, guest_name, guest_email, phone, num_guests, table_assignment, plus_one_allowed, plus_one_name, plus_one_rsvp_status, seat_lookup_token, guest_code, checked_in_at, rsvp_status, attendance';
    const rsvpId = normalize(body.rsvpId);
    const lookup = normalize(body.lookup);

    if (rsvpId) {
        const result = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).eq('id', rsvpId).maybeSingle();
        if (result.error) throw result.error;
        return result.data;
    }

    if (!lookup) return null;

    const tokenFromUrl = lookup.includes('/seat/')
        ? lookup.split('/seat/').pop()?.split(/[?#]/)[0]
        : lookup;

    const byToken = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).eq('seat_lookup_token', tokenFromUrl).maybeSingle();
    if (byToken.error) throw byToken.error;
    if (byToken.data) return byToken.data;

    const literalLookup = escapeLikePattern(lookup);
    const byCode = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).ilike('guest_code', literalLookup).maybeSingle();
    if (byCode.error) throw byCode.error;
    if (byCode.data) return byCode.data;

    const byName = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).ilike('guest_name', literalLookup).limit(2);
    if (byName.error) throw byName.error;
    if (byName.data && byName.data.length > 1) {
        const err = new Error('Multiple guests share this name. Please scan their QR code or enter their guest code.');
        err.name = 'AmbiguousGuestError';
        throw err;
    }
    return byName.data?.[0] || null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const weddingId = sanitizeWeddingId(normalize(searchParams.get('weddingId')));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    const rateLimit = createRateLimitMiddleware('SEAT_LOOKUP');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}:check-in-list`);
    if (limited.limited) return limited.response;

    try {
        const context = await getAuthorizedWedding(req, weddingId);
        if (context.response) return context.response;
        const { db, wedding } = context;

        const { data: guests, error } = await db
            .from('rsvps')
            .select('id, guest_name, guest_email, num_guests, table_assignment, guest_code, checked_in_at, rsvp_status, attendance, plus_one_allowed, plus_one_name, plus_one_rsvp_status')
            .eq('wedding_id', weddingId)
            .order('guest_name', { ascending: true })
            .limit(2000);
        if (error) throw error;

        const attendingGuests = (guests || []).filter((g: any) => g.rsvp_status !== 'declined' && g.attendance !== 'No');

        return NextResponse.json({
            success: true,
            wedding: { id: wedding.id, name: [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || 'Wedding' },
            guests: attendingGuests.map((guest: any) => ({
                ...guest,
                partySize: getSeatFinderPartySize(guest),
            })),
        }, { headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
    } catch (err) {
        const payload = getSeatFinderErrorPayload(err, 'Unable to load check-in list.');
        console.error('Unable to load check-in list:', payload.details || payload.error);
        return NextResponse.json(payload, { status: isSeatFinderSchemaError(err) ? 400 : 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(normalize(body.weddingId));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getAuthorizedWedding(req, weddingId);
        if (context.response) return context.response;
        const { db, user } = context;

        // Key by authenticated staff user + wedding with a realistic wedding-day reception limit (500/hr).
        const rateLimit = createRateLimitMiddleware('SEAT_CHECKIN');
        const limited = await rateLimit.check(`${user.id}:${weddingId}:check-in`);
        if (limited.limited) return limited.response;

        const { data: weddingDaySettings } = await db
            .from('wedding_day_settings')
            .select('check_in_enabled')
            .eq('wedding_id', weddingId)
            .maybeSingle();

        if (weddingDaySettings?.check_in_enabled === false) {
            return NextResponse.json({ error: 'Guest check-in is currently paused by the couple.' }, { status: 403 });
        }

        let guest;
        try {
            guest = await resolveGuest(db, weddingId, body);
        } catch (err) {
            if (err instanceof Error && err.name === 'AmbiguousGuestError') {
                return NextResponse.json({ error: err.message, state: 'ambiguous_guest' }, { status: 409 });
            }
            throw err;
        }
        if (!guest) return NextResponse.json({ error: 'Guest not found.', state: 'invalid_guest' }, { status: 404 });

        const isDeclined = guest.rsvp_status === 'declined' || guest.attendance === 'No';
        if (body.undo !== true && isDeclined) {
            return NextResponse.json({
                error: `${guest.guest_name} is marked as declined and cannot be checked in.`,
                state: 'guest_declined',
            }, { status: 409, headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
        }

        if (body.undo !== true && guest.checked_in_at) {
            return NextResponse.json({
                success: true,
                state: 'already_checked_in',
                guest,
            }, { headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
        }

        if (body.undo !== true) {
            const lockAcquired = await acquireQrCheckInLock(weddingId, guest.id);
            if (lockAcquired === false) {
                return NextResponse.json({
                    error: 'This QR was just scanned. Please wait a moment.',
                    state: 'duplicate_scan_blocked',
                }, { status: 409, headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
            }
        }

        const checkedInAt = body.undo === true ? null : new Date().toISOString();
        let updateQuery = db
            .from('rsvps')
            .update({
                checked_in_at: checkedInAt,
                checked_in_by: checkedInAt ? user.id : null,
                check_in_notes: body.notes ? String(body.notes).slice(0, 500) : null,
            })
            .eq('id', guest.id)
            .eq('wedding_id', weddingId);

        // Conditional atomic guard so concurrent scans never double-check-in
        if (checkedInAt) {
            updateQuery = updateQuery.is('checked_in_at', null);
        } else {
            updateQuery = updateQuery.not('checked_in_at', 'is', null);
        }

        const { data: updated, error: updateError } = await updateQuery
            .select('id, guest_name, table_assignment, guest_code, checked_in_at')
            .maybeSingle();

        if (updateError) throw updateError;
        if (!updated) {
            return NextResponse.json({
                success: true,
                state: checkedInAt ? 'already_checked_in' : 'check_in_undone',
                guest,
            }, { headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
        }

        if (checkedInAt) {
            const rawSource = normalize(body.source);
            const safeSource = ALLOWED_CHECKIN_SOURCES.has(rawSource) ? rawSource : 'staff_search';
            const { error: logError } = await db.from('guest_check_ins').insert({
                wedding_id: weddingId,
                rsvp_id: guest.id,
                checked_in_by: user.id,
                source: safeSource,
                notes: body.notes ? String(body.notes).slice(0, 500) : null,
            });
            if (logError) {
                console.error('Failed to log guest check-in audit row:', logError.message);
            }
        }
        await invalidateDashboardCounters(weddingId);

        return NextResponse.json({
            success: true,
            state: checkedInAt ? 'checked_in_success' : 'check_in_undone',
            guest: updated,
        }, { headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
    } catch (err) {
        const payload = getSeatFinderErrorPayload(err, 'Unable to update guest check-in.');
        console.error('Unable to update guest check-in:', payload.details || payload.error);
        return NextResponse.json(payload, { status: isSeatFinderSchemaError(err) ? 400 : 500 });
    }
}

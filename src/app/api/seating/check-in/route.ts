import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getSeatFinderErrorPayload, getSeatFinderPartySize, isSeatFinderSchemaError } from '@/lib/seat-finder';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limiter';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

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
    const selectColumns = 'id, wedding_id, guest_name, guest_email, phone, num_guests, table_assignment, plus_one_allowed, plus_one_name, plus_one_rsvp_status, seat_lookup_token, guest_code, checked_in_at';
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

    const byCode = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).ilike('guest_code', lookup).maybeSingle();
    if (byCode.error) throw byCode.error;
    if (byCode.data) return byCode.data;

    const byName = await db.from('rsvps').select(selectColumns).eq('wedding_id', weddingId).ilike('guest_name', lookup).maybeSingle();
    if (byName.error) throw byName.error;
    return byName.data;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const weddingId = sanitizeWeddingId(normalize(searchParams.get('weddingId')));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    const rateLimit = createRateLimitMiddleware('SEAT_LOOKUP');
    const limited = rateLimit.check(`${getClientIP(req)}:${weddingId}:check-in-list`);
    if (limited.limited) return limited.response;

    try {
        const context = await getAuthorizedWedding(req, weddingId);
        if (context.response) return context.response;
        const { db, wedding } = context;

        const { data: guests, error } = await db
            .from('rsvps')
            .select('id, guest_name, guest_email, num_guests, table_assignment, guest_code, checked_in_at')
            .eq('wedding_id', weddingId)
            .order('guest_name', { ascending: true });
        if (error) throw error;

        return NextResponse.json({
            success: true,
            wedding: { id: wedding.id, name: [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || 'Wedding' },
            guests: (guests || []).map((guest: any) => ({
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

    const rateLimit = createRateLimitMiddleware('SEAT_MUTATION');
    const limited = rateLimit.check(`${getClientIP(req)}:${weddingId}:check-in`);
    if (limited.limited) return limited.response;

    try {
        const context = await getAuthorizedWedding(req, weddingId);
        if (context.response) return context.response;
        const { db, user } = context;
        const guest = await resolveGuest(db, weddingId, body);
        if (!guest) return NextResponse.json({ error: 'Guest not found.' }, { status: 404 });

        const checkedInAt = body.undo === true ? null : new Date().toISOString();
        const { data: updated, error: updateError } = await db
            .from('rsvps')
            .update({
                checked_in_at: checkedInAt,
                checked_in_by: checkedInAt ? user.id : null,
                check_in_notes: body.notes ? String(body.notes).slice(0, 500) : null,
            })
            .eq('id', guest.id)
            .eq('wedding_id', weddingId)
            .select('id, guest_name, table_assignment, guest_code, checked_in_at')
            .single();
        if (updateError) throw updateError;

        if (checkedInAt) {
            await db.from('guest_check_ins').insert({
                wedding_id: weddingId,
                rsvp_id: guest.id,
                checked_in_by: user.id,
                source: body.source || 'staff_search',
                notes: body.notes ? String(body.notes).slice(0, 500) : null,
            });
        }

        return NextResponse.json({ success: true, guest: updated }, { headers: { ...limited.headers, 'Cache-Control': 'no-store' } });
    } catch (err) {
        const payload = getSeatFinderErrorPayload(err, 'Unable to update guest check-in.');
        console.error('Unable to update guest check-in:', payload.details || payload.error);
        return NextResponse.json(payload, { status: isSeatFinderSchemaError(err) ? 400 : 500 });
    }
}

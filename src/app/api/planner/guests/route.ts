import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { FREE_PLAN_LIMITS, hasPlannerProAccess } from '@/lib/planner-limits';
import { sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limiter';
import { getWeddingAccess } from '@/lib/wedding-access';
import { invalidateDashboardCounters } from '@/lib/dashboard-counters';

export const dynamic = 'force-dynamic';

const RSVP_SELECT = '*';
const ALLOWED_UPDATE_FIELDS = new Set([
    'guest_name',
    'guest_email',
    'rsvp_status',
    'attendance',
    'num_guests',
    'guest_group',
    'table_assignment',
    'invitation_sent',
    'invitation_sent_at',
    'plus_one_allowed',
    'plus_one_name',
    'plus_one_email',
    'plus_one_rsvp_status',
    'children_count',
    'meal_preference',
    'dietary_details',
    'plus_one_names',
    'song_request',
    'message',
]);

function nullableText(value: unknown, maxLength = 500) {
    const text = sanitizeInput(String(value || ''), { maxLength, allowNewlines: false });
    return text || null;
}

function nullableEmail(value: unknown) {
    const email = sanitizeEmail(String(value || ''));
    return email || null;
}

function normalizeStatus(value: unknown) {
    const status = String(value || 'pending');
    return ['pending', 'confirmed', 'declined'].includes(status) ? status : 'pending';
}

function statusToAttendance(status: string) {
    if (status === 'confirmed') return 'Yes';
    if (status === 'declined') return 'No';
    return null;
}

function normalizeGuestPayload(weddingId: string, input: Record<string, any>) {
    const rsvpStatus = normalizeStatus(input.rsvp_status);
    const invitationSent = Boolean(input.invitation_sent);
    const plusOneAllowed = Boolean(input.plus_one_allowed);

    return {
        wedding_id: weddingId,
        guest_name: nullableText(input.guest_name, 200),
        guest_email: nullableEmail(input.guest_email),
        rsvp_status: rsvpStatus,
        attendance: input.attendance === 'Yes' || input.attendance === 'No' ? input.attendance : statusToAttendance(rsvpStatus),
        num_guests: Math.min(50, Math.max(1, Number(input.num_guests || 1))),
        guest_group: nullableText(input.guest_group, 80),
        table_assignment: nullableText(input.table_assignment, 160),
        invitation_sent: invitationSent,
        invitation_sent_at: invitationSent ? String(input.invitation_sent_at || new Date().toISOString()) : null,
        plus_one_allowed: plusOneAllowed,
        plus_one_name: nullableText(input.plus_one_name, 200),
        plus_one_email: nullableEmail(input.plus_one_email),
        plus_one_rsvp_status: plusOneAllowed ? nullableText(input.plus_one_rsvp_status, 40) || 'not_invited' : 'not_invited',
        manual_entry: true,
    };
}

function normalizeUpdatePayload(input: Record<string, any>) {
    const payload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
        if (!ALLOWED_UPDATE_FIELDS.has(key)) continue;

        if (key === 'guest_email' || key === 'plus_one_email') payload[key] = nullableEmail(value);
        else if (key === 'guest_name' || key === 'table_assignment' || key === 'plus_one_name') payload[key] = nullableText(value, 200);
        else if (key === 'rsvp_status') {
            const status = normalizeStatus(value);
            payload.rsvp_status = status;
            if (!Object.prototype.hasOwnProperty.call(input, 'attendance')) payload.attendance = statusToAttendance(status);
        } else if (key === 'attendance') {
            payload.attendance = value === 'Yes' || value === 'No' ? value : null;
        } else if (key === 'num_guests' || key === 'children_count') {
            payload[key] = Math.max(key === 'children_count' ? 0 : 1, Number(value || 0));
        } else if (key === 'invitation_sent') {
            payload.invitation_sent = Boolean(value);
            payload.invitation_sent_at = value ? new Date().toISOString() : null;
        } else if (typeof value === 'string') {
            payload[key] = nullableText(value, 1000);
        } else {
            payload[key] = value;
        }
    }

    return payload;
}

async function getContext(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, weddingId, {
        select: 'id, user_id, is_premium, payment_status',
        collaboratorRoles: ['partner', 'coordinator'],
    });

    if (!access.wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (!access.canManage) return { response: NextResponse.json({ error: 'You do not have permission to manage this guest list.' }, { status: 403 }) };

    const { data: accountProfile, error: profileError } = await db
        .from('user_app_profiles')
        .select('is_pro, payment_status')
        .eq('user_id', access.wedding.user_id)
        .maybeSingle();
    if (profileError) throw profileError;

    return {
        db,
        user,
        wedding: access.wedding,
        hasPro: hasPlannerProAccess({
            isAdmin: isKnownAdminEmail(user.email),
            wedding: access.wedding,
            accountProfile,
        }),
    };
}

async function getGuestEmailCount(db: any, weddingId: string) {
    const { count, error } = await db
        .from('rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('wedding_id', weddingId)
        .not('guest_email', 'is', null)
        .neq('guest_email', '');

    if (error) throw error;
    return Number(count || 0);
}

async function enforceGuestEmailLimit(db: any, weddingId: string, hasPro: boolean, incomingEmailCount: number) {
    if (hasPro || incomingEmailCount <= 0) return null;

    const currentCount = await getGuestEmailCount(db, weddingId);
    if (currentCount + incomingEmailCount <= FREE_PLAN_LIMITS.guestEmails) return null;

    return NextResponse.json({
        error: `Free weddings include ${FREE_PLAN_LIMITS.guestEmails} guests with email addresses. Remove email addresses from extra rows or upgrade to Planner Pro.`,
        code: 'guest_email_limit_reached',
        limit: FREE_PLAN_LIMITS.guestEmails,
        used: currentCount,
        requested: incomingEmailCount,
    }, { status: 402 });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    const action = String(body.action || 'create');

    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getContext(req, weddingId);
        if ('response' in context) return context.response;
        const { db, hasPro } = context;

        if (action === 'delete') {
            const id = String(body.id || '');
            if (!id) return NextResponse.json({ error: 'Guest ID is required.' }, { status: 400 });

            const { error } = await db.from('rsvps').delete().eq('id', id).eq('wedding_id', weddingId);
            if (error) throw error;
            await invalidateDashboardCounters(weddingId);
            return NextResponse.json({ success: true, deletedId: id });
        }

        if (action === 'update') {
            const id = String(body.id || '');
            if (!id) return NextResponse.json({ error: 'Guest ID is required.' }, { status: 400 });

            const existing = await db.from('rsvps').select('id, wedding_id, guest_email').eq('id', id).eq('wedding_id', weddingId).maybeSingle();
            if (existing.error) throw existing.error;
            if (!existing.data) return NextResponse.json({ error: 'Guest not found.' }, { status: 404 });

            const payload = normalizeUpdatePayload(body.patch || {});
            const addsEmail = !existing.data.guest_email && Boolean(payload.guest_email);
            const limitResponse = await enforceGuestEmailLimit(db, weddingId, hasPro, addsEmail ? 1 : 0);
            if (limitResponse) return limitResponse;

            const { data, error } = await db.from('rsvps').update(payload).eq('id', id).eq('wedding_id', weddingId).select(RSVP_SELECT).single();
            if (error) throw error;
            await invalidateDashboardCounters(weddingId);
            return NextResponse.json({ guest: data });
        }

        if (action === 'import') {
            const rows = Array.isArray(body.guests) ? body.guests : [];
            if (rows.length === 0) return NextResponse.json({ error: 'No guests were provided.' }, { status: 400 });
            if (rows.length > 500) return NextResponse.json({ error: 'Import is limited to 500 guests per request.' }, { status: 400 });

            const payload: Array<ReturnType<typeof normalizeGuestPayload>> = rows.map((row: Record<string, any>) => normalizeGuestPayload(weddingId, row));
            const incomingEmailCount = payload.filter((row: ReturnType<typeof normalizeGuestPayload>) => Boolean(row.guest_email)).length;
            const limitResponse = await enforceGuestEmailLimit(db, weddingId, hasPro, incomingEmailCount);
            if (limitResponse) return limitResponse;

            const { data, error } = await db.from('rsvps').insert(payload).select(RSVP_SELECT);
            if (error) throw error;
            await invalidateDashboardCounters(weddingId);
            return NextResponse.json({ guests: data || [] });
        }

        const payload = normalizeGuestPayload(weddingId, body.guest || body);
        if (!payload.guest_name) return NextResponse.json({ error: 'Guest name is required.' }, { status: 400 });

        const limitResponse = await enforceGuestEmailLimit(db, weddingId, hasPro, payload.guest_email ? 1 : 0);
        if (limitResponse) return limitResponse;

        const { data, error } = await db.from('rsvps').insert(payload).select(RSVP_SELECT).single();
        if (error) throw error;
        await invalidateDashboardCounters(weddingId);
        return NextResponse.json({ guest: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update guest list.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    return POST(new NextRequest(req.url, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify({ ...body, action: 'update' }),
    }));
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    return POST(new NextRequest(req.url, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify({
            action: 'delete',
            weddingId: searchParams.get('weddingId'),
            id: searchParams.get('id'),
        }),
    }));
}

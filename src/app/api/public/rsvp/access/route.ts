import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limit';
import { createRsvpAccessToken, getRsvpManageUrl, verifyRsvpAccessToken } from '@/lib/rsvp-access';
import { resolvePublicWeddingById } from '@/lib/public-wedding-lookup';
import { createElement } from 'react';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
const accepted = () => NextResponse.json({ message: 'If this invitation has an email address, a secure link will be sent there. Otherwise, please contact the couple.' }, { status: 202, headers });

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    const rsvpId = typeof body.rsvpId === 'string' ? body.rsvpId.slice(0, 100) : '';
    const verifying = body.action === 'verify';
    const ipLimit = await createRateLimitMiddleware(verifying ? 'RSVP_GUEST_SEARCH' : 'RSVP_ACCESS_IP').check(`rsvp-access:${getClientIP(req)}`);
    if (ipLimit.limited) return ipLimit.response;
    if (!weddingId || !rsvpId) return verifying ? NextResponse.json({ error: 'This link is invalid or expired.' }, { status: 403, headers }) : accepted();
    if (!verifying) {
        const guestLimit = await createRateLimitMiddleware('RSVP_ACCESS_GUEST').check(`${weddingId}:${rsvpId}`);
        if (guestLimit.limited) return accepted();
    }
    try {
        const db = getSupabaseAdminClient() as any;
        const { wedding, error: weddingError } = await resolvePublicWeddingById(
            db,
            weddingId,
            'id, template, motif_color, rsvp_events, rsvp_allow_plus_ones, rsvp_allow_children, bride_name, groom_name'
        );
        if (weddingError) throw weddingError;
        if (!wedding) return verifying ? NextResponse.json({ error: 'This link is invalid or expired.' }, { status: 403, headers }) : accepted();
        const { data: guest, error } = await db.from('rsvps').select('*').eq('id', rsvpId).eq('wedding_id', weddingId).maybeSingle();
        if (error) throw error;
        if (verifying) {
            if (!guest || !verifyRsvpAccessToken(body.token, weddingId, rsvpId, guest.guest_email || '')) return NextResponse.json({ error: 'This link is invalid or expired. Request a new link from the invitation.' }, { status: 403, headers });
            return NextResponse.json({ wedding, guest: {
                id: guest.id, guestName: guest.guest_name, guestEmail: guest.guest_email,
                attendance: guest.attendance, numGuests: guest.num_guests,
                invitedGuestCount: guest.invited_guest_count ?? Math.max(1, guest.num_guests || 1, guest.plus_one_allowed ? 2 : 1),
                plusOneAllowed: guest.plus_one_allowed, plusOneName: guest.plus_one_names || guest.plus_one_name || '',
                childrenCount: guest.children_count || 0, mealPreference: guest.meal_preference || '',
                dietaryDetails: guest.dietary_details || '', message: guest.message || '', songRequest: guest.song_request || '',
                householdName: guest.household_name || '', householdMembers: guest.household_members || [], eventResponses: guest.event_responses || [],
            } }, { headers });
        }
        if (guest?.guest_email) {
            const token = createRsvpAccessToken(weddingId, rsvpId, guest.guest_email);
            const url = getRsvpManageUrl(weddingId, rsvpId, token);
            const result = await sendEmail({ to: guest.guest_email, tracking: { key: `rsvp-access:${weddingId}:${rsvpId}:${Math.floor(Date.now() / 600000)}` }, subject: 'Your secure RSVP link', react: createElement('div', null, createElement('p', null, 'Use this private link to view or update your RSVP. It expires in 30 minutes. Please do not share it.'), createElement('a', { href: url }, 'Manage my RSVP')) });
            if (!result.success) console.error('RSVP access email delivery failed');
        }
        return accepted();
    } catch {
        console.error('RSVP access request failed');
        return verifying ? NextResponse.json({ error: 'Unable to verify this link. Please try again.' }, { status: 503, headers }) : accepted();
    }
}

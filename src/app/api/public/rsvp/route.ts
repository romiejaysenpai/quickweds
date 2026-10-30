import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { rsvpSubmissionSchema } from '@/lib/validations';
import { createRateLimitMiddleware, getClientIP, sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limit';
import { sendRsvpNotifications } from '@/lib/rsvp-notifications';
import { resolvePublicWeddingById } from '@/lib/public-wedding-lookup';
import { invalidateDashboardCounters } from '@/lib/dashboard-counters';
import { makeGuestCode, makeSeatLookupToken } from '@/lib/seat-finder';
import { isRsvpDeadlineExpired } from '@/lib/rsvp-deadline';
import { createRsvpAccessToken, getRsvpManageUrl, verifyRsvpAccessToken } from '@/lib/rsvp-access';
import { escapeLikePattern } from '@/lib/sql-like';

function getPrimaryPlusOneName(raw: string) {
    const [firstName] = raw
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
    return firstName || '';
}

export async function POST(req: NextRequest) {
    const rawBody = await req.json().catch(() => ({}));
    const normalizedBody = rawBody && typeof rawBody === 'object' && (rawBody as Record<string, unknown>).attendance === 'No'
        ? {
            ...(rawBody as Record<string, unknown>),
            numGuests: Math.max(1, Number((rawBody as Record<string, unknown>).numGuests || 1)),
            childrenCount: 0,
        }
        : rawBody;
    const parsed = rsvpSubmissionSchema.safeParse(normalizedBody);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(', ') }, { status: 400 });
    }

    const weddingId = sanitizeWeddingId(parsed.data.weddingId);
    if (!weddingId) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

    const rateLimit = createRateLimitMiddleware('RSVP_SUBMIT');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}`);
    if (limited.limited) return limited.response;

    const guestName = sanitizeInput(parsed.data.guestName, { maxLength: 200 });
    const guestEmail = sanitizeEmail(parsed.data.guestEmail || '');
    const mealPreference = sanitizeInput(parsed.data.mealPreference || '', { maxLength: 200 });
    const dietaryDetails = sanitizeInput(parsed.data.dietaryDetails || '', { maxLength: 1000 });
    const songRequest = sanitizeInput(parsed.data.songRequest || '', { maxLength: 500 });
    const plusOneNames = sanitizeInput(parsed.data.plusOneNames || '', { maxLength: 1000 });
    const message = sanitizeInput(parsed.data.message || '', { maxLength: 2000, allowNewlines: true });
    const householdName = sanitizeInput(parsed.data.householdName || '', { maxLength: 200 });
    const householdMembers = parsed.data.householdMembers
        .map((name) => sanitizeInput(name, { maxLength: 200 }))
        .filter(Boolean);

    if (!guestName) {
        return NextResponse.json({ error: 'Guest name is required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const weddingSelect = 'id, user_id, public_slug, bride_name, groom_name, wedding_date, wedding_time, venue_name, venue_address, maps_link, couple_email, contact_person, custom_domain, notify_on_rsvp, rsvp_deadline, rsvp_events, rsvp_allow_plus_ones, rsvp_allow_children, hero_image, couple_photo, gallery_images, invitation_image, reception_venue_photos';
        const { wedding, error: weddingError } = await resolvePublicWeddingById(db, weddingId, weddingSelect);

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        if (isRsvpDeadlineExpired(wedding.rsvp_deadline)) {
            return NextResponse.json({
                error: 'RSVPs for this wedding are closed. Please contact the couple directly.',
                code: 'rsvp_closed',
            }, { status: 403 });
        }

        const existingResult = parsed.data.rsvpId
            ? await db
                .from('rsvps')
                .select('*')
                .eq('id', parsed.data.rsvpId)
                .eq('wedding_id', weddingId)
                .limit(1)
            : await db
                .from('rsvps')
                .select('*')
                .eq('wedding_id', weddingId)
                .ilike('guest_name', escapeLikePattern(guestName))
                .limit(1);

        const { data: existing, error: duplicateError } = existingResult;

        if (duplicateError) throw duplicateError;
        const existingRsvp = existing?.[0] || null;
        if (parsed.data.rsvpId && !existingRsvp) return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
        const canUpdateExisting = Boolean(existingRsvp && parsed.data.accessToken && verifyRsvpAccessToken(parsed.data.accessToken, weddingId, existingRsvp.id, existingRsvp.guest_email || ''));
        if (existingRsvp && !canUpdateExisting) {
            return NextResponse.json({ error: 'Please request a secure link from the guest list to update this invitation. If no email is on file, contact the couple.', code: 'verification_required' }, { status: 403 });
        }
        const resolvedGuestEmail = existingRsvp ? existingRsvp.guest_email || '' : guestEmail;
        const resolvedGuestName = existingRsvp ? existingRsvp.guest_name : guestName;
        const invitationCap = existingRsvp ? Math.max(1, Number(existingRsvp.invited_guest_count ?? Math.max(existingRsvp.num_guests || 1, existingRsvp.plus_one_allowed ? 2 : 1))) : 50;
        const isAttending = parsed.data.attendance === 'Yes';
        if (isAttending && ((wedding.rsvp_allow_plus_ones === false && (parsed.data.numGuests > 1 || plusOneNames || householdMembers.length > 0)) || (existingRsvp && (parsed.data.numGuests > invitationCap || (!existingRsvp.plus_one_allowed && (parsed.data.numGuests > 1 || plusOneNames)))))) {
            return NextResponse.json({ error: 'Your party exceeds this invitation. Please contact the couple.' }, { status: 400 });
        }
        if (isAttending && wedding.rsvp_allow_children === false && parsed.data.childrenCount > 0) return NextResponse.json({ error: 'Children are not included for this wedding.' }, { status: 400 });
        if (isAttending && parsed.data.childrenCount > parsed.data.numGuests) return NextResponse.json({ error: 'Children cannot exceed the party size.' }, { status: 400 });
        if (isAttending && householdMembers.length > Math.max(0, parsed.data.numGuests - 1)) return NextResponse.json({ error: 'Party member names exceed the party size.' }, { status: 400 });

        const isDeclined = parsed.data.attendance === 'No';
        const resolvedNumGuests = isDeclined ? 0 : (parsed.data.numGuests || 1);
        const resolvedChildrenCount = isDeclined ? 0 : (parsed.data.childrenCount || 0);

        createRsvpAccessToken(weddingId, existingRsvp?.id || 'new', resolvedGuestEmail);
        const insertData: Record<string, unknown> = {
            wedding_id: weddingId,
            ...(!existingRsvp ? {
                guest_name: resolvedGuestName,
                guest_email: resolvedGuestEmail || null,
                plus_one_allowed: !isDeclined && resolvedNumGuests > 1,
                invited_guest_count: Math.min(50, Math.max(1, resolvedNumGuests, (!isDeclined && resolvedNumGuests > 1) ? 2 : 1)),
            } : {}),
            attendance: parsed.data.attendance,
            num_guests: resolvedNumGuests,
            rsvp_status: parsed.data.attendance === 'Yes' ? 'confirmed' : 'declined',
        };

        if (canUpdateExisting) {
            insertData.manual_entry = false;
        }

        if (parsed.data.attendance === 'Yes') {
            insertData.seat_lookup_token = existingRsvp?.seat_lookup_token || makeSeatLookupToken();
            insertData.guest_code = existingRsvp?.guest_code || makeGuestCode(resolvedGuestName);
        }

        // Explicit values clear stale details when guests decline or remove an answer.
        insertData.meal_preference = !isDeclined && mealPreference !== 'No Preference' ? mealPreference || null : null;
        insertData.dietary_details = !isDeclined && mealPreference === 'Other (see message)' ? dietaryDetails || null : null;
        insertData.message = message || null;
        insertData.plus_one_names = !isDeclined && resolvedNumGuests > 1 ? plusOneNames || null : null;
        insertData.plus_one_name = !isDeclined && resolvedNumGuests > 1 ? getPrimaryPlusOneName(plusOneNames) || null : null;
        insertData.plus_one_rsvp_status = !isDeclined && resolvedNumGuests > 1 ? 'confirmed' : 'not_invited';
        insertData.song_request = !isDeclined ? songRequest || null : null;
        insertData.children_count = resolvedChildrenCount;
        insertData.household_name = householdName || null;
        insertData.household_members = !isDeclined ? householdMembers : [];
        let configuredEvents = wedding.rsvp_events;
        if (typeof configuredEvents === 'string') { try { configuredEvents = JSON.parse(configuredEvents); } catch { configuredEvents = []; } }
        if (!Array.isArray(configuredEvents)) configuredEvents = [];
        const allowedEventIds = new Set<string>(configuredEvents.map((event: { id?: unknown }) => String(event?.id || '')).filter(Boolean));
        const responseIds = parsed.data.eventResponses.map((response) => response.eventId);
        if (new Set(responseIds).size !== responseIds.length || responseIds.some((id) => !allowedEventIds.has(id))) return NextResponse.json({ error: 'Event responses contain an unknown or repeated event.' }, { status: 400 });
        insertData.event_responses = [...allowedEventIds].map((eventId) => ({ eventId, attendance: isDeclined ? 'No' : parsed.data.eventResponses.find((response) => response.eventId === eventId)?.attendance || 'No' }));

        const persistRsvp = async (payload: Record<string, unknown>) => {
            if (canUpdateExisting && existingRsvp?.id) {
                let update = db.from('rsvps').update(payload).eq('id', existingRsvp.id).eq('wedding_id', weddingId);
                // Reject stale capabilities and invitation limits; never restore snapshot identity.
                for (const column of ['guest_email', 'guest_name', 'invited_guest_count', 'num_guests', 'plus_one_allowed', 'seat_lookup_token', 'guest_code', 'updated_at']) {
                    if (existingRsvp[column] === undefined) continue;
                    update = existingRsvp[column] === null ? update.is(column, null) : update.eq(column, existingRsvp[column]);
                }
                return update.select('id').maybeSingle();
            }
            return db
                .from('rsvps')
                .insert(payload)
                .select('id')
                .single();
        };

        const OPTIONAL_RSVP_COLUMNS = [
            'household_name',
            'household_members',
            'event_responses',
            'manual_entry',
            'invited_guest_count',
            'seat_lookup_token',
            'guest_code',
            'plus_one_names',
            'plus_one_name',
            'plus_one_rsvp_status',
            'children_count',
            'song_request',
            'dietary_details',
            'meal_preference',
        ] as const;

        const activePayload = { ...insertData };
        let { data: rsvp, error: insertError } = await persistRsvp(activePayload);

        while (insertError) {
            const errorText = String(insertError.message || '').toLowerCase();
            const missing = OPTIONAL_RSVP_COLUMNS.filter((col) => col in activePayload && errorText.includes(col.toLowerCase()));
            if (missing.length === 0) break;
            for (const col of missing) {
                delete activePayload[col];
            }
            const retry = await persistRsvp(activePayload);
            rsvp = retry.data;
            insertError = retry.error;
        }

        if (insertError) throw insertError;
        if (!rsvp) return NextResponse.json({ error: 'This invitation changed while you were responding. Reload and request a new secure link.', code: 'invitation_changed' }, { status: 409 });
        await invalidateDashboardCounters(weddingId);

        // A household name is descriptive data, never authority to mutate another invitation.
        const accessToken = createRsvpAccessToken(weddingId, rsvp.id, resolvedGuestEmail);
        const manageRsvpUrl = getRsvpManageUrl(weddingId, rsvp.id, accessToken);

        const notifications = await sendRsvpNotifications(db, {
            weddingId,
            wedding,
            guestName: resolvedGuestName,
            guestEmail: resolvedGuestEmail,
            manageRsvpUrl,
            attendance: parsed.data.attendance,
            numGuests: resolvedNumGuests,
            message,
            dietaryDetails: typeof insertData.dietary_details === 'string' ? insertData.dietary_details : '',
            songRequest: typeof insertData.song_request === 'string' ? insertData.song_request : '',
            plusOneNames: isDeclined ? '' : plusOneNames,
            childrenCount: resolvedChildrenCount,
            guestCode: typeof insertData.guest_code === 'string' ? insertData.guest_code : '',
            seatLookupToken: typeof insertData.seat_lookup_token === 'string' ? insertData.seat_lookup_token : '',
        });

        return NextResponse.json(
            { success: true, rsvpId: rsvp.id, accessToken, manageRsvpUrl, notifications },
            { headers: { ...limited.headers, 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to submit RSVP.';
        console.error('Public RSVP submit failed:', message);
        return NextResponse.json({ error: 'Unable to submit RSVP.' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { rsvpSubmissionSchema } from '@/lib/validations';
import { createRateLimitMiddleware, getClientIP, sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limit';
import { sendRsvpNotifications } from '@/lib/rsvp-notifications';
import { isMissingPublicSlugColumnError } from '@/lib/wedding-slugs';
import { invalidateDashboardCounters } from '@/lib/dashboard-counters';
import { makeGuestCode, makeSeatLookupToken } from '@/lib/seat-finder';
import { isRsvpDeadlineExpired } from '@/lib/rsvp-deadline';
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
        const weddingSelect = 'id, user_id, public_slug, bride_name, groom_name, wedding_date, wedding_time, venue_name, venue_address, maps_link, couple_email, contact_person, custom_domain, notify_on_rsvp, rsvp_deadline, rsvp_events, hero_image, couple_photo, gallery_images, invitation_image, reception_venue_photos';
        let weddingResult = await db
            .from('weddings')
            .select(weddingSelect)
            .eq('id', weddingId)
            .is('deleted_at', null)
            .maybeSingle();

        if (weddingResult.error && isMissingPublicSlugColumnError(weddingResult.error)) {
            weddingResult = await db
                .from('weddings')
                .select(weddingSelect.replace('public_slug, ', ''))
                .eq('id', weddingId)
                .is('deleted_at', null)
                .maybeSingle();
        }

        // Older databases may not have the rsvp_events column yet.
        if (weddingResult.error && String(weddingResult.error.message || '').includes('rsvp_events')) {
            weddingResult = await db
                .from('weddings')
                .select(weddingSelect.replace('public_slug, ', '').replace('rsvp_events, ', ''))
                .eq('id', weddingId)
                .is('deleted_at', null)
                .maybeSingle();
        }

        const { data: wedding, error: weddingError } = weddingResult;

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        if (isRsvpDeadlineExpired(wedding.rsvp_deadline)) {
            return NextResponse.json({
                error: 'RSVPs for this wedding are closed. Please contact the couple directly.',
                code: 'rsvp_closed',
            }, { status: 403 });
        }

        let existingResult = parsed.data.rsvpId
            ? await db
                .from('rsvps')
                .select('id, rsvp_status, attendance, manual_entry, seat_lookup_token, guest_code, table_assignment')
                .eq('id', parsed.data.rsvpId)
                .eq('wedding_id', weddingId)
                .limit(1)
            : await db
                .from('rsvps')
                .select('id, rsvp_status, attendance, manual_entry, seat_lookup_token, guest_code, table_assignment')
                .eq('wedding_id', weddingId)
                .ilike('guest_name', escapeLikePattern(guestName))
                .limit(1);

        if (existingResult.error && ['manual_entry', 'seat_lookup_token', 'guest_code', 'table_assignment'].some((col) => String(existingResult.error.message || '').includes(col))) {
            existingResult = parsed.data.rsvpId
                ? await db
                    .from('rsvps')
                    .select('id, rsvp_status, attendance')
                    .eq('id', parsed.data.rsvpId)
                    .eq('wedding_id', weddingId)
                    .limit(1)
                : await db
                    .from('rsvps')
                    .select('id, rsvp_status, attendance')
                    .eq('wedding_id', weddingId)
                    .ilike('guest_name', escapeLikePattern(guestName))
                    .limit(1);
        }

        const { data: existing, error: duplicateError } = existingResult;

        if (duplicateError) throw duplicateError;
        const existingRsvp = existing?.[0] || null;
        const canUpdateExisting = Boolean(
            existingRsvp && (
                Boolean(parsed.data.rsvpId) ||
                existingRsvp.rsvp_status === 'pending' ||
                existingRsvp.attendance === 'Pending' ||
                existingRsvp.manual_entry === true ||
                Boolean(guestEmail && existingRsvp.guest_email === guestEmail)
            )
        );

        if (existingRsvp && !canUpdateExisting) {
            return NextResponse.json({
                error: "You have already RSVP'd for this wedding. If you need to make changes, please contact the couple directly.",
                code: 'duplicate_rsvp',
            }, { status: 409 });
        }

        const isDeclined = parsed.data.attendance === 'No';
        const resolvedNumGuests = isDeclined ? 0 : (parsed.data.numGuests || 1);
        const resolvedChildrenCount = isDeclined ? 0 : (parsed.data.childrenCount || 0);

        const insertData: Record<string, unknown> = {
            wedding_id: weddingId,
            guest_name: guestName,
            guest_email: guestEmail || null,
            attendance: parsed.data.attendance,
            num_guests: resolvedNumGuests,
            rsvp_status: parsed.data.attendance === 'Yes' ? 'confirmed' : 'declined',
            plus_one_allowed: !isDeclined && (resolvedNumGuests > 1 || Boolean(plusOneNames)),
        };

        if (canUpdateExisting) {
            insertData.manual_entry = false;
        }

        if (parsed.data.attendance === 'Yes') {
            insertData.seat_lookup_token = existingRsvp?.seat_lookup_token || makeSeatLookupToken();
            insertData.guest_code = existingRsvp?.guest_code || makeGuestCode(guestName);
        }

        if (mealPreference && mealPreference !== 'No Preference') insertData.meal_preference = mealPreference;
        if (dietaryDetails) insertData.dietary_details = dietaryDetails;
        if (message) insertData.message = message;
        if (plusOneNames && !isDeclined) {
            insertData.plus_one_names = plusOneNames;
            insertData.plus_one_name = getPrimaryPlusOneName(plusOneNames);
            insertData.plus_one_rsvp_status = parsed.data.attendance === 'Yes' ? 'confirmed' : 'declined';
        }
        if (songRequest) insertData.song_request = songRequest;
        if (isDeclined || resolvedChildrenCount > 0) insertData.children_count = resolvedChildrenCount;
        if (householdName) insertData.household_name = householdName;
        if (householdMembers.length > 0) insertData.household_members = householdMembers;

        const configuredEvents = Array.isArray(wedding.rsvp_events) ? wedding.rsvp_events : [];
        const allowedEventIds = new Set(configuredEvents.map((event: { id?: unknown }) => String(event?.id || '')).filter(Boolean));
        const eventResponses = parsed.data.eventResponses.filter((response) => allowedEventIds.has(response.eventId));
        if (eventResponses.length > 0) insertData.event_responses = eventResponses;

        const persistRsvp = async (payload: Record<string, unknown>) => {
            if (canUpdateExisting && existingRsvp?.id) {
                return db
                    .from('rsvps')
                    .update(payload)
                    .eq('id', existingRsvp.id)
                    .eq('wedding_id', weddingId)
                    .select('id')
                    .single();
            }
            return db
                .from('rsvps')
                .insert(payload)
                .select('id')
                .single();
        };

        let { data: rsvp, error: insertError } = await persistRsvp(insertData);

        if (insertError && ['household_name', 'household_members', 'event_responses', 'manual_entry'].some((column) => String(insertError.message || '').includes(column))) {
            const compatibleInsert = { ...insertData };
            delete compatibleInsert.household_name;
            delete compatibleInsert.household_members;
            delete compatibleInsert.event_responses;
            delete compatibleInsert.manual_entry;
            const fallbackInsert = await persistRsvp(compatibleInsert);
            rsvp = fallbackInsert.data;
            insertError = fallbackInsert.error;
        }

        if (insertError) throw insertError;
        await invalidateDashboardCounters(weddingId);

        // Sync household and party members so records are updated by name and couple can manage their table groupings
        if (householdMembers.length > 0) {
            for (const memberName of householdMembers) {
                const cleanMember = memberName.trim();
                if (!cleanMember || cleanMember.toLowerCase() === guestName.toLowerCase()) continue;
                try {
                    const existingMember = await db
                        .from('rsvps')
                        .select('id, table_assignment')
                        .eq('wedding_id', weddingId)
                        .ilike('guest_name', escapeLikePattern(cleanMember))
                        .limit(1);

                    const memberRow = existingMember?.data?.[0];
                    if (memberRow) {
                        await db
                            .from('rsvps')
                            .update({
                                attendance: parsed.data.attendance,
                                rsvp_status: parsed.data.attendance === 'Yes' ? 'confirmed' : 'declined',
                                household_name: householdName || null,
                            })
                            .eq('id', memberRow.id)
                            .eq('wedding_id', weddingId);
                    } else if (parsed.data.attendance === 'Yes') {
                        await db
                            .from('rsvps')
                            .insert({
                                wedding_id: weddingId,
                                guest_name: cleanMember,
                                household_name: householdName || null,
                                attendance: 'Yes',
                                rsvp_status: 'confirmed',
                                num_guests: 1,
                                table_assignment: existingRsvp?.table_assignment || null,
                                manual_entry: true,
                            });
                    }
                } catch (memberErr) {
                    console.warn('Sync party member failed:', cleanMember, memberErr);
                }
            }
        }

        const notifications = await sendRsvpNotifications(db, {
            weddingId,
            wedding,
            guestName,
            guestEmail,
            attendance: parsed.data.attendance,
            numGuests: resolvedNumGuests,
            message,
            dietaryDetails,
            songRequest,
            plusOneNames: isDeclined ? '' : plusOneNames,
            childrenCount: resolvedChildrenCount,
            guestCode: typeof insertData.guest_code === 'string' ? insertData.guest_code : '',
            seatLookupToken: typeof insertData.seat_lookup_token === 'string' ? insertData.seat_lookup_token : '',
        });

        return NextResponse.json(
            { success: true, rsvpId: rsvp.id, notifications },
            { headers: limited.headers }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to submit RSVP.';
        console.error('Public RSVP submit failed:', message);
        return NextResponse.json({ error: 'Unable to submit RSVP.' }, { status: 500 });
    }
}

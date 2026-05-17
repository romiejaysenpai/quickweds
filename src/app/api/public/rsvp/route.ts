import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { rsvpSubmissionSchema } from '@/lib/validations';
import { createRateLimitMiddleware, getClientIP, sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limiter';
import { sendRsvpNotifications } from '@/lib/rsvp-notifications';

function getPrimaryPlusOneName(raw: string) {
    const [firstName] = raw
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
    return firstName || '';
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = rsvpSubmissionSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(', ') }, { status: 400 });
    }

    const weddingId = sanitizeWeddingId(parsed.data.weddingId);
    if (!weddingId) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

    const rateLimit = createRateLimitMiddleware('RSVP_SUBMIT');
    const limited = rateLimit.check(`${getClientIP(req)}:${weddingId}`);
    if (limited.limited) return limited.response;

    const guestName = sanitizeInput(parsed.data.guestName, { maxLength: 200 });
    const guestEmail = sanitizeEmail(parsed.data.guestEmail || '');
    const mealPreference = sanitizeInput(parsed.data.mealPreference || '', { maxLength: 200 });
    const dietaryDetails = sanitizeInput(parsed.data.dietaryDetails || '', { maxLength: 1000 });
    const songRequest = sanitizeInput(parsed.data.songRequest || '', { maxLength: 500 });
    const plusOneNames = sanitizeInput(parsed.data.plusOneNames || '', { maxLength: 1000 });
    const message = sanitizeInput(parsed.data.message || '', { maxLength: 2000, allowNewlines: true });

    if (!guestName) {
        return NextResponse.json({ error: 'Guest name is required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, user_id, bride_name, groom_name, wedding_date, wedding_time, venue_name, venue_address, maps_link, couple_email, contact_person, custom_domain, notify_on_rsvp, rsvp_deadline')
            .eq('id', weddingId)
            .is('deleted_at', null)
            .maybeSingle();

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        const { data: existing, error: duplicateError } = await db
            .from('rsvps')
            .select('id')
            .eq('wedding_id', weddingId)
            .ilike('guest_name', guestName)
            .limit(1);

        if (duplicateError) throw duplicateError;
        if (existing?.length) {
            return NextResponse.json({
                error: "You have already RSVP'd for this wedding. If you need to make changes, please contact the couple directly.",
                code: 'duplicate_rsvp',
            }, { status: 409 });
        }

        const insertData: Record<string, unknown> = {
            wedding_id: weddingId,
            guest_name: guestName,
            guest_email: guestEmail || null,
            attendance: parsed.data.attendance,
            num_guests: parsed.data.numGuests || 1,
            rsvp_status: parsed.data.attendance === 'Yes' ? 'confirmed' : 'declined',
            plus_one_allowed: parsed.data.numGuests > 1 || Boolean(plusOneNames),
        };

        if (mealPreference && mealPreference !== 'No Preference') insertData.meal_preference = mealPreference;
        if (dietaryDetails) insertData.dietary_details = dietaryDetails;
        if (message) insertData.message = message;
        if (plusOneNames) {
            insertData.plus_one_names = plusOneNames;
            insertData.plus_one_name = getPrimaryPlusOneName(plusOneNames);
            insertData.plus_one_rsvp_status = parsed.data.attendance === 'Yes' ? 'confirmed' : 'declined';
        }
        if (songRequest) insertData.song_request = songRequest;
        if (parsed.data.childrenCount > 0) insertData.children_count = parsed.data.childrenCount;

        const { data: rsvp, error: insertError } = await db
            .from('rsvps')
            .insert(insertData)
            .select('id')
            .single();

        if (insertError) throw insertError;

        const notifications = await sendRsvpNotifications(db, {
            weddingId,
            wedding,
            guestName,
            guestEmail,
            attendance: parsed.data.attendance,
            numGuests: parsed.data.numGuests || 1,
            message,
            dietaryDetails,
            songRequest,
            plusOneNames,
            childrenCount: parsed.data.childrenCount || 0,
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

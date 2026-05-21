import 'server-only';

import { sendEmail } from '@/lib/email';
import { getGuestConfirmationHtml, getCoupleNotificationHtml } from '@/lib/email-templates';
import { getPrimaryAdminEmail } from '@/lib/admin';
import { getAccountEmailUsage, getUserPlanTier, logPlannerEmailEvent, PLAN_LIMITS } from '@/lib/planner-limits';
import { getWeddingPublicUrl } from '@/lib/wedding-slugs';

type RsvpNotificationInput = {
    weddingId: string;
    wedding: Record<string, any>;
    guestName: string;
    guestEmail?: string | null;
    attendance: 'Yes' | 'No' | 'Maybe';
    numGuests: number;
    message?: string;
    dietaryDetails?: string;
    songRequest?: string;
    plusOneNames?: string;
    childrenCount?: number;
};

function getRootDomain() {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site';
}

export async function sendRsvpNotifications(db: any, input: RsvpNotificationInput) {
    const {
        weddingId,
        wedding,
        guestName,
        guestEmail,
        attendance,
        numGuests,
        message = '',
        dietaryDetails = '',
        songRequest = '',
        plusOneNames = '',
        childrenCount = 0,
    } = input;

    let recipientEmail =
        typeof wedding.couple_email === 'string' && wedding.couple_email.includes('@')
            ? wedding.couple_email
            : '';

    if (!recipientEmail && typeof wedding.contact_person === 'string' && wedding.contact_person.includes('@')) {
        recipientEmail = wedding.contact_person;
    }

    if (!recipientEmail && wedding.user_id) {
        try {
            const { data: ownerResult, error: ownerError } = await db.auth.admin.getUserById(wedding.user_id);
            if (!ownerError && ownerResult.user?.email) {
                recipientEmail = ownerResult.user.email;
            }
        } catch (ownerLookupError) {
            console.error('Failed to resolve wedding owner email from Supabase Auth:', ownerLookupError);
        }
    }

    if (!recipientEmail) {
        recipientEmail = getPrimaryAdminEmail();
    }

    const rootDomain = getRootDomain();
    const publicWeddingUrl = wedding.custom_domain
        ? `https://${wedding.custom_domain}`
        : getWeddingPublicUrl(`https://${rootDomain}`, { ...wedding, id: weddingId });
    const dashboardUrl = `https://${rootDomain}/dashboard/${weddingId}`;

    if (wedding.user_id) {
        try {
            await db.from('user_notifications').insert({
                user_id: wedding.user_id,
                wedding_id: weddingId,
                title: attendance === 'Yes' ? 'New RSVP Confirmed' : 'RSVP Update',
                message: `${guestName} has ${attendance === 'Yes' ? 'confirmed' : 'declined'} their attendance.`,
                type: 'rsvp',
                link: `/dashboard/${weddingId}?tab=guests`,
            });
        } catch (inAppError) {
            console.error('In-app RSVP notification failed:', inAppError);
        }
    }

    const emailPayloads: Parameters<typeof sendEmail>[0][] = [];

    if (recipientEmail && wedding.notify_on_rsvp !== false) {
        emailPayloads.push({
            to: recipientEmail,
            subject: `${attendance === 'Yes' ? 'RSVP Confirmed' : 'RSVP Update'}: ${guestName} - ${wedding.bride_name} & ${wedding.groom_name}`,
            html: getCoupleNotificationHtml({
                guestName,
                attendance,
                numGuests,
                message,
                dietaryDetails,
                songRequest,
                plusOneNames,
                childrenCount,
                brideName: wedding.bride_name,
                groomName: wedding.groom_name,
                weddingDate: wedding.wedding_date,
                weddingUrl: dashboardUrl,
                dashboardUrl,
                weddingTitle: `${wedding.bride_name} & ${wedding.groom_name}`,
            }),
        });
    }

    if (guestEmail) {
        emailPayloads.push({
            to: guestEmail,
            subject: attendance === 'Yes' ? "We can't wait to see you! (RSVP Confirmation)" : 'RSVP Confirmation',
            html: getGuestConfirmationHtml({
                guestName,
                attendance,
                numGuests,
                brideName: wedding.bride_name,
                groomName: wedding.groom_name,
                weddingDate: wedding.wedding_date,
                weddingTime: wedding.wedding_time,
                venueName: wedding.venue_name,
                venueAddress: wedding.venue_address,
                mapsLink: wedding.maps_link,
                weddingUrl: publicWeddingUrl,
            }),
        });
    }

    if (wedding.user_id && emailPayloads.length > 0) {
        try {
            const { data: ownerProfile } = await db
                .from('user_app_profiles')
                .select('is_pro, plan_type, payment_status')
                .eq('user_id', wedding.user_id)
                .maybeSingle();
            const tier = getUserPlanTier({ wedding, accountProfile: ownerProfile });
            const emailsUsed = await getAccountEmailUsage(db, wedding.user_id);
            const limit = PLAN_LIMITS[tier].emails;

            if (emailsUsed + emailPayloads.length > limit) {
                console.warn('RSVP emails skipped because account email limit was reached:', {
                    weddingId,
                    ownerUserId: wedding.user_id,
                    tier,
                    emailsUsed,
                    requested: emailPayloads.length,
                    limit,
                });
                return {
                    success: true,
                    skipped: true,
                    reason: 'email_limit_reached',
                    results: [],
                };
            }
        } catch (limitError) {
            console.warn('RSVP email limit check skipped:', limitError);
        }
    }

    const results = await Promise.all(emailPayloads.map((payload) => sendEmail(payload)));
    const successCount = results.filter((result) => result.success).length;
    try {
        await logPlannerEmailEvent(db, {
            weddingId,
            eventType: 'manual_guest_message',
            recipientCount: emailPayloads.length,
            successCount,
            userId: wedding.user_id || null,
        });
    } catch (logError) {
        console.warn('RSVP email event logging unavailable:', logError);
    }

    return {
        success: results.every((result) => result.success),
        results,
    };
}

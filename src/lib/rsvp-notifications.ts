import 'server-only';

import { sendEmail } from '@/lib/email';
import { getCoupleNotificationReact, getGuestConfirmationReact } from '@/emails/quickweds-transactional';
import { getPrimaryAdminEmail } from '@/lib/admin';
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
    guestCode?: string | null;
    seatLookupToken?: string | null;
};

function getRootDomain() {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site';
}

function collectImageCandidates(value: unknown): string[] {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.flatMap((item) => collectImageCandidates(item));
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        return collectImageCandidates(record.url || record.src || record.image || record.photo);
    }

    if (typeof value !== 'string') return [];

    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
            return collectImageCandidates(JSON.parse(trimmed));
        } catch {
            return [trimmed];
        }
    }

    return [trimmed];
}

function normalizeEmailImageUrl(url: string, rootDomain: string) {
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `https://${rootDomain}${url}`;
    return '';
}

function getWeddingConfirmationImageUrl(wedding: Record<string, any>, rootDomain: string) {
    const fields = [
        wedding.hero_image,
        wedding.couple_photo,
        wedding.gallery_images,
        wedding.invitation_image,
        wedding.reception_venue_photos,
    ];

    for (const field of fields) {
        for (const candidate of collectImageCandidates(field)) {
            const normalized = normalizeEmailImageUrl(candidate, rootDomain);
            if (normalized) return normalized;
        }
    }

    return '';
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
        guestCode = '',
        seatLookupToken = '',
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
    const checkInUrl = seatLookupToken ? `https://${rootDomain}/guest/${encodeURIComponent(seatLookupToken)}` : '';
    const confirmationImageUrl = getWeddingConfirmationImageUrl(wedding, rootDomain);

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

    const emailJobs: ReturnType<typeof sendEmail>[] = [];

    if (recipientEmail && wedding.notify_on_rsvp !== false) {
        emailJobs.push(sendEmail({
            to: recipientEmail,
            subject: `${attendance === 'Yes' ? 'RSVP Confirmed' : 'RSVP Update'}: ${guestName} - ${wedding.bride_name} & ${wedding.groom_name}`,
            react: getCoupleNotificationReact({
                guestName,
                guestEmail: guestEmail || undefined,
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
        }));
    }

    if (guestEmail) {
        emailJobs.push(sendEmail({
            to: guestEmail,
            subject: attendance === 'Yes' ? "We can't wait to see you! (RSVP Confirmation)" : 'RSVP Confirmation',
            react: getGuestConfirmationReact({
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
                guestCode: guestCode || undefined,
                checkInUrl: checkInUrl || undefined,
                confirmationImageUrl: confirmationImageUrl || undefined,
            }),
        }));
    }

    const results = await Promise.all(emailJobs);
    return {
        success: results.every((result) => result.success),
        results,
    };
}

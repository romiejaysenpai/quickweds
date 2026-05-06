import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { getGuestConfirmationHtml, getCoupleNotificationHtml } from '@/lib/email-templates';
import { rsvpNotifySchema } from '@/lib/validations';
import { createRateLimitMiddleware, sanitizeInput, sanitizeEmail, sanitizeWeddingId } from '@/lib/rate-limiter';

type EmailRequest = {
    to: string;
    subject: string;
    html: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const rawWeddingId = req.body?.weddingId;
    
    // CRITICAL FIX #2: Sanitize wedding ID before rate limiting
    const weddingId = sanitizeWeddingId(rawWeddingId);
    
    if (weddingId) {
        const rateLimit = createRateLimitMiddleware('RSVP_NOTIFY');
        // Rate limit by IP if available, otherwise by wedding ID
        const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                        (req.headers['x-real-ip'] as string) || 
                        'unknown';
        const rateLimitKey = clientIP !== 'unknown' ? `${clientIP}:${weddingId}` : weddingId;
        const result = rateLimit.check(rateLimitKey);

        if (result.limited) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many RSVP submissions. Please try again later.',
            });
        }
    }

    try {
        const validation = rsvpNotifySchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessages = validation.error.issues.map((err) => err.message).join(', ');
            return res.status(400).json({ error: errorMessages });
        }

        const {
            weddingId: validatedWeddingId,
            guestName: rawGuestName,
            guestEmail: rawGuestEmail,
            attendance,
            numGuests,
            message: rawMessage,
            dietaryDetails: rawDietaryDetails,
            songRequest: rawSongRequest,
            plusOneNames: rawPlusOneNames,
            childrenCount,
        } = validation.data;

        // CRITICAL FIX #2: Sanitize all string inputs
        const guestName = sanitizeInput(rawGuestName, { maxLength: 200 });
        const guestEmail = sanitizeEmail(rawGuestEmail || '');
        const message = sanitizeInput(rawMessage || '', { maxLength: 2000, allowNewlines: true });
        const dietaryDetails = sanitizeInput(rawDietaryDetails || '', { maxLength: 1000 });
        const songRequest = sanitizeInput(rawSongRequest || '', { maxLength: 500 });
        const plusOneNames = sanitizeInput(rawPlusOneNames || '', { maxLength: 1000 });

        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('*')
            .eq('id', validatedWeddingId)
            .single();

        if (weddingError || !wedding) {
            console.error(`Wedding not found in Supabase: ${validatedWeddingId}`);
            return res.status(404).json({ error: 'Wedding not found' });
        }

        const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@quickweds.com';
        let recipientEmail =
            typeof wedding.couple_email === 'string' && wedding.couple_email.includes('@')
                ? wedding.couple_email
                : '';

        if (!recipientEmail && typeof wedding.contact_person === 'string' && wedding.contact_person.includes('@')) {
            recipientEmail = wedding.contact_person;
        }

        if (!recipientEmail && wedding.user_id) {
            try {
                const adminClient = getSupabaseAdminClient();
                const { data: ownerResult, error: ownerError } = await adminClient.auth.admin.getUserById(wedding.user_id);
                if (!ownerError && ownerResult.user?.email) {
                    recipientEmail = ownerResult.user.email;
                }
            } catch (ownerLookupError) {
                console.error('Failed to resolve wedding owner email from Supabase Auth:', ownerLookupError);
            }
        }

        if (!recipientEmail) {
            recipientEmail = adminEmail;
        }

        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site';
        const publicWeddingUrl = wedding.custom_domain
            ? `https://${wedding.custom_domain}`
            : `https://${rootDomain}/w/${validatedWeddingId}`;
        const dashboardUrl = `https://${rootDomain}/dashboard/${validatedWeddingId}`;

        const coupleEmail: EmailRequest = {
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
        };

        // Create In-App Notification
        if (wedding.user_id) {
            try {
                const adminClient = getSupabaseAdminClient();
                await (adminClient as any)
                    .from('user_notifications')
                    .insert({
                        user_id: wedding.user_id,
                        wedding_id: validatedWeddingId,
                        title: attendance === 'Yes' ? 'New RSVP Confirmed! 🥂' : 'RSVP Update',
                        message: `${guestName} has ${attendance === 'Yes' ? 'confirmed' : 'declined'} their attendance.`,
                        type: 'rsvp',
                        link: `/dashboard/${validatedWeddingId}?tab=guests`
                    });
            } catch (inAppError) {
                console.error('In-app notification failed:', inAppError);
            }
        }

        const emailJobs: ReturnType<typeof sendEmail>[] = [];
        
        // Only send couple notification if enabled (defaults to true)
        if (wedding.notify_on_rsvp !== false) {
            emailJobs.push(sendEmail(coupleEmail));
        }

        if (guestEmail) {
            const guestEmailRequest: EmailRequest = {
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
            };

            emailJobs.push(sendEmail(guestEmailRequest));
        }

        const results = await Promise.all(emailJobs);
        const allSuccessful = results.every((result) => result.success);

        return res.status(200).json({
            success: allSuccessful,
            message: allSuccessful ? 'Emails sent' : 'Some emails failed to send',
            results,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown RSVP notify error';
        console.error('RSVP notify critical error:', error);
        return res.status(500).json({ error: message });
    }
}

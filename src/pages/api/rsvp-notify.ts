import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { getGuestConfirmationHtml, getCoupleNotificationHtml } from '@/lib/email-templates';
import { rsvpNotifySchema } from '@/lib/validations';
import { createRateLimitMiddleware } from '@/lib/rate-limiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Rate limit by wedding ID to prevent spam
    const weddingId = req.body?.weddingId;
    if (weddingId) {
        const rateLimit = createRateLimitMiddleware('RSVP_NOTIFY');
        const result = rateLimit.check(weddingId);

        if (result.limited) {
            return res.status(429).json({
                error: result.response instanceof Response ? 'Rate limit exceeded' : 'Rate limit exceeded',
                message: 'Too many RSVP submissions. Please try again later.',
            });
        }
    }

    try {
        const validation = rsvpNotifySchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessages = validation.error.issues.map(err => err.message).join(', ');
            return res.status(400).json({ error: errorMessages });
        }

        const { weddingId, guestName, guestEmail, attendance, numGuests, message, dietaryDetails, songRequest, plusOneNames, childrenCount } = validation.data;

        if (!weddingId) {
            return res.status(400).json({ error: 'Wedding ID is required' });
        }

        // Fetch wedding details
        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('*')
            .eq('id', weddingId)
            .single();

        if (weddingError || !wedding) {
            return res.status(404).json({ error: 'Wedding not found' });
        }

        // Get recipient email (couple)
        // Fallback Priority:
        // 1. wedding.couple_email (if exists)
        // 2. wedding.contact_person (if it looks like an email)
        // 3. Admin Email (fallback from environment variable)
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@quickweds.com';
        let recipientEmail = wedding.couple_email;

        if (!recipientEmail && wedding.contact_person && wedding.contact_person.includes('@')) {
            recipientEmail = wedding.contact_person;
            console.log(`Using contact_person as fallback email: ${recipientEmail}`);
        }

        if (!recipientEmail) {
            recipientEmail = ADMIN_EMAIL;
            console.log(`No recipient email found for wedding: ${weddingId}. Falling back to admin: ${recipientEmail}`);
        }

        const guestRecipientEmail = guestEmail || 'no-email-provided';

        const weddingUrl = `${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site'}/w/${weddingId}`;
        const finalWeddingUrl = wedding.custom_domain ? `https://${wedding.custom_domain}` : `https://${weddingUrl}`;

        // Prepare templates
        const coupleHtml = getCoupleNotificationHtml({
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
            weddingUrl: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site'}/dashboard/${weddingId}`,
            dashboardUrl: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site'}/dashboard/${weddingId}`,
            weddingTitle: `${wedding.bride_name} & ${wedding.groom_name}`
        });

        const promises = [];

        // 1. Send to Couple
        console.log(`📧 (Pages) Sending RSVP notification to couple: ${recipientEmail}`);

        const coupleTemplateId = process.env.RESEND_COUPLE_TEMPLATE_ID;
        const coupleEmailParams: any = {
            to: recipientEmail,
            subject: `${attendance === 'Yes' ? '🎉' : '📩'} RSVP Received: ${guestName} — ${wedding.bride_name} & ${wedding.groom_name}`,
        };

        coupleEmailParams.html = coupleHtml;
        promises.push(sendEmail(coupleEmailParams));

        // 2. Send to Guest (if email provided)
        if (guestEmail) {
            console.log(`📧 (Pages) Sending RSVP confirmation to guest: ${guestEmail}`);

            const guestEmailParams: any = {
                to: guestEmail,
                subject: attendance === 'Yes' ? "We can't wait to see you! (RSVP Confirmation)" : "RSVP Confirmation",
            };

            const guestHtml = getGuestConfirmationHtml({
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
                weddingUrl: finalWeddingUrl
            });
            guestEmailParams.html = guestHtml;

            promises.push(sendEmail(guestEmailParams));
        }

        const results = await Promise.all(promises);
        const allSuccessful = results.every(r => r.success);

        return res.status(200).json({
            success: allSuccessful,
            message: allSuccessful ? 'Emails sent' : 'Some emails failed to send',
            results
        });
    } catch (error: any) {
        console.error('❌ (Pages) RSVP notify critical error:', error);
        return res.status(500).json({ error: error.message });
    }
}

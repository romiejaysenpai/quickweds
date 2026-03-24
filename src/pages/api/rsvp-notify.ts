import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { getGuestConfirmationHtml, getCoupleNotificationHtml } from '@/lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { weddingId, guestName, guestEmail, attendance, numGuests, message, dietaryDetails, songRequest, plusOneNames, childrenCount } = req.body;

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
        let recipientEmail = wedding.couple_email;
        if (!recipientEmail && wedding.user_id) {
            const { data: user } = await supabase
                .from('users')
                .select('email')
                .eq('id', wedding.user_id)
                .single();
            recipientEmail = user?.email;
        }

        if (!recipientEmail) {
            console.error('No recipient email found for wedding:', weddingId);
            return res.status(400).json({ error: 'Recipient email not found' });
        }

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
            dashboardUrl: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site'}/dashboard/${weddingId}`,
            weddingTitle: `${wedding.bride_name} & ${wedding.groom_name}`
        });

        const promises = [];

        // 1. Send to Couple
        console.log(`📧 (Pages) Sending RSVP notification to couple: ${recipientEmail}`);
        promises.push(
            sendEmail({
                to: recipientEmail,
                subject: `${attendance === 'Yes' ? '🎉' : '📩'} RSVP Received: ${guestName} — ${wedding.bride_name} & ${wedding.groom_name}`,
                html: coupleHtml,
            })
        );

        // 2. Send to Guest (if email provided)
        if (guestEmail) {
            console.log(`📧 (Pages) Sending RSVP confirmation to guest: ${guestEmail}`);
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
            promises.push(
                sendEmail({
                    to: guestEmail,
                    subject: attendance === 'Yes' ? "We can't wait to see you! (RSVP Confirmation)" : "RSVP Confirmation",
                    html: guestHtml
                })
            );
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

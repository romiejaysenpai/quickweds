import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';
import { getCoupleNotificationReact, getGuestConfirmationReact } from '@/emails/quickweds-transactional';

/**
 * Debug endpoint to test transactional email delivery.
 *
 * Usage: GET /api/debug-email?email=your@email.com
 *
 * Sends 2 test emails:
 *   1. Guest RSVP Confirmation (wedding details invitation)
 *   2. Couple RSVP Notification (new RSVP received)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ error: 'Not found' });
    }

    try {
        const testEmail = req.query.email as string;

        if (!testEmail) {
            return res.status(400).json({
                error: 'Missing email parameter',
                usage: 'GET /api/debug-email?email=your@email.com',
            });
        }

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'RESEND_API_KEY is not set in environment variables',
                hint: 'Add RESEND_API_KEY=re_xxxxx to your .env.local file',
            });
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@quickweds.site>';

        console.log('Debug email test starting...');
        console.log(`FROM: ${fromEmail}`);
        console.log(`TO: ${testEmail}`);

        const sampleData = {
            guestName: 'Maria Santos',
            guestEmail: testEmail,
            brideName: 'Sofia',
            groomName: 'Miguel',
            weddingDate: 'June 15, 2026',
            weddingTime: '3:00 PM',
            venueName: 'The Grand Ballroom',
            venueAddress: '123 Love Lane, Manila, Philippines',
            mapsLink: 'https://maps.google.com',
            weddingUrl: 'https://www.quickweds.site',
            attendance: 'Yes',
            numGuests: 3,
            message: 'So excited for your special day! Congratulations to you both!',
            dietaryDetails: 'Vegetarian',
            songRequest: 'Perfect - Ed Sheeran',
            plusOneNames: 'Juan Santos, Ana Santos',
            childrenCount: 1,
            guestCode: 'QW-TEST-2486',
            checkInUrl: 'https://quickweds.site/seat/test-react-email-guest-pass',
            confirmationImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Wedding%20Website%20Builder.png',
            dashboardUrl: 'https://www.quickweds.site/dashboard',
            weddingTitle: 'Sofia & Miguel',
        };

        const guestResult = await sendEmail({
            to: testEmail,
            subject: "We can't wait to see you! (RSVP Confirmation) - TEST",
            react: getGuestConfirmationReact(sampleData),
        });

        const coupleResult = await sendEmail({
            to: testEmail,
            subject: 'New RSVP Received: Maria Santos - Sofia & Miguel - TEST',
            react: getCoupleNotificationReact(sampleData),
        });

        const results = [
            { type: 'guest_confirmation', ...guestResult },
            { type: 'couple_notification', ...coupleResult },
        ];
        const allSuccess = results.every((result) => result.success);

        return res.status(allSuccess ? 200 : 500).json({
            success: allSuccess,
            message: allSuccess
                ? 'Both test emails were accepted by Resend.'
                : 'Some emails failed. Check the results payload for details.',
            sentTo: testEmail,
            fromEmail,
            results,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown debug email error';
        const stack = error instanceof Error ? error.stack : undefined;

        console.error('Debug email critical error:', error);
        return res.status(500).json({
            error: message,
            stack: process.env.NODE_ENV === 'development' ? stack : undefined,
        });
    }
}

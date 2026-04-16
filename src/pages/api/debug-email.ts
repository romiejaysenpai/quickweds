import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';
import { getGuestConfirmationHtml, getCoupleNotificationHtml } from '@/lib/email-templates';

/**
 * Debug endpoint to test Resend email delivery.
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
                usage: 'GET /api/debug-email?email=your@email.com'
            });
        }

        // Check Resend config
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'RESEND_API_KEY is not set in environment variables',
                hint: 'Add RESEND_API_KEY=re_xxxxx to your .env.local file'
            });
        }

        console.log(`🧪 Debug email test starting...`);
        console.log(`📧 FROM: ${process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@quickweds.site>'}`);
        console.log(`📧 TO: ${testEmail}`);

        // Sample wedding data for the test templates
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
            message: 'So excited for your special day! Congratulations to you both! 🎉',
            dietaryDetails: 'Vegetarian',
            songRequest: 'Perfect - Ed Sheeran',
            plusOneNames: 'Juan Santos, Ana Santos',
            childrenCount: 1,
            dashboardUrl: 'https://www.quickweds.site/dashboard',
            weddingTitle: 'Sofia & Miguel',
        };

        const results = [];

        // ─── EMAIL 1: Guest RSVP Confirmation ────────────────────────
        // This is the email a GUEST receives after submitting their RSVP
        console.log(`\n📨 [1/2] Sending Guest RSVP Confirmation to: ${testEmail}`);
        const guestHtml = getGuestConfirmationHtml(sampleData);
        const guestResult = await sendEmail({
            to: testEmail,
            subject: "💍 We can't wait to see you! (RSVP Confirmation) — TEST",
            html: guestHtml,
        });
        results.push({ type: 'guest_confirmation', ...guestResult });
        console.log(`   Result:`, guestResult.success ? '✅ Sent!' : `❌ Failed: ${guestResult.error}`);

        // ─── EMAIL 2: Couple RSVP Notification ───────────────────────
        // This is the email the COUPLE receives when a guest RSVPs
        console.log(`📨 [2/2] Sending Couple RSVP Notification to: ${testEmail}`);
        const coupleHtml = getCoupleNotificationHtml(sampleData);
        const coupleResult = await sendEmail({
            to: testEmail,
            subject: '🎉 New RSVP Received: Maria Santos — Sofia & Miguel — TEST',
            html: coupleHtml,
        });
        results.push({ type: 'couple_notification', ...coupleResult });
        console.log(`   Result:`, coupleResult.success ? '✅ Sent!' : `❌ Failed: ${coupleResult.error}`);

        // ─── Summary ─────────────────────────────────────────────────
        const allSuccess = results.every(r => r.success);

        return res.status(allSuccess ? 200 : 500).json({
            success: allSuccess,
            message: allSuccess 
                ? '🎉 Both test emails sent successfully! Check your inbox.' 
                : '⚠️ Some emails failed — see results for details.',
            sentTo: testEmail,
            fromEmail: process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@quickweds.site>',
            results,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown debug email error';
        const stack = error instanceof Error ? error.stack : undefined;
        console.error('💥 Debug email critical error:', error);
        return res.status(500).json({ 
            error: message,
            stack: process.env.NODE_ENV === 'development' ? stack : undefined
        });
    }
}

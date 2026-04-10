import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';
import { getGuestReminderHtml } from '@/lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing email parameter. Use ?email=your@email.com' });
  }

  try {
    const testProps = {
      guestName: "Test Guest",
      brideName: "Sarah",
      groomName: "James",
      weddingDate: "Saturday, June 14, 2026",
      weddingTime: "4:00 PM",
      venueName: "The Grand Rose Garden",
      venueAddress: "123 Wedding Lane, Beverly Hills, CA",
      weddingUrl: "https://quickweds.site/w/test-wedding",
      attendance: "Yes",
      numGuests: 2,
    };

    const html = getGuestReminderHtml(testProps);

    const result = await sendEmail({
      to: email,
      subject: "TEST: Your Wedding Reminder is Here! (QuickWeds)",
      html: html
    });

    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        message: `Test email sent successfully to ${email}!`,
        id: result.id 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: result.error,
        details: result.details
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

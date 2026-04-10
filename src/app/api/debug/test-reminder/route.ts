import { sendEmail } from '@/lib/email';
import { getGuestReminderHtml } from '@/lib/email-templates';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return new Response('Missing email parameter. Use ?email=your@email.com', { status: 400 });
  }

  try {
    // 1. Prepare sample data for the test
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

    // 2. Generate the HTML
    const html = getGuestReminderHtml(testProps);

    // 3. Send the test email
    const result = await sendEmail({
      to: email,
      subject: "TEST: Your Wedding Reminder is Here! (QuickWeds)",
      html: html
    });

    if (result.success) {
      return Response.json({ 
        success: true, 
        message: `Test email sent successfully to ${email}! Check your inbox (and spam folder).`,
        id: result.id 
      });
    } else {
      return Response.json({ 
        success: false, 
        error: result.error,
        details: result.details
      }, { status: 500 });
    }
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

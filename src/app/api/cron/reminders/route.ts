import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { getGuestReminderHtml } from '@/lib/email-templates';

// Using Service Role Key to bypass RLS for automated tasks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  // 1. Security Check: Verify Cron Secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    
    // --- 3-DAY REMINDERS ---
    // Targets weddings happening between 70 and 74 hours from now
    const threeDaysStart = new Date(now.getTime() + 70 * 60 * 60 * 1000).toISOString();
    const threeDaysEnd = new Date(now.getTime() + 74 * 60 * 60 * 1000).toISOString();
    
    // --- 12-HOUR REMINDERS ---
    // Targets weddings happening between 10 and 14 hours from now
    const twelveHoursStart = new Date(now.getTime() + 10 * 60 * 60 * 1000).toISOString();
    const twelveHoursEnd = new Date(now.getTime() + 14 * 60 * 60 * 1000).toISOString();

    const results = [];

    // Process both ranges
    const triggers = [
      { type: '3_days', start: threeDaysStart, end: threeDaysEnd, label: '3-Day Reminder' },
      { type: '12_hours', start: twelveHoursStart, end: twelveHoursEnd, label: '12-Hour Reminder' }
    ];

    for (const trigger of triggers) {
      // 1. Find upcoming weddings
      const { data: weddings, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .gte('wedding_date', trigger.start)
        .lte('wedding_date', trigger.end);

      if (weddingError) throw weddingError;

      for (const wedding of weddings) {
        // 2. Find confirmed guests who haven't received this specific reminder
        const { data: guests, error: guestError } = await supabase
          .from('rsvps')
          .select('*, rsvp_reminders(id, reminder_type)')
          .eq('wedding_id', wedding.id)
          .eq('attendance', 'Yes')
          .not('guest_email', 'is', null);

        if (guestError) throw guestError;

        // Filter out guests who already received this type of reminder
        const eligibleGuests = guests.filter(g => 
          !g.rsvp_reminders?.some((rem: any) => rem.reminder_type === trigger.type)
        );

        if (eligibleGuests.length === 0) continue;

        // 3. Send Emails
        let sentCount = 0;
        for (const guest of eligibleGuests) {
          const html = getGuestReminderHtml({
            guestName: guest.guest_name,
            brideName: wedding.bride_name,
            groomName: wedding.groom_name,
            weddingDate: new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            weddingTime: wedding.wedding_time,
            venueName: wedding.venue_name,
            venueAddress: wedding.venue_address,
            weddingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://quickweds.site'}/w/${wedding.id}`,
            attendance: 'Yes',
            numGuests: guest.num_guests,
          });

          await sendEmail({
            to: guest.guest_email,
            subject: `Reminder: ${wedding.bride_name} & ${wedding.groom_name}'s Wedding is Almost Here!`,
            html
          });

          // 4. Mark as Sent
          await supabase.from('rsvp_reminders').insert({
            rsvp_id: guest.id,
            reminder_type: trigger.type
          });
          
          sentCount++;
        }

        results.push({
          wedding: `${wedding.bride_name} & ${wedding.groom_name}`,
          type: trigger.type,
          sent: sentCount
        });
      }
    }

    return Response.json({ success: true, results });
  } catch (err: any) {
    console.error('Cron Error:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { getGuestReminderHtml } from '@/lib/email-templates';
import { getWeddingPublicUrl } from '@/lib/wedding-slugs';

let supabaseAdmin: any = null;

function getCronSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Cron reminders require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdmin as any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Security Check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    const supabase = getCronSupabaseClient();
    const now = new Date();
    
    const threeDaysStart = new Date(now.getTime() + 70 * 60 * 60 * 1000).toISOString();
    const threeDaysEnd = new Date(now.getTime() + 74 * 60 * 60 * 1000).toISOString();
    
    const twelveHoursStart = new Date(now.getTime() + 10 * 60 * 60 * 1000).toISOString();
    const twelveHoursEnd = new Date(now.getTime() + 14 * 60 * 60 * 1000).toISOString();

    const results = [];

    const triggers = [
      { type: '3_days', start: threeDaysStart, end: threeDaysEnd },
      { type: '12_hours', start: twelveHoursStart, end: twelveHoursEnd }
    ];

    for (const trigger of triggers) {
      const { data: weddings, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .gte('wedding_date', trigger.start)
        .lte('wedding_date', trigger.end);

      if (weddingError) throw weddingError;

      for (const wedding of weddings) {
        const { data: guests, error: guestError } = await supabase
          .from('rsvps')
          .select('*, rsvp_reminders(id, reminder_type)')
          .eq('wedding_id', wedding.id)
          .eq('attendance', 'Yes')
          .not('guest_email', 'is', null);

        if (guestError) throw guestError;

        const eligibleGuests = (guests || []).filter((g: any) =>
          !g.rsvp_reminders?.some((rem: any) => rem.reminder_type === trigger.type)
        );

        if (eligibleGuests.length === 0) continue;

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
            weddingUrl: getWeddingPublicUrl(process.env.NEXT_PUBLIC_APP_URL || 'https://quickweds.site', wedding),
            attendance: 'Yes',
            numGuests: guest.num_guests,
          });

          await sendEmail({
            to: guest.guest_email,
            subject: `Reminder: ${wedding.bride_name} & ${wedding.groom_name}'s Wedding is Almost Here!`,
            html
          });

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

    return res.status(200).json({ success: true, results });
  } catch (err: any) {
    console.error('Cron Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

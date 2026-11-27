import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { getGuestReminderReact } from '@/emails/quickweds-transactional';
import { getWeddingGuestUrl } from '@/lib/guest-links';
import { normalizeExternalWebsiteUrl } from '@/lib/url-safety';

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
  // 1. Security Check — fail closed if the secret is not configured
  // (otherwise the literal header "Bearer undefined" would be accepted).
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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
        .is('deleted_at', null)
        .gte('wedding_date', trigger.start.slice(0, 10))
        .lte('wedding_date', trigger.end.slice(0, 10));

      if (weddingError) throw weddingError;

      for (const wedding of weddings) {
        const guestRsvpUrl = getWeddingGuestUrl(process.env.NEXT_PUBLIC_APP_URL || 'https://quickweds.site', wedding);
        if (!guestRsvpUrl) continue;
        const externalUrl = typeof wedding.external_website_url === 'string'
          ? normalizeExternalWebsiteUrl(wedding.external_website_url)
          : null;
        const weddingUrl = (wedding.planner_only && externalUrl) ? externalUrl : guestRsvpUrl;
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
          const react = getGuestReminderReact({
            guestName: guest.guest_name,
            brideName: wedding.bride_name,
            groomName: wedding.groom_name,
            weddingDate: new Date(`${String(wedding.wedding_date).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            weddingTime: wedding.wedding_time,
            venueName: wedding.venue_name,
            venueAddress: wedding.venue_address,
            weddingUrl,
            attendance: 'Yes',
            numGuests: guest.num_guests,
          });

          const delivery = await sendEmail({
            to: guest.guest_email,
            tracking: { key: `guest-reminder:${wedding.id}:${guest.id}:${trigger.type}:${wedding.wedding_date}`, weddingId: wedding.id },
            subject: `Reminder: ${wedding.bride_name} & ${wedding.groom_name}'s Wedding is Almost Here!`,
            react
          });

          if (!delivery.success) continue;
          const { error: logError } = await supabase.from('rsvp_reminders').insert({
            rsvp_id: guest.id,
            reminder_type: trigger.type
          });
          
          if (logError) throw logError;
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

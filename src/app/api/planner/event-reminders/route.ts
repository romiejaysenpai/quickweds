import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { getPublicAppUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

function escapeHtml(value: unknown) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function emailSubjectText(value: unknown) {
    return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 180);
}

function reminderHtml(input: {
    title: string;
    couple: string;
    startsAt: string;
    location?: string | null;
    notes?: string | null;
    plannerUrl: string;
}) {
    const title = escapeHtml(input.title);
    const couple = escapeHtml(input.couple);
    const startsAt = escapeHtml(input.startsAt);
    const location = input.location ? escapeHtml(input.location) : '';
    const notes = input.notes ? escapeHtml(input.notes).replace(/\r?\n/g, '<br>') : '';
    const plannerUrl = escapeHtml(input.plannerUrl);

    return `
        <div style="font-family: Georgia, serif; background:#fff8f4; padding:32px; color:#3a2a2d;">
            <div style="max-width:620px; margin:0 auto; background:#fff; border-radius:28px; padding:32px; border:1px solid rgba(209,108,120,.18);">
                <p style="margin:0 0 10px; text-transform:uppercase; letter-spacing:.2em; color:#d16c78; font-size:11px; font-weight:700;">QuickWeds Planner Reminder</p>
                <h1 style="margin:0 0 16px; color:#3a2a2d;">${title}</h1>
                <p style="font-size:16px; line-height:1.7;">Upcoming schedule for ${couple}.</p>
                <div style="background:#fff8f4; border-radius:18px; padding:18px; margin:20px 0;">
                    <p style="margin:0 0 8px;"><strong>When:</strong> ${startsAt}</p>
                    ${location ? `<p style="margin:0 0 8px;"><strong>Where:</strong> ${location}</p>` : ''}
                    ${notes ? `<p style="margin:0;"><strong>Notes:</strong> ${notes}</p>` : ''}
                </div>
                <a href="${plannerUrl}" style="display:inline-block; background:#d16c78; color:#fff; padding:14px 22px; border-radius:14px; text-decoration:none; font-weight:700;">Open Planner</a>
            </div>
        </div>
    `;
}

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getSupabaseAdminClient() as any;
    const now = new Date();
    const horizon = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);

    const { data: events, error } = await db
        .from('planner_events')
        .select('*, weddings(id, user_id, bride_name, groom_name)')
        .is('reminder_sent_at', null)
        .gte('starts_at', now.toISOString())
        .lte('starts_at', horizon.toISOString())
        .order('starts_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const dueEvents = (events || []).filter((event: any) => {
        const reminderMinutes = Number(event.reminder_minutes ?? 1440);
        const remindAt = new Date(new Date(event.starts_at).getTime() - reminderMinutes * 60 * 1000);
        return remindAt <= now;
    });

    const results = [];
    for (const event of dueEvents) {
        const wedding = event.weddings;
        if (!wedding?.user_id) continue;

        const { data: owner } = await db.auth.admin.getUserById(wedding.user_id);
        const ownerEmail = owner?.user?.email;
        const couple = `${wedding.bride_name || 'Your'} & ${wedding.groom_name || 'Wedding'}`;
        const plannerUrl = `${getPublicAppUrl()}/dashboard/${wedding.id}/planner?tab=calendar`;
        const startsAt = new Date(event.starts_at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

        await db.from('user_notifications').insert({
            user_id: wedding.user_id,
            wedding_id: wedding.id,
            title: `Upcoming schedule: ${event.title}`,
            message: `${startsAt}${event.location ? ` at ${event.location}` : ''}`,
            type: 'info',
            link: `/dashboard/${wedding.id}/planner?tab=calendar`,
        });

        if (ownerEmail) {
            await sendEmail({
                to: ownerEmail,
                subject: `QuickWeds reminder: ${emailSubjectText(event.title) || 'Upcoming schedule'}`,
                html: reminderHtml({
                    title: event.title,
                    couple,
                    startsAt,
                    location: event.location,
                    notes: event.notes,
                    plannerUrl,
                }),
            });
        }

        await db.from('planner_events').update({ reminder_sent_at: new Date().toISOString() }).eq('id', event.id);
        results.push({ id: event.id, title: event.title, email: Boolean(ownerEmail) });
    }

    return NextResponse.json({ success: true, sent: results.length, results });
}

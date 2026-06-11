import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { getWelcomeEmailHtml } from '@/lib/email-templates';
import type { NextRequest } from 'next/server';

// ─── Auth ────────────────────────────────────────────────────
const getApiKey = () =>
    process.env.AGENTOPS_API_KEY || process.env.CRON_SECRET || '';

export function isAgentAuthorized(req: NextRequest): boolean {
    const key = getApiKey();
    if (!key) return false;
    const header = req.headers.get('authorization') || '';
    return header === `Bearer ${key}`;
}

// ─── Types ───────────────────────────────────────────────────
export interface LifecycleTask {
    id: string;
    userId: string;
    email: string;
    lifecycleStage: string;
    riskLevel: 'low' | 'medium' | 'high';
    requiresApproval: boolean;
    optedIn: boolean;
    suppressed: boolean;
    userName?: string;
    weddingId?: string;
    weddingDate?: string;
    brideName?: string;
    groomName?: string;
    createdAt: string;
}

// ─── Lifecycle Stage Detection ───────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
    return new Date(Date.now() - days * DAY_MS).toISOString();
}

function getUserName(user: { user_metadata?: Record<string, unknown> | null; email?: string }): string {
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || meta.first_name;
    if (typeof name === 'string' && name.trim()) return name.trim().split(/\s+/)[0];
    const emailName = user.email?.split('@')[0]?.replace(/[._-]+/g, ' ');
    return emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'there';
}

export async function getEligibleLifecycleTasks(
    db: ReturnType<typeof getSupabaseAdminClient>,
    limit = 25
): Promise<LifecycleTask[]> {
    const tasks: LifecycleTask[] = [];
    const adminDb = db as any;

    // Fetch all auth users
    const { data: usersData } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const users: Array<{
        id: string;
        email?: string;
        created_at?: string;
        user_metadata?: Record<string, unknown>;
    }> = usersData?.users || [];

    if (users.length === 0) return [];

    // Fetch all weddings
    const { data: weddings } = await adminDb
        .from('weddings')
        .select('id, user_id, bride_name, groom_name, wedding_date, venue_name, public_slug, created_at, deleted_at')
        .is('deleted_at', null);

    // Fetch all profiles
    const userIds = users.map((u) => u.id);
    const { data: profiles } = await adminDb
        .from('user_app_profiles')
        .select('user_id, is_pro, payment_status, account_type')
        .in('user_id', userIds.slice(0, 500));

    // Fetch marketing nurture subscriber statuses
    const { data: subscribers } = await adminDb
        .from('marketing_nurture_subscribers')
        .select('user_id, status')
        .in('user_id', userIds.slice(0, 500));

    // Build lookup maps
    const weddingsByUser = new Map<string, any[]>();
    for (const w of weddings || []) {
        const arr = weddingsByUser.get(w.user_id) || [];
        arr.push(w);
        weddingsByUser.set(w.user_id, arr);
    }

    const profileMap = new Map<string, any>();
    for (const p of profiles || []) profileMap.set(p.user_id, p);

    const subscriberMap = new Map<string, any>();
    for (const s of subscribers || []) subscriberMap.set(s.user_id, s);

    // Fetch RSVP counts per wedding
    const weddingIds = (weddings || []).map((w: any) => w.id);
    const rsvpCounts = new Map<string, number>();
    if (weddingIds.length > 0) {
        const { data: rsvps } = await adminDb
            .from('rsvps')
            .select('wedding_id')
            .in('wedding_id', weddingIds.slice(0, 500));

        for (const r of rsvps || []) {
            rsvpCounts.set(r.wedding_id, (rsvpCounts.get(r.wedding_id) || 0) + 1);
        }
    }

    const now = Date.now();

    for (const user of users) {
        if (!user.email || !user.id) continue;
        if (tasks.length >= limit) break;

        const profile = profileMap.get(user.id);
        const subscriber = subscriberMap.get(user.id);
        const userWeddings = weddingsByUser.get(user.id) || [];
        const isPro = profile?.is_pro || profile?.payment_status === 'paid';
        const isSupplier = profile?.account_type === 'supplier';
        const isUnsubscribed = subscriber?.status === 'unsubscribed';
        const createdMs = user.created_at ? new Date(user.created_at).getTime() : 0;
        const ageDays = createdMs ? (now - createdMs) / DAY_MS : 999;

        if (isSupplier) continue; // Skip suppliers

        const primaryWedding = userWeddings[0];
        const weddingDate = primaryWedding?.wedding_date;
        const weddingDateMs = weddingDate ? new Date(weddingDate).getTime() : 0;
        const daysUntilWedding = weddingDateMs ? (weddingDateMs - now) / DAY_MS : 999;

        let stage: string | null = null;

        // Determine lifecycle stage (first match wins, priority order)
        if (ageDays < 1 && userWeddings.length === 0) {
            stage = 'welcome';
        } else if (userWeddings.length > 0 && primaryWedding) {
            const hasBasics = primaryWedding.bride_name && primaryWedding.groom_name && primaryWedding.wedding_date;
            const hasVenue = Boolean(primaryWedding.venue_name);
            const isPublished = Boolean(primaryWedding.public_slug);
            const rsvpCount = rsvpCounts.get(primaryWedding.id) || 0;

            if (!hasBasics || !hasVenue) {
                stage = 'onboarding_incomplete';
            } else if (!isPublished) {
                stage = 'wedding_site_unpublished';
            } else if (rsvpCount === 0 && ageDays > 2) {
                stage = 'rsvp_not_configured';
            } else if (rsvpCount > 0 && ageDays > 14) {
                // Check for idle — this is a simplified check
                stage = 'guest_list_idle';
            } else if (daysUntilWedding > 0 && daysUntilWedding <= 30) {
                stage = 'wedding_countdown';
            } else if (daysUntilWedding < 0 && daysUntilWedding >= -7) {
                stage = 'post_wedding_followup';
            }
        }

        // Pro education for older free users
        if (!stage && !isPro && ageDays > 30 && userWeddings.length > 0) {
            stage = 'planner_pro_education';
        }

        if (!stage) continue;

        const marketingLike = ['planner_pro_education', 'guest_list_idle', 'post_wedding_followup'].includes(stage);

        tasks.push({
            id: `${user.id}:${stage}`,
            userId: user.id,
            email: user.email,
            lifecycleStage: stage,
            riskLevel: marketingLike ? 'medium' : 'low',
            requiresApproval: marketingLike,
            optedIn: !isUnsubscribed,
            suppressed: isUnsubscribed && marketingLike,
            userName: getUserName(user),
            weddingId: primaryWedding?.id,
            weddingDate: primaryWedding?.wedding_date,
            brideName: primaryWedding?.bride_name,
            groomName: primaryWedding?.groom_name,
            createdAt: user.created_at || new Date().toISOString(),
        });
    }

    return tasks;
}

// ─── Task Execution ──────────────────────────────────────────

const MAIN_COLOR = '#D16C78';
const BG_COLOR = '#FFF8F4';
const TEXT_COLOR = '#3A2A2D';
const SECONDARY_TEXT = '#7A5A61';

function lifecycleEmailHtml(opts: {
    emoji: string;
    heading: string;
    userName: string;
    bodyLines: string[];
    ctaText: string;
    ctaUrl: string;
}): string {
    const bodyHtml = opts.bodyLines
        .map((line) => `<p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${SECONDARY_TEXT};">${line}</p>`)
        .join('');

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:${BG_COLOR};color:${TEXT_COLOR};">
<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:40px auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 20px 40px rgba(209,108,120,0.12);">
  <tr><td align="center" style="padding:48px 40px 24px;">
    <div style="font-size:56px;margin-bottom:16px;">${opts.emoji}</div>
    <h1 style="margin:0;font-size:28px;color:${MAIN_COLOR};">${opts.heading}</h1>
  </td></tr>
  <tr><td style="padding:0 44px 28px;">
    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${TEXT_COLOR};">Hi ${opts.userName},</p>
    ${bodyHtml}
  </td></tr>
  <tr><td align="center" style="padding:0 44px 42px;">
    <a href="${opts.ctaUrl}" style="display:inline-block;padding:15px 24px;background-color:${MAIN_COLOR};color:#fff;text-decoration:none;border-radius:14px;font-weight:800;font-size:15px;">${opts.ctaText}</a>
  </td></tr>
  <tr><td style="padding:26px 44px;background:#fafafa;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#8f747a;">Sent automatically by <strong style="color:${MAIN_COLOR};">QuickWeds</strong></p>
  </td></tr>
</table></body></html>`;
}

const STAGE_EMAILS: Record<string, {
    subject: string;
    emoji: string;
    heading: string;
    bodyLines: string[];
    ctaText: string;
    ctaPath: string;
}> = {
    welcome: {
        subject: 'Welcome to QuickWeds! 💍',
        emoji: '✨',
        heading: 'Welcome to QuickWeds!',
        bodyLines: [
            "We're so honored to be part of your wedding journey! QuickWeds was built to make your invitations as beautiful as your love story—without the stress.",
            'Start by picking a template, adding your story and venue details, then share one link with everyone.',
        ],
        ctaText: 'Start Building Now',
        ctaPath: '/builder',
    },
    onboarding_incomplete: {
        subject: 'Your wedding site is almost ready!',
        emoji: '📝',
        heading: 'Just a few more details',
        bodyLines: [
            "You've started your wedding page on QuickWeds — nice! A couple of details are still missing to make it shine.",
            "Add your names, wedding date, and venue so your guests can see the full picture when you're ready to share.",
        ],
        ctaText: 'Complete Your Page',
        ctaPath: '/builder',
    },
    wedding_site_unpublished: {
        subject: 'Ready to share your wedding site?',
        emoji: '🚀',
        heading: "Your site is ready — let's go live!",
        bodyLines: [
            'Your QuickWeds wedding page looks great. Hit publish to get your unique link and start collecting RSVPs.',
            "Once it's live, you can share it with guests, embed it in physical invitations, and track who's coming.",
        ],
        ctaText: 'Publish Your Page',
        ctaPath: '/dashboard',
    },
    rsvp_not_configured: {
        subject: 'Start collecting RSVPs for your wedding',
        emoji: '💌',
        heading: 'Collect RSVPs without chasing every reply',
        bodyLines: [
            "Your wedding site is live — congrats! Now it's time to share the link and start gathering RSVPs.",
            'Guests can respond directly through your page, and you can track everything from your dashboard.',
        ],
        ctaText: 'View Your Dashboard',
        ctaPath: '/dashboard',
    },
    guest_list_idle: {
        subject: "Your guest list is waiting — here's a nudge",
        emoji: '📋',
        heading: 'Keep the momentum going',
        bodyLines: [
            "It's been a while since your last guest activity. A quick reminder to guests who haven't replied can go a long way.",
            'You can send reminder emails right from your QuickWeds dashboard.',
        ],
        ctaText: 'Send Reminders',
        ctaPath: '/dashboard',
    },
    planner_pro_education: {
        subject: 'Unlock the full planning toolkit',
        emoji: '⚡',
        heading: 'Go Pro when you need more room',
        bodyLines: [
            "You've been using QuickWeds for a while now — love to see it! Planner Pro gives you more guest emails, advanced planning tools, and fewer limits.",
            'Upgrade whenever you are ready to take the limits off.',
        ],
        ctaText: 'See Planner Pro',
        ctaPath: '/settings',
    },
    wedding_countdown: {
        subject: 'The big day is almost here! 🎉',
        emoji: '⏳',
        heading: "It's almost time!",
        bodyLines: [
            'Your wedding day is right around the corner. Make sure everything is set — check your guest list, send final reminders, and review your wedding page.',
            "We're cheering for you every step of the way.",
        ],
        ctaText: 'Final Check',
        ctaPath: '/dashboard',
    },
    post_wedding_followup: {
        subject: 'Congratulations! Send your thank-you notes 💖',
        emoji: '💖',
        heading: 'Congratulations on your wedding!',
        bodyLines: [
            "We hope your day was absolutely magical. Now it's the perfect time to send thank-you notes to your guests.",
            'QuickWeds makes it easy to send personalized thank-you emails right from your dashboard.',
        ],
        ctaText: 'Send Thank-You Notes',
        ctaPath: '/dashboard',
    },
};

export async function executeLifecycleTask(
    db: ReturnType<typeof getSupabaseAdminClient>,
    task: LifecycleTask,
    dryRun = false
): Promise<{ success: boolean; action: string; emailId?: string; error?: string }> {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.quickweds.site').replace(/\/+$/, '');
    const stageConfig = STAGE_EMAILS[task.lifecycleStage];

    if (!stageConfig) {
        return { success: false, action: 'skipped', error: `Unknown lifecycle stage: ${task.lifecycleStage}` };
    }

    // For welcome emails, use the existing dedicated template
    let subject: string;
    let html: string;

    if (task.lifecycleStage === 'welcome') {
        subject = stageConfig.subject;
        html = getWelcomeEmailHtml(task.userName || 'there');
    } else {
        subject = stageConfig.subject;
        html = lifecycleEmailHtml({
            emoji: stageConfig.emoji,
            heading: stageConfig.heading,
            userName: task.userName || 'there',
            bodyLines: stageConfig.bodyLines,
            ctaText: stageConfig.ctaText,
            ctaUrl: `${appUrl}${stageConfig.ctaPath}`,
        });
    }

    if (dryRun) {
        return { success: true, action: `dry_run:${task.lifecycleStage}` };
    }

    const result = await sendEmail({
        to: task.email,
        subject,
        html,
    });

    return {
        success: result.success,
        action: `sent:${task.lifecycleStage}`,
        emailId: result.success ? (result as any).id : undefined,
        error: result.success ? undefined : (result as any).error,
    };
}

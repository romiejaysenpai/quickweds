import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { sendEmail } from '@/lib/email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const DEFAULT_TITLE = 'New QuickWeds updates are live';
const DEFAULT_MESSAGE = [
    'Your Planner now includes a richer checklist, 12-month wedding plan, calendar schedules, Google Calendar connection, Food & Drinks planning, Honeymoon planning, and improved photo uploads.',
    'Account Pro also unlocks planner access across owned weddings and more wedding websites.',
].join(' ');
const DEFAULT_LINK = '/dashboard';

type BroadcastBody = {
    dryRun?: boolean;
    sendEmail?: boolean;
    title?: string;
    message?: string;
    link?: string;
    limit?: number;
};

function sanitizeText(value: unknown, fallback: string, maxLength: number) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function getUpdateEmailHtml(message: string, link: string) {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.quickweds.site').replace(/\/+$/, '');
    const href = `${appUrl}${link.startsWith('/') ? link : `/${link}`}`;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; color: #3A2A2D;">
            <p style="margin: 0 0 8px; color: #D16C78; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px;">QuickWeds Update</p>
            <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">New planning tools are live</h1>
            <p style="font-size: 16px; line-height: 1.7; color: #7A5A61;">${message}</p>
            <p style="margin: 28px 0;">
                <a href="${href}" style="display: inline-block; background: #D16C78; color: #fff; padding: 14px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">Open QuickWeds</a>
            </p>
            <p style="font-size: 12px; line-height: 1.6; color: #9b7b82;">You are receiving this because you have a QuickWeds account.</p>
        </div>
    `;
}

async function listAllAuthUsers(db: any, limit?: number) {
    const users: any[] = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage });
        if (error) throw error;

        const batch = data?.users || [];
        users.push(...batch);

        if (limit && users.length >= limit) return users.slice(0, limit);
        if (batch.length < perPage) return users;
        page += 1;
    }
}

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });
    if (!isKnownAdminEmail(user.email)) {
        return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({})) as BroadcastBody;
    const dryRun = body.dryRun !== false;
    const sendEmailUpdates = body.sendEmail === true;
    const title = sanitizeText(body.title, DEFAULT_TITLE, 140);
    const message = sanitizeText(body.message, DEFAULT_MESSAGE, 1200);
    const link = sanitizeText(body.link, DEFAULT_LINK, 300);
    const limit = typeof body.limit === 'number' && body.limit > 0 ? Math.min(Math.floor(body.limit), 10000) : undefined;

    try {
        const db = getSupabaseAdminClient() as any;
        const users = (await listAllAuthUsers(db, limit))
            .filter((authUser) => authUser?.id && authUser?.email);

        if (dryRun) {
            return NextResponse.json({
                success: true,
                dryRun: true,
                userCount: users.length,
                sendEmail: sendEmailUpdates,
                title,
                message,
                link,
            });
        }

        const notificationRows = users.map((authUser) => ({
            user_id: authUser.id,
            title,
            message,
            type: 'system',
            link,
        }));

        for (let index = 0; index < notificationRows.length; index += 500) {
            const chunk = notificationRows.slice(index, index + 500);
            const { error: insertError } = await db.from('user_notifications').insert(chunk);
            if (insertError) throw insertError;
        }

        let emailSent = 0;
        const emailErrors: string[] = [];
        if (sendEmailUpdates) {
            for (const authUser of users) {
                const result = await sendEmail({
                    to: authUser.email,
                    subject: title,
                    html: getUpdateEmailHtml(message, link),
                });

                if (result.success) {
                    emailSent += 1;
                } else {
                    emailErrors.push(`${authUser.email}: ${result.error || 'failed'}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            dryRun: false,
            notified: notificationRows.length,
            emailSent,
            emailErrors: emailErrors.slice(0, 25),
            emailErrorCount: emailErrors.length,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to broadcast update.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

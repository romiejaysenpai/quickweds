import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { sendEmail } from '@/lib/email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const DEFAULT_TITLE = 'New QuickWeds update: invitation background music';
const DEFAULT_MESSAGE = [
    'You can now upload a wedding song for your invitation page. Guests can tap to open the invitation, hear the music, and keep listening while they scroll through your wedding details.',
    'Please send app feedback, questions, or error reports through the QuickWeds support form so we can keep improving the experience.',
].join(' ');
const DEFAULT_LINK = '/support';

type BroadcastBody = {
    dryRun?: boolean;
    sendEmail?: boolean;
    skipInApp?: boolean;
    title?: string;
    message?: string;
    link?: string;
    limit?: number;
    recipients?: string[];
};

function sanitizeText(value: unknown, fallback: string, maxLength: number) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(message?: string) {
    return String(message || '').toLowerCase().includes('too many requests');
}

async function sendEmailWithRetry(input: { to: string; subject: string; html: string }) {
    let lastError = '';

    for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await sendEmail(input);
        if (result.success) return result;

        lastError = result.error || 'failed';
        if (!isRateLimitError(lastError)) return result;

        await sleep(1250 * (attempt + 1));
    }

    return { success: false, error: lastError || 'failed after retries' };
}

function normalizeRecipients(values?: string[]) {
    if (!Array.isArray(values)) return [];
    return Array.from(new Set(values
        .map((value) => String(value || '').trim().toLowerCase())
        .filter((value) => value.includes('@'))));
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getUpdateEmailHtml(title: string, message: string, link: string) {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.quickweds.site').replace(/\/+$/, '');
    const normalizedLink = link.startsWith('/') ? link : '/' + link;
    const href = appUrl + normalizedLink;
    const supportHref = appUrl + '/support';
    const escapedTitle = escapeHtml(title);
    const paragraphs = message
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => '    <p style="font-size: 16px; line-height: 1.7; color: #7A5A61;">' + escapeHtml(paragraph) + '</p>');

    return [
        '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; color: #3A2A2D;">',
        '    <p style="margin: 0 0 8px; color: #D16C78; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px;">QuickWeds Update</p>',
        '    <h1 style="margin: 0 0 16px; font-family: Georgia, \'Times New Roman\', serif; font-weight: 400; font-size: 30px; line-height: 1.15; letter-spacing: -0.3px;">' + escapedTitle + '</h1>',
        ...paragraphs,
        '    <p style="margin: 28px 0;">',
        '        <a href="' + href + '" style="display: inline-block; background: #D16C78; color: #fff; padding: 14px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">Send feedback or report an issue</a>',
        '    </p>',
        '    <p style="font-size: 13px; line-height: 1.7; color: #7A5A61;">If the button does not work, open this support link: <a href="' + supportHref + '" style="color: #D16C78; font-weight: 700;">' + supportHref + '</a></p>',
        '    <p style="font-size: 12px; line-height: 1.6; color: #9b7b82;">You are receiving this because you have a QuickWeds account.</p>',
        '</div>',
    ].join('\n');
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
    const skipInApp = body.skipInApp === true;
    const title = sanitizeText(body.title, DEFAULT_TITLE, 140);
    const message = sanitizeText(body.message, DEFAULT_MESSAGE, 1200);
    const link = sanitizeText(body.link, DEFAULT_LINK, 300);
    const limit = typeof body.limit === 'number' && body.limit > 0 ? Math.min(Math.floor(body.limit), 10000) : undefined;
    const explicitRecipients = normalizeRecipients(body.recipients);

    try {
        const db = getSupabaseAdminClient() as any;
        const users = (await listAllAuthUsers(db, limit))
            .filter((authUser) => authUser?.id && authUser?.email);
        const emailRecipients = explicitRecipients.length > 0
            ? explicitRecipients
            : users.map((authUser) => String(authUser.email).trim().toLowerCase()).filter(Boolean);

        if (dryRun) {
            return NextResponse.json({
                success: true,
                dryRun: true,
                userCount: users.length,
                emailRecipientCount: emailRecipients.length,
                sendEmail: sendEmailUpdates,
                skipInApp,
                title,
                message,
                link,
            });
        }

        let notified = 0;
        if (!skipInApp) {
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
                notified += chunk.length;
            }
        }

        let emailSent = 0;
        const emailErrors: string[] = [];
        if (sendEmailUpdates) {
            for (const email of emailRecipients) {
                const result = await sendEmailWithRetry({
                    to: email,
                    subject: title,
                    html: getUpdateEmailHtml(title, message, link),
                });

                if (result.success) {
                    emailSent += 1;
                } else {
                    emailErrors.push(`${email}: ${result.error || 'failed'}`);
                }

                await sleep(250);
            }
        }

        return NextResponse.json({
            success: true,
            dryRun: false,
            notified,
            emailSent,
            emailErrors: emailErrors.slice(0, 25),
            emailErrorCount: emailErrors.length,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to broadcast update.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

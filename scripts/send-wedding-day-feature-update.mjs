import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const MAIN_COLOR = '#D16C78';
const TEXT_COLOR = '#3A2A2D';
const SECONDARY_TEXT = '#7A5A61';
const BG_COLOR = '#FFF8F4';
const DEFAULT_APP_URL = 'https://www.quickweds.site';
const DEFAULT_FROM_EMAIL = 'QuickWeds <noreply@rsvp.quickweds.site>';
const CAMPAIGN_STEP = 4;
const NEXT_SEND_DELAY_DAYS = 7;

const CAMPAIGN = {
    subject: 'New QuickWeds updates: Wedding Day Mode, QR tools, photo uploads, and thank-you emails',
    eyebrow: 'New QuickWeds features',
    heading: 'New tools for the wedding day and after',
    preview: 'Wedding Day Mode, guest check-in, QR tools, guest photo uploads, thank-you emails, and a coordinator handoff report are now available.',
    body: [
        'We have added new QuickWeds tools to help you manage the final stretch of planning, the wedding day itself, and the moments after the celebration.',
        'Wedding Day Mode now gives you quick access to guest check-in, QR codes, seating, guest photo uploads, thank-you emails, and a printable coordinator handoff report.',
        'You can also use clearer guest QR and backup-code instructions, improved seat finder links, photo reminder emails, duplicate-send protection for thank-you emails, and richer dashboard counters for check-in progress, photos, VIP guests, and table fill.',
    ],
    highlights: [
        'Wedding Day Mode with one place for event-day tools',
        'Guest check-in by search, code, or QR scan',
        'Printable and downloadable QR kit',
        'Guest photo uploads and photo reminder emails',
        'Thank-you email builder with test sends and duplicate protection',
        'Coordinator handoff report for timeline, guests, seating, VIP notes, allergies, suppliers, and balances',
    ],
    cta: 'Open your dashboard',
    path: '/dashboard',
};

function loadEnvFile(path = '.env.local') {
    try {
        const file = readFileSync(path, 'utf8');
        for (const line of file.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const index = trimmed.indexOf('=');
            if (index === -1) continue;
            const key = trimmed.slice(0, index).trim();
            let value = trimmed.slice(index + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    } catch {
        // Environment variables may already be provided by the shell or host.
    }
}

function parseArgs() {
    const args = process.argv.slice(2);
    const recipients = [];
    let limit = 0;

    for (const arg of args) {
        if (arg.startsWith('--limit=')) {
            const parsed = Number(arg.slice('--limit='.length));
            limit = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
        } else if (arg.startsWith('--to=')) {
            recipients.push(...arg.slice('--to='.length).split(/[\s,;]+/));
        }
    }

    return {
        send: args.includes('--send'),
        dryRun: !args.includes('--send'),
        includeSuppliers: args.includes('--include-suppliers'),
        limit,
        recipients: normalizeEmails(recipients),
    };
}

function escapeHtml(input) {
    return String(input || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function normalizeEmails(values) {
    return Array.from(new Set((values || [])
        .map((value) => String(value || '').trim().toLowerCase())
        .filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))));
}

function getUserName(user) {
    const metadata = user?.user_metadata || {};
    const name = metadata.full_name || metadata.name || metadata.first_name;
    if (typeof name === 'string' && name.trim()) return name.trim().split(/\s+/)[0];
    const emailName = user?.email?.split('@')[0]?.replace(/[._-]+/g, ' ');
    return emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'there';
}

function getAppUrl() {
    const configured = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
    if (configured.includes('localhost')) return DEFAULT_APP_URL;
    return configured.replace(/\/+$/, '');
}

function getNextSendAt() {
    return new Date(Date.now() + NEXT_SEND_DELAY_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunk(values, size) {
    const chunks = [];
    for (let index = 0; index < values.length; index += size) {
        chunks.push(values.slice(index, index + size));
    }
    return chunks;
}

function getEmailHtml({ userName, appUrl, unsubscribeUrl }) {
    const safeUserName = escapeHtml(userName || 'there');
    const safeCtaUrl = escapeHtml(`${appUrl}${CAMPAIGN.path}`);
    const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);
    const bodyHtml = CAMPAIGN.body.map((paragraph) => `
                        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: ${SECONDARY_TEXT};">
                            ${escapeHtml(paragraph)}
                        </p>
    `).join('');
    const highlightHtml = CAMPAIGN.highlights.map((highlight) => `
                                        <tr>
                                            <td width="22" style="padding: 5px 0; vertical-align: top; color: ${MAIN_COLOR}; font-size: 15px; font-weight: 900;">+</td>
                                            <td style="padding: 5px 0; color: ${SECONDARY_TEXT}; font-size: 14px; line-height: 1.5; font-weight: 700;">
                                                ${escapeHtml(highlight)}
                                            </td>
                                        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(CAMPAIGN.subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(CAMPAIGN.preview)}</div>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 40px auto; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px rgba(209,108,120,0.12);">
        <tr>
            <td style="padding: 0; height: 8px; background-color: ${MAIN_COLOR}; line-height: 8px; font-size: 8px;">&nbsp;</td>
        </tr>
        <tr>
            <td style="padding: 42px 44px 22px; background-color: #fffdfb;">
                <p style="margin: 0 0 12px; color: ${MAIN_COLOR}; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px;">
                    ${escapeHtml(CAMPAIGN.eyebrow)}
                </p>
                <h1 style="margin: 0; font-size: 30px; line-height: 1.2; color: ${TEXT_COLOR};">
                    ${escapeHtml(CAMPAIGN.heading)}
                </h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 44px 22px;">
                <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: ${TEXT_COLOR};">
                    Hi ${safeUserName},
                </p>
                ${bodyHtml}
            </td>
        </tr>
        <tr>
            <td style="padding: 0 44px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #fff6f1; border: 1px solid rgba(209,108,120,0.26); border-radius: 22px; overflow: hidden;">
                    <tr>
                        <td style="padding: 22px 24px;">
                            <p style="margin: 0 0 14px; color: ${MAIN_COLOR}; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; font-size: 11px;">
                                What is new
                            </p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                ${highlightHtml}
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 44px 42px;">
                <a href="${safeCtaUrl}" style="display: inline-block; padding: 16px 26px; background-color: ${MAIN_COLOR}; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 900; font-size: 15px; box-shadow: 0 12px 24px rgba(209,108,120,0.24);">
                    ${escapeHtml(CAMPAIGN.cta)}
                </a>
            </td>
        </tr>
        <tr>
            <td style="padding: 26px 44px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.6; color: #8f747a;">
                    You are receiving this because you created a QuickWeds account.
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #8f747a;">
                    <a href="${safeUnsubscribeUrl}" style="color: ${MAIN_COLOR}; text-decoration: underline;">Unsubscribe from QuickWeds marketing emails</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

async function listAllAuthUsers(db, limit) {
    const users = [];
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

async function getProfilesByUserId(db, userIds) {
    const profiles = new Map();
    for (const ids of chunk(userIds, 500)) {
        const { data, error } = await db
            .from('user_app_profiles')
            .select('user_id, account_type')
            .in('user_id', ids);
        if (error) throw error;
        for (const profile of data || []) profiles.set(profile.user_id, profile);
    }
    return profiles;
}

async function getSubscribersByUserId(db, userIds) {
    const subscribers = new Map();
    for (const ids of chunk(userIds, 500)) {
        const { data, error } = await db
            .from('marketing_nurture_subscribers')
            .select('user_id, email, status, sequence_step, unsubscribe_token')
            .in('user_id', ids);
        if (error) throw error;
        for (const subscriber of data || []) subscribers.set(subscriber.user_id, subscriber);
    }
    return subscribers;
}

async function getAlreadySentUserIds(db, userIds) {
    const sent = new Set();
    for (const ids of chunk(userIds, 500)) {
        const { data, error } = await db
            .from('marketing_nurture_events')
            .select('user_id')
            .eq('subject', CAMPAIGN.subject)
            .eq('status', 'sent')
            .in('user_id', ids);
        if (error) throw error;
        for (const event of data || []) sent.add(event.user_id);
    }
    return sent;
}

async function ensureSubscribers(db, users, existingSubscribers) {
    const rows = users
        .filter((user) => !existingSubscribers.has(user.id))
        .map((user) => ({
            user_id: user.id,
            email: String(user.email).trim().toLowerCase(),
            status: 'active',
            sequence_step: CAMPAIGN_STEP,
            next_send_at: new Date().toISOString(),
            unsubscribe_token: crypto.randomUUID(),
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));

    for (const rowsChunk of chunk(rows, 500)) {
        const { error } = await db
            .from('marketing_nurture_subscribers')
            .upsert(rowsChunk, { onConflict: 'user_id', ignoreDuplicates: true });
        if (error) throw error;
    }
}

async function insertNotifications(db, users) {
    let notified = 0;
    const rows = users.map((user) => ({
        user_id: user.id,
        title: CAMPAIGN.subject,
        message: CAMPAIGN.preview,
        type: 'system',
        link: CAMPAIGN.path,
    }));

    for (const rowsChunk of chunk(rows, 500)) {
        const { error } = await db.from('user_notifications').insert(rowsChunk);
        if (error) throw error;
        notified += rowsChunk.length;
    }

    return notified;
}

async function updateSuccessfulSubscriber(db, subscriber) {
    const now = new Date().toISOString();
    const nextStep = Math.max(Number(subscriber.sequence_step || 0), CAMPAIGN_STEP + 1);
    const { error } = await db
        .from('marketing_nurture_subscribers')
        .update({
            sequence_step: nextStep,
            last_sent_at: now,
            next_send_at: getNextSendAt(),
            updated_at: now,
        })
        .eq('user_id', subscriber.user_id);
    if (error) throw error;
}

async function logEmailEvent(db, subscriber, status, providerMessageId, errorMessage) {
    const { error } = await db.from('marketing_nurture_events').insert({
        user_id: subscriber.user_id,
        email: subscriber.email,
        sequence_step: CAMPAIGN_STEP,
        subject: CAMPAIGN.subject,
        status,
        provider_message_id: providerMessageId || null,
        error_message: errorMessage || null,
        created_at: new Date().toISOString(),
    });
    if (error) throw error;
}

async function main() {
    loadEnvFile();
    const options = parseArgs();
    const appUrl = getAppUrl();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

    if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase admin configuration.');
    if (options.send && !resendApiKey) throw new Error('Missing RESEND_API_KEY.');

    const db = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const resend = options.send ? new Resend(resendApiKey) : null;

    const allUsers = await listAllAuthUsers(db, options.limit);
    const usersWithEmail = allUsers
        .filter((user) => user?.id && normalizeEmails([user.email]).length > 0)
        .map((user) => ({ ...user, email: String(user.email).trim().toLowerCase() }));
    const filteredByRecipient = options.recipients.length > 0
        ? usersWithEmail.filter((user) => options.recipients.includes(user.email))
        : usersWithEmail;
    const profiles = await getProfilesByUserId(db, filteredByRecipient.map((user) => user.id));
    const existingSubscribers = await getSubscribersByUserId(db, filteredByRecipient.map((user) => user.id));
    const alreadySentUserIds = await getAlreadySentUserIds(db, filteredByRecipient.map((user) => user.id));

    const skippedAlreadyUnsubscribed = [];
    const skippedAlreadySent = [];
    const eligibleUsers = filteredByRecipient.filter((user) => {
        const profile = profiles.get(user.id);
        const subscriber = existingSubscribers.get(user.id);
        if (!options.includeSuppliers && profile?.account_type === 'supplier') return false;
        if (subscriber?.status === 'unsubscribed' || subscriber?.status === 'bounced') {
            skippedAlreadyUnsubscribed.push(user.email);
            return false;
        }
        if (alreadySentUserIds.has(user.id)) {
            skippedAlreadySent.push(user.email);
            return false;
        }
        return true;
    });

    if (options.dryRun) {
        console.log(JSON.stringify({
            dryRun: true,
            totalAuthUsers: allUsers.length,
            usersWithEmail: usersWithEmail.length,
            targetUsers: filteredByRecipient.length,
            eligibleUsers: eligibleUsers.length,
            skippedAlreadyUnsubscribed: skippedAlreadyUnsubscribed.length,
            skippedAlreadySent: skippedAlreadySent.length,
            includeSuppliers: options.includeSuppliers,
            recipientFilter: options.recipients.length,
            subject: CAMPAIGN.subject,
            appUrl,
        }, null, 2));
        return;
    }

    await ensureSubscribers(db, eligibleUsers, existingSubscribers);
    const subscribers = await getSubscribersByUserId(db, eligibleUsers.map((user) => user.id));
    const notified = await insertNotifications(db, eligibleUsers);

    let emailSent = 0;
    const emailErrors = [];

    for (const user of eligibleUsers) {
        const subscriber = subscribers.get(user.id);
        if (!subscriber?.unsubscribe_token) {
            emailErrors.push(`${user.email}: missing unsubscribe token`);
            continue;
        }

        const unsubscribeUrl = `${appUrl}/api/marketing/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
        const html = getEmailHtml({
            userName: getUserName(user),
            appUrl,
            unsubscribeUrl,
        });

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: user.email,
            subject: CAMPAIGN.subject,
            html,
        });

        if (error) {
            emailErrors.push(`${user.email}: ${error.message || 'failed'}`);
            await logEmailEvent(db, subscriber, 'failed', null, error.message || 'Email send failed');
        } else {
            emailSent += 1;
            await logEmailEvent(db, subscriber, 'sent', data?.id || null, null);
            await updateSuccessfulSubscriber(db, subscriber);
        }

        await sleep(250);
    }

    console.log(JSON.stringify({
        success: true,
        dryRun: false,
        notified,
        emailSent,
        emailErrorCount: emailErrors.length,
        emailErrors: emailErrors.slice(0, 25),
        skippedAlreadyUnsubscribed: skippedAlreadyUnsubscribed.length,
        skippedAlreadySent: skippedAlreadySent.length,
    }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

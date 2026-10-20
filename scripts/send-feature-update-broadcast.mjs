/**
 * Feature Update Broadcast Script
 * Sends in-app notifications and transactional emails highlighting recent QuickWeds features:
 * - Post-Wedding Memories & Disposable Camera Recap
 * - App Reviews & Couple Stories
 * - Enhanced Attire & Bridal Party Illustrations
 * - Smart RSVP Instant Search & Deadline Locks
 * - Interactive Seating Planner & QR Check-in
 * - Smart Budget Planner & Multi-currency
 * 
 * Usage:
 *   node scripts/send-feature-update-broadcast.mjs               (Dry run by default)
 *   node scripts/send-feature-update-broadcast.mjs --test        (Sends test to admin email)
 *   node scripts/send-feature-update-broadcast.mjs --to=email    (Sends test to specific email)
 *   node scripts/send-feature-update-broadcast.mjs --send-all    (Broadcasts to all registered users)
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
    } catch { }
}

loadEnvFile();

const C = {
    primary: '#D16C78',
    primaryDark: '#B85A66',
    primaryLight: '#F2D0D5',
    accent: '#D6B87C',
    bg: '#FFF8F4',
    bgSoft: '#FEF5F0',
    card: '#FFFFFF',
    text: '#2D2A2E',
    textSecondary: '#6B5E62',
    textMuted: '#9B8E92',
    border: '#F0E0E3',
    shadow: 'rgba(209,108,120,0.08)',
};

const FONT_HEADING = "'Georgia', 'Times New Roman', serif";
const FONT_BODY = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SUPABASE_IMG = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images';
const LOGO_IMG = `${SUPABASE_IMG}/Untitled%20-%2009%20July%202026%20at%2002.51.57%20(16).png`;

function esc(input) {
    return String(input ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

const UPDATE_CONTENT = {
    subject: "✨ What's New in QuickWeds: Post-Wedding Memories, Community Reviews, & Smarter Planning",
    eyebrow: 'QuickWeds Product Update',
    heading: 'New Features for Your Big Day & Beyond',
    intro: "Over the past weeks, we've rolled out major enhancements across QuickWeds—designed to make planning simpler before the wedding, smoother on the big day, and unforgettable afterward.",
    inAppTitle: '✨ New Features Released!',
    inAppMessage: "We've added Post-Wedding Memories recap, App Reviews & Couple Stories, enhanced Attire guides, instant RSVP search, and interactive seating tools. Tap to explore!",
    inAppLink: '/dashboard',
    features: [
        {
            icon: '📸',
            title: 'Post-Wedding Memories & Disposable Camera Recap',
            desc: 'Relive your wedding day! Showcase guest photo uploads and digital guestbook notes on your wedding site with elegant Polaroid or Grid photo styling.',
        },
        {
            icon: '⭐',
            title: 'App Reviews & Couple Stories',
            desc: 'Share your wedding journey, advice, and rating with our growing community. Features verified couple badges and 1-click moderation.',
        },
        {
            icon: '👗',
            title: 'Visual Attire Guide & Wedding Party Styling',
            desc: 'Help guests dress with confidence. Includes illustrated silhouettes, color palette swatches, and customizable bridal party attire cards.',
        },
        {
            icon: '💌',
            title: 'Smart RSVP Instant Search & Deadline Locks',
            desc: 'Guests can find their invitations in seconds with real-time search. Set automated deadline countdowns and locks to finalize catering on time.',
        },
        {
            icon: '🪑',
            title: 'Interactive Seating Planner & QR Check-in',
            desc: 'Drag-and-drop table layouts with live seat counts, table lookup links, and fast QR check-in with coordinator handoff reports.',
        },
        {
            icon: '💰',
            title: 'Smart Budget & Expense Tracker',
            desc: 'Keep wedding costs clear. Allocate budgets by category, record payment milestones, and track remaining balances effortlessly.',
        },
    ],
    ctaText: 'Explore New Features in Dashboard',
};

function buildUpdateEmailHtml(appUrl, recipientName = 'there') {
    const dashboardUrl = `${appUrl}/dashboard`;
    const supportUrl = `${appUrl}/support`;
    const unsubscribeUrl = `${appUrl}/api/marketing/unsubscribe`;

    const featuresHtml = UPDATE_CONTENT.features.map(f => `
        <tr>
            <td style="padding:14px 0;border-bottom:1px solid ${C.border};">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td width="44" valign="top" style="font-size:26px;line-height:1;padding-right:12px;">
                            ${f.icon}
                        </td>
                        <td valign="top">
                            <h3 style="margin:0 0 4px;font-size:16px;font-weight:700;color:${C.text};font-family:${FONT_BODY};">
                                ${esc(f.title)}
                            </h3>
                            <p style="margin:0;font-size:14px;line-height:1.6;color:${C.textSecondary};font-family:${FONT_BODY};">
                                ${esc(f.desc)}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${esc(UPDATE_CONTENT.subject)}</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        @media only screen and (max-width: 640px) {
            .qw-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .qw-full-button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .qw-h1 { font-size: 26px !important; line-height: 1.2 !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;font-family:${FONT_BODY};background-color:${C.bg};color:${C.text};width:100% !important;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg};opacity:0;">${esc(UPDATE_CONTENT.intro)}</div>
    <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background-color:${C.card};overflow:hidden;border:1px solid ${C.border};">
        <tr>
            <td align="center" style="padding:32px 40px 24px;background-color:${C.card};">
                <img src="${LOGO_IMG}" alt="QuickWeds" width="120" style="display:block;width:120px;height:auto;border:0;" />
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:20px 44px 12px;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${C.primary};font-family:${FONT_BODY};">${esc(UPDATE_CONTENT.eyebrow)}</p>
                <h1 class="qw-h1" style="margin:0;font-size:30px;line-height:1.2;font-weight:400;color:${C.text};font-family:${FONT_HEADING};">${esc(UPDATE_CONTENT.heading)}</h1>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:0 44px 20px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:${C.textSecondary};font-family:${FONT_BODY};">
                    Hi ${esc(recipientName)},
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${C.textSecondary};font-family:${FONT_BODY};">
                    ${esc(UPDATE_CONTENT.intro)}
                </p>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:0 44px 28px;">
                <div style="background-color:#FFFDFC;border-radius:20px;padding:24px 28px;border:1px solid ${C.border};box-shadow:0 4px 16px ${C.shadow};">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        ${featuresHtml}
                    </table>
                </div>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" align="center" style="padding:8px 44px 36px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="border-radius:14px;background-color:${C.primary};box-shadow:0 8px 24px rgba(209,108,120,0.28);">
                            <a class="qw-full-button" href="${dashboardUrl}" target="_blank" style="display:block;width:100%;box-sizing:border-box;padding:18px 36px;color:#ffffff;text-decoration:none;font-family:${FONT_BODY};font-weight:700;font-size:16px;text-align:center;border-radius:14px;letter-spacing:0.3px;">
                                ${esc(UPDATE_CONTENT.ctaText)} &rarr;
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" align="center" style="padding:0 44px 28px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:${C.textMuted};font-family:${FONT_BODY};">
                    Have questions or need assistance with your wedding? Reach out anytime via our <a href="${supportUrl}" style="color:${C.primary};text-decoration:underline;">Support Hub</a>.
                </p>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:32px 40px;background-color:${C.bgSoft};border-top:1px solid ${C.border};">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><td align="center" style="padding-bottom:12px;"><img src="${LOGO_IMG}" alt="QuickWeds" width="90" style="display:inline-block;width:90px;height:auto;border:0;opacity:0.6;" /></td></tr>
                    <tr><td align="center"><p style="margin:0;font-size:13px;line-height:1.6;color:${C.textSecondary};font-family:${FONT_BODY};">The easiest way to plan your big day</p></td></tr>
                    <tr><td align="center" style="padding-top:14px;"><p style="margin:0;font-size:11px;color:${C.textMuted};font-family:${FONT_BODY};">&copy; 2026 QuickWeds. All rights reserved.</p></td></tr>
                    <tr><td align="center" style="padding-top:8px;"><p style="margin:0;font-size:11px;color:${C.textMuted};font-family:${FONT_BODY};"><a href="${unsubscribeUrl}" style="color:${C.primary};text-decoration:underline;">Unsubscribe from feature announcements</a></p></td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function main() {
    const args = process.argv.slice(2);
    const isTest = args.includes('--test');
    const sendAll = args.includes('--send-all');
    const inAppOnly = args.includes('--in-app-only');

    let customTo = '';
    for (const a of args) {
        if (a.startsWith('--to=')) customTo = a.slice('--to='.length).trim();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quickweds.site').replace(/\/+$/, '');
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase configuration missing in .env.local');
    }

    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    console.log('\n======================================================');
    console.log('       QuickWeds Feature Update Broadcast Engine       ');
    console.log('======================================================\n');
    console.log(`App URL:     ${appUrl}`);
    console.log(`From Email:  ${fromEmail}`);

    // Mode determination
    if (isTest || customTo) {
        const testRecipient = customTo || process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'romiejaybacasmas@gmail.com';
        console.log(`Mode:        🧪 TEST SEND to: ${testRecipient}\n`);

        if (!resendApiKey) throw new Error('RESEND_API_KEY missing');
        const resend = new Resend(resendApiKey);

        const html = buildUpdateEmailHtml(appUrl, 'Admin');
        console.log(`Sending test email: "${UPDATE_CONTENT.subject}" to ${testRecipient}...`);
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: testRecipient,
            subject: `[TEST] ${UPDATE_CONTENT.subject}`,
            html,
        });

        if (error) {
            console.error('❌ Failed to send test email:', error.message);
        } else {
            console.log(`✅ Test email delivered successfully! Resend ID: ${data?.id}`);
        }

        // Test in-app notification insertion for admin user
        const { data: adminUsers } = await db.auth.admin.listUsers({ page: 1, perPage: 10 });
        const adminUser = adminUsers?.users?.find(u => u.email?.toLowerCase() === testRecipient.toLowerCase());
        if (adminUser) {
            console.log(`Creating test in-app notification for user ID: ${adminUser.id}...`);
            const { error: notifErr } = await db.from('user_notifications').insert({
                user_id: adminUser.id,
                title: UPDATE_CONTENT.inAppTitle,
                message: UPDATE_CONTENT.inAppMessage,
                type: 'system',
                link: UPDATE_CONTENT.inAppLink,
            });
            if (notifErr) {
                console.error('❌ Failed in-app notification:', notifErr.message);
            } else {
                console.log('✅ In-app test notification created!');
            }
        }

        console.log('\nDone!\n');
        return;
    }

    // Fetch all registered users
    console.log('Fetching all registered users from auth...');
    const allUsers = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        const batch = data?.users || [];
        allUsers.push(...batch);
        if (batch.length < perPage) break;
        page++;
    }

    const validUsers = allUsers.filter(u => u?.id && u?.email && u.email.includes('@'));
    console.log(`Found ${validUsers.length} total active users.\n`);

    if (!sendAll) {
        console.log('👀 DRY RUN MODE (Safe Preview)');
        console.log('--------------------------------------------------');
        console.log(`Target users for in-app notification: ${validUsers.length}`);
        console.log(`Target users for email broadcast:      ${validUsers.length}`);
        console.log(`Email Subject:                         ${UPDATE_CONTENT.subject}`);
        console.log(`In-app Title:                          ${UPDATE_CONTENT.inAppTitle}`);
        console.log(`In-app Message:                        ${UPDATE_CONTENT.inAppMessage}`);
        console.log('--------------------------------------------------');
        console.log('\nTo broadcast to all users, run:');
        console.log('  node scripts/send-feature-update-broadcast.mjs --send-all\n');
        console.log('To send a live test to yourself first, run:');
        console.log('  node scripts/send-feature-update-broadcast.mjs --test\n');
        return;
    }

    // LIVE BROADCAST TO ALL REGISTERED USERS
    console.log(`🚀 STARTING LIVE BROADCAST TO ${validUsers.length} USERS...`);

    // 1. Dispatch In-App Notifications
    console.log('\nStep 1: Inserting In-App Notifications...');
    const notificationRows = validUsers.map(u => ({
        user_id: u.id,
        title: UPDATE_CONTENT.inAppTitle,
        message: UPDATE_CONTENT.inAppMessage,
        type: 'system',
        link: UPDATE_CONTENT.inAppLink,
    }));

    let notifCount = 0;
    const CHUNK_SIZE = 500;
    for (let i = 0; i < notificationRows.length; i += CHUNK_SIZE) {
        const chunk = notificationRows.slice(i, i + CHUNK_SIZE);
        const { error: insertErr } = await db.from('user_notifications').insert(chunk);
        if (insertErr) {
            console.error(`❌ Batch insert failed at offset ${i}:`, insertErr.message);
        } else {
            notifCount += chunk.length;
            console.log(`  Inserted ${notifCount} / ${notificationRows.length} in-app notifications`);
        }
    }

    if (inAppOnly) {
        console.log('\n✅ In-app notifications completed. Skipped emails as requested (--in-app-only).\n');
        return;
    }

    // 2. Dispatch Emails via Resend
    console.log('\nStep 2: Dispatching Emails via Resend...');
    if (!resendApiKey) throw new Error('RESEND_API_KEY missing');
    const resend = new Resend(resendApiKey);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (let i = 0; i < validUsers.length; i++) {
        const user = validUsers[i];
        const email = user.email.trim().toLowerCase();
        const metadata = user.user_metadata || {};
        const name = (metadata.full_name || metadata.name || metadata.first_name || email.split('@')[0] || 'there').split(' ')[0];

        const html = buildUpdateEmailHtml(appUrl, name);

        try {
            const { data, error } = await resend.emails.send({
                from: fromEmail,
                to: email,
                subject: UPDATE_CONTENT.subject,
                html,
            });

            if (error) {
                console.warn(`  [${i + 1}/${validUsers.length}] ❌ Failed ${email}: ${error.message}`);
                emailsFailed++;
            } else {
                emailsSent++;
                if ((i + 1) % 10 === 0 || i + 1 === validUsers.length) {
                    console.log(`  [${i + 1}/${validUsers.length}] ✅ Sent (${emailsSent} successful, ${emailsFailed} failed)`);
                }
            }
        } catch (err) {
            console.warn(`  [${i + 1}/${validUsers.length}] ❌ Exception ${email}: ${err.message}`);
            emailsFailed++;
        }

        // 250ms delay to respect Resend rate limits
        await sleep(250);
    }

    console.log('\n======================================================');
    console.log(`🎉 Broadcast Completed!`);
    console.log(`   In-App Notifications created: ${notifCount}`);
    console.log(`   Emails Sent successfully:     ${emailsSent}`);
    console.log(`   Emails Failed:                ${emailsFailed}`);
    console.log('======================================================\n');
}

main().catch(err => {
    console.error('Broadcast failed:', err);
    process.exit(1);
});

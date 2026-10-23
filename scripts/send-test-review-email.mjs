/**
 * Send a test email for a newly received couple review to admin.
 * Verifies the email template, 1-click moderation links, and Resend delivery.
 * 
 * Usage:
 *   node scripts/send-test-review-email.mjs --send
 *   node scripts/send-test-review-email.mjs --send --email=your@email.com
 */

import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
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

function getReviewSecret() {
    return (
        process.env.APP_REVIEW_SECRET ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        'quickweds-app-review-secret-key-2026'
    );
}

function signReviewAction(reviewId, action, expires) {
    const secret = getReviewSecret();
    return crypto
        .createHmac('sha256', secret)
        .update(`${reviewId}:${action}:${expires}`)
        .digest('hex');
}

function buildModerationUrl(appUrl, reviewId, action, expiresAt) {
    const expires = String(expiresAt.getTime());
    const token = signReviewAction(reviewId, action, expires);
    const params = new URLSearchParams({
        reviewId,
        action,
        expires,
        token,
    });
    return `${appUrl}/api/reviews/moderate?${params.toString()}`;
}

function buildAdminReviewNotificationHtml({
    id,
    coupleNames,
    weddingRole,
    detail,
    rating,
    quote,
    story,
    approveUrl,
    featureUrl,
    rejectUrl,
    adminHubUrl,
}) {
    const stars = Math.min(5, Math.max(1, Number(rating) || 5));
    const starString = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    const subject = `⭐ [TEST] New Review: "${coupleNames}" (${stars} Stars) - Approval Needed`;
    const previewText = `New couple review submitted by ${coupleNames} (${stars} / 5 stars). 1-click moderation inside.`;

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${esc(subject)}</title>
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
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg};opacity:0;">${esc(previewText)}</div>
    <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background-color:${C.card};overflow:hidden;border:1px solid ${C.border};">
        <tr>
            <td align="center" style="padding:32px 40px 24px;background-color:${C.card};">
                <img src="${LOGO_IMG}" alt="QuickWeds" width="120" style="display:block;width:120px;height:auto;border:0;" />
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:24px 44px 16px;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${C.primary};font-family:${FONT_BODY};">QuickWeds Admin &bull; Review Moderation</p>
                <h1 class="qw-h1" style="margin:0;font-size:30px;line-height:1.2;font-weight:400;color:${C.text};font-family:${FONT_HEADING};">New Couple Review Received</h1>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:0 44px 20px;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${C.textSecondary};font-family:${FONT_BODY};">
                    A couple has just submitted a review on QuickWeds. Because all reviews require admin verification before appearing publicly on the landing page, you can approve or feature it with 1 click below.
                </p>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:0 44px 28px;">
                <div style="background-color:#FFFDFC;border-radius:20px;padding:28px;border:1px solid ${C.border};box-shadow:0 4px 16px ${C.shadow};">
                    <div style="margin-bottom:12px;">
                        <span style="font-size:24px;color:#F59E0B;letter-spacing:3px;">${esc(starString)}</span>
                        <span style="font-size:14px;font-weight:700;color:${C.textSecondary};margin-left:8px;font-family:${FONT_BODY};">${stars} / 5</span>
                    </div>
                    <p style="margin:0 0 14px;font-size:18px;line-height:1.5;font-weight:700;color:${C.text};font-family:${FONT_HEADING};">&ldquo;${esc(quote)}&rdquo;</p>
                    ${story ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:${C.textSecondary};font-family:${FONT_BODY};white-space:pre-wrap;">${esc(story)}</p>` : ''}
                    <div style="border-top:1px solid ${C.border};padding-top:14px;margin-top:14px;">
                        <p style="margin:0;font-size:15px;font-weight:700;color:${C.primary};font-family:${FONT_BODY};">${esc(coupleNames)}</p>
                        <p style="margin:2px 0 0;font-size:12px;color:${C.textMuted};font-family:${FONT_BODY};">${esc(weddingRole || 'Couple')}${detail ? ` &bull; ${esc(detail)}` : ''}</p>
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:0 44px 12px;">
                <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${C.textMuted};text-align:center;font-family:${FONT_BODY};">1-Click Actions</p>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding-bottom:10px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="border-radius:14px;background-color:#10B981;box-shadow:0 6px 18px rgba(16,185,129,0.25);">
                                        <a class="qw-full-button" href="${esc(approveUrl)}" target="_blank" style="display:block;width:100%;box-sizing:border-box;padding:16px 24px;color:#ffffff;text-decoration:none;font-family:${FONT_BODY};font-weight:700;font-size:15px;text-align:center;border-radius:14px;">
                                            &#10003; Approve &amp; Post to Landing Page
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom:10px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="border-radius:14px;background-color:${C.primary};box-shadow:0 6px 18px rgba(209,108,120,0.25);">
                                        <a class="qw-full-button" href="${esc(featureUrl)}" target="_blank" style="display:block;width:100%;box-sizing:border-box;padding:14px 24px;color:#ffffff;text-decoration:none;font-family:${FONT_BODY};font-weight:700;font-size:14px;text-align:center;border-radius:14px;">
                                            &#9733; Approve &amp; Feature as Top Testimonial
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="border-radius:12px;background-color:#FEE2E2;border:1px solid #FECACA;">
                                        <a class="qw-full-button" href="${esc(rejectUrl)}" target="_blank" style="display:block;width:100%;box-sizing:border-box;padding:11px 24px;color:#DC2626;text-decoration:none;font-family:${FONT_BODY};font-weight:700;font-size:13px;text-align:center;border-radius:12px;">
                                            &#10005; Reject / Dismiss Review
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" align="center" style="padding:16px 44px 36px;">
                <p style="margin:0 0 10px;font-size:13px;color:${C.textSecondary};font-family:${FONT_BODY};">
                    Prefer to review all entries together? <a href="${esc(adminHubUrl)}" style="color:${C.primary};font-weight:700;text-decoration:underline;">Open Admin Reviews Hub &rarr;</a>
                </p>
                <p style="margin:0;font-size:11px;color:${C.textMuted};font-family:${FONT_BODY};">These 1-click links are cryptographically signed with HMAC-SHA256 and expire in 30 days.</p>
            </td>
        </tr>
        <tr>
            <td class="qw-pad" style="padding:36px 40px;background-color:${C.bgSoft};border-top:1px solid ${C.border};">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><td align="center" style="padding-bottom:14px;"><img src="${LOGO_IMG}" alt="QuickWeds" width="100" style="display:inline-block;width:100px;height:auto;border:0;opacity:0.6;" /></td></tr>
                    <tr><td align="center"><p style="margin:0;font-size:13px;line-height:1.6;color:${C.textSecondary};font-family:${FONT_BODY};">The easiest way to plan your big day</p></td></tr>
                    <tr><td align="center" style="padding-top:14px;"><p style="margin:0;font-size:11px;color:${C.textMuted};font-family:${FONT_BODY};">&copy; 2026 QuickWeds. All rights reserved.</p></td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { subject, html };
}

async function main() {
    const args = process.argv.slice(2);
    const doSend = args.includes('--send');

    let customEmail = '';
    for (const a of args) {
        if (a.startsWith('--email=')) customEmail = a.slice('--email='.length).trim();
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quickweds.site';
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

    const recipientList = customEmail
        ? [customEmail]
        : [
            process.env.ADMIN_EMAIL,
            process.env.NEXT_PUBLIC_ADMIN_EMAIL,
            ...(process.env.ADMIN_EMAILS || '').split(','),
        ]
            .filter(Boolean)
            .map(e => e.trim())
            .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const uniqueRecipients = Array.from(new Set(recipientList));

    if (uniqueRecipients.length === 0) {
        uniqueRecipients.push('support@quickweds.site');
    }

    const reviewId = `test-review-${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const approveUrl = buildModerationUrl(appUrl, reviewId, 'approve', expiresAt);
    const featureUrl = buildModerationUrl(appUrl, reviewId, 'approve_and_feature', expiresAt);
    const rejectUrl = buildModerationUrl(appUrl, reviewId, 'reject', expiresAt);
    const adminHubUrl = `${appUrl}/admin/reviews`;

    const sampleReview = {
        id: reviewId,
        coupleNames: 'Samantha & Marc',
        weddingRole: 'Bride & Groom',
        detail: 'Planned a 150-guest romantic garden wedding',
        rating: 5,
        quote: 'QuickWeds transformed our entire planning experience! Having RSVPs, custom attire guides, and the seating chart in one place saved us dozens of hours.',
        story: 'Our guests could easily RSVP on mobile, pick dietary options, and upload disposable camera memories. We loved the clean dashboard and real-time updates.',
        approveUrl,
        featureUrl,
        rejectUrl,
        adminHubUrl,
    };

    const { subject, html } = buildAdminReviewNotificationHtml(sampleReview);

    console.log('\n--- QuickWeds Review Moderation Email Test ---');
    console.log(`  App URL:      ${appUrl}`);
    console.log(`  From:         ${fromEmail}`);
    console.log(`  Recipients:   ${uniqueRecipients.join(', ')}`);
    console.log(`  Subject:      ${subject}`);
    console.log(`  Mode:         ${doSend ? '🚀 LIVE SEND VIA RESEND' : '👀 DRY RUN (pass --send to deliver)'}\n`);

    if (!doSend) {
        console.log('Sample Moderation URLs:');
        console.log(`  Approve:  ${approveUrl}`);
        console.log(`  Feature:  ${featureUrl}`);
        console.log(`  Reject:   ${rejectUrl}\n`);
        console.log('To send the live test email, run:');
        console.log('  node scripts/send-test-review-email.mjs --send\n');
        return;
    }

    if (!resendApiKey) {
        throw new Error('RESEND_API_KEY is not set in environment or .env.local');
    }

    const resend = new Resend(resendApiKey);

    for (const recipient of uniqueRecipients) {
        console.log(`Sending to: ${recipient}...`);
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: recipient,
            subject,
            html,
        });

        if (error) {
            console.error(`  ❌ Failed sending to ${recipient}:`, error.message);
        } else {
            console.log(`  ✅ Successfully sent! Resend Email ID: ${data?.id}`);
        }
    }

    console.log('\nDone!\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

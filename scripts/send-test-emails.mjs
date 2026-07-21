/**
 * Send test emails with Supabase-hosted images to the admin email.
 * Images are loaded directly from Supabase storage URLs.
 * 
 * Usage:
 *   node scripts/send-test-emails.mjs --send
 *   node scripts/send-test-emails.mjs --send --email=you@email.com
 */

import { readFileSync } from 'node:fs';
import { Resend } from 'resend';

const MAIN_COLOR = '#D16C78';
const TEXT_COLOR = '#3A2A2D';
const SECONDARY_TEXT = '#7A5A61';
const BG_COLOR = '#FFF8F4';
const ACCENT_COLOR = '#4A4444';
const DEFAULT_FROM_EMAIL = 'QuickWeds <noreply@rsvp.quickweds.site>';
const APP_URL = 'https://quickweds.site';

const S = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images';
const IMG = {
    logo: `${S}/Untitled%20-%2009%20July%202026%20at%2002.51.57%20(16).png`,
    welcome: `${S}/Wedding%20Website%20Builder.png`,
    rsvp: `${S}/Smart%20RSVP%20Management.png`,
    reminder: `${S}/2df72133-22a1-4b56-9612-38513a3c3ef3.png`,
    nurture1: `${S}/Wedding%20Website%20Builder.png`,
    nurture2: `${S}/Smart%20RSVP%20Management.png`,
    nurture3: `${S}/253b06e1-93cf-446c-a0fe-b3397777c185.png`,
    nurture4: `${S}/5a359c30-69de-4483-aa9b-aa0a0c011b78%20(1).png`,
    nurture5: `${S}/5fb8ca9e-86fb-40cc-9d53-ae8292da501c.png`,
    collab: `${S}/COLABORATION%20TOOLS.png`,
    thankyou: `${S}/079f3b98-6106-45fe-8d55-407f65fe4d9f.png`,
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
    } catch { }
}

function esc(input) {
    return String(input || '').replaceAll('&', '&').replaceAll('<', '<').replaceAll('>', '>').replaceAll('"', '"').replaceAll("'", '&#39;');
}

function logo(w = 120) {
    return `<img src="${IMG.logo}" alt="QuickWeds" width="${w}" style="display:block;width:${w}px;height:auto;border:0;" />`;
}

function hero(src, alt = '') {
    return `<tr><td style="padding:0;line-height:0;font-size:0;"><img src="${src}" alt="${alt}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" /></td></tr>`;
}

function footer(extra = '') {
    return `<tr><td style="padding:36px 40px;background-color:#faf8f7;border-top:1px solid #f0e8ea;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-bottom:18px;"><img src="${IMG.logo}" alt="QuickWeds" width="100" style="display:inline-block;width:100px;height:auto;border:0;opacity:0.7;" /></td></tr><tr><td align="center"><p style="margin:0;font-size:13px;line-height:1.6;color:${SECONDARY_TEXT};">The easiest way to plan your big day</p></td></tr>${extra ? `<tr><td align="center" style="padding-top:14px;">${extra}</td></tr>` : ''}<tr><td align="center" style="padding-top:16px;"><p style="margin:0;font-size:11px;color:#bbb5b7;letter-spacing:0.5px;">&copy; 2026 QuickWeds. All rights reserved.</p></td></tr></table></td></tr>`;
}

function cta(url, label) {
    return `<tr><td align="center" style="padding:8px 44px 44px;"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" style="border-radius:14px;background-color:${MAIN_COLOR};box-shadow:0 8px 24px ${MAIN_COLOR}44;"><a href="${url}" target="_blank" style="display:inline-block;padding:18px 44px;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:16px;letter-spacing:0.3px;border-radius:14px;">${esc(label)}</a></td></tr></table></td></tr>`;
}

function wrap(inner) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:${BG_COLOR};color:${TEXT_COLOR};-webkit-text-size-adjust:100%;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;overflow:hidden;">${inner}</table></body></html>`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Templates ──────────────────────────────────────────────────

const emails = [
    {
        subject: '✨ [TEST] Welcome to QuickWeds — With QuickWeds Logo & Images',
        html: wrap(`
            <tr><td align="center" style="padding:28px 40px 20px;background-color:#ffffff;">${logo(120)}</td></tr>
            ${hero(IMG.welcome, 'Welcome to QuickWeds')}
            <tr><td align="center" style="padding:40px 44px 8px;background-color:#ffffff;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${MAIN_COLOR};">Welcome Aboard</p>
                <h1 style="margin:0;font-size:30px;font-weight:300;color:${TEXT_COLOR};letter-spacing:-0.3px;">Your Wedding Journey Starts Here</h1>
            </td></tr>
            <tr><td style="padding:24px 44px 16px;">
                <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:${SECONDARY_TEXT};">Hi there, we're so honored to be part of your wedding journey! QuickWeds was built to make your invitations as beautiful as your love story&mdash;without the stress.</p>
                <h3 style="margin:0 0 24px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${MAIN_COLOR};">Getting Started in 4 Simple Steps</h3>
            </td></tr>
            <tr><td style="padding:0 44px 36px;"><table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td width="52" valign="top"><div style="width:38px;height:38px;line-height:38px;text-align:center;border-radius:12px;background:${MAIN_COLOR};color:#ffffff;font-weight:800;font-size:16px;">1</div></td><td style="padding-left:14px;padding-bottom:24px;"><p style="margin:0;font-size:15px;font-weight:700;color:${TEXT_COLOR};">Pick Your Vibe</p><p style="margin:5px 0 0;font-size:14px;color:${SECONDARY_TEXT};line-height:1.5;">Browse our designer templates&mdash;from Vintage to Modern.</p></td></tr>
                <tr><td width="52" valign="top"><div style="width:38px;height:38px;line-height:38px;text-align:center;border-radius:12px;background:${MAIN_COLOR};color:#ffffff;font-weight:800;font-size:16px;">2</div></td><td style="padding-left:14px;padding-bottom:24px;"><p style="margin:0;font-size:15px;font-weight:700;color:${TEXT_COLOR};">Tell Your Story</p><p style="margin:5px 0 0;font-size:14px;color:${SECONDARY_TEXT};line-height:1.5;">Fill in your details, venue location, and that special date.</p></td></tr>
                <tr><td width="52" valign="top"><div style="width:38px;height:38px;line-height:38px;text-align:center;border-radius:12px;background:${MAIN_COLOR};color:#ffffff;font-weight:800;font-size:16px;">3</div></td><td style="padding-left:14px;padding-bottom:24px;"><p style="margin:0;font-size:15px;font-weight:700;color:${TEXT_COLOR};">Add the Magic</p><p style="margin:5px 0 0;font-size:14px;color:${SECONDARY_TEXT};line-height:1.5;">Upload your photos and choose custom accents.</p></td></tr>
                <tr><td width="52" valign="top"><div style="width:38px;height:38px;line-height:38px;text-align:center;border-radius:12px;background:${MAIN_COLOR};color:#ffffff;font-weight:800;font-size:16px;">4</div></td><td style="padding-left:14px;"><p style="margin:0;font-size:15px;font-weight:700;color:${TEXT_COLOR};">Go Live</p><p style="margin:5px 0 0;font-size:14px;color:${SECONDARY_TEXT};line-height:1.5;">Preview, publish, and share your wedding link!</p></td></tr>
            </table></td></tr>
            ${cta(`${APP_URL}/builder`, 'Start Building Now')}
            ${footer(`<p style="margin:0;font-size:12px;color:#b0969b;">With love from the <strong style="color:${MAIN_COLOR};">QuickWeds</strong> Team</p>`)}`),
    },
    {
        subject: '💌 [TEST] RSVP Confirmation — With QuickWeds Logo & Images',
        html: wrap(`
            <tr><td align="center" style="padding:28px 40px 20px;background-color:#ffffff;">${logo(120)}</td></tr>
            ${hero(IMG.rsvp, 'RSVP Confirmation')}
            <tr><td align="center" style="padding:40px 44px 12px;background-color:#ffffff;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${MAIN_COLOR};">RSVP Confirmed</p>
                <h1 style="margin:0;font-size:30px;font-weight:300;color:${TEXT_COLOR};letter-spacing:-0.3px;line-height:1.2;">We're so excited!</h1>
                <p style="margin:10px 0 0;font-size:17px;color:${SECONDARY_TEXT};font-style:italic;">Sarah & James' Wedding</p>
            </td></tr>
            <tr><td style="padding:20px 44px 36px;"><div style="background-color:${BG_COLOR};border-radius:20px;padding:32px;border:1px solid rgba(209,108,120,0.1);">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:${TEXT_COLOR};">Hi <strong>Emma</strong>,</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:${SECONDARY_TEXT};">Thank you for RSVPing! We've saved a spot for <strong style="color:${TEXT_COLOR};">2 guests</strong>. We can't wait to celebrate this special day with you.</p>
                <div style="border-top:1px solid rgba(209,108,120,0.1);padding-top:28px;margin-top:4px;">
                    <h3 style="margin:0 0 20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${MAIN_COLOR};">Wedding Details</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr><td width="44" valign="top"><div style="width:36px;height:36px;border-radius:10px;background-color:${MAIN_COLOR}18;text-align:center;line-height:36px;font-size:16px;">📅</div></td><td style="padding-left:14px;padding-bottom:22px;"><p style="margin:0;font-size:12px;color:${SECONDARY_TEXT};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Date & Time</p><p style="margin:4px 0 0;font-size:16px;font-weight:700;color:${TEXT_COLOR};">June 15, 2026 at 4:00 PM</p></td></tr>
                        <tr><td width="44" valign="top"><div style="width:36px;height:36px;border-radius:10px;background-color:${MAIN_COLOR}18;text-align:center;line-height:36px;font-size:16px;">📍</div></td><td style="padding-left:14px;"><p style="margin:0;font-size:12px;color:${SECONDARY_TEXT};text-transform:uppercase;letter-spacing:1px;font-weight:600;">The Venue</p><p style="margin:4px 0 0;font-size:16px;font-weight:700;color:${TEXT_COLOR};">The Grand Ballroom</p><p style="margin:4px 0 0;font-size:14px;color:${SECONDARY_TEXT};line-height:1.4;">123 Wedding Lane, Manila, Philippines</p></td></tr>
                    </table>
                </div>
            </div></td></tr>
            ${cta(`${APP_URL}/demo`, 'View Full Invitation')}
            ${footer(`<p style="margin:0;font-size:12px;color:#b0969b;">If you need to update your RSVP, simply <a href="${APP_URL}" style="color:${MAIN_COLOR};text-decoration:underline;">visit the invitation page</a>.</p>`)}`),
    },
    {
        subject: '📬 [TEST] Couple Notification — With QuickWeds Logo & Images',
        html: wrap(`
            <tr><td align="center" style="padding:28px 40px 20px;background-color:#ffffff;">${logo(120)}</td></tr>
            ${hero(IMG.rsvp, 'New RSVP')}
            <tr><td align="center" style="padding:36px 44px 16px;background-color:#ffffff;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${MAIN_COLOR};">Guest Response</p>
                <h1 style="margin:0;font-size:28px;font-weight:300;color:${TEXT_COLOR};">New RSVP Received!</h1>
            </td></tr>
            <tr><td style="padding:12px 44px 24px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f9f1;border-radius:18px;border:1px solid #d1eade;"><tr><td style="padding:28px;text-align:center;">
                <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#2d6a4f;">Status</p>
                <p style="margin:12px 0 0;font-size:26px;font-weight:800;color:#1b4332;">Emma says YES!</p>
                <p style="margin:8px 0 0;font-size:15px;color:#40916c;">Bringing a party of <strong>2</strong></p>
            </td></tr></table></td></tr>
            <tr><td style="padding:0 44px 36px;"><div style="background-color:#faf8f7;border-radius:18px;padding:28px;border:1px solid #f0e8ea;">
                <h3 style="margin:0 0 20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${SECONDARY_TEXT};border-bottom:1px solid #f0e8ea;padding-bottom:14px;">Guest Details</h3>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;border-collapse:separate;border-spacing:0 14px;">
                    <tr><td width="120" style="color:${SECONDARY_TEXT};font-weight:600;">Email</td><td style="font-weight:700;color:${TEXT_COLOR};">emma@example.com</td></tr>
                    <tr><td width="120" style="color:${SECONDARY_TEXT};font-weight:600;">Dietary</td><td style="font-weight:700;color:${TEXT_COLOR};">Vegetarian</td></tr>
                    <tr><td width="120" style="color:${SECONDARY_TEXT};font-weight:600;" valign="top">Song Request</td><td style="font-weight:700;color:${MAIN_COLOR};">🎵 Perfect - Ed Sheeran</td></tr>
                </table>
            </div></td></tr>
            ${cta(`${APP_URL}/dashboard`, 'Open Guest List Dashboard')}
            ${footer(`<p style="margin:0;font-size:12px;color:#b0969b;">Manage your wedding at <a href="${APP_URL}" style="color:${MAIN_COLOR};text-decoration:underline;">QuickWeds</a></p>`)}`),
    },
    {
        subject: '⏳ [TEST] Wedding Reminder — With QuickWeds Logo & Images',
        html: wrap(`
            <tr><td align="center" style="padding:28px 40px 20px;background-color:#ffffff;">${logo(120)}</td></tr>
            ${hero(IMG.reminder, 'Wedding countdown')}
            <tr><td align="center" style="padding:40px 44px 8px;background-color:#ffffff;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${MAIN_COLOR};">Friendly Reminder</p>
                <h1 style="margin:0;font-size:30px;font-weight:300;color:${TEXT_COLOR};letter-spacing:-0.3px;">The Big Day is Almost Here!</h1>
            </td></tr>
            <tr><td style="padding:24px 44px 36px;">
                <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:${SECONDARY_TEXT};text-align:center;">Hi Emma, just a sweet reminder that we can't wait to celebrate with you!</p>
                <div style="background-color:${BG_COLOR};border-radius:20px;padding:36px;text-align:center;border:1px solid rgba(209,108,120,0.12);">
                    <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:${MAIN_COLOR};font-weight:700;">Wedding of</p>
                    <h2 style="margin:10px 0 28px;font-size:30px;font-weight:300;color:${TEXT_COLOR};letter-spacing:-0.3px;">Sarah & James</h2>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr><td style="padding-bottom:24px;"><p style="margin:0;font-size:12px;color:${SECONDARY_TEXT};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">When</p><p style="margin:6px 0 0;font-size:17px;font-weight:700;color:${TEXT_COLOR};">June 15, 2026 at 4:00 PM</p></td></tr>
                        <tr><td><p style="margin:0;font-size:12px;color:${SECONDARY_TEXT};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Where</p><p style="margin:6px 0 0;font-size:17px;font-weight:700;color:${TEXT_COLOR};">The Grand Ballroom</p><p style="margin:4px 0 0;font-size:14px;color:${SECONDARY_TEXT};line-height:1.4;">123 Wedding Lane, Manila</p></td></tr>
                    </table>
                </div>
            </td></tr>
            ${cta(`${APP_URL}/demo`, 'View Wedding Details & Map')}
            ${footer()}`),
    },
    {
        subject: '📧 [TEST] Marketing Nurture Step 1 — Wedding Website Builder',
        html: wrap(`
            <tr><td align="center" style="padding:28px 40px 16px;background-color:#ffffff;">${logo(120)}</td></tr>
            ${hero(IMG.nurture1, 'Wedding Website Builder')}
            <tr><td style="padding:36px 44px 20px;background-color:#ffffff;">
                <p style="margin:0 0 12px;color:${MAIN_COLOR};font-weight:800;letter-spacing:0.14em;text-transform:uppercase;font-size:11px;">Start simple</p>
                <h1 style="margin:0;font-size:28px;line-height:1.25;color:${TEXT_COLOR};font-weight:300;letter-spacing:-0.3px;">Create the invitation guests can actually use</h1>
            </td></tr>
            <tr><td style="padding:8px 44px 24px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${TEXT_COLOR};">Hi there,</p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${SECONDARY_TEXT};">QuickWeds helps you turn the key wedding details into a polished website with RSVP, guest updates, photos, maps, and planning tools in one place.</p>
            </td></tr>
            <tr><td style="padding:0 44px 28px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#faf8f7;border-radius:18px;border:1px solid #f0e8ea;overflow:hidden;"><tr><td style="padding:24px;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td width="48" valign="top"><div style="width:42px;height:42px;border-radius:12px;background-color:${MAIN_COLOR}14;text-align:center;line-height:42px;font-size:20px;">💍</div></td><td style="padding-left:14px;"><p style="margin:0;font-size:15px;font-weight:700;color:${TEXT_COLOR};">Beautiful wedding websites</p><p style="margin:4px 0 0;font-size:14px;color:${SECONDARY_TEXT};line-height:1.5;">Designer templates, RSVP, maps, photos, and updates — all in one link.</p></td></tr></table></td></tr></table></td></tr>
            ${cta(`${APP_URL}/builder`, 'Build your wedding site')}
            ${footer(`<p style="margin:0;font-size:12px;color:#b0969b;">You are receiving this because you created a QuickWeds account.</p>`)}`),
    },
    {
        subject: '📧 [TEST] Marketing Nurture Step 3 — Planner Pro Offer',
        html: wrap(`
            <tr><td align="center" style="padding:28px 40px 16px;background-color:#ffffff;">${logo(120)}</td></tr>
            ${hero(IMG.nurture3, 'Planner Pro')}
            <tr><td style="padding:36px 44px 20px;background-color:#ffffff;">
                <p style="margin:0 0 12px;color:${MAIN_COLOR};font-weight:800;letter-spacing:0.14em;text-transform:uppercase;font-size:11px;">Limited-time offer</p>
                <h1 style="margin:0;font-size:28px;line-height:1.25;color:${TEXT_COLOR};font-weight:300;letter-spacing:-0.3px;">Unlock the full planner for $15</h1>
            </td></tr>
            <tr><td style="padding:8px 44px 24px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${TEXT_COLOR};">Hi there,</p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${SECONDARY_TEXT};">Quick update: Planner Pro was $29, and it is now $15 for a limited-time offer.</p>
            </td></tr>
            <tr><td style="padding:0 44px 28px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fff6f1;border:1px solid rgba(209,108,120,0.2);border-radius:18px;overflow:hidden;"><tr><td style="padding:22px 24px 8px;">
                <p style="margin:0 0 14px;color:${MAIN_COLOR};font-weight:800;letter-spacing:0.12em;text-transform:uppercase;font-size:10px;">Limited-time price update</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
                    <td style="vertical-align:bottom;padding:0 16px 12px 0;"><p style="margin:0;font-size:12px;color:${SECONDARY_TEXT};font-weight:700;">Was</p><p style="margin:2px 0 0;font-size:26px;color:#b0969b;text-decoration:line-through;font-weight:800;">$29</p></td>
                    <td style="vertical-align:bottom;padding:0 0 12px;"><p style="margin:0;font-size:12px;color:${SECONDARY_TEXT};font-weight:700;">Now</p><p style="margin:2px 0 0;font-size:44px;color:${TEXT_COLOR};font-weight:900;letter-spacing:-1px;">$15</p></td>
                </tr></table>
                <p style="margin:0 0 16px;font-size:13px;color:${ACCENT_COLOR};font-weight:700;">One-time upgrade. No subscription.</p>
            </td></tr><tr><td style="padding:0 24px 22px;"><table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td width="22" style="padding:5px 0;vertical-align:top;color:${MAIN_COLOR};font-size:15px;font-weight:900;">&#10003;</td><td style="padding:5px 0;color:${SECONDARY_TEXT};font-size:14px;font-weight:600;">Unlimited guest emails</td></tr>
                <tr><td width="22" style="padding:5px 0;vertical-align:top;color:${MAIN_COLOR};font-size:15px;font-weight:900;">&#10003;</td><td style="padding:5px 0;color:${SECONDARY_TEXT};font-size:14px;font-weight:600;">Full planner tools</td></tr>
                <tr><td width="22" style="padding:5px 0;vertical-align:top;color:${MAIN_COLOR};font-size:15px;font-weight:900;">&#10003;</td><td style="padding:5px 0;color:${SECONDARY_TEXT};font-size:14px;font-weight:600;">Seating, reminders, exports</td></tr>
            </table></td></tr></table></td></tr>
            ${cta(`${APP_URL}/settings`, 'Unlock Planner Pro for $15')}
            ${footer(`<p style="margin:0;font-size:12px;color:#b0969b;">You are receiving this because you created a QuickWeds account.</p>`)}`),
    },
];

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
    loadEnvFile();
    const args = process.argv.slice(2);
    const doSend = args.includes('--send');
    const emailOverride = args.find((a) => a.startsWith('--email='))?.slice('--email='.length);
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = emailOverride || process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

    if (!adminEmail) { console.error('❌ No admin email. Set ADMIN_EMAIL or use --email=...'); process.exit(1); }
    if (doSend && !resendApiKey) { console.error('❌ Missing RESEND_API_KEY'); process.exit(1); }

    console.log(`\n🎨 QuickWeds Email Test — Supabase-Hosted Images\n`);
    console.log(`  Recipient: ${adminEmail}`);
    console.log(`  Templates: ${emails.length} test emails`);
    console.log(`  Images: Loaded from Supabase storage URLs`);
    console.log(`  Mode: ${doSend ? '🚀 LIVE SEND' : '👀 DRY RUN'}\n`);

    if (!doSend) {
        emails.forEach(e => console.log(`  📧 ${e.subject}`));
        console.log(`\n  Run with --send to deliver.\n`);
        return;
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    let sent = 0;
    const errors = [];

    for (const email of emails) {
        console.log(`  Sending: ${email.subject}...`);
        try {
            const { data, error } = await resend.emails.send({ from: fromEmail, to: adminEmail, subject: email.subject, html: email.html });
            if (error) { console.log(`    ❌ ${error.message}`); errors.push(`${email.subject}: ${error.message}`); }
            else { console.log(`    ✅ Sent! (${data?.id || 'n/a'})`); sent++; }
        } catch (err) { console.log(`    ❌ ${err.message}`); errors.push(`${email.subject}: ${err.message}`); }
        await sleep(500);
    }

    console.log(`\n  ✅ Done! ${sent}/${emails.length} sent to ${adminEmail}`);
    if (errors.length) { console.log(`  ⚠️  Errors:`); errors.forEach(e => console.log(`    - ${e}`)); }
    console.log('');
}

main().catch(e => { console.error(e); process.exit(1); });
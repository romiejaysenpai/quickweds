import {
    THANK_YOU_DEFAULT_MESSAGE,
    getDefaultCoupleSignature,
    getThankYouTemplate,
    normalizeThankYouPhotoUrl,
    normalizeThankYouStyle,
    type ThankYouEmailInput,
} from './thank-you-email';

/**
 * QuickWeds Premium Email Templates — Editorial Wedding Design
 * Clean, romantic, modern design with inline CSS for maximum email client compatibility.
 * Images hosted on Supabase storage for universal access.
 */

// ─── Design System ──────────────────────────────────────────────

const C = {
    primary: '#D16C78',
    primaryDark: '#B85A66',
    primaryLight: '#F2D0D5',
    accent: '#D6B87C',
    accentDark: '#C4A56A',
    bg: '#FFF8F4',
    bgSoft: '#FEF5F0',
    card: '#FFFFFF',
    text: '#2D2A2E',
    textSecondary: '#6B5E62',
    textMuted: '#9B8E92',
    border: '#F0E0E3',
    borderLight: '#F8F0F1',
    success: '#4A9B7E',
    successBg: '#F0F9F4',
    successBorder: '#C8E6D8',
    error: '#C45B6B',
    errorBg: '#FFF0F2',
    errorBorder: '#F5C8CE',
    shadow: 'rgba(209,108,120,0.08)',
} as const;

const FONT_HEADING = "'Georgia', 'Times New Roman', serif";
const FONT_BODY = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const SUPABASE_IMG = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images';

const IMG = {
    logo: `${SUPABASE_IMG}/Untitled%20-%2009%20July%202026%20at%2002.51.57%20(16).png`,
    heroWelcome: `${SUPABASE_IMG}/Wedding%20Website%20Builder.png`,
    heroRsvp: `${SUPABASE_IMG}/Smart%20RSVP%20Management.png`,
    heroReminder: `${SUPABASE_IMG}/2df72133-22a1-4b56-9612-38513a3c3ef3.png`,
    heroThankYou: `${SUPABASE_IMG}/079f3b98-6106-45fe-8d55-407f65fe4d9f.png`,
    heroCollab: `${SUPABASE_IMG}/COLABORATION%20TOOLS.png`,
    heroNurture1: `${SUPABASE_IMG}/Wedding%20Website%20Builder.png`,
    heroNurture2: `${SUPABASE_IMG}/Smart%20RSVP%20Management.png`,
    heroNurture3: `${SUPABASE_IMG}/253b06e1-93cf-446c-a0fe-b3397777c185.png`,
    heroNurture4: `${SUPABASE_IMG}/5a359c30-69de-4483-aa9b-aa0a0c011b78%20(1).png`,
    heroNurture5: `${SUPABASE_IMG}/5fb8ca9e-86fb-40cc-9d53-ae8292da501c.png`,
    heroNurture6: `${SUPABASE_IMG}/253b06e1-93cf-446c-a0fe-b3397777c185.png`,
} as const;

// ─── Utilities ──────────────────────────────────────────────────

function esc(input: string | number | null | undefined) {
    return String(input ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function plainText(input: string) {
    return input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Reusable Email Components ──────────────────────────────────

/** Email wrapper — full HTML document with body styles */
function emailShell(title: string, content: string, previewText = title) {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${esc(title)}</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        @media only screen and (max-width: 640px) {
            .qw-pad { padding-left: 24px !important; padding-right: 24px !important; }
            .qw-stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
            .qw-full-button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .qw-h1 { font-size: 28px !important; line-height: 1.18 !important; }
        }
    </style>
    <!--[if mso]><style>table,td,a,p,h1,h2,h3{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;font-family:${FONT_BODY};background-color:${C.bg};color:${C.text};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width:100% !important;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg};opacity:0;">${esc(plainText(previewText))}</div>
    ${content}
</body>
</html>`;
}

/** Outer email table wrapper */
function emailTable(inner: string) {
    return `<table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background-color:${C.card};overflow:hidden;">
${inner}
</table>`;
}

/** QuickWeds logo header bar */
function logoBar(size = 120) {
    return `<tr>
    <td align="center" style="padding:32px 40px 24px;background-color:${C.card};">
        <img src="${IMG.logo}" alt="QuickWeds" width="${size}" style="display:block;width:${size}px;height:auto;border:0;" />
    </td>
</tr>`;
}

/** Full-width hero image */
function heroImage(src: string, alt = '') {
    return `<tr>
    <td style="padding:0;line-height:0;font-size:0;">
        <img src="${esc(src)}" alt="${esc(alt)}" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;" />
    </td>
</tr>`;
}

/** Upperscore eyebrow label */
function eyebrow(text: string) {
    return `<p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${C.primary};font-family:${FONT_BODY};">${esc(text)}</p>`;
}

/** Large serif heading (H1) */
function heading1(text: string) {
    return `<h1 class="qw-h1" style="margin:0;font-size:32px;line-height:1.2;font-weight:400;color:${C.text};font-family:${FONT_HEADING};letter-spacing:0;">${esc(text)}</h1>`;
}

/** Medium serif heading (H2) */
function heading2(text: string) {
    return `<h2 style="margin:0;font-size:26px;line-height:1.25;font-weight:400;color:${C.text};font-family:${FONT_HEADING};letter-spacing:-0.2px;">${esc(text)}</h2>`;
}

/** Section heading (H3) — uppercase label style */
function sectionLabel(text: string) {
    return `<h3 style="margin:0 0 20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${C.primary};font-family:${FONT_BODY};">${esc(text)}</h3>`;
}

/** Body paragraph */
function paragraph(text: string, color = C.textSecondary) {
    return `<p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:${color};font-family:${FONT_BODY};">${text}</p>`;
}

/** White card with subtle shadow and rounded corners */
function card(inner: string, opts: { bg?: string; border?: string; radius?: number; padding?: string } = {}) {
    const bg = opts.bg || C.card;
    const border = opts.border || C.border;
    const r = opts.radius || 20;
    const p = opts.padding || '32px';
    return `<div style="background-color:${bg};border-radius:${r}px;padding:${p};border:1px solid ${border};box-shadow:0 2px 12px ${C.shadow};">
${inner}
</div>`;
}

/** Soft background section */
function softSection(inner: string) {
    return `<div style="background-color:${C.bgSoft};border-radius:20px;padding:32px;border:1px solid ${C.border};">
${inner}
</div>`;
}

/** Primary CTA button */
function ctaButton(url: string, label: string, opts: { color?: string; textColor?: string; fullWidth?: boolean } = {}) {
    const bg = opts.color || C.primary;
    const tc = opts.textColor || '#ffffff';
    const display = opts.fullWidth ? 'block' : 'inline-block';
    const width = opts.fullWidth ? 'width:100%;text-align:center;' : '';
    const safeUrl = esc(url);
    return `<tr>
    <td class="qw-pad" align="center" style="padding:12px 44px 44px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" ${opts.fullWidth ? 'width="100%"' : ''}>
            <tr>
                <td align="center" style="border-radius:14px;background-color:${bg};box-shadow:0 8px 24px ${bg}33;">
                    <a class="qw-full-button" href="${safeUrl}" target="_blank" style="display:${display};padding:18px 48px;color:${tc};text-decoration:none;font-family:${FONT_BODY};font-weight:700;font-size:16px;letter-spacing:0.3px;border-radius:14px;${width}">
                        ${esc(label)}
                    </a>
                </td>
            </tr>
        </table>
    </td>
</tr>`;
}

/** Secondary CTA button (outlined style) */
function ctaButtonSecondary(url: string, label: string) {
    return `<tr>
    <td class="qw-pad" align="center" style="padding:0 44px 36px;">
        <a href="${esc(url)}" target="_blank" style="display:inline-block;padding:14px 36px;color:${C.primary};text-decoration:none;font-family:${FONT_BODY};font-weight:700;font-size:14px;letter-spacing:0.3px;border-radius:12px;border:2px solid ${C.primaryLight};">
            ${esc(label)}
        </a>
    </td>
</tr>`;
}

/** Branded footer with logo, tagline, and optional extra content */
function footer(extra = '') {
    return `<tr>
    <td class="qw-pad" style="padding:40px;background-color:${C.bgSoft};border-top:1px solid ${C.border};">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr><td align="center" style="padding-bottom:20px;"><img src="${IMG.logo}" alt="QuickWeds" width="100" style="display:inline-block;width:100px;height:auto;border:0;opacity:0.6;" /></td></tr>
            <tr><td align="center"><p style="margin:0;font-size:14px;line-height:1.6;color:${C.textSecondary};font-family:${FONT_BODY};">The easiest way to plan your big day</p></td></tr>
            ${extra ? `<tr><td align="center" style="padding-top:16px;">${extra}</td></tr>` : ''}
            <tr><td align="center" style="padding-top:20px;"><p style="margin:0;font-size:11px;color:${C.textMuted};letter-spacing:0.5px;font-family:${FONT_BODY};">&copy; ${new Date().getFullYear()} QuickWeds. All rights reserved.</p></td></tr>
        </table>
    </td>
</tr>`;
}

/** Decorative horizontal rule */
function divider() {
    return `<tr><td class="qw-pad" style="padding:0 44px;"><hr style="border:0;border-top:1px solid ${C.border};margin:0;" /></td></tr>`;
}

/** Info row with emoji icon */
function infoRow(icon: string, label: string, value: string) {
    return `<tr>
    <td width="44" valign="top" style="padding-top:2px;">
        <div style="width:38px;height:38px;border-radius:12px;background-color:${C.primaryLight};text-align:center;line-height:38px;font-size:16px;">${icon}</div>
    </td>
    <td style="padding-left:16px;padding-bottom:20px;">
        <p style="margin:0;font-size:12px;color:${C.textMuted};text-transform:uppercase;letter-spacing:1px;font-weight:600;font-family:${FONT_BODY};">${label}</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:${C.text};font-family:${FONT_BODY};">${value}</p>
    </td>
</tr>`;
}

/** Status badge (green for positive, red for negative) */
function statusBadge(label: string, value: string, positive = true) {
    const bg = positive ? C.successBg : C.errorBg;
    const border = positive ? C.successBorder : C.errorBorder;
    const labelColor = positive ? C.success : C.error;
    const valueColor = positive ? '#1A4D3A' : '#7A2030';
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${bg};border-radius:16px;border:1px solid ${border};">
    <tr><td style="padding:28px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${labelColor};font-family:${FONT_BODY};">${esc(label)}</p>
        <p style="margin:12px 0 0;font-size:28px;font-weight:400;color:${valueColor};font-family:${FONT_HEADING};">${esc(value)}</p>
    </td></tr>
</table>`;
}

/** Feature highlight card with icon */
function featureCard(icon: string, title: string, desc: string) {
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${C.bgSoft};border-radius:16px;border:1px solid ${C.border};overflow:hidden;">
    <tr><td style="padding:24px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td width="48" valign="top">
                    <div style="width:44px;height:44px;border-radius:14px;background-color:${C.primaryLight};text-align:center;line-height:44px;font-size:20px;">${icon}</div>
                </td>
                <td style="padding-left:16px;">
                    <p style="margin:0;font-size:16px;font-weight:700;color:${C.text};font-family:${FONT_BODY};">${esc(title)}</p>
                    <p style="margin:5px 0 0;font-size:14px;color:${C.textSecondary};line-height:1.6;font-family:${FONT_BODY};">${esc(desc)}</p>
                </td>
            </tr>
        </table>
    </td></tr>
</table>`;
}

function checklist(items: string[]) {
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        ${items.map((item) => `<tr>
            <td width="28" valign="top" style="padding:7px 0;color:${C.primary};font-size:16px;font-weight:700;">&#10003;</td>
            <td style="padding:7px 0;color:${C.textSecondary};font-size:14px;line-height:1.55;font-weight:600;font-family:${FONT_BODY};">${esc(item)}</td>
        </tr>`).join('')}
    </table>`;
}

/** Numbered step row */
function stepRow(num: number, title: string, desc: string) {
    return `<tr>
    <td width="52" valign="top">
        <div style="width:40px;height:40px;line-height:40px;text-align:center;border-radius:14px;background:${C.primary};color:#ffffff;font-weight:700;font-size:17px;font-family:${FONT_HEADING};">${num}</div>
    </td>
    <td style="padding-left:16px;padding-bottom:28px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:${C.text};font-family:${FONT_BODY};">${esc(title)}</p>
        <p style="margin:5px 0 0;font-size:14px;color:${C.textSecondary};line-height:1.6;font-family:${FONT_BODY};">${esc(desc)}</p>
    </td>
</tr>`;
}

// ─── Email Template Props ───────────────────────────────────────

interface EmailTemplateProps {
    guestName: string;
    guestEmail?: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime?: string;
    venueName?: string;
    venueAddress?: string;
    mapsLink?: string;
    weddingUrl: string;
    attendance: string;
    numGuests: number;
    guestCode?: string;
    checkInUrl?: string;
    message?: string;
    dietaryDetails?: string;
    songRequest?: string;
    plusOneNames?: string | string[];
    childrenCount?: number;
    dashboardUrl?: string;
    weddingTitle?: string;
}

// ─── Template: RSVP Confirmation to Guest ───────────────────────

export function getGuestConfirmationHtml(props: EmailTemplateProps) {
    const {
        guestName, brideName, groomName, weddingDate, weddingTime,
        venueName, venueAddress, mapsLink, weddingUrl, attendance, numGuests,
        guestCode, checkInUrl
    } = props;

    const isAttending = attendance === 'Yes';
    const safeGuestCode = guestCode ? esc(guestCode) : '';
    const safeCheckInUrl = checkInUrl ? esc(checkInUrl) : '';
    const qrImageUrl = checkInUrl ? `https://quickchart.io/qr?size=240&margin=2&text=${encodeURIComponent(checkInUrl)}` : '';

    const detailsSection = isAttending ? `
        ${divider()}
        <tr><td style="padding:28px 44px 0;">
            ${sectionLabel('Wedding Details')}
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                ${infoRow('📅', 'Date & Time', `${esc(weddingDate)}${weddingTime ? ` at ${esc(weddingTime)}` : ''}`)}
                ${venueName ? infoRow('📍', 'The Venue', `${esc(venueName)}${venueAddress ? `<br/><span style="font-size:14px;font-weight:400;color:${C.textSecondary};">${esc(venueAddress)}</span>` : ''}${mapsLink ? `<br/><a href="${esc(mapsLink)}" style="color:${C.primary};font-size:13px;font-weight:600;text-decoration:none;border-bottom:1px dashed ${C.primary};">Open in Google Maps &rarr;</a>` : ''}`) : ''}
            </table>
        </td></tr>` : '';

    const qrSection = isAttending && checkInUrl && guestCode ? `
        ${divider()}
        <tr><td style="padding:28px 44px 0;">
            ${sectionLabel('Your Event Check-In QR')}
            ${paragraph(`Save this email or screenshot the QR code below. Show it to reception staff when you arrive.`)}
            <div style="text-align:center;background-color:${C.card};border:1px solid ${C.border};border-radius:18px;padding:28px;margin:0 0 20px;">
                <img src="${qrImageUrl}" alt="Wedding check-in QR code" width="200" height="200" style="display:inline-block;width:200px;height:200px;border:0;" />
                <p style="margin:18px 0 0;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:700;font-family:${FONT_BODY};">Backup Guest Code</p>
                <p style="margin:8px 0 0;font-size:26px;color:${C.text};font-weight:400;letter-spacing:3px;font-family:${FONT_HEADING};">${safeGuestCode}</p>
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;color:${C.textSecondary};line-height:1.7;font-family:${FONT_BODY};">
                <tr><td width="22" valign="top" style="color:${C.primary};font-weight:700;">1.</td><td style="padding-bottom:10px;">Keep this email on your phone, or save a screenshot of the QR code.</td></tr>
                <tr><td width="22" valign="top" style="color:${C.primary};font-weight:700;">2.</td><td style="padding-bottom:10px;">Show the QR code when staff asks for check-in at the venue.</td></tr>
                <tr><td width="22" valign="top" style="color:${C.primary};font-weight:700;">3.</td><td>If the QR won't scan, staff can enter: <strong style="color:${C.text};">${safeGuestCode}</strong></td></tr>
            </table>
            <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:${C.textMuted};font-family:${FONT_BODY};">This QR is for your RSVP party only. Please do not forward it.</p>
        </td></tr>` : '';

    const guestPrepSection = isAttending ? `
        <tr><td class="qw-pad" style="padding:0 44px 28px;">
            ${card(`
                ${sectionLabel('Before You Arrive')}
                ${checklist([
        'Save this confirmation email so your details are easy to find.',
        venueName ? 'Check the venue address and travel time before leaving.' : 'Revisit the invitation page for any final couple updates.',
        checkInUrl ? 'Keep your QR code or backup guest code ready at reception.' : 'Use the invitation link if you need to review the schedule or location.',
    ])}
            `, { bg: '#FFFCFA', border: C.borderLight, padding: '28px' })}
        </td></tr>` : '';

    const content = emailTable(`
        ${logoBar()}
        ${heroImage(IMG.heroRsvp, 'Wedding RSVP Confirmation')}
        <tr><td align="center" style="padding:44px 44px 16px;">
            ${eyebrow('RSVP Confirmed')}
            ${heading1(isAttending ? "We're so excited!" : "We'll miss you!")}
            <p style="margin:12px 0 0;font-size:18px;color:${C.textSecondary};font-style:italic;font-family:${FONT_HEADING};">${esc(brideName)} & ${esc(groomName)}'s Wedding</p>
        </td></tr>
        <tr><td style="padding:16px 44px 36px;">
            ${card(`
                <p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:${C.text};font-family:${FONT_BODY};">Hi <strong>${esc(guestName)}</strong>,</p>
                ${paragraph(isAttending
        ? `Thank you for RSVPing! We've saved a spot for <strong style="color:${C.text};">${numGuests} guest${numGuests > 1 ? 's' : ''}</strong>. We can't wait to celebrate this special day with you.`
        : `Thank you for letting us know. We're sorry you can't make it, but we'll be thinking of you as we celebrate!`)}
            `)}
        </td></tr>
        ${detailsSection}
        ${qrSection}
        ${guestPrepSection}
        ${ctaButton(weddingUrl, 'View Full Invitation')}
        ${footer(`<p style="margin:0;font-size:12px;color:${C.textMuted};font-family:${FONT_BODY};">To update your RSVP, <a href="${esc(weddingUrl)}" style="color:${C.primary};text-decoration:underline;">visit the invitation page</a>.</p>`)}`);

    return emailShell(`RSVP Confirmation — ${brideName} & ${groomName}`, content);
}

// ─── Template: RSVP Notification to Couple ──────────────────────

export function getCoupleNotificationHtml(props: EmailTemplateProps) {
    const {
        guestName, guestEmail, attendance, numGuests, message,
        dietaryDetails, songRequest, plusOneNames, childrenCount, weddingUrl
    } = props;

    const isAttending = attendance === 'Yes';

    const detailsRows = [
        `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;">Guest</td><td style="font-weight:700;color:${C.text};font-family:${FONT_BODY};font-size:14px;">${esc(guestName)}</td></tr>`,
        `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;">Attendance</td><td style="font-weight:700;color:${isAttending ? C.success : C.error};font-family:${FONT_BODY};font-size:14px;">${esc(attendance)}</td></tr>`,
        `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;">Party Size</td><td style="font-weight:700;color:${C.text};font-family:${FONT_BODY};font-size:14px;">${numGuests} guest${numGuests === 1 ? '' : 's'}</td></tr>`,
        guestEmail ? `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;">Email</td><td style="font-weight:700;color:${C.text};font-family:${FONT_BODY};font-size:14px;">${esc(guestEmail)}</td></tr>` : '',
        plusOneNames ? `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;">Plus Ones</td><td style="font-weight:700;color:${C.text};font-family:${FONT_BODY};font-size:14px;">${esc(Array.isArray(plusOneNames) ? plusOneNames.join(', ') : plusOneNames)}</td></tr>` : '',
        childrenCount ? `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;">Children</td><td style="font-weight:700;color:${C.text};font-family:${FONT_BODY};font-size:14px;">${childrenCount}</td></tr>` : '',
        dietaryDetails ? `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;" valign="top">Dietary</td><td style="font-weight:700;color:${C.text};font-family:${FONT_BODY};font-size:14px;line-height:1.5;">${esc(dietaryDetails)}</td></tr>` : '',
        songRequest ? `<tr><td width="120" style="color:${C.textMuted};font-weight:600;font-family:${FONT_BODY};font-size:14px;" valign="top">Song Request</td><td style="font-weight:700;color:${C.primary};font-family:${FONT_BODY};font-size:14px;">🎵 ${esc(songRequest)}</td></tr>` : '',
    ].filter(Boolean).join('');

    const messageSection = message ? `
        <div style="margin-top:24px;padding-top:24px;border-top:1px solid ${C.border};">
            <p style="margin:0 0 8px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:700;font-family:${FONT_BODY};">Message for you</p>
            <p style="margin:0;font-size:15px;font-style:italic;line-height:1.7;color:${C.textSecondary};font-family:${FONT_HEADING};">&ldquo;${esc(message)}&rdquo;</p>
        </div>` : '';

    const content = emailTable(`
        ${logoBar()}
        ${heroImage(IMG.heroRsvp, 'New RSVP received')}
        <tr><td class="qw-pad" align="center" style="padding:40px 44px 16px;">
            ${eyebrow('Guest Response')}
            ${heading1('New RSVP Received!')}
            ${paragraph('Someone just responded to your invitation', C.textSecondary)}
        </td></tr>
        <tr><td class="qw-pad" style="padding:16px 44px 28px;">
            ${statusBadge('Status', `${guestName} says ${isAttending ? 'YES!' : 'NO'}`, isAttending)}
            ${isAttending ? `<p style="margin:16px 0 0;text-align:center;font-size:15px;color:${C.success};font-family:${FONT_BODY};">Bringing a party of <strong>${numGuests}</strong></p>` : ''}
        </td></tr>
        <tr><td class="qw-pad" style="padding:0 44px 36px;">
            ${card(`
                ${sectionLabel('Guest Details')}
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 16px;">
                    ${detailsRows}
                </table>
                ${messageSection}
            `, { bg: C.bgSoft, border: C.border })}
        </td></tr>
        ${ctaButton(weddingUrl, 'Open Guest List Dashboard')}
        ${footer(`<p style="margin:0;font-size:12px;color:${C.textMuted};font-family:${FONT_BODY};">Manage your wedding at <a href="${esc(weddingUrl)}" style="color:${C.primary};text-decoration:underline;">QuickWeds</a></p>`)}`);

    return emailShell('New RSVP Received', content, `${guestName} responded ${attendance} for ${numGuests} guest${numGuests === 1 ? '' : 's'}.`);
}

// ─── Template: Guest Reminder ───────────────────────────────────

export function getGuestReminderHtml(props: EmailTemplateProps) {
    const {
        guestName, brideName, groomName, weddingDate, weddingTime,
        venueName, venueAddress, mapsLink, weddingUrl
    } = props;

    const content = emailTable(`
        ${logoBar()}
        ${heroImage(IMG.heroReminder, 'Wedding countdown')}
        <tr><td class="qw-pad" align="center" style="padding:44px 44px 12px;">
            ${eyebrow('Friendly Reminder')}
            ${heading1('The Big Day is Almost Here!')}
        </td></tr>
        <tr><td class="qw-pad" style="padding:16px 44px 40px;">
            ${paragraph(`Hi ${esc(guestName)}, just a sweet reminder that we can't wait to celebrate with you!`)}
            ${card(`
                <p style="margin:0;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:${C.primary};font-weight:700;font-family:${FONT_BODY};">Wedding of</p>
                <h2 style="margin:12px 0 32px;text-align:center;font-size:32px;font-weight:400;color:${C.text};font-family:${FONT_HEADING};letter-spacing:-0.3px;">${esc(brideName)} & ${esc(groomName)}</h2>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><td style="padding-bottom:28px;">
                        <p style="margin:0;font-size:12px;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:${FONT_BODY};">When</p>
                        <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:${C.text};font-family:${FONT_BODY};">${esc(weddingDate)}${weddingTime ? ` at ${esc(weddingTime)}` : ''}</p>
                    </td></tr>
                    ${venueName ? `<tr><td>
                        <p style="margin:0;font-size:12px;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:${FONT_BODY};">Where</p>
                        <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:${C.text};font-family:${FONT_BODY};">${esc(venueName)}</p>
                        ${venueAddress ? `<p style="margin:4px 0 0;font-size:14px;color:${C.textSecondary};line-height:1.5;font-family:${FONT_BODY};">${esc(venueAddress)}</p>` : ''}
                        ${mapsLink ? `<a href="${esc(mapsLink)}" style="display:inline-block;margin-top:12px;color:${C.primary};font-size:13px;font-weight:600;text-decoration:none;border-bottom:1px dashed ${C.primary};font-family:${FONT_BODY};">Open in Google Maps &rarr;</a>` : ''}
                    </td></tr>` : ''}
                </table>
            `, { bg: C.bgSoft, border: C.borderLight })}
        </td></tr>
        <tr><td class="qw-pad" style="padding:0 44px 28px;">
            ${card(`
                ${sectionLabel('Quick Checklist')}
                ${checklist([
        'Review the latest invitation details before you leave.',
        mapsLink ? 'Open the map link and save the route.' : 'Confirm travel time and parking before the day.',
        'Keep this email handy in case the couple shares last-minute updates.',
    ])}
            `, { bg: '#FFFCFA', border: C.borderLight, padding: '28px' })}
        </td></tr>
        ${ctaButton(weddingUrl, 'View Wedding Details & Map')}
        ${footer()}`);

    return emailShell('Wedding Reminder', content, `${brideName} and ${groomName}'s wedding is coming up. Review the date, venue, and map.`);
}

// ─── Template: Welcome Email ────────────────────────────────────

export function getWelcomeEmailHtml(userName: string) {
    const content = emailTable(`
        ${logoBar()}
        ${heroImage(IMG.heroWelcome, 'Welcome to QuickWeds')}
        <tr><td class="qw-pad" align="center" style="padding:44px 44px 12px;">
            ${eyebrow('Welcome Aboard')}
            ${heading1('Your Wedding Journey Starts Here')}
        </td></tr>
        <tr><td class="qw-pad" style="padding:20px 44px 16px;">
            ${paragraph(`Hi ${esc(userName)}, we're so honored to be part of your wedding journey! QuickWeds was built to make your invitations as beautiful as your love story&mdash;without the stress.`)}
            ${sectionLabel('Getting Started in 4 Simple Steps')}
        </td></tr>
        <tr><td class="qw-pad" style="padding:0 44px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                ${stepRow(1, 'Pick Your Vibe', 'Browse our designer templates, from Vintage to Modern, to match your wedding theme.')}
                ${stepRow(2, 'Tell Your Story', 'Fill in your details, venue location, and that special date everyone should save.')}
                ${stepRow(3, 'Add the Magic', 'Upload your photos and choose custom accents to make it truly yours.')}
                ${stepRow(4, 'Go Live', 'Preview your page, hit publish, and share your unique wedding link with guests!')}
            </table>
        </td></tr>
        <tr><td class="qw-pad" style="padding:0 44px 28px;">
            ${card(`
                ${sectionLabel('What You Can Add Later')}
                ${checklist([
        'RSVP tracking, dietary notes, and song requests.',
        'Guest photo uploads, thank-you notes, and wedding-day QR tools.',
        'Planner tools for seating, collaborators, suppliers, budgets, and reminders.',
    ])}
            `, { bg: '#FFFCFA', border: C.borderLight, padding: '28px' })}
        </td></tr>
        ${ctaButton('https://quickweds.site/builder', 'Start Building Now')}
        ${footer(`<p style="margin:0;font-size:12px;color:${C.textMuted};font-family:${FONT_BODY};">With love from the <strong style="color:${C.primary};">QuickWeds</strong> Team</p>`)}`);

    return emailShell('Welcome to QuickWeds', content, 'Start your wedding website, invite guests, and manage the planning details in QuickWeds.');
}

// ─── Template: Thank You Note ───────────────────────────────────

function textToEmailParagraphs(input: string, color: string) {
    return input
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:${color};font-family:${FONT_BODY};">${esc(p).replace(/\n/g, '<br />')}</p>`)
        .join('');
}

function getReadableTextColor(accentColor: string) {
    const normalized = accentColor.replace('#', '');
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 165 ? C.text : '#ffffff';
}

export function getThankYouNoteHtml(input: ThankYouEmailInput) {
    const { recipientName, brideName, groomName, weddingDate } = input;
    const template = getThankYouTemplate(input.templateId);
    const style = normalizeThankYouStyle(template.id, input.style);
    const fallbackSignature = getDefaultCoupleSignature(brideName, groomName);
    const message = input.message || input.personalizedMessage || THANK_YOU_DEFAULT_MESSAGE.replace('[Couple Names]', fallbackSignature);
    const coupleSignature = input.coupleSignature || fallbackSignature;
    const safePhotoUrl = template.supportsPhoto ? normalizeThankYouPhotoUrl(input.photoUrl) : '';
    const safeRecipientName = esc(recipientName || 'Guest');
    const safeBrideName = esc(brideName || 'Bride');
    const safeGroomName = esc(groomName || 'Groom');
    const safeWeddingDate = weddingDate ? esc(weddingDate) : '';
    const safeCoupleSignature = esc(coupleSignature);
    const safeEyebrow = esc(template.eyebrow);
    const safeAccent = style.accentColor;
    const safeFont = style.fontFamily;
    const accentTextColor = getReadableTextColor(safeAccent);
    const messageHtml = textToEmailParagraphs(message, C.text);
    const heroUrl = IMG.heroThankYou;

    const photoHtml = safePhotoUrl
        ? `<tr><td style="padding:0;line-height:0;font-size:0;"><img src="${esc(safePhotoUrl)}" alt="${safeBrideName} and ${safeGroomName}" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;" /></td></tr>`
        : `<tr><td style="padding:0;line-height:0;font-size:0;"><img src="${heroUrl}" alt="Thank you" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;" /></td></tr>`;

    const floralRule = template.id === 'romantic-floral'
        ? `<p style="margin:16px 0 0;color:${safeAccent};font-size:18px;letter-spacing:6px;">&#10045; &#10045; &#10045;</p>`
        : '';

    const cardBg = template.id === 'modern-minimal' ? C.card : template.id === 'simple-warm' ? '#FBFFF9' : C.bg;
    const borderSt = template.id === 'modern-minimal' ? `1px solid ${C.border}` : `1px solid ${safeAccent}33`;
    const headerBg = template.id === 'modern-minimal' ? C.card : safeAccent;

    const content = `<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background-color:${C.card};overflow:hidden;">
        ${logoBar(110)}
        ${photoHtml}
        <tr>
            <td align="center" style="padding:44px 40px 32px;background-color:${headerBg};color:${accentTextColor};">
                <p style="margin:0 0 14px;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${accentTextColor};font-family:${FONT_BODY};">${safeEyebrow}</p>
                <h1 style="margin:0;font-size:36px;line-height:1.15;font-weight:400;color:${accentTextColor};font-family:${FONT_HEADING};">Thank You</h1>
                <p style="margin:14px 0 0;font-size:18px;color:${accentTextColor};opacity:0.9;font-family:${FONT_HEADING};">${safeBrideName} & ${safeGroomName}</p>
                ${floralRule}
            </td>
        </tr>
        <tr>
            <td style="padding:40px 36px 44px;">
                ${card(`
                    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:${C.textSecondary};font-family:${FONT_BODY};">Dear ${safeRecipientName},</p>
                    ${messageHtml}
                    ${safeWeddingDate ? `<p style="font-size:13px;line-height:1.6;margin:4px 0 24px;color:${C.textMuted};font-family:${FONT_BODY};">A note from our wedding on <strong>${safeWeddingDate}</strong>.</p>` : ''}
                    <p style="margin:28px 0 0;font-size:16px;line-height:1.7;color:${C.text};font-family:${FONT_BODY};">
                        <span style="display:block;color:${C.textSecondary};margin-bottom:4px;font-size:14px;">With love,</span>
                        <strong style="font-size:22px;color:${safeAccent};font-family:${FONT_HEADING};">${safeCoupleSignature}</strong>
                    </p>
                `, { bg: cardBg, border: borderSt.replace('1px solid ', ''), padding: '32px' })}
            </td>
        </tr>
        ${footer(`<p style="margin:0;font-size:12px;color:${C.textMuted};font-family:${FONT_BODY};">Sent with love through <strong style="color:${safeAccent};">QuickWeds</strong></p>`).replace('<tr>', '').replace('</tr>', '')}
    </table>`;

    return emailShell('Thank You', content);
}

// ─── Template: Collaborator Invite ──────────────────────────────

export function getCollaboratorInviteHtml(input: {
    inviteeEmail: string;
    inviterEmail?: string;
    role: string;
    brideName: string;
    groomName: string;
    weddingDate?: string;
    venueName?: string;
    dashboardUrl: string;
}) {
    const safeInviteeEmail = esc(input.inviteeEmail);
    const safeInviterEmail = input.inviterEmail ? esc(input.inviterEmail) : 'A QuickWeds user';
    const safeRole = esc(input.role);
    const safeBrideName = esc(input.brideName || 'Bride');
    const safeGroomName = esc(input.groomName || 'Groom');
    const safeWeddingDate = input.weddingDate ? esc(input.weddingDate) : '';
    const safeVenueName = input.venueName ? esc(input.venueName) : '';
    const safeDashboardUrl = esc(input.dashboardUrl);

    const content = emailTable(`
        ${logoBar()}
        ${heroImage(IMG.heroCollab, 'Collaboration invite')}
        <tr><td align="center" style="padding:40px 44px 16px;">
            ${eyebrow("You're Invited")}
            ${heading1(`Join ${input.brideName} & ${input.groomName}'s Wedding Workspace`)}
        </td></tr>
        <tr><td style="padding:20px 44px 32px;">
            ${paragraph(`Hi ${safeInviteeEmail},`)}
            ${paragraph(`${safeInviterEmail} invited you as a <strong style="color:${C.text};">${safeRole}</strong> so you can help manage wedding planning details in QuickWeds.`)}
            ${card(`
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${C.primary};font-family:${FONT_BODY};">Wedding Workspace</p>
                ${heading2(`${input.brideName} & ${input.groomName}`)}
                ${safeWeddingDate ? `<p style="margin:8px 0 0;font-size:14px;color:${C.textSecondary};font-family:${FONT_BODY};"><strong>Date:</strong> ${safeWeddingDate}</p>` : ''}
                ${safeVenueName ? `<p style="margin:4px 0 0;font-size:14px;color:${C.textSecondary};font-family:${FONT_BODY};"><strong>Venue:</strong> ${safeVenueName}</p>` : ''}
            `, { bg: C.bgSoft, border: C.border })}
        </td></tr>
        ${ctaButton(safeDashboardUrl, 'Open QuickWeds Workspace')}
        ${ctaButtonSecondary(safeDashboardUrl, 'Sign in to accept invitation')}
        ${footer(`<p style="margin:0;font-size:12px;color:${C.textMuted};font-family:${FONT_BODY};">Sent automatically by <strong style="color:${C.primary};">QuickWeds</strong></p>`)}`);

    return emailShell('QuickWeds Collaboration Invite', content);
}

// ─── Marketing Nurture Templates ────────────────────────────────

export type MarketingNurtureEmailInput = {
    userName: string;
    appUrl: string;
    unsubscribeUrl: string;
    step: number;
};

const MARKETING_NURTURE_STEPS = [
    {
        subject: 'Your wedding website can be ready today',
        eyebrow: 'Start simple',
        heading: 'Create the invitation guests can actually use',
        hero: 'hero-nurture-1.jpg',
        body: [
            'QuickWeds helps you turn the key wedding details into a polished website with RSVP, guest updates, photos, maps, and planning tools in one place.',
            'Start with a template, add your story and venue details, then share one link with everyone.',
        ],
        cta: 'Build your wedding site',
        path: '/builder',
        feature: { icon: '💍', title: 'Beautiful wedding websites', desc: 'Designer templates, RSVP, maps, photos, and updates \u2014 all in one link.' },
    },
    {
        subject: 'Make RSVPs easier before the guest questions start',
        eyebrow: 'Guest list momentum',
        heading: 'Collect RSVPs without chasing every reply',
        hero: 'hero-nurture-2.jpg',
        body: [
            'Your guests can RSVP from your invitation page, and you can keep responses organized from the dashboard.',
            'Planner Pro gives you more room to send guest emails, reminders, and updates when the list gets bigger.',
        ],
        cta: 'Open your dashboard',
        path: '/dashboard',
        feature: { icon: '📋', title: 'Smart RSVP tracking', desc: 'Real-time responses, dietary notes, song requests, and guest codes.' },
    },
    {
        subject: 'Planner Pro is now $15, down from $29',
        eyebrow: 'Limited-time offer',
        heading: 'Unlock the full planner for $15',
        hero: 'hero-nurture-3.jpg',
        body: [
            'Quick update: Planner Pro was $29, and it is now $15 for a limited-time offer.',
            'That unlocks the bigger planning workspace: unlimited guest emails, seating, reminders, collaborators, budgets, suppliers, photo tools, exports, and more.',
            'If QuickWeds is becoming the place you manage the wedding, this is the best time to take the limits off.',
        ],
        cta: 'Unlock Planner Pro for $15',
        path: '/settings',
        offer: {
            label: 'Limited-time price update',
            oldPrice: '$29',
            newPrice: '$15',
            note: 'One-time upgrade. No subscription.',
            highlights: ['Unlimited guest emails', 'Full planner tools', 'Seating, reminders, exports'],
        },
    },
    {
        subject: 'Your Pro plan is built for the busy part of planning',
        eyebrow: 'Go Pro',
        heading: 'Unlock the tools couples need as the date gets closer',
        hero: 'hero-nurture-4.jpg',
        body: [
            'Planner Pro is for the moment when your guest list, reminders, checklists, suppliers, and seating plan all need more space.',
            'It gives you more flexibility across owned weddings, planning tools, and guest communication.',
        ],
        cta: 'Upgrade to Pro',
        path: '/settings',
        feature: { icon: '✨', title: 'Everything you need', desc: 'Seating charts, budgets, supplier directory, exports, and unlimited emails.' },
    },
    {
        subject: 'Give guests one beautiful place for every detail',
        eyebrow: 'Guest experience',
        heading: 'The less guests have to ask, the calmer planning feels',
        hero: 'hero-nurture-5.jpg',
        body: [
            'Use QuickWeds for the invitation, RSVP, venue details, schedule, gallery, gifts, and updates guests can revisit anytime.',
            'Pro helps you keep that experience polished as your planning grows.',
        ],
        cta: 'Polish your invitation',
        path: '/dashboard',
        feature: { icon: '🎉', title: 'One link for everything', desc: 'Invitation, RSVP, venue, schedule, gallery, and gift registry.' },
    },
    {
        subject: 'Ready to take the limits off QuickWeds?',
        eyebrow: 'Final nudge',
        heading: 'Upgrade when you want QuickWeds to carry more of the work',
        hero: 'hero-nurture-6.jpg',
        body: [
            'If QuickWeds is becoming your planning hub, Pro is the clean next step.',
            'You can keep building on your current wedding workspace and unlock more room for guest emails, planning details, and wedding management.',
        ],
        cta: 'Upgrade to Pro',
        path: '/settings',
        feature: { icon: '🚀', title: 'Planner Pro', desc: 'The full planning workspace \u2014 one-time upgrade, no subscription.' },
    },
] as const;

const NURTURE_HERO_MAP: Record<string, string> = {
    'hero-nurture-1.jpg': IMG.heroNurture1,
    'hero-nurture-2.jpg': IMG.heroNurture2,
    'hero-nurture-3.jpg': IMG.heroNurture3,
    'hero-nurture-4.jpg': IMG.heroNurture4,
    'hero-nurture-5.jpg': IMG.heroNurture5,
    'hero-nurture-6.jpg': IMG.heroNurture6,
};

export function getMarketingNurtureStepCount() {
    return MARKETING_NURTURE_STEPS.length;
}

export function getMarketingNurtureEmail(input: MarketingNurtureEmailInput) {
    const step = MARKETING_NURTURE_STEPS[input.step] || MARKETING_NURTURE_STEPS[0];
    const safeUserName = esc(input.userName || 'there');
    const safeAppUrl = input.appUrl.replace(/\/+$/, '');
    const ctaUrl = `${safeAppUrl}${step.path}`;
    const safeCtaUrl = esc(ctaUrl);
    const safeUnsubscribeUrl = esc(input.unsubscribeUrl);
    const offer = 'offer' in step ? step.offer : null;
    const feature = 'feature' in step ? step.feature : null;
    const heroSrc = NURTURE_HERO_MAP[step.hero] || IMG.heroNurture1;

    const bodyHtml = step.body.map((p) => paragraph(esc(p))).join('');

    const featureHtml = feature ? `
        <tr><td class="qw-pad" style="padding:0 44px 28px;">
            ${featureCard(feature.icon, feature.title, feature.desc)}
        </td></tr>` : '';

    const offerHtml = offer ? `
        <tr><td class="qw-pad" style="padding:0 44px 28px;">
            ${card(`
                <p style="margin:0 0 16px;color:${C.primary};font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-size:10px;font-family:${FONT_BODY};">${esc(offer.label)}</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
                    <td style="vertical-align:bottom;padding:0 20px 14px 0;">
                        <p style="margin:0;font-size:12px;color:${C.textMuted};font-weight:700;font-family:${FONT_BODY};">Was</p>
                        <p style="margin:4px 0 0;font-size:28px;color:${C.textMuted};text-decoration:line-through;font-weight:400;font-family:${FONT_HEADING};">${esc(offer.oldPrice)}</p>
                    </td>
                    <td style="vertical-align:bottom;padding:0 0 14px;">
                        <p style="margin:0;font-size:12px;color:${C.textMuted};font-weight:700;font-family:${FONT_BODY};">Now</p>
                        <p style="margin:4px 0 0;font-size:48px;color:${C.text};font-weight:400;letter-spacing:0;font-family:${FONT_HEADING};">${esc(offer.newPrice)}</p>
                    </td>
                </tr></table>
                <p style="margin:0 0 20px;font-size:14px;color:${C.textSecondary};font-weight:600;font-family:${FONT_BODY};">${esc(offer.note)}</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    ${offer.highlights.map((h) => `<tr>
                        <td width="24" style="padding:6px 0;vertical-align:top;color:${C.primary};font-size:16px;font-weight:700;">&#10003;</td>
                        <td style="padding:6px 0;color:${C.textSecondary};font-size:14px;line-height:1.5;font-weight:600;font-family:${FONT_BODY};">${esc(h)}</td>
                    </tr>`).join('')}
                </table>
            `, { bg: '#FFF6F1', border: `${C.primary}33` })}
        </td></tr>` : '';

    const content = emailTable(`
        ${logoBar()}
        ${heroImage(heroSrc, '')}
        <tr><td class="qw-pad" style="padding:40px 44px 20px;">
            ${eyebrow(step.eyebrow)}
            ${heading1(step.heading)}
        </td></tr>
        <tr><td class="qw-pad" style="padding:8px 44px 28px;">
            ${paragraph(`Hi ${safeUserName},`)}
            ${bodyHtml}
        </td></tr>
        ${featureHtml}
        ${offerHtml}
        ${ctaButton(safeCtaUrl, step.cta)}
        ${footer(`
            <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${C.textMuted};font-family:${FONT_BODY};">You are receiving this because you created a QuickWeds account.</p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:${C.textMuted};font-family:${FONT_BODY};"><a href="${safeUnsubscribeUrl}" style="color:${C.primary};text-decoration:underline;">Unsubscribe from QuickWeds marketing emails</a></p>
        `)}`);

    return {
        subject: step.subject,
        html: emailShell(step.subject, content, `${step.eyebrow}: ${step.heading}`),
    };
}

import {
    THANK_YOU_DEFAULT_MESSAGE,
    getDefaultCoupleSignature,
    getThankYouTemplate,
    normalizeThankYouPhotoUrl,
    normalizeThankYouStyle,
    type ThankYouEmailInput,
} from './thank-you-email';

/**
 * Premium Email Templates for QuickWeds
 * These templates use inline CSS for maximum compatibility across email clients (Gmail, Outlook, Apple Mail).
 */

const MAIN_COLOR = '#D16C78';
const TEXT_COLOR = '#3A2A2D';
const SECONDARY_TEXT = '#7A5A61';
const BG_COLOR = '#FFF8F4';
const ACCENT_COLOR = '#4A4444';

function escapeHtml(input: string) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

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

/**
 * Template: RSVP Confirmation to Guest
 */
export function getGuestConfirmationHtml(props: EmailTemplateProps) {
    const {
        guestName, brideName, groomName, weddingDate, weddingTime,
        venueName, venueAddress, mapsLink, weddingUrl, attendance, numGuests,
        guestCode, checkInUrl
    } = props;

    const isAttending = attendance === 'Yes';
    const safeGuestCode = guestCode ? escapeHtml(guestCode) : '';
    const safeCheckInUrl = checkInUrl ? escapeHtml(checkInUrl) : '';
    const qrImageUrl = checkInUrl ? `https://quickchart.io/qr?size=240&margin=2&text=${encodeURIComponent(checkInUrl)}` : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RSVP Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(209,108,120,0.1);">
            <!-- Header Image/Icon -->
            <tr>
                <td align="center" style="padding: 48px 40px 24px;">
                    <div style="font-size: 56px; margin-bottom: 16px;">💍</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: normal; color: ${MAIN_COLOR}; letter-spacing: -0.5px;">
                        ${isAttending ? "We're so excited!" : "We'll miss you!"}
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 20px; color: ${SECONDARY_TEXT}; italic;">
                        ${brideName} & ${groomName}'s Wedding
                    </p>
                </td>
            </tr>

            <!-- Content Body -->
            <tr>
                <td style="padding: 0 48px 40px;">
                    <div style="background-color: ${BG_COLOR}; border-radius: 24px; padding: 32px; border: 1px solid rgba(209,108,120,0.15);">
                        <p style="margin: 0 0 20px; font-size: 17px; line-height: 1.6;">
                            Hi <strong>${guestName}</strong>,
                        </p>
                        <p style="margin: 0 0 24px; font-size: 17px; line-height: 1.6;">
                            ${isAttending
            ? `Thank you for RSVPing! We've saved a spot for <strong>${numGuests} guest(s)</strong>. We can't wait to celebrate this special day with you.`
            : `Thank you for letting us know. We're sorry you can't make it, but we'll be thinking of you as we celebrate!`}
                        </p>

                        ${isAttending ? `
                        <div style="border-top: 1px solid rgba(209,108,120,0.1); padding-top: 24px; margin-top: 24px;">
                            <h3 style="margin: 0 0 16px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: ${MAIN_COLOR};">
                                Wedding Schedule
                            </h3>
                            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="24" valign="top" style="padding-top: 4px;">📅</td>
                                    <td style="padding-left: 12px; padding-bottom: 20px;">
                                        <p style="margin: 0; font-size: 14px; color: ${SECONDARY_TEXT};">Date & Time</p>
                                        <p style="margin: 4px 0 0; font-size: 17px; font-weight: bold;">${weddingDate} ${weddingTime ? `@ ${weddingTime}` : ''}</p>
                                    </td>
                                </tr>
                                ${venueName ? `
                                <tr>
                                    <td width="24" valign="top" style="padding-top: 4px;">📍</td>
                                    <td style="padding-left: 12px;">
                                        <p style="margin: 0; font-size: 14px; color: ${SECONDARY_TEXT};">The Venue</p>
                                        <p style="margin: 4px 0 0; font-size: 17px; font-weight: bold;">${venueName}</p>
                                        ${venueAddress ? `<p style="margin: 4px 0 0; font-size: 15px; color: ${SECONDARY_TEXT}; line-height: 1.4;">${venueAddress}</p>` : ''}
                                        ${mapsLink ? `<a href="${mapsLink}" style="display: inline-block; margin-top: 12px; color: ${MAIN_COLOR}; font-size: 14px; font-weight: bold; text-decoration: none; border-bottom: 1px dashed ${MAIN_COLOR};">Open in Google Maps &rarr;</a>` : ''}
                                    </td>
                                </tr>` : ''}
                            </table>
                        </div>` : ''}

                        ${isAttending && checkInUrl && guestCode ? `
                        <div style="border-top: 1px solid rgba(209,108,120,0.1); padding-top: 24px; margin-top: 24px;">
                            <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: ${MAIN_COLOR};">
                                Your Event Check-In QR
                            </h3>
                            <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: ${SECONDARY_TEXT};">
                                Save this email or take a screenshot of the QR code before the wedding day. When you arrive, show it to the reception or check-in staff so they can scan it and mark your party as arrived.
                            </p>
                            <div style="text-align: center; background-color: #ffffff; border: 1px solid rgba(209,108,120,0.16); border-radius: 20px; padding: 20px; margin: 0 0 16px;">
                                <img src="${qrImageUrl}" alt="Wedding check-in QR code" width="220" height="220" style="display: inline-block; width: 220px; height: 220px; border: 0;" />
                                <p style="margin: 14px 0 0; font-size: 12px; color: ${SECONDARY_TEXT}; text-transform: uppercase; letter-spacing: 1.3px; font-weight: bold;">Backup Guest Code</p>
                                <p style="margin: 6px 0 0; font-size: 22px; color: ${TEXT_COLOR}; font-weight: bold; letter-spacing: 1px;">${safeGuestCode}</p>
                            </div>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: ${SECONDARY_TEXT}; line-height: 1.6;">
                                <tr>
                                    <td width="22" valign="top" style="color: ${MAIN_COLOR}; font-weight: bold;">1.</td>
                                    <td style="padding-bottom: 8px;">Keep this email available on your phone, or save a screenshot of the QR code.</td>
                                </tr>
                                <tr>
                                    <td width="22" valign="top" style="color: ${MAIN_COLOR}; font-weight: bold;">2.</td>
                                    <td style="padding-bottom: 8px;">Show the QR code when staff asks for check-in at the venue.</td>
                                </tr>
                                <tr>
                                    <td width="22" valign="top" style="color: ${MAIN_COLOR}; font-weight: bold;">3.</td>
                                    <td>If the QR will not scan, staff can type your backup guest code: <strong style="color: ${TEXT_COLOR};">${safeGuestCode}</strong>.</td>
                                </tr>
                            </table>
                            <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.6; color: #9b7b82;">
                                This QR is for your RSVP party only. Please do not forward it to another guest.
                            </p>
                            <p style="margin: 12px 0 0; font-size: 12px; line-height: 1.6; color: #9b7b82; word-break: break-all;">
                                Check-in link: <a href="${safeCheckInUrl}" style="color: ${MAIN_COLOR}; text-decoration: underline;">${safeCheckInUrl}</a>
                            </p>
                        </div>` : ''}
                    </div>
                </td>
            </tr>

            <!-- CTA Button -->
            <tr>
                <td align="center" style="padding: 0 48px 48px;">
                    <a href="${weddingUrl}" style="display: inline-block; padding: 18px 44px; background-color: ${MAIN_COLOR}; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(209,108,120,0.25);">
                        View Full Invitation
                    </a>
                    <p style="margin: 32px 0 0; font-size: 12px; color: ${SECONDARY_TEXT}; font-style: italic; opacity: 0.7;">
                        If you need to update your RSVP later, simply visit the link above.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td align="center" style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 13px; color: ${SECONDARY_TEXT};">
                        Created with love by <strong style="color: ${MAIN_COLOR};">QuickWeds</strong>
                    </p>
                    <p style="margin: 8px 0 0; font-size: 11px; color: #bbbbbb; text-transform: uppercase; letter-spacing: 1px;">
                        The easiest way to plan your big day
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

/**
 * Template: RSVP Notification to Couple
 */
export function getCoupleNotificationHtml(props: EmailTemplateProps) {
    const {
        guestName, guestEmail, attendance, numGuests, message,
        dietaryDetails, songRequest, plusOneNames, childrenCount, weddingUrl
    } = props;

    const isAttending = attendance === 'Yes';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New RSVP Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(209,108,120,0.1);">
            <!-- Header -->
            <tr>
                <td align="center" style="padding: 48px 40px 24px;">
                    <div style="font-size: 56px; margin-bottom: 16px;">${isAttending ? '💌' : '📩'}</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: normal; color: ${MAIN_COLOR};">New RSVP Received!</h1>
                    <p style="margin: 8px 0 0; font-size: 18px; color: ${SECONDARY_TEXT};">
                        Someone just responded to your invitation
                    </p>
                </td>
            </tr>

            <!-- Main Status Card -->
            <tr>
                <td style="padding: 0 48px 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${isAttending ? '#f0f9f1' : '#fff5f5'}; border-radius: 24px; border: 1px solid ${isAttending ? '#d1eade' : '#fbdada'};">
                        <tr>
                            <td style="padding: 32px; text-align: center;">
                                <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: ${isAttending ? '#2d6a4f' : '#b91c1c'};">Status</p>
                                <p style="margin: 12px 0 0; font-size: 28px; font-weight: bold; color: ${isAttending ? '#1b4332' : '#7f1d1d'};">
                                    ${guestName} says ${isAttending ? 'YES!' : 'NO'}
                                </p>
                                ${isAttending ? `<p style="margin: 8px 0 0; font-size: 16px; color: #40916c;">Bringing a party of <strong>${numGuests}</strong></p>` : ''}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Guest Details -->
            <tr>
                <td style="padding: 0 48px 40px;">
                    <div style="background-color: #fafafa; border-radius: 24px; padding: 32px; border: 1px solid #eeeeee;">
                        <h3 style="margin: 0 0 20px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: ${SECONDARY_TEXT}; border-bottom: 1px solid #eeeeee; padding-bottom: 12px;">
                            Guest Details
                        </h3>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 15px; border-collapse: separate; border-spacing: 0 16px;">
                            ${guestEmail ? `
                            <tr>
                                <td width="130" style="color: ${SECONDARY_TEXT};">Email</td>
                                <td style="font-weight: bold;">${guestEmail}</td>
                            </tr>` : ''}
                            
                            ${plusOneNames ? `
                            <tr>
                                <td width="130" style="color: ${SECONDARY_TEXT};">Plus Ones</td>
                                <td style="font-weight: bold;">${Array.isArray(plusOneNames) ? plusOneNames.join(', ') : plusOneNames}</td>
                            </tr>` : ''}

                            ${childrenCount ? `
                            <tr>
                                <td width="130" style="color: ${SECONDARY_TEXT};">Children</td>
                                <td style="font-weight: bold;">${childrenCount}</td>
                            </tr>` : ''}

                            ${dietaryDetails ? `
                            <tr>
                                <td width="130" style="color: ${SECONDARY_TEXT};" valign="top">Dietary</td>
                                <td style="font-weight: bold; line-height: 1.4;">${dietaryDetails}</td>
                            </tr>` : ''}

                            ${songRequest ? `
                            <tr>
                                <td width="130" style="color: ${SECONDARY_TEXT};" valign="top">Song Request</td>
                                <td style="font-weight: bold; color: ${MAIN_COLOR};">🎵 ${songRequest}</td>
                            </tr>` : ''}
                        </table>

                        ${message ? `
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 8px; font-size: 12px; color: ${SECONDARY_TEXT}; uppercase font-weight: bold;">Message for you:</p>
                            <p style="margin: 0; font-size: 16px; font-style: italic; line-height: 1.6; color: ${ACCENT_COLOR};">
                                "${message}"
                            </p>
                        </div>` : ''}
                    </div>
                </td>
            </tr>

            <!-- CTA -->
            <tr>
                <td align="center" style="padding: 0 48px 48px;">
                    <a href="${weddingUrl}" style="display: inline-block; padding: 18px 44px; background-color: ${MAIN_COLOR}; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(209,108,120,0.25);">
                        Open Guest List Dashboard
                    </a>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td align="center" style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 13px; color: ${SECONDARY_TEXT};">
                        Manage your wedding at <strong style="color: ${MAIN_COLOR};">QuickWeds</strong>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

/**
 * Template: Reminder Email to Guest
 */
export function getGuestReminderHtml(props: EmailTemplateProps) {
    const {
        guestName, brideName, groomName, weddingDate, weddingTime,
        venueName, venueAddress, mapsLink, weddingUrl, weddingTitle
    } = props;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wedding Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(209,108,120,0.1);">
            <!-- Header Image -->
            <tr>
                <td align="center" style="padding: 48px 40px 24px; background-color: ${MAIN_COLOR}; color: #ffffff;">
                    <div style="font-size: 56px; margin-bottom: 20px;">⌛</div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase;">Counting Down!</h1>
                </td>
            </tr>

            <!-- Content Body -->
            <tr>
                <td style="padding: 48px;">
                    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: normal; text-align: center;">Hi ${guestName},</h2>
                    <p style="margin: 0 0 32px; font-size: 18px; line-height: 1.6; text-align: center; color: ${SECONDARY_TEXT};">
                        Just a sweet reminder that the big day is almost here! We can't wait to celebrate with you.
                    </p>

                    <div style="background-color: ${BG_COLOR}; border-radius: 24px; padding: 40px; text-align: center; border: 1px dashed ${MAIN_COLOR};">
                        <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: ${MAIN_COLOR}; font-weight: bold;">Wedding of</p>
                        <h3 style="margin: 8px 0 24px; font-size: 32px; font-weight: normal;">${brideName} & ${groomName}</h3>
                        
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px;">
                            <tr>
                                <td style="padding-bottom: 24px;">
                                    <p style="margin: 0; font-size: 14px; color: ${SECONDARY_TEXT};">When</p>
                                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold;">${weddingDate} ${weddingTime ? `@ ${weddingTime}` : ''}</p>
                                </td>
                            </tr>
                            ${venueName ? `
                            <tr>
                                <td>
                                    <p style="margin: 0; font-size: 14px; color: ${SECONDARY_TEXT};">Where</p>
                                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold;">${venueName}</p>
                                    ${venueAddress ? `<p style="margin: 4px 0 0; font-size: 15px; color: ${SECONDARY_TEXT}; opacity: 0.8;">${venueAddress}</p>` : ''}
                                </td>
                            </tr>` : ''}
                        </table>
                    </div>
                </td>
            </tr>

            <!-- CTA Button -->
            <tr>
                <td align="center" style="padding: 0 48px 64px;">
                    <a href="${weddingUrl}" style="display: inline-block; padding: 20px 48px; background-color: ${MAIN_COLOR}; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(209,108,120,0.25);">
                        View Wedding Details & Map
                    </a>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td align="center" style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 12px; color: #bbbbbb; text-transform: uppercase; letter-spacing: 1px;">
                        Sent automatically via QuickWeds
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

/**
 * Template: Welcome Email to New User
 */
export function getWelcomeEmailHtml(userName: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to QuickWeds</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FFF8F4; color: #3A2A2D;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(209,108,120,0.1);">
            <!-- Header Image -->
            <tr>
                <td align="center" style="padding: 64px 40px; background-color: #D16C78; color: #ffffff;">
                    <div style="font-size: 64px; margin-bottom: 24px;">✨</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: normal; letter-spacing: 1px;">Welcome to QuickWeds!</h1>
                </td>
            </tr>

            <!-- Content Body -->
            <tr>
                <td style="padding: 48px;">
                    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: normal;">Hi ${userName},</h2>
                    <p style="margin: 0 0 32px; font-size: 18px; line-height: 1.6; color: #7A5A61;">
                        We're so honored to be part of your wedding journey! QuickWeds was built to make your invitations as beautiful as your love story—without the stress.
                    </p>

                    <h3 style="margin: 40px 0 24px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #D16C78; border-bottom: 1px solid #FFF8F4; padding-bottom: 12px;">
                        Getting Started in 4 Simple Steps
                    </h3>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 40px;">
                        <tr>
                            <td width="48" valign="top" style="padding-top: 4px;"><div style="width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; background-color: #FFF8F4; color: #D16C78; font-weight: bold;">1</div></td>
                            <td style="padding-bottom: 24px;">
                                <p style="margin: 0; font-size: 16px; font-weight: bold;">Pick Your Vibe</p>
                                <p style="margin: 4px 0 0; font-size: 14px; color: #7A5A61;">Browse our designer templates—from Vintage to Modern—to match your wedding theme.</p>
                            </td>
                        </tr>
                        <tr>
                            <td width="48" valign="top" style="padding-top: 4px;"><div style="width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; background-color: #FFF8F4; color: #D16C78; font-weight: bold;">2</div></td>
                            <td style="padding-bottom: 24px;">
                                <p style="margin: 0; font-size: 16px; font-weight: bold;">Tell Your Story</p>
                                <p style="margin: 4px 0 0; font-size: 14px; color: #7A5A61;">Fill in your details, venue location, and that special date everyone should save.</p>
                            </td>
                        </tr>
                        <tr>
                            <td width="48" valign="top" style="padding-top: 4px;"><div style="width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; background-color: #FFF8F4; color: #D16C78; font-weight: bold;">3</div></td>
                            <td style="padding-bottom: 24px;">
                                <p style="margin: 0; font-size: 16px; font-weight: bold;">Add the Magic</p>
                                <p style="margin: 4px 0 0; font-size: 14px; color: #7A5A61;">Upload your photos and choose custom vector accents to make it truly yours.</p>
                            </td>
                        </tr>
                        <tr>
                            <td width="48" valign="top" style="padding-top: 4px;"><div style="width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; background-color: #FFF8F4; color: #D16C78; font-weight: bold;">4</div></td>
                            <td>
                                <p style="margin: 0; font-size: 16px; font-weight: bold;">Go Live</p>
                                <p style="margin: 4px 0 0; font-size: 14px; color: #7A5A61;">Preview your page, hit publish, and share your unique wedding link with your guests!</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- CTA Button -->
            <tr>
                <td align="center" style="padding: 0 48px 64px;">
                    <a href="https://quickweds.site/builder" style="display: inline-block; padding: 20px 48px; background-color: #D16C78; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 18px; box-shadow: 0 10px 20px rgba(209,108,120,0.25);">
                        Start Building Now
                    </a>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td align="center" style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 13px; color: #7A5A61;">
                        With love from the <strong style="color: #D16C78;">QuickWeds</strong> Team
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

function textToEmailParagraphs(input: string, color: string) {
    return input
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p class="qw-email-paragraph qw-email-text" style="font-size: 17px; line-height: 1.75; margin: 0 0 18px; color: ${color};">${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
        .join('');
}

function getReadableTextColor(accentColor: string) {
    const normalized = accentColor.replace('#', '');
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 165 ? TEXT_COLOR : '#ffffff';
}

export function getThankYouNoteHtml(input: ThankYouEmailInput) {
    const { recipientName, brideName, groomName, weddingDate } = input;
    const template = getThankYouTemplate(input.templateId);
    const style = normalizeThankYouStyle(template.id, input.style);
    const fallbackSignature = getDefaultCoupleSignature(brideName, groomName);
    const message = input.message || input.personalizedMessage || THANK_YOU_DEFAULT_MESSAGE.replace('[Couple Names]', fallbackSignature);
    const coupleSignature = input.coupleSignature || fallbackSignature;
    const safePhotoUrl = template.supportsPhoto ? normalizeThankYouPhotoUrl(input.photoUrl) : '';
    const safeRecipientName = escapeHtml(recipientName || 'Guest');
    const safeBrideName = escapeHtml(brideName || 'Bride');
    const safeGroomName = escapeHtml(groomName || 'Groom');
    const safeWeddingDate = weddingDate ? escapeHtml(weddingDate) : '';
    const safeCoupleSignature = escapeHtml(coupleSignature);
    const safeEyebrow = escapeHtml(template.eyebrow);
    const safeAccent = style.accentColor;
    const safeFont = style.fontFamily;
    const accentTextColor = getReadableTextColor(safeAccent);
    const messageHtml = textToEmailParagraphs(message, TEXT_COLOR);
    const photoHtml = safePhotoUrl ? `
            <tr>
                <td style="padding: 0;">
                    <img src="${escapeHtml(safePhotoUrl)}" alt="${safeBrideName} and ${safeGroomName}" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" />
                </td>
            </tr>
    ` : '';
    const floralRule = template.id === 'romantic-floral'
        ? `<p style="margin: 14px 0 0; color: ${safeAccent}; font-size: 18px; letter-spacing: 6px;">&#10045; &#10045; &#10045;</p>`
        : '';
    const cardBackground = template.id === 'modern-minimal' ? '#ffffff' : template.id === 'simple-warm' ? '#FBFFF9' : BG_COLOR;
    const borderStyle = template.id === 'modern-minimal'
        ? '1px solid #e8e3df'
        : `1px solid ${safeAccent}33`;
    const headerBackground = template.id === 'modern-minimal' ? '#ffffff' : safeAccent;
    const headerColor = template.id === 'modern-minimal' ? safeAccent : accentTextColor;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                width: 100% !important;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            table {
                border-collapse: collapse;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
            img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
            }
            .qw-email-shell {
                width: 100% !important;
                max-width: 600px !important;
            }
            .qw-email-text {
                overflow-wrap: break-word;
                word-break: normal;
            }
            @media screen and (max-width: 640px) {
                .qw-email-shell {
                    width: calc(100% - 24px) !important;
                    margin: 12px auto !important;
                    border-radius: 18px !important;
                }
                .qw-email-header {
                    padding: 28px 18px 22px !important;
                }
                .qw-email-heading {
                    font-size: 28px !important;
                    line-height: 1.12 !important;
                }
                .qw-email-subtitle {
                    font-size: 15px !important;
                    line-height: 1.45 !important;
                }
                .qw-email-body {
                    padding: 20px 12px 26px !important;
                }
                .qw-email-card {
                    border-radius: 16px !important;
                    padding: 22px 16px !important;
                }
                .qw-email-paragraph {
                    font-size: 16px !important;
                    line-height: 1.65 !important;
                }
                .qw-email-footer {
                    padding: 0 18px 24px !important;
                }
            }
            @media screen and (max-width: 360px) {
                .qw-email-shell {
                    width: calc(100% - 16px) !important;
                    margin: 8px auto !important;
                }
                .qw-email-header {
                    padding: 24px 14px 20px !important;
                }
                .qw-email-heading {
                    font-size: 25px !important;
                }
                .qw-email-body {
                    padding: 16px 8px 22px !important;
                }
                .qw-email-card {
                    padding: 20px 14px !important;
                }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: ${safeFont}; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
        <table class="qw-email-shell" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 600px; margin: 32px auto; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px rgba(58,42,45,0.10);">
            ${photoHtml}
            <tr>
                <td class="qw-email-header" align="center" style="padding: 44px 36px 30px; background-color: ${headerBackground}; color: ${headerColor}; border-bottom: ${borderStyle};">
                    <p style="margin: 0 0 13px; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: ${headerColor};">${safeEyebrow}</p>
                    <h1 class="qw-email-heading qw-email-text" style="margin: 0; font-size: 34px; line-height: 1.15; font-weight: 400; color: ${headerColor};">Thank You</h1>
                    <p class="qw-email-subtitle qw-email-text" style="margin: 12px 0 0; font-size: 18px; color: ${headerColor}; opacity: 0.88;">${safeBrideName} &amp; ${safeGroomName}</p>
                    ${floralRule}
                </td>
            </tr>
            <tr>
                <td class="qw-email-body" style="padding: 36px 28px 42px;">
                    <div class="qw-email-card" style="background-color: ${cardBackground}; border-radius: 22px; padding: 30px; border: ${borderStyle};">
                        <p class="qw-email-paragraph qw-email-text" style="font-size: 17px; line-height: 1.7; margin: 0 0 18px; color: ${SECONDARY_TEXT};">Dear ${safeRecipientName},</p>
                        ${messageHtml}
                        ${safeWeddingDate ? `<p class="qw-email-text" style="font-size: 14px; line-height: 1.6; margin: 4px 0 22px; color: ${SECONDARY_TEXT};">A note from our wedding on <strong>${safeWeddingDate}</strong>.</p>` : ''}
                        <p class="qw-email-paragraph qw-email-text" style="font-size: 17px; line-height: 1.7; margin: 24px 0 0; color: ${TEXT_COLOR};">
                            <span style="display: block; color: ${SECONDARY_TEXT}; margin-bottom: 4px;">With love,</span>
                            <strong style="font-size: 20px; color: ${safeAccent};">${safeCoupleSignature}</strong>
                        </p>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="qw-email-footer" align="center" style="padding: 0 36px 34px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: ${SECONDARY_TEXT};">
                        Sent with love through <strong style="color: ${safeAccent};">QuickWeds</strong>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

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
    const safeInviteeEmail = escapeHtml(input.inviteeEmail);
    const safeInviterEmail = input.inviterEmail ? escapeHtml(input.inviterEmail) : 'A QuickWeds user';
    const safeRole = escapeHtml(input.role);
    const safeBrideName = escapeHtml(input.brideName || 'Bride');
    const safeGroomName = escapeHtml(input.groomName || 'Groom');
    const safeWeddingDate = input.weddingDate ? escapeHtml(input.weddingDate) : '';
    const safeVenueName = input.venueName ? escapeHtml(input.venueName) : '';
    const safeDashboardUrl = escapeHtml(input.dashboardUrl);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QuickWeds Collaboration Invite</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(209,108,120,0.12);">
            <tr>
                <td align="center" style="padding: 56px 40px 32px; background-color: ${MAIN_COLOR}; color: #ffffff;">
                    <div style="font-size: 56px; margin-bottom: 20px;">&#128140;</div>
                    <h1 style="margin: 0; font-size: 30px; font-weight: 700;">You have been invited to QuickWeds</h1>
                    <p style="margin: 12px 0 0; font-size: 16px; opacity: 0.86;">Collaborate on ${safeBrideName} &amp; ${safeGroomName}'s wedding workspace.</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 44px 48px 32px;">
                    <p style="margin: 0 0 18px; font-size: 17px; line-height: 1.6;">Hi ${safeInviteeEmail},</p>
                    <p style="margin: 0 0 24px; font-size: 17px; line-height: 1.6; color: ${SECONDARY_TEXT};">
                        ${safeInviterEmail} invited you as a <strong style="color: ${TEXT_COLOR};">${safeRole}</strong> so you can help manage wedding planning details in QuickWeds.
                    </p>
                    <div style="background-color: ${BG_COLOR}; border: 1px solid rgba(209,108,120,0.16); border-radius: 24px; padding: 28px;">
                        <p style="margin: 0 0 10px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.8px; color: ${MAIN_COLOR};">Wedding Workspace</p>
                        <h2 style="margin: 0 0 12px; font-size: 24px; color: ${TEXT_COLOR};">${safeBrideName} &amp; ${safeGroomName}</h2>
                        ${safeWeddingDate ? `<p style="margin: 0 0 8px; font-size: 15px; color: ${SECONDARY_TEXT};"><strong>Date:</strong> ${safeWeddingDate}</p>` : ''}
                        ${safeVenueName ? `<p style="margin: 0; font-size: 15px; color: ${SECONDARY_TEXT};"><strong>Venue:</strong> ${safeVenueName}</p>` : ''}
                    </div>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 0 48px 48px;">
                    <a href="${safeDashboardUrl}" style="display: inline-block; padding: 18px 40px; background-color: ${MAIN_COLOR}; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(209,108,120,0.25);">
                        Open QuickWeds Workspace
                    </a>
                    <p style="margin: 24px 0 0; font-size: 13px; color: ${SECONDARY_TEXT}; line-height: 1.6;">
                        Sign in with this email address to see and accept the shared wedding workspace.
                    </p>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 13px; color: ${SECONDARY_TEXT};">
                        Sent automatically by <strong style="color: ${MAIN_COLOR};">QuickWeds</strong>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

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
        body: [
            'QuickWeds helps you turn the key wedding details into a polished website with RSVP, guest updates, photos, maps, and planning tools in one place.',
            'Start with a template, add your story and venue details, then share one link with everyone.',
        ],
        cta: 'Build your wedding site',
        path: '/builder',
    },
    {
        subject: 'Make RSVPs easier before the guest questions start',
        eyebrow: 'Guest list momentum',
        heading: 'Collect RSVPs without chasing every reply',
        body: [
            'Your guests can RSVP from your invitation page, and you can keep responses organized from the dashboard.',
            'Planner Pro gives you more room to send guest emails, reminders, and updates when the list gets bigger.',
        ],
        cta: 'Open your dashboard',
        path: '/dashboard',
    },
    {
        subject: 'Planner Pro is now $15, down from $29',
        eyebrow: 'Limited-time offer',
        heading: 'Unlock the full planner for $15',
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
        body: [
            'Planner Pro is for the moment when your guest list, reminders, checklists, suppliers, and seating plan all need more space.',
            'It gives you more flexibility across owned weddings, planning tools, and guest communication.',
        ],
        cta: 'Upgrade to Pro',
        path: '/settings',
    },
    {
        subject: 'Give guests one beautiful place for every detail',
        eyebrow: 'Guest experience',
        heading: 'The less guests have to ask, the calmer planning feels',
        body: [
            'Use QuickWeds for the invitation, RSVP, venue details, schedule, gallery, gifts, and updates guests can revisit anytime.',
            'Pro helps you keep that experience polished as your planning grows.',
        ],
        cta: 'Polish your invitation',
        path: '/dashboard',
    },
    {
        subject: 'Ready to take the limits off QuickWeds?',
        eyebrow: 'Final nudge',
        heading: 'Upgrade when you want QuickWeds to carry more of the work',
        body: [
            'If QuickWeds is becoming your planning hub, Pro is the clean next step.',
            'You can keep building on your current wedding workspace and unlock more room for guest emails, planning details, and wedding management.',
        ],
        cta: 'Upgrade to Pro',
        path: '/settings',
    },
] as const;

export function getMarketingNurtureStepCount() {
    return MARKETING_NURTURE_STEPS.length;
}

export function getMarketingNurtureEmail(input: MarketingNurtureEmailInput) {
    const step = MARKETING_NURTURE_STEPS[input.step] || MARKETING_NURTURE_STEPS[0];
    const safeUserName = escapeHtml(input.userName || 'there');
    const safeAppUrl = input.appUrl.replace(/\/+$/, '');
    const ctaUrl = `${safeAppUrl}${step.path}`;
    const safeCtaUrl = escapeHtml(ctaUrl);
    const safeUnsubscribeUrl = escapeHtml(input.unsubscribeUrl);
    const offer = 'offer' in step ? step.offer : null;

    const bodyHtml = step.body.map((paragraph) => `
                        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: ${SECONDARY_TEXT};">
                            ${escapeHtml(paragraph)}
                        </p>
    `).join('');
    const offerHtml = offer ? `
                <tr>
                    <td style="padding: 0 44px 30px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #fff6f1; border: 1px solid rgba(209,108,120,0.26); border-radius: 22px; overflow: hidden;">
                            <tr>
                                <td style="padding: 22px 24px 8px;">
                                    <p style="margin: 0 0 14px; color: ${MAIN_COLOR}; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; font-size: 11px;">
                                        ${escapeHtml(offer.label)}
                                    </p>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                        <tr>
                                            <td style="vertical-align: bottom; padding: 0 16px 12px 0;">
                                                <p style="margin: 0; font-size: 13px; line-height: 1.4; color: ${SECONDARY_TEXT}; font-weight: 700;">Was</p>
                                                <p style="margin: 2px 0 0; font-size: 28px; line-height: 1; color: #9a858a; text-decoration: line-through; font-weight: 800;">
                                                    ${escapeHtml(offer.oldPrice)}
                                                </p>
                                            </td>
                                            <td style="vertical-align: bottom; padding: 0 0 12px;">
                                                <p style="margin: 0; font-size: 13px; line-height: 1.4; color: ${SECONDARY_TEXT}; font-weight: 700;">Now</p>
                                                <p style="margin: 2px 0 0; font-size: 46px; line-height: 0.95; color: ${TEXT_COLOR}; font-weight: 900; letter-spacing: 0;">
                                                    ${escapeHtml(offer.newPrice)}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: ${ACCENT_COLOR}; font-weight: 700;">
                                        ${escapeHtml(offer.note)}
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0 24px 22px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                        ${offer.highlights.map((highlight) => `
                                        <tr>
                                            <td width="22" style="padding: 5px 0; vertical-align: top; color: ${MAIN_COLOR}; font-size: 15px; font-weight: 900;">+</td>
                                            <td style="padding: 5px 0; color: ${SECONDARY_TEXT}; font-size: 14px; line-height: 1.5; font-weight: 700;">
                                                ${escapeHtml(highlight)}
                                            </td>
                                        </tr>
                                        `).join('')}
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
    ` : '';

    return {
        subject: step.subject,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapeHtml(step.subject)}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px rgba(209,108,120,0.12);">
                <tr>
                    <td style="padding: 0; height: 8px; background-color: ${MAIN_COLOR}; line-height: 8px; font-size: 8px;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="padding: 42px 44px 22px; background-color: #fffdfb;">
                        <p style="margin: 0 0 12px; color: ${MAIN_COLOR}; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px;">
                            ${escapeHtml(step.eyebrow)}
                        </p>
                        <h1 style="margin: 0; font-size: 30px; line-height: 1.2; color: ${TEXT_COLOR};">
                            ${escapeHtml(step.heading)}
                        </h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 44px 28px;">
                        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: ${TEXT_COLOR};">
                            Hi ${safeUserName},
                        </p>
                        ${bodyHtml}
                    </td>
                </tr>
                ${offerHtml}
                <tr>
                    <td align="center" style="padding: 0 44px 42px;">
                        <a href="${safeCtaUrl}" style="display: inline-block; padding: 16px 26px; background-color: ${MAIN_COLOR}; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 900; font-size: 15px; box-shadow: 0 12px 24px rgba(209,108,120,0.24);">
                            ${escapeHtml(step.cta)}
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
        </html>
        `,
    };
}

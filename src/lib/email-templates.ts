/**
 * Premium Email Templates for QuickWeds
 * These templates use inline CSS for maximum compatibility across email clients (Gmail, Outlook, Apple Mail).
 */

const MAIN_COLOR = '#D16C78';
const TEXT_COLOR = '#3A2A2D';
const SECONDARY_TEXT = '#7A5A61';
const BG_COLOR = '#FFF8F4';
const ACCENT_COLOR = '#4A4444';

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
    message?: string;
    dietaryDetails?: string;
    songRequest?: string;
    plusOneNames?: string;
    childrenCount?: number;
}

/**
 * Template: RSVP Confirmation to Guest
 */
export function getGuestConfirmationHtml(props: EmailTemplateProps) {
    const { 
        guestName, brideName, groomName, weddingDate, weddingTime, 
        venueName, venueAddress, mapsLink, weddingUrl, attendance, numGuests 
    } = props;
    
    const isAttending = attendance === 'Yes';

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
                                <td style="font-weight: bold;">${plusOneNames}</td>
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

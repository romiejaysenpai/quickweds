import { Resend } from 'resend';

// Initialize Resend — the API key should be set in env
const resendKey = process.env.RESEND_API_KEY || '';
const resend = resendKey ? new Resend(resendKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@quickweds.site>';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn('Resend API key not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
}

// Template: RSVP Notification to Couple
export function rsvpNotificationHtml({
  guestName, guestEmail, attendance, numGuests, message, dietaryDetails, songRequest, plusOneNames, childrenCount, weddingUrl,
}: {
  guestName: string;
  guestEmail?: string;
  attendance: string;
  numGuests: number;
  message?: string;
  dietaryDetails?: string;
  songRequest?: string;
  plusOneNames?: string;
  childrenCount?: number;
  weddingUrl: string;
}) {
  const isAttending = attendance === 'Yes';
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Georgia', serif; background: #FFF8F4; margin: 0; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; padding: 48px; box-shadow: 0 10px 30px rgba(192,128,129,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 40px; margin-bottom: 12px;">${isAttending ? '🎉' : '😢'}</div>
          <h1 style="font-size: 24px; color: #D16C78; margin: 0;">New RSVP Received</h1>
        </div>
        
        <div style="background: #FFF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; color: #7A5A61; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Guest</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #3A2A2D;">${guestName}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background: ${isAttending ? '#E8F5E9' : '#FDECEC'}; border-radius: 16px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 4px; color: #7A5A61; font-size: 12px; text-transform: uppercase;">Attendance</p>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${isAttending ? '#2E7D32' : '#8B2F3C'};">${isAttending ? 'Attending' : 'Not Attending'}</p>
          </div>
          <div style="background: #FFF8F4; border-radius: 16px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 4px; color: #7A5A61; font-size: 12px; text-transform: uppercase;">Guests</p>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #3A2A2D;">${numGuests}</p>
          </div>
        </div>

        ${guestEmail ? `
        <div style="background: #FFF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #7A5A61; font-size: 12px; text-transform: uppercase;">Guest Email</p>
          <p style="margin: 0; color: #3A2A2D; font-weight: bold;">${guestEmail}</p>
        </div>` : ''}

        ${plusOneNames ? `
        <div style="background: #FFF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #7A5A61; font-size: 12px; text-transform: uppercase;">Plus Ones</p>
          <p style="margin: 0; color: #3A2A2D;">${plusOneNames}</p>
        </div>` : ''}
        
        ${childrenCount && childrenCount > 0 ? `
        <div style="background: #FFF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #7A5A61; font-size: 12px; text-transform: uppercase;">Children Attending</p>
          <p style="margin: 0; color: #3A2A2D; font-weight: bold;">${childrenCount}</p>
        </div>` : ''}

        ${dietaryDetails ? `
        <div style="background: #FFF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #7A5A61; font-size: 12px; text-transform: uppercase;">Dietary Requirements</p>
          <p style="margin: 0; color: #3A2A2D;">${dietaryDetails}</p>
        </div>` : ''}

        ${songRequest ? `
        <div style="background: #FFF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #7A5A61; font-size: 12px; text-transform: uppercase;">Song Request 🎵</p>
          <p style="margin: 0; color: #3A2A2D;">${songRequest}</p>
        </div>` : ''}

        ${message ? `
        <div style="background: #FFF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #7A5A61; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Message</p>
          <p style="margin: 0; font-style: italic; color: #3A2A2D; line-height: 1.6;">"${message}"</p>
        </div>` : ''}

        <div style="text-align: center; margin-top: 32px;">
          <a href="${weddingUrl}" style="display: inline-block; padding: 14px 32px; background: #D16C78; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">View Dashboard</a>
        </div>

        <p style="text-align: center; margin-top: 32px; color: #7A5A61; font-size: 12px;">Sent with 💕 by QuickWeds</p>
      </div>
    </body>
    </html>
  `;
}

// Template: RSVP Confirmation to Guest
export function guestConfirmationHtml({
    guestName, attendance, numGuests, brideName, groomName, weddingDate, weddingTime, venueName, venueAddress, mapsLink, weddingUrl
}: {
    guestName: string;
    attendance: string;
    numGuests: number;
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime?: string;
    venueName?: string;
    venueAddress?: string;
    mapsLink?: string;
    weddingUrl: string;
}) {
    const isAttending = attendance === 'Yes';
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Georgia', serif; background: #FFF8F4; margin: 0; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; padding: 48px; box-shadow: 0 10px 30px rgba(192,128,129,0.1); text-align: center;">
        <div style="font-size: 40px; margin-bottom: 24px;">💍</div>
        <h1 style="font-size: 28px; color: #D16C78; margin: 0 0 8px;">${isAttending ? "We can't wait to see you!" : "We will miss you!"}</h1>
        <p style="font-size: 18px; color: #7A5A61; margin: 0 0 32px;">${brideName} &amp; ${groomName}'s Wedding</p>
        
        <div style="text-align: left; background: #FFF8F4; border-radius: 16px; padding: 32px; margin-bottom: 32px; border: 1px solid rgba(209,108,120,0.1);">
          <p style="margin: 0 0 24px; color: #3A2A2D; line-height: 1.6;">
            Hi <strong>${guestName}</strong>,<br><br>
            ${isAttending ? `We've successfully received your RSVP for ${numGuests} guest(s). We are so excited to have you celebrate with us!` : `We're sorry you can't make it, but we've received your RSVP. We'll be thinking of you on our special day!`}
          </p>

          ${isAttending ? `
          <div style="border-top: 1px solid rgba(209,108,120,0.1); pt-24; margin-top: 24px; padding-top: 24px;">
            <p style="margin: 0 0 16px; color: #D16C78; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Wedding Details</p>
            
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; color: #7A5A61; font-size: 12px;">Date & Time</p>
              <p style="margin: 4px 0 0; color: #3A2A2D; font-weight: bold;">${weddingDate} ${weddingTime ? `@ ${weddingTime}` : ''}</p>
            </div>

            ${venueName ? `
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; color: #7A5A61; font-size: 12px;">Venue</p>
              <p style="margin: 4px 0 0; color: #3A2A2D; font-weight: bold;">${venueName}</p>
              ${venueAddress ? `<p style="margin: 2px 0 0; color: #7A5A61; font-size: 13px;">${venueAddress}</p>` : ''}
              ${mapsLink ? `<a href="${mapsLink}" style="display: inline-block; margin-top: 8px; color: #D16C78; font-size: 13px; text-decoration: none; border-bottom: 1px solid #D16C78;">📍 View on Google Maps</a>` : ''}
            </div>` : ''}
          </div>` : ''}
        </div>

        <a href="${weddingUrl}" style="display: inline-block; padding: 16px 40px; background: #D16C78; color: white; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(209,108,120,0.3);">View Full Invitation</a>

        <p style="margin-top: 40px; color: #7A5A61; font-size: 12px; font-style: italic; opacity: 0.6;">
          If you need to change your RSVP details later, please visit the invitation link above or contact the couple directly.
        </p>
      </div>
      <p style="text-align: center; color: #7A5A61; font-size: 12px; margin-top: 24px;">Sent with 💕 by QuickWeds</p>
    </body>
    </html>
    `;
}

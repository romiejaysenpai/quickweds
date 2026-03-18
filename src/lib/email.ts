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
    guestName, attendance, numGuests, message, weddingUrl,
}: {
    guestName: string;
    attendance: string;
    numGuests: number;
    message?: string;
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

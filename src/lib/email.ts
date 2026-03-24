import { Resend } from 'resend';
import { getGuestConfirmationHtml, getCoupleNotificationHtml } from './email-templates';

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

export { getGuestConfirmationHtml, getCoupleNotificationHtml };

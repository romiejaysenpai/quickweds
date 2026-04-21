import { Resend } from 'resend';
import { getGuestConfirmationHtml, getCoupleNotificationHtml, getThankYouNoteHtml } from './email-templates';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html?: string;
    template?: {
        id: string;
        variables: Record<string, unknown>;
    };
}

export async function sendEmail({ to, subject, html, template }: SendEmailParams) {
    if (!resend) {
        console.error('Email configuration missing. Set RESEND_API_KEY before sending.');
        return { success: false, error: 'Email configuration missing' };
    }

    const recipientList = Array.isArray(to) ? to : [to];

    try {
        console.log(`Attempting to send email via Resend to: ${recipientList.join(', ')}`);
        console.log(`Email Subject: "${subject}" | From: "${FROM_EMAIL}"`);

        if (template?.id) {
            console.warn(`Template sending is not configured for Resend in this app yet. Falling back to HTML for template ID ${template.id}.`);
        }

        if (!html) {
            throw new Error('HTML content is required for email sending');
        }

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientList,
            subject,
            html,
        });

        if (error) {
            console.error('Resend API error:', error);
            return {
                success: false,
                error: error.message || 'Resend request failed',
                details: error,
            };
        }

        console.log(`Resend accepted the email request. ID: ${data?.id || 'n/a'}`);
        return {
            success: true,
            id: data?.id,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown email error';
        console.error('Unexpected Resend email send exception:', err);
        return { success: false, error: message };
    }
}

export { getGuestConfirmationHtml, getCoupleNotificationHtml, getThankYouNoteHtml };

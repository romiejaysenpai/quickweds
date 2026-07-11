import { Resend } from 'resend';
import { getGuestConfirmationHtml, getCoupleNotificationHtml, getThankYouNoteHtml, getCollaboratorInviteHtml } from './email-templates';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

let resendClient: Resend | null = null;

function getResendClient() {
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) return null;
    if (!resendClient) resendClient = new Resend(resendApiKey);
    return resendClient;
}

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
    const resend = getResendClient();
    if (!resend) {
        console.error('Email configuration missing. Set RESEND_API_KEY before sending.');
        return { success: false, error: 'Email configuration missing' };
    }

    const recipientList = Array.isArray(to) ? to : [to];
    const validRecipients = recipientList
        .map((recipient) => String(recipient || '').trim())
        .filter((recipient) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient));
    const safeSubject = String(subject || '')
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 500);

    if (validRecipients.length === 0) {
        return { success: false, error: 'No valid email recipients provided' };
    }
    if (!safeSubject) {
        return { success: false, error: 'Email subject is required' };
    }

    try {
        console.log(`Attempting to send email via Resend to ${validRecipients.length} recipient(s).`);
        console.log(`Email Subject: "${safeSubject}" | From: "${FROM_EMAIL}"`);

        if (template?.id) {
            console.warn(`Template sending is not configured for Resend in this app yet. Falling back to HTML for template ID ${template.id}.`);
        }

        if (!html) {
            throw new Error('HTML content is required for email sending');
        }

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: validRecipients,
            subject: safeSubject,
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

export { getGuestConfirmationHtml, getCoupleNotificationHtml, getThankYouNoteHtml, getCollaboratorInviteHtml };

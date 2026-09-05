import { Resend } from 'resend';
import type { ReactElement } from 'react';
import {
    getGuestConfirmationHtml,
    getCoupleNotificationHtml,
    getThankYouNoteHtml,
    getCollaboratorInviteHtml,
    getMarketingNurtureEmail,
    getMarketingNurtureStepCount,
} from './email-templates';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

let resendClient: Resend | null = null;

function getResendClient() {
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) return null;
    if (!resendClient) resendClient = new Resend(resendApiKey);
    return resendClient;
}

interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    contentId?: string;
}

interface SendEmailParams {
    idempotencyKey?: string;
    to: string | string[];
    subject?: string;
    html?: string;
    react?: ReactElement;
    template?: {
        id: string;
        variables: Record<string, string | number>;
    };
    attachments?: EmailAttachment[];
    tags?: { name: string; value: string }[];
}

export async function sendEmail({ to, subject, html, react, template, attachments, tags, idempotencyKey }: SendEmailParams) {
    const resend = getResendClient();
    if (!resend) {
        console.error('Email configuration missing. Set RESEND_API_KEY before sending.');
        return { success: false, error: 'Email configuration missing' };
    }

    const recipientList = Array.isArray(to) ? to : [to];
    const validRecipients = recipientList
        .map((recipient) => String(recipient || '').trim())
        .filter((recipient) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient));

    if (validRecipients.length === 0) {
        return { success: false, error: 'No valid email recipients provided' };
    }

    try {
        console.info(`Attempting to send email via Resend to ${validRecipients.length} recipient(s).`);

        if (!html && !react && !template?.id) {
            throw new Error('HTML, React Email component, or template ID is required for email sending');
        }

        const payload: any = {
            from: FROM_EMAIL,
            to: validRecipients,
            ...(subject ? { subject } : {}),
            ...(template?.id
                ? { template: { id: template.id, variables: template.variables } }
                : react
                    ? { react }
                    : { html: html || '' }),
            ...(attachments && attachments.length > 0 ? { attachments } : {}),
            ...(tags && tags.length > 0 ? { tags } : {}),
        };

        const { data, error } = await resend.emails.send(payload, idempotencyKey ? { idempotencyKey } : undefined);

        if (error) {
            console.error('Resend API error:', error);
            return {
                success: false,
                error: error.message || 'Resend request failed',
                details: error,
            };
        }

        console.info('Resend accepted the email request.');
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

export {
    getGuestConfirmationHtml,
    getCoupleNotificationHtml,
    getThankYouNoteHtml,
    getCollaboratorInviteHtml,
    getMarketingNurtureEmail,
    getMarketingNurtureStepCount,
};

import { Resend } from 'resend';
import { getGuestConfirmationHtml, getCoupleNotificationHtml, getThankYouNoteHtml } from './email-templates';

// Initialize Resend — the API key should be set in env
const resendKey = process.env.RESEND_API_KEY || '';
const resend = resendKey ? new Resend(resendKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html?: string; // Optional if using template
    template?: {
        id: string;
        variables: Record<string, any>;
    };
}

export async function sendEmail({ to, subject, html, template }: SendEmailParams) {
    if (!resend) {
        console.error('❌ Resend API key MISSING. Check RESEND_API_KEY in environment variables.');
        return { success: false, error: 'Email configuration missing' };
    }

    const recipientList = Array.isArray(to) ? to : [to];
    
    try {
        console.log(`📤 Attempting to send email to: ${recipientList.join(', ')} ...`);
        console.log(`📝 Email Subject: "${subject}" | From: "${FROM_EMAIL}"`);
        
        const payload: any = {
            from: FROM_EMAIL,
            to: recipientList,
            subject,
        };

        if (template && template.id) {
            console.log(`✨ Using Resend Template ID: ${template.id}`);
            payload.template = {
                id: template.id,
                variables: template.variables,
            };
        } else if (html) {
            payload.html = html;
            console.log(`📄 (HTML Content provided, length: ${html.length})`);
        } else {
            throw new Error('Neither HTML nor Template provided for email');
        }

        const { data, error } = await resend.emails.send(payload);

        if (error) {
            console.error('❌ Resend API Error Response:', JSON.stringify(error, null, 2));
            // Help diagnostic for common issues
            if (error.name === 'validation_error' && FROM_EMAIL.includes('quickweds.site') && !FROM_EMAIL.includes('rsvp.quickweds.site')) {
                console.warn('💡 TIP: The domain "quickweds.site" might not be verified. Use "rsvp.quickweds.site" instead.');
            }
            return { success: false, error: error.message, details: error };
        }

        console.log(`✅ Email accepted by Resend! ID: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (err: any) {
        console.error('💥 Unexpected email send exception:', err);
        return { success: false, error: err.message };
    }
}

export { getGuestConfirmationHtml, getCoupleNotificationHtml, getThankYouNoteHtml };

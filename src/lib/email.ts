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
        console.error('❌ Resend API key MISSING. Check RESEND_API_KEY in environment variables.');
        return { success: false, error: 'Email configuration missing' };
    }

    const recipientList = Array.isArray(to) ? to : [to];
    
    try {
        console.log(`📤 Attempting to send email to: ${recipientList.join(', ')} ...`);
        
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientList,
            subject,
            html,
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
            // Help diagnostic for common issues
            if (error.name === 'validation_error' && FROM_EMAIL.includes('quickweds.site')) {
                console.warn('💡 TIP: If you connected a custom Resend account, ensure you verified "quickweds.site" or set RESEND_FROM_EMAIL to a domain you own.');
            }
            return { success: false, error: error.message, details: error };
        }

        console.log(`✅ Email sent successfully! ID: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (err: any) {
        console.error('💥 Unexpected email send exception:', err);
        return { success: false, error: err.message };
    }
}

export { getGuestConfirmationHtml, getCoupleNotificationHtml };

'use server';

import { sendEmail } from '@/lib/email';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@quickweds.site';

export async function submitInquiry(formData: FormData) {
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const userEmail = formData.get('userEmail') as string;

    if (!subject || !message) {
        return { success: false, error: 'Subject and message are required' };
    }

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
            <h2 style="color: #333; margin-top: 0;">New Support Inquiry</h2>
            <p style="color: #666; font-size: 14px;">A user has submitted a general inquiry via the QuickWeds dashboard.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${userEmail || 'Unknown User'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
            <h3 style="color: #333; font-size: 16px;">Message:</h3>
            <p style="white-space: pre-wrap; color: #444; line-height: 1.5;">${message}</p>
        </div>
    `;

    const result = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[Support Inquiry] ${subject}`,
        html,
    });

    return result;
}

export async function submitFeedback(formData: FormData) {
    const type = formData.get('type') as string;
    const details = formData.get('details') as string;
    const userEmail = formData.get('userEmail') as string;

    if (!type || !details) {
        return { success: false, error: 'Type and details are required' };
    }

    const typeLabels: Record<string, string> = {
        bug: 'Error / Bug Report',
        feature: 'Feature Request',
        review: 'App Review / Feedback'
    };

    const displayType = typeLabels[type] || type;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
            <h2 style="color: #333; margin-top: 0;">New Feedback Received</h2>
            <p style="color: #666; font-size: 14px;">A user has submitted feedback via the QuickWeds dashboard.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${userEmail || 'Unknown User'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${displayType}</p>
            </div>
            <h3 style="color: #333; font-size: 16px;">Details:</h3>
            <p style="white-space: pre-wrap; color: #444; line-height: 1.5;">${details}</p>
        </div>
    `;

    const result = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[${displayType}] QuickWeds Feedback`,
        html,
    });

    return result;
}

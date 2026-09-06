'use server';

import { sendEmail } from '@/lib/email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { v2 as cloudinary } from 'cloudinary';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@quickweds.site';
const ADMIN_EMAILS = [
    ADMIN_EMAIL,
    ...(process.env.ADMIN_EMAILS || '').split(','),
].map((email) => email.trim()).filter(Boolean);

async function uploadToCloudinary(file: File): Promise<string | null> {
    try {
        const cloudinaryUrl = process.env.CLOUDINARY_URL;
        if (!cloudinaryUrl) return null;

        cloudinary.config({ cloudinary_url: cloudinaryUrl });
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return new Promise((resolve) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'support_tickets',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        resolve(null);
                    } else {
                        resolve(result?.secure_url || null);
                    }
                }
            ).end(buffer);
        });
    } catch (error) {
        console.error('File processing error:', error);
        return null;
    }
}

function getEmailWrapper(content: string, type: string, color: string = '#D16C78') {
    return `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f1;">
                <!-- Header -->
                <div style="background-color: ${color}; padding: 30px; text-align: center;">
                    <img src="https://www.quickweds.site/logo-white.png" alt="QuickWeds" style="height: 32px; margin-bottom: 10px;" onerror="this.style.display='none'">
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">${type}</h1>
                </div>
                
                <!-- Body -->
                <div style="padding: 40px;">
                    ${content}
                    
                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f0f0f0; text-align: center;">
                        <p style="font-size: 13px; color: #999; margin: 0;">This inquiry was sent from the QuickWeds Admin Support dashboard.</p>
                        <p style="font-size: 13px; color: #999; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} QuickWeds. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getOptionalString(formData: FormData, key: string, maxLength: number) {
    const value = String(formData.get(key) || '').trim();
    return value ? value.slice(0, maxLength) : null;
}

async function createSupportTicket(input: {
    userId?: string | null;
    userEmail?: string | null;
    subject: string;
    message: string;
    category: string;
    affectedFeature?: string | null;
    errorCode?: string | null;
    browser?: string | null;
    device?: string | null;
    pageUrl?: string | null;
    screenshotUrl?: string | null;
    safeMetadata?: Record<string, unknown>;
}) {
    try {
        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('support_tickets')
            .insert({
                user_id: input.userId || null,
                user_email: input.userEmail || null,
                subject: input.subject,
                message: input.message,
                category: input.category,
                affected_feature: input.affectedFeature || null,
                error_code: input.errorCode || null,
                browser: input.browser || null,
                device: input.device || null,
                page_url: input.pageUrl || null,
                screenshot_url: input.screenshotUrl || null,
                safe_metadata: input.safeMetadata || {},
                status: 'new',
                priority: input.category === 'security' ? 'critical' : input.category === 'bug' ? 'high' : 'normal',
            })
            .select('id')
            .single();

        if (error) throw error;
        return data?.id as string | undefined;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create support ticket';
        console.warn('[support] Ticket persistence skipped:', message);
        return undefined;
    }
}

export async function submitInquiry(formData: FormData) {
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const userEmail = String(formData.get('userEmail') || '').trim();
    const inquiryType = String(formData.get('inquiryType') || '').trim();
    const userId = getOptionalString(formData, 'userId', 80);
    const pageUrl = getOptionalString(formData, 'pageUrl', 300);
    const browser = getOptionalString(formData, 'browser', 200);
    const device = getOptionalString(formData, 'device', 200);
    const isCustomPlanInquiry = inquiryType === 'custom-plan' || /custom plan/i.test(subject);

    if (!subject || !message) {
        return { success: false, error: 'Subject and message are required' };
    }

    if (isCustomPlanInquiry && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        return { success: false, error: 'A valid email address is required for custom plan inquiries' };
    }

    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);
    const safeUserEmail = escapeHtml(userEmail || 'Unknown User');
    const emailType = isCustomPlanInquiry ? 'Custom Plan Inquiry' : 'New Support Inquiry';
    const brandColor = isCustomPlanInquiry ? '#8B5CF6' : '#D16C78';
    const ticketId = await createSupportTicket({
        userId,
        userEmail,
        subject,
        message,
        category: isCustomPlanInquiry ? 'custom-plan' : 'general',
        affectedFeature: isCustomPlanInquiry ? 'pricing/custom plan' : 'general support',
        browser,
        device,
        pageUrl,
        safeMetadata: {
            inquiryType: isCustomPlanInquiry ? 'custom-plan' : 'general',
            source: 'support_page',
        },
    });

    const content = `
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
            Hello Admin, you have received a new ${isCustomPlanInquiry ? 'custom plan inquiry' : 'general inquiry'}.
        </p>
        
        <div style="background-color: #fdf8f9; border-left: 4px solid ${brandColor}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>From:</strong> <span style="color: ${brandColor};">${safeUserEmail}</span></p>
            ${ticketId ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Ticket ID:</strong> ${escapeHtml(ticketId)}</p>` : ''}
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Type:</strong> ${isCustomPlanInquiry ? 'Custom Plan Request' : 'General Inquiry'}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Subject:</strong> ${safeSubject}</p>
        </div>
        
        <h3 style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px;">Inquiry Details:</h3>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
            <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #444; margin: 0;">${safeMessage}</p>
        </div>
        
        <div style="margin-top: 35px; text-align: center;">
            <a href="mailto:${encodeURIComponent(userEmail)}" style="background-color: ${brandColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Reply to User</a>
        </div>
    `;

    const html = getEmailWrapper(content, emailType, brandColor);

    const result = await sendEmail({
        to: ADMIN_EMAILS,
        subject: isCustomPlanInquiry ? `[Custom Plan Inquiry] ${subject}` : `[Support Inquiry] ${subject}`,
        html,
    });

    return { ...result, ticketId };
}

export async function submitFeedback(formData: FormData) {
    const type = formData.get('type') as string;
    const details = formData.get('details') as string;
    const userEmail = formData.get('userEmail') as string;
    const screenshot = formData.get('screenshot') as File | null;
    const userId = getOptionalString(formData, 'userId', 80);
    const affectedFeature = getOptionalString(formData, 'affectedFeature', 120);
    const errorCode = getOptionalString(formData, 'errorCode', 120);
    const browser = getOptionalString(formData, 'browser', 200);
    const device = getOptionalString(formData, 'device', 200);
    const pageUrl = getOptionalString(formData, 'pageUrl', 300);

    if (!type || !details) {
        return { success: false, error: 'Type and details are required' };
    }

    let screenshotUrl = null;
    if (screenshot && screenshot.size > 0) {
        screenshotUrl = await uploadToCloudinary(screenshot);
    }

    const typeLabels: Record<string, string> = {
        bug: 'Error / Bug Report',
        feature: 'Feature Request',
        review: 'App Review / Feedback'
    };

    const typeColors: Record<string, string> = {
        bug: '#E53E3E', // Red
        feature: '#3182CE', // Blue
        review: '#38A169' // Green
    };

    const displayType = typeLabels[type] || type;
    const brandColor = typeColors[type] || '#D16C78';
    const subject = `${displayType}: ${affectedFeature || 'QuickWeds app'}`;
    const ticketId = await createSupportTicket({
        userId,
        userEmail,
        subject,
        message: details,
        category: type === 'bug' ? 'bug' : type === 'feature' ? 'feature' : 'review',
        affectedFeature,
        errorCode,
        browser,
        device,
        pageUrl,
        screenshotUrl,
        safeMetadata: {
            source: 'support_page',
            screenshotAttached: Boolean(screenshotUrl),
        },
    });
    const safeDetails = escapeHtml(details);
    const safeUserEmail = escapeHtml(userEmail || 'Unknown User');

    const content = `
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
            A user has submitted new feedback or reported an error.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${brandColor}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>From:</strong> <span style="color: ${brandColor};">${safeUserEmail}</span></p>
            ${ticketId ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Ticket ID:</strong> ${escapeHtml(ticketId)}</p>` : ''}
            <p style="margin: 0; font-size: 14px;"><strong>Feedback Category:</strong> ${displayType}</p>
        </div>
        
        <h3 style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px;">Feedback Details:</h3>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
            <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #444; margin: 0;">${safeDetails}</p>
        </div>
        
        ${screenshotUrl ? `
            <h3 style="font-size: 18px; font-weight: 600; color: #333; margin: 30px 0 15px 0;">Attached Screenshot:</h3>
            <div style="border-radius: 12px; overflow: hidden; border: 1px solid #eee; background-color: #000;">
                <a href="${screenshotUrl}" target="_blank">
                    <img src="${screenshotUrl}" alt="User Screenshot" style="max-width: 100%; display: block; margin: 0 auto;">
                </a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 8px;">Click image to view full size</p>
        ` : ''}
        
        <div style="margin-top: 35px; text-align: center;">
            <a href="mailto:${encodeURIComponent(userEmail || '')}" style="background-color: ${brandColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Contact User</a>
        </div>
    `;

    const html = getEmailWrapper(content, 'Feedback & Error Report', brandColor);

    const result = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[${displayType}] QuickWeds Feedback`,
        html,
    });

    return { ...result, ticketId };
}

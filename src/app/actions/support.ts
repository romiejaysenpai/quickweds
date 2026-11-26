'use server';

import { headers } from 'next/headers';
import { sendEmail } from '@/lib/email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAdminEmails } from '@/lib/admin';
import { checkRateLimitAsync, sanitizeEmail } from '@/lib/rate-limit';
import { toSafeHttpUrl } from '@/lib/url-safety';
import { v2 as cloudinary } from 'cloudinary';

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_SCREENSHOT_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

function hasValidImageMagicBytes(buffer: Buffer): boolean {
    if (buffer.length < 12) return false;
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
    ) {
        return true;
    }
    // GIF: GIF87a / GIF89a
    const gifHeader = buffer.subarray(0, 6).toString('ascii');
    if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') return true;
    // WebP: RIFF....WEBP
    if (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
        return true;
    }
    return false;
}

async function getActionClientIp(): Promise<string> {
    const hdrs = await headers();
    const vercelIp = hdrs.get('x-vercel-forwarded-for')?.split(',').pop()?.trim();
    const cfIp = hdrs.get('cf-connecting-ip')?.trim();
    const realIp = hdrs.get('x-real-ip')?.trim();
    const forwarded = hdrs.get('x-forwarded-for')?.split(',').pop()?.trim();
    return vercelIp || cfIp || realIp || forwarded || 'unknown';
}

function getSupportRecipients(): string[] {
    const configured = getAdminEmails();
    return configured.length > 0 ? configured : ['support@quickweds.site'];
}

async function uploadToCloudinary(file: File): Promise<{ url: string | null; error?: string }> {
    try {
        if (file.size > MAX_SCREENSHOT_BYTES) {
            return { url: null, error: 'Screenshot must be 5 MB or smaller.' };
        }
        if (!ALLOWED_SCREENSHOT_MIME_TYPES.has(file.type.toLowerCase())) {
            return { url: null, error: 'Only JPEG, PNG, WebP, or GIF screenshots are supported.' };
        }

        const cloudinaryUrl = process.env.CLOUDINARY_URL;
        if (!cloudinaryUrl) return { url: null };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > MAX_SCREENSHOT_BYTES) {
            return { url: null, error: 'Screenshot must be 5 MB or smaller.' };
        }
        if (!hasValidImageMagicBytes(buffer)) {
            return { url: null, error: 'Uploaded file is not a valid image.' };
        }

        cloudinary.config({ cloudinary_url: cloudinaryUrl });

        return new Promise((resolve) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'support_tickets',
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        resolve({ url: null });
                    } else {
                        resolve({ url: result?.secure_url || null });
                    }
                }
            ).end(buffer);
        });
    } catch (error) {
        console.error('File processing error:', error);
        return { url: null };
    }
}

function getEmailWrapper(content: string, type: string, color: string = '#D16C78') {
    const safeType = escapeHtml(type);
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f1;">
                <!-- Header -->
                <div style="background-color: ${color}; padding: 30px; text-align: center;">
                    <img src="https://www.quickweds.site/logo-white.png" alt="QuickWeds" style="height: 32px; margin-bottom: 10px;" onerror="this.style.display='none'">
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">${safeType}</h1>
                </div>
                
                <!-- Body -->
                <div style="padding: 40px;">
                    ${content}
                    
                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f0f0f0; text-align: center;">
                        <p style="font-size: 13px; color: #999; margin: 0;">This inquiry was sent from the QuickWeds Support portal.</p>
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
                // Never trust an unverified client-supplied userId in an unauthenticated Server Action.
                user_id: null,
                user_email: input.userEmail || null,
                subject: input.subject.slice(0, 200),
                message: input.message.slice(0, 5000),
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
    const clientIp = await getActionClientIp();
    const limit = await checkRateLimitAsync(`support-inquiry:${clientIp}`, 'GUEST_BOOK');
    if (!limit.allowed) {
        return { success: false, error: 'Too many support submissions. Please try again later.' };
    }

    const subject = String(formData.get('subject') || '').trim().slice(0, 200);
    const message = String(formData.get('message') || '').trim().slice(0, 5000);
    const rawUserEmail = String(formData.get('userEmail') || '').trim();
    const userEmail = rawUserEmail ? sanitizeEmail(rawUserEmail) : '';
    const inquiryType = String(formData.get('inquiryType') || '').trim();
    const rawPageUrl = getOptionalString(formData, 'pageUrl', 300);
    const pageUrl = rawPageUrl ? (toSafeHttpUrl(rawPageUrl) || (rawPageUrl.startsWith('/') ? rawPageUrl : null)) : null;
    const browser = getOptionalString(formData, 'browser', 200);
    const device = getOptionalString(formData, 'device', 200);
    const isCustomPlanInquiry = inquiryType === 'custom-plan' || /custom plan/i.test(subject);

    if (!subject || !message) {
        return { success: false, error: 'Subject and message are required' };
    }

    if (isCustomPlanInquiry && !userEmail) {
        return { success: false, error: 'A valid email address is required for custom plan inquiries' };
    }

    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);
    const safeUserEmail = escapeHtml(userEmail || 'Unknown User');
    const emailType = isCustomPlanInquiry ? 'Custom Plan Inquiry' : 'New Support Inquiry';
    const brandColor = isCustomPlanInquiry ? '#8B5CF6' : '#D16C78';
    const ticketId = await createSupportTicket({
        userEmail: userEmail || null,
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
        
        ${userEmail ? `
        <div style="margin-top: 35px; text-align: center;">
            <a href="mailto:${encodeURIComponent(userEmail)}" style="background-color: ${brandColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Reply to User</a>
        </div>` : ''}
    `;

    const html = getEmailWrapper(content, emailType, brandColor);

    const result = await sendEmail({
        to: getSupportRecipients(),
        subject: isCustomPlanInquiry ? `[Custom Plan Inquiry] ${subject}` : `[Support Inquiry] ${subject}`,
        html,
    });

    return { ...result, ticketId };
}

export async function submitFeedback(formData: FormData) {
    const clientIp = await getActionClientIp();
    const limit = await checkRateLimitAsync(`support-feedback:${clientIp}`, 'GUEST_BOOK');
    if (!limit.allowed) {
        return { success: false, error: 'Too many feedback submissions. Please try again later.' };
    }

    const rawType = String(formData.get('type') || '').trim().toLowerCase();
    const details = String(formData.get('details') || '').trim().slice(0, 5000);
    const rawUserEmail = String(formData.get('userEmail') || '').trim();
    const userEmail = rawUserEmail ? sanitizeEmail(rawUserEmail) : '';
    const screenshot = formData.get('screenshot') as File | null;
    const affectedFeature = getOptionalString(formData, 'affectedFeature', 120);
    const errorCode = getOptionalString(formData, 'errorCode', 120);
    const browser = getOptionalString(formData, 'browser', 200);
    const device = getOptionalString(formData, 'device', 200);
    const rawPageUrl = getOptionalString(formData, 'pageUrl', 300);
    const pageUrl = rawPageUrl ? (toSafeHttpUrl(rawPageUrl) || (rawPageUrl.startsWith('/') ? rawPageUrl : null)) : null;

    const allowedTypes = new Set(['bug', 'feature', 'review']);
    const type = allowedTypes.has(rawType) ? rawType : 'review';

    if (!rawType || !details) {
        return { success: false, error: 'Type and details are required' };
    }

    let screenshotUrl: string | null = null;
    if (screenshot && screenshot.size > 0) {
        const uploaded = await uploadToCloudinary(screenshot);
        if (uploaded.error) {
            return { success: false, error: uploaded.error };
        }
        screenshotUrl = uploaded.url;
    }

    const typeLabels: Record<string, string> = {
        bug: 'Error / Bug Report',
        feature: 'Feature Request',
        review: 'App Review / Feedback',
    };

    const typeColors: Record<string, string> = {
        bug: '#E53E3E',
        feature: '#3182CE',
        review: '#38A169',
    };

    const displayType = typeLabels[type];
    const brandColor = typeColors[type];
    const subject = `${displayType}: ${affectedFeature || 'QuickWeds app'}`;
    const ticketId = await createSupportTicket({
        userEmail: userEmail || null,
        subject,
        message: details,
        category: type,
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
    const safeDisplayType = escapeHtml(displayType);
    const safeScreenshotUrl = screenshotUrl ? toSafeHttpUrl(screenshotUrl) : null;

    const content = `
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
            A user has submitted new feedback or reported an error.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${brandColor}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>From:</strong> <span style="color: ${brandColor};">${safeUserEmail}</span></p>
            ${ticketId ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Ticket ID:</strong> ${escapeHtml(ticketId)}</p>` : ''}
            <p style="margin: 0; font-size: 14px;"><strong>Feedback Category:</strong> ${safeDisplayType}</p>
        </div>
        
        <h3 style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px;">Feedback Details:</h3>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
            <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #444; margin: 0;">${safeDetails}</p>
        </div>
        
        ${safeScreenshotUrl ? `
            <h3 style="font-size: 18px; font-weight: 600; color: #333; margin: 30px 0 15px 0;">Attached Screenshot:</h3>
            <div style="border-radius: 12px; overflow: hidden; border: 1px solid #eee; background-color: #000;">
                <a href="${escapeHtml(safeScreenshotUrl)}" target="_blank" rel="noopener noreferrer">
                    <img src="${escapeHtml(safeScreenshotUrl)}" alt="User Screenshot" style="max-width: 100%; display: block; margin: 0 auto;">
                </a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 8px;">Click image to view full size</p>
        ` : ''}
        
        ${userEmail ? `
        <div style="margin-top: 35px; text-align: center;">
            <a href="mailto:${encodeURIComponent(userEmail)}" style="background-color: ${brandColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Contact User</a>
        </div>` : ''}
    `;

    const html = getEmailWrapper(content, 'Feedback & Error Report', brandColor);

    const result = await sendEmail({
        to: getSupportRecipients(),
        subject: `[${displayType}] QuickWeds Feedback`,
        html,
    });

    return { ...result, ticketId };
}

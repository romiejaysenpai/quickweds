import { sendEmail } from '@/lib/email';
import { getPublicAppUrl } from '@/lib/site-url';
import type { SupplierProfile } from '@/lib/suppliers';

function escapeHtml(value?: string | null) {
    return (value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getSupplierPublicUrl(profile: Pick<SupplierProfile, 'slug'>) {
    return `${getPublicAppUrl()}/suppliers/${profile.slug}`;
}

function getSupplierDashboardUrl() {
    return `${getPublicAppUrl()}/supplier/dashboard`;
}

function getRecipients(profile: Pick<SupplierProfile, 'email'>, ownerEmail?: string | null) {
    return Array.from(new Set([ownerEmail, profile.email]
        .map((email) => (email || '').trim().toLowerCase())
        .filter((email) => email.includes('@'))));
}

function getEmailShell(title: string, body: string, buttonLabel: string, buttonUrl: string) {
    return `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; border: 1px solid #eadeda; border-radius: 24px; background: #ffffff;">
            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #D16C78;">QuickWeds Supplier Directory</p>
            <h1 style="margin: 0 0 16px; color: #34272b; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 30px; line-height: 1.15; letter-spacing: -0.3px;">${escapeHtml(title)}</h1>
            <div style="margin: 0 0 24px; color: #6f6266; line-height: 1.7; font-size: 16px;">
                ${body}
            </div>
            <a href="${buttonUrl}" style="display: inline-block; background: #D16C78; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 15px; letter-spacing: 0.02em;">${escapeHtml(buttonLabel)}</a>
        </div>
    `;
}

export async function getSupplierOwnerEmail(db: any, profile: Pick<SupplierProfile, 'owner_user_id'>) {
    if (!profile.owner_user_id || !db?.auth?.admin?.getUserById) return null;

    try {
        const { data, error } = await db.auth.admin.getUserById(profile.owner_user_id);
        if (error) throw error;
        return data?.user?.email || null;
    } catch (error) {
        console.warn('Unable to load supplier owner email:', error);
        return null;
    }
}

export async function sendSupplierUnderReviewEmail(profile: SupplierProfile, ownerEmail?: string | null) {
    const recipients = getRecipients(profile, ownerEmail);
    if (recipients.length === 0) return;

    const html = getEmailShell(
        'Your business listing is under review',
        `
            <p style="margin: 0 0 14px;">Hi ${escapeHtml(profile.business_name)},</p>
            <p style="margin: 0 0 14px;">Thanks for submitting your business listing to QuickWeds. Our admin team is reviewing your details now.</p>
            <p style="margin: 0;">Please wait for the approval confirmation email before sharing your public supplier profile link.</p>
        `,
        'Open Supplier Dashboard',
        getSupplierDashboardUrl()
    );

    const result = await sendEmail({
        to: recipients,
        subject: 'Your QuickWeds supplier listing is under review',
        html,
    });

    if (!result.success) {
        console.warn('Supplier under-review email failed:', result.error);
    }
}

export async function sendSupplierApprovedEmail(profile: SupplierProfile, ownerEmail?: string | null) {
    const recipients = getRecipients(profile, ownerEmail);
    if (recipients.length === 0) return;

    const publicUrl = getSupplierPublicUrl(profile);
    const html = getEmailShell(
        'Your business listing is approved',
        `
            <p style="margin: 0 0 14px;">Good news: ${escapeHtml(profile.business_name)} has been approved for the QuickWeds Supplier Directory.</p>
            <p style="margin: 0 0 14px;">Your public profile is now available to couples browsing wedding suppliers.</p>
            <p style="margin: 0;">You can share your public listing here: <a href="${publicUrl}" style="color: #D16C78;">${publicUrl}</a></p>
        `,
        'View Public Profile',
        publicUrl
    );

    const result = await sendEmail({
        to: recipients,
        subject: 'Your QuickWeds supplier listing is approved',
        html,
    });

    if (!result.success) {
        console.warn('Supplier approval email failed:', result.error);
    }
}

export async function sendSupplierRejectedEmail(profile: SupplierProfile, ownerEmail?: string | null) {
    const recipients = getRecipients(profile, ownerEmail);
    if (recipients.length === 0) return;

    const html = getEmailShell(
        'Your business listing was not approved',
        `
            <p style="margin: 0 0 14px;">Thanks for submitting ${escapeHtml(profile.business_name)} to QuickWeds.</p>
            <p style="margin: 0 0 14px;">Your listing was not approved for the public directory at this time, so it will not appear publicly.</p>
            <p style="margin: 0;">You can update your listing from the supplier dashboard and submit it again.</p>
        `,
        'Update Listing',
        getSupplierDashboardUrl()
    );

    const result = await sendEmail({
        to: recipients,
        subject: 'Update needed for your QuickWeds supplier listing',
        html,
    });

    if (!result.success) {
        console.warn('Supplier rejection email failed:', result.error);
    }
}

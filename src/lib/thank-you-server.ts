import 'server-only';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { hasPlannerProAccess, isSchemaMissingError } from '@/lib/planner-limits';
import { sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limit';
import {
    THANK_YOU_DEFAULT_MESSAGE,
    buildThankYouSubject,
    getDefaultCoupleSignature,
    getThankYouTemplate,
    normalizeThankYouPhotoUrl,
    normalizeThankYouStyle,
    type ThankYouStyle,
    type ThankYouTemplateId,
} from '@/lib/thank-you-email';

export type ThankYouRecipient = {
    id: string;
    guest_name: string;
    guest_email: string;
    rsvp_status?: string | null;
    attendance?: string | null;
};

export type ThankYouBuilderPayload = {
    templateId: ThankYouTemplateId;
    subject: string;
    message: string;
    coupleSignature: string;
    style: ThankYouStyle;
    photoUrl: string;
};

type SentLogState = {
    sentEmails: Set<string>;
    sentRsvpIds: Set<string>;
    schemaAvailable: boolean;
};

export function sanitizeThankYouWeddingId(value: unknown) {
    return sanitizeWeddingId(String(value || ''));
}
export async function getThankYouAccessContext(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, weddingId, {
        select: 'id, user_id, bride_name, groom_name, wedding_date, hero_image, is_premium, payment_status',
        collaboratorRoles: ['partner', 'coordinator'],
    });

    if (!access.wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (!access.canManage) return { response: NextResponse.json({ error: 'You do not have permission to manage thank-you emails for this wedding.' }, { status: 403 }) };

    const { data: accountProfile, error: profileError } = await db
        .from('user_app_profiles')
        .select('is_pro, payment_status')
        .eq('user_id', access.wedding.user_id)
        .maybeSingle();
    if (profileError && !isSchemaMissingError(profileError)) throw profileError;

    return {
        db,
        user,
        wedding: access.wedding,
        hasPlannerPro: hasPlannerProAccess({
            isAdmin: isKnownAdminEmail(user.email),
            wedding: access.wedding,
            accountProfile,
        }),
    };
}

export function normalizeThankYouPayload(body: Record<string, any>, wedding: any): ThankYouBuilderPayload {
    const template = getThankYouTemplate(sanitizeInput(String(body.templateId || ''), { maxLength: 80 }));
    const defaultSignature = getDefaultCoupleSignature(wedding?.bride_name, wedding?.groom_name);
    const rawMessage = sanitizeInput(String(body.message || ''), { maxLength: 3000, allowNewlines: true });
    const message = rawMessage || THANK_YOU_DEFAULT_MESSAGE.replace('[Couple Names]', defaultSignature);
    const coupleSignature = sanitizeInput(String(body.coupleSignature || defaultSignature), { maxLength: 200 }) || defaultSignature;
    const subject = sanitizeInput(String(body.subject || buildThankYouSubject(wedding?.bride_name, wedding?.groom_name)), { maxLength: 160 })
        || buildThankYouSubject(wedding?.bride_name, wedding?.groom_name);
    const style = normalizeThankYouStyle(template.id, {
        accentColor: body?.style?.accentColor,
        fontFamily: body?.style?.fontFamily,
    });
    const photoUrl = template.supportsPhoto ? normalizeThankYouPhotoUrl(body.photoUrl) : '';

    return {
        templateId: template.id,
        subject,
        message,
        coupleSignature,
        style,
        photoUrl,
    };
}

export function isConfirmedGuest(guest: Pick<ThankYouRecipient, 'rsvp_status' | 'attendance'>) {
    return guest.rsvp_status === 'confirmed' || guest.rsvp_status === 'confirmed_manual' || guest.attendance === 'Yes';
}

export async function getConfirmedThankYouRecipients(db: any, weddingId: string): Promise<ThankYouRecipient[]> {
    const { data, error } = await db
        .from('rsvps')
        .select('id, guest_name, guest_email, rsvp_status, attendance')
        .eq('wedding_id', weddingId);
    if (error) throw error;

    const seenEmails = new Set<string>();
    const recipients: ThankYouRecipient[] = [];

    for (const guest of data || []) {
        const email = sanitizeEmail(guest.guest_email || '');
        if (!email || !isConfirmedGuest(guest)) continue;
        if (seenEmails.has(email)) continue;
        seenEmails.add(email);
        recipients.push({
            id: guest.id,
            guest_name: sanitizeInput(guest.guest_name || 'Guest', { maxLength: 200 }) || 'Guest',
            guest_email: email,
            rsvp_status: guest.rsvp_status,
            attendance: guest.attendance,
        });
    }

    return recipients;
}

export async function getSentThankYouLogState(db: any, weddingId: string): Promise<SentLogState> {
    const { data, error } = await db
        .from('thank_you_email_logs')
        .select('rsvp_id, recipient_email')
        .eq('wedding_id', weddingId)
        .eq('status', 'sent');

    if (error) {
        if (isSchemaMissingError(error)) {
            return { sentEmails: new Set(), sentRsvpIds: new Set(), schemaAvailable: false };
        }
        throw error;
    }

    const sentEmails = new Set<string>();
    const sentRsvpIds = new Set<string>();

    for (const row of data || []) {
        const email = sanitizeEmail(row.recipient_email || '');
        if (email) sentEmails.add(email);
        if (row.rsvp_id) sentRsvpIds.add(String(row.rsvp_id));
    }

    return { sentEmails, sentRsvpIds, schemaAvailable: true };
}

export function filterUnsentThankYouRecipients(recipients: ThankYouRecipient[], logs: SentLogState) {
    return recipients.filter((guest) => !logs.sentRsvpIds.has(guest.id) && !logs.sentEmails.has(guest.guest_email));
}

export async function insertThankYouEmailLog(db: any, input: {
    weddingId: string;
    rsvpId?: string | null;
    recipientEmail: string;
    recipientName?: string | null;
    payload: ThankYouBuilderPayload;
    status: 'sent' | 'failed' | 'test';
    providerMessageId?: string | null;
    errorMessage?: string | null;
    userId?: string | null;
}) {
    const { error } = await db.from('thank_you_email_logs').insert({
        wedding_id: input.weddingId,
        rsvp_id: input.rsvpId || null,
        recipient_email: input.recipientEmail,
        recipient_name: input.recipientName || null,
        template_id: input.payload.templateId,
        subject: input.payload.subject,
        message: input.payload.message,
        couple_signature: input.payload.coupleSignature,
        style: input.payload.style,
        photo_url: input.payload.photoUrl || null,
        status: input.status,
        provider_message_id: input.providerMessageId || null,
        error_message: input.errorMessage || null,
        sent_at: input.status === 'sent' || input.status === 'test' ? new Date().toISOString() : null,
        created_by_user_id: input.userId || null,
    });

    if (error) throw error;
}

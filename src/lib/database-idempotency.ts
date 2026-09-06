import 'server-only';

import { createHash } from 'crypto';

export const EMAIL_DELIVERY_TYPES = {
    thankYou: 'thank_you',
    photoUploadReminder: 'photo_upload_reminder',
} as const;

type SupabaseRpcClient = {
    rpc: (functionName: string, parameters: Record<string, unknown>) => Promise<{
        data: unknown;
        error: unknown;
    }>;
};

function normalizeGuestName(value: string) {
    return value
        .normalize('NFKC')
        .trim()
        .toLocaleLowerCase('en-US')
        .replace(/\s+/g, ' ');
}

export function createRsvpSubmissionKey(weddingId: string, guestName: string) {
    return createHash('sha256')
        .update(`${weddingId}\u0000${normalizeGuestName(guestName)}`)
        .digest('hex');
}

type EmailDeliveryReservation = {
    weddingId: string;
    deliveryType: (typeof EMAIL_DELIVERY_TYPES)[keyof typeof EMAIL_DELIVERY_TYPES];
    recipientKey: string;
};

export async function claimEmailDelivery(db: SupabaseRpcClient, input: EmailDeliveryReservation) {
    const { data, error } = await db.rpc('claim_email_delivery', {
        p_wedding_id: input.weddingId,
        p_delivery_type: input.deliveryType,
        p_recipient_key: input.recipientKey,
    });

    if (error) throw error;
    return typeof data === 'string' && data ? data : null;
}

export async function completeEmailDelivery(
    db: SupabaseRpcClient,
    input: EmailDeliveryReservation & { leaseToken: string; succeeded: boolean; providerMessageId?: string | null },
) {
    const { data, error } = await db.rpc('complete_email_delivery', {
        p_wedding_id: input.weddingId,
        p_delivery_type: input.deliveryType,
        p_recipient_key: input.recipientKey,
        p_lease_token: input.leaseToken,
        p_succeeded: input.succeeded,
        p_provider_message_id: input.providerMessageId || null,
    });

    if (error) throw error;
    if (data !== true) {
        throw new Error('Email delivery reservation was no longer active.');
    }
}

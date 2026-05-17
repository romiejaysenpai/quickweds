import crypto from 'crypto';
import { getPublicAppUrl } from '@/lib/site-url';

export type SupplierReviewAction = 'approve' | 'reject';

const REVIEW_ACTIONS = ['approve', 'reject'] as const;

export function isSupplierReviewAction(value: string | null | undefined): value is SupplierReviewAction {
    return REVIEW_ACTIONS.includes(value as SupplierReviewAction);
}

function getReviewSecret() {
    return process.env.SUPPLIER_REVIEW_SECRET || '';
}

function getPayload(supplierId: string, action: SupplierReviewAction, expires: string) {
    return `${supplierId}.${action}.${expires}`;
}

export function signSupplierReviewAction(supplierId: string, action: SupplierReviewAction, expires: string) {
    const secret = getReviewSecret();
    if (!secret) {
        throw new Error('Missing supplier review signing secret');
    }

    return crypto
        .createHmac('sha256', secret)
        .update(getPayload(supplierId, action, expires))
        .digest('hex');
}

export function verifySupplierReviewAction(
    supplierId: string,
    action: SupplierReviewAction,
    expires: string,
    token: string
) {
    if (!/^[a-f0-9]{64}$/i.test(token)) {
        return false;
    }

    const expected = signSupplierReviewAction(supplierId, action, expires);
    const expectedBuffer = Buffer.from(expected, 'hex');
    const tokenBuffer = Buffer.from(token, 'hex');

    return expectedBuffer.length === tokenBuffer.length && crypto.timingSafeEqual(expectedBuffer, tokenBuffer);
}

export function getSupplierReviewUrl(supplierId: string, action: SupplierReviewAction, expiresAt: Date) {
    const expires = String(expiresAt.getTime());
    const token = signSupplierReviewAction(supplierId, action, expires);
    const params = new URLSearchParams({
        supplierId,
        action,
        expires,
        token,
    });

    return `${getPublicAppUrl()}/api/suppliers/review-action?${params.toString()}`;
}

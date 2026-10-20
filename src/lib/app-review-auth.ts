import crypto from 'crypto';
import { getPublicAppUrl } from '@/lib/site-url';
import { sendEmail } from '@/lib/email';
import type { AppReview } from '@/types/review';

export type ReviewModerationAction = 'approve' | 'approve_and_feature' | 'reject';

const VALID_ACTIONS: readonly ReviewModerationAction[] = ['approve', 'approve_and_feature', 'reject'];

export function isReviewModerationAction(value: string | null | undefined): value is ReviewModerationAction {
  return Boolean(value && VALID_ACTIONS.includes(value as ReviewModerationAction));
}

function getReviewSecret(): string {
  return (
    process.env.APP_REVIEW_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    'quickweds-app-review-secret-key-2026'
  );
}

function getPayload(reviewId: string, action: ReviewModerationAction, expires: string): string {
  return `${reviewId}:${action}:${expires}`;
}

export function signReviewAction(reviewId: string, action: ReviewModerationAction, expires: string): string {
  const secret = getReviewSecret();
  return crypto
    .createHmac('sha256', secret)
    .update(getPayload(reviewId, action, expires))
    .digest('hex');
}

export function verifyReviewAction(
  reviewId: string,
  action: ReviewModerationAction,
  expires: string,
  token: string
): boolean {
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return false;
  }

  // Check expiration
  const expiresTimestamp = parseInt(expires, 10);
  if (isNaN(expiresTimestamp) || Date.now() > expiresTimestamp) {
    return false;
  }

  const expected = signReviewAction(reviewId, action, expires);
  const expectedBuffer = Buffer.from(expected, 'hex');
  const tokenBuffer = Buffer.from(token, 'hex');

  return (
    expectedBuffer.length === tokenBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, tokenBuffer)
  );
}

export function getReviewModerationUrl(
  reviewId: string,
  action: ReviewModerationAction,
  expiresAt: Date
): string {
  const expires = String(expiresAt.getTime());
  const token = signReviewAction(reviewId, action, expires);
  const params = new URLSearchParams({
    reviewId,
    action,
    expires,
    token,
  });

  return `${getPublicAppUrl()}/api/reviews/moderate?${params.toString()}`;
}

import { getAdminReviewNotificationHtml } from '@/lib/email-templates';

export async function sendAdminNewReviewNotification(review: AppReview): Promise<boolean> {
  try {
    const rawEmails = [
      process.env.ADMIN_EMAIL,
      process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      ...(process.env.ADMIN_EMAILS || '').split(','),
    ];

    const uniqueAdminEmails = Array.from(
      new Set(
        rawEmails
          .filter(Boolean)
          .map((e) => (e as string).trim())
          .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      )
    );

    if (uniqueAdminEmails.length === 0) {
      uniqueAdminEmails.push('support@quickweds.site');
    }

    const appUrl = getPublicAppUrl();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days valid

    const approveUrl = getReviewModerationUrl(review.id, 'approve', expiresAt);
    const featureUrl = getReviewModerationUrl(review.id, 'approve_and_feature', expiresAt);
    const rejectUrl = getReviewModerationUrl(review.id, 'reject', expiresAt);
    const adminHubUrl = `${appUrl}/admin/reviews`;

    const emailTemplate = getAdminReviewNotificationHtml({
      id: review.id,
      coupleNames: review.couple_names,
      weddingRole: review.wedding_role,
      detail: review.detail,
      rating: review.rating,
      quote: review.quote,
      story: review.story,
      approveUrl,
      featureUrl,
      rejectUrl,
      adminHubUrl,
    });

    const res = await sendEmail({
      to: uniqueAdminEmails,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return Boolean(res?.success);
  } catch (err) {
    console.error('Failed to send admin review notification email:', err);
    return false;
  }
}

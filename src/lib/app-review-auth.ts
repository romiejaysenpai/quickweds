import crypto from 'crypto';
import { getPublicAppUrl } from '@/lib/site-url';
import { sendEmail } from '@/lib/email';
import { getAdminEmails } from '@/lib/admin';
import { getAdminReviewNotificationHtml } from '@/lib/email-templates';
import type { AppReview } from '@/types/review';

export type ReviewModerationAction = 'approve' | 'approve_and_feature' | 'reject';

const VALID_ACTIONS: readonly ReviewModerationAction[] = ['approve', 'approve_and_feature', 'reject'];

export function isReviewModerationAction(value: string | null | undefined): value is ReviewModerationAction {
  return Boolean(value && VALID_ACTIONS.includes(value as ReviewModerationAction));
}

function getReviewSecret(): string {
  const configured = process.env.APP_REVIEW_SECRET?.trim();
  if (!configured || configured.length < 32) {
    throw new Error('APP_REVIEW_SECRET must be configured with at least 32 characters.');
  }
  return configured;
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

  const expiresTimestamp = parseInt(expires, 10);
  if (isNaN(expiresTimestamp) || Date.now() > expiresTimestamp) {
    return false;
  }

  try {
    const expected = signReviewAction(reviewId, action, expires);
    const expectedBuffer = Buffer.from(expected, 'hex');
    const tokenBuffer = Buffer.from(token, 'hex');

    return (
      expectedBuffer.length === tokenBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, tokenBuffer)
    );
  } catch {
    return false;
  }
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

export async function sendAdminNewReviewNotification(review: AppReview): Promise<boolean> {
  try {
    const adminEmails = getAdminEmails();
    const uniqueAdminEmails = adminEmails.length > 0 ? adminEmails : ['support@quickweds.site'];

    const appUrl = getPublicAppUrl();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days valid

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

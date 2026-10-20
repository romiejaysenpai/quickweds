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

export async function sendAdminNewReviewNotification(review: AppReview): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'support@quickweds.site';
    const adminEmails = [
      adminEmail,
      ...(process.env.ADMIN_EMAILS || '').split(','),
    ]
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (adminEmails.length === 0) {
      console.warn('No valid admin email configured to receive review notification.');
      return false;
    }

    const appUrl = getPublicAppUrl();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days valid

    const approveUrl = getReviewModerationUrl(review.id, 'approve', expiresAt);
    const featureUrl = getReviewModerationUrl(review.id, 'approve_and_feature', expiresAt);
    const rejectUrl = getReviewModerationUrl(review.id, 'reject', expiresAt);
    const adminHubUrl = `${appUrl}/admin/reviews`;

    const starStars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f3f4; color: #2d2627; margin: 0; padding: 24px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #ebd8dc; overflow: hidden; box-shadow: 0 10px 30px rgba(87,55,62,0.06); }
    .header { background: linear-gradient(135deg, #D16C78, #b85461); color: #ffffff; padding: 28px 24px; text-align: center; }
    .badge { display: inline-block; background: rgba(255,255,255,0.22); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border-radius: 30px; margin-bottom: 8px; }
    .title { margin: 0; font-size: 22px; font-weight: 700; }
    .content { padding: 32px 28px; }
    .review-box { background: #fdf8f9; border: 1px solid #f2dfe3; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .stars { color: #f59e0b; font-size: 22px; letter-spacing: 2px; margin-bottom: 8px; }
    .quote { font-size: 16px; font-weight: 700; color: #1f1b1c; line-height: 1.5; margin: 0 0 12px; }
    .story { font-size: 14px; color: #57474a; line-height: 1.6; margin: 0 0 16px; white-space: pre-wrap; }
    .author { font-size: 14px; font-weight: 700; color: #D16C78; }
    .detail { font-size: 12px; color: #7f6e72; margin-top: 2px; }
    .action-header { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #7f6e72; margin-bottom: 14px; text-align: center; }
    .btn-approve { display: block; background: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; text-align: center; padding: 14px 20px; border-radius: 12px; margin-bottom: 10px; }
    .btn-feature { display: block; background: #D16C78; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; text-align: center; padding: 12px 20px; border-radius: 12px; margin-bottom: 10px; }
    .btn-reject { display: block; background: #f3f4f6; color: #dc2626 !important; text-decoration: none; font-weight: 700; font-size: 13px; text-align: center; padding: 10px 20px; border-radius: 12px; }
    .footer { text-align: center; font-size: 12px; color: #9c8e92; padding: 20px; border-top: 1px solid #f2dfe3; background: #faf6f7; }
    .footer a { color: #D16C78; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">QuickWeds Moderation</div>
      <h1 class="title">New Couple Review Submitted</h1>
    </div>

    <div class="content">
      <p style="margin-top: 0; font-size: 14px; color: #57474a;">
        A new review has been submitted and is currently <strong>pending approval</strong> before appearing on the landing page.
      </p>

      <div class="review-box">
        <div class="stars">${starStars} <span style="font-size: 14px; font-weight: 700; color: #57474a;">(${review.rating} / 5)</span></div>
        <p class="quote">&ldquo;${review.quote}&rdquo;</p>
        ${review.story ? `<p class="story">${review.story}</p>` : ''}
        <div class="author">${review.couple_names}</div>
        <div class="detail">${review.wedding_role || 'Couple'} &bull; ${review.detail || 'Wedding Couple'}</div>
      </div>

      <div class="action-header">1-Click Admin Approval</div>

      <a href="${approveUrl}" class="btn-approve">
        ✓ Approve &amp; Post to Landing Page
      </a>

      <a href="${featureUrl}" class="btn-feature">
        ★ Approve &amp; Feature on Landing Page
      </a>

      <a href="${rejectUrl}" class="btn-reject">
        ✕ Reject / Spam
      </a>

      <div style="margin-top: 24px; text-align: center;">
        <a href="${adminHubUrl}" style="color: #D16C78; font-size: 13px; font-weight: 700; text-decoration: underline;">
          Or manage in Admin Dashboard &rarr;
        </a>
      </div>
    </div>

    <div class="footer">
      QuickWeds Admin Security Notification &bull; <a href="${appUrl}">quickweds.site</a>
    </div>
  </div>
</body>
</html>
`;

    const res = await sendEmail({
      to: adminEmails,
      subject: `⭐ New Review: "${review.couple_names}" (${review.rating} Stars) - Approval Needed`,
      html: emailHtml,
    });

    return Boolean(res?.success);
  } catch (err) {
    console.error('Failed to send admin review notification email:', err);
    return false;
  }
}

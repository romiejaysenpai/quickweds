import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  isReviewModerationAction,
  verifyReviewAction,
  type ReviewModerationAction,
} from '@/lib/app-review-auth';
import { revalidatePath } from 'next/cache';
import { getPublicAppUrl } from '@/lib/site-url';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderModerationPage(title: string, message: string, detail?: string, isSuccess = true) {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeDetail = detail ? escapeHtml(detail) : '';
  const appUrl = getPublicAppUrl();

  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${safeTitle} | QuickWeds Admin</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #faf5f6; color: #2e2627; }
    main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    section { max-width: 540px; width: 100%; background: #fff; border: 1px solid #ebd7dc; border-radius: 28px; padding: 40px 32px; box-shadow: 0 20px 60px rgba(87,55,62,0.08); text-align: center; }
    .icon { width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 20px; }
    .success-icon { background: #d1fae5; color: #059669; }
    .error-icon { background: #fee2e2; color: #dc2626; }
    h1 { margin: 0 0 12px; font-size: 26px; color: ${isSuccess ? '#1f1b1c' : '#dc2626'}; }
    p { margin: 0 0 20px; line-height: 1.6; color: #6f5f63; font-size: 15px; }
    .detail-box { background: #fdf8f9; border: 1px solid #f2dfe3; border-radius: 16px; padding: 16px; margin-bottom: 28px; text-align: left; font-size: 14px; font-style: italic; color: #44373a; }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary { display: inline-block; border-radius: 14px; background: #D16C78; color: white; padding: 12px 22px; text-decoration: none; font-weight: 700; font-size: 14px; }
    .btn-secondary { display: inline-block; border-radius: 14px; border: 1px solid #ebd7dc; background: #fff; color: #57474a; padding: 12px 22px; text-decoration: none; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <section>
      <div class="icon ${isSuccess ? 'success-icon' : 'error-icon'}">
        ${isSuccess ? '✓' : '✕'}
      </div>
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      ${safeDetail ? `<div class="detail-box">&ldquo;${safeDetail}&rdquo;</div>` : ''}
      <div class="actions">
        <a href="${appUrl}" class="btn-primary" target="_blank">View Live Landing Page &rarr;</a>
        <a href="${appUrl}/admin/reviews" class="btn-secondary">Open Admin Hub</a>
      </div>
    </section>
  </main>
</body>
</html>`,
    {
      status: isSuccess ? 200 : 400,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reviewId = searchParams.get('reviewId');
  const action = searchParams.get('action');
  const expires = searchParams.get('expires');
  const token = searchParams.get('token');

  if (!reviewId || !action || !expires || !token) {
    return renderModerationPage(
      'Invalid Link',
      'This moderation link is missing required verification parameters.',
      undefined,
      false
    );
  }

  if (!isReviewModerationAction(action)) {
    return renderModerationPage(
      'Invalid Action',
      'The requested moderation action is unrecognized.',
      undefined,
      false
    );
  }

  const isValid = verifyReviewAction(reviewId, action as ReviewModerationAction, expires, token);
  if (!isValid) {
    return renderModerationPage(
      'Expired or Invalid Link',
      'This action link has expired or has an invalid security signature. Please log into the QuickWeds Admin Hub to moderate this review.',
      undefined,
      false
    );
  }

  try {
    const db = getSupabaseAdminClient() as any;

    // Fetch review details first
    const { data: existingReview, error: fetchError } = await db
      .from('app_reviews')
      .select('id, couple_names, quote, rating')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return renderModerationPage(
        'Review Not Found',
        'This review could not be found in the database. It may have already been removed.',
        undefined,
        false
      );
    }

    let updatePayload: { status: string; is_featured?: boolean } = { status: 'approved' };
    let successTitle = 'Review Approved & Published!';
    let successMessage = `The review from ${existingReview.couple_names} is now live on the QuickWeds landing page!`;

    if (action === 'approve_and_feature') {
      updatePayload = { status: 'approved', is_featured: true };
      successTitle = 'Review Approved & Featured!';
      successMessage = `The review from ${existingReview.couple_names} has been approved and marked as Featured on the homepage!`;
    } else if (action === 'reject') {
      updatePayload = { status: 'rejected' };
      successTitle = 'Review Rejected';
      successMessage = `The review from ${existingReview.couple_names} was rejected and will not be displayed on the website.`;
    }

    const { error: updateError } = await db
      .from('app_reviews')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review status:', updateError);
      return renderModerationPage(
        'Database Error',
        `Failed to update review status: ${updateError.message}`,
        undefined,
        false
      );
    }

    // Invalidate caches so landing page immediately reflects the approved review
    try {
      revalidatePath('/');
      revalidatePath('/reviews');
      revalidatePath('/admin/reviews');
    } catch {
      // Safe to ignore in edge contexts
    }

    return renderModerationPage(
      successTitle,
      successMessage,
      existingReview.quote,
      true
    );
  } catch (error: any) {
    console.error('Moderation error:', error);
    return renderModerationPage(
      'Server Error',
      error?.message || 'An unexpected error occurred during moderation.',
      undefined,
      false
    );
  }
}

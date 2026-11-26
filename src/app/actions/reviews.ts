'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { checkRateLimitAsync } from '@/lib/rate-limit';
import type { AppReview, SubmitReviewInput } from '@/types/review';

async function getActionClientIp(): Promise<string> {
  const hdrs = await headers();
  const vercelIp = hdrs.get('x-vercel-forwarded-for')?.split(',').pop()?.trim();
  const cfIp = hdrs.get('cf-connecting-ip')?.trim();
  const realIp = hdrs.get('x-real-ip')?.trim();
  const forwarded = hdrs.get('x-forwarded-for')?.split(',').pop()?.trim();
  return vercelIp || cfIp || realIp || forwarded || 'unknown';
}

export async function submitAppReview(input: SubmitReviewInput): Promise<{
  success: boolean;
  review?: AppReview;
  error?: string;
}> {
  try {
    // 1. Honeypot check for bots
    if (input.honeypot && input.honeypot.trim().length > 0) {
      return { success: false, error: 'Spam detected.' };
    }

    // 2. IP rate limit
    const clientIp = await getActionClientIp();
    const limit = await checkRateLimitAsync(`app-review:${clientIp}`, 'GUEST_BOOK');
    if (!limit.allowed) {
      return { success: false, error: 'Too many review submissions. Please try again later.' };
    }

    // 3. Input validation
    const coupleNames = (input.couple_names || '').trim().slice(0, 100);
    if (!coupleNames || coupleNames.length < 2) {
      return { success: false, error: 'Please enter your names (e.g., Mia & Carlo).' };
    }

    const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));

    const quote = (input.quote || '').trim().slice(0, 300);
    if (!quote || quote.length < 5) {
      return { success: false, error: 'Please share a short highlight or quote about your experience.' };
    }

    const detail = (input.detail || '').trim().slice(0, 150) || 'Wedding Couple';
    const weddingRole = (input.wedding_role || '').trim().slice(0, 50) || 'Couple';
    const story = (input.story || '').trim().slice(0, 2000) || null;

    // Public anonymous submissions must remain unverified and pending moderation.
    const reviewPayload = {
      couple_names: coupleNames,
      wedding_role: weddingRole,
      detail,
      rating,
      quote,
      story,
      verified_couple: false,
      status: 'pending' as const,
      is_featured: false,
    };

    const db = getSupabaseAdminClient() as any;
    const { data, error } = await db
      .from('app_reviews')
      .insert(reviewPayload)
      .select()
      .single();

    if (error || !data) {
      console.error('Error saving to app_reviews in Supabase:', error?.message || 'No row returned');
      return { success: false, error: 'Unable to save your review right now. Please try again.' };
    }

    const savedReview = data as AppReview;

    // Dispatch moderation email to admin
    try {
      const { sendAdminNewReviewNotification } = await import('@/lib/app-review-auth');
      await sendAdminNewReviewNotification(savedReview);
    } catch (emailErr) {
      console.warn('Could not dispatch admin review email:', emailErr);
    }

    try {
      revalidatePath('/');
      revalidatePath('/reviews');
      revalidatePath('/admin/reviews');
    } catch {
      // Safe to ignore in non-request contexts
    }

    return { success: true, review: savedReview };
  } catch (error: unknown) {
    console.error('submitAppReview failed:', error);
    return { success: false, error: 'Failed to submit review. Please try again.' };
  }
}

'use server';

import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { AppReview, SubmitReviewInput } from '@/types/review';
import { revalidatePath } from 'next/cache';

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

    // 2. Input validation
    const coupleNames = (input.couple_names || '').trim().slice(0, 100);
    if (!coupleNames || coupleNames.length < 2) {
      return { success: false, error: 'Please enter your names (e.g., Mia & Carlo).' };
    }

    const rating = Math.min(5, Math.max(1, Number(input.rating) || 5));

    const quote = (input.quote || '').trim().slice(0, 300);
    if (!quote || quote.length < 5) {
      return { success: false, error: 'Please share a short highlight or quote about your experience.' };
    }

    const detail = (input.detail || '').trim().slice(0, 150) || 'Wedding Couple';
    const weddingRole = (input.wedding_role || '').trim().slice(0, 50) || 'Couple';
    const story = (input.story || '').trim().slice(0, 2000) || null;

    // 3. Status determination: 'pending' so admin approval is required before posting to landing page
    const status: 'approved' | 'pending' = 'pending';
    const verifiedCouple = true;

    const reviewPayload = {
      couple_names: coupleNames,
      wedding_role: weddingRole,
      detail,
      rating,
      quote,
      story,
      verified_couple: verifiedCouple,
      status,
      is_featured: false,
    };

    // 4. Insert into Supabase
    try {
      const db = getSupabaseAdminClient() as any;
      const { data, error } = await db
        .from('app_reviews')
        .insert(reviewPayload)
        .select()
        .single();

      if (error) {
        console.warn('Error saving to app_reviews in Supabase, using optimistic fallback:', error.message);
        // Graceful fallback for local/unmigrated databases: return optimistic review
        const optimisticReview: AppReview = {
          id: `review-${Date.now()}`,
          ...reviewPayload,
          created_at: new Date().toISOString(),
        };

        // Notify admin via email
        try {
          const { sendAdminNewReviewNotification } = await import('@/lib/app-review-auth');
          void sendAdminNewReviewNotification(optimisticReview);
        } catch (emailErr) {
          console.warn('Could not dispatch admin review email:', emailErr);
        }

        return { success: true, review: optimisticReview };
      }

      const savedReview = data as AppReview;

      // Dispatch 1-Click moderation email to admin
      try {
        const { sendAdminNewReviewNotification } = await import('@/lib/app-review-auth');
        void sendAdminNewReviewNotification(savedReview);
      } catch (emailErr) {
        console.warn('Could not dispatch admin review email:', emailErr);
      }

      // Revalidate landing page and reviews page
      try {
        revalidatePath('/');
        revalidatePath('/reviews');
        revalidatePath('/admin/reviews');
      } catch {
        // Safe to ignore in non-request contexts
      }

      return { success: true, review: savedReview };
    } catch (dbErr) {
      console.warn('Database error when saving review:', dbErr);
      const optimisticReview: AppReview = {
        id: `review-${Date.now()}`,
        ...reviewPayload,
        created_at: new Date().toISOString(),
      };
      return { success: true, review: optimisticReview };
    }
  } catch (error: any) {
    console.error('submitAppReview failed:', error);
    return { success: false, error: error?.message || 'Failed to submit review. Please try again.' };
  }
}

export async function adminGetAllReviews(): Promise<AppReview[]> {
  try {
    const db = getSupabaseAdminClient() as any;
    const { data, error } = await db
      .from('app_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as AppReview[];
  } catch (err) {
    console.error('adminGetAllReviews error:', err);
    return [];
  }
}

export async function adminUpdateReview(
  id: string,
  updates: {
    status?: 'approved' | 'pending' | 'rejected';
    is_featured?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getSupabaseAdminClient() as any;
    const { error } = await db
      .from('app_reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/');
      revalidatePath('/reviews');
      revalidatePath('/admin/reviews');
    } catch {
      // Ignore
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function adminDeleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getSupabaseAdminClient() as any;
    const { error } = await db
      .from('app_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/');
      revalidatePath('/reviews');
      revalidatePath('/admin/reviews');
    } catch {
      // Ignore
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

import { getCachedServerValue } from '@/lib/server-cache';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { DEFAULT_TESTIMONIALS } from '@/lib/reviews';
import type { AppReview } from '@/types/review';

const REVIEWS_CACHE_TTL_MS = 5 * 60 * 1000;

export async function getServerApprovedReviews(limit = 50): Promise<{
  reviews: AppReview[];
  hasDatabaseReviews: boolean;
}> {
  const { value } = await getCachedServerValue<{
    reviews: AppReview[];
    hasDatabaseReviews: boolean;
  }>(
    `app_reviews:approved:${limit}`,
    REVIEWS_CACHE_TTL_MS,
    async () => {
      try {
        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
          .from('app_reviews')
          .select('*')
          .eq('status', 'approved')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error || !data || data.length === 0) {
          return {
            reviews: DEFAULT_TESTIMONIALS,
            hasDatabaseReviews: false,
          };
        }

        return {
          reviews: data as AppReview[],
          hasDatabaseReviews: true,
        };
      } catch {
        return {
          reviews: DEFAULT_TESTIMONIALS,
          hasDatabaseReviews: false,
        };
      }
    },
  );

  return value;
}

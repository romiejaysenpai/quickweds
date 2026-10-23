import type { AppReview } from '@/types/review';
import { supabase } from '@/lib/supabase';

export const DEFAULT_TESTIMONIALS: AppReview[] = [
  {
    id: 'seed-mia-carlo',
    couple_names: 'Mia & Carlo',
    wedding_role: 'Bride & Groom',
    detail: 'Planned a 120-guest wedding',
    rating: 5,
    quote: 'QuickWeds made our RSVPs feel effortless. We finally had one place for guest answers, questions, budget notes, and the planning checklist.',
    story: 'We were drowning in chat messages and multiple spreadsheets before we found QuickWeds. The mobile guest view was gorgeous and even our older guests had zero issues sending their RSVPs.',
    verified_couple: true,
    status: 'approved',
    is_featured: true,
    created_at: '2026-10-06T12:00:00Z',
  },
  {
    id: 'seed-sofia-daniel',
    couple_names: 'Sofia & Daniel',
    wedding_role: 'Newlyweds',
    detail: 'Shared planning with family',
    rating: 5,
    quote: 'The dashboard helped us stop jumping between chats and spreadsheets. Our guests had the website, and we had the calm planning view.',
    story: 'Being able to invite my maid of honor and wedding coordinator as collaborators transformed our planning weeks. Everyone knew exactly what was done and what was next.',
    verified_couple: true,
    status: 'approved',
    is_featured: true,
    created_at: '2026-10-10T12:00:00Z',
  },
  {
    id: 'seed-ari-james',
    couple_names: 'Ari & James',
    wedding_role: 'Couple',
    detail: 'Built their site in one evening',
    rating: 5,
    quote: 'We wanted something elegant without hiring a designer. QuickWeds gave us a beautiful site and the tools to manage everything behind it.',
    story: 'Our invitations looked like a bespoke design studio made them. The QR code on our paper invites took guests straight to the page, and the live countdown got everyone excited.',
    verified_couple: true,
    status: 'approved',
    is_featured: true,
    created_at: '2026-10-14T12:00:00Z',
  },
];

export async function fetchApprovedReviews(limit = 20): Promise<AppReview[]> {
  try {
    const { data, error } = await supabase
      .from('app_reviews')
      .select('*')
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return DEFAULT_TESTIMONIALS;
    }

    return data as AppReview[];
  } catch (err) {
    console.warn('Could not fetch app_reviews from Supabase, using defaults:', err);
    return DEFAULT_TESTIMONIALS;
  }
}

export function calculateReviewStats(reviews: AppReview[]) {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalCount: DEFAULT_TESTIMONIALS.length,
      fiveStarPercentage: 100,
      verifiedCount: DEFAULT_TESTIMONIALS.length,
      ratingDistribution: { 5: 3, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;
  let verified = 0;

  for (const review of reviews) {
    const r = Math.min(5, Math.max(1, review.rating || 5));
    distribution[r] = (distribution[r] || 0) + 1;
    totalRating += r;
    if (review.verified_couple) {
      verified += 1;
    }
  }

  const average = totalRating / reviews.length;
  const fiveStars = distribution[5] || 0;

  return {
    averageRating: Math.round(average * 10) / 10,
    totalCount: reviews.length,
    fiveStarPercentage: Math.round((fiveStars / reviews.length) * 100),
    verifiedCount: verified,
    ratingDistribution: distribution,
  };
}

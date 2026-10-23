'use client';

import type { AppReview } from '@/types/review';
import { Quote, Star, CheckCircle2 } from 'lucide-react';

interface ReviewCardProps {
  review: AppReview;
  index?: number;
  featured?: boolean;
}

export function ReviewCard({ review, index = 0, featured = false }: ReviewCardProps) {
  const initials = review.couple_names
    .split(' ')
    .filter((name) => name !== '&' && name !== 'and')
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article
      className={`relative flex min-h-full flex-col overflow-hidden rounded-[1.4rem] border bg-white p-5 text-left shadow-[0_14px_38px_rgba(87,55,62,0.07)] transition-all hover:shadow-[0_20px_45px_rgba(87,55,62,0.12)] sm:rounded-[2rem] sm:p-7 ${
        featured ? 'border-primary/30 ring-1 ring-primary/20 md:-translate-y-2' : 'border-border/80'
      }`}
    >
      <div
        className="absolute right-5 top-4 font-serif text-6xl font-bold leading-none text-primary/[0.07]"
        aria-hidden="true"
      >
        “
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-secondary" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating ? 'fill-current text-[#eab308]' : 'text-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {review.verified_couple && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Verified Couple
            </span>
          )}
          {typeof index === 'number' && (
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-primary/50">
              Story {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      <Quote className="mb-3 h-7 w-7 text-primary/25" />

      <p className="flex-1 text-[15px] font-semibold leading-7 text-foreground sm:text-base sm:leading-8">
        &quot;{review.quote}&quot;
      </p>

      {review.story && review.story !== review.quote && (
        <p className="mt-3 text-xs leading-5 text-text-secondary sm:text-sm line-clamp-3">
          {review.story}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3 border-t border-border/80 pt-5">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
          {initials || 'QW'}
        </div>
        <div>
          <p className="font-serif text-lg font-bold text-foreground sm:text-xl">
            {review.couple_names}
          </p>
          <p className="mt-0.5 text-xs font-black uppercase tracking-[0.16em] text-primary/70">
            {review.detail || review.wedding_role || 'Happy Couple'}
          </p>
        </div>
      </div>
    </article>
  );
}

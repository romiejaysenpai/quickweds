'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Heart,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Filter,
  PenLine,
  Loader2,
} from 'lucide-react';
import type { AppReview } from '@/types/review';
import { DEFAULT_TESTIMONIALS, calculateReviewStats, fetchApprovedReviews } from '@/lib/reviews';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewModal } from '@/components/reviews/ReviewModal';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AppReview[]>(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  useEffect(() => {
    document.title = 'Real Couple Reviews & Stories | QuickWeds';
    async function load() {
      try {
        const data = await fetchApprovedReviews(50);
        setReviews(data);
      } catch (err) {
        console.warn('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleReviewSubmitted = (newReview: AppReview) => {
    if (newReview.status === 'approved') {
      setReviews((prev) => [newReview, ...prev]);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedRating === 'all') return true;
    return r.rating === selectedRating;
  });

  const stats = calculateReviewStats(reviews);

  return (
    <div className="min-h-screen bg-[#faf6f7] text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-primary transition-colors sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to QuickWeds
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-primary">
              QuickWeds
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <PenLine className="h-4 w-4" />
            <span className="hidden sm:inline">Write a Review</span>
            <span className="sm:hidden">Review</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-[#faf6f7] px-4 py-12 sm:px-6 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/90 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary shadow-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 fill-primary text-primary" />
            Real Couples • Genuine Stories
          </span>
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-5xl lg:text-6xl tracking-tight">
            Loved by Couples. Celebrated by Guests.
          </h1>
          <p className="mt-4 text-sm text-text-secondary sm:text-lg max-w-2xl mx-auto">
            Discover why modern newlyweds choose QuickWeds for their wedding websites, QR RSVPs, seating charts, and stress-free planning.
          </p>

          {/* Social Proof Stats Banner */}
          <div className="mt-8 sm:mt-10 mx-auto max-w-3xl rounded-3xl border border-primary/15 bg-white p-6 shadow-[0_16px_50px_rgba(87,55,62,0.08)] sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-border/80">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-secondary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current text-[#eab308]" />
                  ))}
                </div>
                <p className="mt-2 text-3xl font-extrabold text-foreground font-serif">
                  {stats.averageRating} <span className="text-sm font-normal text-text-secondary">/ 5.0</span>
                </p>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Average Couple Rating
                </p>
              </div>

              <div className="flex flex-col items-center justify-center sm:px-4">
                <p className="text-3xl font-extrabold text-primary font-serif">
                  {stats.totalCount}+
                </p>
                <p className="mt-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Stories & Feedback Shared
                </p>
                <p className="mt-1 text-[11px] text-text-secondary">
                  From weddings of 20 to 500+ guests
                </p>
              </div>

              <div className="flex flex-col items-center justify-center sm:px-4">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>100% Genuine</span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-foreground font-serif">
                  {stats.fiveStarPercentage}%
                </p>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  5-Star Ratings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Reviews List Section */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Filter and CTA Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-text-secondary mr-2">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedRating('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedRating === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-border text-text-secondary hover:border-primary/50'
              }`}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRating(r)}
                className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedRating === r
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-border text-text-secondary hover:border-primary/50'
                }`}
              >
                <span>{r} Stars</span>
                <Star className="h-3 w-3 fill-current text-[#eab308]" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            <Heart className="h-3.5 w-3.5 fill-primary" />
            Share Your Experience
          </button>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-text-secondary">
              Loading Couple Stories...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-primary/40 mb-3" />
            <h3 className="font-serif text-xl font-bold text-foreground">No reviews match this filter</h3>
            <p className="mt-1 text-xs text-text-secondary">Try switching back to &apos;All&apos; to view all couple stories.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                index={index}
                featured={review.is_featured}
              />
            ))}
          </div>
        )}

        {/* Bottom Call to Action */}
        <div className="mt-16 rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-secondary/10 p-8 text-center sm:p-12 shadow-sm">
          <Heart className="mx-auto h-10 w-10 text-primary mb-3 fill-primary/20" />
          <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Are you planning a wedding with QuickWeds?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
            Your review helps future brides and grooms plan with confidence. It takes only 60 seconds to share your story!
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg sm:text-sm"
            >
              Write a Review
            </button>
            <Link
              href="/signup"
              className="rounded-xl border border-border bg-white px-6 py-3 text-xs font-bold text-foreground hover:bg-neutral/40 transition-colors sm:text-sm"
            >
              Start Your Free Wedding Website
            </Link>
          </div>
        </div>
      </main>

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}

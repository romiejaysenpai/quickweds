'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Sparkles,
  Trash2,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import type { AppReview } from '@/types/review';
import { adminGetAllReviews, adminUpdateReview, adminDeleteReview } from '@/app/actions/reviews';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await adminGetAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Reviews Moderation | QuickWeds Admin';
    loadReviews();
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    setUpdatingId(id);
    const res = await adminUpdateReview(id, { status });
    if (res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    }
    setUpdatingId(null);
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setUpdatingId(id);
    const res = await adminUpdateReview(id, { is_featured: !currentFeatured });
    if (res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_featured: !currentFeatured } : r))
      );
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setUpdatingId(id);
    const res = await adminDeleteReview(id);
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    setUpdatingId(null);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-white p-5 shadow-xl sm:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Hub
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Couple Reviews & Feedback Moderation
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-text-secondary">
              Review, feature, approve, or remove user-submitted testimonials for the landing page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadReviews}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:bg-neutral/20 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/reviews"
              target="_blank"
              className="rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              View Public Page ↗
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Star className="mx-auto h-8 w-8 text-text-secondary/40 mb-2" />
            <p className="font-bold text-foreground">No user reviews found in database yet.</p>
            <p className="mt-1 text-xs text-text-secondary">
              When users submit stories from the landing page or `/reviews`, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isUpdating = updatingId === review.id;
              return (
                <div
                  key={review.id}
                  className={`relative flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all sm:flex-row sm:items-center ${
                    review.status === 'rejected'
                      ? 'border-red-200 bg-red-50/40 opacity-70'
                      : review.status === 'pending'
                      ? 'border-amber-200 bg-amber-50/40'
                      : review.is_featured
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5 text-[#eab308]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-current' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>

                      <span className="font-bold text-sm text-foreground">
                        {review.couple_names}
                      </span>

                      {review.wedding_role && (
                        <span className="rounded-md bg-neutral/40 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                          {review.wedding_role}
                        </span>
                      )}

                      {review.verified_couple && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}

                      {review.is_featured && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black text-primary flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Featured on Homepage
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          review.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : review.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-foreground italic">
                      &quot;{review.quote}&quot;
                    </p>

                    {review.story && (
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        {review.story}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-text-secondary">
                      <span>{review.detail}</span>
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border/80 pt-3 sm:border-t-0 sm:pt-0">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleToggleFeatured(review.id, review.is_featured)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        review.is_featured
                          ? 'border border-primary bg-primary text-white'
                          : 'border border-border bg-white text-text-secondary hover:border-primary/50'
                      }`}
                    >
                      {review.is_featured ? '★ Featured' : 'Feature'}
                    </button>

                    {review.status !== 'approved' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(review.id, 'approved')}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}

                    {review.status !== 'rejected' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(review.id, 'rejected')}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleDelete(review.id)}
                      className="rounded-xl p-2 text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X, Star, Heart, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitAppReview } from '@/app/actions/reviews';
import type { AppReview } from '@/types/review';
import { ReviewCard } from './ReviewCard';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: AppReview) => void;
}

export function ReviewModal({ isOpen, onClose, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingRole, setWeddingRole] = useState('Bride & Groom');
  const [detail, setDetail] = useState('');
  const [quote, setQuote] = useState('');
  const [story, setStory] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewReview: AppReview = {
    id: 'preview',
    couple_names: coupleNames.trim() || 'Your Names',
    wedding_role: weddingRole,
    detail: detail.trim() || 'Planned our dream wedding',
    rating: rating,
    quote: quote.trim() || 'QuickWeds made our wedding planning feel calm, beautiful, and completely organized.',
    story: story.trim() || undefined,
    verified_couple: true,
    status: 'approved',
    is_featured: false,
    created_at: new Date().toISOString(),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!coupleNames.trim() || coupleNames.trim().length < 2) {
      setError('Please enter your names (e.g. Mia & Carlo).');
      return;
    }

    if (!quote.trim() || quote.trim().length < 5) {
      setError('Please share a short highlight about your experience.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitAppReview({
        couple_names: coupleNames,
        wedding_role: weddingRole,
        detail: detail || undefined,
        rating,
        quote,
        story: story || undefined,
        honeypot,
      });

      if (!res.success || !res.review) {
        setError(res.error || 'Failed to submit review.');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D16C78', '#F3B5C0', '#F08080', '#F9E5E8'],
        });
      } catch {
        // Safe fallback
      }

      if (onReviewSubmitted) {
        onReviewSubmitted(res.review);
      }

      setTimeout(() => {
        setSubmitting(false);
        // Reset form
        setCoupleNames('');
        setDetail('');
        setQuote('');
        setStory('');
        setSubmitted(false);
        onClose();
      }, 2200);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-primary/20 bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-full p-2 text-text-secondary hover:bg-neutral/40 hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Thank you for sharing your story!
            </h3>
            <p className="mt-2 max-w-md text-sm text-text-secondary">
              Your review has been submitted for review. Once verified by our team, it will appear on the landing page!
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6 border-b border-border/80 pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary mb-2">
                <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
                Couple Feedback
              </span>
              <h2 id="modal-title" className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                Share Your Wedding Experience
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                Tell other couples how QuickWeds helped your invitations, RSVP tracking, or wedding day.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs sm:text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field for anti-bot */}
              <input
                type="text"
                name="user_note_verify"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-foreground mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      aria-label={`${star} star rating`}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-current text-[#eab308]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-primary">
                    {rating === 5
                      ? '5.0 - Absolutely loved it!'
                      : rating === 4
                      ? '4.0 - Great experience'
                      : rating === 3
                      ? '3.0 - Good'
                      : `${rating}.0`}
                  </span>
                </div>
              </div>

              {/* Couple Names & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground mb-1">
                    Couple Names <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mia & Carlo"
                    value={coupleNames}
                    onChange={(e) => setCoupleNames(e.target.value)}
                    maxLength={80}
                    className="w-full rounded-xl border border-border bg-neutral/10 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground mb-1">
                    Your Role
                  </label>
                  <select
                    value={weddingRole}
                    onChange={(e) => setWeddingRole(e.target.value)}
                    className="w-full rounded-xl border border-border bg-neutral/10 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
                  >
                    <option value="Bride & Groom">Bride & Groom</option>
                    <option value="Newlyweds">Newlyweds</option>
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                    <option value="Wedding Planner">Wedding Coordinator / Planner</option>
                    <option value="Guest">Wedding Guest</option>
                  </select>
                </div>
              </div>

              {/* Detail / Context */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-foreground mb-1">
                  Wedding Detail / Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. Planned a 120-guest garden wedding in Cebu"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-xl border border-border bg-neutral/10 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Highlight Quote */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-foreground mb-1">
                  Short Highlight / Headline <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. QuickWeds made our RSVPs feel effortless and our guests loved the site!"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  maxLength={250}
                  className="w-full rounded-xl border border-border bg-neutral/10 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none resize-none"
                />
                <p className="mt-0.5 text-right text-[11px] text-text-secondary">
                  {quote.length}/250
                </p>
              </div>

              {/* Full Story (Optional) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-foreground mb-1">
                  Full Story or Favorite Feature <span className="text-text-secondary/70 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us what you liked most: the custom website, the QR check-in, the seating planner, or guest messaging..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  maxLength={1000}
                  className="w-full rounded-xl border border-border bg-neutral/10 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* Live Preview Toggle */}
              <div className="pt-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-primary mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Live Landing Page Preview
                </p>
                <div className="rounded-2xl border border-border/80 bg-neutral/20 p-2 sm:p-3">
                  <ReviewCard review={previewReview} index={0} featured={false} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-neutral/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 fill-white" />
                      Post Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

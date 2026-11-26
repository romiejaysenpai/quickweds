'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { useSectionActions } from '@/context/SectionContext';
import { SectionTemplateElement } from './SectionTemplateElement';
import type { Wedding } from '@/types/wedding';

interface GuestBookEntry {
    id: string;
    guest_name: string;
    message: string;
    photo_url?: string;
    created_at: string;
}

interface GuestBookProps {
    weddingId: string;
    wedding?: Wedding;
}

const INITIAL_VISIBLE_COUNT = 6;

function formatEntryDate(value?: string) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GuestBook({ weddingId, wedding }: GuestBookProps) {
    const { registerSection, unregisterSection } = useSectionActions();
    const visual = getTemplateVisualProfile(wedding?.template || 'classic', wedding?.motif_color || '#D16C78', false, wedding?.card_style);
    const titleStyle = wedding ? getSectionTitleStyle(wedding, visual.headingClass) : { className: visual.headingClass, style: undefined };
    const isSharp = visual.isSharp;
    const inputClass = `w-full border px-4 py-3 text-base outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
        isSharp ? 'rounded-none' : 'rounded-xl'
    } ${
        visual.isDark
            ? 'border-white/20 bg-white/[0.06] text-white placeholder:text-white/55'
            : 'border-black/15 bg-white/75 text-[#292524] placeholder:text-[#57534e]/75'
    }`;

    const [entries, setEntries] = useState<GuestBookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [shouldFetch, setShouldFetch] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const sectionRef = useRef<HTMLElement | null>(null);
    const submitTimerRef = useRef<number | null>(null);

    useEffect(() => {
        registerSection('guestbook', 'Notes');
        return () => unregisterSection('guestbook');
    }, [registerSection, unregisterSection]);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            setShouldFetch(true);
            return;
        }
        const observer = new IntersectionObserver(
            (items) => {
                if (items.some((item) => item.isIntersecting)) {
                    setShouldFetch(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '320px 0px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!shouldFetch || !weddingId) return;
        const controller = new AbortController();
        const fetchEntries = async () => {
            try {
                const response = await fetch(`/api/public/guest-book?weddingId=${encodeURIComponent(weddingId)}`, {
                    signal: controller.signal,
                });
                const data = await response.json().catch(() => ({}));

                if (!controller.signal.aborted && response.ok && Array.isArray(data.entries)) {
                    setEntries(data.entries);
                }
            } catch (err) {
                if ((err as Error)?.name !== 'AbortError') {
                    console.warn('Guest book load failed:', err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        void fetchEntries();
        return () => controller.abort();
    }, [shouldFetch, weddingId]);

    useEffect(() => {
        return () => {
            if (submitTimerRef.current !== null) {
                window.clearTimeout(submitTimerRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setSubmitting(true);
        setSubmitError('');
        try {
            const response = await fetch('/api/public/guest-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId,
                    guestName: name.trim(),
                    message: message.trim(),
                }),
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok && data.entry) {
                setEntries((prev) => [data.entry, ...prev]);
                setSubmitted(true);
                setName('');
                setMessage('');
                if (submitTimerRef.current !== null) {
                    window.clearTimeout(submitTimerRef.current);
                }
                submitTimerRef.current = window.setTimeout(() => setSubmitted(false), 3500);
            } else {
                setSubmitError(data.error || 'Could not post your message. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setSubmitError('Network error while posting your message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const visibleEntries = showAll ? entries : entries.slice(0, INITIAL_VISIBLE_COUNT);

    return (
        <section ref={sectionRef} data-wedding-section="guestbook" id="guestbook" className={`relative overflow-x-clip py-16 md:py-24 px-4 sm:px-6 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="mx-auto max-w-4xl">
                <div className="mb-10 text-center sm:mb-12">
                    <div className="mb-4 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual.badgeStyleClass || `text-[11px] uppercase font-medium block ${visual.eyebrowClass}`}>
                            Wishes &amp; Notes
                        </span>
                    </div>
                    <h2 className={`mb-4 text-4xl md:text-5xl ${titleStyle.className}`} style={titleStyle.style}>Guest Book</h2>
                    <p className={`mx-auto max-w-xl text-base leading-relaxed sm:text-lg ${visual.bodyClass}`}>
                        Leave a blessing, memory, or piece of advice for our next chapter.
                    </p>
                    <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="divider" className="mt-6" />
                </div>

                {/* Submit Form */}
                <div data-wedding-card="true" className={`p-5 sm:p-8 md:p-10 mb-12 ${visual.cardClass}`}>
                    {submitted ? (
                        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
                            <CheckCircle2 data-wedding-status="success" className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                            <p className="font-serif text-2xl italic">With heartfelt thanks</p>
                            <p className={`mt-2 text-sm ${visual.bodyClass}`}>Your note has been added to our keepsake book.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                data-wedding-field="true"
                                required
                                aria-label="Your name"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClass}
                            />
                            <textarea
                                data-wedding-field="true"
                                required
                                aria-label="Your message to the couple"
                                placeholder="Write your wishes for the couple..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={`${inputClass} min-h-32 resize-y`}
                            />
                            {submitError && (
                                <p className="text-sm font-medium text-red-600" role="alert">
                                    {submitError}
                                </p>
                            )}
                            <button
                                data-wedding-control="primary"
                                type="submit"
                                disabled={submitting}
                                className={`flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 ${
                                    isSharp ? 'rounded-none' : 'rounded-full'
                                }`}
                            >
                                {submitting ? 'Sending...' : (
                                    <>
                                        Sign the Guest Book
                                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Entries */}
                {entries.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                            <AnimatePresence>
                                {visibleEntries.map((entry, i) => (
                                    <motion.article
                                        data-wedding-card="true"
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.04, 0.24) }}
                                        className={`flex flex-col justify-between p-6 sm:p-7 ${visual.cardClass}`}
                                    >
                                        <div>
                                            <span aria-hidden="true" className="block font-serif text-3xl leading-none text-primary opacity-55">
                                                &ldquo;
                                            </span>
                                            <p className={`mt-2 font-serif text-lg leading-relaxed break-words ${visual.isDark ? 'text-white/90' : 'text-[#292524]'}`}>
                                                {entry.message}
                                            </p>
                                        </div>
                                        <div className={`mt-6 flex items-baseline justify-between gap-3 border-t pt-4 ${visual.isDark ? 'border-white/15' : 'border-black/10'}`}>
                                            <p className="font-serif text-sm italic">
                                                &mdash; {entry.guest_name}
                                            </p>
                                            {formatEntryDate(entry.created_at) ? (
                                                <time className={`shrink-0 text-[11px] uppercase tracking-[0.18em] opacity-65 ${visual.bodyClass}`}>
                                                    {formatEntryDate(entry.created_at)}
                                                </time>
                                            ) : null}
                                        </div>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </div>

                        {entries.length > INITIAL_VISIBLE_COUNT && (
                            <div className="mt-8 text-center">
                                <button
                                    data-wedding-control="secondary"
                                    type="button"
                                    onClick={() => setShowAll((prev) => !prev)}
                                    className={`inline-flex min-h-11 items-center justify-center border border-current/25 px-6 py-2 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors hover:bg-current/5 ${
                                        isSharp ? 'rounded-none' : 'rounded-full'
                                    }`}
                                >
                                    {showAll ? 'Show fewer notes' : `Read all ${entries.length} notes`}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!loading && entries.length === 0 && (
                    <p className={`text-center font-serif text-base italic ${visual.bodyClass}`}>
                        Be the first to pen a note for the couple.
                    </p>
                )}
            </div>
        </section>
    );
}

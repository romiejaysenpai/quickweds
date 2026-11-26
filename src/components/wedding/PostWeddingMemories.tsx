'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, ExternalLink, Download, X, Send, CheckCircle2, MessageSquareHeart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { useSectionActions } from '@/context/SectionContext';
import SafeWeddingImage from '@/components/wedding/SafeWeddingImage';
import { toSafeHttpUrl } from '@/lib/url-safety';
import type { Wedding } from '@/types/wedding';

interface SharedPhoto {
    id: string;
    cloudinary_url: string;
    caption: string | null;
    message?: string | null;
    uploader_name: string | null;
}

interface GuestBookEntry {
    id: string;
    guest_name: string;
    message: string;
    photo_url?: string;
    created_at: string;
}

interface PostWeddingMemoriesProps {
    wedding: Wedding;
}

const subscribeNoop = () => () => {};

const POLAROID_ROTATIONS = [
    'md:rotate-[-1.5deg]',
    'md:rotate-[1.2deg]',
    'md:rotate-[-0.8deg]',
    'md:rotate-[1.8deg]',
    'md:rotate-[-1.2deg]',
    'md:rotate-[0.9deg]',
];

function formatPolaroidStamp(weddingDate?: string | null) {
    if (!weddingDate) return null;
    const normalized = /^\d{4}-\d{2}-\d{2}/.test(weddingDate.trim())
        ? `${weddingDate.trim().slice(0, 10)}T12:00:00`
        : weddingDate;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return null;
    const yr = String(parsed.getFullYear()).slice(-2);
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    const dy = String(parsed.getDate()).padStart(2, '0');
    return `'${yr} ${mo} ${dy}`;
}

function formatEntryDate(value?: string) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostWeddingMemories({ wedding }: PostWeddingMemoriesProps) {
    const { registerSection, unregisterSection } = useSectionActions();
    const canPortal = useSyncExternalStore(subscribeNoop, () => true, () => false);
    const template = wedding.template || 'classic';
    const visual = getTemplateVisualProfile(template, wedding.motif_color || '#D16C78', false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);

    const showPhotos = wedding.show_photos_in_thank_you_mode !== false;
    const showGuestbook = wedding.show_guestbook_in_thank_you_mode !== false;
    const recapStyle = wedding.photo_recap_style || 'polaroid';
    const polaroidStamp = formatPolaroidStamp(wedding.wedding_date);

    const sectionRef = useRef<HTMLElement | null>(null);
    const submitTimerRef = useRef<number | null>(null);
    const [shouldFetch, setShouldFetch] = useState(false);

    // Photos state
    const [photos, setPhotos] = useState<SharedPhoto[]>([]);
    const [photosLoading, setPhotosLoading] = useState(showPhotos);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

    // Guestbook state
    const [entries, setEntries] = useState<GuestBookEntry[]>([]);
    const [guestbookLoading, setGuestbookLoading] = useState(showGuestbook);
    const [guestName, setGuestName] = useState('');
    const [guestMessage, setGuestMessage] = useState('');
    const [submittingGuestbook, setSubmittingGuestbook] = useState(false);
    const [guestbookSubmitted, setGuestbookSubmitted] = useState(false);
    const [guestbookError, setGuestbookError] = useState('');
    const [showGuestbookForm, setShowGuestbookForm] = useState(false);

    const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] ?? null : null;

    const showPrevPhoto = useCallback(() => {
        setSelectedPhotoIndex((idx) => (idx === null || photos.length === 0 ? null : idx === 0 ? photos.length - 1 : idx - 1));
    }, [photos.length]);

    const showNextPhoto = useCallback(() => {
        setSelectedPhotoIndex((idx) => (idx === null || photos.length === 0 ? null : idx === photos.length - 1 ? 0 : idx + 1));
    }, [photos.length]);

    useEffect(() => {
        registerSection('memories', 'Memories');
        return () => unregisterSection('memories');
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

    // Fetch approved photos
    useEffect(() => {
        if (!shouldFetch || !showPhotos || !wedding.id) return;

        const controller = new AbortController();
        const fetchPhotos = async () => {
            try {
                const res = await fetch(`/api/public/photos/${encodeURIComponent(wedding.id)}`, {
                    signal: controller.signal,
                });
                const data = await res.json().catch(() => ({}));
                if (!controller.signal.aborted && res.ok && Array.isArray(data.photos)) {
                    setPhotos(data.photos);
                }
            } catch (err) {
                if ((err as Error)?.name !== 'AbortError') {
                    console.error('Failed to load recap photos:', err);
                }
            } finally {
                if (!controller.signal.aborted) setPhotosLoading(false);
            }
        };

        void fetchPhotos();
        return () => controller.abort();
    }, [shouldFetch, showPhotos, wedding.id]);

    // Fetch guestbook entries
    useEffect(() => {
        if (!shouldFetch || !showGuestbook || !wedding.id) return;

        const controller = new AbortController();
        const fetchGuestbook = async () => {
            try {
                const res = await fetch(`/api/public/guest-book?weddingId=${encodeURIComponent(wedding.id)}`, {
                    signal: controller.signal,
                });
                const data = await res.json().catch(() => ({}));
                if (!controller.signal.aborted && res.ok && Array.isArray(data.entries)) {
                    setEntries(data.entries);
                }
            } catch (err) {
                if ((err as Error)?.name !== 'AbortError') {
                    console.error('Failed to load recap guestbook:', err);
                }
            } finally {
                if (!controller.signal.aborted) setGuestbookLoading(false);
            }
        };

        void fetchGuestbook();
        return () => controller.abort();
    }, [shouldFetch, showGuestbook, wedding.id]);

    // Keyboard & scroll lock for lightbox
    useEffect(() => {
        if (selectedPhotoIndex === null) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedPhotoIndex(null);
            else if (event.key === 'ArrowLeft') showPrevPhoto();
            else if (event.key === 'ArrowRight') showNextPhoto();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPhotoIndex, showNextPhoto, showPrevPhoto]);

    useEffect(() => {
        return () => {
            if (submitTimerRef.current !== null) {
                window.clearTimeout(submitTimerRef.current);
            }
        };
    }, []);

    const handleGuestbookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim() || !guestMessage.trim() || submittingGuestbook) return;

        setSubmittingGuestbook(true);
        setGuestbookError('');
        try {
            const res = await fetch('/api/public/guest-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId: wedding.id,
                    guestName: guestName.trim(),
                    message: guestMessage.trim(),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.entry) {
                setEntries((prev) => [data.entry, ...prev]);
                setGuestbookSubmitted(true);
                setGuestName('');
                setGuestMessage('');
                if (submitTimerRef.current !== null) {
                    window.clearTimeout(submitTimerRef.current);
                }
                submitTimerRef.current = window.setTimeout(() => {
                    setGuestbookSubmitted(false);
                    setShowGuestbookForm(false);
                }, 3000);
            } else {
                setGuestbookError(data.error || 'Could not post your wish right now. Please try again.');
            }
        } catch (err) {
            console.error('Failed to submit post-wedding guestbook note:', err);
            setGuestbookError('Network error while posting your wish. Please try again.');
        } finally {
            setSubmittingGuestbook(false);
        }
    };

    const inputClass = `w-full border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary ${
        visual.isSharp ? 'rounded-none' : 'rounded-xl'
    } ${
        visual.isDark
            ? 'border-white/25 bg-black/20 text-white placeholder:text-white/50'
            : 'border-black/15 bg-white/80 text-[#292524] placeholder:text-[#57534e]'
    }`;

    return (
        <section ref={sectionRef} data-wedding-section="memories" id="memories" className={`py-16 md:py-24 px-4 sm:px-6 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="max-w-6xl mx-auto space-y-16">
                {/* ── Thank You Message Banner ────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center space-y-6"
                >
                    <div data-wedding-badge="true" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        After the celebration
                    </div>

                    <h2 className={`text-4xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>
                        Thank You!
                    </h2>

                    <div data-wedding-divider="true" className={`mx-auto ${visual.dividerClass}`} />

                    <p className={`text-lg md:text-xl leading-relaxed ${visual.bodyClass}`}>
                        {wedding.thank_you_message || 'Thank you so much for celebrating our special day with us. Your love, laughter, and presence made our wedding truly unforgettable.'}
                    </p>

                    {toSafeHttpUrl(wedding.photo_album_link) && (
                        <div className="pt-2">
                            <a
                                data-wedding-control="primary"
                                href={toSafeHttpUrl(wedding.photo_album_link)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:bg-primary/90"
                            >
                                <span>View Official Photo Album</span>
                                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                            </a>
                        </div>
                    )}
                </motion.div>

                {/* ── Disposable Camera / Approved Guest Photos ───────────── */}
                {showPhotos && (
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-current/15 pb-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                                    <Camera className="w-4 h-4" aria-hidden="true" />
                                    <span>Guest Perspectives</span>
                                </div>
                                <h3 className={`mt-1 text-2xl md:text-3xl ${titleStyle.className}`} style={titleStyle.style}>
                                    Disposable Camera Memories
                                </h3>
                                <p className={`mt-1 text-xs sm:text-sm ${visual.bodyClass} opacity-80`}>
                                    Candid moments captured through the lenses of our beloved guests.
                                </p>
                            </div>

                            <Link
                                data-wedding-control="secondary"
                                href={`/w/${wedding.id}/photos`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                            >
                                <Camera className="w-4 h-4" aria-hidden="true" />
                                <span>Open Full Photo Portal</span>
                            </Link>
                        </div>

                        {photosLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-[3/4] rounded-2xl bg-current/10 border border-current/10" />
                                ))}
                            </div>
                        ) : photos.length > 0 ? (
                            <div className={
                                recapStyle === 'grid'
                                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6'
                                    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8'
                            }>
                                {photos.map((photo, index) => {
                                    if (recapStyle === 'grid') {
                                        return (
                                            <motion.button
                                                key={photo.id}
                                                type="button"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                onClick={() => setSelectedPhotoIndex(index)}
                                                className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-black/5 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                                            >
                                                <SafeWeddingImage
                                                    src={photo.cloudinary_url}
                                                    alt={photo.caption || 'Guest photo'}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4 text-white">
                                                    {photo.caption && <p className="text-xs font-medium line-clamp-2">{photo.caption}</p>}
                                                    {photo.uploader_name && (
                                                        <p className="mt-1 text-[10px] text-white/80 font-mono uppercase tracking-wider">
                                                            by {photo.uploader_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    }

                                    // Polaroid Frame Style
                                    return (
                                        <motion.button
                                            key={photo.id}
                                            type="button"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (index % 4) * 0.08 }}
                                            onClick={() => setSelectedPhotoIndex(index)}
                                            className={`group relative cursor-pointer rounded-sm border border-stone-200 bg-white p-3.5 pb-6 text-left text-stone-900 shadow-lg shadow-black/10 transition-all duration-300 hover:z-20 hover:scale-105 hover:shadow-2xl ${POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length]}`}
                                        >
                                            {/* Photo container */}
                                            <div className="relative aspect-square w-full overflow-hidden bg-stone-100 border border-stone-200/80">
                                                <SafeWeddingImage
                                                    src={photo.cloudinary_url}
                                                    alt={photo.caption || 'Disposable photo'}
                                                    className="h-full w-full object-cover"
                                                />
                                                {polaroidStamp && (
                                                    <div className="absolute bottom-2 right-2 rounded bg-black/45 px-1.5 py-0.5 text-[9px] font-mono tracking-widest text-amber-300 backdrop-blur-xs select-none">
                                                        {polaroidStamp}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Polaroid Bottom Note */}
                                            <div className="mt-3 px-1 text-center font-serif">
                                                {photo.caption ? (
                                                    <p className="text-xs italic text-stone-800 line-clamp-2">
                                                        &ldquo;{photo.caption}&rdquo;
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] text-stone-400 italic">Candid Memory</p>
                                                )}
                                                {photo.uploader_name && (
                                                    <p className="mt-1 text-[10px] font-sans font-bold uppercase tracking-wider text-stone-500">
                                                        &mdash; {photo.uploader_name}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div data-wedding-card="true" className={`text-center py-12 px-6 rounded-3xl border border-dashed border-current/20 ${visual.cardClass}`}>
                                <Camera className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" aria-hidden="true" />
                                <p className={`font-serif text-lg ${visual.bodyClass}`}>
                                    Guest disposable photos are currently being developed!
                                </p>
                                <p className={`mt-1 text-xs ${visual.bodyClass} opacity-75 max-w-md mx-auto`}>
                                    Guests who took pictures can submit their rolls directly to the celebration gallery.
                                </p>
                                <div className="mt-5">
                                    <Link
                                        data-wedding-control="primary"
                                        href={`/w/${wedding.id}/photos`}
                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary/90"
                                    >
                                        <Camera className="w-4 h-4" aria-hidden="true" />
                                        <span>Upload Photos to Gallery</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Guestbook Wall of Love ──────────────────────────────── */}
                {showGuestbook && (
                    <div id="guestbook" className="space-y-8 pt-6 border-t border-current/15">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                                    <MessageSquareHeart className="w-4 h-4" aria-hidden="true" />
                                    <span>Guest Wishes &amp; Blessings</span>
                                </div>
                                <h3 className={`mt-1 text-2xl md:text-3xl ${titleStyle.className}`} style={titleStyle.style}>
                                    Wall of Love
                                </h3>
                                <p className={`mt-1 text-xs sm:text-sm ${visual.bodyClass} opacity-80`}>
                                    Heartfelt messages and blessings from our cherished guests.
                                </p>
                            </div>

                            <button
                                data-wedding-control="primary"
                                type="button"
                                onClick={() => setShowGuestbookForm((v) => !v)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary/90"
                            >
                                <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{showGuestbookForm ? 'Close Form' : 'Write a Wedding Wish'}</span>
                            </button>
                        </div>

                        {/* Interactive Form for Leaving a Blessing */}
                        <AnimatePresence>
                            {showGuestbookForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div data-wedding-card="true" className={`p-6 sm:p-8 rounded-2xl border border-current/15 ${visual.cardClass}`}>
                                        {guestbookSubmitted ? (
                                            <div className="text-center py-6">
                                                <CheckCircle2 data-wedding-status="success" className="w-10 h-10 text-primary mx-auto mb-2" aria-hidden="true" />
                                                <p className="text-lg font-serif font-bold text-primary">
                                                    Thank you for your warm wishes!
                                                </p>
                                                <p className="text-xs opacity-75 mt-1">Your message was added to the Wall of Love.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleGuestbookSubmit} className="space-y-4 max-w-xl mx-auto">
                                                <h4 className="text-base font-bold text-center">Leave Your Post-Wedding Message</h4>
                                                <div>
                                                    <input
                                                        data-wedding-field="true"
                                                        required
                                                        aria-label="Your name"
                                                        placeholder="Your Name"
                                                        value={guestName}
                                                        onChange={(e) => setGuestName(e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <textarea
                                                        data-wedding-field="true"
                                                        required
                                                        aria-label="Your message"
                                                        placeholder="Write your wishes, blessings, or favorite memory..."
                                                        value={guestMessage}
                                                        onChange={(e) => setGuestMessage(e.target.value)}
                                                        className={`${inputClass} min-h-24 resize-y`}
                                                    />
                                                </div>
                                                {guestbookError && (
                                                    <p className="text-xs font-medium text-red-500" role="alert">
                                                        {guestbookError}
                                                    </p>
                                                )}
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        data-wedding-control="secondary"
                                                        type="button"
                                                        onClick={() => setShowGuestbookForm(false)}
                                                        className="px-4 py-2.5 rounded-xl border border-current/20 text-xs font-bold"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        data-wedding-control="primary"
                                                        type="submit"
                                                        disabled={submittingGuestbook}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
                                                    >
                                                        {submittingGuestbook ? 'Submitting...' : (
                                                            <>
                                                                <span>Send Wish</span>
                                                                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Guestbook Entries Cards */}
                        {guestbookLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-32 rounded-2xl bg-current/10 border border-current/10" />
                                ))}
                            </div>
                        ) : entries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {entries.map((entry) => {
                                    const entryDate = formatEntryDate(entry.created_at);
                                    return (
                                        <div
                                            data-wedding-card="true"
                                            key={entry.id}
                                            className={`p-5 rounded-2xl border border-current/15 flex flex-col justify-between ${visual.cardClass}`}
                                        >
                                            <p className={`font-serif text-base italic leading-relaxed ${visual.bodyClass}`}>
                                                &ldquo;{entry.message}&rdquo;
                                            </p>
                                            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-current/10">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {(entry.guest_name?.trim()?.[0] || 'G').toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold leading-none">{entry.guest_name}</p>
                                                    {entryDate ? (
                                                        <p className="text-[10px] opacity-70 mt-0.5">{entryDate}</p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 opacity-75">
                                <p className="font-serif text-sm italic">Be the first to leave a post-wedding blessing on the Wall of Love.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Photo Lightbox Modal ────────────────────────────────────── */}
            {canPortal
                ? createPortal(
                    <AnimatePresence>
                        {selectedPhoto && (
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-label="Guest photo preview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
                                onClick={() => setSelectedPhotoIndex(null)}
                            >
                                <button
                                    type="button"
                                    onClick={() => setSelectedPhotoIndex(null)}
                                    className="fixed right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                                    aria-label="Close photo preview"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {photos.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showPrevPhoto();
                                            }}
                                            className="fixed left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-6"
                                            aria-label="Previous photo"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showNextPhoto();
                                            }}
                                            className="fixed right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6"
                                            aria-label="Next photo"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}

                                <div
                                    className="relative max-h-[88vh] max-w-4xl w-full flex flex-col items-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="relative max-h-[74vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={selectedPhoto.cloudinary_url}
                                            alt={selectedPhoto.caption || 'Wedding photo'}
                                            className="max-h-[74vh] max-w-full object-contain"
                                        />
                                    </div>

                                    <div className="mt-4 w-full flex items-center justify-between gap-4 text-white px-2">
                                        <div className="min-w-0">
                                            {selectedPhoto.caption && <p className="text-sm font-medium">{selectedPhoto.caption}</p>}
                                            {selectedPhoto.uploader_name && (
                                                <p className="text-xs text-white/70">Snapped by {selectedPhoto.uploader_name}</p>
                                            )}
                                        </div>
                                        <a
                                            href={selectedPhoto.cloudinary_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30"
                                        >
                                            <Download className="w-3.5 h-3.5" aria-hidden="true" />
                                            <span>Download</span>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
                : null}
        </section>
    );
}

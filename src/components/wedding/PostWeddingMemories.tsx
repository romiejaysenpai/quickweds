'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, ExternalLink, Download, X, Send, CheckCircle2, MessageSquareHeart, Sparkles } from 'lucide-react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import SafeWeddingImage from '@/components/wedding/SafeWeddingImage';
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

export default function PostWeddingMemories({ wedding }: PostWeddingMemoriesProps) {
    const template = wedding.template || 'classic';
    const visual = getTemplateVisualProfile(template, wedding.motif_color || '#D16C78', false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);

    const showPhotos = wedding.show_photos_in_thank_you_mode !== false;
    const showGuestbook = wedding.show_guestbook_in_thank_you_mode !== false;
    const recapStyle = wedding.photo_recap_style || 'polaroid';

    // Photos state
    const [photos, setPhotos] = useState<SharedPhoto[]>([]);
    const [photosLoading, setPhotosLoading] = useState(showPhotos);
    const [selectedPhoto, setSelectedPhoto] = useState<SharedPhoto | null>(null);

    // Guestbook state
    const [entries, setEntries] = useState<GuestBookEntry[]>([]);
    const [guestbookLoading, setGuestbookLoading] = useState(showGuestbook);
    const [guestName, setGuestName] = useState('');
    const [guestMessage, setGuestMessage] = useState('');
    const [submittingGuestbook, setSubmittingGuestbook] = useState(false);
    const [guestbookSubmitted, setGuestbookSubmitted] = useState(false);
    const [showGuestbookForm, setShowGuestbookForm] = useState(false);

    // Fetch approved photos
    useEffect(() => {
        if (!showPhotos || !wedding.id) return;

        let isMounted = true;
        const fetchPhotos = async () => {
            try {
                const res = await fetch(`/api/public/photos/${encodeURIComponent(wedding.id)}`);
                const data = await res.json().catch(() => ({}));
                if (isMounted && res.ok && Array.isArray(data.photos)) {
                    setPhotos(data.photos);
                }
            } catch (err) {
                console.error('Failed to load recap photos:', err);
            } finally {
                if (isMounted) setPhotosLoading(false);
            }
        };

        fetchPhotos();
        return () => {
            isMounted = false;
        };
    }, [showPhotos, wedding.id]);

    // Fetch guestbook entries
    useEffect(() => {
        if (!showGuestbook || !wedding.id) return;

        let isMounted = true;
        const fetchGuestbook = async () => {
            try {
                const res = await fetch(`/api/public/guest-book?weddingId=${encodeURIComponent(wedding.id)}`);
                const data = await res.json().catch(() => ({}));
                if (isMounted && res.ok && Array.isArray(data.entries)) {
                    setEntries(data.entries);
                }
            } catch (err) {
                console.error('Failed to load recap guestbook:', err);
            } finally {
                if (isMounted) setGuestbookLoading(false);
            }
        };

        fetchGuestbook();
        return () => {
            isMounted = false;
        };
    }, [showGuestbook, wedding.id]);

    const handleGuestbookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim() || !guestMessage.trim() || submittingGuestbook) return;

        setSubmittingGuestbook(true);
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
                setTimeout(() => {
                    setGuestbookSubmitted(false);
                    setShowGuestbookForm(false);
                }, 3000);
            }
        } catch (err) {
            console.error('Failed to submit post-wedding guestbook note:', err);
        } finally {
            setSubmittingGuestbook(false);
        }
    };

    const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary ${
        visual.isDark
            ? 'border-white/25 bg-black/20 text-white placeholder:text-white/50'
            : 'border-black/15 bg-white/80 text-[#292524] placeholder:text-[#57534e]'
    }`;

    // Random slight rotation for Polaroid aesthetic
    const getRotationClass = (index: number) => {
        const rotations = ['rotate-[-1.5deg]', 'rotate-[1.2deg]', 'rotate-[-0.8deg]', 'rotate-[1.8deg]', 'rotate-[-1.2deg]', 'rotate-[0.9deg]'];
        return rotations[index % rotations.length];
    };

    return (
        <section id="memories" className={`py-16 md:py-24 px-4 sm:px-6 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="max-w-6xl mx-auto space-y-16">
                {/* ── Thank You Message Banner ────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        After the celebration
                    </div>

                    <h2 className={`text-4xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>
                        Thank You!
                    </h2>

                    <div className={`mx-auto ${visual.dividerClass}`} />

                    <p className={`text-lg md:text-xl leading-relaxed ${visual.bodyClass}`}>
                        {wedding.thank_you_message || 'Thank you so much for celebrating our special day with us. Your love, laughter, and presence made our wedding truly unforgettable.'}
                    </p>

                    {wedding.photo_album_link && (
                        <div className="pt-2">
                            <a
                                href={wedding.photo_album_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:bg-primary/90"
                            >
                                <span>View Official Photo Album</span>
                                <ExternalLink className="w-4 h-4" />
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
                                    <Camera className="w-4 h-4" />
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
                                href={`/w/${wedding.id}/photos`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                            >
                                <Camera className="w-4 h-4" />
                                <span>Open Full Photo Portal</span>
                            </Link>
                        </div>

                        {photosLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-[3/4] rounded-2xl bg-neutral/60 border border-border" />
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
                                            <motion.div
                                                key={photo.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                onClick={() => setSelectedPhoto(photo)}
                                                className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-black/5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
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
                                            </motion.div>
                                        );
                                    }

                                    // Polaroid Frame Style
                                    return (
                                        <motion.div
                                            key={photo.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (index % 4) * 0.08 }}
                                            onClick={() => setSelectedPhoto(photo)}
                                            className={`group relative cursor-pointer rounded-sm border border-stone-200 bg-white p-3.5 pb-6 text-stone-900 shadow-lg shadow-black/10 transition-all duration-300 hover:z-20 hover:scale-105 hover:shadow-2xl md:${getRotationClass(index)}`}
                                        >
                                            {/* Photo container */}
                                            <div className="relative aspect-square w-full overflow-hidden bg-stone-100 border border-stone-200/80">
                                                <SafeWeddingImage
                                                    src={photo.cloudinary_url}
                                                    alt={photo.caption || 'Disposable photo'}
                                                    className="h-full w-full object-cover"
                                                />
                                                {/* Date Stamp in Disposable Camera Orange/Gold */}
                                                <div className="absolute bottom-2 right-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-mono tracking-widest text-amber-400 backdrop-blur-xs select-none">
                                                    &apos;26 {String(new Date().getMonth() + 1).padStart(2, '0')} {String(new Date().getDate()).padStart(2, '0')}
                                                </div>
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
                                                        — {photo.uploader_name}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={`text-center py-12 px-6 rounded-3xl border border-dashed border-current/20 ${visual.cardClass}`}>
                                <Camera className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
                                <p className={`font-serif text-lg ${visual.bodyClass}`}>
                                    Guest disposable photos are currently being developed!
                                </p>
                                <p className={`mt-1 text-xs ${visual.bodyClass} opacity-75 max-w-md mx-auto`}>
                                    Guests who took pictures can submit their rolls directly to the celebration gallery.
                                </p>
                                <div className="mt-5">
                                    <Link
                                        href={`/w/${wedding.id}/photos`}
                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary/90"
                                    >
                                        <Camera className="w-4 h-4" />
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
                                    <MessageSquareHeart className="w-4 h-4" />
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
                                type="button"
                                onClick={() => setShowGuestbookForm((v) => !v)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary/90"
                            >
                                <Heart className="w-3.5 h-3.5" />
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
                                    <div className={`p-6 sm:p-8 rounded-2xl border border-current/15 ${visual.cardClass}`}>
                                        {guestbookSubmitted ? (
                                            <div className="text-center py-6">
                                                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
                                                <p className="text-lg font-serif font-bold text-primary">
                                                    Thank you for your warm wishes! 💕
                                                </p>
                                                <p className="text-xs text-text-secondary mt-1">Your message was added to the Wall of Love.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleGuestbookSubmit} className="space-y-4 max-w-xl mx-auto">
                                                <h4 className="text-base font-bold text-center">Leave Your Post-Wedding Message</h4>
                                                <div>
                                                    <input
                                                        required
                                                        placeholder="Your Name"
                                                        value={guestName}
                                                        onChange={(e) => setGuestName(e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <textarea
                                                        required
                                                        placeholder="Write your wishes, blessings, or favorite memory..."
                                                        value={guestMessage}
                                                        onChange={(e) => setGuestMessage(e.target.value)}
                                                        className={`${inputClass} min-h-24 resize-y`}
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowGuestbookForm(false)}
                                                        className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={submittingGuestbook}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
                                                    >
                                                        {submittingGuestbook ? 'Submitting...' : (
                                                            <>
                                                                <span>Send Wish</span>
                                                                <Send className="w-3.5 h-3.5" />
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
                                    <div key={i} className="h-32 rounded-2xl bg-neutral/60 border border-border" />
                                ))}
                            </div>
                        ) : entries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`p-5 rounded-2xl border border-current/15 flex flex-col justify-between ${visual.cardClass}`}
                                    >
                                        <p className={`font-serif text-base italic leading-relaxed ${visual.bodyClass}`}>
                                            &ldquo;{entry.message}&rdquo;
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-current/10">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                {entry.guest_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold leading-none">{entry.guest_name}</p>
                                                <p className="text-[10px] opacity-70 mt-0.5">
                                                    {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 opacity-70">
                                <p className="font-serif text-sm">Be the first to leave a post-wedding blessing on the Wall of Love! ✨</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Photo Lightbox Modal ────────────────────────────────────── */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div
                            className="relative max-h-[90vh] max-w-4xl w-full flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute -top-12 right-0 text-white hover:text-white/80 p-2"
                                aria-label="Close photo preview"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                                <img
                                    src={selectedPhoto.cloudinary_url}
                                    alt={selectedPhoto.caption || 'Wedding photo'}
                                    className="max-h-[75vh] max-w-full object-contain"
                                />
                            </div>

                            <div className="mt-4 w-full flex items-center justify-between text-white px-2">
                                <div>
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
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

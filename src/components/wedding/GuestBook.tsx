'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
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

export default function GuestBook({ weddingId, wedding }: GuestBookProps) {
    const visual = getTemplateVisualProfile(wedding?.template || 'classic', wedding?.motif_color || '#D16C78', false, wedding?.card_style);
    const titleStyle = wedding ? getSectionTitleStyle(wedding, visual.headingClass) : { className: visual.headingClass, style: undefined };
    const inputClass = `w-full rounded-lg border px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary ${visual.isDark ? 'border-white/25 bg-black/15 text-white placeholder:text-white/60' : 'border-black/15 bg-white/60 text-[#292524] placeholder:text-[#57534e]'}`;
    const [entries, setEntries] = useState<GuestBookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchEntries = async () => {
            const response = await fetch(`/api/public/guest-book?weddingId=${encodeURIComponent(weddingId)}`);
            const data = await response.json().catch(() => ({}));

            if (response.ok && data.entries) {
                setEntries(data.entries);
            }
            setLoading(false);
        };
        fetchEntries();
    }, [weddingId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setSubmitting(true);
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
                setTimeout(() => setSubmitted(false), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="guestbook" className={`py-16 md:py-24 px-4 sm:px-6 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className={`text-4xl md:text-5xl mb-4 ${titleStyle.className}`} style={titleStyle.style}>Guest Book</h2>
                    <p className={`text-lg leading-relaxed ${visual.bodyClass}`}>Leave a message for the happy couple</p>
                </div>

                {/* Submit Form */}
                <div className={`p-5 sm:p-8 mb-10 ${visual.cardClass}`}>
                    {submitted ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                            <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
                            <p className="text-xl font-serif text-primary">Thank you for your lovely message! 💕</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                required
                                aria-label="Your name"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClass}
                            />
                            <textarea
                                required
                                aria-label="Your message to the couple"
                                placeholder="Write your wishes for the couple..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={`${inputClass} min-h-32 resize-y`}
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? 'Sending...' : (
                                    <>Sign the Guest Book <Send className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Entries */}
                {entries.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {entries.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`border-t p-6 ${visual.isDark ? 'border-white/20 text-white' : 'border-black/15 text-[#292524]'}`}
                                >
                                    <p className={`font-serif text-lg mb-4 leading-relaxed ${visual.bodyClass}`}>&ldquo;{entry.message}&rdquo;</p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {entry.guest_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{entry.guest_name}</p>
                                            <p className={`text-xs mt-1 ${visual.bodyClass}`}>
                                                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && entries.length === 0 && (
                    <p className={`text-center font-serif text-lg ${visual.bodyClass}`}>Be the first to leave a message! ✨</p>
                )}
            </div>
        </section>
    );
}

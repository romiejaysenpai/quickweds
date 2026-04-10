'use client';

import { motion } from 'framer-motion';
import RSVPForm from '@/components/RSVPForm';
import type { Wedding } from '@/types/wedding';

interface RSVPSectionProps {
    wedding: Wedding;
    isExpired: boolean;
}

export default function RSVPSection({ wedding, isExpired }: RSVPSectionProps) {
    const template = wedding.template || 'classic';
    const isSharp = ['editorial', 'urban', 'minimal', 'vogue', 'glitch', 'film'].includes(template);
    const isDark = ['royal', 'midnight', 'cinematic'].includes(template);
    const isVintage = ['vintage', 'rustic', 'boho', 'artdeco', 'sakura', 'garden'].includes(template);
    const isRomantic = ['romantic', 'whimsical', 'elopement', 'classic'].includes(template);

    const deadline = new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    // ── DARK templates: Royal / Midnight / Cinematic ──────────────────────────
    if (isDark) {
        return (
            <section id="rsvp" className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="border border-primary/20 bg-black/40 backdrop-blur-xl p-8 sm:p-12 md:p-16 relative overflow-hidden"
                >
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40" />

                    <div className="text-center mb-10 sm:mb-14">
                        <span className="text-[10px] uppercase tracking-[1em] font-black opacity-40 block mb-4 text-primary">
                            Guest Confirmation
                        </span>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-primary mb-6">
                            Will You Join Us?
                        </h2>
                        <p className="text-primary/50 italic text-sm sm:text-base max-w-lg mx-auto">
                            Kindly RSVP by <span className="text-primary font-bold not-italic">{deadline}</span>
                        </p>
                    </div>

                    {isExpired ? (
                        <div className="p-8 border border-primary/20 text-center">
                            <p className="text-xl font-serif text-primary/60">RSVP has closed for this event.</p>
                        </div>
                    ) : (
                        <RSVPForm weddingId={wedding.id} wedding={wedding} />
                    )}
                </motion.div>
            </section>
        );
    }

    // ── SHARP / EDITORIAL templates ───────────────────────────────────────────
    if (isSharp) {
        return (
            <section id="rsvp" className="max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="border border-black/10 bg-white"
                >
                    {/* Header bar */}
                    <div className="border-b border-black/10 px-8 sm:px-14 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <span className="text-[10px] uppercase tracking-[1em] font-black opacity-30 block mb-2">
                                Issue No. 02
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-none tracking-tighter">
                                RSVP
                            </h2>
                        </div>
                        <p className="text-sm text-text-secondary uppercase tracking-widest font-bold border-l border-black/10 pl-6">
                            Deadline: {deadline}
                        </p>
                    </div>

                    <div className="px-8 sm:px-14 py-10 sm:py-14">
                        {isExpired ? (
                            <div className="py-12 border border-black/10 text-center">
                                <p className="text-xl font-serif text-foreground/40 uppercase tracking-widest">
                                    RSVP Closed
                                </p>
                            </div>
                        ) : (
                            <RSVPForm weddingId={wedding.id} wedding={wedding} />
                        )}
                    </div>
                </motion.div>
            </section>
        );
    }

    // ── VINTAGE / BOHO / RUSTIC templates ─────────────────────────────────────
    if (isVintage) {
        return (
            <section id="rsvp" className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/70 backdrop-blur-md border-2 border-primary/20 p-8 sm:p-14 relative text-center"
                    style={{ borderRadius: '2px' }}
                >
                    {/* Vintage corner ornaments */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/30" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/30" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/30" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/30" />

                    <div className="mb-10 sm:mb-14">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-px w-12 bg-primary/40" />
                            <span className="text-primary text-xs tracking-[0.4em] uppercase font-bold opacity-60">~</span>
                            <div className="h-px w-12 bg-primary/40" />
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#4A4444] mb-6 italic">
                            Will You Join Us?
                        </h2>
                        <p className="text-foreground/60 italic text-sm sm:text-base max-w-md mx-auto">
                            We would be honoured to have you with us. <br />
                            Kindly reply by <span className="text-primary font-bold not-italic">{deadline}</span>
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <div className="h-px w-16 bg-primary/20" />
                            <span className="text-primary/30 text-xs">✦</span>
                            <div className="h-px w-16 bg-primary/20" />
                        </div>
                    </div>

                    {isExpired ? (
                        <div className="py-12 border border-primary/10 text-center">
                            <p className="text-xl font-serif text-foreground/40 italic">
                                RSVP has closed for this event.
                            </p>
                        </div>
                    ) : (
                        <div className="text-left">
                            <RSVPForm weddingId={wedding.id} wedding={wedding} />
                        </div>
                    )}
                </motion.div>
            </section>
        );
    }

    // ── DEFAULT: Classic / Romantic / Luxury / Everything else ────────────────
    return (
        <section id="rsvp" className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl sm:rounded-[5rem] px-4 sm:px-8 md:px-16 py-8 sm:py-16 md:py-24 soft-shadow text-center relative overflow-hidden ring-1 ring-primary/5"
            >
                {/* Background flourish */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent/5 rounded-tl-full" />

                <div className="relative z-10 mb-10 sm:mb-14">
                    <div
                        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/10"
                        style={{ backgroundColor: `${wedding.motif_color || '#D16C78'}15` }}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: wedding.motif_color || '#D16C78' }}>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif mb-6 sm:mb-8 text-[#4A4444]">
                        Will You Join Us?
                    </h2>
                    <p className="text-foreground/60 italic mb-2 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                        We&apos;d love to have you with us.{' '}
                    </p>
                    <p className="text-foreground/50 text-sm sm:text-base">
                        Please RSVP by{' '}
                        <span className="text-primary font-bold not-italic">{deadline}</span>
                    </p>
                </div>

                {isExpired ? (
                    <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[3rem] bg-neutral/50 border border-primary/10 text-center">
                        <p className="text-xl sm:text-2xl font-serif text-foreground/60">
                            RSVP has closed for this event.
                        </p>
                    </div>
                ) : (
                    <RSVPForm weddingId={wedding.id} wedding={wedding} />
                )}
            </motion.div>
        </section>
    );
}

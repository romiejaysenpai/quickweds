'use client';

import { motion } from 'framer-motion';
import RSVPForm from '@/components/RSVPForm';
import type { Wedding } from '@/types/wedding';
import { getSectionTitleStyle, getTemplateVisualProfile, parseSectionStyles, resolveSectionBackground } from '@/lib/theme-engine';

interface RSVPSectionProps {
    wedding: Wedding;
    isExpired: boolean;
}

export default function RSVPSection({ wedding, isExpired }: RSVPSectionProps) {
    const template = wedding.template || 'classic';
    const visual = getTemplateVisualProfile(template, wedding.motif_color || '#D16C78', false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const sectionStylesMap = parseSectionStyles(wedding.section_styles);
    const customBg = resolveSectionBackground(sectionStylesMap['rsvp']);
    const isSharp = visual.isSharp || ['editorial', 'urban', 'minimal', 'vogue', 'glitch', 'film'].includes(template);
    const isDark = customBg.hasCustomBackground ? customBg.isDark : (visual.isDark || ['royal', 'midnight', 'cinematic'].includes(template));
    const isVintage = visual.isVintage || ['vintage', 'rustic', 'boho', 'artdeco', 'sakura', 'garden'].includes(template);
    const deadline = new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    const sectionClass = `px-4 sm:px-6 py-24 sm:py-32 relative overflow-hidden ${customBg.hasCustomBackground ? '' : visual.sectionClass} ${customBg.textColorClass || ''}`;
    const sectionStyle = customBg.hasCustomBackground ? customBg.style : visual.sectionStyle;

    // ── DARK templates: Royal / Midnight / Cinematic ──────────────────────────
    if (isDark) {
        return (
            <section id="rsvp" className={sectionClass} style={sectionStyle}>
                {customBg.overlayStyle && <div style={customBg.overlayStyle} />}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative mx-auto max-w-4xl overflow-hidden p-8 sm:p-12 md:p-16 ${visual.cardClass}`}
                >
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40" />

                    <div className="text-center mb-10 sm:mb-14">
                        <div className="mb-4 flex items-center justify-center">
                            <span className={visual.badgeStyleClass || "text-[10px] uppercase tracking-[1em] font-black block text-primary"}>
                                {visual.badgePrefix ? `${visual.badgePrefix}RSVP` : 'Guest Confirmation'}
                            </span>
                        </div>
                        <h2 className={`text-3xl sm:text-5xl md:text-6xl mb-6 ${titleStyle.className}`} style={titleStyle.style}>
                            Will You Join Us?
                        </h2>
                        <p className="text-white/78 italic text-sm sm:text-base max-w-lg mx-auto">
                            Kindly RSVP by <span className="text-primary font-bold not-italic">{deadline}</span>
                        </p>
                    </div>

                    {isExpired ? (
                        <div className="p-8 border border-primary/20 text-center">
                            <p className="text-xl font-serif text-white/80">RSVP has closed for this event.</p>
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
            <section id="rsvp" className={`px-4 sm:px-6 py-24 sm:py-32 ${visual.sectionClass}`} style={visual.sectionStyle}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`mx-auto max-w-5xl ${visual.cardClass}`}
                >
                    {/* Header bar */}
                    <div className="border-b border-black/10 px-8 sm:px-14 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <span className={visual.badgeStyleClass || "text-[10px] uppercase tracking-[1em] font-black text-black/65 block mb-2"}>
                                {visual.badgePrefix ? `${visual.badgePrefix}RSVP` : 'ISSUE N°02'}
                            </span>
                            <h2 className={`text-3xl sm:text-5xl leading-none ${titleStyle.className}`} style={titleStyle.style}>
                                RSVP
                            </h2>
                        </div>
                        <p className="text-sm text-black/70 uppercase tracking-widest font-bold border-l border-black/10 pl-6">
                            Deadline: {deadline}
                        </p>
                    </div>

                    <div className="px-8 sm:px-14 py-10 sm:py-14">
                        {isExpired ? (
                            <div className="py-12 border border-black/10 text-center">
                                <p className="text-xl font-serif text-black/70 uppercase tracking-widest">
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
            <section id="rsvp" className={sectionClass} style={sectionStyle}>
                {customBg.overlayStyle && <div style={customBg.overlayStyle} />}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative mx-auto max-w-4xl p-8 text-center sm:p-14 ${visual.cardClass}`}
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
                        <span className="text-primary text-xs tracking-[0.4em] uppercase font-bold">~</span>
                            <div className="h-px w-12 bg-primary/40" />
                        </div>
                        <h2 className={`text-3xl sm:text-5xl md:text-6xl mb-6 ${titleStyle.className}`} style={titleStyle.style}>
                            Will You Join Us?
                        </h2>
                        <p className="text-[#4A4444]/72 italic text-sm sm:text-base max-w-md mx-auto">
                            We would be honoured to have you with us. <br />
                            Kindly reply by <span className="text-primary font-bold not-italic">{deadline}</span>
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <div className="h-px w-16 bg-primary/20" />
                            <span className="text-primary/70 text-xs">✦</span>
                            <div className="h-px w-16 bg-primary/20" />
                        </div>
                    </div>

                    {isExpired ? (
                        <div className="p-8 border border-primary/20 text-center">
                            <p className="text-xl font-serif text-[#4A4444]/72">RSVP has closed for this event.</p>
                        </div>
                    ) : (
                        <RSVPForm weddingId={wedding.id} wedding={wedding} />
                    )}
                </motion.div>
            </section>
        );
    }

    // ── DEFAULT: Classic / Romantic / Luxury / Everything else ────────────────
    return (
        <section id="rsvp" className={sectionClass} style={sectionStyle}>
            {customBg.overlayStyle && <div style={customBg.overlayStyle} />}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative mx-auto max-w-4xl overflow-hidden px-4 py-8 text-center sm:px-8 sm:py-16 md:px-16 md:py-24 ${visual.cardClass}`}
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
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-6 sm:mb-8 ${titleStyle.className}`} style={titleStyle.style}>
                        Will You Join Us?
                    </h2>
                    <p className="text-[#4A4444]/72 italic mb-2 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                        We&apos;d love to have you with us.{' '}
                    </p>
                    <p className="text-[#4A4444]/68 text-sm sm:text-base">
                        Please RSVP by{' '}
                        <span className="text-primary font-bold not-italic">{deadline}</span>
                    </p>
                </div>

                {isExpired ? (
                    <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[3rem] bg-neutral/50 border border-primary/10 text-center">
                        <p className="text-xl sm:text-2xl font-serif text-[#4A4444]/72">
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

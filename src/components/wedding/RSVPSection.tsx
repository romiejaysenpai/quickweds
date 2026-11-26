'use client';

import { motion } from 'framer-motion';
import RSVPForm from '@/components/RSVPForm';
import { MonogramMark } from '@/components/MonogramMark';
import type { Wedding } from '@/types/wedding';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { SectionTemplateElement } from './SectionTemplateElement';

interface RSVPSectionProps {
    wedding: Wedding;
    isExpired: boolean;
}

export default function RSVPSection({ wedding, isExpired }: RSVPSectionProps) {
    const template = wedding.template || 'classic';
    const visual = getTemplateVisualProfile(template, wedding.motif_color || '#D16C78', false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const isSharp = visual.isSharp || ['editorial', 'urban', 'minimal', 'vogue', 'glitch', 'film'].includes(template);
    const hasExplicitLightBackground =
        wedding.template_style === 'luxury-planner' ||
        ['ivory', 'white', 'blush', 'sage', 'champagne', 'sand', 'lavender', 'linen', 'paper', 'cream', 'pearl'].includes(
            (wedding.background_style || '').toLowerCase()
        );
    const isDark = !hasExplicitLightBackground && (visual.isDark || ['royal', 'midnight', 'cinematic'].includes(template));
    const isVintage = visual.isVintage || ['vintage', 'rustic', 'boho', 'artdeco', 'sakura', 'garden'].includes(template);
    const rawDeadline = wedding.rsvp_deadline?.slice(0, 10);
    const parsedDeadline = rawDeadline ? new Date(`${rawDeadline}T12:00:00`) : null;
    const deadline = parsedDeadline && !Number.isNaN(parsedDeadline.getTime())
        ? parsedDeadline.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        })
        : 'your earliest convenience';
    const hasMonogram = Boolean(wedding.logo_initials || (wedding.bride_name && wedding.groom_name));

    // ── DARK templates: Royal / Midnight / Cinematic ──────────────────────────
    if (isDark) {
        return (
            <section data-wedding-section="rsvp" id="rsvp" className={`px-4 sm:px-6 py-16 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
                <motion.div data-wedding-card="true"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative mx-auto max-w-4xl overflow-hidden p-6 sm:p-10 md:p-14 ${visual.cardClass}`}
                >
                    <div className="pointer-events-none absolute inset-3 border border-primary/20" aria-hidden="true" />
                    <SectionTemplateElement wedding={wedding} isDark={true} placement="corner-top-right" />

                    <div className="relative z-10 text-center mb-10 sm:mb-12">
                        <div className="mb-4 flex items-center justify-center">
                            <span data-wedding-badge="true" className={visual.badgeStyleClass || "text-[11px] uppercase tracking-[0.28em] font-medium block text-primary"}>
                                {visual.badgePrefix ? `${visual.badgePrefix}RSVP` : 'Répondez S’il Vous Plaît'}
                            </span>
                        </div>
                        <h2 className={`text-3xl sm:text-5xl md:text-6xl mb-5 ${titleStyle.className}`} style={titleStyle.style}>
                            Will You Join Us?
                        </h2>
                        <p className="text-white/78 font-serif italic text-base sm:text-lg max-w-lg mx-auto">
                            Kindly reply by <span className="text-primary font-medium not-italic">{deadline}</span>
                        </p>
                        <SectionTemplateElement wedding={wedding} isDark={true} placement="divider" className="mt-6" />
                    </div>

                    {isExpired ? (
                        <div className="p-8 border border-primary/20 text-center">
                            <p className="text-xl font-serif text-white/80">RSVP has closed for this celebration.</p>
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
            <section data-wedding-section="rsvp" id="rsvp" className={`px-4 sm:px-6 py-16 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
                <motion.div data-wedding-card="true"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative mx-auto max-w-5xl overflow-hidden ${visual.cardClass}`}
                >
                    <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="corner-bottom-left" />
                    <div className="relative z-10 border-b border-black/15 px-5 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <span data-wedding-badge="true" className={visual.badgeStyleClass || "text-[11px] uppercase tracking-[0.28em] font-medium text-black/65 block mb-3"}>
                                {visual.badgePrefix ? `${visual.badgePrefix}RSVP` : 'Response Card'}
                            </span>
                            <h2 className={`text-3xl sm:text-5xl leading-none ${titleStyle.className}`} style={titleStyle.style}>
                                Kindly Reply
                            </h2>
                        </div>
                        <p className="text-xs text-black/70 uppercase tracking-[0.22em] font-medium sm:border-l sm:border-black/15 sm:pl-6">
                            Respond by {deadline}
                        </p>
                    </div>

                    <div className="relative z-10 px-5 sm:px-10 py-8 sm:py-12">
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

    // ── VINTAGE / BOHO / RUSTIC / STATIONERY templates ───────────────────────
    if (isVintage) {
        return (
            <section data-wedding-section="rsvp" id="rsvp" className={`px-4 sm:px-6 py-16 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
                <motion.div data-wedding-card="true"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative mx-auto max-w-4xl overflow-hidden p-6 text-center sm:p-10 md:p-14 ${visual.cardClass}`}
                    style={{ borderRadius: '2px' }}
                >
                    <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="corner-top-right" />
                    <div className="pointer-events-none absolute inset-3 border border-current/15" aria-hidden="true" />

                    <div className="relative z-10 mb-10 sm:mb-12">
                        <div className="mb-4 flex items-center justify-center">
                            <span data-wedding-badge="true" className={visual.badgeStyleClass || "text-[11px] uppercase tracking-[0.28em] font-medium text-primary"}>
                                Response Card
                            </span>
                        </div>
                        <h2 className={`text-3xl sm:text-5xl md:text-6xl mb-5 ${titleStyle.className}`} style={titleStyle.style}>
                            Will You Join Us?
                        </h2>
                        <p className="text-[#4A4444]/75 font-serif italic text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                            The favor of a reply is kindly requested by{' '}
                            <span className="text-primary font-medium not-italic">{deadline}</span>
                        </p>
                        <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="divider" className="mt-6" />
                    </div>

                    {isExpired ? (
                        <div className="py-12 border border-primary/15 text-center">
                            <p className="text-xl font-serif text-[#4A4444]/72 italic">
                                RSVP has closed for this celebration.
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

    // ── DEFAULT: Classic / Romantic / Elegance / Everything else ─────────────
    return (
        <section data-wedding-section="rsvp" id="rsvp" className={`px-4 sm:px-6 py-16 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <motion.div data-wedding-card="true"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative mx-auto max-w-4xl overflow-hidden px-5 py-10 text-center sm:px-10 sm:py-14 md:px-14 ${visual.cardClass}`}
            >
                <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="card-seal" />

                <div className="relative z-10 mb-10 sm:mb-12">
                    {hasMonogram ? (
                        <div className="mb-5 flex justify-center">
                            <MonogramMark
                                initials={wedding.logo_initials}
                                brideName={wedding.bride_name}
                                groomName={wedding.groom_name}
                                shape={wedding.logo_shape}
                                color={wedding.logo_color}
                                motifColor={wedding.motif_color}
                                fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined}
                                size="sm"
                            />
                        </div>
                    ) : null}
                    <div className="mb-4 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual.badgeStyleClass || "text-[11px] uppercase tracking-[0.28em] font-medium text-primary"}>
                            Répondez S’il Vous Plaît
                        </span>
                    </div>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl mb-5 ${titleStyle.className}`} style={titleStyle.style}>
                        Will You Join Us?
                    </h2>
                    <p className="text-[#4A4444]/75 font-serif italic text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                        We would be honored to celebrate with you. Kindly respond by{' '}
                        <span className="text-primary font-medium not-italic">{deadline}</span>.
                    </p>
                    <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="divider" className="mt-6" />
                </div>

                {isExpired ? (
                    <div className="p-6 sm:p-8 md:p-12 rounded-2xl bg-neutral/50 border border-primary/10 text-center">
                        <p className="text-xl sm:text-2xl font-serif text-[#4A4444]/72">
                            RSVP has closed for this celebration.
                        </p>
                    </div>
                ) : (
                    <RSVPForm weddingId={wedding.id} wedding={wedding} />
                )}
            </motion.div>
        </section>
    );
}

'use client';

import { motion } from 'framer-motion';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import {
    VideoSection,
    BioSection,
    DetailsSection,
    CountdownTimer,
    TimelineSection,
    GallerySection,
    GiftSection,
    AttireSection,
} from '../wedding';
import {
    formatWeddingDate,
    resolveTemplateCopy,
    resolveWeddingMedia,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function NordicTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#065F46';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-sans relative pb-24 selection:bg-slate-700 selection:text-white"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#f4f6f5',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#1e293b',
            }}
        >
            <div className="qw-paper-grain fixed inset-0 pointer-events-none opacity-[0.14] z-0" />

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center px-6 py-20 overflow-hidden z-10">
                <div className="max-w-5xl w-full mx-auto text-center z-10 space-y-6">
                    {/* Bespoke Scandinavian Pine & Birch Ornament */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.nordicPine}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto w-28 sm:w-32 opacity-90 drop-shadow-sm"
                    />
                    {hasCustomMonogram && (
                        <div className="flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/85 border border-slate-200 shadow-sm backdrop-blur-md text-slate-700"
                    >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: motifColor }} />
                        <span className="text-xs font-medium uppercase tracking-[0.35em]">{copy.eyebrow}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`text-4xl sm:text-6xl md:text-8xl font-serif font-light tracking-tight leading-none ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <span className="font-serif italic font-normal" style={{ color: motifColor }}>&amp;</span> {wedding.groom_name}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-sm sm:text-base font-light opacity-75 max-w-xl mx-auto tracking-wide"
                    >
                        {copy.subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.5 }}
                        className="relative max-w-2xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                    >
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={heroImage}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.nordicPine}
                            className="h-full w-full"
                            imgClassName="contrast-[0.95] brightness-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col sm:flex-row sm:items-end justify-end sm:justify-between gap-3 p-6 text-white text-left">
                            <div>
                                {wedding.venue_name && <p className="text-xs uppercase tracking-widest opacity-85">{wedding.venue_name}</p>}
                                {formattedDate && <p className="text-sm font-medium">{formattedDate}</p>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={copy.ctaHref}
                                    data-wedding-control="primary"
                                    aria-label={copy.ctaLabel}
                                    className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-medium text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-md"
                                >
                                    {copy.ctaLabel}
                                </a>
                                <a
                                    href={copy.detailsHref}
                                    data-wedding-control="secondary"
                                    className="px-5 py-2.5 border border-white/40 text-white rounded-full font-medium text-xs uppercase tracking-widest hover:bg-white/15 transition-colors"
                                >
                                    {copy.detailsLabel}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                    <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center" />
                </div>
            </section>

            {/* Content Sections */}
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} />
            
            {!wedding.is_thank_you_mode && (
                <CountdownTimer
                    id="countdown"
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                />
            )}

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

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

export default function RivieraTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#0284C7';
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
            className="font-serif relative pb-24 selection:bg-sky-500 selection:text-white"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fffdfa',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#083344',
            }}
        >
            {/* Cotton paper texture overlay */}
            <div className="qw-paper-grain fixed inset-0 pointer-events-none opacity-[0.14] z-0" />

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/35 via-amber-100/25 to-transparent pointer-events-none" />

                <div className="max-w-5xl w-full mx-auto text-center z-10 space-y-6">
                    {hasCustomMonogram && (
                        <div className="flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}

                    {/* Bespoke Coastal Shells & Olive Vignette */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.coastalShells}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto w-56 sm:w-64 opacity-90 drop-shadow-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-sky-200 bg-white/90 text-sky-900 text-xs font-sans uppercase tracking-[0.35em] shadow-sm backdrop-blur-md"
                    >
                        <span>{copy.eyebrow}</span>
                        {wedding.venue_name && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>{wedding.venue_name}</span>
                            </>
                        )}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`text-4xl sm:text-7xl md:text-8xl font-serif font-normal italic tracking-tight leading-tight ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <span className="font-sans font-extralight not-italic" style={{ color: motifColor }}>&amp;</span> {wedding.groom_name}
                    </motion.h1>

                    {(formattedDate || wedding.venue_address) && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="font-sans text-sm sm:text-base opacity-80 max-w-xl mx-auto tracking-wide uppercase font-light"
                        >
                            {[formattedDate, wedding.venue_address].filter(Boolean).join(' • ')}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="relative max-w-4xl mx-auto aspect-[16/10] rounded-[2.5rem] overflow-hidden border-[10px] border-white shadow-[0_30px_90px_rgba(14,165,233,0.15)]"
                    >
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={heroImage}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.coastalShells}
                            className="h-full w-full"
                            imgClassName="contrast-[1.02] saturate-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-sky-950/75 via-transparent to-transparent flex flex-col sm:flex-row sm:items-end justify-end sm:justify-between gap-4 p-6 sm:p-8 text-white">
                            <p className="font-serif italic text-base sm:text-xl text-amber-100 max-w-md text-left">
                                {copy.subtitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                                <a
                                    href={copy.ctaHref}
                                    data-wedding-control="primary"
                                    aria-label={copy.ctaLabel}
                                    className="px-8 py-3.5 bg-amber-400 text-sky-950 font-sans font-bold text-xs uppercase tracking-[0.25em] rounded-full hover:bg-amber-300 transition-all shadow-lg"
                                >
                                    {copy.ctaLabel}
                                </a>
                                <a
                                    href={copy.detailsHref}
                                    data-wedding-control="secondary"
                                    className="px-6 py-3.5 border border-white/40 text-white font-sans font-semibold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white/15 transition-colors"
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

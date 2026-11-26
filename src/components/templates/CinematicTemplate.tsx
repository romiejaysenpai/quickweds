'use client';

import { motion } from 'framer-motion';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import type { TemplateProps } from '@/types/wedding';
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

export default function CinematicTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#F59E0B';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-sans selection:bg-amber-500 selection:text-black overflow-hidden pb-24 relative"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#0b0c10',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#ffffff',
            }}
        >
            {/* Cinematic 21:9 Letterbox Bars */}
            <div className="fixed top-0 left-0 right-0 h-6 sm:h-10 bg-black z-40 pointer-events-none border-b border-white/10" />
            <div className="fixed bottom-0 left-0 right-0 h-6 sm:h-10 bg-black z-40 pointer-events-none border-t border-white/10" />

            <section className="min-h-screen relative flex items-center justify-center pt-10 pb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 0.72, scale: 1 }}
                    transition={{ duration: 2.5, ease: 'easeOut' }}
                    className="absolute inset-0 z-0"
                >
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        dark
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
                        className="h-full w-full"
                        imgClassName="brightness-75 contrast-125 saturate-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-[#0b0c10] pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_70%)] pointer-events-none" />
                </motion.div>

                <div className="z-10 text-center px-4 sm:px-6 max-w-5xl space-y-8 text-white">
                    {hasCustomMonogram && (
                        <div className="flex justify-center">
                            <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || '#FFFFFF' }} />
                        </div>
                    )}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: motifColor }} />
                        <span className="text-[10px] sm:text-xs uppercase tracking-[0.5em] font-mono font-bold text-white/85">
                            {copy.eyebrow}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className={`text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif leading-none tracking-tight text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.8)] ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name}
                        <span className="block text-2xl sm:text-4xl italic font-serif my-2" style={{ color: motifColor }}>&amp;</span>
                        {wedding.groom_name}
                    </motion.h1>

                    {(formattedDate || wedding.venue_name) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
                        >
                            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono tracking-[0.3em] uppercase text-amber-200/90">
                                {formattedDate && <span>{formattedDate}</span>}
                                {formattedDate && wedding.venue_name && <span>•</span>}
                                {wedding.venue_name && <span>{wedding.venue_name}</span>}
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="pt-4 flex flex-wrap items-center justify-center gap-4"
                    >
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="px-10 py-4 rounded-full bg-white text-black font-bold uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.25)] inline-flex items-center justify-center"
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="px-7 py-4 rounded-full border border-white/25 text-white font-semibold uppercase tracking-[0.25em] text-xs hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                        >
                            {copy.detailsLabel}
                        </a>
                    </motion.div>
                    <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="justify-center text-white" />
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} invert />
            
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
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

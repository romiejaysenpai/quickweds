'use client';

import { motion } from 'framer-motion';
import { getSectionTitleStyle } from '@/lib/theme-engine';
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
import {
    VideoSection,
    BioSection,
    DetailsSection,
    TimelineSection,
    GallerySection,
    GiftSection,
    CountdownTimer,
    AttireSection,
} from '../wedding';
import type { TemplateProps } from '@/types/wedding';

export default function RSVPFocusTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#C5A059';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="pb-24 relative"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#ffffff',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#171717',
            }}
        >
            <section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">
                <div className="qw-paper-grain absolute inset-0 opacity-[0.14] pointer-events-none" />
                {heroImage && (
                    <div className="absolute inset-0 opacity-12 pointer-events-none">
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={heroImage}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.waxSeal}
                            className="h-full w-full"
                        />
                    </div>
                )}

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative text-center z-10 px-4 sm:px-6 md:px-12 max-w-4xl"
                >
                    {hasCustomMonogram && (
                        <div className="mb-8 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8" style={{ color: motifColor }}>
                        {copy.eyebrow}
                    </p>
                    <h1
                        className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif mb-10 sm:mb-12 leading-tight ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <br />
                        <span className="text-xl sm:text-2xl md:text-3xl italic font-light" style={{ color: motifColor }}>&amp;</span>{' '}
                        <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-20 sm:w-24 h-[1px] mx-auto mb-10" style={{ backgroundColor: motifColor }} />
                    {wedding.wedding_date && (
                        <p className="text-lg sm:text-xl md:text-2xl font-serif italic opacity-80 mb-4">
                            {formatWeddingDate(wedding.wedding_date, { dateStyle: 'long' }, undefined)}
                        </p>
                    )}
                    {wedding.venue_name && (
                        <p className="text-base sm:text-lg font-light opacity-75 mb-10">
                            {wedding.venue_name}
                        </p>
                    )}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={wedding.is_thank_you_mode ? copy.ctaLabel : 'RSVP Here'}
                            className="inline-flex items-center justify-center px-12 sm:px-14 py-5 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl min-h-[56px]"
                            style={{ backgroundColor: motifColor, color: 'white' }}
                        >
                            {wedding.is_thank_you_mode ? copy.ctaLabel : 'RSVP Here'}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="inline-flex items-center justify-center px-7 py-5 border border-current/25 font-semibold uppercase tracking-widest text-xs hover:bg-current/5 transition-colors min-h-[56px]"
                        >
                            Wedding Details
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center mt-5" />
                </motion.div>

                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-30" style={{ backgroundColor: motifColor }} />
                </div>
            </section>

            <DetailsSection id="details" wedding={wedding} />
            <BioSection id="bio" wedding={wedding} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} galleryLayout={wedding.gallery_layout} wedding={wedding} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            {!wedding.is_thank_you_mode && (
                <CountdownTimer id="countdown"
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                    cardStyle={wedding.card_style}
                    wedding={wedding}
                />
            )}
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';

import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    TimelineSection,
    VideoSection,
    AttireSection,

} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';

import { getSectionTitleStyle } from '@/lib/theme-engine';

import {
    formatWeddingDate,
    resolveTemplateCopy,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingMonogram,
} from './shared';

export default function VintageTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#7A6452';
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-serif relative pb-24"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fdfbf6',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#5d544b',
            }}
        >
            <div className="qw-paper-grain fixed inset-0 pointer-events-none opacity-[0.16] z-0" />
            <section className="min-h-screen py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative overflow-hidden z-10">
                <div className="absolute inset-8 border-[0.5px] border-current/20 pointer-events-none rounded-[2rem]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                    className="max-w-4xl"
                >
                    {/* Bespoke Vintage Heirloom Oval Cameo Crest */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.vintageCameo}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto mb-5 w-44 sm:w-52 opacity-90 drop-shadow-sm"
                    />
                    {hasCustomMonogram && (
                        <div className="mb-6 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <p className="uppercase tracking-[0.4em] text-xs font-bold mb-8 sm:mb-10 opacity-65">
                        {copy.eyebrow}
                    </p>
                    <h1
                        className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif mb-8 sm:mb-10 drop-shadow-sm ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-3xl italic font-light opacity-50 my-4 sm:my-5 block" style={{ color: motifColor }}>
                            &amp;
                        </span>
                        {wedding.groom_name}
                    </h1>
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <div data-wedding-card="true" className="inline-block border-y border-current/20 py-5 sm:py-6 px-10 sm:px-14 bg-white/50 backdrop-blur-sm rounded-lg">
                            {wedding.wedding_date && (
                                <p className="text-xl sm:text-3xl uppercase tracking-[0.2em] font-bold">
                                    {formatWeddingDate(wedding.wedding_date, {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    }, undefined)}
                                </p>
                            )}
                            {wedding.venue_name && (
                                <p className="mt-2 text-sm uppercase tracking-[0.25em] opacity-70">{wedding.venue_name}</p>
                            )}
                        </div>
                    )}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.8 }}
                        className="mt-10 flex flex-wrap justify-center gap-3"
                    >
                        <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[44px] items-center justify-center px-10 py-3 uppercase tracking-[0.2em] text-xs font-bold border border-current/40 transition-all hover:bg-[#5d544b] hover:text-[#fdfbf6] rounded-sm">
                            {copy.ctaLabel}
                        </a>
                        <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[44px] items-center justify-center px-7 py-3 uppercase tracking-[0.2em] text-xs font-semibold border border-current/20 hover:bg-current/5 rounded-sm">
                            {copy.detailsLabel}
                        </a>
                    </motion.div>
                    <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center mt-5" />
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} />
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

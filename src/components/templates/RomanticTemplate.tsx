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

export default function RomanticTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#B97983';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    if (wedding.template_style === 'romantic-estate') {
        return (
            <div
                className="relative pb-24 font-serif selection:bg-[#b97983]/20"
                style={{
                    backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fff8f5',
                    color: hasBackgroundChoice ? 'var(--builder-ink)' : '#55373b',
                }}
            >
                <div className="qw-paper-grain-overlay opacity-[0.14]" />
                <section className="relative z-10 min-h-screen overflow-hidden px-5 py-12">
                    <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(185,121,131,0.20),transparent_62%)] pointer-events-none" />
                    <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center lg:text-left"
                        >
                            {hasCustomMonogram && (
                                <div className="mb-6 flex justify-center lg:justify-start">
                                    <WeddingMonogram wedding={wedding} />
                                </div>
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                                alt=""
                                aria-hidden="true"
                                className="mx-auto lg:mx-0 mb-6 w-28 opacity-85"
                            />
                            <p className="text-[10px] font-bold uppercase tracking-[0.42em]" style={{ color: motifColor }}>{copy.eyebrow}</p>
                            <h1
                                className={`mt-6 text-5xl leading-[0.95] sm:text-6xl md:text-7xl font-serif ${titleStyle.className}`}
                                style={titleStyle.style}
                            >
                                {wedding.bride_name}
                                <span className="block text-[0.55em] font-light italic" style={{ color: motifColor }}>&amp;</span>
                                {wedding.groom_name}
                            </h1>
                            <p className="mx-auto mt-6 max-w-lg text-lg italic leading-8 opacity-80 lg:mx-0">
                                {copy.subtitle}
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
                                <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[48px] items-center justify-center rounded-full px-8 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-[0_18px_45px_rgba(185,121,131,0.25)] transition-all hover:opacity-90" style={{ backgroundColor: motifColor }}>
                                    {copy.ctaLabel}
                                </a>
                                <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-current/25 px-7 text-xs font-bold uppercase tracking-[0.22em] hover:bg-current/5">
                                    {copy.detailsLabel}
                                </a>
                            </div>
                            <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center lg:justify-start mt-5" />
                        </motion.div>
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className="mx-auto aspect-[5/6] max-h-[740px] overflow-hidden rounded-t-full border border-[#b97983]/25 bg-white p-3 shadow-[0_35px_100px_rgba(85,55,59,0.14)] relative">
                                <WeddingHeroVisual
                                    wedding={wedding}
                                    gallery={gallery}
                                    src={heroImage}
                                    ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                                    className="h-full w-full rounded-t-full overflow-hidden"
                                    imgClassName="rounded-t-full object-[center_20%]"
                                />
                            </div>
                            {(wedding.wedding_date || wedding.venue_name) && (
                                <div className="absolute -bottom-5 left-1/2 w-[82%] -translate-x-1/2 bg-white/90 text-[#55373b] px-6 py-5 text-center shadow-[0_20px_60px_rgba(85,55,59,0.12)] backdrop-blur">
                                    {wedding.wedding_date && (
                                        <p className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: motifColor }}>
                                            {formatWeddingDate(wedding.wedding_date)}
                                        </p>
                                    )}
                                    {wedding.venue_name && <p className="mt-1 text-sm opacity-80">{wedding.venue_name}</p>}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>

                <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
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
                        cardStyle={wedding.card_style}
                        wedding={wedding}
                    />
                )}
                <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
                <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout} />
                <AttireSection wedding={wedding} />
                <GiftSection id="gift" wedding={wedding} />
                <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
            </div>
        );
    }

    return (
        <div
            className="font-serif relative pb-24 selection:bg-[#b03060]/20"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fffafa',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#8d244d',
            }}
        >
            <div className="qw-paper-grain-overlay opacity-[0.14]" />
            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
                <motion.div initial={false} animate={{ opacity: 1 }} className="max-w-3xl">
                    {hasCustomMonogram && (
                        <div className="mb-8 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto mb-6 w-32 opacity-85"
                    />
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.5em] font-sans font-bold opacity-65 mb-8 block">{copy.eyebrow}</span>
                    <h1
                        className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight drop-shadow-sm break-words ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <br />
                        <span className="font-light italic opacity-70">&amp;</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="flex flex-col gap-5 items-center mt-8">
                        <p className="text-xl sm:text-2xl italic opacity-80">{copy.subtitle}</p>
                        <div className="w-24 h-[1px] bg-current/25" />
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={copy.ctaHref}
                                data-wedding-control="primary"
                                aria-label={copy.ctaLabel}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-full px-8 py-3 text-xs font-sans font-bold uppercase tracking-[0.25em] text-white shadow-md"
                                style={{ backgroundColor: motifColor }}
                            >
                                {copy.ctaLabel}
                            </a>
                            <a
                                href={copy.detailsHref}
                                data-wedding-control="secondary"
                                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-current/25 px-7 py-3 text-xs font-sans font-semibold uppercase tracking-[0.2em]"
                            >
                                {copy.detailsLabel}
                            </a>
                        </div>
                        <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center" />
                    </div>
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
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
                    cardStyle={wedding.card_style}
                    wedding={wedding}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

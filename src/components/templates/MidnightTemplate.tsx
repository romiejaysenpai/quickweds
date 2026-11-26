'use client';

import { motion } from 'framer-motion';
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
import { getSectionTitleStyle } from '@/lib/theme-engine';
import type { TemplateProps } from '@/types/wedding';
import {
    resolveTemplateCopy,
    resolveWeddingMedia,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';

export default function MidnightTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const motifColor = wedding.motif_color || '#cfb53b';
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="relative overflow-x-clip pb-24 font-serif"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#0f0f0f',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : motifColor,
            }}
        >
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{ background: `radial-gradient(circle at center, ${motifColor}0D 0%, transparent 70%)` }}
            />

            <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
                <div className="flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 border-r border-current/15 bg-gradient-to-b from-[#0f0f0f] to-[#151515] text-white">
                    <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                        {hasCustomMonogram && (
                            <div className="mb-6">
                                <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || motifColor }} />
                            </div>
                        )}
                        <span className="text-xs font-black tracking-[0.5em] uppercase opacity-75 mb-8 block" style={{ color: motifColor }}>{copy.eyebrow}</span>
                        <h1
                            className={`text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif text-white mb-8 leading-tight ${titleStyle.className}`}
                            style={hasTitleChoice ? titleStyle.style : undefined}
                        >
                            {wedding.bride_name} <br />
                            <span className="text-2xl sm:text-3xl md:text-4xl italic font-light" style={{ color: motifColor }}>&amp;</span><br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl font-serif italic text-white/75 mb-8 sm:mb-10 max-w-md">
                            {copy.subtitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={copy.ctaHref}
                                data-wedding-control="primary"
                                aria-label={copy.ctaLabel}
                                className="px-8 sm:px-10 py-3.5 min-h-[44px] inline-flex items-center border transition-all uppercase text-xs font-black tracking-[0.2em] hover:opacity-90"
                                style={{ borderColor: motifColor, color: motifColor }}
                            >
                                {copy.ctaLabel}
                            </a>
                            <a
                                href={copy.detailsHref}
                                data-wedding-control="secondary"
                                className="px-6 py-3.5 min-h-[44px] inline-flex items-center border border-white/25 text-white/90 uppercase text-xs font-semibold tracking-[0.2em] hover:bg-white/10 transition-colors"
                            >
                                {copy.detailsLabel}
                            </a>
                        </div>
                        <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="mt-5 text-white" />
                    </motion.div>
                </div>
                <div className="relative h-[50vh] lg:h-auto">
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        dark
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
                        className="h-full w-full"
                        imgClassName="grayscale brightness-75 hover:grayscale-0 transition-all duration-1000 z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0f0f0f] pointer-events-none" />
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} invert={!hasBackgroundChoice} />
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
            <GiftSection id="gift" wedding={wedding} invert={!hasBackgroundChoice} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

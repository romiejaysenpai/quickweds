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
    getFirstName,
    resolveCouplePhoto,
    resolveTemplateCopy,
    resolveWeddingMedia,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';

export default function VogueTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#181818';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const secondaryPhoto = resolveCouplePhoto(wedding, gallery) || heroImage;
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-sans selection:bg-black selection:text-white pb-24"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#ffffff',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#000000',
            }}
        >
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[60vh] md:h-full order-2 md:order-1">
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.decoCrest}
                        className="h-full w-full"
                        imgClassName="contrast-[1.06] saturate-[0.85] z-0"
                    />
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none" />
                </div>
                <div className="flex flex-col justify-between px-4 sm:px-6 md:px-20 py-12 sm:py-16 md:py-24 order-1 md:order-2">
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-current pb-1">{copy.eyebrow}</span>
                        {copy.year ? <span className="text-[10px] font-black uppercase tracking-widest">{copy.year}</span> : null}
                    </div>

                    <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                        {hasCustomMonogram && (
                            <div className="mb-6">
                                <WeddingMonogram wedding={wedding} />
                            </div>
                        )}
                        <h1
                            className={`text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-serif leading-[0.85] mb-6 sm:mb-7 md:mb-8 ${titleStyle.className}`}
                            style={titleStyle.style}
                        >
                            {getFirstName(wedding.bride_name, 'Bride')} <br />
                            <span className="font-sans font-light italic ml-0 sm:ml-6 md:ml-12 text-2xl sm:text-3xl md:text-6xl opacity-50">&amp;</span> <br />
                            {getFirstName(wedding.groom_name, 'Groom')}
                        </h1>

                        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 items-end mt-8 sm:mt-10 md:mt-12">
                            <div className="flex-1 border-t border-current pt-3 sm:pt-4">
                                <p className="text-xs font-bold uppercase tracking-widest mb-2">Celebration</p>
                                {wedding.wedding_date && (
                                    <p className="text-lg sm:text-lg md:text-xl font-serif italic">
                                        {formatWeddingDate(wedding.wedding_date, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                )}
                                {wedding.venue_name && (
                                    <p className="text-xs uppercase tracking-widest opacity-65 mt-1">{wedding.venue_name}</p>
                                )}
                            </div>
                            <a
                                href={copy.ctaHref}
                                data-wedding-control="primary"
                                aria-label={copy.ctaLabel}
                                className="w-20 sm:w-24 h-20 sm:h-24 min-h-[44px] bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex-shrink-0 text-center px-2"
                            >
                                {copy.ctaLabel}
                            </a>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <a
                                href={copy.detailsHref}
                                data-wedding-control="secondary"
                                className="inline-flex min-h-[44px] items-center justify-center border border-current/25 px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-current/5"
                            >
                                {copy.detailsLabel}
                            </a>
                            <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 sm:py-24 md:py-28 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-24 items-center">
                    <div className="flex-1 md:text-right space-y-6">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic">
                            {wedding.is_thank_you_mode ? 'With Gratitude' : 'The Celebration'}
                        </h2>
                        <p className="text-lg sm:text-lg md:text-xl leading-relaxed font-light max-w-md ml-auto">
                            {copy.subtitle}
                        </p>
                    </div>
                    <div className="w-full md:w-1/3 aspect-[3/4] relative">
                        <div className="absolute inset-0 bg-neutral-200 -translate-x-4 translate-y-4" />
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={secondaryPhoto}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                            className="h-full w-full relative z-10"
                            imgClassName="grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
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
            <GallerySection id="gallery" gallery={gallery} masonry template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

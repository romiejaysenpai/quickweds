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

export default function LuxuryTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const motifColor = wedding.motif_color || '#C5A059';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    if (wedding.template_style === 'luxury-planner') {
        const plannerWedding = { ...wedding, template: 'editorial' };
        return (
            <div
                className="font-serif selection:bg-[#b9975b] selection:text-white pb-24"
                style={{
                    backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fbf7ef',
                    color: hasBackgroundChoice ? 'var(--builder-ink)' : '#2b2520',
                }}
            >
                <section className="relative min-h-screen overflow-hidden">
                    <div className="qw-paper-grain-overlay opacity-[0.14]" />
                    <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                            data-wedding-card="true"
                            className="order-2 lg:order-1 backdrop-blur-md bg-white/75 text-[#241f1b] p-8 lg:p-12 rounded-3xl border border-white/60 shadow-xl"
                        >
                            {hasCustomMonogram && (
                                <div className="mb-6">
                                    <WeddingMonogram wedding={wedding} />
                                </div>
                            )}
                            <p className="text-[10px] font-bold uppercase tracking-[0.42em]" style={{ color: motifColor }}>
                                {copy.eyebrow}
                            </p>
                            <h1
                                className={`mt-6 text-5xl leading-[0.92] sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#241f1b] ${titleStyle.className}`}
                                style={hasTitleChoice ? titleStyle.style : undefined}
                            >
                                {wedding.bride_name}
                                <span className="block text-[0.55em] italic leading-none" style={{ color: motifColor }}>&amp;</span>
                                {wedding.groom_name}
                            </h1>
                            {(wedding.wedding_date || wedding.venue_name) && (
                                <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.24em] opacity-75">
                                    {wedding.wedding_date && <span>{formatWeddingDate(wedding.wedding_date)}</span>}
                                    {wedding.wedding_date && wedding.venue_name && <span className="h-px w-10" style={{ backgroundColor: motifColor }} />}
                                    {wedding.venue_name && <span>{wedding.venue_name}</span>}
                                </div>
                            )}
                            <p className="mt-8 max-w-xl text-lg leading-8 opacity-80">
                                {copy.subtitle}
                            </p>
                            <div className="mt-10 flex flex-wrap gap-3">
                                <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[48px] items-center justify-center bg-[#2b2520] px-8 text-xs font-bold uppercase tracking-[0.28em] text-white transition-all hover:opacity-90">
                                    {copy.ctaLabel}
                                </a>
                                <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[48px] items-center justify-center border border-[#b9975b]/50 px-8 text-xs font-bold uppercase tracking-[0.28em] transition-all hover:border-[#2b2520]">
                                    {copy.detailsLabel}
                                </a>
                            </div>
                            <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="mt-5" />
                        </motion.div>
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, scale: 1 }}
                            className="order-1 lg:order-2"
                        >
                            <div className="relative mx-auto aspect-[4/5] max-h-[760px] overflow-hidden border border-[#b9975b]/25 bg-white p-3 shadow-[0_40px_120px_rgba(43,37,32,0.16)]">
                                <WeddingHeroVisual
                                    wedding={wedding}
                                    gallery={gallery}
                                    src={heroImage}
                                    ornamentSrc={TEMPLATE_ELEMENT_ASSETS.decoCrest}
                                    className="h-full w-full"
                                />
                                {copy.year ? (
                                    <div className="absolute -bottom-px -left-px bg-[#fbf7ef] text-[#241f1b] px-6 py-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: motifColor }}>{copy.year}</p>
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                </section>

                <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template="editorial" motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={plannerWedding} />
                <BioSection id="bio" wedding={plannerWedding} />
                <DetailsSection id="details" wedding={plannerWedding} />
                {!wedding.is_thank_you_mode && (
                    <CountdownTimer id="countdown"
                        weddingDate={wedding.wedding_date}
                        weddingTime={wedding.wedding_time}
                        brideName={wedding.bride_name}
                        groomName={wedding.groom_name}
                        venueName={wedding.venue_name}
                        venueAddress={wedding.venue_address}
                        template="editorial"
                        motifColor={wedding.motif_color}
                        cardStyle={wedding.card_style}
                        wedding={plannerWedding}
                    />
                )}
                <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={plannerWedding} />
                <GallerySection id="gallery" gallery={gallery} template="editorial" motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={plannerWedding} galleryLayout={wedding.gallery_layout} />
                <AttireSection wedding={plannerWedding} />
                <GiftSection id="gift" wedding={plannerWedding} />
                <SharedNewSections id="additional" wedding={plannerWedding} isExpired={isExpired} />
            </div>
        );
    }

    return (
        <div
            className="font-serif selection:bg-[#C5A059] selection:text-black pb-24"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#0a0a0a',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : motifColor,
            }}
        >
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-12 relative overflow-hidden">
                <div className="md:col-span-5 flex flex-col justify-center px-4 sm:px-6 md:px-16 py-12 sm:py-16 md:py-24 bg-black text-white z-10 border-r border-[#C5A059]/10">
                    <motion.div initial={false} animate={{ opacity: 1, x: 0 }}>
                        {hasCustomMonogram && (
                            <div className="mb-6">
                                <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || motifColor }} />
                            </div>
                        )}
                        <div className="w-16 h-[2px] mb-10" style={{ backgroundColor: motifColor }} />
                        <p className="text-xs uppercase tracking-[0.4em] font-sans mb-6" style={{ color: motifColor }}>{copy.eyebrow}</p>
                        <h1
                            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-white uppercase tracking-tighter mb-8 leading-[0.95] break-words ${titleStyle.className}`}
                            style={hasTitleChoice ? titleStyle.style : undefined}
                        >
                            {wedding.bride_name} <br />
                            <span style={{ color: motifColor }}>&amp;</span> <br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl font-serif italic mb-10 max-w-sm text-white/75">
                            {copy.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[48px] items-center justify-center px-10 py-4 text-black font-bold uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all" style={{ backgroundColor: motifColor }}>{copy.ctaLabel}</a>
                            <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[48px] items-center justify-center px-7 py-4 border border-white/25 text-white font-semibold uppercase tracking-[0.25em] text-xs hover:bg-white/10 transition-colors">{copy.detailsLabel}</a>
                        </div>
                        <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="mt-5 text-white" />
                    </motion.div>
                </div>
                <div className="md:col-span-7 h-[50vh] md:h-auto relative overflow-hidden group z-0">
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        dark
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.decoCrest}
                        className="h-full w-full"
                        imgClassName="contrast-[1.04] brightness-[0.82] saturate-[0.9] group-hover:scale-105 transition-transform duration-[10s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden md:block pointer-events-none" />
                    {copy.year ? (
                        <div className="absolute top-12 right-12 text-right pointer-events-none">
                            <p className="text-white text-6xl font-light opacity-25">{copy.year}</p>
                        </div>
                    ) : null}
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

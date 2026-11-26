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
    resolveTemplateCopy,
    resolveWeddingMedia,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';

export default function UrbanTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const motifColor = wedding.motif_color || '#E11D48';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="selection:bg-primary/50 font-sans"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#111111',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#ffffff',
            }}
        >
            <section className="min-h-screen py-20 flex bg-black relative group overflow-hidden text-white">
                <motion.div
                    initial={false}
                    animate={{ scale: 1, opacity: 0.55 }}
                    className="absolute inset-0 z-0 overflow-hidden"
                >
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        dark
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
                        className="h-full w-full"
                        imgClassName="grayscale brightness-50 group-hover:scale-105 transition-transform duration-[10s]"
                    />
                </motion.div>
                <div className="z-10 px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-24 flex flex-col justify-between w-full relative">
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/15 pb-6">
                        <p className="font-mono text-xs uppercase tracking-[0.45em]" style={{ color: motifColor }}>{copy.eyebrow}</p>
                        {hasCustomMonogram && <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || '#FFFFFF' }} />}
                    </div>

                    <motion.div initial={false} animate={{ opacity: 1, x: 0 }} className="my-10">
                        <h1
                            className={`text-4xl sm:text-6xl md:text-8xl lg:text-[clamp(4.5rem,10vw,8.5rem)] font-serif font-black uppercase leading-[0.84] mb-8 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${titleStyle.className}`}
                            style={hasTitleChoice ? titleStyle.style : undefined}
                        >
                            {getFirstName(wedding.bride_name, 'Bride')}<br />
                            <span style={{ color: motifColor }}>+</span><br />
                            {getFirstName(wedding.groom_name, 'Groom')}
                        </h1>
                        {(wedding.wedding_date || wedding.venue_name) && (
                            <div className="flex flex-wrap gap-4 sm:gap-8 font-mono text-xs sm:text-sm uppercase tracking-[0.25em] bg-black/60 backdrop-blur-md p-4 sm:p-5 border-l-4 inline-flex" style={{ borderColor: motifColor }}>
                                {wedding.wedding_date && <p>{formatWeddingDate(wedding.wedding_date, {}, 'en-US')}</p>}
                                {wedding.venue_name && <p>{wedding.venue_name}</p>}
                            </div>
                        )}
                    </motion.div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="text-white" />
                        <div className="flex flex-wrap items-center gap-4">
                            <a href={copy.detailsHref} data-wedding-control="secondary" className="px-6 py-3 border border-white/25 text-white font-mono text-xs uppercase tracking-[0.25em] hover:bg-white/10 transition-colors">{copy.detailsLabel}</a>
                            <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="transition-all text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight hover:tracking-wider min-h-[44px] flex items-center" style={{ color: motifColor }}>
                                {copy.ctaLabel} &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
            <BioSection id="bio" wedding={wedding} />
            <div className="px-4 sm:px-6 md:px-12 lg:px-32 py-12 sm:py-16 md:py-24 lg:py-32"><DetailsSection id="details" wedding={wedding} invert={!hasBackgroundChoice} /></div>
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

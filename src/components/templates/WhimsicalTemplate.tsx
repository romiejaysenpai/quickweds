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
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';

export default function WhimsicalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#D47B9E';
    const portrait = resolveCouplePhoto(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="relative overflow-hidden pb-24 font-serif"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fff9fc',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#523442',
            }}
        >
            <div className="qw-paper-grain fixed inset-0 pointer-events-none opacity-[0.14] z-0" />
            {/* Bespoke Sakura Floral Accents */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={TEMPLATE_ELEMENT_ASSETS.sakuraBranch}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -top-4 -right-6 w-48 sm:w-64 opacity-85 drop-shadow-md z-0"
            />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="max-w-3xl">
                    <div className="mb-8 sm:mb-10 relative group">
                        <div className="w-44 sm:w-56 md:w-64 h-44 sm:h-56 md:h-64 rounded-full border-[10px] border-white shadow-2xl overflow-hidden mx-auto rotate-3 group-hover:rotate-0 transition-transform duration-700 relative">
                            <WeddingHeroVisual
                                wedding={wedding}
                                gallery={gallery}
                                src={portrait}
                                ornamentSrc={TEMPLATE_ELEMENT_ASSETS.sakuraBranch}
                                className="h-full w-full"
                                imgClassName="scale-110"
                            />
                        </div>
                    </div>

                    {hasCustomMonogram && (
                        <div className="mb-6 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <p className="text-xs uppercase tracking-[0.35em] font-sans opacity-75 mb-4" style={{ color: motifColor }}>
                        {copy.eyebrow}
                    </p>
                    <h1
                        className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-none tracking-tight mb-6 drop-shadow-sm ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {getFirstName(wedding.bride_name, 'Bride')}{' '}
                        <span className="italic font-light" style={{ color: motifColor }}>&amp;</span>{' '}
                        {getFirstName(wedding.groom_name, 'Groom')}
                    </h1>
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <p className="text-sm sm:text-base font-sans uppercase tracking-[0.25em] opacity-75 mb-8">
                            {[wedding.wedding_date ? formatWeddingDate(wedding.wedding_date) : '', wedding.venue_name].filter(Boolean).join(' • ')}
                        </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-3">
                        <motion.a
                            whileHover={{ scale: 1.04 }}
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="px-10 py-4 min-h-[44px] inline-flex items-center justify-center rounded-full text-white font-bold tracking-widest uppercase text-xs shadow-lg"
                            style={{ backgroundColor: motifColor }}
                        >
                            {copy.ctaLabel}
                        </motion.a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="px-7 py-4 min-h-[44px] inline-flex items-center justify-center rounded-full border border-current/25 font-semibold tracking-widest uppercase text-xs hover:bg-current/5"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center mt-5" />
                </motion.div>
            </section>

            <section className="py-16 sm:py-24 bg-white/40 backdrop-blur-md border-y border-current/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
                    <h2 className="text-2xl sm:text-4xl font-serif">Our Story</h2>
                    <p className="text-lg sm:text-2xl font-serif leading-relaxed italic opacity-85">
                        {wedding.story || "A tale of two souls becoming one, captured in a beauty that never fades."}
                    </p>
                    <div className="flex gap-2 sm:gap-3 justify-center">
                        {[1, 2, 3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-primary/20" />)}
                    </div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} hideStory />
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

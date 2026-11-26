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

export default function RusticTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#7A543E';
    const portrait = resolveCouplePhoto(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-serif relative pb-24 selection:bg-[#5e503f] selection:text-[#f5ebe0]"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#f5ebe0',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#5e503f',
            }}
        >
            <div className="qw-paper-grain-overlay opacity-[0.16]" />

            <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative py-20 overflow-hidden">
                <div className="absolute inset-4 sm:inset-6 border-[2px] border-current/25 pointer-events-none rounded-lg" />
                <div className="absolute inset-7 sm:inset-9 border border-current/15 pointer-events-none rounded-lg" />
                {/* Bespoke Terracotta Floral Accent */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={TEMPLATE_ELEMENT_ASSETS.terracottaFlorals}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 -right-4 w-48 sm:w-64 opacity-85 drop-shadow-md z-0"
                />

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-4xl z-10 space-y-6"
                >
                    {hasCustomMonogram && (
                        <div className="flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}

                    <p className="text-xs uppercase tracking-[0.45em] font-sans font-bold opacity-75">
                        {copy.eyebrow}
                    </p>

                    <h1
                        className={`text-4xl sm:text-6xl md:text-8xl font-serif font-bold drop-shadow-sm leading-tight ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {getFirstName(wedding.bride_name, 'Bride')} &amp; {getFirstName(wedding.groom_name, 'Groom')}
                    </h1>

                    {(formattedDate || wedding.venue_name) && (
                        <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 border-y border-current/25 py-4 px-8 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm font-serif">
                            {formattedDate && <span className="text-lg sm:text-xl font-bold">{formattedDate}</span>}
                            {formattedDate && wedding.venue_name && <span className="w-2 h-2 rounded-full bg-current/40 hidden sm:block" />}
                            {wedding.venue_name && <span className="text-lg sm:text-xl">{wedding.venue_name}</span>}
                        </div>
                    )}

                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="px-10 py-4 inline-flex items-center justify-center text-[#f5ebe0] rounded-lg font-sans font-bold tracking-[0.25em] uppercase hover:opacity-90 transition-all shadow-lg text-xs"
                            style={{ backgroundColor: motifColor }}
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="px-7 py-4 inline-flex items-center justify-center border border-current/25 rounded-lg font-sans font-semibold tracking-[0.2em] uppercase hover:bg-current/5 transition-colors text-xs"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center" />
                </motion.div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-white/50 relative z-10">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, rotate: 2 }}
                        whileInView={{ opacity: 1, rotate: -1 }}
                        viewport={{ once: true }}
                        className="aspect-square relative p-4 bg-white shadow-2xl border border-stone-200 rounded-sm overflow-hidden"
                    >
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={portrait}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.terracottaFlorals}
                            className="h-full w-full"
                            imgClassName="sepia-[0.15]"
                        />
                    </motion.div>
                    <div className="space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            {wedding.is_thank_you_mode ? 'Thank You' : 'Welcome to Our Day'}
                        </h2>
                        <p className="text-lg leading-relaxed opacity-85">{copy.subtitle}</p>
                    </div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
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

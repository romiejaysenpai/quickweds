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

export default function TropicalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#00695C';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="relative pb-24 font-serif overflow-x-clip"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#e0f2f1',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#004d40',
            }}
        >
            {/* Sun Glow Overlay */}
            <div className="absolute top-0 right-0 w-40 sm:w-56 md:w-72 lg:w-96 h-40 sm:h-56 md:h-72 lg:h-96 bg-yellow-100/30 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none z-0" />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center relative overflow-hidden group">
                {/* Bespoke Tropical Monstera Corner Illustrations */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={TEMPLATE_ELEMENT_ASSETS.tropicalMonstera}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-4 -right-4 w-48 sm:w-64 md:w-72 opacity-85 drop-shadow-md z-0"
                />

                <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} className="text-center z-10 px-4 sm:px-6 max-w-4xl">
                    {hasCustomMonogram && (
                        <div className="mb-6 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <span className="text-xs uppercase tracking-[0.55em] font-black mb-6 block opacity-70">{copy.eyebrow}</span>
                    <h1
                        className={`text-4xl sm:text-6xl md:text-8xl lg:text-[clamp(4rem,10vw,7.5rem)] font-serif mb-8 sm:mb-10 tracking-tighter leading-[0.82] ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {getFirstName(wedding.bride_name, 'Bride')} <br />
                        <span className="text-2xl sm:text-3xl md:text-4xl align-middle italic" style={{ color: motifColor }}>&amp;</span> <br />
                        {getFirstName(wedding.groom_name, 'Groom')}
                    </h1>
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <div className="p-2 px-6 sm:px-10 border-2 inline-block mb-8 relative transition-all duration-300" style={{ borderColor: motifColor }}>
                            {wedding.wedding_date && (
                                <p className="text-xl sm:text-3xl font-serif py-1">{formatWeddingDate(wedding.wedding_date, { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                            )}
                            {wedding.venue_name && (
                                <p className="text-xs font-sans uppercase tracking-[0.25em] opacity-80 pb-1">{wedding.venue_name}</p>
                            )}
                        </div>
                    )}
                    <div className="flex flex-wrap justify-center gap-3">
                        <motion.a
                            whileHover={{ y: -3 }}
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="px-10 py-4 min-h-[44px] inline-flex items-center justify-center text-white rounded-full font-black tracking-widest uppercase text-xs shadow-lg"
                            style={{ backgroundColor: motifColor }}
                        >
                            {copy.ctaLabel}
                        </motion.a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="px-7 py-4 min-h-[44px] inline-flex items-center justify-center rounded-full border border-current/25 font-bold tracking-widest uppercase text-xs hover:bg-current/5"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center mt-5" />
                </motion.div>
            </section>

            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-16 items-center">
                    <div className="w-full md:w-1/2 relative aspect-[4/5]">
                        <div className="absolute -inset-4 border-2 border-current/15 rounded-[4rem] rotate-3 -z-10" />
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={heroImage}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.tropicalMonstera}
                            className="h-full w-full rounded-[3.5rem] overflow-hidden"
                        />
                    </div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif tracking-tighter">
                            {wedding.is_thank_you_mode ? 'With Warmest Gratitude' : 'Celebrate With Us'}
                        </h2>
                        <p className="text-lg sm:text-xl md:text-2xl font-serif leading-relaxed opacity-85 italic border-l-4 pl-4 sm:pl-6" style={{ borderColor: motifColor }}>
                            {copy.subtitle}
                        </p>
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
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

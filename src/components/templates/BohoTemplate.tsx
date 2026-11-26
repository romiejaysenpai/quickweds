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
import { getSectionTitleStyle } from '@/lib/theme-engine';
import type { TemplateProps } from '@/types/wedding';

export default function BohoTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#8b4513';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-serif relative pb-24 selection:bg-[#8b4513]/20 overflow-x-clip"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fcf8f1',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#5d2e0a',
            }}
        >
            {/* Organic Cotton Paper Texture */}
            <div className="qw-paper-grain-overlay opacity-[0.14]" />

            <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative py-20">
                {/* Bespoke Terracotta Floral Sprig */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={TEMPLATE_ELEMENT_ASSETS.terracottaFlorals}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 -right-4 w-48 sm:w-64 opacity-85 drop-shadow-md z-0"
                />

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    {/* Hero Text Content */}
                    <div className="lg:col-span-7 z-10 text-center lg:text-left order-2 lg:order-1">
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {hasCustomMonogram && (
                                <div className="mb-6 flex justify-center lg:justify-start">
                                    <WeddingMonogram wedding={wedding} />
                                </div>
                            )}
                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.55em] font-black opacity-60 mb-6 block">{copy.eyebrow}</span>

                            <h1
                                className={`text-5xl sm:text-7xl md:text-8xl lg:text-[clamp(4.5rem,8.5vw,8rem)] mb-8 leading-[0.88] italic font-serif ${titleStyle.className}`}
                                style={titleStyle.style}
                            >
                                {getFirstName(wedding.bride_name, 'Bride')}
                                <span className="block text-3xl sm:text-4xl font-light not-italic opacity-45 my-3" style={{ color: motifColor }}>&amp;</span>
                                <span className="block">{getFirstName(wedding.groom_name, 'Groom')}</span>
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-4 mt-10 items-center lg:items-start">
                                <motion.a
                                    href={copy.ctaHref}
                                    data-wedding-control="primary"
                                    aria-label={copy.ctaLabel}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="px-10 py-4 text-[#fcf8f1] rounded-full font-bold uppercase tracking-widest text-[11px] shadow-xl transition-all hover:opacity-90"
                                    style={{ backgroundColor: motifColor }}
                                >
                                    {copy.ctaLabel}
                                </motion.a>
                                <a
                                    href={copy.detailsHref}
                                    data-wedding-control="secondary"
                                    className="px-7 py-4 border border-current/25 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-current/5"
                                >
                                    {copy.detailsLabel}
                                </a>
                            </div>
                            {(wedding.wedding_date || wedding.venue_name) && (
                                <div className="text-center lg:text-left mt-6">
                                    {wedding.wedding_date && <p className="text-sm uppercase tracking-widest opacity-75 font-bold">{formatWeddingDate(wedding.wedding_date)}</p>}
                                    {wedding.venue_name && <p className="text-xs uppercase tracking-[0.25em] opacity-65 mt-1">{wedding.venue_name}</p>}
                                </div>
                            )}
                            <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center lg:justify-start mt-5" />
                        </motion.div>
                    </div>

                    {/* Hero Image / Frame */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                        >
                            <div className="aspect-[4/5] w-full rounded-[3.5rem] overflow-hidden border-[10px] border-white shadow-2xl relative z-10 bg-[#8b4513]/10">
                                <WeddingHeroVisual
                                    wedding={wedding}
                                    gallery={gallery}
                                    src={heroImage}
                                    ornamentSrc={TEMPLATE_ELEMENT_ASSETS.terracottaFlorals}
                                    className="h-full w-full"
                                    imgClassName="group-hover:scale-105 transition-transform duration-[5s]"
                                />
                            </div>
                        </motion.div>
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
            <GallerySection id="gallery" gallery={gallery} template={wedding.template || 'boho'} motifColor={motifColor} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

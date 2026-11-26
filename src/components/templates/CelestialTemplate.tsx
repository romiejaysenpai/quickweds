'use client';

import { motion } from 'framer-motion';
import { getSectionTitleStyle } from '@/lib/theme-engine';
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
import type { TemplateProps } from '@/types/wedding';

export default function CelestialTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const motifColor = wedding.motif_color || '#FBBF24';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );
    const formattedDate = formatWeddingDate(wedding.wedding_date, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div
            className="font-serif relative pb-24 selection:bg-amber-400 selection:text-slate-950"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#090d16',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#fef3c7',
            }}
        >
            {/* Cosmic Ambient Background */}
            {!hasBackgroundChoice && (
                <>
                    <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-indigo-950/20 to-slate-950" />
                    <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:48px_48px]" />
                </>
            )}

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center px-6 py-24 overflow-hidden">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center z-10 space-y-8">
                    {/* Bespoke Celestial Brass Astrolabe Medallion */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto w-24 sm:w-28 opacity-90 drop-shadow-[0_0_24px_rgba(251,191,36,0.35)]"
                    />
                    {hasCustomMonogram && (
                        <div className="flex justify-center">
                            <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || motifColor }} />
                        </div>
                    )}

                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xs uppercase tracking-[0.45em] font-sans opacity-80"
                        style={{ color: motifColor }}
                    >
                        {copy.eyebrow}
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`text-4xl sm:text-7xl md:text-8xl tracking-widest uppercase font-serif font-light ${hasTitleChoice ? titleStyle.className : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400'} drop-shadow-[0_0_40px_rgba(251,191,36,0.2)]`}
                        style={hasTitleChoice ? titleStyle.style : undefined}
                    >
                        {wedding.bride_name} <br />
                        <span className="font-serif italic lowercase text-4xl sm:text-6xl tracking-normal" style={{ color: motifColor }}>&amp;</span> <br />
                        {wedding.groom_name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="relative max-w-xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-amber-300/40 via-indigo-500/20 to-amber-300/20 shadow-[0_25px_80px_rgba(15,23,42,0.8)]"
                    >
                        <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-[22px] overflow-hidden">
                            <WeddingHeroVisual
                                wedding={wedding}
                                gallery={gallery}
                                src={heroImage}
                                dark
                                ornamentSrc={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
                                className="h-full w-full"
                                imgClassName="brightness-90 contrast-[1.05]"
                            />
                            {(wedding.venue_name || formattedDate) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-left pointer-events-none">
                                    {wedding.venue_name && <p className="text-amber-300 font-sans text-xs uppercase tracking-widest">{wedding.venue_name}</p>}
                                    {formattedDate && <p className="text-white font-serif text-lg font-light">{formattedDate}</p>}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="pt-4 flex flex-wrap justify-center gap-3"
                    >
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-sans font-bold uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="inline-flex items-center px-7 py-4 rounded-full border border-current/25 font-sans font-semibold uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-colors"
                        >
                            {copy.detailsLabel}
                        </a>
                    </motion.div>
                    <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="justify-center" />
                </div>
            </section>

            {/* Sections */}
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} invert />

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
                />
            )}

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

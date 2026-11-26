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

export default function GlitchTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const motifColor = wedding.motif_color || '#34D399';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-mono min-h-screen relative pb-24 selection:bg-emerald-400 selection:text-black"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#050807',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#34d399',
            }}
        >
            {!hasBackgroundChoice && (
                <div className="fixed inset-0 pointer-events-none opacity-25 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(0,255,150,0.06),rgba(0,180,255,0.04),rgba(255,0,150,0.06))] bg-[length:100%_4px,4px_100%]" />
            )}

            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-24 py-16 relative overflow-hidden">
                <div className="max-w-5xl z-10 space-y-8">
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        className="border-l-4 border-emerald-400 pl-4 sm:pl-6 bg-emerald-950/35 py-4 rounded-r-lg backdrop-blur-sm border-t border-b border-r border-emerald-400/30"
                    >
                        {hasCustomMonogram && (
                            <div className="mb-4">
                                <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || motifColor }} />
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold mb-2 uppercase tracking-[0.25em]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{copy.eyebrow}</span>
                        </div>
                        <h1
                            className={`text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-black uppercase leading-none tracking-tight ${hasTitleChoice ? titleStyle.className : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500'} filter drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]`}
                            style={hasTitleChoice ? titleStyle.style : undefined}
                        >
                            {wedding.bride_name}
                            <span className="text-fuchsia-400 text-2xl sm:text-4xl block my-1">&amp;</span>
                            {wedding.groom_name}
                        </h1>
                    </motion.div>

                    {(formattedDate || wedding.venue_name) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            {formattedDate && (
                                <div className="border border-emerald-400/40 bg-black/70 p-4 rounded shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                                    <p className="opacity-60 text-[10px] mb-1 uppercase tracking-widest">Date</p>
                                    <p className="text-sm font-bold text-emerald-200">{formattedDate}</p>
                                </div>
                            )}
                            {wedding.venue_name && (
                                <div className="border border-emerald-400/40 bg-black/70 p-4 rounded shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                                    <p className="opacity-60 text-[10px] mb-1 uppercase tracking-widest">Venue</p>
                                    <p className="text-sm font-bold text-emerald-200">{wedding.venue_name}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 items-center">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-400 text-black font-black uppercase tracking-wider text-xs hover:bg-cyan-300 transition-all shadow-[0_0_25px_rgba(52,211,153,0.5)]"
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="inline-flex items-center px-6 py-4 border border-emerald-400/40 text-emerald-200 font-bold uppercase tracking-wider text-xs hover:bg-emerald-950/60 transition-colors"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="text-emerald-200" />
                </div>

                {heroImage && (
                    <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-40 mix-blend-screen pointer-events-none z-0">
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={heroImage}
                            dark
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
                            className="h-full w-full"
                            imgClassName="filter contrast-150 grayscale"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-[#050807] via-transparent to-[#050807]" />
                    </div>
                )}
            </section>

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

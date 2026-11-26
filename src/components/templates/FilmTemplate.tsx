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

export default function FilmTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const motifColor = wedding.motif_color || '#DC2626';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-mono relative pb-24 selection:bg-red-600 selection:text-white"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#121212',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#e0e0e0',
            }}
        >
            {/* Vintage Film Grain Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-film-texture)' }} />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center px-4 sm:px-6 relative">
                {/* 35mm Film Sprocket Hole Header & Footer */}
                <div
                    className="absolute top-0 left-0 w-full h-10 bg-black border-b border-white/10"
                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="100%25" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="24" height="20" rx="3" fill="%23ffffff" fill-opacity="0.15"/></svg>')` }}
                />
                <div
                    className="absolute bottom-0 left-0 w-full h-10 bg-black border-t border-white/10"
                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="100%25" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="24" height="20" rx="3" fill="%23ffffff" fill-opacity="0.15"/></svg>')` }}
                />

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    className="bg-zinc-950 p-4 pb-10 pt-4 max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.8)] border border-white/10 rounded-sm relative z-10"
                >
                    <div className="aspect-[4/5] bg-zinc-900 mb-4 relative overflow-hidden group rounded-sm border border-white/10">
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={heroImage}
                            dark
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
                            className="h-full w-full"
                            imgClassName="sepia-[0.15] contrast-125 group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div data-wedding-card="true" className="text-center font-serif text-zinc-900 bg-amber-50 p-6 sm:p-8 rounded-sm shadow-inner">
                        {hasCustomMonogram && (
                            <div className="mb-3 flex justify-center">
                                <WeddingMonogram wedding={wedding} />
                            </div>
                        )}
                        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-500 mb-2">{copy.eyebrow}</p>
                        <h1
                            className={`text-3xl sm:text-5xl font-serif font-bold mb-2 tracking-tight text-zinc-900 ${titleStyle.className}`}
                            style={hasTitleChoice ? titleStyle.style : undefined}
                        >
                            {wedding.bride_name} &amp; {wedding.groom_name}
                        </h1>
                        <div className="w-12 h-px bg-zinc-400 mx-auto my-4" />
                        {(formattedDate || wedding.venue_name) && (
                            <p className="text-xs uppercase tracking-widest font-mono text-zinc-600">
                                {[formattedDate, wedding.venue_name].filter(Boolean).join(' • ')}
                            </p>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 z-10 flex flex-wrap justify-center gap-3"
                >
                    <a
                        href={copy.ctaHref}
                        data-wedding-control="primary"
                        aria-label={copy.ctaLabel}
                        className="px-10 py-4 text-white font-mono font-bold uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all shadow-[0_0_30px_rgba(220,38,38,0.35)] inline-flex items-center justify-center rounded-sm"
                        style={{ backgroundColor: motifColor }}
                    >
                        {copy.ctaLabel}
                    </a>
                    <a
                        href={copy.detailsHref}
                        data-wedding-control="secondary"
                        className="px-7 py-4 border border-current/25 font-mono font-semibold uppercase tracking-[0.2em] text-xs hover:bg-current/5 transition-colors inline-flex items-center justify-center rounded-sm"
                    >
                        {copy.detailsLabel}
                    </a>
                </motion.div>
                <TemplateHeroActions wedding={wedding} variant={hasBackgroundChoice ? 'editorial' : 'noir'} motifColor={motifColor} className="justify-center mt-5 z-10" />
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} invert={!hasBackgroundChoice} />
            
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
            <GiftSection id="gift" wedding={wedding} invert={!hasBackgroundChoice} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

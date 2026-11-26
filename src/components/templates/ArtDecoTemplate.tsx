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
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingMonogram,
} from './shared';

export default function ArtDecoTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const motifColor = wedding.motif_color || '#d4af37';
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-serif selection:bg-[#d4af37] selection:text-black pb-24 relative overflow-hidden"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#141414',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#d4af37',
            }}
        >
            {!hasBackgroundChoice && (
                <>
                    <div className="fixed inset-0 opacity-15 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-transparent to-black" />
                    <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-deco-texture)' }} />
                </>
            )}

            <section className="min-h-screen py-16 sm:py-24 flex items-center justify-center px-4 sm:px-6 relative">
                {/* 1920s Art Deco Double Border Frame */}
                <div className="absolute inset-4 sm:inset-8 border-[3px] border-current/40 pointer-events-none" />
                <div className="absolute inset-7 sm:inset-11 border border-current/25 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 text-center bg-black/85 text-[#f7e7be] backdrop-blur-xl p-8 sm:p-14 md:p-20 border border-[#d4af37]/40 max-w-4xl w-full shadow-[0_0_90px_rgba(212,175,55,0.18)]"
                >
                    {/* Bespoke Geometric Gold Crest */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.decoCrest}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto mb-5 w-20 sm:w-24 opacity-90 drop-shadow-md"
                    />
                    {hasCustomMonogram && (
                        <div className="mb-6 flex justify-center">
                            <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || motifColor }} />
                        </div>
                    )}

                    <span className="text-xs uppercase tracking-[0.65em] font-sans font-bold opacity-80 mb-6 block text-amber-200">
                        {copy.eyebrow}
                    </span>

                    <h1
                        className={`text-4xl sm:text-6xl md:text-8xl font-serif mb-6 leading-none tracking-widest uppercase ${hasTitleChoice ? titleStyle.className : 'text-transparent bg-clip-text bg-gradient-to-b from-[#fceabb] to-[#f8b500]'}`}
                        style={hasTitleChoice ? titleStyle.style : undefined}
                    >
                        {getFirstName(wedding.bride_name, 'Bride')}
                        <span className="text-2xl sm:text-3xl italic normal-case block my-4 font-serif" style={{ color: motifColor }}>&amp;</span>
                        {getFirstName(wedding.groom_name, 'Groom')}
                    </h1>

                    {(formattedDate || wedding.venue_name) && (
                        <div className="flex items-center justify-center gap-4 my-8">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
                            <span className="text-xs font-sans tracking-[0.35em] uppercase text-amber-300">
                                {[formattedDate, wedding.venue_name].filter(Boolean).join(' • ')}
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
                        </div>
                    )}

                    <p className="text-sm sm:text-base tracking-[0.15em] font-light max-w-md mx-auto opacity-85 mb-10 leading-relaxed">
                        {copy.subtitle}
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="px-10 py-4 bg-gradient-to-r from-[#d4af37] to-[#fceabb] text-black font-sans font-bold uppercase tracking-[0.3em] text-xs hover:brightness-110 transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] inline-flex items-center justify-center"
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="px-7 py-4 border border-[#d4af37]/40 text-amber-100 font-sans font-semibold uppercase tracking-[0.25em] text-xs hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="justify-center mt-5 text-amber-100" />
                </motion.div>
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

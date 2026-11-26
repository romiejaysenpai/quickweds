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
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingMonogram,
} from './shared';

export default function EleganceTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#8F394A';
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-serif relative pb-24"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#faf9f6',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#3d3d3d',
            }}
        >
            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
                <div className="qw-paper-grain absolute top-0 left-0 w-full h-full opacity-[0.14] pointer-events-none" />
                
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} data-wedding-card="true" className="z-10 bg-white/65 backdrop-blur-sm p-8 sm:p-12 md:p-16 lg:p-20 shadow-2xl border border-white relative max-w-3xl w-full">
                    <div className="absolute -top-6 -left-6 w-12 sm:w-16 h-12 sm:h-16 border-t-2 border-l-2 rounded-tl-3xl" style={{ borderColor: `${motifColor}66` }} />
                    <div className="absolute -bottom-6 -right-6 w-12 sm:w-16 h-12 sm:h-16 border-b-2 border-r-2 rounded-br-3xl" style={{ borderColor: `${motifColor}66` }} />

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto mb-5 w-28 opacity-85"
                    />
                    {hasCustomMonogram && (
                        <div className="mb-6 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <p className="text-xs uppercase tracking-[0.35em] font-sans opacity-70 mb-6">{copy.eyebrow}</p>

                    <h1
                        className={`text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif mb-8 leading-tight tracking-tight uppercase ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <br />
                        <span className="text-xl sm:text-2xl md:text-3xl italic font-light lowercase my-5 block" style={{ color: motifColor }}>&amp;</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="w-16 h-[1px] mx-auto mb-8" style={{ backgroundColor: `${motifColor}4D` }} />
                    <p className="text-lg sm:text-xl font-serif italic mb-4 opacity-80">{copy.subtitle}</p>
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <p className="text-xs uppercase tracking-[0.28em] font-sans opacity-70 mb-10">
                            {[wedding.wedding_date ? formatWeddingDate(wedding.wedding_date) : '', wedding.venue_name].filter(Boolean).join(' • ')}
                        </p>
                    )}
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="px-10 py-4 text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:opacity-90 transition-all shadow-lg min-h-[44px] inline-flex items-center justify-center" style={{ backgroundColor: motifColor }}>{copy.ctaLabel}</a>
                        <a href={copy.detailsHref} data-wedding-control="secondary" className="px-7 py-4 border border-current/25 font-semibold uppercase tracking-[0.25em] text-[10px] hover:bg-current/5 transition-colors min-h-[44px] inline-flex items-center justify-center">{copy.detailsLabel}</a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center mt-5" />
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
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

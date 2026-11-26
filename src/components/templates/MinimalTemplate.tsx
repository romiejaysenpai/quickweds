'use client';

import { motion } from 'framer-motion';

import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    TimelineSection,
    VideoSection,
    AttireSection,

} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';
import { getSectionTitleStyle } from '@/lib/theme-engine';

import {
    formatWeddingDate,
    resolveTemplateCopy,
    SharedNewSections,
    TemplateHeroActions,
    WeddingMonogram,
} from './shared';

export default function MinimalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#C5A059';
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );
    
    return (
        <div
            className="pb-24 relative"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#ffffff',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#262626',
            }}
        >
            <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
                <div className="qw-paper-grain absolute inset-0 opacity-[0.14] pointer-events-none" />
                
                <div className="max-w-4xl text-center px-4 sm:px-6 md:px-12 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 1.5 }}
                    >
                        {hasCustomMonogram && (
                            <div className="mb-8 flex justify-center">
                                <WeddingMonogram wedding={wedding} />
                            </div>
                        )}
                        <motion.p 
                            className="text-xs uppercase tracking-[0.5em] font-medium mb-8 sm:mb-10 md:mb-12"
                            style={{ color: motifColor }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            {copy.eyebrow}
                        </motion.p>
                        
                        <motion.h1 
                            className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-10 sm:mb-12 md:mb-16 ${titleStyle.className}`}
                            style={titleStyle.style}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            {wedding.bride_name} <br />
                            <span 
                                className="font-light italic font-serif ml-0 sm:ml-2 md:ml-4"
                                style={{ color: motifColor }}
                            >
                                &amp;
                            </span>{' '}
                            <br />
                            {wedding.groom_name}
                        </motion.h1>
                        
                        <motion.div 
                            className="w-16 sm:w-20 md:w-24 h-[1px] mx-auto mb-10 sm:mb-12 md:mb-16"
                            style={{ backgroundColor: motifColor }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        />
                        
                        {wedding.wedding_date && (
                            <motion.p 
                                className="text-lg sm:text-xl md:text-2xl font-light tracking-widest uppercase opacity-75"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                            >
                                {formatWeddingDate(wedding.wedding_date, {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                }, undefined)}
                            </motion.p>
                        )}
                        
                        {wedding.venue_name && (
                            <motion.p
                                className="text-base sm:text-lg font-light opacity-70 mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 0.8 }}
                            >
                                {wedding.venue_name}
                            </motion.p>
                        )}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6, duration: 0.8 }}
                            className="mt-12 flex flex-wrap justify-center gap-3"
                        >
                            <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[44px] items-center justify-center px-10 py-3 uppercase tracking-widest text-xs font-bold border transition-all hover:bg-neutral-50" style={{ borderColor: motifColor, color: motifColor }}>
                                {copy.ctaLabel}
                            </a>
                            <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[44px] items-center justify-center px-7 py-3 uppercase tracking-widest text-xs font-semibold border border-current/20 hover:bg-current/5">
                                {copy.detailsLabel}
                            </a>
                        </motion.div>
                        <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center mt-5" />
                    </motion.div>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-30" style={{ backgroundColor: motifColor }} />
                </div>
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

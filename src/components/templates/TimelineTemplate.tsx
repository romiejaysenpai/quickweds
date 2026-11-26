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
import { formatWeddingDate, resolveTemplateCopy, SharedNewSections, TemplateHeroActions, WeddingMonogram } from './shared';
import type { TemplateProps } from '@/types/wedding';
import { getSectionTitleStyle } from '@/lib/theme-engine';

export default function TimelineTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#C5A059';
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );
    
    return (
        <div
            className="font-serif pb-24"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#ffffff',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#171717',
            }}
        >
            <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
                <div className="qw-paper-grain absolute inset-0 opacity-[0.14] pointer-events-none" />
                
                <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2" style={{ borderColor: motifColor + '40' }} />
                <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2" style={{ borderColor: motifColor + '40' }} />
                
                <div className="relative text-center z-10 px-4 sm:px-6 md:px-12 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                    >
                        {hasCustomMonogram && (
                            <div className="mb-8 flex justify-center">
                                <WeddingMonogram wedding={wedding} />
                            </div>
                        )}
                        <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8 sm:mb-10 md:mb-12" style={{ color: motifColor }}>
                            {copy.eyebrow}
                        </p>
                        <h1
                            className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif mb-10 sm:mb-12 md:mb-16 leading-tight ${titleStyle.className}`}
                            style={titleStyle.style}
                        >
                            {wedding.bride_name} <br />
                            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl italic font-light" style={{ color: motifColor }}>&amp;</span>{' '}
                            <br />
                            {wedding.groom_name}
                        </h1>
                        <div className="w-20 sm:w-24 md:w-32 h-[1px] mx-auto mb-10 sm:mb-12 md:mb-16" style={{ backgroundColor: motifColor }} />
                        {wedding.wedding_date && (
                            <p className="text-lg sm:text-xl md:text-2xl font-serif italic opacity-80">
                                {formatWeddingDate(wedding.wedding_date, { dateStyle: 'long' }, undefined)}
                            </p>
                        )}
                        {wedding.venue_name && (
                            <p className="text-base sm:text-lg md:text-xl font-light opacity-65 mt-4">
                                {wedding.venue_name}
                            </p>
                        )}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="mt-12 flex flex-wrap justify-center gap-3"
                        >
                            <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[44px] items-center justify-center px-10 py-3 uppercase tracking-widest text-xs font-bold border transition-all hover:bg-neutral-50" style={{ borderColor: motifColor, color: motifColor }}>
                                {copy.ctaLabel}
                            </a>
                            <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[44px] items-center justify-center px-7 py-3 uppercase tracking-widest text-xs font-semibold border border-current/25 hover:bg-current/5">
                                {copy.detailsLabel}
                            </a>
                        </motion.div>
                        <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center mt-5" />
                    </motion.div>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-40" style={{ backgroundColor: motifColor }} />
                </div>
            </section>

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <DetailsSection id="details" wedding={wedding} />
            <AttireSection wedding={wedding} />
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
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

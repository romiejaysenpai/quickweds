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
    resolveTemplateCopy,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingMonogram,
} from './shared';
import type { TemplateProps } from '@/types/wedding';
import { getSectionTitleStyle } from '@/lib/theme-engine';

export default function TraditionalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#C5A059';
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );
    
    return (
        <div
            className="font-serif relative pb-24"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fafafa',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#404040',
            }}
        >
            <div className="qw-paper-grain fixed inset-0 pointer-events-none opacity-[0.14] z-0" />
            <section className="min-h-screen py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
                <div className="absolute inset-8 sm:inset-12 md:inset-16 border border-current/15 pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1 }} 
                    data-wedding-card="true"
                    className="z-10 bg-white/95 text-[#362E2B] p-8 sm:p-12 md:p-16 lg:p-20 shadow-sm border border-neutral-200 max-w-3xl w-full"
                >
                    {/* Bespoke Wax Seal Crest */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.waxSeal}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto mb-6 w-20 sm:w-24 opacity-90 drop-shadow-sm"
                    />
                    {hasCustomMonogram && (
                        <div className="mb-6 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <motion.p 
                        className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8"
                        style={{ color: motifColor }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        {copy.eyebrow}
                    </motion.p>
                    
                    <motion.h1 
                        className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif mb-8 border-y border-neutral-200 py-10 leading-tight ${titleStyle.className}`}
                        style={titleStyle.style}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        {wedding.bride_name} <br />
                        <span 
                            className="text-2xl sm:text-3xl italic font-light my-5 block"
                            style={{ color: motifColor }}
                        >
                            &amp;
                        </span>
                        {wedding.groom_name}
                    </motion.h1>
                    
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            {wedding.wedding_date && (
                                <p className="text-xl sm:text-2xl tracking-[0.2em] font-light">
                                    {formatWeddingDate(wedding.wedding_date, {}, undefined)}
                                </p>
                            )}
                            {wedding.venue_name && (
                                <p className="text-lg sm:text-xl italic opacity-65">
                                    {wedding.venue_name}
                                </p>
                            )}
                        </motion.div>
                    )}
                    
                    <motion.div 
                        className="mt-10 flex flex-wrap justify-center gap-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        <a 
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="inline-flex items-center justify-center px-10 py-4 border-2 font-bold uppercase tracking-widest text-xs min-h-[44px] hover:!bg-neutral-800 hover:!text-white transition-all"
                            style={{ borderColor: motifColor, color: motifColor }}
                        >
                            {copy.ctaLabel}
                        </a>
                        <a 
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="inline-flex items-center justify-center px-7 py-4 border border-current/25 font-semibold uppercase tracking-widest text-xs min-h-[44px] hover:bg-neutral-100 transition-colors"
                        >
                            {copy.detailsLabel}
                        </a>
                    </motion.div>
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
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
} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';

import { SharedNewSections } from './shared';

export default function MinimalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#C5A059';
    
    return (
        <div className="bg-white text-neutral-800 pb-24">
            <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />
                
                <div className="max-w-4xl text-center px-4 sm:px-6 md:px-12 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 1.5 }}
                    >
                        <motion.p 
                            className="text-xs uppercase tracking-[0.5em] font-medium mb-8 sm:mb-10 md:mb-12"
                            style={{ color: motifColor }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            Save the Date
                        </motion.p>
                        
                        <motion.h1 
                            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-tight text-neutral-900 mb-10 sm:mb-12 md:mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            {wedding.bride_name} <br />
                            <span 
                                className="font-light italic serif ml-0 sm:ml-2 md:ml-4"
                                style={{ color: motifColor }}
                            >
                                &
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
                        
                        <motion.p 
                            className="text-lg sm:text-xl md:text-2xl font-light tracking-widest uppercase text-neutral-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                        >
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </motion.p>
                        
                        <motion.p
                            className="text-base sm:text-lg font-light text-neutral-400 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4, duration: 0.8 }}
                        >
                            {wedding.venue_name}
                        </motion.p>
                    </motion.div>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-30" style={{ backgroundColor: motifColor }} />
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
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
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

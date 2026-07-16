'use client';

import { motion } from 'framer-motion';
import { 
    VideoSection, 
    BioSection, 
    DetailsSection, 
    CountdownTimer, 
    TimelineSection, 
    GallerySection, 
    GiftSection 
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function TraditionalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#C5A059';
    
    return (
        <div className="bg-neutral-50 text-neutral-700 font-serif relative pb-24">
            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative">
                <div className="absolute inset-8 sm:inset-12 md:inset-16 border border-neutral-200 pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1 }} 
                    className="z-10 bg-white p-8 sm:p-12 md:p-16 lg:p-24 shadow-sm border border-neutral-100"
                >
                    <motion.p 
                        className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8 sm:mb-10 md:mb-12"
                        style={{ color: motifColor }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        The Marriage of
                    </motion.p>
                    
                    <motion.h1 
                        className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-neutral-800 mb-8 sm:mb-10 md:mb-12 border-y border-neutral-200 py-12 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        {wedding.bride_name} <br />
                        <span 
                            className="text-2xl sm:text-2xl md:text-3xl italic font-light my-6 sm:my-8 md:my-10 block"
                            style={{ color: motifColor }}
                        >
                            &amp;
                        </span>
                        {wedding.groom_name}
                    </motion.h1>
                    
                    <motion.div 
                        className="space-y-4 sm:space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        <p className="text-xl sm:text-2xl tracking-[0.2em] font-light">
                            {new Date(wedding.wedding_date).toLocaleDateString()}
                        </p>
                        <p className="text-lg sm:text-xl italic text-neutral-400">
                            {wedding.venue_name}
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        className="mt-12 sm:mt-16"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        <a 
                            href="#rsvp" 
                            aria-label="Request RSVP"
                            className="inline-flex items-center justify-center px-10 py-4 border-2 font-bold uppercase tracking-widest text-xs min-h-[44px] hover:!bg-neutral-800 hover:!text-white transition-all"
                            style={{ borderColor: motifColor, color: motifColor }}
                        >
                            Request RSVP
                        </a>
                    </motion.div>
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
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
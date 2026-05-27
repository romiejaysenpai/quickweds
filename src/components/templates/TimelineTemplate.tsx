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

export default function TimelineTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#C5A059';
    
    return (
        <div className="bg-white font-serif pb-24">
            <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cream-paper.png')` }} />
                
                <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2" style={{ borderColor: motifColor + '40' }} />
                <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2" style={{ borderColor: motifColor + '40' }} />
                
                <div className="relative text-center z-10 px-4 sm:px-6 md:px-12 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                    >
                        <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8 sm:mb-10 md:mb-12" style={{ color: motifColor }}>
                            Our Love Story
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-neutral-900 mb-10 sm:mb-12 md:mb-16 leading-tight">
                            {wedding.bride_name} <br />
                            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl italic font-light" style={{ color: motifColor }}>&</span>{' '}
                            <br />
                            {wedding.groom_name}
                        </h1>
                        <div className="w-20 sm:w-24 md:w-32 h-[1px] mx-auto mb-10 sm:mb-12 md:mb-16" style={{ backgroundColor: motifColor }} />
                        <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-neutral-600">
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                        <p className="text-base sm:text-lg md:text-xl font-light text-neutral-400 mt-4">
                            {wedding.venue_name}
                        </p>
                    </motion.div>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-40" style={{ backgroundColor: motifColor }} />
                </div>
            </section>

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection id="bio" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
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
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
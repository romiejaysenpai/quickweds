'use client';

import { motion } from 'framer-motion';
import { SharedNewSections } from './shared';
import { 
    VideoSection, 
    BioSection, 
    DetailsSection,
    TimelineSection, 
    GallerySection, 
    GiftSection,
    CountdownTimer 
} from '../wedding';
import type { TemplateProps } from '@/types/wedding';

export default function RSVPFocusTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#C5A059';
    
    return (
        <div className="bg-white pb-24">
            <section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white" />
                {wedding.hero_image && (
                    <img 
                        src={wedding.hero_image} 
                        className="absolute inset-0 w-full h-full object-cover opacity-10" 
                        alt=""
                    />
                )}
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative text-center z-10 px-4 sm:px-6 md:px-12 max-w-4xl"
                >
                    <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8 sm:mb-10" style={{ color: motifColor }}>
                        You're Invited
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-neutral-900 mb-10 sm:mb-12 md:mb-16 leading-tight">
                        {wedding.bride_name} <br />
                        <span className="text-xl sm:text-2xl md:text-3xl italic font-light" style={{ color: motifColor }}>&</span>{' '}
                        <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-20 sm:w-24 h-[1px] mx-auto mb-10 sm:mb-12" style={{ backgroundColor: motifColor }} />
                    <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-neutral-600 mb-12 sm:mb-14">
                        {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                    <p className="text-base sm:text-lg font-light text-neutral-500 mb-16 sm:mb-20">
                        at {wedding.venue_name}
                    </p>
                    <div className="mt-8">
                        <a 
                            href="#rsvp" 
                            className="inline-flex items-center justify-center px-12 sm:px-16 py-5 sm:py-6 font-bold uppercase tracking-widest text-sm sm:text-base hover:scale-105 transition-all shadow-xl min-h-[56px]"
                            style={{ backgroundColor: motifColor, color: 'white' }}
                        >
                            RSVP Here
                        </a>
                    </div>
                    <p className="text-sm font-light text-neutral-400 mt-8 sm:mt-10">
                        Your presence is our greatest gift
                    </p>
                </motion.div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-30" style={{ backgroundColor: motifColor }} />
                </div>
            </section>

            <DetailsSection id="details" wedding={wedding} />
            <BioSection id="bio" wedding={wedding} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
            <GallerySection id="gallery" gallery={gallery} />
            <GiftSection id="gift" wedding={wedding} />
            {!wedding.is_thank_you_mode && !isExpired && (
                <CountdownTimer id="countdown"
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                />
            )}
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
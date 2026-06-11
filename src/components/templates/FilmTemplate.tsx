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

export default function FilmTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#1a1a1a] text-[#ddd] font-mono relative pb-24">
            <div className="fixed inset-0 opacity-[0.07] pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-film-texture)' }} />

            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center px-4 sm:px-6 relative">
                {/* Film Strip Borders */}
                <div className="absolute top-0 left-0 w-full h-8 sm:h-10 md:h-12 bg-black border-b border-white/20 flex gap-2 sm:gap-3 md:gap-4 overflow-hidden px-2 sm:px-3 md:px-4">
                    {Array(20).fill(0).map((_, i) => <div key={i} className="w-6 sm:w-7 md:w-8 h-5 sm:h-5 md:h-6 bg-white/10 rounded-sm mt-2 sm:mt-2 md:mt-3 flex-shrink-0" />)}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-8 sm:h-10 md:h-12 bg-black border-t border-white/20 flex gap-2 sm:gap-3 md:gap-4 overflow-hidden px-2 sm:px-3 md:px-4">
                    {Array(20).fill(0).map((_, i) => <div key={i} className="w-6 sm:w-7 md:w-8 h-5 sm:h-5 md:h-6 bg-white/10 rounded-sm mt-2 sm:mt-2 md:mt-3 flex-shrink-0" />)}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black p-3 sm:p-4 pb-12 sm:pb-14 md:pb-16 pt-3 sm:pt-4 max-w-lg w-full shadow-2xl rotate-1"
                >
                    <div className="aspect-[4/5] bg-[#222] mb-3 sm:mb-4 relative overflow-hidden group">
                        <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 contrast-125" />
                        <div className="absolute top-4 right-4 text-[10px] text-red-500 font-bold animate-pulse">● REC</div>
                    </div>
                    <div className="text-center font-serif text-black bg-white p-6 sm:p-7 md:p-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-tighter">{wedding.bride_name} + {wedding.groom_name}</h1>
                        <p className="text-xs sm:text-xs md:text-sm uppercase tracking-widest border-t border-black/10 pt-3 sm:pt-4 mt-3 sm:pt-4">{new Date(wedding.wedding_date).toDateString()}</p>
                    </div>
                </motion.div>

                <a href="#rsvp" className="mt-8 sm:mt-10 md:mt-12 px-6 sm:px-8 py-3 min-h-[44px] flex items-center justify-center bg-red-600 text-white rounded-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">Action! (RSVP)</a>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} invert />
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

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

export default function BohoTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f3e5ab] text-[#8b4513] font-serif relative pb-24 selection:bg-[#8b4513]/20">
            <div className="fixed inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />

            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="z-10 group">
                    <div className="w-56 sm:w-64 md:w-80 lg:w-96 h-56 sm:h-64 md:h-80 lg:h-96 rounded-t-full rounded-b-lg overflow-hidden border-8 border-white shadow-2xl mx-auto mb-12 sm:mb-16 md:mb-20">
                        <img src={wedding.hero_image || wedding.couple_photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" />
                    </div>
                    <span className="text-xs uppercase tracking-[1em] font-black opacity-40 mb-8 block">WILD & FREE LOVE</span>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl mb-8 leading-tight text-[#5d2e0a] drop-shadow-sm italic">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-light not-italic opacity-30">&</span> <br />
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center mt-12 sm:mt-16">
                        <a href="#rsvp" className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-4 min-h-[44px] flex items-center justify-center bg-[#8b4513] text-[#f3e5ab] rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#5d2e0a] transition-all transform hover:rotate-3 shadow-xl">Join The Adventure</a>
                    </div>
                </motion.div>
            </section>

            <section className="py-24 bg-white/30 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-12 sm:space-y-16">
                    <div className="w-24 h-[1px] bg-[#8b4513]/20 mx-auto" />
                    <h2 className="text-4xl sm:text-5xl font-serif italic text-[#5d2e0a]">Our Love Story</h2>
                    <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-[#8b4513]/80 italic">
                        {wedding.story || "A tale of two souls becoming one, captured in a beauty that never fades."}
                    </p>
                    <div className="w-24 h-[1px] bg-[#8b4513]/20 mx-auto" />
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            {!wedding.is_thank_you_mode && (
                <CountdownTimer
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                />
            )}
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

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

export default function ArtDecoTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#1a1a1a] text-[#d4af37] font-serif selection:bg-[#d4af37] selection:text-black pb-24">
            {/* Geometric Patterns */}
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/art-deco.png')` }} />

            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-4 sm:inset-6 md:inset-8 lg:inset-12 border-[4px] border-[#d4af37]/40 pointer-events-none" />
                <div className="absolute inset-8 sm:inset-10 md:inset-12 lg:inset-16 border-[1px] border-[#d4af37]/20 pointer-events-none" />

                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="z-10 text-center bg-black/80 backdrop-blur-md p-8 sm:p-12 md:p-16 lg:p-24 border border-[#d4af37]/30 max-w-5xl shadow-[0_0_100px_rgba(212,175,55,0.1)]">
                    <span className="text-xs uppercase tracking-[1em] font-black opacity-60 mb-8 sm:mb-10 md:mb-12 lg:mb-12 block">THE GREAT CELEBRATION</span>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl mb-8 leading-none tracking-widest uppercase">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic normal-case block my-8">&</span>
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="w-40 sm:w-48 md:w-56 h-[2px] bg-[#d4af37] mx-auto mb-8 sm:mb-10 md:mb-12" />
                    <p className="text-xl sm:text-2xl tracking-[0.5em] font-light uppercase">{new Date(wedding.wedding_date).getFullYear()}</p>
                    <div className="mt-12 sm:mt-16">
                        <a href="#rsvp" className="px-10 py-5 bg-[#d4af37] text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-xl">Join The Party</a>
                    </div>
                </motion.div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} invert />
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
            <GiftSection wedding={wedding} invert />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

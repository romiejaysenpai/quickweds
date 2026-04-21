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

export default function CinematicTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-black text-white font-sans selection:bg-primary/50 overflow-hidden pb-24">
            <section className="min-h-screen relative flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 3 }} className="absolute inset-0">
                    <img src={wedding.hero_image || wedding.couple_photo} className="w-full h-full object-cover grayscale brightness-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                </motion.div>

                <div className="z-10 text-center px-4 sm:px-6 max-w-6xl">
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-xs sm:text-sm uppercase tracking-[1em] font-black mb-8 sm:mb-10 md:mb-12 opacity-60">A QUICKWEDS ORIGINAL PRODUCTION</motion.p>
                    <motion.h1 initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 2 }} className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-serif leading-none tracking-tighter mb-8 sm:mb-10 md:mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic text-primary">&</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="flex gap-4 sm:gap-6 md:gap-8 justify-center items-center">
                        <div className="w-12 sm:w-16 md:w-24 h-[1px] bg-white/20" />
                        <p className="text-lg sm:text-xl md:text-2xl font-serif italic">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="w-12 sm:w-16 md:w-24 h-[1px] bg-white/20" />
                    </motion.div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <div className="px-4 sm:px-6 md:px-12 lg:px-32 py-12 sm:py-16 md:py-24 lg:py-32"><DetailsSection wedding={wedding} invert /></div>
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

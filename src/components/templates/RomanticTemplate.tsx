'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
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

export default function RomanticTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fffafa] text-[#b03060] font-serif relative pb-24 selection:bg-[#b03060]/20">
            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden opacity-10 pointer-events-none z-0">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 30, repeat: Infinity }} className="absolute -top-20 -left-20 w-[600px] h-[600px] border-[40px] border-primary rounded-full filter blur-[100px]" />
            </div>

            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
                    <div className="mb-8 sm:mb-10 md:mb-12">
                        <Heart className="w-12 h-12 text-primary fill-primary mx-auto animate-pulse" />
                    </div>
                    <span className="text-xs uppercase tracking-[1em] font-bold opacity-30 mb-8 block">WE FALLING IN LOVE</span>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl mb-8 leading-tight drop-shadow-xl">
                        {wedding.bride_name} <br />
                        <span className="font-light italic text-primary/60">&</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="flex flex-col gap-6 sm:gap-8 items-center mt-8 sm:mt-12 md:mt-16">
                        <p className="text-xl sm:text-2xl italic opacity-60">Cordially invite you to witness our forever</p>
                        <div className="w-24 h-[1px] bg-primary/20" />
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            href="#rsvp"
                            className="text-lg font-serif italic border-b-2 border-primary pb-2 hover:opacity-50 transition-opacity"
                        >
                            Say Yes, We&apos;ll Be There
                        </motion.a>
                    </div>
                </motion.div>
            </section>

            <section className="py-24 bg-white/40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-12 sm:space-y-16">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl italic drop-shadow-sm">The Story of Us</h2>
                    <div className="relative">
                        <div className="absolute -left-12 -top-12 text-9xl opacity-5 italic font-serif">“</div>
                        <p className="text-lg sm:text-xl md:text-2xl leading-relaxed italic text-[#4A4444] opacity-80 z-10 relative">
                            {wedding.story || "A tale of two souls becoming one, captured in the heart of beauty."}
                        </p>
                    </div>
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
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline} />
            <GallerySection id="gallery" gallery={gallery} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

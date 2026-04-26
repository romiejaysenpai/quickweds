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

const whimsicalParticles = [
    { id: 1, top: '10%', left: '10%', duration: 15, driftX: 50 },
    { id: 2, top: '20%', left: '80%', duration: 18, driftX: -30 },
    { id: 3, top: '60%', left: '15%', duration: 20, driftX: 40 },
    { id: 4, top: '80%', left: '70%', duration: 22, driftX: -50 },
    { id: 5, top: '40%', left: '50%', duration: 25, driftX: 20 },
];

function Sparkles({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}

export default function WhimsicalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fff9fc] text-[#e3a6c1] relative overflow-hidden pb-24 font-serif">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {whimsicalParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute"
                        style={{ top: particle.top, left: particle.left }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, particle.driftX, 0],
                            rotate: [0, 180, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: particle.duration, repeat: Infinity }}
                    >
                        <Sparkles className="w-6 h-6 opacity-20 text-primary" />
                    </motion.div>
                ))}
            </div>

            <section className="min-h-screen py-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                    <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-16 relative group">
                        <div className="w-40 sm:w-48 md:w-56 lg:w-64 h-40 sm:h-48 md:h-56 lg:h-64 rounded-full border-[12px] border-white shadow-2xl overflow-hidden mx-auto rotate-6 group-hover:rotate-0 transition-transform duration-700">
                            <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover scale-125" />
                        </div>
                        <div className="absolute -top-8 -right-8 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                            <Heart className="w-8 h-8 text-primary fill-primary" />
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl lg:text-[12vw] font-serif leading-none tracking-tighter text-[#4A4444] mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                        Magic is <br />
                        <span className="text-primary italic">Real</span>
                    </h1>
                    <p className="text-3xl font-serif italic text-primary/60 mb-12">{wedding.bride_name.split(' ')[0]} & {wedding.groom_name.split(' ')[0]}</p>
                    <motion.a
                        whileHover={{ scale: 1.1, rotate: -2 }}
                        href="#rsvp"
                        className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 min-h-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white font-black tracking-widest uppercase text-xs shadow-[0_10px_30px_rgba(227,166,193,0.4)]"
                    >
                        Count Me In!
                    </motion.a>
                </motion.div>
            </section>

            <section className="py-16 sm:py-24 md:py-32 lg:py-32 bg-white/40 backdrop-blur-md border-y border-primary/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-12">
                    <Sparkles className="w-12 h-12 text-primary mx-auto opacity-30" />
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif text-[#4A4444]">The Enchantment</h2>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif leading-relaxed text-primary italic">
                        {wedding.story || "A tale of two souls becoming one, captured in a beauty that never fades."}
                    </p>
                    <div className="flex gap-2 sm:gap-3 justify-center">
                        {[1, 2, 3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-primary/20" />)}
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

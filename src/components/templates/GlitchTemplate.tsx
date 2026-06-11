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

export default function GlitchTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-black text-green-400 font-mono min-h-screen relative pb-24 selection:bg-green-400 selection:text-black">
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
                <div className="max-w-6xl z-10">
                    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0 }} className="border-l-4 border-green-400 pl-4 sm:pl-6 md:pl-8 mb-8 sm:mb-10 md:mb-12">
                        <p className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 typing-effect w-fit">INITIALIZING UNION PROTOCOL...</p>
                        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 mb-3 sm:mb-4 leading-none tracking-tighter filter hue-rotate-90 animate-pulse">
                            {wedding.bride_name}<br />{wedding.groom_name}
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 opacity-80 text-xs">
                        <div className="border border-green-400/30 p-3 sm:p-4">
                            <p className="opacity-50 mb-1">DATE_TIME</p>
                            <p className="text-xs sm:text-sm">{wedding.wedding_date}</p>
                        </div>
                        <div className="border border-green-400/30 p-3 sm:p-4">
                            <p className="opacity-50 mb-1">LOCATION_DATA</p>
                            <p className="text-xs sm:text-sm">{wedding.venue_name}</p>
                        </div>
                    </div>

                    <a href="#rsvp" className="inline-block px-6 sm:px-8 py-3 min-h-[44px] flex items-center bg-green-400 text-black font-black uppercase hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all skew-x-[-12deg]">
                        <span className="inline-block skew-x-[12deg]">Confirm_Presence</span>
                    </a>
                </div>

                <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-30 mix-blend-screen pointer-events-none">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover filter contrast-150 grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-l from-black to-transparent" />
                </div>
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

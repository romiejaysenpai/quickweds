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

export default function MidnightTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#0f0f0f] text-[#cfb53b] relative overflow-hidden pb-24 font-serif">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.05)_0%,transparent_70%)] pointer-events-none" />

            <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
                <div className="flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 border-r border-[#cfb53b]/10 bg-gradient-to-b from-[#0f0f0f] to-[#151515]">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <span className="text-xs font-black tracking-[0.5em] uppercase text-[#cfb53b]/60 mb-8 block">The Celebration</span>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif text-white mb-8 leading-tight">
                            {wedding.bride_name} <br />
                            <span className="text-2xl sm:text-3xl md:text-4xl italic text-[#cfb53b] font-light">&</span><br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-serif italic text-white/60 mb-8 sm:mb-10 md:mb-12 lg:mb-12 max-w-md">
                            Join us for an evening of elegance, love, and starlight.
                        </p>
                        <a href="#rsvp" className="px-6 sm:px-8 md:px-10 lg:px-10 py-3 sm:py-4 md:py-4 lg:py-4 min-h-[44px] flex items-center border border-[#cfb53b] text-[#cfb53b] hover:bg-[#cfb53b] hover:text-black transition-all uppercase text-xs font-black tracking-[0.2em]">RSVP Now</a>
                    </motion.div>
                </div>
                <div className="relative h-[50vh] lg:h-auto">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0f0f0f]" />
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
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

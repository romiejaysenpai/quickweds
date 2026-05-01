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

export default function LuxuryTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#0a0a0a] text-[#C5A059] font-serif selection:bg-[#C5A059] selection:text-black pb-24">
            <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(#C5A059 1px, transparent 1px), linear-gradient(90deg, #C5A059 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />

            <section className="min-h-screen grid grid-cols-1 md:grid-cols-12 relative overflow-hidden">
                <div className="md:col-span-5 flex flex-col justify-center px-4 sm:px-6 md:px-16 py-12 sm:py-16 md:py-24 bg-black z-10 border-r border-[#C5A059]/10">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5 }}>
                        <div className="w-16 h-[2px] bg-[#C5A059] mb-12" />
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-white uppercase tracking-tighter mb-8 leading-none">
                            {wedding.bride_name} <br />
                            <span className="text-[#C5A059]">&</span> <br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-serif italic mb-12 sm:mb-16 md:mb-20 max-w-sm text-[#C5A059]/60">
                            A celebration of rare elegance and timeless devotion.
                        </p>
                        <a href="#rsvp" className="px-10 py-5 bg-[#C5A059] text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-[0_20px_50px_rgba(197,160,89,0.3)]">Request Presence</a>
                    </motion.div>
                </div>
                <div className="md:col-span-7 h-[50vh] md:h-full relative overflow-hidden group">
                    <img src={wedding.hero_image || wedding.couple_photo} className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:scale-110 transition-transform duration-[10s]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden md:block" />
                    <div className="absolute top-12 right-12 text-right">
                        <p className="text-white text-7xl font-light opacity-20">{new Date(wedding.wedding_date).getFullYear()}</p>
                    </div>
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
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

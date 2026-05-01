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

export default function EleganceTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#faf9f6] text-[#3d3d3d] font-serif relative pb-24">
            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cream-paper.png')` }} />
                
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} className="z-10 bg-white/40 backdrop-blur-sm p-8 sm:p-12 md:p-16 lg:p-20 shadow-2xl border border-white relative">
                    <div className="absolute -top-6 -left-6 w-12 sm:w-16 h-12 sm:h-16 border-t-2 border-l-2 border-primary/40" />
                    <div className="absolute -bottom-6 -right-6 w-12 sm:w-16 h-12 sm:h-16 border-b-2 border-r-2 border-primary/40" />

                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif text-[#1a1a1a] mb-8 leading-tight tracking-tight uppercase">
                        {wedding.bride_name} <br />
                        <span className="text-xl sm:text-2xl md:text-3xl lg:text-3xl italic font-light lowercase text-primary my-6 sm:my-8 block">&</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="w-16 h-[1px] bg-primary/30 mx-auto mb-8 sm:mb-10 md:mb-12" />
                    <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-serif italic mb-12 sm:mb-16 opacity-60">The honor of your presence is requested at our wedding celebration.</p>
                    
                    <a href="#rsvp" className="px-12 py-4 bg-[#1a1a1a] text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-primary transition-all shadow-lg min-h-[44px] flex items-center justify-center">Kindly Respond</a>
                </motion.div>
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

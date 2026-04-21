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

export default function TraditionalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fffcf9] text-[#2c3e50] font-serif relative pb-24">
            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative">
                <div className="absolute inset-8 sm:inset-12 md:inset-16 border-[1px] border-[#2c3e50]/10 pointer-events-none" />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="z-10 bg-white p-8 sm:p-12 md:p-16 lg:p-24 shadow-sm border border-[#2c3e50]/5">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold text-[#c0392b] mb-8 sm:mb-10 md:mb-12">The Marriage of</p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-stone-800 mb-8 sm:mb-10 md:mb-12 border-y border-[#2c3e50]/10 py-12 leading-tight">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic font-light opacity-30 my-6 sm:my-8 md:my-10 block">and</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="space-y-4 sm:space-y-6">
                        <p className="text-xl sm:text-2xl tracking-[0.2em] font-light">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
                        <p className="text-lg sm:text-xl italic opacity-50">{wedding.venue_name}</p>
                    </div>
                    <div className="mt-12 sm:mt-16">
                        <a href="#rsvp" className="px-10 py-4 border-2 border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white transition-all font-bold uppercase tracking-widest text-xs min-h-[44px] flex items-center justify-center">Request RSVP</a>
                    </div>
                </motion.div>
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

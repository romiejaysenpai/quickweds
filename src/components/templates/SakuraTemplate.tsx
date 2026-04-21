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

export default function SakuraTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fff0f5] text-[#8e405a] relative font-serif">
            <div className="fixed inset-0 pointer-events-none opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c-2-2-5-2-7 0-.5.5-.5 1.5 0 2 2 2 5 2 7 0 .5-.5.5-1.5 0-2zm5 5c-2-2-5-2-7 0-.5.5-.5 1.5 0 2 2 2 5 2 7 0 .5-.5.5-1.5 0-2z' fill='%23ffb7c5' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
                <div className="w-32 sm:w-40 md:w-56 lg:w-72 h-32 sm:h-40 md:h-56 lg:h-72 bg-gradient-to-br from-pink-200/40 to-transparent rounded-full absolute -top-24 -left-24 blur-3xl animate-pulse" />
                <div className="w-24 sm:w-32 md:w-48 lg:w-64 h-24 sm:h-32 md:h-48 lg:h-64 bg-gradient-to-tl from-pink-300/30 to-transparent rounded-full absolute bottom-0 right-0 blur-3xl" />

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-white/60 backdrop-blur-sm p-6 sm:p-8 md:p-16 lg:p-24 rounded-[3rem] border border-white max-w-4xl shadow-xl">
                    <div className="absolute top-6 left-6 text-2xl sm:text-3xl md:text-4xl lg:text-4xl opacity-50">🌸</div>

                    <p className="font-serif italic text-lg sm:text-xl md:text-2xl lg:text-2xl text-[#8e405a]/60 mb-4 sm:mb-5 md:mb-6 lg:mb-6">Blossoming Love</p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif text-[#8e405a] mb-8 leading-none">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl block my-4 font-sans font-light uppercase tracking-widest text-[#8e405a]/40">and</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="inline-block border-y border-[#8e405a]/20 py-3 sm:py-4 md:py-4 lg:py-4 px-6 sm:px-8 md:px-12 lg:px-12 mb-8 sm:mb-10 md:mb-12 lg:mb-12">
                        <p className="font-serif text-lg sm:text-lg md:text-xl lg:text-xl tracking-widest uppercase">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="w-40 sm:w-48 md:w-56 lg:w-64 h-40 sm:h-48 md:h-56 lg:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-12">
                        <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover" />
                    </div>

                    <a href="#rsvp" className="px-6 sm:px-8 md:px-10 lg:px-10 py-3 sm:py-4 md:py-4 lg:py-4 min-h-[44px] flex items-center justify-center bg-[#ffb7c5] text-white rounded-2xl font-bold hover:bg-[#ff9eb0] transition-colors shadow-lg shadow-pink-200">
                        Join Our Celebration
                    </a>
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

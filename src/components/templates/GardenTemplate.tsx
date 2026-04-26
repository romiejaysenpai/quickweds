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

export default function GardenTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f0f7f4] text-[#2d6a4f] font-serif relative pb-24">
            <div className="absolute top-0 left-0 w-40 sm:w-48 md:w-64 h-40 sm:h-48 md:h-64 bg-green-200/40 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-56 sm:w-72 md:w-96 h-56 sm:h-72 md:h-96 bg-green-300/30 rounded-full blur-3xl translate-x-32 translate-y-32" />

            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10">
                <div className="border-[1px] border-[#2d6a4f]/20 p-3 sm:p-4 rounded-t-full">
                    <div className="border-[1px] border-[#2d6a4f]/40 p-8 sm:p-12 pt-20 sm:pt-24 md:pt-32 rounded-t-full relative bg-white/60 backdrop-blur-sm shadow-xl">
                        <div className="absolute top-8 sm:top-10 md:top-12 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl animate-bounce">🌿</div>

                        <p className="uppercase tracking-[0.3em] text-xs font-bold text-[#52b788] mb-6 sm:mb-8">Join the Wedding of</p>
                        <h1 className="text-3xl sm:text-4xl md:text-7xl font-serif text-[#1b4332] mb-6 sm:mb-8">
                            {wedding.bride_name} <br /><span className="text-2xl sm:text-2xl md:text-3xl italic font-light text-[#40916c]">&</span><br /> {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-xl italic text-[#40916c] mb-8 sm:mb-10 md:mb-12">Under the open sky</p>

                        <div className="mx-auto w-40 sm:w-44 md:w-48 h-40 sm:h-44 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mb-8 sm:mb-10 md:mb-12">
                            <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover" />
                        </div>

                        <a href="#rsvp" className="px-8 sm:px-10 py-3 min-h-[44px] flex items-center justify-center rounded-full bg-[#2d6a4f] text-white font-bold hover:bg-[#1b4332] shadow-lg shadow-[#2d6a4f]/20 transition-all transform hover:-translate-y-1">
                            Save the Date
                        </a>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20 md:py-24 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 rounded-3xl bg-white p-6 sm:p-8 md:p-12 shadow-sm border border-green-100">
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1b4332]">Our Secret Garden</h2>
                        <p className="text-base sm:text-lg leading-relaxed text-[#40916c]">{wedding.story}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <img src={gallery[0]} className="rounded-xl object-cover w-full h-40 sm:h-48" />
                        <img src={gallery[1]} className="rounded-xl object-cover w-full h-40 sm:h-48 mt-4 sm:mt-8" />
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
            <GiftSection id="gift" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

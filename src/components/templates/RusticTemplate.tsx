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

export default function RusticTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f5ebe0] text-[#5e503f] font-serif relative pb-24">
            <div className="fixed inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
                <div className="absolute inset-4 border-[1px] border-[#5e503f]/20 pointer-events-none" />
                <div className="absolute inset-6 border-[1px] border-[#5e503f]/20 pointer-events-none" />

                <div className="text-center max-w-4xl z-10">
                    <div className="w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 mx-auto mb-6 sm:mb-7 md:mb-8 opacity-40">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </div>
                    <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-4 sm:mb-5 md:mb-6">We&apos;re getting married</p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl mb-6 sm:mb-7 md:mb-8 font-black text-[#8d7966] drop-shadow-sm">
                        {wedding.bride_name.split(' ')[0]} & {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 border-y border-[#5e503f]/20 py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-12 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
                        <span className="text-lg sm:text-xl md:text-2xl">{new Date(wedding.wedding_date).toLocaleDateString()}</span>
                        <span className="w-2 h-2 rounded-full bg-[#5e503f]/40 hidden sm:block" />
                        <span className="text-lg sm:text-xl md:text-2xl">{wedding.venue_name}</span>
                    </div>
                    <div className="mt-8 sm:mt-10 md:mt-12">
                        <a href="#rsvp" className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-4 min-h-[44px] flex items-center justify-center bg-[#5e503f] text-[#f5ebe0] rounded-lg font-bold tracking-widest uppercase hover:bg-[#493e31] transition-colors shadow-lg">RSVP</a>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20 md:py-24 lg:py-24 px-4 sm:px-6 bg-white/60">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
                    <div className="aspect-square relative rotate-2 p-4 bg-white shadow-xl">
                        <img src={wedding.couple_photo || wedding.hero_image || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover sepia-[0.3]" />
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#5e503f]/10 rounded-full blur-xl -z-10" />
                    </div>
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#8d7966]">Our Rustic Romance</h2>
                        <p className="text-base sm:text-lg leading-loose opacity-80">{wedding.story}</p>
                    </div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
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
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

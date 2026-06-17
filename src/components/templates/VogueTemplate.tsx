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

export default function VogueTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white text-black font-sans selection:bg-black selection:text-white pb-24">
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[60vh] md:h-full order-2 md:order-1">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover grayscale contrast-125" />
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                </div>
                <div className="flex flex-col justify-between px-4 sm:px-6 md:px-24 py-12 sm:py-16 md:py-24 order-1 md:order-2 bg-white">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1">The Edition</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Vol. 01</span>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-9xl font-serif leading-[0.85] -ml-0 sm:-ml-1 md:-ml-2 mb-6 sm:mb-7 md:mb-8 mix-blend-difference">
                            {wedding.bride_name.split(' ')[0]} <br />
                            <span className="font-sans font-light italic ml-0 sm:ml-6 md:ml-12 text-2xl sm:text-3xl md:text-6xl opacity-50">&</span> <br />
                            {wedding.groom_name.split(' ')[0]}
                        </h1>

                        <div className="flex gap-4 sm:gap-6 md:gap-8 items-end mt-8 sm:mt-10 md:mt-12">
                            <div className="flex-1 border-t border-black pt-3 sm:pt-4 md:pt-4">
                                <p className="text-xs font-bold uppercase tracking-widest mb-2">Ceremony</p>
                                <p className="text-lg sm:text-lg md:text-xl font-serif italic">{wedding.wedding_date}</p>
                            </div>
                            <a href="#rsvp" className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 min-h-[44px] bg-black text-white rounded-full flex items-center justify-center text-xs font-bold uppercase tracking-widest hover:scale-110 transition-transform flex-shrink-0">
                                RSVP
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 sm:py-24 md:py-32 lg:py-32 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-24 items-center">
                    <div className="flex-1 md:text-right space-y-6 sm:space-y-7 md:space-y-8">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic">A Modern Love Story</h2>
                        <p className="text-lg sm:text-lg md:text-xl leading-relaxed font-light max-w-md ml-auto">
                            {wedding.story || "Two souls, one stylish journey. Join us as we celebrate love in its most fashionable form."}
                        </p>
                    </div>
                    <div className="w-full md:w-1/3 aspect-[3/4] relative">
                        <div className="absolute inset-0 bg-neutral -translate-x-4 translate-y-4" />
                        <img src={wedding.couple_photo || wedding.hero_image || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="lazy" decoding="async" className="w-full h-full object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700" />
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
            <GallerySection id="gallery" gallery={gallery} masonry template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

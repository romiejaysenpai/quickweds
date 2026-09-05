'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import {
    VideoSection,
    BioSection,
    DetailsSection,
    CountdownTimer,
    TimelineSection,
    GallerySection,
    GiftSection,
    AttireSection,
    FAQSection
} from '../wedding';
import { SharedNewSections } from './shared';

export default function GardenTemplate({ wedding, gallery, isExpired }: any) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#f0f7f4] text-[#2d6a4f] font-serif relative pb-24 selection:bg-[#40916c] selection:text-white overflow-hidden">
            {/* Soft Botanical Ambient Glows */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/40 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl translate-x-32 translate-y-32 pointer-events-none" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="border border-[#2d6a4f]/20 p-3 sm:p-4 rounded-t-full max-w-2xl w-full"
                >
                    <div className="border border-[#2d6a4f]/40 p-8 sm:p-12 pt-20 rounded-t-full relative bg-white/70 backdrop-blur-md shadow-2xl space-y-6">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-8 left-1/2 -translate-x-1/2 text-[#40916c]"
                        >
                            <Leaf className="w-10 h-10 text-[#40916c]" />
                        </motion.div>

                        <p className="uppercase tracking-[0.35em] text-xs font-bold text-[#52b788] pt-4 font-sans">
                            The Wedding Celebration of
                        </p>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#1b4332] leading-tight">
                            {wedding.bride_name}
                            <span className="block text-2xl sm:text-3xl italic font-light text-[#40916c] my-2">&amp;</span>
                            {wedding.groom_name}
                        </h1>

                        <p className="text-sm font-sans uppercase tracking-[0.3em] text-[#40916c]">
                            {formattedDate} • {wedding.venue_name}
                        </p>

                        <div className="mx-auto w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                            <Image
                                src={wedding.couple_photo || wedding.hero_image || '/logo.png'}
                                alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                priority
                                fill
                                sizes="200px"
                                className="object-cover"
                            />
                        </div>

                        <div className="pt-4">
                            <a
                                href="#rsvp"
                                aria-label="Save the Date - RSVP"
                                className="px-10 py-3.5 inline-flex items-center justify-center rounded-full bg-[#2d6a4f] text-white font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#1b4332] shadow-lg shadow-[#2d6a4f]/25 transition-all transform hover:-translate-y-1"
                            >
                                Save the Date
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} />
            
            {!wedding.is_thank_you_mode && (
                <CountdownTimer
                    id="countdown"
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time} eventTimezone={wedding.event_timezone}
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
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

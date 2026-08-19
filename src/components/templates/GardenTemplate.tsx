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
import type { TemplateProps } from '@/types/wedding';

export default function GardenTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#2d6a4f';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#f2f8f5] text-[#1b4332] font-serif relative pb-24 selection:bg-[#40916c] selection:text-white overflow-hidden">
            {/* Soft Botanical Ambient Glows */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-green-200/50 rounded-full blur-3xl -translate-x-16 -translate-y-16 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-200/40 rounded-full blur-3xl translate-x-32 translate-y-32 pointer-events-none" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="border border-[#2d6a4f]/25 p-3 sm:p-5 rounded-t-[5rem] rounded-b-3xl max-w-3xl w-full bg-white/40 backdrop-blur-md shadow-[0_25px_80px_rgba(45,106,79,0.12)]"
                >
                    <div className="border border-[#2d6a4f]/30 p-8 sm:p-14 pt-16 rounded-t-[4.5rem] rounded-b-2xl relative bg-white/80 backdrop-blur-xl space-y-6">
                        <motion.div
                            animate={{ rotate: [0, 8, -8, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100/80 text-[#2d6a4f] shadow-sm"
                        >
                            <Leaf className="w-6 h-6" />
                        </motion.div>

                        <p className="uppercase tracking-[0.4em] text-xs font-bold text-[#40916c] font-sans">
                            A Secret Garden Union
                        </p>

                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#1b4332] leading-tight">
                            {wedding.bride_name}
                            <span className="block text-2xl sm:text-3xl italic font-light text-[#40916c] my-2">&amp;</span>
                            {wedding.groom_name}
                        </h1>

                        <p className="text-xs sm:text-sm font-sans uppercase tracking-[0.3em] text-[#2d6a4f] font-semibold">
                            {formattedDate} • {wedding.venue_name}
                        </p>

                        {(wedding.couple_photo || wedding.hero_image) && (
                            <div className="mx-auto w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white shadow-xl relative p-1 bg-emerald-100">
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    <Image
                                        src={wedding.couple_photo || wedding.hero_image || '/logo.png'}
                                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                        priority
                                        fill
                                        sizes="220px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        <p className="text-sm sm:text-base italic leading-relaxed text-[#2d6a4f]/85 max-w-md mx-auto">
                            {wedding.story || 'Among blooming gardens and ancient trees, we gather to exchange our vows and celebrate everlasting love.'}
                        </p>

                        <div className="pt-4 flex flex-wrap gap-4 justify-center">
                            <a
                                href="#rsvp"
                                aria-label="Save the Date - RSVP"
                                className="px-10 py-4 inline-flex items-center justify-center rounded-full bg-[#2d6a4f] text-white font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#1b4332] shadow-lg shadow-[#2d6a4f]/25 transition-all transform hover:-translate-y-0.5 min-h-[46px]"
                            >
                                Request RSVP
                            </a>
                            <a
                                href="#details"
                                className="px-8 py-4 inline-flex items-center justify-center rounded-full border border-[#2d6a4f]/40 text-[#1b4332] font-sans font-medium text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all min-h-[46px]"
                            >
                                Event Schedule
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
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                />
            )}

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

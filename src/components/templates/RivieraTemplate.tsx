'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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

export default function RivieraTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#fffdfa] text-cyan-950 font-serif relative pb-24 selection:bg-sky-500 selection:text-white">
            {/* Coastal Sun-Soaked Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:40px_40px]" />

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center px-6 py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/40 via-amber-100/30 to-transparent pointer-events-none" />

                <div className="max-w-6xl mx-auto text-center z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-sky-200 bg-white/90 text-sky-800 text-xs font-sans uppercase tracking-[0.4em] shadow-sm backdrop-blur-md"
                    >
                        <span>Amalfi Coast</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>Riviera Soirée</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-4xl sm:text-7xl md:text-8xl font-normal italic tracking-tight text-sky-950 leading-tight"
                    >
                        {wedding.bride_name} <span className="font-sans font-extralight text-amber-500 not-italic">&amp;</span> {wedding.groom_name}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="font-sans text-sm sm:text-base text-sky-800/80 max-w-xl mx-auto tracking-wide uppercase font-light"
                    >
                        {formattedDate} • {wedding.venue_name}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="relative max-w-4xl mx-auto aspect-[16/10] rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-[0_30px_90px_rgba(14,165,233,0.15)]"
                    >
                        <Image
                            src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 900px"
                            className="object-cover contrast-[1.02] saturate-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-sky-950/70 via-transparent to-transparent flex items-end justify-between p-8 text-white">
                            <p className="font-serif italic text-lg sm:text-xl text-amber-100 max-w-md text-left">
                                &quot;Where the azure sea meets timeless romance under the Mediterranean sun.&quot;
                            </p>
                            <a
                                href="#rsvp"
                                aria-label="RSVP"
                                className="px-8 py-3.5 bg-amber-400 text-sky-950 font-sans font-bold text-xs uppercase tracking-[0.25em] rounded-full hover:bg-amber-300 transition-all shadow-lg"
                            >
                                RSVP
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Sections */}
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

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

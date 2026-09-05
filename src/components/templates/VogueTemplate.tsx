'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
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

export default function VogueTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-white text-black font-sans selection:bg-black selection:text-white pb-24 relative overflow-hidden">
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-12 border-b border-black">
                {/* Left Fashion Photography Feature */}
                <div className="relative min-h-[60vh] md:min-h-full md:col-span-6 order-2 md:order-1 border-r border-black">
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover grayscale contrast-125 hover:contrast-100 transition-all duration-700 z-0"
                    />
                    <div className="absolute top-6 left-6 bg-black text-white px-3 py-1 text-[10px] font-mono uppercase tracking-[0.3em] z-10">
                        COVER STORY
                    </div>
                </div>

                {/* Right Editorial Masthead */}
                <div className="md:col-span-6 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 order-1 md:order-2 bg-white space-y-8">
                    <div className="flex justify-between items-center border-b border-black pb-4">
                        <span className="text-xs font-black uppercase tracking-[0.4em]">THE WEDDING ISSUE</span>
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">SPECIAL EDITION</span>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif leading-[0.85] tracking-tight uppercase mb-6">
                            {wedding.bride_name} <br />
                            <span className="font-sans font-light italic text-3xl sm:text-5xl text-neutral-400">&amp;</span> <br />
                            {wedding.groom_name}
                        </h1>

                        <div className="space-y-3 font-serif border-y border-black py-6 my-8">
                            <p className="text-xl sm:text-2xl font-bold tracking-tight">{formattedDate}</p>
                            <p className="text-sm font-sans uppercase tracking-[0.25em] text-neutral-600">
                                {wedding.venue_name} {wedding.venue_address ? `• ${wedding.venue_address}` : ''}
                            </p>
                        </div>

                        <p className="text-sm sm:text-base leading-relaxed text-neutral-600 font-light max-w-md mb-8">
                            {wedding.story || 'A high-fashion union of modern elegance, curated cuisine, and timeless couture romance.'}
                        </p>

                        <div className="flex gap-4 items-center">
                            <a
                                href="#rsvp"
                                aria-label="RSVP"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-black text-white font-bold uppercase tracking-[0.25em] text-xs hover:bg-neutral-800 transition-all min-h-[48px]"
                            >
                                <span>RSVP ATTENDANCE</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </a>
                            <a
                                href="#details"
                                className="inline-flex items-center justify-center px-8 py-4 border border-black text-black font-medium uppercase tracking-[0.2em] text-xs hover:bg-neutral-50 transition-all min-h-[48px]"
                            >
                                The Details
                            </a>
                        </div>
                    </motion.div>

                    <div className="pt-8 border-t border-black/15 flex justify-between items-center text-[10px] font-mono text-neutral-400">
                        <span>EST. 2026 // ALL RIGHTS RESERVED</span>
                        <span>BARCODE: |||||||||||||||||</span>
                    </div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} />
            {!wedding.is_thank_you_mode && (
                <CountdownTimer id="countdown"
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
            <GallerySection id="gallery" gallery={gallery} masonry template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Palmtree, Plane, Sun } from 'lucide-react';
import {
    VideoSection,
    BioSection,
    DetailsSection,
    CountdownTimer,
    TimelineSection,
    GallerySection,
    GiftSection,
    AttireSection,
    FAQSection,
    TemplateMonogram,
    TemplateSectionDivider
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function TropicalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#0B8F7B';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#e6f4f1] text-[#004d40] relative pb-24 font-serif selection:bg-[#0B8F7B]/20 overflow-hidden">
            {/* Sun Glow and Atmospheric Mist */}
            <div className="fixed top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-amber-200/40 rounded-full blur-[100px] pointer-events-none -z-0" />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-[120px] pointer-events-none -z-0" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl w-full bg-white/85 backdrop-blur-xl border border-teal-200/60 shadow-[0_25px_80px_rgba(11,143,123,0.12)] rounded-[3rem] p-8 sm:p-14 md:p-18 text-center relative overflow-hidden"
                >
                    {/* Destination Header Pill */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-sans uppercase tracking-[0.35em] font-bold mb-8">
                        <Palmtree className="w-4 h-4 text-teal-600" />
                        <span>Destination Celebration</span>
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                    </div>

                    <TemplateMonogram
                        wedding={wedding}
                        defaultShape="circle"
                        size="md"
                        color={motifColor}
                        motifColor={motifColor}
                        className="mb-6 mx-auto"
                    />

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-[#00362c] leading-tight tracking-tight mb-6">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-4xl italic font-light serif text-teal-600 my-2 block">&amp;</span>
                        {wedding.groom_name}
                    </h1>

                    <div className="w-20 h-0.5 mx-auto my-6 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400" />

                    <div className="inline-flex items-center gap-3 border border-teal-200/80 bg-teal-50/50 py-3 px-8 rounded-full font-serif text-sm sm:text-lg text-teal-900 mb-8">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{wedding.venue_name}</span>
                    </div>

                    {wedding.quote && (
                        <blockquote className="my-6 max-w-md mx-auto font-serif italic text-teal-900/90 text-base md:text-lg border-y border-teal-200/60 py-3">
                            &ldquo;{wedding.quote}&rdquo;
                        </blockquote>
                    )}

                    {/* Couple Photo Showcase */}
                    {(wedding.hero_image || wedding.couple_photo) && (
                        <div className="mx-auto my-8 max-w-sm aspect-[4/5] rounded-[2.5rem] overflow-hidden border-[10px] border-white shadow-2xl relative p-1 bg-teal-100/50">
                            <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="400px"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-sm sm:text-base italic leading-relaxed text-teal-900/80 max-w-lg mx-auto mb-10">
                        {wedding.story || 'Pack your bags and meet us where the palm trees sway. We cannot wait to celebrate our union with you in paradise.'}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <motion.a
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            href="#rsvp"
                            aria-label="Pack Your Bags - RSVP"
                            className="px-10 py-4 inline-flex items-center gap-2 bg-gradient-to-r from-[#0B8F7B] to-[#00695c] text-white rounded-full font-sans font-bold tracking-widest uppercase text-xs shadow-xl shadow-teal-500/25 transition-all min-h-[48px]"
                        >
                            <Plane className="w-4 h-4" />
                            <span>Pack Your Bags (RSVP)</span>
                        </motion.a>
                        <a
                            href="#details"
                            className="px-8 py-4 inline-flex items-center justify-center border border-teal-400/60 text-teal-900 rounded-full font-sans font-medium tracking-widest uppercase text-xs hover:bg-teal-50 transition-all min-h-[48px]"
                        >
                            Travel &amp; Venue
                        </a>
                    </div>
                </motion.div>
            </section>

            <TemplateSectionDivider template="tropical" motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="tropical" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="tropical" motifColor={motifColor} />
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
            <TemplateSectionDivider template="tropical" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="tropical" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="tropical" motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

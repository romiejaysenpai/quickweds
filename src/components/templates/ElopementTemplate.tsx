'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Compass, Feather } from 'lucide-react';
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

export default function ElopementTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#6B7A62';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#f7f5ef] text-[#2c3228] font-serif relative pb-24 selection:bg-[#6B7A62]/20">
            {/* Subtle Natural Paper Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
                {/* Full Bleed Landscape Photography */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="100vw"
                        className="object-cover brightness-75 contrast-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#f7f5ef] via-black/40 to-black/60" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 text-white py-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 border border-white/25 backdrop-blur-md text-xs font-sans uppercase tracking-[0.4em]"
                    >
                        <Compass className="w-3.5 h-3.5" style={{ color: '#a8bfa0' }} />
                        <span>An Intimate Elopement</span>
                    </motion.div>

                    <TemplateMonogram
                        wedding={wedding}
                        defaultShape="minimal"
                        size="md"
                        color="#ffffff"
                        motifColor={motifColor}
                        inverted
                        className="my-2"
                    />

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.2 }}
                        className="text-4xl sm:text-6xl md:text-8xl font-serif text-white leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                    >
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-4xl italic font-light serif text-[#a8bfa0] my-2 block">&amp;</span>
                        {wedding.groom_name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-3 items-center justify-center text-sm font-sans tracking-widest uppercase text-white/90"
                    >
                        <span>{formattedDate}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{wedding.venue_name}</span>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-base sm:text-xl font-serif italic text-white/80 max-w-xl mx-auto drop-shadow"
                    >
                        {wedding.quote ? (
                            <>&ldquo;{wedding.quote}&rdquo;</>
                        ) : (
                            <>&ldquo;A quiet union, an everlasting devotion. We chose forever, beneath open skies.&rdquo;</>
                        )}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.6 }}
                        className="pt-4"
                    >
                        <a
                            href="#rsvp"
                            aria-label="Send Wishes & RSVP"
                            className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-stone-900 font-sans font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#a8bfa0] hover:text-white transition-all shadow-xl min-h-[46px]"
                        >
                            Send Wishes &amp; RSVP
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Intimate Story & Vows Spotlight */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/85 backdrop-blur-xl border border-stone-200 shadow-[0_20px_60px_rgba(44,50,40,0.06)] rounded-3xl p-8 sm:p-12 text-center relative"
                >
                    <Feather className="w-8 h-8 mx-auto mb-4" style={{ color: motifColor }} />
                    <p className="text-xs uppercase tracking-[0.35em] font-sans font-bold text-[#6B7A62] mb-3">The Quiet Escape</p>
                    <h2 className="text-2xl sm:text-3xl font-serif italic text-stone-900 mb-6">Our Vows to One Another</h2>
                    <p className="text-base sm:text-lg leading-relaxed italic text-stone-700 max-w-2xl mx-auto">
                        {wedding.story || 'Surrounded only by nature, we exchanged our promises with peaceful hearts, starting a life of shared wanderlust and enduring love.'}
                    </p>
                </motion.div>
            </section>

            <TemplateSectionDivider template="minimal" motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="minimal" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="minimal" motifColor={motifColor} />
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
            <TemplateSectionDivider template="minimal" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="minimal" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="minimal" motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Moon } from 'lucide-react';
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

export default function MidnightTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#D4AF37';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#0b0c10] text-[#e5c558] relative overflow-hidden pb-24 font-serif selection:bg-[#D4AF37] selection:text-black">
            {/* Midnight Gold Glow and Starfield */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] pointer-events-none z-0" />
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: `radial-gradient(#d4af37 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            <section className="min-h-screen grid grid-cols-1 lg:grid-cols-12 relative z-10">
                {/* Left Typography & Invitation Panel */}
                <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-16 sm:py-24 border-r border-[#D4AF37]/20 bg-gradient-to-b from-[#0b0c10] via-[#10121a] to-[#0b0c10] space-y-8">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }}>
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-xs font-mono uppercase tracking-[0.4em] text-[#D4AF37] mb-8">
                            <Moon className="w-3.5 h-3.5" />
                            <span>Midnight Soirée</span>
                        </div>

                        <TemplateMonogram
                            wedding={wedding}
                            defaultShape="diamond"
                            size="md"
                            color="#D4AF37"
                            motifColor={motifColor}
                            inverted
                            className="mb-8"
                        />

                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight tracking-tight">
                            {wedding.bride_name} <br />
                            <span className="text-3xl sm:text-5xl italic font-light serif text-[#D4AF37] my-2 block">&amp;</span>
                            {wedding.groom_name}
                        </h1>

                        <div className="w-16 h-px bg-[#D4AF37]/50 my-6" />

                        <div className="space-y-2 mb-8">
                            <p className="text-lg sm:text-xl text-[#D4AF37] font-medium tracking-wide">
                                {formattedDate}
                            </p>
                            <p className="text-sm sm:text-base text-neutral-400 font-sans tracking-widest uppercase">
                                {wedding.venue_name} {wedding.venue_address ? `• ${wedding.venue_address}` : ''}
                            </p>
                        </div>

                        {wedding.quote && (
                            <blockquote className="my-8 border-l-2 border-[#D4AF37] pl-4 font-serif italic text-amber-100/80 text-base max-w-lg leading-relaxed">
                                &ldquo;{wedding.quote}&rdquo;
                            </blockquote>
                        )}

                        <p className="text-base sm:text-lg font-serif italic text-white/70 mb-10 max-w-lg leading-relaxed">
                            {wedding.story || 'Join us for an unforgettable evening under starlight and gold, celebrating love that shines endlessly.'}
                        </p>

                        <div className="flex flex-wrap gap-4 items-center">
                            <motion.a 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                href="#rsvp" 
                                aria-label="RSVP Now" 
                                className="px-10 py-4 inline-flex items-center justify-center bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-sans font-black uppercase tracking-[0.25em] text-xs hover:brightness-110 transition-all shadow-[0_0_30px_rgba(212,175,55,0.35)] min-h-[48px] rounded-sm"
                            >
                                RSVP Now
                            </motion.a>
                            <a 
                                href="#details" 
                                className="px-8 py-4 inline-flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] font-sans font-medium uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37]/10 transition-all min-h-[48px] rounded-sm"
                            >
                                Evening Itinerary
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Right Portrait Showcase */}
                <div className="lg:col-span-5 relative min-h-[50vh] lg:min-h-full">
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover grayscale brightness-90 contrast-125 hover:grayscale-0 transition-all duration-1000 z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0b0c10]" />
                </div>
            </section>

            <TemplateSectionDivider template="midnight" motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="midnight" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="midnight" motifColor={motifColor} />
            <DetailsSection id="details" wedding={wedding} invert />
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
            <TemplateSectionDivider template="midnight" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="midnight" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="midnight" motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

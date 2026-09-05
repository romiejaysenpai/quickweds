'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Crown } from 'lucide-react';
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

export default function RoyalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#D4AF37';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#0f0e0c] text-[#f2d0a4] relative overflow-hidden min-h-screen font-serif selection:bg-[#D4AF37] selection:text-black pb-24">
            {/* Regal Damask Pattern Overlay */}
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-deco-texture)' }} />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none -z-0" />

            <section className="min-h-screen py-24 relative overflow-hidden flex flex-col items-center justify-center border-b border-[#D4AF37]/20 z-10 px-4 sm:px-6">
                {wedding.teaser_video ? (
                    <video src={wedding.teaser_video} className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale contrast-125" autoPlay muted loop />
                ) : (
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="100vw"
                        className="object-cover opacity-20 grayscale brightness-50 z-0"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0c] via-transparent to-[#0f0e0c]" />

                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 text-center max-w-5xl w-full p-8 sm:p-14 md:p-20 border-2 border-[#D4AF37]/40 bg-black/60 backdrop-blur-xl relative rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.9)]"
                >
                    {/* Top Royal Crest Monogram Badge */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#0f0e0c] rounded-full border-2 border-[#D4AF37]/60 flex items-center justify-center overflow-hidden shadow-2xl">
                        {wedding.logo_initials ? (
                            <TemplateMonogram
                                wedding={wedding}
                                defaultShape="crest"
                                size="sm"
                                color="#D4AF37"
                                motifColor={motifColor}
                                inverted
                            />
                        ) : (
                            <Crown className="w-10 h-10 text-[#D4AF37]" />
                        )}
                    </div>

                    <span className="text-xs uppercase tracking-[0.6em] font-sans font-bold text-[#D4AF37] mb-6 block pt-4">
                        BY ROYAL PROCLAMATION
                    </span>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif border-y border-[#D4AF37]/30 py-8 sm:py-12 my-6 leading-none tracking-tight uppercase text-white drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-4xl italic lowercase font-light text-[#D4AF37] block my-3 tracking-normal">and</span>
                        {wedding.groom_name}
                    </h1>

                    {wedding.quote && (
                        <blockquote className="my-6 border-y border-[#D4AF37]/30 py-3 font-serif italic text-base sm:text-lg text-amber-200/90 max-w-xl mx-auto">
                            &ldquo;{wedding.quote}&rdquo;
                        </blockquote>
                    )}

                    <p className="text-base sm:text-xl font-serif italic mb-8 max-w-2xl mx-auto text-[#f2d0a4]/90">
                        {wedding.story || 'Cordially invite you to witness the union of two royal houses under starlight and eternal vows.'}
                    </p>

                    <div className="flex gap-4 items-center justify-center mb-8 text-xs font-mono tracking-[0.3em] uppercase text-[#D4AF37]">
                        <div className="w-16 h-px bg-[#D4AF37]/50" />
                        <p>{formattedDate} • {wedding.venue_name}</p>
                        <div className="w-16 h-px bg-[#D4AF37]/50" />
                    </div>

                    <div className="pt-4 flex flex-wrap gap-4 justify-center">
                        <a
                            href="#rsvp"
                            aria-label="Attend Royal Celebration - RSVP"
                            className="inline-flex min-h-[48px] items-center justify-center px-12 py-4 bg-[#D4AF37] text-black font-sans font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#fff] transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                        >
                            Attend Royal Celebration
                        </a>
                        <a
                            href="#details"
                            className="inline-flex min-h-[48px] items-center justify-center px-8 py-4 border border-[#D4AF37]/60 text-[#D4AF37] font-sans font-medium uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37]/10 transition-all"
                        >
                            Court Protocol &amp; Details
                        </a>
                    </div>
                </motion.div>
            </section>

            <TemplateSectionDivider template="royal" motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="royal" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="royal" motifColor={motifColor} />
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

            <TemplateSectionDivider template="royal" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="royal" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="royal" motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

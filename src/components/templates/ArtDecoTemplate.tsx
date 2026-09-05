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
    FAQSection,
    TemplateMonogram,
    TemplateSectionDivider,
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function ArtDecoTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const heroPhoto = wedding.hero_image || wedding.couple_photo;

    return (
        <div className="bg-[#141414] text-[#d4af37] font-serif selection:bg-[#d4af37] selection:text-black pb-24 relative overflow-hidden">
            {/* Geometric Patterns & Noise */}
            <div className="fixed inset-0 opacity-15 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-transparent to-black" />
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-deco-texture)' }} />

            <section className="min-h-screen py-16 sm:py-24 flex items-center justify-center px-4 sm:px-6 relative">
                {/* 1920s Art Deco Double Border Frame */}
                <div className="absolute inset-4 sm:inset-8 border-[3px] border-[#d4af37]/50 pointer-events-none" />
                <div className="absolute inset-7 sm:inset-11 border border-[#d4af37]/25 pointer-events-none" />

                {/* Decorative Art Deco Corner Accents */}
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-8 h-8 border-t-4 border-l-4 border-[#d4af37]" />
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 border-t-4 border-r-4 border-[#d4af37]" />
                <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-8 h-8 border-b-4 border-l-4 border-[#d4af37]" />
                <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-8 h-8 border-b-4 border-r-4 border-[#d4af37]" />

                {heroPhoto ? (
                    <div className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center my-6">
                        {/* Invitation Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-7 text-center lg:text-left bg-black/85 backdrop-blur-xl p-6 sm:p-10 md:p-14 border border-[#d4af37]/40 shadow-[0_0_90px_rgba(212,175,55,0.18)] relative"
                        >
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]" />

                            <div className="mb-3 flex justify-center lg:justify-start">
                                <TemplateMonogram wedding={wedding} defaultShape="diamond" size="sm" inverted />
                            </div>

                            <span className="text-xs uppercase tracking-[0.8em] font-sans font-bold opacity-70 mb-4 block text-amber-200">
                                THE GREAT CELEBRATION
                            </span>

                            <h1 className="text-3xl sm:text-5xl md:text-7xl mb-4 leading-none tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#fceabb] to-[#f8b500]">
                                {wedding.bride_name.split(' ')[0]}
                                <span className="text-xl sm:text-2xl italic normal-case block my-2 text-[#d4af37] font-serif">&amp;</span>
                                {wedding.groom_name.split(' ')[0]}
                            </h1>

                            <div className="flex items-center justify-center lg:justify-start gap-4 my-6">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
                                <span className="text-xs font-sans tracking-[0.3em] uppercase text-amber-300">{formattedDate} • {wedding.venue_name}</span>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
                            </div>

                            {wedding.quote && (
                                <div className="border border-[#d4af37]/40 bg-[#d4af37]/10 p-3 my-4 text-xs italic tracking-wider text-amber-200 rounded-sm">
                                    &ldquo;{wedding.quote}&rdquo;
                                </div>
                            )}

                            <p className="text-xs sm:text-sm tracking-[0.2em] font-light max-w-md mx-auto lg:mx-0 opacity-80 mb-8 leading-relaxed">
                                {wedding.story || 'An evening of jazz, timeless elegance, and monumental romance.'}
                            </p>

                            <a
                                href="#rsvp"
                                aria-label="RSVP"
                                className="px-8 py-3.5 bg-gradient-to-r from-[#d4af37] to-[#fceabb] text-black font-sans font-bold uppercase tracking-[0.3em] text-xs hover:brightness-110 transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] inline-flex items-center justify-center"
                            >
                                Request Presence
                            </a>
                        </motion.div>

                        {/* Art Deco Framed Hero Photo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-5 flex justify-center"
                        >
                            <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] p-3 bg-black/80 border-2 border-[#d4af37]/60 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
                                <div className="absolute -inset-2 border border-[#d4af37]/30 pointer-events-none" />
                                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#d4af37] rotate-45" />
                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#d4af37] rotate-45" />
                                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#d4af37] rotate-45" />
                                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#d4af37] rotate-45" />

                                <div className="relative h-full w-full overflow-hidden border border-[#d4af37]/40">
                                    <Image
                                        src={heroPhoto}
                                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 85vw, 380px"
                                        className="object-cover object-[center_20%] sepia-[0.15] contrast-[1.05] brightness-95 transition-transform duration-700 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                                    <div className="absolute bottom-3 inset-x-3 text-center py-1.5 bg-black/75 backdrop-blur-sm border border-[#d4af37]/30">
                                        <span className="text-[10px] font-sans uppercase tracking-[0.35em] text-[#d4af37]">EST. {new Date(wedding.wedding_date).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="z-10 text-center bg-black/85 backdrop-blur-xl p-8 sm:p-14 md:p-20 border border-[#d4af37]/40 max-w-4xl shadow-[0_0_90px_rgba(212,175,55,0.18)]"
                    >
                        <span className="text-xs uppercase tracking-[0.8em] font-sans font-bold opacity-70 mb-6 block text-amber-200">
                            THE GREAT CELEBRATION
                        </span>

                        <h1 className="text-4xl sm:text-6xl md:text-8xl mb-6 leading-none tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#fceabb] to-[#f8b500]">
                            {wedding.bride_name.split(' ')[0]}
                            <span className="text-2xl sm:text-3xl italic normal-case block my-4 text-[#d4af37] font-serif">&amp;</span>
                            {wedding.groom_name.split(' ')[0]}
                        </h1>

                        <div className="flex items-center justify-center gap-4 my-8">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />
                            <span className="text-xs font-sans tracking-[0.4em] uppercase text-amber-300">{formattedDate} • {wedding.venue_name}</span>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
                        </div>

                        <p className="text-sm sm:text-base tracking-[0.2em] font-light max-w-md mx-auto opacity-80 mb-10 leading-relaxed">
                            {wedding.story || 'An evening of jazz, timeless elegance, and monumental romance.'}
                        </p>

                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="px-10 py-4 bg-gradient-to-r from-[#d4af37] to-[#fceabb] text-black font-sans font-bold uppercase tracking-[0.3em] text-xs hover:brightness-110 transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] inline-flex items-center justify-center"
                        >
                            Request Presence
                        </a>
                    </motion.div>
                )}
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="artdeco" motifColor={wedding.motif_color} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="artdeco" motifColor={wedding.motif_color} />
            <DetailsSection id="details" wedding={wedding} invert />
            
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

            <TemplateSectionDivider template="artdeco" motifColor={wedding.motif_color} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="artdeco" motifColor={wedding.motif_color} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

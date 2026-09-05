'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Sparkles as SparklesIcon } from 'lucide-react';
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

const whimsicalParticles = [
    { id: 1, top: '12%', left: '8%', duration: 16, driftX: 40 },
    { id: 2, top: '22%', left: '82%', duration: 18, driftX: -30 },
    { id: 3, top: '55%', left: '12%', duration: 20, driftX: 35 },
    { id: 4, top: '75%', left: '75%', duration: 22, driftX: -40 },
    { id: 5, top: '35%', left: '48%', duration: 24, driftX: 25 },
];

export default function WhimsicalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#8D7BC4';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#fff9fd] text-[#4a2e5a] relative overflow-hidden pb-24 font-serif selection:bg-[#8D7BC4]/20">
            {/* Animated Stardust Particles extending to all sections */}
            <div className="fixed inset-0 pointer-events-none z-10">
                {whimsicalParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute"
                        style={{ top: particle.top, left: particle.left }}
                        animate={{
                            y: [0, -80, 0],
                            x: [0, particle.driftX, 0],
                            rotate: [0, 180, 360],
                            scale: [1, 1.25, 1],
                        }}
                        transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <SparklesIcon className="w-5 h-5 opacity-30" style={{ color: motifColor }} />
                    </motion.div>
                ))}
            </div>

            <section className="min-h-screen py-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl w-full"
                >
                    <div className="mb-8 relative group inline-block">
                        <div className="w-44 sm:w-56 md:w-64 h-44 sm:h-56 md:h-64 rounded-full border-[10px] border-white shadow-[0_20px_60px_rgba(141,123,196,0.25)] overflow-hidden mx-auto rotate-3 group-hover:rotate-0 transition-transform duration-700 relative p-1 bg-gradient-to-tr from-purple-200 via-pink-200 to-amber-100">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <Image
                                    src={wedding.couple_photo || wedding.hero_image || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="260px"
                                    className="object-cover scale-110"
                                />
                            </div>
                        </div>
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-4 -right-4 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border border-purple-100"
                        >
                            <Heart className="w-7 h-7 fill-pink-400 text-pink-400" />
                        </motion.div>
                    </div>

                    <div className="mb-4 flex justify-center">
                        <TemplateMonogram wedding={wedding} defaultShape="intertwined" size="sm" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-purple-100/80 text-purple-700 text-xs uppercase tracking-[0.35em] font-sans font-bold mb-6">
                        <span>✨ Storybook Romance</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-[#3b1d4d] leading-none mb-6">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-4xl italic font-light serif text-pink-500 my-2 block">&amp;</span>
                        {wedding.groom_name}
                    </h1>

                    <p className="text-sm sm:text-base font-sans uppercase tracking-[0.3em] text-[#8D7BC4] font-semibold mb-4">
                        {formattedDate} • {wedding.venue_name}
                    </p>

                    {wedding.quote && (
                        <p className="text-sm sm:text-base font-serif italic text-pink-600 mb-6 max-w-md mx-auto">
                            &ldquo;{wedding.quote}&rdquo;
                        </p>
                    )}

                    <p className="text-base sm:text-xl font-serif italic text-[#6a4c7a] mb-10 max-w-lg mx-auto">
                        {wedding.story || 'Once upon a time, two souls met and wrote a love story that will last forever.'}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            href="#rsvp"
                            aria-label="Count Me In - RSVP"
                            className="px-10 py-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 text-white font-sans font-bold tracking-widest uppercase text-xs shadow-xl shadow-purple-300/50 min-h-[46px]"
                        >
                            Count Me In! (RSVP)
                        </motion.a>
                        <a
                            href="#details"
                            className="px-8 py-4 inline-flex items-center justify-center rounded-full border border-purple-300 text-purple-800 font-sans font-medium tracking-widest uppercase text-xs hover:bg-purple-50 transition-all min-h-[46px]"
                        >
                            The Fairytale Details
                        </a>
                    </div>
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="whimsical" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="whimsical" motifColor={motifColor} />
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
            <TemplateSectionDivider template="whimsical" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="whimsical" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

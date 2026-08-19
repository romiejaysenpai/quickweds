'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Film, Play } from 'lucide-react';
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

export default function CinematicTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#08090b] text-white font-sans selection:bg-amber-500 selection:text-black overflow-hidden pb-24 relative">
            {/* Cinematic 21:9 Letterbox Bars */}
            <div className="fixed top-0 left-0 right-0 h-6 sm:h-10 bg-black z-40 pointer-events-none border-b border-white/15" />
            <div className="fixed bottom-0 left-0 right-0 h-6 sm:h-10 bg-black z-40 pointer-events-none border-t border-white/15" />

            <section className="min-h-screen relative flex items-center justify-center pt-12 pb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="100vw"
                        className="object-cover brightness-75 contrast-125 saturate-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-transparent to-[#08090b]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4)_0%,transparent_70%)]" />
                </motion.div>

                <div className="z-10 text-center px-4 sm:px-6 max-w-5xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/70 border border-white/20 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] sm:text-xs uppercase tracking-[0.55em] font-mono font-bold text-white/90">
                            A MOTION PICTURE EVENT
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif leading-none tracking-tight text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.9)] uppercase"
                    >
                        {wedding.bride_name}
                        <span className="block text-2xl sm:text-4xl italic text-amber-400 font-serif my-2 lowercase font-light">&amp;</span>
                        {wedding.groom_name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-2"
                    >
                        <div className="flex items-center gap-4 text-xs font-mono tracking-[0.3em] uppercase text-amber-200/90 bg-black/40 px-6 py-2 rounded-full border border-white/10">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{wedding.venue_name}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="pt-6 flex flex-wrap gap-4 justify-center"
                    >
                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="px-10 py-4 rounded-full bg-white text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(255,255,255,0.35)] inline-flex items-center justify-center min-h-[48px]"
                        >
                            RSVP World Premiere
                        </a>
                        <a
                            href="#details"
                            className="px-8 py-4 rounded-full border border-white/30 text-white font-mono uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all inline-flex items-center justify-center min-h-[48px]"
                        >
                            Showtimes &amp; Details
                        </a>
                    </motion.div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
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

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

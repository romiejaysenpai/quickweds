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

export default function CinematicTemplate({ wedding, gallery, isExpired }: any) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#0b0c10] text-white font-sans selection:bg-amber-500 selection:text-black overflow-hidden pb-24 relative">
            {/* Cinematic 21:9 Anamorphic Bar Overlays */}
            <div className="fixed top-0 left-0 right-0 h-6 sm:h-10 bg-black z-40 pointer-events-none border-b border-white/10" />
            <div className="fixed bottom-0 left-0 right-0 h-6 sm:h-10 bg-black z-40 pointer-events-none border-t border-white/10" />

            <section className="min-h-screen relative flex items-center justify-center pt-10 pb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 0.65, scale: 1 }}
                    transition={{ duration: 2.5, ease: 'easeOut' }}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-[#0b0c10]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_70%)]" />
                </motion.div>

                <div className="z-10 text-center px-4 sm:px-6 max-w-5xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] sm:text-xs uppercase tracking-[0.6em] font-mono font-bold text-white/80">
                            A CINEMATIC FEATURE
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif leading-none tracking-tight text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
                    >
                        {wedding.bride_name}
                        <span className="block text-2xl sm:text-4xl italic text-amber-400 font-serif my-2">&amp;</span>
                        {wedding.groom_name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
                    >
                        <div className="flex items-center gap-4 text-xs font-mono tracking-[0.3em] uppercase text-amber-200/90">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{wedding.venue_name}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="pt-6"
                    >
                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="px-10 py-4 rounded-full bg-white text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] inline-flex items-center justify-center"
                        >
                            RSVP Premiere
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
                    weddingTime={wedding.wedding_time} eventTimezone={wedding.event_timezone}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                />
            )}

            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

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

export default function CelestialTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#090d16] text-amber-100 font-serif relative pb-24 selection:bg-amber-400 selection:text-slate-950">
            {/* Cosmic Ambient Particles Background */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-indigo-950/20 to-slate-950" />
            <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:48px_48px]" />

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center px-6 py-24 overflow-hidden">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="w-16 h-16 mx-auto rounded-full border border-amber-300/30 bg-amber-400/10 flex items-center justify-center text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] backdrop-blur-md"
                    >
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xs uppercase tracking-[0.45em] text-amber-300/90 font-sans"
                    >
                        Written in the Stars
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-4xl sm:text-7xl md:text-8xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 uppercase font-light drop-shadow-[0_0_40px_rgba(251,191,36,0.2)]"
                    >
                        {wedding.bride_name} <br />
                        <span className="text-amber-400 font-serif italic lowercase text-4xl sm:text-6xl tracking-normal">&amp;</span> <br />
                        {wedding.groom_name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="relative max-w-xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-amber-300/40 via-indigo-500/20 to-amber-300/20 shadow-[0_25px_80px_rgba(15,23,42,0.8)]"
                    >
                        <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-[22px] overflow-hidden">
                            <Image
                                src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 600px"
                                className="object-cover brightness-90 contrast-[1.05]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-left">
                                <p className="text-amber-300 font-sans text-xs uppercase tracking-widest">{wedding.venue_name}</p>
                                <p className="text-white font-serif text-lg font-light">{formattedDate}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="pt-4"
                    >
                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-sans font-bold uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                        >
                            Request Presence
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Sections */}
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

            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

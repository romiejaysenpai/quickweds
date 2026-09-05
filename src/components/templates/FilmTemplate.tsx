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

export default function FilmTemplate({ wedding, gallery, isExpired }: any) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#121212] text-[#e0e0e0] font-mono relative pb-24 selection:bg-red-600 selection:text-white">
            {/* Vintage Film Grain Overlay */}
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-film-texture)' }} />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center px-4 sm:px-6 relative">
                {/* 35mm Film Sprocket Hole Header & Footer */}
                <div
                    className="absolute top-0 left-0 w-full h-10 bg-black border-b border-white/10"
                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="100%25" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="24" height="20" rx="3" fill="%23ffffff" fill-opacity="0.15"/></svg>')` }}
                />
                <div
                    className="absolute bottom-0 left-0 w-full h-10 bg-black border-t border-white/10"
                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="100%25" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="24" height="20" rx="3" fill="%23ffffff" fill-opacity="0.15"/></svg>')` }}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1 }}
                    className="bg-zinc-950 p-4 pb-14 pt-4 max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.8)] border border-white/10 rounded-sm relative z-10"
                >
                    <div className="aspect-[4/5] bg-zinc-900 mb-4 relative overflow-hidden group rounded-sm border border-white/10">
                        <Image
                            src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            priority
                            fill
                            sizes="(max-width: 768px) 100vw, 500px"
                            className="object-cover sepia-[0.15] contrast-125 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4 text-[10px] text-red-400 font-mono font-bold animate-pulse z-10 bg-black/70 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span>REC • 4K 24FPS</span>
                        </div>
                    </div>
                    <div className="text-center font-serif text-zinc-900 bg-amber-50 p-6 sm:p-8 rounded-sm shadow-inner">
                        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-500 mb-2">AN ANALOG LOVE STORY</p>
                        <h1 className="text-3xl sm:text-5xl font-bold mb-2 tracking-tight text-zinc-900">
                            {wedding.bride_name} &amp; {wedding.groom_name}
                        </h1>
                        <div className="w-12 h-px bg-zinc-400 mx-auto my-4" />
                        <p className="text-xs uppercase tracking-widest font-mono text-zinc-600">
                            {formattedDate} • {wedding.venue_name}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 z-10"
                >
                    <a
                        href="#rsvp"
                        aria-label="RSVP"
                        className="px-10 py-4 bg-red-600 text-white font-mono font-bold uppercase tracking-[0.3em] text-xs hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] inline-flex items-center justify-center rounded-sm"
                    >
                        Action! (RSVP)
                    </a>
                </motion.div>
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

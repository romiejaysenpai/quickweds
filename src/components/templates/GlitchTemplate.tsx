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

export default function GlitchTemplate({ wedding, gallery, isExpired }: any) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#050807] text-emerald-400 font-mono min-h-screen relative pb-24 selection:bg-emerald-400 selection:text-black">
            {/* Cyber Scanlines & CRT Grid Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-25 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(0,255,150,0.06),rgba(0,180,255,0.04),rgba(255,0,150,0.06))] bg-[length:100%_4px,4px_100%]" />

            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-24 py-16 relative overflow-hidden">
                <div className="max-w-6xl z-10 space-y-8">
                    <motion.div
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        className="border-l-4 border-emerald-400 pl-4 sm:pl-6 bg-emerald-950/20 py-3 rounded-r-lg backdrop-blur-sm border-t border-b border-r border-emerald-400/30"
                    >
                        <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>[UNION_PROTOCOL_ACTIVE]</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500 leading-none tracking-tighter filter drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                            {wedding.bride_name}
                            <span className="text-fuchsia-400 text-2xl sm:text-4xl block my-1">&amp;</span>
                            {wedding.groom_name}
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="border border-emerald-400/40 bg-black/60 p-4 rounded shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                            <p className="opacity-50 text-[10px] mb-1">{'// TIMESTAMP'}</p>
                            <p className="text-sm font-bold text-emerald-200">{formattedDate}</p>
                        </div>
                        <div className="border border-emerald-400/40 bg-black/60 p-4 rounded shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                            <p className="opacity-50 text-[10px] mb-1">{'// COORDINATES'}</p>
                            <p className="text-sm font-bold text-emerald-200">{wedding.venue_name}</p>
                        </div>
                    </div>

                    <div>
                        <a
                            href="#rsvp"
                            aria-label="Confirm Presence - RSVP"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-400 text-black font-black uppercase tracking-wider text-xs hover:bg-cyan-300 transition-all skew-x-[-10deg] shadow-[0_0_25px_rgba(52,211,153,0.6)]"
                        >
                            <span className="skew-x-[10deg]">EXECUTE_RSVP()</span>
                        </a>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-40 mix-blend-screen pointer-events-none z-0">
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover filter contrast-150 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-[#050807] via-transparent to-[#050807]" />
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

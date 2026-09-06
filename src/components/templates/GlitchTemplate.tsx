'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Terminal, Zap } from 'lucide-react';
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

export default function GlitchTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#050807] text-emerald-400 font-mono min-h-screen relative pb-24 selection:bg-emerald-400 selection:text-black overflow-hidden">
            {/* Cyber Scanlines & CRT Grid Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-25 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(0,255,150,0.06),rgba(0,180,255,0.04),rgba(255,0,150,0.06))] bg-[length:100%_4px,4px_100%]" />
            <div className="fixed top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-0" />

            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-20 relative overflow-hidden z-10">
                <div className="max-w-6xl z-10 space-y-8">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        className="border-l-4 border-emerald-400 pl-4 sm:pl-6 bg-emerald-950/30 py-4 rounded-r-xl backdrop-blur-md border-t border-b border-r border-emerald-400/30 shadow-[0_0_40px_rgba(52,211,153,0.15)]"
                    >
                        <TemplateMonogram wedding={wedding} defaultShape="square" size="sm" className="justify-start mb-3" />

                        <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <Terminal className="w-3.5 h-3.5" />
                            <span>[UNION_PROTOCOL_ACTIVE // 2026]</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-fuchsia-400 leading-none tracking-tighter filter drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]">
                            {wedding.bride_name}
                            <span className="text-fuchsia-400 text-2xl sm:text-4xl block my-2">&amp;</span>
                            {wedding.groom_name}
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="border border-emerald-400/40 bg-black/75 p-4 rounded shadow-[0_0_15px_rgba(52,211,153,0.15)] backdrop-blur-md">
                            <p className="opacity-50 text-[10px] mb-1">{'// TIMESTAMP'}</p>
                            <p className="text-sm font-bold text-emerald-200">{formattedDate}</p>
                        </div>
                        <div className="border border-emerald-400/40 bg-black/75 p-4 rounded shadow-[0_0_15px_rgba(52,211,153,0.15)] backdrop-blur-md">
                            <p className="opacity-50 text-[10px] mb-1">{'// COORDINATES'}</p>
                            <p className="text-sm font-bold text-emerald-200 truncate">{wedding.venue_name}</p>
                        </div>
                    </div>

                    {wedding.quote && (
                        <div className="border border-cyan-400/40 bg-cyan-950/20 px-4 py-2.5 text-xs text-cyan-300 font-mono max-w-xl">
                            <span className="opacity-50 text-[10px] block mb-1">{'// EXEC::QUOTE()'}</span>
                            &ldquo;{wedding.quote}&rdquo;
                        </div>
                    )}

                    <div className="pt-2 flex flex-wrap gap-4 items-center">
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="#rsvp"
                            aria-label="Confirm Presence - RSVP"
                            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-black uppercase tracking-wider text-xs skew-x-[-10deg] shadow-[0_0_30px_rgba(52,211,153,0.6)] min-h-[48px]"
                        >
                            <span className="skew-x-[10deg] flex items-center gap-2">
                                <Zap className="w-4 h-4 fill-black" />
                                EXECUTE_RSVP()
                            </span>
                        </motion.a>
                        <a
                            href="#details"
                            className="inline-flex items-center gap-2 px-8 py-4 border border-emerald-400/50 text-emerald-300 font-mono text-xs uppercase tracking-widest hover:bg-emerald-950/40 transition-all skew-x-[-10deg] min-h-[48px]"
                        >
                            <span className="skew-x-[10deg]">VIEW_SYSTEM_LOGS()</span>
                        </a>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-35 mix-blend-screen pointer-events-none z-0">
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
            <TemplateSectionDivider template="glitch" motifColor={wedding.motif_color} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="glitch" motifColor={wedding.motif_color} />
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

            <TemplateSectionDivider template="glitch" motifColor={wedding.motif_color} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="glitch" motifColor={wedding.motif_color} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

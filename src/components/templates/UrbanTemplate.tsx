'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';
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

export default function UrbanTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#FF4D5A';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).toUpperCase();

    return (
        <div className="bg-[#0e0f12] text-white selection:bg-[#FF4D5A] selection:text-black font-sans relative pb-24 overflow-hidden">
            {/* Industrial Grid Mesh & Spotlight */}
            <div className="fixed inset-0 opacity-15 pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none -z-0" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-8 md:px-16 flex flex-col justify-between relative z-10">
                {/* Header VIP Status Bar */}
                <div className="flex justify-between items-center border-b border-white/15 pb-6">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#FF4D5A] font-bold">
                            ALL-ACCESS VIP // UNION
                        </span>
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/40 hidden sm:inline">
                        N° {wedding.id.slice(0, 8).toUpperCase()}
                    </span>
                </div>

                {/* Main Hero Spread */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -40 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7 space-y-8"
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.82] tracking-tighter mix-blend-difference">
                            {wedding.bride_name} <br />
                            <span className="text-[#FF4D5A] font-light italic font-serif text-3xl sm:text-5xl">+</span> <br />
                            {wedding.groom_name}
                        </h1>

                        <div className="flex flex-wrap gap-4 font-mono text-xs sm:text-sm uppercase tracking-[0.25em] bg-white/5 backdrop-blur-xl p-4 sm:p-5 border-l-4 border-[#FF4D5A] inline-flex">
                            <p className="text-white font-bold">{formattedDate}</p>
                            <span className="text-white/40">•</span>
                            <p className="text-white/80">{wedding.venue_name}</p>
                        </div>

                        <p className="text-sm sm:text-base font-mono uppercase tracking-wide text-white/70 max-w-md">
                            {wedding.story || 'A night of music, city lights, and monumental celebration in the heart of downtown.'}
                        </p>

                        <div className="pt-4 flex flex-wrap gap-4 items-center">
                            <motion.a 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                href="#rsvp" 
                                aria-label="Enter Event - RSVP" 
                                className="inline-flex items-center gap-3 px-10 py-4 bg-[#FF4D5A] text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(255,77,90,0.4)] min-h-[48px]"
                            >
                                <span>ENTER EVENT (RSVP)</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </motion.a>
                            <a 
                                href="#details" 
                                className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white font-mono uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all min-h-[48px]"
                            >
                                Logistics &amp; Dress Code
                            </a>
                        </div>
                    </motion.div>

                    {/* Right Hero Image Frame */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="lg:col-span-5"
                    >
                        <div className="relative aspect-[4/5] border-2 border-white/20 bg-neutral-900 overflow-hidden shadow-2xl group">
                            <Image
                                src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                priority
                                fill
                                sizes="(max-width: 1024px) 100vw, 500px"
                                className="object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white font-mono text-[10px] uppercase tracking-widest">
                                <span>AFTER-HOURS EDITION</span>
                                <span className="text-[#FF4D5A]">2026 // LIVE</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center font-mono text-[10px] text-white/40 uppercase tracking-widest">
                    <span>STATUS: RSVP OPEN</span>
                    <span>VENUE: {wedding.venue_name}</span>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    TimelineSection,
    VideoSection,
    AttireSection,
    FAQSection,
} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';
import { SharedNewSections } from './shared';

export default function MinimalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#3A2A2D';
    const weddingDateObj = new Date(wedding.wedding_date);
    const day = String(weddingDateObj.getDate()).padStart(2, '0');
    const month = weddingDateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = String(weddingDateObj.getFullYear());

    return (
        <div className="bg-white text-neutral-900 pb-24 font-sans selection:bg-neutral-900 selection:text-white">
            {/* Architectural Grid Lines Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            <section className="min-h-screen flex items-center justify-center px-4 sm:px-8 md:px-16 py-20 relative overflow-hidden">
                {/* Giant Oversized Year/Date Background Watermark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 font-mono font-black text-[22vw] leading-none select-none text-neutral-950/[0.025] pointer-events-none tracking-tighter">
                    {year}
                </div>

                <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
                    
                    {/* Left/Main Column: Swiss Typography Composition */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7 space-y-8"
                    >
                        <div className="flex items-center gap-4 text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em] text-neutral-400">
                            <span>SAVE THE DATE</span>
                            <span className="w-8 h-px bg-neutral-300" />
                            <span>{month} {day}, {year}</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-neutral-900 leading-[0.95] tracking-tight">
                            {wedding.bride_name} <br />
                            <span className="font-light italic serif text-2xl sm:text-4xl" style={{ color: motifColor }}>
                                &amp;
                            </span> <br />
                            {wedding.groom_name}
                        </h1>

                        <div className="w-16 h-[2px] bg-neutral-900" />

                        <div className="space-y-2 text-neutral-600 font-mono text-xs sm:text-sm">
                            <p className="tracking-widest uppercase font-bold text-neutral-900">
                                {wedding.venue_name}
                            </p>
                            {wedding.venue_address && (
                                <p className="tracking-wide text-neutral-400">
                                    {wedding.venue_address}
                                </p>
                            )}
                        </div>

                        <p className="text-sm sm:text-base leading-relaxed text-neutral-500 max-w-md font-light">
                            {wedding.story || 'A union of two lives. Join us for an intimate celebration of vows, dinner, and dancing.'}
                        </p>

                        <div className="pt-4 flex flex-wrap gap-4 items-center">
                            <a 
                                href="#rsvp" 
                                aria-label="RSVP" 
                                className="inline-flex items-center justify-center px-10 py-4 uppercase tracking-[0.25em] text-xs font-bold bg-neutral-900 text-white rounded-none hover:bg-neutral-800 transition-all min-h-[48px] shadow-[4px_4px_0_rgba(0,0,0,0.1)]"
                            >
                                RSVP Now
                            </a>
                            <a 
                                href="#details" 
                                className="inline-flex items-center justify-center px-8 py-4 uppercase tracking-[0.2em] text-xs font-medium border border-neutral-300 text-neutral-800 rounded-none hover:bg-neutral-50 transition-all min-h-[48px]"
                            >
                                Schedule &amp; Details
                            </a>
                        </div>
                    </motion.div>

                    {/* Right Column: Clean Architectural Photo Box */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="lg:col-span-5"
                    >
                        <div className="relative aspect-[4/5] border border-neutral-200 bg-neutral-50 p-3 shadow-xl">
                            <div className="w-full h-full relative overflow-hidden bg-neutral-100">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 500px"
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 border border-neutral-200">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                                    EST. {year}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

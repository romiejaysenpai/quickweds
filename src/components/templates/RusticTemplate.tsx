'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Heart } from 'lucide-react';
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

export default function RusticTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#8C6446';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#f7f2ea] text-[#4a3b32] font-serif relative pb-24 selection:bg-[#8C6446]/20">
            {/* Kraft Paper & Wood Grain Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.045]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            {/* Glowing String Lights Header Illustration */}
            <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20 flex justify-around items-start opacity-70">
                {Array.from({ length: 9 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-px h-6 bg-[#8C6446]/40" />
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-200 shadow-[0_0_12px_#fde68a]" />
                    </motion.div>
                ))}
            </div>

            <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative py-24">
                {/* Double Stitched Border Frame */}
                <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-[#8C6446]/30 pointer-events-none rounded-2xl" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-4xl w-full z-10 bg-[#fffdf9]/90 backdrop-blur-md p-8 sm:p-14 md:p-18 rounded-2xl border border-[#8C6446]/20 shadow-[0_20px_70px_rgba(74,59,50,0.09)] space-y-6"
                >
                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.45em] font-sans font-bold text-[#8C6446]">
                        <Heart className="w-3.5 h-3.5 fill-[#8C6446]" />
                        <span>We&apos;re Getting Married</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold text-[#3d2e24] leading-tight tracking-tight">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-4xl italic font-light serif text-[#8C6446] my-2 block">&amp;</span>
                        {wedding.groom_name}
                    </h1>

                    {/* Polaroid Photo Frame (If photo exists) */}
                    {(wedding.hero_image || wedding.couple_photo) && (
                        <div className="mx-auto my-6 max-w-xs aspect-square p-3 bg-white shadow-xl border border-stone-200 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 rounded-sm">
                            <div className="w-full h-[82%] relative overflow-hidden bg-stone-100">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="300px"
                                    className="object-cover sepia-[0.15]"
                                />
                            </div>
                            <p className="text-center text-[10px] font-sans tracking-widest text-stone-500 pt-2 uppercase">
                                Together in Love
                            </p>
                        </div>
                    )}

                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 border-y border-[#8C6446]/25 py-4 px-8 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm font-serif">
                        <span className="text-lg sm:text-xl font-bold text-[#3d2e24]">{formattedDate}</span>
                        <span className="w-2 h-2 rounded-full bg-[#8C6446]/40 hidden sm:block" />
                        <span className="text-lg sm:text-xl text-[#635144]">{wedding.venue_name}</span>
                    </div>

                    <p className="text-sm sm:text-base italic leading-relaxed text-[#635144] max-w-lg mx-auto">
                        {wedding.story || 'A cozy celebration under string lights and open skies, surrounded by the warmth of family and lifelong friends.'}
                    </p>

                    <div className="pt-4 flex flex-wrap gap-4 justify-center">
                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="px-10 py-4 inline-flex items-center justify-center bg-[#8C6446] text-[#fffdf9] rounded-xl font-sans font-bold tracking-[0.25em] uppercase hover:bg-[#6e4e36] transition-all shadow-lg text-xs min-h-[46px]"
                        >
                            Confirm RSVP
                        </a>
                        <a
                            href="#details"
                            className="px-8 py-4 inline-flex items-center justify-center border border-[#8C6446]/40 text-[#4a3b32] rounded-xl font-sans font-medium tracking-[0.2em] uppercase hover:bg-[#8C6446]/5 transition-all text-xs min-h-[46px]"
                        >
                            Event Details
                        </a>
                    </div>
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} />
            
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
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

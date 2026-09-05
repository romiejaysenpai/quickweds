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
    FAQSection,
    TemplateMonogram,
    TemplateSectionDivider,
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

const sakuraPetals = [
    { id: 1, left: '8%', duration: 12, delay: 0 },
    { id: 2, left: '20%', duration: 15, delay: 2 },
    { id: 3, left: '35%', duration: 14, delay: 4 },
    { id: 4, left: '50%', duration: 17, delay: 1.5 },
    { id: 5, left: '65%', duration: 16, delay: 1 },
    { id: 6, left: '80%', duration: 13, delay: 3 },
    { id: 7, left: '92%', duration: 18, delay: 5 },
];

export default function SakuraTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#fff0f5] text-[#8e405a] relative font-serif pb-24 selection:bg-[#ffb7c5] selection:text-white overflow-hidden">
            {/* Sakura Petal Background Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-200/40 via-transparent to-pink-50" />

            {/* Drifting Sakura Petals Animation */}
            <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
                {sakuraPetals.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ y: -50, x: 0, rotate: 0, opacity: 0 }}
                        animate={{
                            y: '105vh',
                            x: [0, 30, -20, 15, 0],
                            rotate: [0, 90, 180, 270, 360],
                            opacity: [0, 0.7, 0.7, 0.4, 0]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: 'linear'
                        }}
                        className="absolute text-pink-300 text-lg sm:text-xl select-none"
                        style={{ left: p.left }}
                    >
                        🌸
                    </motion.div>
                ))}
            </div>

            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
                <div className="w-72 h-72 bg-gradient-to-br from-pink-300/30 to-transparent rounded-full absolute -top-24 -left-24 blur-3xl pointer-events-none" />
                <div className="w-64 h-64 bg-gradient-to-tl from-rose-200/40 to-transparent rounded-full absolute bottom-0 right-0 blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 bg-white/80 backdrop-blur-xl p-8 sm:p-14 md:p-20 rounded-[3.5rem] border border-white max-w-4xl shadow-[0_20px_70px_rgba(255,183,197,0.35)] space-y-6"
                >
                    <div className="mb-2 flex justify-center">
                        <TemplateMonogram wedding={wedding} defaultShape="botanical-frame" size="sm" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-pink-100/80 text-pink-700 text-xs uppercase tracking-[0.35em] font-sans font-bold">
                        <span>🌸 Spring Blossom Union</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-[#8e405a] leading-tight">
                        {wedding.bride_name}
                        <span className="block text-xl sm:text-2xl font-sans font-light uppercase tracking-widest text-[#8e405a]/50 my-2">and</span>
                        {wedding.groom_name}
                    </h1>

                    <div className="inline-block border-y border-[#8e405a]/25 py-3 px-8 my-2">
                        <p className="font-sans text-xs uppercase tracking-[0.35em] text-[#8e405a] font-bold">
                            {formattedDate} • {wedding.venue_name}
                        </p>
                    </div>

                    {(wedding.couple_photo || wedding.hero_image) && (
                        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto relative p-1 bg-pink-100">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <Image
                                    src={wedding.couple_photo || wedding.hero_image || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="220px"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {wedding.quote && (
                        <p className="text-sm font-serif italic text-pink-600/90 max-w-md mx-auto">
                            &ldquo;{wedding.quote}&rdquo;
                        </p>
                    )}

                    <p className="text-sm sm:text-base italic leading-relaxed text-[#8e405a]/80 max-w-lg mx-auto">
                        {wedding.story || 'Like cherry blossoms celebrating spring, we invite you to share in the joy and beauty of our union.'}
                    </p>

                    <div className="pt-4 flex flex-wrap gap-4 justify-center">
                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="px-10 py-4 inline-flex items-center justify-center bg-gradient-to-r from-[#ff9eb0] to-[#ffb7c5] text-white rounded-full font-sans font-bold uppercase tracking-widest text-xs hover:brightness-105 transition-all shadow-lg shadow-pink-300/60 min-h-[46px]"
                        >
                            Join Our Celebration
                        </a>
                        <a
                            href="#details"
                            className="px-8 py-4 inline-flex items-center justify-center border border-pink-300 text-[#8e405a] rounded-full font-sans font-medium uppercase tracking-widest text-xs hover:bg-pink-50 transition-all min-h-[46px]"
                        >
                            Event Details
                        </a>
                    </div>
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="sakura" motifColor={wedding.motif_color} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="sakura" motifColor={wedding.motif_color} />
            <DetailsSection id="details" wedding={wedding} />
            
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

            <TemplateSectionDivider template="sakura" motifColor={wedding.motif_color} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="sakura" motifColor={wedding.motif_color} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

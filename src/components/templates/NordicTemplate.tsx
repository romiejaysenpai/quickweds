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
    TemplateSectionDivider
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function NordicTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#f4f6f5] text-slate-800 font-sans relative pb-24 selection:bg-slate-700 selection:text-white">
            {/* Ambient Background Grid & Timber Accent */}
            <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center px-6 py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-200/50 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 border border-slate-200 shadow-sm backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-xs font-medium uppercase tracking-[0.35em] text-slate-600">The Nordic Union</span>
                    </motion.div>

                    <TemplateMonogram
                        wedding={wedding}
                        defaultShape="minimal"
                        size="md"
                        color="#1e293b"
                        motifColor={wedding.motif_color}
                        className="mx-auto"
                    />

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-4xl sm:text-6xl md:text-8xl font-light tracking-tight text-slate-900 leading-none"
                    >
                        {wedding.bride_name} <span className="font-serif italic text-emerald-800/70 font-normal">&amp;</span> {wedding.groom_name}
                    </motion.h1>

                    {wedding.quote && (
                        <blockquote className="my-6 max-w-md mx-auto italic font-serif text-slate-700 text-sm sm:text-base border-y border-slate-200/80 py-3">
                            &ldquo;{wedding.quote}&rdquo;
                        </blockquote>
                    )}

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-sm sm:text-base font-light text-slate-600 max-w-xl mx-auto tracking-wide"
                    >
                        {wedding.story || 'A celebration bound by calm waters, quiet pine forests, and everlasting warmth.'}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.5 }}
                        className="relative max-w-2xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                    >
                        <Image
                            src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 800px"
                            className="object-cover contrast-[0.95] brightness-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end justify-between p-6 text-white">
                            <div>
                                <p className="text-xs uppercase tracking-widest opacity-80">{wedding.venue_name}</p>
                                <p className="text-sm font-medium">{formattedDate}</p>
                            </div>
                            <a
                                href="#rsvp"
                                aria-label="RSVP"
                                className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-medium text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-md"
                            >
                                Confirm Attendance
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Sections */}
            <TemplateSectionDivider template="nordic" motifColor={wedding.motif_color} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="nordic" motifColor={wedding.motif_color} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="nordic" motifColor={wedding.motif_color} />
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

            <TemplateSectionDivider template="nordic" motifColor={wedding.motif_color} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="nordic" motifColor={wedding.motif_color} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="nordic" motifColor={wedding.motif_color} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

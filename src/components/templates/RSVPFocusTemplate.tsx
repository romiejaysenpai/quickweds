'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2, HeartHandshake } from 'lucide-react';
import { SharedNewSections } from './shared';
import {
    VideoSection,
    BioSection,
    DetailsSection,
    TimelineSection,
    GallerySection,
    GiftSection,
    CountdownTimer,
    AttireSection,
    FAQSection,
    TemplateMonogram,
    TemplateSectionDivider
} from '../wedding';
import type { TemplateProps } from '@/types/wedding';

export default function RSVPFocusTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#A0616A';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });

    return (
        <div className="bg-[#fffbfb] text-neutral-800 pb-24 font-sans relative selection:bg-[#A0616A]/20">
            {/* Subtle Gradient & Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-12 flex items-center justify-center relative overflow-hidden">
                <div className="max-w-5xl w-full z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white rounded-3xl border border-rose-100 shadow-[0_25px_80px_rgba(160,97,106,0.1)] p-8 sm:p-14 md:p-18 text-center relative overflow-hidden"
                    >
                        {/* Status Header Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-8 text-xs uppercase tracking-[0.35em] font-bold" style={{ borderColor: `${motifColor}30`, backgroundColor: `${motifColor}0A`, color: motifColor }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Official Wedding Invitation &amp; RSVP</span>
                        </div>

                        <TemplateMonogram
                            wedding={wedding}
                            defaultShape="circle"
                            size="md"
                            color={motifColor}
                            motifColor={motifColor}
                            className="mx-auto mb-6"
                        />

                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-neutral-900 mb-6 leading-tight tracking-tight">
                            {wedding.bride_name} <br />
                            <span className="text-2xl sm:text-4xl italic font-light serif" style={{ color: motifColor }}>&amp;</span> <br />
                            {wedding.groom_name}
                        </h1>

                        <div className="w-20 h-px mx-auto my-6" style={{ backgroundColor: `${motifColor}50` }} />

                        <p className="text-xl sm:text-2xl font-serif text-neutral-700 mb-2">
                            {formattedDate}
                        </p>
                        <p className="text-sm sm:text-base font-light text-neutral-500 mb-8 max-w-md mx-auto">
                            {wedding.venue_name} {wedding.venue_address ? `• ${wedding.venue_address}` : ''}
                        </p>

                        {wedding.quote && (
                            <blockquote className="my-6 max-w-md mx-auto italic font-serif text-neutral-700 text-sm sm:text-base border-y border-rose-100 py-3">
                                &ldquo;{wedding.quote}&rdquo;
                            </blockquote>
                        )}

                        {/* Couple Photo Spotlight (If present) */}
                        {(wedding.hero_image || wedding.couple_photo) && (
                            <div className="mx-auto my-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 shadow-lg relative border-2 border-white" style={{ backgroundColor: `${motifColor}20` }}>
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    <Image
                                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                        priority
                                        fill
                                        sizes="150px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* High-Conversion Primary RSVP Box */}
                        <div className="mt-8 max-w-md mx-auto bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 shadow-inner space-y-4">
                            <p className="text-xs uppercase tracking-widest font-bold text-neutral-500">
                                Kindly Respond by Your Earliest Convenience
                            </p>
                            <motion.a
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                href="#rsvp"
                                aria-label="Confirm Attendance Now"
                                className="w-full inline-flex items-center justify-center gap-3 px-10 py-4 font-bold uppercase tracking-[0.25em] text-xs sm:text-sm text-white rounded-xl shadow-xl transition-all min-h-[52px]"
                                style={{ backgroundColor: motifColor }}
                            >
                                <HeartHandshake className="w-4 h-4" />
                                <span>Confirm Attendance Now</span>
                            </motion.a>
                            <p className="text-[11px] text-neutral-400 font-light">
                                Your presence is our greatest gift. Please let us know if you can make it!
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <DetailsSection id="details" wedding={wedding} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
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
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

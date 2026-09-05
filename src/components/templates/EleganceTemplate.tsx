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

export default function EleganceTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#9B7A5E';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="bg-[#faf8f5] text-[#332b25] font-serif relative pb-24 selection:bg-[#9B7A5E]/20">
            {/* Subtle Linen / Silk Paper Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-12 flex items-center justify-center relative overflow-hidden">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center z-10">
                    
                    {/* Left: Refined Quiet Luxury Typography Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
                        className="lg:col-span-7 bg-white/80 backdrop-blur-xl p-8 sm:p-12 md:p-16 border border-white shadow-[0_20px_70px_rgba(155,122,94,0.09)] rounded-3xl relative order-2 lg:order-1"
                    >
                        {/* Delicate corner brackets */}
                        <div className="absolute top-4 left-4 w-6 h-6 border-t border-l" style={{ borderColor: `${motifColor}60` }} />
                        <div className="absolute top-4 right-4 w-6 h-6 border-t border-r" style={{ borderColor: `${motifColor}60` }} />
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l" style={{ borderColor: `${motifColor}60` }} />
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r" style={{ borderColor: `${motifColor}60` }} />

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[10px] uppercase tracking-[0.35em] font-sans font-medium" style={{ borderColor: `${motifColor}40`, color: motifColor }}>
                            <span>A Celebration of Love</span>
                        </div>

                        <TemplateMonogram
                            wedding={wedding}
                            defaultShape="oval"
                            size="md"
                            color={motifColor}
                            motifColor={motifColor}
                            className="justify-start mb-4"
                        />

                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#241e1a] leading-[1.05] tracking-tight">
                            {wedding.bride_name} <br />
                            <span className="text-2xl sm:text-4xl italic font-light font-serif my-2 block" style={{ color: motifColor }}>
                                &amp;
                            </span>
                            {wedding.groom_name}
                        </h1>

                        <div className="w-16 h-px my-6 sm:my-8" style={{ backgroundColor: `${motifColor}60` }} />

                        <div className="space-y-2 mb-8">
                            <p className="text-lg sm:text-xl font-medium tracking-wide text-[#241e1a]">
                                {formattedDate}
                            </p>
                            <p className="text-sm sm:text-base italic text-[#706055]">
                                {wedding.venue_name} {wedding.venue_address ? `• ${wedding.venue_address}` : ''}
                            </p>
                        </div>

                        {wedding.quote && (
                            <blockquote className="my-6 border-l-2 pl-4 py-1 italic font-serif text-[#63554b] text-base" style={{ borderColor: motifColor }}>
                                &ldquo;{wedding.quote}&rdquo;
                            </blockquote>
                        )}

                        <p className="text-sm sm:text-base leading-relaxed italic text-[#63554b] mb-10 max-w-lg">
                            {wedding.story || 'The honor of your presence is requested as we unite our lives and celebrate our wedding day.'}
                        </p>

                        <div className="flex flex-wrap gap-4 items-center">
                            <motion.a 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                href="#rsvp" 
                                aria-label="Kindly Respond - RSVP" 
                                className="px-10 py-4 text-white font-sans font-bold uppercase tracking-[0.25em] text-xs shadow-lg rounded-full min-h-[46px] inline-flex items-center justify-center transition-all"
                                style={{ backgroundColor: motifColor }}
                            >
                                Kindly Respond
                            </motion.a>
                            <a 
                                href="#details" 
                                className="px-8 py-4 font-sans font-medium uppercase tracking-[0.2em] text-xs border rounded-full hover:bg-neutral-50 transition-all min-h-[46px] inline-flex items-center justify-center"
                                style={{ borderColor: `${motifColor}50`, color: '#332b25' }}
                            >
                                View Details
                            </a>
                        </div>
                    </motion.div>

                    {/* Right: Asymmetric Arch Photo Panel */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ duration: 1.3, delay: 0.2 }} 
                        className="lg:col-span-5 order-1 lg:order-2"
                    >
                        <div className="relative mx-auto aspect-[4/5] max-w-sm lg:max-w-none rounded-t-full rounded-b-3xl overflow-hidden border-[10px] border-white shadow-[0_30px_90px_rgba(155,122,94,0.14)] p-1 bg-white">
                            <div className="w-full h-full rounded-t-full rounded-b-2xl overflow-hidden relative">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 500px"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            <TemplateSectionDivider template="luxury" motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="luxury" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="luxury" motifColor={motifColor} />
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
            <TemplateSectionDivider template="luxury" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="luxury" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="luxury" motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

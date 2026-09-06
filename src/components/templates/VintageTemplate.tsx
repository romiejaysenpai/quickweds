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
    TemplateMonogram,
    TemplateSectionDivider,
} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';
import { SharedNewSections } from './shared';

export default function VintageTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#A67C52';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const year = new Date(wedding.wedding_date).getFullYear();

    return (
        <div className="bg-[#fbf7ee] text-[#524439] font-serif relative pb-24 selection:bg-[#A67C52]/20">
            {/* Antique Parchment Texture & Subtle Vignette */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />
            <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(82,68,57,0.06)]" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative max-w-5xl w-full bg-[#fffcf5] border-2 border-[#524439]/25 shadow-[0_30px_90px_rgba(82,68,57,0.12)] p-6 sm:p-12 md:p-16 rounded-sm"
                >
                    {/* Double Thin Inset Border */}
                    <div className="absolute inset-2 sm:inset-4 border border-[#524439]/20 pointer-events-none" />

                    {/* Top Postcard Bar: Postmark Stamp & Cancellation Lines */}
                    <div className="flex justify-between items-start mb-8 sm:mb-12 relative z-10 border-b border-[#524439]/15 pb-6">
                        <div className="text-left">
                            <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.4em] font-mono font-bold text-[#8c7462] block mb-1">
                                POSTCARD KEEPSAKE • AIR MAIL
                            </span>
                            <span className="font-serif italic text-xs sm:text-sm text-[#524439]/70">
                                Special Delivery for Family &amp; Friends
                            </span>
                        </div>

                        {/* Vintage Postage Stamp with Postmark */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden sm:block text-right text-[10px] font-mono text-[#8c7462] leading-tight">
                                <p>POSTAGE PAID</p>
                                <p>{year}</p>
                            </div>
                            <div className="w-16 h-20 sm:w-20 sm:h-24 border-2 border-dashed border-[#8c7462] bg-[#fbf5e6] p-1 shadow-sm flex flex-col items-center justify-center text-center rotate-3 relative overflow-hidden">
                                {wedding.logo_initials ? (
                                    <TemplateMonogram wedding={wedding} defaultShape="oval" size="sm" />
                                ) : (
                                    <>
                                        <span className="text-[9px] font-mono uppercase tracking-widest text-[#8c7462]">LOVE</span>
                                        <span className="text-xl sm:text-2xl font-serif" style={{ color: motifColor }}>❦</span>
                                        <span className="text-[8px] font-mono text-[#8c7462]">{year}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Postcard Content: Left Image / Right Invitation */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
                        <div className="md:col-span-5 order-2 md:order-1">
                            <div className="aspect-[4/5] relative rounded-sm p-3 bg-white border border-[#524439]/20 shadow-md rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                                <div className="w-full h-full relative overflow-hidden bg-[#524439]/5">
                                    <Image
                                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                        priority
                                        fill
                                        sizes="(max-width: 768px) 100vw, 400px"
                                        className="object-cover sepia-[0.22] contrast-[1.05]"
                                    />
                                </div>
                                <div className="text-center pt-2 pb-1">
                                    <p className="text-[10px] font-mono tracking-widest text-[#8c7462] uppercase">
                                        {wedding.venue_name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-7 text-center md:text-left order-1 md:order-2 space-y-6">
                            <p className="text-xs uppercase tracking-[0.45em] font-medium text-[#8c7462]">
                                Request the Pleasure of Your Company
                            </p>

                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-[#382d25] leading-none">
                                {wedding.bride_name}
                                <span className="block text-2xl sm:text-3xl italic font-light my-2 text-[#8c7462]">
                                    &amp;
                                </span>
                                {wedding.groom_name}
                            </h1>

                            <div className="border-y border-[#524439]/20 py-4 font-serif">
                                <p className="text-xl sm:text-2xl tracking-[0.1em] text-[#382d25]">
                                    {formattedDate}
                                </p>
                                <p className="text-sm sm:text-base italic text-[#8c7462] mt-1">
                                    {wedding.venue_name} {wedding.venue_address ? `• ${wedding.venue_address}` : ''}
                                </p>
                            </div>

                            {wedding.quote && (
                                <div className="border-l-2 border-[#8c7462] pl-3 py-1 text-xs sm:text-sm italic text-[#524439]/90 max-w-md bg-[#fbf7ee]/60 rounded-r">
                                    &ldquo;{wedding.quote}&rdquo;
                                </div>
                            )}

                            <p className="text-sm sm:text-base italic leading-relaxed text-[#615246] max-w-md">
                                {wedding.story || 'Two hearts, one journey. Join us as we exchange vows and begin our new chapter together.'}
                            </p>

                            <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                                <a
                                    href="#rsvp"
                                    aria-label="RSVP"
                                    className="px-10 py-3.5 inline-flex items-center justify-center uppercase tracking-[0.25em] text-xs font-bold bg-[#4a3a31] text-[#fffcf5] rounded-sm hover:bg-[#332720] transition-all shadow-md min-h-[46px]"
                                >
                                    Kindly RSVP
                                </a>
                                <a
                                    href="#details"
                                    className="px-8 py-3.5 inline-flex items-center justify-center uppercase tracking-[0.2em] text-xs font-medium border border-[#524439]/40 text-[#4a3a31] rounded-sm hover:bg-[#524439]/5 transition-all min-h-[46px]"
                                >
                                    Wedding Details
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="vintage" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="vintage" motifColor={motifColor} />
            <DetailsSection id="details" wedding={wedding} />
            {!wedding.is_thank_you_mode && (
                <CountdownTimer id="countdown"
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
            <TemplateSectionDivider template="vintage" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="vintage" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

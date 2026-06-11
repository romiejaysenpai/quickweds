'use client';

import { motion } from 'framer-motion';

import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    TimelineSection,
    VideoSection,
} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';

import { SharedNewSections } from './shared';

export default function VintageTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    return (
        <div className="bg-[#fdfbf6] text-[#5d544b] font-serif relative pb-24">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />
            <section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative overflow-hidden">
                <div className="absolute inset-8 border-[0.5px] border-[#5d544b]/20 pointer-events-none rounded-[2rem]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <p className="uppercase tracking-[0.4em] text-xs font-bold mb-8 sm:mb-10 md:mb-12 opacity-40">
                        Together with their families
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-9xl mb-8 sm:mb-10 md:mb-12 text-[#433c35] drop-shadow-sm">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic font-light opacity-30 my-4 sm:my-5 md:my-6 block">
                            &
                        </span>
                        {wedding.groom_name}
                    </h1>
                    <div className="inline-block border-y border-[#5d544b]/20 py-6 sm:py-7 md:py-8 px-12 sm:px-14 md:px-16 bg-white/30 backdrop-blur-sm rounded-lg">
                        <p className="text-lg sm:text-lg md:text-lg tracking-widest lowercase font-light italic mb-1 sm:mb-2">
                            at the sunset of
                        </p>
                        <p className="text-2xl sm:text-2xl md:text-3xl uppercase tracking-[0.2em] font-bold">
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
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
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

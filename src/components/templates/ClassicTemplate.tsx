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

export default function ClassicTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    return (
        <>
            <section className="h-screen relative flex items-center justify-center overflow-hidden">
                <img
                    src={wedding.hero_image || wedding.couple_photo}
                    className="absolute inset-0 w-full h-full object-cover brightness-75 scale-105"
                    alt="Wedding Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative text-center text-white z-10 px-4 sm:px-6"
                >
                    <span className="text-xs uppercase tracking-[0.4em] font-bold mb-4 sm:mb-5 md:mb-6 block opacity-80">
                        The Wedding of
                    </span>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-9xl font-serif mb-6 sm:mb-7 md:mb-8 leading-tight">
                        {wedding.bride_name} <br />
                        <span className="text-lg sm:text-2xl md:text-4xl italic font-light serif text-primary-light">
                            &
                        </span>{' '}
                        <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-8 sm:w-10 md:w-12 h-[1px] bg-white/40 mx-auto mb-6 sm:mb-7 md:mb-8" />
                    <p className="text-lg sm:text-xl md:text-2xl font-serif italic tracking-wide">
                        {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                </motion.div>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 bg-white/40" />
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            {!wedding.is_thank_you_mode && !isExpired && (
                <CountdownTimer
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                />
            )}
            <TimelineSection timeline={wedding.program_timeline || ''} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </>
    );
}

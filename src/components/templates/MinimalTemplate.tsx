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

export default function MinimalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    return (
        <div className="bg-white text-neutral-800 pb-24">
            <section className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 md:px-24 py-12 sm:py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                <div className="max-w-4xl text-center space-y-8 sm:space-y-10 md:space-y-12 z-10">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                        <p className="text-xs uppercase tracking-[0.5em] font-medium text-neutral-400 mb-6 sm:mb-8">
                            Save the Date
                        </p>
                        <h1 className="text-3xl sm:text-4xl md:text-8xl font-serif leading-tight text-neutral-900 mb-8 sm:mb-10 md:mb-12">
                            {wedding.bride_name} <br />
                            <span className="font-light italic serif text-neutral-300 ml-0 sm:ml-2 md:ml-4">
                                &
                            </span>{' '}
                            <br />
                            {wedding.groom_name}
                        </h1>
                        <div className="w-12 sm:w-14 md:w-16 h-[1px] bg-neutral-200 mx-auto mb-8 sm:mb-10 md:mb-12" />
                        <p className="text-lg sm:text-lg md:text-xl font-light tracking-widest uppercase text-neutral-500">
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </motion.div>
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
        </div>
    );
}

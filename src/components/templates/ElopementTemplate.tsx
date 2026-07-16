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
    GiftSection
} from '../wedding';
import { SharedNewSections } from './shared';

export default function ElopementTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-neutral text-stone-700 font-serif relative pb-24 selection:bg-stone-200">
            <section className="min-h-screen py-20 flex items-center justify-center relative overflow-hidden bg-white">
                <div className="absolute inset-0 opacity-50 mix-blend-multiply transition-opacity group-hover:opacity-70 z-0">
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-black/20" />

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="z-10 text-center max-w-2xl px-4 sm:px-6">
                    <span className="text-xs uppercase tracking-[0.6em] font-bold opacity-40 mb-8 block">Just The Two Of Us</span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif mb-8 text-stone-900 drop-shadow-[0_4px_10px_rgba(255,255,255,0.8)] leading-[0.9]">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="italic opacity-30 font-light">&</span> <br />
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <p className="text-xl sm:text-2xl italic opacity-60 mb-12">A quiet union, a loud devotion. We chose forever, just us two.</p>
                    <div className="flex gap-4 sm:gap-6 justify-center">
                        <a href="#rsvp" aria-label="See Our Story - RSVP" className="px-8 sm:px-10 py-3 min-h-[44px] flex items-center justify-center bg-stone-900 text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-stone-700 transition-colors">See Our Story</a>
                    </div>
                </motion.div>
            </section>

            <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
                <div className="space-y-12 sm:space-y-16 md:space-y-20 border-l border-stone-200 pl-8 sm:pl-10 md:pl-12 lg:pl-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">The Escape</h2>
                        <p className="text-lg sm:text-xl leading-relaxed italic">{wedding.story}</p>
                    </div>
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

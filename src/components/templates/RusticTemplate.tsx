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
    FAQSection
} from '../wedding';
import { SharedNewSections } from './shared';

export default function RusticTemplate({ wedding, gallery, isExpired }: any) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#f5ebe0] text-[#5e503f] font-serif relative pb-24 selection:bg-[#5e503f] selection:text-[#f5ebe0]">
            <div className="fixed inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative py-20">
                <div className="absolute inset-4 sm:inset-6 border-[2px] border-[#5e503f]/30 pointer-events-none rounded-lg" />
                <div className="absolute inset-7 sm:inset-9 border border-[#5e503f]/15 pointer-events-none rounded-lg" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center max-w-4xl z-10 space-y-6"
                >
                    <div className="w-16 h-16 mx-auto opacity-50 text-[#5e503f]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </div>

                    <p className="text-xs uppercase tracking-[0.45em] font-sans font-bold text-[#7f6c57]">
                        We&apos;re Getting Married
                    </p>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-[#7a6754] drop-shadow-sm leading-tight">
                        {wedding.bride_name.split(' ')[0]} &amp; {wedding.groom_name.split(' ')[0]}
                    </h1>

                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 border-y border-[#5e503f]/25 py-4 px-8 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm font-serif">
                        <span className="text-lg sm:text-xl font-bold">{formattedDate}</span>
                        <span className="w-2 h-2 rounded-full bg-[#5e503f]/40 hidden sm:block" />
                        <span className="text-lg sm:text-xl">{wedding.venue_name}</span>
                    </div>

                    <div className="pt-6">
                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="px-10 py-4 inline-flex items-center justify-center bg-[#5e503f] text-[#f5ebe0] rounded-lg font-sans font-bold tracking-[0.25em] uppercase hover:bg-[#493e31] transition-all shadow-lg text-xs"
                        >
                            RSVP
                        </a>
                    </div>
                </motion.div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-white/50">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, rotate: 2 }}
                        whileInView={{ opacity: 1, rotate: -1 }}
                        viewport={{ once: true }}
                        className="aspect-square relative p-4 bg-white shadow-2xl border border-stone-200 rounded-sm"
                    >
                        <Image
                            src={wedding.couple_photo || wedding.hero_image || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover sepia-[0.2]"
                        />
                    </motion.div>
                    <div className="space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#7a6754]">Our Rustic Romance</h2>
                        <p className="text-lg leading-relaxed opacity-85">{wedding.story || 'A simple, beautiful journey surrounded by nature, love, and warm hearts.'}</p>
                    </div>
                </div>
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

            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

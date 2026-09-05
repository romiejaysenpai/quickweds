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

export default function SakuraTemplate({ wedding, gallery, isExpired }: any) {
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-[#fff0f5] text-[#8e405a] relative font-serif pb-24 selection:bg-[#ffb7c5] selection:text-white">
            {/* Sakura Petal Background Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-200/40 via-transparent to-pink-50" />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
                <div className="w-72 h-72 bg-gradient-to-br from-pink-300/30 to-transparent rounded-full absolute -top-24 -left-24 blur-3xl pointer-events-none" />
                <div className="w-64 h-64 bg-gradient-to-tl from-rose-200/40 to-transparent rounded-full absolute bottom-0 right-0 blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 bg-white/70 backdrop-blur-md p-8 sm:p-14 md:p-20 rounded-[3.5rem] border border-white/80 max-w-4xl shadow-[0_20px_70px_rgba(255,183,197,0.3)] space-y-6"
                >
                    <div className="text-3xl opacity-80">🌸</div>

                    <p className="font-serif italic text-lg sm:text-xl text-[#8e405a]/70">
                        Spring Blossom Union
                    </p>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-[#8e405a] leading-none">
                        {wedding.bride_name}
                        <span className="block text-xl sm:text-2xl font-sans font-light uppercase tracking-widest text-[#8e405a]/50 my-3">and</span>
                        {wedding.groom_name}
                    </h1>

                    <div className="inline-block border-y border-[#8e405a]/25 py-3 px-8 my-4">
                        <p className="font-sans text-xs uppercase tracking-[0.35em] text-[#8e405a] font-bold">
                            {formattedDate} • {wedding.venue_name}
                        </p>
                    </div>

                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto relative">
                        <Image
                            src={wedding.couple_photo || wedding.hero_image || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            priority
                            fill
                            sizes="200px"
                            className="object-cover"
                        />
                    </div>

                    <div className="pt-4">
                        <a
                            href="#rsvp"
                            aria-label="RSVP"
                            className="px-10 py-4 inline-flex items-center justify-center bg-gradient-to-r from-[#ffb7c5] to-[#ff9eb0] text-white rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:brightness-105 transition-all shadow-lg shadow-pink-200/80"
                        >
                            Join Our Celebration
                        </a>
                    </div>
                </motion.div>
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

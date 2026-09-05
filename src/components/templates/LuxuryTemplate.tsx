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

export default function LuxuryTemplate({ wedding, gallery, isExpired }: any) {
    if (wedding.template_style === 'luxury-planner') {
        return (
            <div className="bg-[#fbf7ef] text-[#2b2520] font-serif selection:bg-[#b9975b] selection:text-white pb-24">
                <section className="relative min-h-screen overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(185,151,91,0.10)_1px,transparent_1px),linear-gradient(rgba(185,151,91,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
                    <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="order-2 lg:order-1 backdrop-blur-md bg-white/40 p-8 lg:p-12 rounded-3xl border border-white/50 shadow-xl"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#b9975b]">
                                Planners of a beautiful day
                            </p>
                            <h1 className="mt-8 text-5xl leading-[0.92] text-[#241f1b] sm:text-6xl md:text-7xl lg:text-8xl">
                                {wedding.bride_name}
                                <span className="block text-[0.55em] italic leading-none text-[#b9975b]">&</span>
                                {wedding.groom_name}
                            </h1>
                            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.24em] text-[#6f645b]">
                                <span>{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span className="h-px w-12 bg-[#b9975b]" />
                                <span>{wedding.venue_name}</span>
                            </div>
                            <p className="mt-8 max-w-xl text-lg leading-8 text-[#6f645b]">
                                {wedding.story || 'An elegant celebration shaped with intention, beauty, and every thoughtful detail in place.'}
                            </p>
                            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                                <a href="#rsvp" aria-label="RSVP" className="inline-flex min-h-[48px] items-center justify-center bg-[#2b2520] px-8 text-xs font-bold uppercase tracking-[0.28em] text-white transition-all hover:bg-[#b9975b]">
                                    RSVP
                                </a>
                                <a href="#details" className="inline-flex min-h-[48px] items-center justify-center border border-[#b9975b]/50 px-8 text-xs font-bold uppercase tracking-[0.28em] text-[#2b2520] transition-all hover:border-[#2b2520]">
                                    Details
                                </a>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2 }}
                            className="order-1 lg:order-2"
                        >
                            <div className="relative mx-auto aspect-[4/5] max-h-[760px] overflow-hidden border border-[#b9975b]/25 bg-white p-3 shadow-[0_40px_120px_rgba(43,37,32,0.16)]">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                                <div className="absolute -bottom-px -left-px bg-[#fbf7ef] px-6 py-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b9975b]">Est. {new Date(wedding.wedding_date).getFullYear()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
                <BioSection id="bio" wedding={wedding} />
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
                <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
                <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
                <AttireSection wedding={wedding} />
                <FAQSection wedding={wedding} />
                <GiftSection id="gift" wedding={wedding} />
                <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a] text-[#C5A059] font-serif selection:bg-[#C5A059] selection:text-black pb-24">
            <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(#C5A059 1px, transparent 1px), linear-gradient(90deg, #C5A059 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />

            <section className="min-h-screen grid grid-cols-1 md:grid-cols-12 relative overflow-hidden">
                <div className="md:col-span-5 flex flex-col justify-center px-4 sm:px-6 md:px-16 py-12 sm:py-16 md:py-24 bg-black z-10 border-r border-[#C5A059]/10">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5 }}>
                        <div className="w-16 h-[2px] bg-[#C5A059] mb-12" />
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-white uppercase tracking-tighter mb-8 leading-none">
                            {wedding.bride_name} <br />
                            <span className="text-[#C5A059]">&</span> <br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-serif italic mb-12 sm:mb-16 md:mb-20 max-w-sm text-[#C5A059]/60">
                            A celebration of rare elegance and timeless devotion.
                        </p>
                        <a href="#rsvp" aria-label="Request Presence - RSVP" className="px-10 py-5 bg-[#C5A059] text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-[0_20px_50px_rgba(197,160,89,0.3)]">Request Presence</a>
                    </motion.div>
                </div>
                <div className="md:col-span-7 h-[50vh] md:h-full relative overflow-hidden group z-0">
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover grayscale brightness-50 group-hover:scale-110 transition-transform duration-[10s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden md:block" />
                    <div className="absolute top-12 right-12 text-right">
                        <p className="text-white text-7xl font-light opacity-20">{new Date(wedding.wedding_date).getFullYear()}</p>
                    </div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} invert />
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

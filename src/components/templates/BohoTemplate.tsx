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
import { derivePalette, getTypography } from '@/lib/theme-engine';

export default function BohoTemplate({ wedding, gallery, isExpired }: any) {
    const motifColor = wedding.motif_color || '#8b4513';
    const palette = derivePalette(motifColor);
    const typography = getTypography('boho');

    return (
        <div className="bg-[#fcf8f1] text-[#5d2e0a] font-serif relative pb-24 selection:bg-[#8b4513]/20 overflow-x-hidden">
            {/* Organic Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            {/* Floating Organic Elements (Decorative) */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="fixed -top-24 -left-24 w-96 h-96 border border-[#8b4513]/5 rounded-full pointer-events-none"
            />

            <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative py-20">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Hero Text Content */}
                    <div className="lg:col-span-7 z-10 text-center lg:text-left order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.8em] font-black opacity-40 mb-6 block">WILD & FREE LOVE</span>

                            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] mb-8 leading-[0.85] text-[#5d2e0a] italic font-serif">
                                {wedding.bride_name.split(' ')[0]}
                                <span className="block text-3xl sm:text-4xl lg:text-5xl font-light not-italic opacity-20 my-4 lg:my-0 lg:ml-20 tracking-tighter">&</span>
                                <span className="lg:ml-32 block">{wedding.groom_name.split(' ')[0]}</span>
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-6 mt-12 lg:mt-16 items-center lg:items-start">
                                <motion.a
                                    href="#rsvp"
                                    aria-label="Join The Adventure - RSVP"
                                    whileHover={{ scale: 1.05, rotate: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-12 py-5 bg-[#8b4513] text-[#fcf8f1] rounded-full font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-[#8b4513]/20 transition-all hover:bg-[#5d2e0a]"
                                >
                                    Join The Adventure
                                </motion.a>
                                <div className="text-center lg:text-left">
                                    <p className="text-sm uppercase tracking-widest opacity-60 font-bold">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">{wedding.venue_name}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image / Frame */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="relative group"
                        >
                            {/* Decorative Frame Overlays */}
                            <div className="absolute -inset-4 border border-[#8b4513]/10 rounded-[4rem] group-hover:rotate-3 transition-transform duration-1000" />
                            <div className="absolute -inset-8 border border-[#8b4513]/5 rounded-[5rem] group-hover:-rotate-3 transition-transform duration-1000 delay-75" />

                            <div className="aspect-[4/5] w-full rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-2xl relative z-10 bg-[#8b4513]/10">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-[5s]"
                                />
                                <div className="absolute inset-0 bg-[#8b4513]/10 mix-blend-multiply opacity-30 group-hover:opacity-0 transition-opacity duration-1000 z-10 pointer-events-none" />
                            </div>

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="hidden md:flex absolute -bottom-6 -right-6 w-32 h-32 bg-[#5d2e0a] rounded-full items-center justify-center text-[#fcf8f1] p-6 text-center z-20 shadow-2xl rotate-12"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-tighter leading-tight italic">Together Forever</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20"
                >
                    <div className="w-px h-20 bg-[#8b4513]" />
                </motion.div>
            </section>

            <section className="py-32 relative">
                {/* Background Text Anchor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black opacity-[0.02] pointer-events-none whitespace-nowrap">
                    OUR STORY
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl sm:text-6xl font-serif italic text-[#5d2e0a] mb-8">A Journey of Souls</h2>
                        <div className="w-24 h-[1px] bg-[#8b4513]/20 mx-auto mb-10" />
                        <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed text-[#8b4513]/80 italic max-w-3xl mx-auto">
                            &quot;{wedding.story || 'A tale of two souls becoming one, captured in a beauty that never fades.'}&quot;
                        </p>
                        <div className="w-24 h-[1px] bg-[#8b4513]/20 mx-auto mt-10" />
                    </motion.div>
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
            <GallerySection id="gallery" gallery={gallery} template="boho" motifColor={motifColor} galleryLayout={wedding.gallery_layout} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

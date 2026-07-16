'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Quote } from 'lucide-react';
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

export default function UrbanTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#111] text-white selection:bg-primary/50 font-sans">
            {/* Industrial Grid Mesh */}
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            <section className="min-h-screen py-20 flex bg-black relative group">
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0 overflow-hidden"
                >
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt="Hero"
                        priority
                        fill
                        sizes="100vw"
                        className="object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-[10s]"
                    />
                </motion.div>
                <div className="z-10 px-4 sm:px-6 md:px-12 lg:px-32 py-12 sm:py-16 md:py-24 lg:py-32 flex flex-col justify-between w-full relative">
                    <div className="flex justify-between items-start border-b border-white/10 pb-6 sm:pb-8 md:pb-12 lg:pb-12">
                        <div className="space-y-2">
                            <p className="font-mono text-xs uppercase tracking-[0.5em] text-primary">Access Level: VIP</p>
                            <p className="font-mono text-xs uppercase tracking-widest opacity-40">Serial No. {wedding.id.slice(0, 8)}</p>
                        </div>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                            <Heart className="w-8 sm:w-10 md:w-12 lg:w-12 h-8 sm:h-10 md:h-12 lg:h-12 text-primary" />
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
                        <h1 className="text-3xl sm:text-4xl md:text-8xl lg:text-[15vw] font-black uppercase leading-[0.75] mb-8 sm:mb-10 md:mb-12 lg:mb-12 tracking-tighter mix-blend-difference drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            {wedding.bride_name.split(' ')[0]}<br />
                            <span className="text-primary">+</span><br />
                            {wedding.groom_name.split(' ')[0]}
                        </h1>
                        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 font-mono text-xs sm:text-sm md:text-sm lg:text-sm uppercase tracking-[0.3em] bg-black/50 backdrop-blur-md p-4 sm:p-5 md:p-6 lg:p-6 border-l-4 border-primary inline-flex">
                            <p>[ DATE: {new Date(wedding.wedding_date).toLocaleDateString()} ]</p>
                            <p>[ LOG: {wedding.venue_name} ]</p>
                        </div>
                    </motion.div>

                    <div className="flex justify-end">
                        <a href="#rsvp" aria-label="Enter Event - RSVP" className="text-primary hover:text-white transition-all text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter hover:tracking-widest duration-500 min-h-[44px] flex items-center">
                            ENTER EVENT →
                        </a>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 md:py-32 lg:py-32 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-24 items-end">
                    <div className="flex-1 space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter text-white/10">THE MISSION</h2>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-mono uppercase tracking-tighter leading-tight">
                            {wedding.story || "A tale of two souls becoming one, captured in the heart of the city."}
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 lg:p-12 bg-primary/10 border border-primary/20 backdrop-blur-xl">
                        <Quote className="w-8 sm:w-10 md:w-12 lg:w-12 h-8 sm:h-10 md:h-12 lg:h-12 text-primary mb-6 sm:mb-7 md:mb-8 lg:mb-8" />
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-mono uppercase italic leading-relaxed opacity-80">
                            {wedding.quote || "Love is the ultimate disruptor."}
                        </p>
                    </div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <div className="px-4 sm:px-6 md:px-12 lg:px-32 py-12 sm:py-16 md:py-24 lg:py-32"><DetailsSection id="details" wedding={wedding} invert /></div>
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
            <GiftSection id="gift" wedding={wedding} invert />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

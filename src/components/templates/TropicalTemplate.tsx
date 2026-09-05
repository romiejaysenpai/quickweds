'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Camera } from 'lucide-react';
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

export default function TropicalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#e0f2f1] text-[#00695c] relative pb-24 font-serif">
            {/* Sun Glow Overlay - Responsive sizing */}
            <div className="fixed top-0 right-0 w-40 sm:w-56 md:w-72 lg:w-96 h-40 sm:h-56 md:h-72 lg:h-96 bg-yellow-100/30 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none -z-0" />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center relative overflow-hidden group">
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-32 sm:w-48 md:w-64 lg:w-96 h-32 sm:h-48 md:h-64 lg:h-96 opacity-20 pointer-events-none"
                >
                    <svg viewBox="0 0 200 200" className="fill-current"><path d="M100 0 C120 40 160 80 200 100 C160 120 120 160 100 200 C80 160 40 120 0 100 C40 80 80 40 100 0" /></svg>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="text-center z-10 px-4 sm:px-6">
                    <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 sm:mb-10 md:mb-12 lg:mb-12 animate-float">🏝️</div>
                    <span className="text-xs uppercase tracking-[1em] font-black mb-8 block opacity-40">OUR PARADISE FOUND</span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl lg:text-[14vw] font-serif mb-8 sm:mb-10 md:mb-12 lg:mb-12 tracking-tighter leading-[0.7] text-[#004d40]">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="text-2xl sm:text-3xl md:text-4xl align-middle italic text-primary">&</span> <br />
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="p-1 px-6 sm:px-8 md:px-12 lg:px-12 border-4 border-[#00695c] inline-block mb-8 sm:mb-10 md:mb-16 lg:mb-16 relative group-hover:bg-[#00695c] group-hover:text-white transition-all duration-500">
                        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-serif py-2 sm:py-3 md:py-4 lg:py-4">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <br />
                    <motion.a
                        whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,105,92,0.2)" }}
                        href="#rsvp"
                        aria-label="Pack Your Bags - RSVP"
                        className="px-8 sm:px-12 md:px-20 lg:px-20 py-3 sm:py-4 md:py-6 lg:py-6 min-h-[44px] flex items-center justify-center bg-[#00695c] text-white rounded-full font-black tracking-widest uppercase text-xs w-max mx-auto"
                    >
                        Pack Your Bags
                    </motion.a>
                </motion.div>

                {/* Wave Bottom Decoration */}
                <motion.div
                    animate={{ x: ["0%", "-5%", "0%"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 w-[110%] overflow-hidden leading-none opacity-20"
                >
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 sm:h-24 md:h-32 lg:h-32 fill-[#00695c]"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" /></svg>
                </motion.div>
            </section>

            <section className="py-16 sm:py-24 md:py-32 lg:py-32 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-24 items-center">
                    <div className="w-full md:w-1/2 relative aspect-[4/5]">
                        <div className="absolute -inset-4 border-2 border-[#00695c]/20 rounded-[4rem] rotate-3 -z-10" />
                        <Image
                            src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            priority
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover rounded-[3.5rem] soft-shadow"
                        />
                    </div>
                    <div className="w-full md:w-1/2 space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-12">
                        <Camera className="w-12 sm:w-14 md:w-16 lg:w-16 h-12 sm:h-14 md:h-16 lg:h-16 text-primary" />
                        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-[#004d40] tracking-tighter">Sun, Sand & <br />Our Love</h2>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-serif leading-relaxed text-[#00695c]/80 italic border-l-4 border-primary pl-4 sm:pl-6 md:pl-12 lg:pl-12">
                            {wedding.story || "A tale of two souls becoming one, captured in a lifetime of beautiful moments."}
                        </p>
                    </div>
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

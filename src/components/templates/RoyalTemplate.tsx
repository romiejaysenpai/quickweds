'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { MonogramMark } from '../MonogramMark';
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

export default function RoyalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#121212] text-[#f2d0a4] relative overflow-hidden min-h-screen font-serif">
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-deco-texture)' }} />

            <section className="min-h-screen py-20 relative overflow-hidden flex items-center justify-center border-b border-primary/20">
                {wedding.teaser_video ? (
                    <video src={wedding.teaser_video} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125" autoPlay muted loop />
                ) : (
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        priority
                        fill
                        sizes="100vw"
                        className="object-cover opacity-20 grayscale brightness-50 z-0"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]" />

                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="z-10 text-center max-w-6xl px-4 sm:px-6 md:px-8 lg:px-8 py-6 sm:py-12 md:py-16 lg:py-24 border-[4px] border-primary/20 m-4 sm:m-6 md:m-8 lg:m-12 bg-black/40 backdrop-blur-sm relative"
                >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#121212] rounded-full border border-primary/20 flex items-center justify-center overflow-hidden">
                        {wedding.logo_initials ? (
                            <MonogramMark
                                initials={wedding.logo_initials}
                                brideName={wedding.bride_name}
                                groomName={wedding.groom_name}
                                shape={wedding.logo_shape || 'crest'}
                                animation={wedding.is_premium ? wedding.logo_animation : 'none'}
                                color={wedding.logo_color || wedding.motif_color}
                                motifColor={wedding.motif_color}
                                fontFamily={`var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})`}
                                size="sm"
                                inverted
                            />
                        ) : (
                            <Heart className="w-12 h-12 text-primary fill-primary" />
                        )}
                    </div>

                    <span className="text-xs uppercase tracking-[1em] font-black opacity-60 mb-12 block">BY ROYAL PROCLAMATION</span>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[8rem] font-serif border-y-2 border-primary/40 py-8 sm:py-12 md:py-16 lg:py-16 mb-8 sm:mb-12 md:mb-16 lg:mb-16 leading-tight tracking-[0.05em] uppercase">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic normal-case block my-4 sm:my-8 md:my-12 lg:my-12 tracking-widest">and</span>
                        {wedding.groom_name}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl font-serif italic mb-8 sm:mb-10 md:mb-12 lg:mb-12 max-w-3xl mx-auto opacity-80">His Majesty & Her Royal Highness cordially invite you to witness the union of two royal houses</p>
                    <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center justify-center mb-8 sm:mb-12 md:mb-16 lg:mb-16">
                        <div className="w-24 h-[1px] bg-primary/40" />
                        <p className="text-sm uppercase tracking-[1em] font-black">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="w-24 h-[1px] bg-primary/40" />
                    </div>
                </motion.div>

                {/* RSVP CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
                >
                    <a href="#rsvp" aria-label="Attend Royal Celebration - RSVP" className="inline-flex min-h-[48px] items-center justify-center px-10 py-4 border-2 border-[#f2d0a4]/50 text-[#f2d0a4] font-bold uppercase tracking-[0.3em] text-xs hover:bg-[#f2d0a4] hover:text-[#121212] transition-all">
                        Attend Celebration
                    </a>
                </motion.div>
            </section>

            <div className="relative z-10 scale-90 md:scale-100 origin-center bg-[#1a1a1a] shadow-[0_0_100px_rgba(0,0,0,1)] pt-24">
                <div className="text-center mb-24">
                    <h2 className="text-5xl font-serif text-primary uppercase tracking-[0.3em] mb-4">Official Bio</h2>
                    <div className="w-24 h-[1px] bg-primary mx-auto" />
                </div>
                <BioSection id="bio" wedding={wedding} />
                <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
                <div className="relative z-10 bg-[#121212] pt-24"><DetailsSection id="details" wedding={wedding} invert /></div>
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
                <AttireSection wedding={wedding} />
                <FAQSection wedding={wedding} />
                <GiftSection id="gift" wedding={wedding} invert />
                <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
            </div>
        </div>
    );
}

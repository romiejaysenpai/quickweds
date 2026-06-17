'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
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

export default function RomanticTemplate({ wedding, gallery, isExpired }: any) {
    if (wedding.template_style === 'romantic-estate') {
        return (
            <div className="relative bg-[#fff8f5] pb-24 font-serif text-[#55373b] selection:bg-[#b97983]/20">
                <section className="relative min-h-screen overflow-hidden px-5 py-12">
                    <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(185,121,131,0.20),transparent_62%)]" />
                    <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="text-center lg:text-left"
                        >
                            <Heart className="mx-auto mb-8 h-10 w-10 fill-[#b97983] text-[#b97983] lg:mx-0" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#b97983]">Romantic estate celebration</p>
                            <h1 className="mt-8 text-5xl leading-[0.95] text-[#55373b] sm:text-6xl md:text-7xl">
                                {wedding.bride_name}
                                <span className="block text-[0.55em] font-light italic text-[#b97983]">&</span>
                                {wedding.groom_name}
                            </h1>
                            <p className="mx-auto mt-8 max-w-lg text-lg italic leading-8 text-[#816066] lg:mx-0">
                                {wedding.quote || 'Cordially invited to a tender evening of vows, dinner, and dancing.'}
                            </p>
                            <a href="#rsvp" className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#b97983] px-8 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-[0_18px_45px_rgba(185,121,131,0.25)] transition-all hover:bg-[#55373b]">
                                RSVP
                            </a>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.1 }}
                            className="relative"
                        >
                            <div className="mx-auto aspect-[5/6] max-h-[740px] overflow-hidden rounded-t-full border border-[#b97983]/25 bg-white p-3 shadow-[0_35px_100px_rgba(85,55,59,0.14)]">
                                <img
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    loading="eager"
                                    decoding="async"
                                    className="h-full w-full rounded-t-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-5 left-1/2 w-[82%] -translate-x-1/2 bg-white/88 px-6 py-5 text-center shadow-[0_20px_60px_rgba(85,55,59,0.12)] backdrop-blur">
                                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#b97983]">
                                    {new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="mt-1 text-sm text-[#816066]">{wedding.venue_name}</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="bg-white/45 px-6 py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-[#b97983]">The story of us</p>
                        <p className="mt-8 text-xl italic leading-9 text-[#55373b] md:text-2xl">
                            {wedding.story || 'A love story gathered in soft light, cherished details, and the people who made the journey beautiful.'}
                        </p>
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

    return (
        <div className="bg-[#fffafa] text-[#b03060] font-serif relative pb-24 selection:bg-[#b03060]/20">
            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden opacity-10 pointer-events-none z-0">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 30, repeat: Infinity }} className="absolute -top-20 -left-20 w-[600px] h-[600px] border-[40px] border-primary rounded-full filter blur-[100px]" />
            </div>

            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
                    <div className="mb-8 sm:mb-10 md:mb-12">
                        <Heart className="w-12 h-12 text-primary fill-primary mx-auto animate-pulse" />
                    </div>
                    <span className="text-xs uppercase tracking-[1em] font-bold opacity-30 mb-8 block">WE FALLING IN LOVE</span>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl mb-8 leading-tight drop-shadow-xl">
                        {wedding.bride_name} <br />
                        <span className="font-light italic text-primary/60">&</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="flex flex-col gap-6 sm:gap-8 items-center mt-8 sm:mt-12 md:mt-16">
                        <p className="text-xl sm:text-2xl italic opacity-60">Cordially invite you to witness our forever</p>
                        <div className="w-24 h-[1px] bg-primary/20" />
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            href="#rsvp"
                            className="text-lg font-serif italic border-b-2 border-primary pb-2 hover:opacity-50 transition-opacity"
                        >
                            Say Yes, We&apos;ll Be There
                        </motion.a>
                    </div>
                </motion.div>
            </section>

            <section className="py-24 bg-white/40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-12 sm:space-y-16">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl italic drop-shadow-sm">The Story of Us</h2>
                    <div className="relative">
                        <div className="absolute -left-12 -top-12 text-9xl opacity-5 italic font-serif">“</div>
                        <p className="text-lg sm:text-xl md:text-2xl leading-relaxed italic text-[#4A4444] opacity-80 z-10 relative">
                            {wedding.story || "A tale of two souls becoming one, captured in the heart of beauty."}
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

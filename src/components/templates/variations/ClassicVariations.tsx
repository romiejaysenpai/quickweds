'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    TimelineSection,
    VideoSection,
    AttireSection,
    FAQSection,
    TemplateMonogram,
    TemplateSectionDivider,
} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';
import { SharedNewSections } from '../shared';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7 },
    },
};

// ==========================================
// VARIATION 1: Timeless Grand Centered (V1)
// ==========================================
export function ClassicV1({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#C5A059';

    return (
        <div className="template-variation-v1">
            <section className="h-screen relative flex items-center justify-center overflow-hidden">
                {wedding.hero_image ? (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            priority
                            fill
                            sizes="100vw"
                            className="object-cover brightness-75 scale-105"
                        />
                    </div>
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{ backgroundColor: motifColor + '20' }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative text-center text-white z-10 px-4 sm:px-6"
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="mb-4 flex justify-center">
                            <TemplateMonogram wedding={wedding} defaultShape="circle" inverted size="sm" />
                        </motion.div>

                        <motion.span
                            variants={itemVariants}
                            className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-6 sm:mb-7 md:mb-8 block opacity-80"
                        >
                            The Wedding of
                        </motion.span>

                        <motion.h1
                            variants={itemVariants}
                            className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-serif mb-8 sm:mb-10 md:mb-12 leading-tight"
                        >
                            {wedding.bride_name} <br />
                            <span
                                className="text-xl sm:text-3xl md:text-5xl italic font-light serif"
                                style={{ color: motifColor }}
                            >
                                &
                            </span>{' '}
                            <br />
                            {wedding.groom_name}
                        </motion.h1>

                        <motion.div
                            variants={itemVariants}
                            className="w-12 sm:w-16 md:w-20 h-[1px] mx-auto mb-8 sm:mb-10 md:mb-12"
                            style={{ backgroundColor: motifColor }}
                        />

                        <motion.p
                            variants={itemVariants}
                            className="text-lg sm:text-xl md:text-2xl font-serif italic tracking-wide mb-8"
                        >
                            {new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </motion.p>

                        <motion.div variants={itemVariants}>
                            <a
                                href="#rsvp"
                                aria-label="Kindly Respond - RSVP"
                                className="inline-flex min-h-[44px] items-center justify-center px-10 py-3 rounded-full border border-white/50 bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-xs font-bold"
                            >
                                Kindly Respond
                            </a>
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="w-[1px] h-12 opacity-40" style={{ backgroundColor: motifColor }} />
                </motion.div>
            </section>

            {/* Standard Flow */}
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
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
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

// ==========================================
// VARIATION 2: Split-Screen Modern Editorial (V2)
// ==========================================
export function ClassicV2({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#8F394A';

    return (
        <div className="template-variation-v2 bg-[#F9F7F5] text-[#222]">
            {/* Split Screen Hero Layout */}
            <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
                <div className="relative h-[60vh] lg:h-auto min-h-[400px]">
                    <Image
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} & ${wedding.groom_name}`}
                        priority
                        fill
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                    <div className="absolute bottom-6 left-6 text-white lg:hidden">
                        <span className="text-xs uppercase tracking-[0.3em] font-semibold opacity-90 block">We Are Getting Married</span>
                        <h1 className="text-3xl font-serif mt-1">{wedding.bride_name} & {wedding.groom_name}</h1>
                    </div>
                </div>

                <div className="flex flex-col justify-center px-8 py-12 lg:px-16 xl:px-24 bg-[#F9F7F5]">
                    <TemplateMonogram wedding={wedding} defaultShape="editorial" size="sm" className="mb-4 justify-start" />
                    <span className="text-xs uppercase tracking-[0.4em] font-bold text-text-secondary mb-4 block" style={{ color: motifColor }}>
                        Save The Date
                    </span>
                    <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif tracking-tight leading-none text-foreground mb-6">
                        {wedding.bride_name} <br />
                        <span className="italic font-light text-3xl sm:text-5xl" style={{ color: motifColor }}>with</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: motifColor }} />
                    <p className="text-lg sm:text-xl font-sans tracking-wide text-foreground/80 mb-2">
                        {new Date(wedding.wedding_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm font-sans text-text-secondary uppercase tracking-widest mb-8">
                        {wedding.venue_name} • {wedding.venue_address || 'Ceremony Location'}
                    </p>

                    <div>
                        <a
                            href="#rsvp"
                            className="inline-flex min-h-[48px] items-center justify-center px-8 py-3.5 border-2 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-foreground hover:text-white"
                            style={{ borderColor: motifColor, color: motifColor }}
                        >
                            RSVP Now
                        </a>
                    </div>
                </div>
            </section>

            {/* Story-First Section Flow */}
            <BioSection id="bio" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout="carousel" />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v2" />
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

// ==========================================
// VARIATION 3: Floating Glass Romance (V3)
// ==========================================
export function ClassicV3({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#D9777F';
    const heroBg = wedding.hero_image || wedding.couple_photo;

    return (
        <div className="template-variation-v3 bg-gradient-to-b from-[#FFF0F3] via-[#FFF8F9] to-[#F8EDEB]">
            {/* Floating Glassmorphism Hero */}
            <section className="h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                {heroBg ? (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={heroBg}
                            alt={`${wedding.bride_name} & ${wedding.groom_name}`}
                            fill
                            priority
                            className="object-cover blur-sm brightness-90 scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                    </div>
                ) : (
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-200/50 via-pink-100/30 to-transparent">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D9777F]/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-300/10 rounded-full blur-2xl pointer-events-none" />
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-2xl w-full backdrop-blur-xl bg-white/40 border border-white/60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-[2.5rem] p-8 sm:p-12 text-center text-foreground"
                >
                    <TemplateMonogram wedding={wedding} defaultShape="oval" size="sm" className="mb-4" />
                    <span className="text-xs uppercase tracking-[0.4em] font-semibold text-primary/80 mb-3 block">
                        Together with their families
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-serif mb-4 leading-tight">
                        {wedding.bride_name} <br />
                        <span className="font-serif italic font-light text-2xl sm:text-4xl text-primary">&</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-12 h-1 bg-primary/40 rounded-full mx-auto mb-6" />
                    <p className="text-lg font-serif italic mb-2">
                        {new Date(wedding.wedding_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-text-secondary mb-8">
                        {wedding.venue_name}
                    </p>

                    <a
                        href="#rsvp"
                        className="inline-flex min-h-[48px] items-center justify-center px-10 py-3.5 rounded-full bg-gradient-to-r from-primary to-rose-400 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        Kindly RSVP
                    </a>
                </motion.div>
            </section>

            {/* Schedule & Venue Priority Flow */}
            <TemplateSectionDivider motifColor={motifColor} />
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
            <TemplateSectionDivider motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v3" />
            <TemplateSectionDivider motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout="polaroid" />
            <TemplateSectionDivider motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

// ==========================================
// VARIATION 4: Magazine Monogram Grid (V4)
// ==========================================
export function ClassicV4({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#9A5B64';
    const initials = `${wedding.bride_name?.[0] || 'I'} & ${wedding.groom_name?.[0] || 'J'}`;

    return (
        <div className="template-variation-v4 bg-white text-foreground">
            {/* Monogram Banner & Asymmetric Photo Grid Hero */}
            <section className="pt-12 pb-16 px-6 sm:px-12 max-w-7xl mx-auto border-b border-border/40">
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        {wedding.logo_initials ? (
                            <TemplateMonogram wedding={wedding} defaultShape="circle" size="md" />
                        ) : (
                            <span className="text-3xl font-serif tracking-widest border border-foreground/20 rounded-full px-6 py-2 inline-block">
                                {initials}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl sm:text-7xl font-serif uppercase tracking-tight leading-none mb-4">
                        {wedding.bride_name} <span className="font-light italic lowercase font-serif text-3xl sm:text-5xl text-primary">&</span> {wedding.groom_name}
                    </h1>
                    <p className="text-xs uppercase tracking-[0.4em] font-bold text-text-secondary">
                        {new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {wedding.venue_name}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[450px]">
                    <div className="relative h-full rounded-2xl overflow-hidden md:col-span-2">
                        <Image
                            src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                    <div className="relative h-full rounded-2xl overflow-hidden hidden md:block">
                        <Image
                            src={wedding.couple_photo || wedding.hero_image || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="#rsvp"
                        className="inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
                        style={{ borderColor: motifColor }}
                    >
                        Confirm Attendance <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

            {/* Media Showcase Priority Flow */}
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v4" />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout="magazine" />
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

// ==========================================
// VARIATION 5: Minimalist Couture (V5)
// ==========================================
export function ClassicV5({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#5A2A32';

    return (
        <div className="template-variation-v5 bg-[#FAF6F0] text-foreground">
            {/* Pure Typography Banner with Inline Countdown */}
            <section className="py-24 px-6 sm:px-12 text-center max-w-5xl mx-auto border-b border-border/30">
                <TemplateMonogram wedding={wedding} defaultShape="minimal" size="sm" className="mb-4" />
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-text-secondary block mb-4">
                    Official Wedding Announcement
                </span>
                <h1 className="text-5xl sm:text-8xl font-sans font-black uppercase tracking-tighter leading-none mb-6">
                    {wedding.bride_name} <br />
                    <span className="font-serif italic font-light text-4xl sm:text-6xl" style={{ color: motifColor }}>&</span> <br />
                    {wedding.groom_name}
                </h1>
                <div className="max-w-md mx-auto p-6 rounded-2xl bg-white shadow-sm border border-border/50 mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-1">
                        {new Date(wedding.wedding_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-text-secondary/80">{wedding.venue_name}</p>
                </div>

                <a
                    href="#rsvp"
                    className="inline-flex min-h-[48px] items-center justify-center px-10 py-3.5 rounded-2xl bg-foreground text-background font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                >
                    RSVP Response
                </a>
            </section>

            {/* RSVP First Priority Flow */}
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
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
            <DetailsSection id="details" wedding={wedding} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <BioSection id="bio" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout="minimal" />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v5" />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
        </div>
    );
}

/**
 * Main Dynamic Classic Variation Router
 */
export default function DynamicClassicTemplate(props: TemplateProps) {
    const styleKey = (props.wedding.template_style || 'v1').toLowerCase();

    if (styleKey.includes('v2') || styleKey === 'classic_v2') {
        return <ClassicV2 {...props} />;
    }
    if (styleKey.includes('v3') || styleKey === 'classic_v3') {
        return <ClassicV3 {...props} />;
    }
    if (styleKey.includes('v4') || styleKey === 'classic_v4') {
        return <ClassicV4 {...props} />;
    }
    if (styleKey.includes('v5') || styleKey === 'classic_v5') {
        return <ClassicV5 {...props} />;
    }

    return <ClassicV1 {...props} />;
}

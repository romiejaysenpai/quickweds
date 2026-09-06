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
    FAQSection,
    TemplateMonogram,
    TemplateSectionDivider
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function TraditionalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#8F6A45';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const hasPhoto = Boolean(wedding.hero_image || wedding.couple_photo);

    return (
        <div className="bg-[#fcfaf5] text-[#3d3128] font-serif relative pb-24 selection:bg-[#8F6A45]/20">
            {/* Subtle Parchment Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            <section className="min-h-screen py-16 sm:py-20 md:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Outer Ceremonial Double Border Frame */}
                <div className="absolute inset-4 sm:inset-8 md:inset-12 border-2 pointer-events-none rounded-sm" style={{ borderColor: `${motifColor}40` }} />
                <div className="absolute inset-6 sm:inset-10 md:inset-14 border pointer-events-none rounded-sm" style={{ borderColor: `${motifColor}25` }} />

                {/* Ornate Corner Brackets */}
                <div className="absolute top-4 sm:top-8 md:top-12 left-4 sm:left-8 md:left-12 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2" style={{ borderColor: motifColor }} />
                <div className="absolute top-4 sm:top-8 md:top-12 right-4 sm:right-8 md:right-12 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2" style={{ borderColor: motifColor }} />
                <div className="absolute bottom-4 sm:bottom-8 md:bottom-12 left-4 sm:left-8 md:left-12 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2" style={{ borderColor: motifColor }} />
                <div className="absolute bottom-4 sm:bottom-8 md:bottom-12 right-4 sm:right-8 md:right-12 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2" style={{ borderColor: motifColor }} />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
                    className="z-10 bg-white/90 backdrop-blur-md p-8 sm:p-12 md:p-16 lg:p-20 shadow-[0_25px_70px_rgba(61,49,40,0.08)] border max-w-4xl w-full rounded-sm"
                    style={{ borderColor: `${motifColor}30` }}
                >
                    {/* Ceremonial Insignia Header */}
                    <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                        <div className="h-px w-12 sm:w-20" style={{ backgroundColor: `${motifColor}50` }} />
                        <span className="text-[10px] sm:text-xs uppercase tracking-[0.45em] font-sans font-bold" style={{ color: motifColor }}>
                            In the Name of Love &amp; Tradition
                        </span>
                        <div className="h-px w-12 sm:w-20" style={{ backgroundColor: `${motifColor}50` }} />
                    </div>

                    <TemplateMonogram
                        wedding={wedding}
                        defaultShape="crest"
                        size="md"
                        color={motifColor}
                        motifColor={motifColor}
                        className="mx-auto mb-4"
                    />

                    <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#6b584a] mb-4 sm:mb-6">
                        Together with their families, cordially invite you to celebrate the marriage of
                    </p>

                    {/* Couple Photo Medallion (If available) */}
                    {hasPhoto && (
                        <div className="mx-auto my-6 sm:my-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 shadow-xl relative" style={{ backgroundColor: `${motifColor}25` }}>
                            <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-white">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="160px"
                                    className="object-cover sepia-[0.08]"
                                />
                            </div>
                        </div>
                    )}

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-[#2e241c] my-6 sm:my-8 leading-tight tracking-tight">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-3xl md:text-4xl italic font-light my-2 sm:my-3 block" style={{ color: motifColor }}>
                            &amp;
                        </span>
                        {wedding.groom_name}
                    </h1>

                    <div className="w-24 sm:w-32 h-px mx-auto my-6 sm:my-8" style={{ backgroundColor: `${motifColor}50` }} />

                    <div className="space-y-3 sm:space-y-4 font-serif">
                        <p className="text-lg sm:text-2xl tracking-[0.1em] font-medium text-[#2e241c]">
                            {formattedDate}
                        </p>
                        <p className="text-sm sm:text-lg italic text-[#6b584a] max-w-lg mx-auto">
                            {wedding.venue_name} {wedding.venue_address ? `• ${wedding.venue_address}` : ''}
                        </p>
                    </div>

                    {wedding.quote && (
                        <blockquote className="my-6 max-w-lg mx-auto border-y py-3 italic text-sm sm:text-base text-[#6b584a]" style={{ borderColor: `${motifColor}30` }}>
                            &ldquo;{wedding.quote}&rdquo;
                        </blockquote>
                    )}

                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.a 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            href="#rsvp" 
                            aria-label="Request RSVP"
                            className="inline-flex items-center justify-center px-12 py-4 font-sans font-bold uppercase tracking-[0.25em] text-xs min-h-[48px] text-white shadow-lg transition-all rounded-sm"
                            style={{ backgroundColor: motifColor }}
                        >
                            Request RSVP
                        </motion.a>
                        <a 
                            href="#details"
                            className="inline-flex items-center justify-center px-8 py-4 font-sans font-medium uppercase tracking-[0.2em] text-xs min-h-[48px] border hover:bg-neutral-50 transition-all rounded-sm"
                            style={{ borderColor: `${motifColor}60`, color: '#3d3128' }}
                        >
                            Ceremony Details
                        </a>
                    </div>
                </motion.div>
            </section>

            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <BioSection id="bio" wedding={wedding} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
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
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <TemplateSectionDivider template="classic" motifColor={motifColor} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
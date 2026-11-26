'use client';

import { motion } from 'framer-motion';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import type { TemplateProps } from '@/types/wedding';
import {
    VideoSection,
    BioSection,
    DetailsSection,
    CountdownTimer,
    TimelineSection,
    GallerySection,
    GiftSection,
    AttireSection,
} from '../wedding';
import {
    formatWeddingDate,
    resolveCouplePhoto,
    resolveTemplateCopy,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';

export default function GardenTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#2D6A4F';
    const portrait = resolveCouplePhoto(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-serif relative pb-24 selection:bg-[#40916c] selection:text-white overflow-hidden"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#f0f7f4',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#2d6a4f',
            }}
        >
            <div className="qw-paper-grain fixed inset-0 pointer-events-none opacity-[0.14] z-0" />
            {/* Soft Botanical Ambient Glows */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/40 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl translate-x-32 translate-y-32 pointer-events-none" />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="border border-current/20 p-3 sm:p-4 rounded-t-full max-w-2xl w-full"
                >
                    <div data-wedding-card="true" className="border border-current/35 p-8 sm:p-12 pt-16 rounded-t-full relative bg-white/80 backdrop-blur-md shadow-2xl space-y-6">
                        {/* Bespoke Wildflower Meadow Crest */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={TEMPLATE_ELEMENT_ASSETS.meadowWreath}
                            alt=""
                            aria-hidden="true"
                            className="mx-auto w-44 sm:w-52 -mt-6 opacity-90 drop-shadow-sm"
                        />

                        {hasCustomMonogram && (
                            <div className="flex justify-center">
                                <WeddingMonogram wedding={wedding} />
                            </div>
                        )}

                        <p className="uppercase tracking-[0.35em] text-xs font-bold font-sans opacity-75">
                            {copy.eyebrow}
                        </p>
                        <h1
                            className={`text-4xl sm:text-6xl md:text-7xl font-serif leading-tight ${titleStyle.className}`}
                            style={titleStyle.style}
                        >
                            {wedding.bride_name}
                            <span className="block text-2xl sm:text-3xl italic font-light my-2" style={{ color: motifColor }}>&amp;</span>
                            {wedding.groom_name}
                        </h1>

                        {(formattedDate || wedding.venue_name) && (
                            <p className="text-sm font-sans uppercase tracking-[0.3em] opacity-75">
                                {[formattedDate, wedding.venue_name].filter(Boolean).join(' • ')}
                            </p>
                        )}

                        <div className="mx-auto w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                            <WeddingHeroVisual
                                wedding={wedding}
                                gallery={gallery}
                                src={portrait}
                                ornamentSrc={TEMPLATE_ELEMENT_ASSETS.meadowWreath}
                                className="h-full w-full"
                            />
                        </div>

                        <div className="pt-4 flex flex-wrap justify-center gap-3">
                            <a
                                href={copy.ctaHref}
                                data-wedding-control="primary"
                                aria-label={copy.ctaLabel}
                                className="px-10 py-3.5 inline-flex items-center justify-center rounded-full text-white font-sans font-bold text-xs uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5"
                                style={{ backgroundColor: motifColor }}
                            >
                                {copy.ctaLabel}
                            </a>
                            <a
                                href={copy.detailsHref}
                                data-wedding-control="secondary"
                                className="px-7 py-3.5 inline-flex items-center justify-center rounded-full border border-current/25 font-sans font-semibold text-xs uppercase tracking-widest hover:bg-current/5"
                            >
                                {copy.detailsLabel}
                            </a>
                        </div>
                        <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center" />
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
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

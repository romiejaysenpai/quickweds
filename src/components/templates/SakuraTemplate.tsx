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

export default function SakuraTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#C96A85';
    const portrait = resolveCouplePhoto(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const formattedDate = formatWeddingDate(wedding.wedding_date);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="relative font-serif pb-24 selection:bg-[#ffb7c5] selection:text-white"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fff0f5',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#8e405a',
            }}
        >
            {/* Cotton paper grain + ambient floral wash */}
            <div className="qw-paper-grain fixed inset-0 pointer-events-none opacity-[0.14] z-0" />
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-200/40 via-transparent to-pink-50" />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
                <div className="w-72 h-72 bg-gradient-to-br from-pink-300/30 to-transparent rounded-full absolute -top-24 -left-24 blur-3xl pointer-events-none" />
                <div className="w-64 h-64 bg-gradient-to-tl from-rose-200/40 to-transparent rounded-full absolute bottom-0 right-0 blur-3xl pointer-events-none" />
                {/* Bespoke Watercolor Sakura Branch */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={TEMPLATE_ELEMENT_ASSETS.sakuraBranch}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-4 -right-6 w-52 sm:w-64 md:w-72 opacity-85 drop-shadow-md z-0"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    data-wedding-card="true"
                    className="relative z-10 bg-white/75 backdrop-blur-md p-8 sm:p-14 md:p-16 rounded-[3rem] border border-white/80 max-w-4xl w-full shadow-[0_20px_70px_rgba(255,183,197,0.3)] space-y-6"
                >
                    {hasCustomMonogram && (
                        <div className="flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}

                    <p className="font-sans text-xs uppercase tracking-[0.35em] opacity-75">
                        {copy.eyebrow}
                    </p>

                    <h1
                        className={`text-4xl sm:text-6xl md:text-8xl font-serif leading-none ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name}
                        <span className="block text-xl sm:text-2xl font-sans font-light uppercase tracking-widest opacity-60 my-3" style={{ color: motifColor }}>and</span>
                        {wedding.groom_name}
                    </h1>

                    {(formattedDate || wedding.venue_name) && (
                        <div className="inline-block border-y border-current/25 py-3 px-8 my-4">
                            <p className="font-sans text-xs uppercase tracking-[0.35em] font-bold">
                                {[formattedDate, wedding.venue_name].filter(Boolean).join(' • ')}
                            </p>
                        </div>
                    )}

                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto relative">
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={portrait}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.sakuraBranch}
                            className="h-full w-full"
                        />
                    </div>

                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            aria-label={copy.ctaLabel}
                            className="px-10 py-4 inline-flex items-center justify-center text-white rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:brightness-105 transition-all shadow-lg"
                            style={{ backgroundColor: motifColor }}
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="px-7 py-4 inline-flex items-center justify-center rounded-2xl border border-current/25 font-sans font-semibold uppercase tracking-widest text-xs hover:bg-current/5 transition-colors"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center" />
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

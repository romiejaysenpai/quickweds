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
    resolveTemplateCopy,
    resolveWeddingMedia,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';

function isDirectVideoUrl(url?: string | null): boolean {
    if (!url) return false;
    const trimmed = url.trim();
    return (
        /\.(mp4|webm|mov|m4v|ogg)(?:[?#].*)?$/i.test(trimmed) ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:video/')
    );
}

export default function RoyalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const motifColor = wedding.motif_color || '#f2d0a4';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const useHeroVideo = isDirectVideoUrl(wedding.teaser_video);

    return (
        <div
            className="relative overflow-x-clip min-h-screen font-serif"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#121212',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#f2d0a4',
            }}
        >
            {!hasBackgroundChoice && (
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'var(--qw-deco-texture)' }} />
            )}

            <section className="min-h-screen py-20 relative overflow-hidden flex flex-col items-center justify-center border-b border-current/20 bg-[#121212]">
                {useHeroVideo ? (
                    <video
                        src={wedding.teaser_video}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                    />
                ) : heroImage ? (
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        dark
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.decoCrest}
                        className="absolute inset-0 opacity-30"
                        imgClassName="grayscale brightness-50"
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-[#121212] pointer-events-none" />

                <motion.div
                    initial={false}
                    animate={{ scale: 1, opacity: 1 }}
                    className="z-10 text-center max-w-5xl w-full px-4 sm:px-8 md:px-12 py-12 sm:py-16 border-[3px] border-[#f2d0a4]/30 m-4 sm:m-8 bg-black/50 backdrop-blur-sm relative text-[#f2d0a4]"
                >
                    <div className="mb-6 flex justify-center">
                        <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || motifColor }} />
                    </div>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={TEMPLATE_ELEMENT_ASSETS.decoCrest}
                        alt=""
                        aria-hidden="true"
                        className="mx-auto mb-5 w-16 opacity-85"
                    />

                    <span className="text-xs uppercase tracking-[0.75em] font-black opacity-75 mb-8 block">{copy.eyebrow}</span>
                    <h1
                        className={`text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif border-y-2 border-current/40 py-8 sm:py-12 mb-8 leading-tight tracking-[0.05em] uppercase text-[#f2d0a4] ${titleStyle.className}`}
                        style={hasTitleChoice ? titleStyle.style : undefined}
                    >
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-3xl italic normal-case block my-4 tracking-widest">and</span>
                        {wedding.groom_name}
                    </h1>
                    <p className="text-lg sm:text-2xl font-serif italic mb-8 max-w-2xl mx-auto opacity-85">{copy.subtitle}</p>
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <div className="flex flex-wrap gap-4 items-center justify-center mb-8">
                            <div className="w-16 h-[1px] bg-current/40" />
                            <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-black">
                                {[wedding.wedding_date ? formatWeddingDate(wedding.wedding_date) : '', wedding.venue_name].filter(Boolean).join(' • ')}
                            </p>
                            <div className="w-16 h-[1px] bg-current/40" />
                        </div>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[48px] items-center justify-center px-10 py-4 border-2 border-[#f2d0a4]/60 text-[#f2d0a4] font-bold uppercase tracking-[0.3em] text-xs hover:bg-[#f2d0a4] hover:text-[#121212] transition-all">
                            {copy.ctaLabel}
                        </a>
                        <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[48px] items-center justify-center px-7 py-4 border border-white/25 text-white font-semibold uppercase tracking-[0.25em] text-xs hover:bg-white/10 transition-colors">
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="justify-center mt-5 text-[#f2d0a4]" />
                </motion.div>
            </section>

            <div className={`relative z-10 pt-24 ${hasBackgroundChoice ? '' : 'bg-[#1a1a1a] shadow-[0_0_100px_rgba(0,0,0,1)]'}`}>
                <BioSection id="bio" wedding={wedding} />
                <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
                <div className={`relative z-10 pt-24 ${hasBackgroundChoice ? '' : 'bg-[#121212]'}`}><DetailsSection id="details" wedding={wedding} invert={!hasBackgroundChoice} /></div>
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
                    cardStyle={wedding.card_style}
                    wedding={wedding}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
                <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout} />
                <AttireSection wedding={wedding} />
                <GiftSection id="gift" wedding={wedding} invert={!hasBackgroundChoice} />
                <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
            </div>
        </div>
    );
}

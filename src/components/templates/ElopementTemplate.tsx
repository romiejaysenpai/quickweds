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
    getFirstName,
    resolveTemplateCopy,
    resolveWeddingMedia,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from './shared';

export default function ElopementTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#44403C';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="font-serif relative pb-24 selection:bg-stone-200"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#fafaf9',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#44403c',
            }}
        >
            <section className="min-h-screen py-20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-60 transition-opacity z-0">
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.nordicPine}
                        className="h-full w-full"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/75 to-white/30" />

                <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="z-10 text-center max-w-2xl px-4 sm:px-6 text-stone-900">
                    {hasCustomMonogram && (
                        <div className="mb-6 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <span className="text-xs uppercase tracking-[0.5em] font-bold opacity-70 mb-6 block">{copy.eyebrow}</span>
                    <h1
                        className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif mb-8 drop-shadow-[0_4px_10px_rgba(255,255,255,0.8)] leading-[0.9] ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {getFirstName(wedding.bride_name, 'Bride')} <br />
                        <span className="italic opacity-45 font-light">&amp;</span> <br />
                        {getFirstName(wedding.groom_name, 'Groom')}
                    </h1>
                    <p className="text-xl sm:text-2xl italic opacity-80 mb-6">{copy.subtitle}</p>
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <p className="text-xs uppercase tracking-[0.28em] font-sans opacity-70 mb-8">
                            {[wedding.wedding_date ? formatWeddingDate(wedding.wedding_date) : '', wedding.venue_name].filter(Boolean).join(' • ')}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="px-8 sm:px-10 py-3 min-h-[44px] inline-flex items-center justify-center bg-stone-900 text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-stone-700 transition-colors">{copy.ctaLabel}</a>
                        <a href={wedding.story ? '#our-story' : copy.detailsHref} data-wedding-control="secondary" className="px-7 py-3 min-h-[44px] inline-flex items-center justify-center border border-stone-900/25 rounded-full font-semibold uppercase tracking-widest text-[10px] hover:bg-stone-900/5 transition-colors">{wedding.story ? 'See Our Story' : copy.detailsLabel}</a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center mt-5" />
                </motion.div>
            </section>

            {wedding.story && (
                <section id="our-story" className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="space-y-8 border-l border-current/20 pl-8 sm:pl-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-4xl font-serif">Our Story</h2>
                            <p className="text-lg sm:text-xl leading-relaxed italic">{wedding.story}</p>
                        </div>
                    </div>
                </section>
            )}

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
            <BioSection id="bio" wedding={wedding} hideStory />
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
                    cardStyle={wedding.card_style}
                    wedding={wedding}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} galleryLayout={wedding.gallery_layout} wedding={wedding} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

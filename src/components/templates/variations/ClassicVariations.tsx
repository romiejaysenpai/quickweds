'use client';

import { motion } from 'framer-motion';
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
    SafeWeddingImage,
} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import {
    formatWeddingDate,
    resolveCouplePhoto,
    resolveTemplateCopy,
    resolveWeddingMedia,
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
} from '../shared';

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
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const copy = resolveTemplateCopy(wedding);
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    return (
        <div
            className="template-variation-v1"
            style={hasBackgroundChoice ? { backgroundColor: 'var(--builder-paper)', color: 'var(--builder-ink)' } : undefined}
        >
            <section className="classic-invitation-hero relative flex min-h-[85svh] md:min-h-[90svh] flex-col items-center justify-center overflow-hidden bg-[#181412]">
                {heroImage ? (
                    <div className="classic-invitation-photo absolute inset-0">
                        <SafeWeddingImage
                            src={heroImage}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            loading="eager"
                            fetchPriority="high"
                            className="h-full w-full object-cover brightness-[0.72] md:brightness-75"
                        />
                    </div>
                ) : (
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        dark
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.waxSeal}
                        className="absolute inset-0"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/75" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.34)_0%,transparent_62%)]"
                />

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 px-5 py-16 text-center text-white drop-shadow-sm"
                >
                    <motion.div
                        variants={containerVariants}
                        initial={false}
                        animate="visible"
                    >
                        {hasCustomMonogram && (
                            <motion.div variants={itemVariants} className="mb-5 flex justify-center">
                                <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || '#FFFFFF' }} />
                            </motion.div>
                        )}
                        <motion.span
                            variants={itemVariants}
                            className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-6 sm:mb-7 md:mb-8 block opacity-85"
                        >
                            {copy.eyebrow}
                        </motion.span>

                        <motion.h1
                            variants={itemVariants}
                            className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif mb-8 sm:mb-10 md:mb-12 leading-tight text-white ${titleStyle.className}`}
                            style={hasTitleChoice ? titleStyle.style : undefined}
                        >
                            {wedding.bride_name} <br />
                            <span
                                className="text-xl sm:text-3xl md:text-5xl italic font-light font-serif"
                                style={{ color: motifColor }}
                            >
                                &amp;
                            </span>{' '}
                            <br />
                            {wedding.groom_name}
                        </motion.h1>

                        <motion.div
                            variants={itemVariants}
                            className="w-12 sm:w-16 md:w-20 h-[1px] mx-auto mb-8 sm:mb-10 md:mb-12"
                            style={{ backgroundColor: motifColor }}
                        />

                        {wedding.wedding_date && (
                            <motion.p
                                variants={itemVariants}
                                className="text-lg sm:text-xl md:text-2xl font-serif italic tracking-wide mb-3"
                            >
                                {formatWeddingDate(wedding.wedding_date, { dateStyle: 'long' }, 'en-US')}
                            </motion.p>
                        )}
                        {wedding.venue_name && (
                            <motion.p variants={itemVariants} className="text-xs uppercase tracking-[0.28em] text-white/75 mb-8">
                                {wedding.venue_name}
                            </motion.p>
                        )}

                        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3">
                            <a
                                href={copy.ctaHref}
                                data-wedding-control="primary"
                                aria-label={copy.ctaLabel}
                                className="inline-flex min-h-[44px] items-center justify-center px-10 py-3 rounded-full border border-white/60 bg-black/25 text-white hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-xs font-bold"
                            >
                                {copy.ctaLabel}
                            </a>
                            <a
                                href={copy.detailsHref}
                                data-wedding-control="secondary"
                                className="inline-flex min-h-[44px] items-center justify-center px-7 py-3 rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors uppercase tracking-widest text-xs font-semibold"
                            >
                                {copy.detailsLabel}
                            </a>
                        </motion.div>
                        <TemplateHeroActions wedding={wedding} variant="minimal" motifColor="#FFFFFF" className="justify-center mt-5 text-white" />
                    </motion.div>
                </motion.div>

                <motion.div
                    className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="w-[1px] h-12 opacity-40" style={{ backgroundColor: motifColor }} />
                </motion.div>
            </section>

            {/* Standard Flow */}
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
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
                    cardStyle={wedding.card_style}
                    wedding={wedding}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
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
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const copy = resolveTemplateCopy(wedding);
    const heroImage = resolveWeddingMedia(wedding, gallery);

    return (
        <div
            className="template-variation-v2"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#F9F7F5',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#222222',
            }}
        >
            {/* Split Screen Hero Layout */}
            <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
                <div className="relative h-[60vh] lg:h-auto min-h-[400px]">
                    <WeddingHeroVisual
                        wedding={wedding}
                        gallery={gallery}
                        src={heroImage}
                        ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                        className="h-full w-full"
                        imgClassName="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                    <div className="absolute bottom-6 left-6 text-white lg:hidden">
                        <span className="text-xs uppercase tracking-[0.3em] font-semibold opacity-90 block">{copy.eyebrow}</span>
                        <p className="text-3xl font-serif mt-1">{wedding.bride_name} &amp; {wedding.groom_name}</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center px-8 py-12 lg:px-16 xl:px-24">
                    {(wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')) && (
                        <div className="mb-5">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <span className="text-xs uppercase tracking-[0.4em] font-bold mb-4 block" style={{ color: motifColor }}>
                        {copy.eyebrow}
                    </span>
                    <h1
                        className={`text-4xl sm:text-6xl xl:text-7xl font-serif tracking-tight leading-none mb-6 ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <br />
                        <span className="italic font-light text-3xl sm:text-5xl font-serif" style={{ color: motifColor }}>with</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: motifColor }} />
                    {wedding.wedding_date && (
                        <p className="text-lg sm:text-xl font-sans tracking-wide opacity-80 mb-2">
                            {formatWeddingDate(wedding.wedding_date, { dateStyle: 'full' }, 'en-US')}
                        </p>
                    )}
                    {copy.venueSummary && (
                        <p className="text-sm font-sans opacity-70 uppercase tracking-widest mb-8">
                            {copy.venueSummary}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            className="inline-flex min-h-[48px] items-center justify-center px-8 py-3.5 border-2 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:opacity-85"
                            style={{ borderColor: motifColor, color: motifColor }}
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="inline-flex min-h-[48px] items-center justify-center px-6 py-3.5 border border-current/25 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-current/5"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="editorial" motifColor={motifColor} />
                </div>
            </section>

            {/* Story-First Section Flow */}
            <BioSection id="bio" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout && wedding.gallery_layout !== 'auto' ? wedding.gallery_layout : 'horizontal'} cardStyle={wedding.card_style} wedding={wedding} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v2" wedding={wedding} />
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
            <AttireSection wedding={wedding} />
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
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const copy = resolveTemplateCopy(wedding);
    const heroImage = resolveWeddingMedia(wedding, gallery);

    return (
        <div
            className="template-variation-v3 bg-gradient-to-b from-[#FFF0F3] via-[#FFF8F9] to-[#F8EDEB]"
            style={hasBackgroundChoice ? { backgroundColor: 'var(--builder-paper)', backgroundImage: 'none', color: 'var(--builder-ink)' } : undefined}
        >
            {/* Floating Glassmorphism Hero */}
            <section className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                {heroImage && (
                    <div className="absolute inset-0 z-0">
                        <SafeWeddingImage
                            src={heroImage}
                            alt={`${wedding.bride_name} & ${wedding.groom_name}`}
                            loading="eager"
                            fetchPriority="high"
                            className="h-full w-full object-cover blur-sm brightness-90 scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                    </div>
                )}

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    data-wedding-card="true"
                    className="relative z-10 max-w-2xl w-full backdrop-blur-xl bg-white/80 border border-white/70 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)] rounded-[2.5rem] p-8 sm:p-12 text-center text-[#2E2426]"
                >
                    {(wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')) && (
                        <div className="mb-4 flex justify-center">
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <span className="text-xs uppercase tracking-[0.4em] font-semibold mb-3 block" style={{ color: motifColor }}>
                        {copy.eyebrow}
                    </span>
                    <h1
                        className={`text-4xl sm:text-6xl font-serif mb-4 leading-tight ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <br />
                        <span className="font-serif italic font-light text-2xl sm:text-4xl" style={{ color: motifColor }}>&amp;</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: motifColor }} />
                    {wedding.wedding_date && (
                        <p className="text-lg font-serif italic mb-2">
                            {formatWeddingDate(wedding.wedding_date, { dateStyle: 'full' }, 'en-US')}
                        </p>
                    )}
                    {wedding.venue_name && (
                        <p className="text-xs uppercase tracking-widest opacity-70 mb-8">
                            {wedding.venue_name}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            className="inline-flex min-h-[48px] items-center justify-center px-10 py-3.5 rounded-full text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            style={{ backgroundColor: motifColor }}
                        >
                            {copy.ctaLabel}
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="inline-flex min-h-[48px] items-center justify-center px-7 py-3.5 rounded-full border border-current/20 text-xs uppercase tracking-widest font-semibold hover:bg-black/5 transition-colors"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} className="justify-center mt-5" />
                </motion.div>
            </section>

            {/* Schedule & Venue Priority Flow */}
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
            <BioSection id="bio" wedding={wedding} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v3" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout && wedding.gallery_layout !== 'auto' ? wedding.gallery_layout : 'vertical'} cardStyle={wedding.card_style} wedding={wedding} />
            <AttireSection wedding={wedding} />
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
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const copy = resolveTemplateCopy(wedding);
    const primaryPhoto = resolveWeddingMedia(wedding, gallery);
    const secondaryPhoto = resolveCouplePhoto(wedding, gallery);

    return (
        <div
            className="template-variation-v4"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#ffffff',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : undefined,
            }}
        >
            {/* Monogram Banner & Asymmetric Photo Grid Hero */}
            <section className="pt-12 pb-16 px-6 sm:px-12 max-w-7xl mx-auto border-b border-border/40">
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <WeddingMonogram wedding={wedding} />
                    </div>
                    <h1
                        className={`text-4xl sm:text-7xl font-serif uppercase tracking-tight leading-none mb-4 ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {wedding.bride_name} <span className="font-light italic lowercase font-serif text-3xl sm:text-5xl" style={{ color: motifColor }}>&amp;</span> {wedding.groom_name}
                    </h1>
                    {(wedding.wedding_date || wedding.venue_name) && (
                        <p className="text-xs uppercase tracking-[0.4em] font-bold opacity-70">
                            {[
                                wedding.wedding_date ? formatWeddingDate(wedding.wedding_date, { dateStyle: 'long' }, 'en-US') : '',
                                wedding.venue_name,
                            ]
                                .filter(Boolean)
                                .join(' • ')}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[450px]">
                    <div className="relative h-full rounded-2xl overflow-hidden md:col-span-2">
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={primaryPhoto}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.waxSeal}
                            className="h-full w-full"
                        />
                    </div>
                    <div className="relative h-full rounded-2xl overflow-hidden hidden md:block">
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={secondaryPhoto || primaryPhoto}
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                            className="h-full w-full"
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            className="inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-bold uppercase tracking-widest transition-colors"
                            style={{ borderColor: motifColor, color: motifColor }}
                        >
                            {copy.ctaLabel} <ChevronRight className="w-4 h-4" />
                        </a>
                        <a
                            href={copy.detailsHref}
                            data-wedding-control="secondary"
                            className="inline-flex items-center gap-2 border-b pb-1 text-xs font-semibold uppercase tracking-widest border-current/30 opacity-80 hover:opacity-100"
                        >
                            {copy.detailsLabel}
                        </a>
                    </div>
                    <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center" />
                </div>
            </section>

            {/* Media Showcase Priority Flow */}
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v4" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout && wedding.gallery_layout !== 'auto' ? wedding.gallery_layout : 'bento'} cardStyle={wedding.card_style} wedding={wedding} />
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
                    cardStyle={wedding.card_style}
                    wedding={wedding}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <AttireSection wedding={wedding} />
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
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const copy = resolveTemplateCopy(wedding);

    return (
        <div
            className="template-variation-v5"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#FAF6F0',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : undefined,
            }}
        >
            {/* Pure Typography Banner with Inline Countdown */}
            <section className="py-24 px-6 sm:px-12 text-center max-w-5xl mx-auto border-b border-border/30">
                {(wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')) && (
                    <div className="mb-4 flex justify-center">
                        <WeddingMonogram wedding={wedding} />
                    </div>
                )}
                <span className="text-xs font-mono uppercase tracking-[0.3em] opacity-65 block mb-4">
                    {copy.eyebrow}
                </span>
                <h1
                    className={`text-5xl sm:text-8xl font-serif font-bold uppercase tracking-tight leading-[0.92] mb-6 ${titleStyle.className}`}
                    style={titleStyle.style}
                >
                    {wedding.bride_name} <br />
                    <span className="font-serif italic font-light text-4xl sm:text-6xl" style={{ color: motifColor }}>&amp;</span> <br />
                    {wedding.groom_name}
                </h1>
                {(wedding.wedding_date || wedding.venue_name) && (
                    <div data-wedding-card="true" className="max-w-md mx-auto p-6 rounded-2xl bg-white/90 text-[#2E2724] shadow-sm border border-current/10 mb-8">
                        {wedding.wedding_date && (
                            <p className="text-sm font-semibold uppercase tracking-wider mb-1">
                                {formatWeddingDate(wedding.wedding_date, { dateStyle: 'full' }, 'en-US')}
                            </p>
                        )}
                        {wedding.venue_name && <p className="text-xs opacity-75">{wedding.venue_name}</p>}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                        href={copy.ctaHref}
                        data-wedding-control="primary"
                        className="inline-flex min-h-[48px] items-center justify-center px-10 py-3.5 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                        style={{ backgroundColor: motifColor }}
                    >
                        {copy.ctaLabel}
                    </a>
                    <a
                        href={copy.detailsHref}
                        data-wedding-control="secondary"
                        className="inline-flex min-h-[48px] items-center justify-center px-7 py-3.5 rounded-2xl border border-current/25 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
                    >
                        {copy.detailsLabel}
                    </a>
                </div>
                <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} className="justify-center mt-5" />
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
                    cardStyle={wedding.card_style}
                    wedding={wedding}
                />
            )}
            <DetailsSection id="details" wedding={wedding} />
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <BioSection id="bio" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout && wedding.gallery_layout !== 'auto' ? wedding.gallery_layout : 'grid'} cardStyle={wedding.card_style} wedding={wedding} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle="v5" wedding={wedding} />
            <AttireSection wedding={wedding} />
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

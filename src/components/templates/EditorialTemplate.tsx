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

export default function EditorialTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const motifColor = wedding.motif_color || '#8F394A';
    const heroImage = resolveWeddingMedia(wedding, gallery);
    const copy = resolveTemplateCopy(wedding);
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );

    if (wedding.template_style === 'editorial-photo') {
        return (
            <div
                className="pb-24 relative"
                style={{
                    backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#f7f3ee',
                    color: hasBackgroundChoice ? 'var(--builder-ink)' : '#201c19',
                }}
            >
                <div className="qw-paper-grain fixed inset-0 pointer-events-none z-0 opacity-[0.12]" />
                <section className="relative z-10 min-h-screen overflow-hidden px-5 py-10 md:px-10">
                    <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-[1.08fr_0.92fr]">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9 }}
                            className="relative min-h-[58vh] overflow-hidden bg-black md:min-h-full"
                        >
                            <WeddingHeroVisual
                                wedding={wedding}
                                gallery={gallery}
                                src={heroImage}
                                dark
                                ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                                className="h-full w-full"
                                imgClassName="opacity-90"
                            />
                            {wedding.quote && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white md:p-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.42em] opacity-75">{copy.eyebrow}</p>
                                    <p className="mt-3 max-w-lg font-serif text-2xl italic leading-tight md:text-4xl">
                                        &ldquo;{wedding.quote}&rdquo;
                                    </p>
                                </div>
                            )}
                        </motion.div>
                        <div className="flex flex-col justify-between border-y border-current/15 py-8 lg:py-12">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.36em] opacity-55">{copy.eyebrow}</p>
                                {copy.year ? <p className="text-[10px] font-black uppercase tracking-[0.36em] opacity-55">{copy.year}</p> : null}
                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.9, delay: 0.15 }}
                                className="py-12"
                            >
                                {hasCustomMonogram && (
                                    <div className="mb-8">
                                        <WeddingMonogram wedding={wedding} />
                                    </div>
                                )}
                                <h1
                                    className={`font-serif text-5xl leading-[0.86] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl ${titleStyle.className}`}
                                    style={titleStyle.style}
                                >
                                    {getFirstName(wedding.bride_name, 'Bride')}
                                    <span className="block font-light italic" style={{ color: motifColor }}>&amp;</span>
                                    {getFirstName(wedding.groom_name, 'Groom')}
                                </h1>
                                <p className="mt-8 max-w-md text-base leading-7 opacity-80">
                                    {copy.subtitle}
                                </p>
                            </motion.div>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        {wedding.wedding_date && (
                                            <p className="font-serif text-2xl italic">
                                                {formatWeddingDate(wedding.wedding_date, { month: 'short', day: '2-digit', year: 'numeric' })}
                                            </p>
                                        )}
                                        {wedding.venue_name && <p className="text-sm opacity-75">{wedding.venue_name}</p>}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <a href={copy.ctaHref} data-wedding-control="primary" aria-label={copy.ctaLabel} className="inline-flex min-h-[48px] items-center justify-center bg-[#201c19] px-7 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors hover:opacity-90">
                                            {copy.ctaLabel}
                                        </a>
                                        <a href={copy.detailsHref} data-wedding-control="secondary" className="inline-flex min-h-[48px] items-center justify-center border border-current/25 px-6 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-current/5">
                                            {copy.detailsLabel}
                                        </a>
                                    </div>
                                </div>
                                <TemplateHeroActions wedding={wedding} variant="editorial" motifColor={motifColor} />
                            </div>
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
                <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
                <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
                <AttireSection wedding={wedding} />
                <GiftSection id="gift" wedding={wedding} />
                <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
            </div>
        );
    }

    return (
        <div
            className="pb-24 relative"
            style={{
                backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#ffffff',
                color: hasBackgroundChoice ? 'var(--builder-ink)' : '#181412',
            }}
        >
            <section className="min-h-screen py-12 lg:py-0 grid grid-cols-1 lg:grid-cols-12 gap-0 relative overflow-hidden">
                <div className="col-span-1 hidden lg:flex border-r border-current/10 flex-col items-center justify-between py-12 h-full uppercase text-[10px] font-black tracking-[1.2em] opacity-40">
                    {copy.year ? <p className="rotate-90 whitespace-nowrap">{copy.year}</p> : <span />}
                    <p className="rotate-90 whitespace-nowrap">{copy.eyebrow}</p>
                </div>
                <div className="col-span-1 lg:col-span-11 flex flex-col justify-end px-4 sm:px-6 md:px-12 lg:px-32 py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden group">
                    <motion.div
                        initial={{ scale: 1.1, filter: 'blur(20px)' }}
                        animate={{ scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 -z-10"
                    >
                        <WeddingHeroVisual
                            wedding={wedding}
                            gallery={gallery}
                            src={heroImage}
                            dark
                            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                            className="h-full w-full"
                            imgClassName="brightness-[0.6] group-hover:scale-105 transition-transform duration-1000"
                        />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }} className="text-white relative z-10 max-w-6xl">
                        {hasCustomMonogram && (
                            <div className="mb-8">
                                <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || '#FFFFFF' }} />
                            </div>
                        )}
                        <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-widest mb-10 text-white" style={{ backgroundColor: motifColor }}>{copy.eyebrow}</span>
                        <h1
                            className={`text-4xl sm:text-6xl md:text-7xl lg:text-[clamp(3.5rem,7.5vw,6.5rem)] font-serif leading-[0.88] tracking-tight mb-12 drop-shadow-2xl ${titleStyle.className}`}
                            style={titleStyle.style}
                        >
                            {getFirstName(wedding.bride_name, 'Bride')} <br />
                            &amp; <span className="italic font-light" style={{ color: motifColor }}>{getFirstName(wedding.groom_name, 'Groom')}</span>
                        </h1>
                        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-12 lg:gap-24 items-start md:items-end w-full">
                            <div className="flex-1 border-l border-white/20 pl-4 sm:pl-6 md:pl-12">
                                <p className="text-2xl font-serif italic leading-tight max-w-lg mb-6 opacity-90">{copy.subtitle}</p>
                                {wedding.venue_name && <p className="text-xs uppercase tracking-[0.4em] font-black opacity-75">{wedding.venue_name}</p>}
                            </div>
                            <div className="shrink-0 flex flex-col items-start md:items-end gap-4">
                                {wedding.wedding_date && (
                                    <p className="text-4xl md:text-6xl font-serif border-b-2 pb-4 italic" style={{ borderColor: motifColor }}>
                                        {formatWeddingDate(wedding.wedding_date, { month: 'short', day: '2-digit' })}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-4">
                                    <a href={copy.ctaHref} data-wedding-control="primary" className="text-2xl font-serif italic flex items-center gap-4 hover:gap-8 transition-all">
                                        {copy.ctaLabel} <span className="w-10 h-[1px] bg-white" />
                                    </a>
                                    <a href={copy.detailsHref} data-wedding-control="secondary" className="text-xs font-sans uppercase tracking-[0.25em] border border-white/30 px-4 py-2 rounded-full hover:bg-white/10">
                                        {copy.detailsLabel}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <TemplateHeroActions wedding={wedding} variant="minimal" motifColor="#FFFFFF" className="mt-6 text-white" />
                    </motion.div>
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
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

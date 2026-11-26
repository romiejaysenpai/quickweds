'use client';

import { motion } from 'framer-motion';
import {
  BioSection,
  CountdownTimer,
  DetailsSection,
  GallerySection,
  GiftSection,
  TimelineSection,
  VideoSection,
  AttireSection,
} from '../wedding';
import { getSectionTitleStyle } from '@/lib/theme-engine';
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
import type { TemplateProps } from '@/types/wedding';

export default function CinematicVowTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#C89666'; // Golden Amber Warm Tone
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const weddingYear = copy.year;
  const formattedDate = wedding.wedding_date
    ? formatWeddingDate(wedding.wedding_date, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const hasCustomMonogram = Boolean(
    wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
  );

  return (
    <div
      className="font-serif relative pb-28 selection:bg-[#C89666] selection:text-black"
      style={{
        backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#12100E',
        color: hasBackgroundChoice ? 'var(--builder-ink)' : '#EDE4DC',
      }}
    >
      {/* Widescreen Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-current/10">
        {/* Top Letterbox Bar */}
        <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between gap-3 text-[11px] font-sans uppercase tracking-[0.3em] text-white/75 bg-[#0A0908]/90 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: motifColor }} />
            <span>{copy.eyebrow}</span>
            {weddingYear ? (
              <>
                <span>•</span>
                <span>{weddingYear}</span>
              </>
            ) : null}
          </div>
          {wedding.venue_name && (
            <span className="hidden sm:inline-block tracking-widest truncate max-w-[260px]" style={{ color: motifColor }}>
              {wedding.venue_name}
            </span>
          )}
        </div>

        {/* Hero Visual Frame */}
        <div className="relative flex-1 min-h-[70vh] flex items-end px-4 sm:px-8 lg:px-16 py-16 sm:py-24">
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0"
          >
            <WeddingHeroVisual
              wedding={wedding}
              gallery={gallery}
              src={heroImage}
              dark
              ornamentSrc={TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe}
              className="h-full w-full"
              imgClassName="brightness-[0.55] contrast-[1.08] saturate-[0.9]"
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-black/40 to-[#0A0908]/80 pointer-events-none" />
          </motion.div>

          {/* Romantic Title Overlay */}
          <div className="relative z-10 max-w-5xl mx-auto w-full text-center text-white">
            {hasCustomMonogram && (
              <div className="mb-5 flex justify-center">
                <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || '#FFFFFF' }} />
              </div>
            )}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-xs sm:text-sm font-sans uppercase tracking-[0.4em] text-white/75 mb-4"
            >
              {copy.eyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`text-4xl sm:text-6xl lg:text-[clamp(3.5rem,7vw,6.5rem)] font-serif font-light leading-[0.95] tracking-tight text-white ${titleStyle.className}`}
              style={titleStyle.style}
            >
              <span className="font-serif block sm:inline">{wedding.bride_name}</span>
              <span className="mx-4 text-[0.6em] italic font-serif" style={{ color: motifColor }}>
                &amp;
              </span>
              <span className="font-serif block sm:inline">{wedding.groom_name}</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-sans tracking-[0.25em] text-white/85"
            >
              {formattedDate && <span className="font-semibold uppercase">{formattedDate}</span>}
              {formattedDate && wedding.venue_name && <span className="text-white/40">•</span>}
              {wedding.venue_name && (
                <span className="font-serif italic text-base sm:text-lg text-[#F0E6DD]">
                  {wedding.venue_name}
                </span>
              )}
            </motion.div>

            {wedding.venue_address && (
              <p className="mt-1 text-xs text-white/60 font-sans tracking-wider max-w-md mx-auto">
                {wedding.venue_address}
              </p>
            )}

            <p className="mt-6 text-sm sm:text-base italic text-white/85 max-w-xl mx-auto font-serif leading-relaxed">
              {copy.subtitle}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-8 flex flex-wrap justify-center items-center gap-4"
            >
              <a
                href={copy.ctaHref}
                data-wedding-control="primary"
                aria-label={copy.ctaLabel}
                className="inline-flex min-h-[48px] items-center justify-center px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-black shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: motifColor }}
              >
                {copy.ctaLabel}
              </a>
              <a
                href={copy.detailsHref}
                data-wedding-control="secondary"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3 rounded-full text-xs font-sans font-semibold uppercase tracking-[0.2em] border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {copy.detailsLabel}
              </a>
            </motion.div>
            <TemplateHeroActions wedding={wedding} variant="noir" motifColor={motifColor} className="justify-center mt-5 text-white" />
          </div>
        </div>
      </section>

      {/* Structured Sections */}
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
          motifColor={motifColor}
        />
      )}

      <BioSection id="bio" wedding={wedding} />

      <DetailsSection id="details" wedding={wedding} />

      <TimelineSection
        id="timeline"
        timeline={wedding.program_timeline || ''}
        wedding={wedding}
      />

      <GallerySection
        id="gallery"
        gallery={gallery}
        template={wedding.template}
        motifColor={motifColor}
        galleryLayout={wedding.gallery_layout || 'film'}
      />

      <AttireSection wedding={wedding} />

      {wedding.teaser_video && (
        <VideoSection
          id="video"
          video={wedding.teaser_video}
          poster={heroImage}
          template={wedding.template}
          motifColor={motifColor}
          templateStyle={wedding.template_style}
        />
      )}

      <GiftSection id="gift" wedding={wedding} />

      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />

    </div>
  );
}

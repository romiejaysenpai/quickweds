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

export default function MonochromeTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const motifColor = wedding.motif_color || '#1A1A1A';
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const hasCustomMonogram = Boolean(
    wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
  );
  const formattedDate = wedding.wedding_date
    ? formatWeddingDate(wedding.wedding_date, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className="font-sans relative pb-28 selection:bg-black selection:text-white"
      style={{
        backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#FFFFFF',
        color: hasBackgroundChoice ? 'var(--builder-ink)' : '#111111',
      }}
    >
      {/* Hairline Architectural Top Rule */}
      <div className="h-[2px] w-full bg-current/90" />

      {/* Hero: High-Fashion Architectural Minimal */}
      <section className="relative min-h-[90vh] flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-16 lg:py-24 max-w-7xl mx-auto border-b border-current/10">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/15 pb-6 text-[10px] sm:text-xs font-mono uppercase tracking-[0.35em] opacity-65">
          <span>{copy.eyebrow}</span>
          {formattedDate && <span>{formattedDate}</span>}
          {copy.year ? <span>{copy.year}</span> : null}
        </div>

        <div className="my-12 lg:my-16 space-y-6">
          {hasCustomMonogram && (
            <div>
              <WeddingMonogram wedding={wedding} />
            </div>
          )}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs uppercase font-bold tracking-[0.45em] opacity-55"
          >
            {copy.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            className={`text-5xl sm:text-7xl lg:text-[clamp(4rem,9vw,7.5rem)] font-serif font-normal leading-[0.88] tracking-tighter uppercase ${titleStyle.className}`}
            style={titleStyle.style}
          >
            {wedding.bride_name} <br />
            <span className="font-light italic font-serif lowercase opacity-50">&amp;</span> <br />
            {wedding.groom_name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-sm sm:text-base font-serif italic opacity-75 max-w-xl leading-relaxed pt-2"
          >
            {copy.subtitle}
          </motion.p>
        </div>

        {/* Hero Photo Strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.35 }}
          className="relative w-full aspect-[16/9] max-h-[520px] overflow-hidden rounded-none border border-current/15 bg-neutral-100 group"
        >
          <WeddingHeroVisual
            wedding={wedding}
            gallery={gallery}
            src={heroImage}
            ornamentSrc={TEMPLATE_ELEMENT_ASSETS.decoCrest}
            className="h-full w-full"
            imgClassName="grayscale contrast-110 transition-all duration-[1.5s] group-hover:scale-105 group-hover:grayscale-0"
          />
          {wedding.venue_name && (
            <div className="absolute bottom-4 right-4 bg-white/90 text-[#111111] backdrop-blur-md px-4 py-2 border border-black/10 text-[10px] font-mono uppercase tracking-[0.25em]">
              {wedding.venue_name}
            </div>
          )}
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-current/10">
          <TemplateHeroActions wedding={wedding} variant="minimal" motifColor={motifColor} />
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={copy.ctaHref}
              data-wedding-control="primary"
              aria-label={copy.ctaLabel}
              className="inline-flex min-h-[48px] items-center justify-center px-10 py-3.5 bg-black text-white text-xs font-mono uppercase tracking-[0.3em] transition-all hover:bg-neutral-800"
            >
              {copy.ctaLabel} &rarr;
            </a>
            <a
              href={copy.detailsHref}
              data-wedding-control="secondary"
              className="inline-flex min-h-[48px] items-center justify-center px-6 py-3.5 border border-current/25 text-xs font-mono uppercase tracking-[0.25em] transition-colors hover:bg-current/5"
            >
              {copy.detailsLabel}
            </a>
          </div>
        </div>
      </section>

      {/* Sections */}
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
        galleryLayout={wedding.gallery_layout || 'horizontal'}
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

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

export default function EditorialLuxeTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#B85A66';
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const weddingYear = copy.year;
  const hasCustomMonogram = Boolean(
    wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
  );
  const formattedDate = wedding.wedding_date
    ? formatWeddingDate(wedding.wedding_date, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className="font-serif relative pb-28 selection:bg-[#241F1C] selection:text-white"
      style={{
        backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#FAF7F2',
        color: hasBackgroundChoice ? 'var(--builder-ink)' : '#241F1C',
      }}
    >
      {/* Cotton paper deckle grain overlay */}
      <div className="qw-paper-grain pointer-events-none fixed inset-0 z-0 opacity-[0.14]" />

      {/* Bespoke Silk Ribbon Accent */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed right-2 top-6 z-0 hidden w-44 opacity-25 lg:block xl:w-52"
      />

      {/* Hero: Asymmetrical 2-Column Magazine Cover */}
      <section className="relative min-h-[92vh] flex items-center px-4 sm:px-8 lg:px-14 py-12 lg:py-20 overflow-hidden border-b border-current/10">
        <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
          {/* Left Column: Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative aspect-[3/4] max-h-[780px] w-full overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl shadow-black/10 border border-current/10 bg-white/85 p-2.5 sm:p-3"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl lg:rounded-2xl">
              <WeddingHeroVisual
                wedding={wedding}
                gallery={gallery}
                src={heroImage}
                ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                className="h-full w-full"
                imgClassName="transition-transform duration-[12s] hover:scale-105"
              />
              {wedding.quote && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.35em] text-white/75">{copy.eyebrow}</p>
                    <p className="mt-1 text-lg sm:text-xl italic text-white/95 font-serif">
                      &ldquo;{wedding.quote}&rdquo;
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Right Column: Editorial Typography & Prologue */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8"
          >
            {hasCustomMonogram && (
              <div>
                <WeddingMonogram wedding={wedding} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-sans uppercase tracking-[0.3em] opacity-70">
              <span>{copy.eyebrow}</span>
              {weddingYear ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: motifColor }} />
                  <span>{weddingYear}</span>
                </>
              ) : null}
            </div>

            <h1
              className={`text-4xl sm:text-6xl lg:text-[clamp(3.5rem,6.5vw,5.5rem)] font-serif font-normal leading-[0.92] tracking-tight ${titleStyle.className}`}
              style={titleStyle.style}
            >
              <span className="block font-serif">{wedding.bride_name}</span>
              <span className="my-2 block text-[0.45em] italic font-light font-serif" style={{ color: motifColor }}>
                &amp;
              </span>
              <span className="block font-serif">{wedding.groom_name}</span>
            </h1>

            <div className="h-px w-20 bg-current/20" />

            <div className="space-y-2 text-sm sm:text-base opacity-80 leading-relaxed">
              {formattedDate && (
                <p className="font-sans text-xs uppercase tracking-[0.25em] font-semibold">
                  {formattedDate}
                </p>
              )}
              {wedding.venue_name && (
                <p className="font-serif italic text-lg">
                  {wedding.venue_name}
                </p>
              )}
              {wedding.venue_address && (
                <p className="text-xs opacity-70 font-sans">
                  {wedding.venue_address}
                </p>
              )}
            </div>

            <p className="text-base sm:text-lg leading-relaxed opacity-85 max-w-lg font-serif">
              {copy.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={copy.ctaHref}
                data-wedding-control="primary"
                aria-label={copy.ctaLabel}
                className="inline-flex min-h-[48px] items-center justify-center px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-black/10 transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ backgroundColor: motifColor }}
              >
                {copy.ctaLabel}
              </a>
              <a
                href={copy.detailsHref}
                data-wedding-control="secondary"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.2em] border border-current/25 transition-colors hover:bg-current/5"
              >
                {copy.detailsLabel}
              </a>
            </div>
            <TemplateHeroActions wedding={wedding} variant="editorial" motifColor={motifColor} />
          </motion.div>
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
        galleryLayout={wedding.gallery_layout || 'editorial'}
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

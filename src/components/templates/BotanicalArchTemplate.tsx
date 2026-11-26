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

export default function BotanicalArchTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#4A6B53'; // Botanical Sage Green default
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
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
      className="relative pb-28 font-serif selection:bg-[#4A6B53] selection:text-white"
      style={{
        backgroundColor: hasBackgroundChoice ? 'var(--builder-paper)' : '#FAF9F5',
        color: hasBackgroundChoice ? 'var(--builder-ink)' : '#2D332D',
      }}
    >
      {/* Cotton deckle paper texture */}
      <div className="qw-paper-grain fixed inset-0 pointer-events-none z-0 opacity-[0.14]" />

      {/* Hero: Cathedral Arch Portrait Frame */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-8 lg:px-14 py-12 lg:py-20 overflow-hidden">
        {/* Soft background botanical glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: motifColor }} />

        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10">
          {/* Arch Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex justify-center order-2 lg:order-1 relative pt-6"
          >
            {/* Bespoke Botanical Crest crowning the arch */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TEMPLATE_ELEMENT_ASSETS.meadowWreath}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 w-56 sm:w-64 z-20 drop-shadow-md"
            />
            <div className="relative w-full max-w-[420px] p-3 sm:p-4 bg-white/85 backdrop-blur-sm border border-current/15 shadow-2xl rounded-t-[180px] sm:rounded-t-[220px] rounded-b-2xl">
              <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-t-[170px] sm:rounded-t-[210px] rounded-b-xl">
                <WeddingHeroVisual
                  wedding={wedding}
                  gallery={gallery}
                  src={heroImage}
                  ornamentSrc={TEMPLATE_ELEMENT_ASSETS.meadowWreath}
                  className="h-full w-full"
                  imgClassName="transition-transform duration-[10s] hover:scale-105"
                />
                {wedding.quote && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                      <p className="text-sm italic text-white/95 font-serif max-w-xs mx-auto">
                        &ldquo;{wedding.quote}&rdquo;
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Typography & Callout */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 order-1 lg:order-2"
          >
            {hasCustomMonogram && (
              <div className="mb-1">
                <WeddingMonogram wedding={wedding} />
              </div>
            )}
            <div className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.3em] opacity-75">
              <span>{copy.eyebrow}</span>
            </div>

            <h1
              className={`text-4xl sm:text-6xl lg:text-[clamp(3.2rem,6vw,5.2rem)] font-serif font-light leading-[0.98] tracking-normal ${titleStyle.className}`}
              style={titleStyle.style}
            >
              <span className="block font-serif">{wedding.bride_name}</span>
              <span
                className="my-2 block text-[0.55em] italic font-serif font-normal"
                style={{ color: motifColor }}
              >
                &amp;
              </span>
              <span className="block font-serif">{wedding.groom_name}</span>
            </h1>

            <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: motifColor }} />

            <div className="space-y-1.5 text-sm sm:text-base opacity-80 font-sans">
              {formattedDate && (
                <p className="font-semibold uppercase tracking-[0.2em]">
                  {formattedDate}
                </p>
              )}
              {wedding.venue_name && (
                <p className="font-serif italic text-lg">
                  {wedding.venue_name}
                </p>
              )}
              {wedding.venue_address && (
                <p className="text-xs opacity-75 tracking-wide">
                  {wedding.venue_address}
                </p>
              )}
            </div>

            <p className="text-base sm:text-lg leading-relaxed opacity-85 max-w-md font-serif italic">
              {copy.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start items-center gap-4">
              <a
                href={copy.ctaHref}
                aria-label={copy.ctaLabel}
                data-wedding-control="primary"
                className="inline-flex min-h-[48px] items-center justify-center px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ backgroundColor: motifColor }}
              >
                {copy.ctaLabel}
              </a>
              <a
                href={copy.detailsHref}
                data-wedding-control="secondary"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3 rounded-full text-xs font-sans font-semibold uppercase tracking-[0.2em] border border-current/25 transition-colors hover:bg-current/5"
              >
                {copy.detailsLabel}
              </a>
            </div>
            <TemplateHeroActions wedding={wedding} variant="pill" motifColor={motifColor} />
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
        galleryLayout={wedding.gallery_layout || 'masonry'}
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

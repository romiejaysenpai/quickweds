'use client';

import { motion } from 'framer-motion';
import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import type { CSSProperties } from 'react';
import { BioSection, CountdownTimer, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
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
} from './shared';
import type { TemplateProps } from '@/types/wedding';

function BotanicalSprig({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 120 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M6 24C32 22 55 23 114 24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 3" opacity="0.5" />
      <path d="M28 23C24 16 28 8 36 10C38 16 34 22 28 23Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
      <path d="M44 24C46 32 40 40 32 38C30 32 36 25 44 24Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
      <path d="M62 23C60 14 66 6 74 9C75 15 70 22 62 23Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1" />
      <path d="M78 24C82 33 76 41 68 39C66 33 71 25 78 24Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
      <path d="M96 23C96 15 103 9 110 12C110 18 104 23 96 23Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export default function EditorialRomanceTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#B85C7A';
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const secondaryPhoto = resolveCouplePhoto(wedding, gallery);
  const showSecondary = Boolean(secondaryPhoto && secondaryPhoto !== heroImage);
  const copy = resolveTemplateCopy(wedding);

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
      data-native-template="EditorialRomance"
      data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined}
      className={`editorial-romance relative overflow-x-clip pb-28 font-serif selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#FAF7F2',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#2E2724',
        backgroundColor: 'var(--native-paper)',
        color: 'var(--native-ink)',
        '--er-primary': motifColor,
        '--er-primary-soft': `${motifColor}18`,
        '--er-primary-border': `${motifColor}35`,
      } as CSSProperties}
    >
      {/* Cotton deckle paper texture overlay */}
      <div aria-hidden="true" data-native-grain className="pointer-events-none fixed inset-0 z-0 opacity-[0.12]" />

      {/* Hero: Luxury Fine-Art Stationery & Scrapbook Cover */}
      <section data-native-composition data-native-hero className="relative flex min-h-[94vh] items-center justify-center overflow-hidden border-b border-current/10 px-4 py-12 sm:px-8 lg:px-16 lg:py-24">
        {/* Soft background ambient gradient tint mapped to motif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${motifColor}22 0%, transparent 70%)`,
          }}
        />

        {/* Bespoke Silk & Peony Scrapbook Accent on desktop edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-4 right-2 hidden w-56 opacity-40 lg:block xl:w-64"
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Fine-Art Scrapbook Photo Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 flex justify-center lg:col-span-6 lg:order-1"
          >
            <div className="relative w-full max-w-[460px]">
              <div
                data-native-card
                data-native-portrait
                className="relative aspect-[3/4] w-full overflow-hidden border border-black/10 bg-white p-3 shadow-2xl transition-transform duration-700 hover:rotate-1 sm:p-4"
                style={{
                  boxShadow: '0 25px 60px -15px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                }}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <WeddingHeroVisual
                    wedding={wedding}
                    gallery={gallery}
                    src={heroImage}
                    ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
                    imgClassName="h-full w-full object-cover transition-transform duration-[12s] hover:scale-105"
                  />
                  {heroImage ? (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 text-left text-white">
                        {wedding.quote?.trim() ? (
                          <p className="font-serif text-sm italic text-white/95">
                            &ldquo;{wedding.quote.trim()}&rdquo;
                          </p>
                        ) : (
                          <p className="font-serif text-sm italic text-white/95">
                            {formattedDate || wedding.venue_name}
                          </p>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {showSecondary && (
                <motion.div
                  initial={{ opacity: 0, rotate: -6, x: -20 }}
                  animate={{ opacity: 1, rotate: -4, x: 0 }}
                  transition={{ duration: 0.9, delay: 0.25 }}
                  className="absolute -bottom-8 -left-8 z-20 hidden aspect-[4/5] w-44 border border-black/5 bg-white p-2 shadow-xl sm:block"
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <WeddingHeroVisual
                      wedding={wedding}
                      gallery={gallery}
                      src={secondaryPhoto}
                      alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                      imgClassName="h-full w-full object-cover"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 opacity-60 backdrop-blur-sm"
                    style={{ backgroundColor: `${motifColor}33`, border: '1px dashed rgba(0,0,0,0.15)' }}
                  />
                </motion.div>
              )}

              {/* Postal Monogram Badge */}
              <div className="absolute -top-4 right-0 z-30 sm:-right-6">
                <WeddingMonogram wedding={wedding} className="scale-75" />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Letterpress Typography */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 flex flex-col items-center space-y-6 text-center lg:col-span-6 lg:order-2 lg:items-start lg:text-left"
          >
            <div className="flex items-center gap-3" style={{ color: motifColor }}>
              <BotanicalSprig className="h-6 w-16 rotate-180" />
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.35em] sm:text-xs">
                {copy.eyebrow}
              </span>
              <BotanicalSprig className="h-6 w-16" />
            </div>

            <h1
              data-native-title
              className={`break-words text-4xl font-light leading-[0.94] tracking-tight text-[var(--native-ink)] sm:text-6xl lg:text-[clamp(3.3rem,6.5vw,5.6rem)] ${titleStyle.className}`}
              style={titleStyle.style}
            >
              <span className="block font-serif">{wedding.bride_name}</span>
              <span className="my-2 block font-serif text-[0.5em] font-normal italic" style={{ color: motifColor }}>
                &amp;
              </span>
              <span className="block font-serif">{wedding.groom_name}</span>
            </h1>

            <div className="h-px w-24" style={{ backgroundColor: `${motifColor}44` }} />

            <div className="space-y-1.5 text-sm leading-relaxed sm:text-base">
              {formattedDate ? (
                <p className="text-xs font-sans font-bold uppercase tracking-[0.25em] sm:text-sm" style={{ color: motifColor }}>
                  {formattedDate}
                </p>
              ) : null}
              {wedding.venue_name ? (
                <p className="font-serif text-lg italic text-current sm:text-xl">
                  {wedding.venue_name}
                </p>
              ) : null}
              {wedding.venue_address ? (
                <p className="max-w-md font-sans text-xs tracking-wide text-current opacity-70">
                  {wedding.venue_address}
                </p>
              ) : null}
            </div>

            <p className="max-w-lg font-serif text-base italic leading-relaxed text-current opacity-85 sm:text-lg">
              &ldquo;{wedding.story?.trim() || copy.subtitle}&rdquo;
            </p>

            {/* Primary Builder-Driven Action + Utilities */}
            <div className="flex flex-col items-center gap-3 pt-2 lg:items-start">
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <a
                  data-wedding-control="primary"
                  href={copy.ctaHref}
                  aria-label={wedding.is_thank_you_mode ? 'View Memories' : 'RSVP Confirmation'}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--native-action)] px-9 py-3 text-xs font-sans font-bold uppercase tracking-[0.25em] text-[var(--native-on-action)] shadow-lg transition-all hover:opacity-90"
                >
                  {copy.ctaLabel}
                </a>
                <a
                  data-wedding-control="secondary"
                  href="#details"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border px-8 py-3 text-xs font-sans font-bold uppercase tracking-[0.2em] transition-colors hover:bg-black/5"
                  style={{
                    borderColor: `${motifColor}55`,
                    color: 'var(--native-ink)',
                  }}
                >
                  Event Details
                </a>
              </div>
              <TemplateHeroActions wedding={wedding} variant="pill" className="lg:!justify-start" />
            </div>
          </motion.div>
        </div>
      </section>

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

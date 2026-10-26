'use client';

import { motion } from 'framer-motion';
import { MonogramMark } from '@/components/MonogramMark';
import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { BioSection, CountdownTimer, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

// Handcrafted botanical sprig SVG that scales dynamically with motif color
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
      <path
        d="M6 24C32 22 55 23 114 24"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 3"
        opacity="0.5"
      />
      {/* Delicate hand-drawn leaves */}
      <path
        d="M28 23C24 16 28 8 36 10C38 16 34 22 28 23Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M44 24C46 32 40 40 32 38C30 32 36 25 44 24Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M62 23C60 14 66 6 74 9C75 15 70 22 62 23Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M78 24C82 33 76 41 68 39C66 33 71 25 78 24Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M96 23C96 15 103 9 110 12C110 18 104 23 96 23Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function EditorialRomanceTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  // Completely dynamic colors: honors couple's chosen motif color, never hardcoded
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#B85C7A';
  const heroImage = wedding.hero_image || wedding.couple_photo || '/logo.png';
  const secondaryPhoto = wedding.couple_photo && wedding.couple_photo !== heroImage
    ? wedding.couple_photo
    : (Array.isArray(gallery) && gallery.length > 0 && typeof gallery[0] === 'string' ? gallery[0] : null);

  const formattedDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div
      data-native-template="EditorialRomance" data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined} className={`editorial-romance relative pb-28 font-serif selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#FAF7F2',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#2E2724',
        backgroundColor: 'var(--native-paper)',
        color: 'var(--native-ink)',
        // CSS custom properties derived dynamically from the couple's selected motif
        '--er-primary': motifColor,
        '--er-primary-soft': `${motifColor}18`,
        '--er-primary-border': `${motifColor}35`,
      } as CSSProperties}
    >
      {/* Handcrafted deckle paper texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(var(--wedding-ink, #2E2724) 1px, transparent 1px), radial-gradient(var(--wedding-ink, #2E2724) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      {/* Hero: Luxury Mediterranean Stationery & Scrapbook Cover */}
      <section data-native-composition data-native-hero className="relative min-h-[94vh] flex items-center justify-center px-4 sm:px-8 lg:px-16 py-12 lg:py-24 overflow-hidden border-b border-current/10">
        {/* Soft background ambient gradient tint mapped to motif */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(circle, ${motifColor}22 0%, transparent 70%)`,
          }}
        />

        <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          {/* Left Column: Overlapping Fine-Art Scrapbook Photo Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex justify-center order-2 lg:order-1"
          >
            <div className="relative w-full max-w-[460px]">
              {/* Primary Photo Frame: Luxury fine-art matte with deckle border shadow */}
              <div data-native-card data-native-portrait
                className="relative aspect-[3/4] w-full overflow-hidden bg-white p-3 sm:p-4 shadow-2xl transition-transform duration-700 hover:rotate-1"
                style={{
                  boxShadow: '0 25px 60px -15px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={heroImage}
                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                    priority
                    fill
                    sizes="(max-width: 1024px) 100vw, 460px"
                    className="object-cover transition-transform duration-[12s] hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Caption on Photo */}
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                    <p className="text-[9px] font-sans uppercase tracking-[0.3em] text-white/80">
                      Chapter One
                    </p>
                    <p className="font-serif italic text-sm text-white/95 mt-0.5">
                      {wedding.quote || 'An enduring promise written in golden light.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overlapping Secondary Photo / Keepsake (Scrapbook Accent) */}
              {secondaryPhoto && (
                <motion.div
                  initial={{ opacity: 0, rotate: -6, x: -20 }}
                  animate={{ opacity: 1, rotate: -4, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="hidden sm:block absolute -bottom-8 -left-8 w-44 aspect-[4/5] bg-white p-2 shadow-xl border border-black/5 z-20"
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={secondaryPhoto}
                      alt="Together"
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                  {/* Decorative washi tape effect */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 opacity-60 backdrop-blur-sm"
                    style={{ backgroundColor: `${motifColor}33`, border: '1px dashed rgba(0,0,0,0.15)' }}
                  />
                </motion.div>
              )}

              {/* Vintage Postal Seal Badge */}
              <div className="absolute -top-4 right-0 sm:-right-6 z-30">
                <MonogramMark initials={wedding.logo_initials} brideName={wedding.bride_name} groomName={wedding.groom_name} shape={wedding.logo_shape} color={wedding.logo_color} motifColor={motifColor} animation={wedding.logo_animation} fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined} size="sm" className="mx-auto" />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Letterpress Typography & Stationery Invitation */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 order-1 lg:order-2"
          >
            {/* Handcrafted Botanical Eyebrow */}
            <div className="flex items-center gap-3" style={{ color: motifColor }}>
              <BotanicalSprig className="w-16 h-6 rotate-180" />
              <span className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.35em] font-semibold">
                Together With Their Families
              </span>
              <BotanicalSprig className="w-16 h-6" />
            </div>

            {/* Couple Title with Graceful Script & Serif Harmony */}
            <h1 data-native-title className={`text-4xl sm:text-6xl lg:text-[clamp(3.3rem,6.5vw,5.6rem)] font-light leading-[0.94] tracking-tight text-[var(--native-ink)] break-words ${titleStyle.className}`} style={titleStyle.style}>
              <span className="block font-serif">{wedding.bride_name}</span>
              <span
                className="my-2 block text-[0.5em] italic font-serif font-normal"
                style={{ color: motifColor }}
              >
                &amp;
              </span>
              <span className="block font-serif">{wedding.groom_name}</span>
            </h1>

            {/* Fine-line divider */}
            <div className="h-px w-24" style={{ backgroundColor: `${motifColor}44` }} />

            {/* Date & Location Plaque */}
            <div className="space-y-1.5 text-sm sm:text-base leading-relaxed">
              <p
                className="font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.25em]"
                style={{ color: motifColor }}
              >
                {formattedDate}
              </p>
              <p className="font-serif italic text-lg sm:text-xl text-current">
                {wedding.venue_name}
              </p>
              {wedding.venue_address && (
                <p className="text-xs font-sans text-current opacity-70 tracking-wide max-w-md">
                  {wedding.venue_address}
                </p>
              )}
            </div>

            {/* Story / Invitation Prologue */}
            <p className="text-base sm:text-lg leading-relaxed max-w-lg font-serif italic text-current opacity-85">
              &ldquo;{wedding.story ||
                'Two lives woven into a single journey of devotion, laughter, and lifelong friendship. We joyfully request the pleasure of your company.'}&rdquo;
            </p>

            {/* CTA Buttons styled like luxury stationery cards */}
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start items-center gap-4">
              <a data-wedding-control="primary"
                href="#rsvp"
                aria-label="RSVP Confirmation"
                className="inline-flex min-h-[48px] items-center justify-center px-9 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  backgroundColor: motifColor,
                  boxShadow: `0 12px 28px -6px ${motifColor}44`,
                }}
              >
                Confirm Attendance
              </a>
              <a data-wedding-control="primary"
                href="#details"
                className="inline-flex min-h-[48px] items-center justify-center px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.2em] border transition-colors hover:bg-black/5"
                style={{
                  borderColor: `${motifColor}55`,
                  color: 'var(--wedding-ink, #2E2724)',
                }}
              >
                Event Details
              </a>
            </div>
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

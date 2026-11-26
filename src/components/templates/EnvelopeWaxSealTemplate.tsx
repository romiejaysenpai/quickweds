'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { useSectionActions } from '@/context/SectionContext';

import { DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import {
  formatWeddingDate,
  resolveTemplateCopy,
  resolveWeddingMedia,
  SharedNewSections,
  TEMPLATE_ELEMENT_ASSETS,
  TemplateHeroActions,
  useCountdown,
  WeddingHeroVisual,
  WeddingMonogram,
} from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function EnvelopeWaxSealTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#3D5239';
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);
  const { registerSection, unregisterSection } = useSectionActions();
  const hasStory = Boolean(wedding.story?.trim() || (wedding.is_thank_you_mode && wedding.thank_you_message?.trim()));

  useEffect(() => {
    if (!hasStory) return;
    registerSection('bio', 'Our Story');
    return () => unregisterSection('bio');
  }, [hasStory, registerSection, unregisterSection]);

  const parsedDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : null;
  const hasValidDate = Boolean(parsedDate && !Number.isNaN(parsedDate.getTime()));
  const weddingYear = hasValidDate ? parsedDate!.getFullYear() : '';
  const weddingMonth = hasValidDate ? parsedDate!.toLocaleDateString('en-US', { month: 'long' }).toUpperCase() : '';
  const weddingDayName = hasValidDate ? parsedDate!.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() : '';
  const weddingDayNum = hasValidDate ? String(parsedDate!.getDate()).padStart(2, '0') : '';

  const firstDayOfMonth = hasValidDate ? new Date(parsedDate!.getFullYear(), parsedDate!.getMonth(), 1).getDay() : 0;
  const daysInMonth = hasValidDate ? new Date(parsedDate!.getFullYear(), parsedDate!.getMonth() + 1, 0).getDate() : 0;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div
      data-native-template="EnvelopeWaxSeal"
      data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined}
      className={`envelope-wax-seal-template relative overflow-x-clip pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F5F4EE',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#2A3027',
        backgroundColor: 'var(--native-paper)',
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Cotton deckle paper grain layer */}
      <div aria-hidden="true" data-native-grain className="pointer-events-none absolute inset-0 z-0 opacity-[0.14]" />

      {/* ── TOP ENVELOPE FLAP WITH BESPOKE 3D WAX SEAL ── */}
      <div data-native-envelope data-native-accent-panel className="relative z-10 w-full bg-[var(--native-action)] px-4 pt-8 pb-16 text-center text-[var(--native-on-action)] shadow-md">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
          style={{
            background: 'linear-gradient(to bottom right, var(--native-action) 49%, var(--native-paper) 51%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-md space-y-2">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.35em] opacity-80">
            {copy.eyebrow}
          </p>
          <p className="font-serif text-xl italic tracking-wider">
            {wedding.bride_name} &amp; {wedding.groom_name}
          </p>
          {wedding.wedding_date ? (
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] opacity-85">
              {formatWeddingDate(wedding.wedding_date)}
            </p>
          ) : null}
        </div>

        {/* Sculpted Wax Seal + Builder Monogram */}
        <div className="absolute -bottom-9 left-1/2 z-20 -translate-x-1/2">
          <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TEMPLATE_ELEMENT_ASSETS.waxSeal}
              alt=""
              aria-hidden="true"
              className="pointer-events-none h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)]"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center scale-[0.55]">
              <WeddingMonogram wedding={wedding} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN INVITATION STATIONERY CARD ── */}
      <section data-native-composition data-native-hero className="relative z-10 mx-auto max-w-3xl overflow-hidden px-4 pt-20 pb-12 text-center sm:px-8">
        <div className="mb-6 flex justify-center">
          <svg
            viewBox="0 0 240 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-auto w-48 text-[var(--native-ink)] opacity-75 sm:w-60"
            aria-hidden="true"
          >
            <path d="M12 50C40 20 80 14 120 14C160 14 200 20 228 50" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <path d="M40 30C35 22 42 12 52 16C54 24 48 30 40 30Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1" />
            <path d="M70 20C68 10 78 4 86 9C87 18 80 23 70 20Z" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="1" />
            <path d="M104 15C106 6 116 3 120 11C119 19 112 21 104 15Z" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1" />
            <path d="M136 15C128 21 121 19 120 11C124 3 134 6 136 15Z" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1" />
            <path d="M170 20C160 23 153 18 154 9C162 4 172 10 170 20Z" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="1" />
            <path d="M200 30C192 30 186 24 188 16C198 12 205 22 200 30Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        <h1
          data-native-title
          className={`break-words font-serif text-4xl tracking-tight text-[var(--native-ink)] sm:text-6xl ${titleStyle.className}`}
          style={titleStyle.style}
        >
          <span className="block">{wedding.bride_name}</span>
          <span className="my-2 block text-[.5em] font-light italic text-[var(--native-ink)]">&amp;</span>
          <span className="block">{wedding.groom_name}</span>
        </h1>

        <p className="mx-auto mb-6 max-w-md font-serif text-base italic leading-relaxed text-[var(--native-ink)] opacity-85 sm:text-lg">
          {copy.subtitle}
        </p>

        {hasValidDate ? (
          <div className="my-4 inline-flex flex-col items-center border-y border-[var(--native-border)]/45 px-8 py-3">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-accent)]">
              {weddingMonth}
            </span>
            <div className="my-1 flex items-center gap-4">
              <span className="text-xs font-sans uppercase tracking-widest text-[var(--native-ink)]">
                {weddingDayName}
              </span>
              <span className="px-2 font-serif text-3xl font-bold text-[var(--native-ink)] sm:text-4xl">
                {weddingDayNum}
              </span>
              <span className="text-xs font-sans tracking-widest text-[var(--native-ink)]">
                {weddingYear}
              </span>
            </div>
            {wedding.venue_name ? (
              <span className="mt-1 text-[11px] font-sans uppercase tracking-[0.2em] opacity-75">
                {wedding.venue_name}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Primary Action + Interactive Utilities */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <a
            data-wedding-control="primary"
            href={copy.ctaHref}
            className="inline-flex min-h-[46px] items-center justify-center rounded-sm bg-[var(--native-action)] px-7 py-3 text-xs font-sans font-semibold uppercase tracking-[0.24em] text-[var(--native-on-action)] shadow-sm transition-all"
          >
            {copy.ctaLabel}
          </a>
          <TemplateHeroActions wedding={wedding} variant="editorial" />
        </div>

        {/* Couple Portrait Frame (or Monogram Crest when no photo uploaded) */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto mt-10 mb-4 max-w-lg px-2"
        >
          <div data-native-portrait className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-4 border-white shadow-xl">
            <WeddingHeroVisual
              wedding={wedding}
              gallery={gallery}
              src={heroImage}
              ornamentSrc={TEMPLATE_ELEMENT_ASSETS.waxSeal}
              imgClassName="h-full w-full object-cover"
            />
            {heroImage ? (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            ) : null}
          </div>
        </motion.div>

        {wedding.quote?.trim() ? (
          <blockquote className="mx-auto mt-5 max-w-md font-serif text-sm italic leading-relaxed text-[var(--native-ink)] sm:text-base">
            &ldquo;{wedding.quote.trim()}&rdquo;
          </blockquote>
        ) : null}

        {wedding.background_music_enabled && wedding.background_music_url ? (
          <div data-native-card className="mx-auto mt-7 max-w-sm rounded-2xl border border-[var(--native-border)] bg-[var(--native-paper)] p-4 shadow-sm">
            <p className="mb-2 text-xs font-sans uppercase tracking-[0.2em] text-[var(--native-ink)] opacity-80">
              {wedding.background_music_title || 'Our Wedding Song'}
            </p>
            <audio
              controls
              preload="none"
              src={wedding.background_music_url}
              aria-label={wedding.background_music_title || 'Our wedding song'}
              className="w-full"
            />
          </div>
        ) : null}
      </section>

      {/* ── ACCENT BAND: COUPLE NOTE, COUNTDOWN & WEDDING MONTH CALENDAR ── */}
      <section id={hasStory ? 'bio' : undefined} data-native-accent-panel className="relative z-10 overflow-hidden bg-[var(--native-action)] px-4 py-16 text-[var(--native-on-action)] sm:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-8 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, var(--native-paper) 35%, transparent 36%)',
            backgroundSize: '32px 16px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
          {(wedding.story?.trim() || wedding.thank_you_message?.trim()) ? (
            <p className="mx-auto max-w-md font-serif text-base italic sm:text-lg">
              &ldquo;{wedding.is_thank_you_mode && wedding.thank_you_message?.trim() ? wedding.thank_you_message.trim() : wedding.story!.trim()}&rdquo;
            </p>
          ) : null}

          <div className="mx-auto h-px w-12 bg-current opacity-35" />

          {!wedding.is_thank_you_mode && (
            <div id="countdown" data-native-countdown-section className="py-2">
              <p className="mb-3 text-[10px] font-sans font-bold uppercase tracking-[0.3em] opacity-90">
                {isPast ? 'Celebrating Our Marriage' : 'Countdown to the Big Day'}
              </p>
              <div role="timer" aria-label="Time until the wedding" className="flex items-center justify-center gap-2 font-mono text-2xl font-light sm:gap-4 sm:text-3xl">
                <div className="rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                  <span className="block font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest opacity-85">Days</span>
                </div>
                <span aria-hidden="true">:</span>
                <div className="rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                  <span className="block font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest opacity-85">Hours</span>
                </div>
                <span aria-hidden="true">:</span>
                <div className="rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                  <span className="block font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest opacity-85">Mins</span>
                </div>
                <span aria-hidden="true">:</span>
                <div className="rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                  <span className="block font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest opacity-85">Secs</span>
                </div>
              </div>
            </div>
          )}

          {hasValidDate ? (
            <div data-native-card className="mx-auto mt-8 max-w-xs rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <p className="mb-3 text-[10px] font-sans font-bold uppercase tracking-[0.3em] opacity-90">
                The Big Day • {weddingMonth} {weddingYear}
              </p>
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-sans font-bold opacity-85">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <span key={`empty-${i}`} className="opacity-0">0</span>
                ))}
                {calendarDays.map((d) => {
                  const isWeddingDay = d === parsedDate!.getDate();
                  return (
                    <span
                      key={d}
                      className={`flex h-7 w-7 items-center justify-center rounded-full font-sans text-[11px] ${
                        isWeddingDay
                          ? 'bg-[var(--native-paper)] font-bold text-[var(--native-ink)] shadow-md ring-2 ring-white/40'
                          : 'opacity-85'
                      }`}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

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
        cardStyle={wedding.card_style}
        wedding={wedding}
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
          wedding={wedding}
        />
      )}

      <GiftSection id="gift" wedding={wedding} />

      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
    </div>
  );
}

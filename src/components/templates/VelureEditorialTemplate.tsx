'use client';

import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { Heart, Hash } from 'lucide-react';
import { BioSection, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import {
  resolveCouplePhoto,
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

export default function VelureEditorialTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#4E5D4C';
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const couplePhoto = resolveCouplePhoto(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);

  const parsedDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : null;
  const hasValidDate = Boolean(parsedDate && !Number.isNaN(parsedDate.getTime()));
  const formattedMonth = hasValidDate ? parsedDate!.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  const formattedDay = hasValidDate ? parsedDate!.getDate() : '';
  const formattedYear = hasValidDate ? parsedDate!.getFullYear() : '';
  const formattedWeekday = hasValidDate ? parsedDate!.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() : '';

  const showSecondPortrait = Boolean(couplePhoto && couplePhoto !== heroImage);

  return (
    <div
      data-native-template="VelureEditorial"
      data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined}
      className={`velure-editorial-template relative overflow-x-clip pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F8F6F0',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#2A3329',
        backgroundColor: 'var(--native-paper)',
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Subtle cotton deckle finish */}
      <div aria-hidden="true" data-native-grain className="pointer-events-none absolute inset-0 z-0 opacity-[0.12]" />

      {/* Soft Ambient Gradient Wash (no expensive full-viewport blur filter) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 82% 14%, color-mix(in srgb, var(--native-accent) 28%, transparent) 0%, transparent 45%), radial-gradient(circle at 18% 82%, color-mix(in srgb, var(--native-accent) 22%, transparent) 0%, transparent 45%)',
        }}
      />

      {/* ── PANEL 1: MONOGRAM, EDITORIAL TITLES, HERO & SILK RIBBON ACCENT ── */}
      <section data-native-composition data-native-hero className="relative z-10 mx-auto max-w-2xl px-4 pt-12 pb-16 text-center sm:px-8">
        {/* Bespoke silk chiffon & peony accent corner on desktop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 -right-6 hidden w-44 rotate-6 object-contain opacity-65 sm:block md:w-52"
        />

        <WeddingMonogram wedding={wedding} className="mx-auto mb-5" />

        <p className="mb-3 text-[10px] font-sans font-semibold uppercase tracking-[0.35em] text-[var(--native-ink)] opacity-80">
          {copy.eyebrow}
        </p>

        <h1
          data-native-title
          className={`break-words font-serif text-4xl uppercase leading-[0.95] tracking-tight text-[var(--native-ink)] sm:text-6xl ${titleStyle.className}`}
          style={titleStyle.style}
        >
          <span>{wedding.bride_name}</span>
          <span className="my-2 block font-serif text-2xl font-light lowercase italic text-[var(--native-accent)] sm:text-3xl">
            and
          </span>
          <span>{wedding.groom_name}</span>
        </h1>

        <div className="my-4 flex justify-center">
          <Heart className="h-3.5 w-3.5 fill-current text-[var(--native-accent)]" aria-hidden="true" />
        </div>

        {hasValidDate && (
          <>
            <div className="my-2 inline-flex items-center gap-4 border-y border-[var(--native-border)]/45 px-8 py-2.5 text-xs font-sans tracking-widest text-[var(--native-ink)]">
              <span className="font-bold">{formattedMonth}</span>
              <span className="font-serif text-2xl font-bold text-[var(--native-ink)]">{formattedDay}</span>
              <span className="font-bold">{formattedYear}</span>
            </div>
            <p className="mt-1 text-[10px] font-sans uppercase tracking-[0.3em] text-[var(--native-ink)] opacity-80">
              {formattedWeekday}
            </p>
          </>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <a
            data-wedding-control="primary"
            href={copy.ctaHref}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--native-action)] px-9 py-3 text-xs font-sans font-bold uppercase tracking-[0.24em] text-[var(--native-on-action)] shadow-md transition-transform"
          >
            {copy.ctaLabel}
          </a>
          <TemplateHeroActions wedding={wedding} variant="editorial" />
        </div>

        {/* Full Portrait Frame */}
        <div data-native-portrait className="relative mx-auto mt-10 max-w-lg">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
            <WeddingHeroVisual
              wedding={wedding}
              gallery={gallery}
              src={heroImage}
              ornamentSrc={TEMPLATE_ELEMENT_ASSETS.ribbonVelvet}
              imgClassName="h-full w-full object-cover"
            />
            {heroImage ? (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            ) : null}
          </div>

          {wedding.background_music_enabled && wedding.background_music_url ? (
            <div data-native-card className="mx-auto mt-6 max-w-sm rounded-2xl border border-[var(--native-border)] bg-[var(--native-paper)] p-4 shadow-md">
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
        </div>
      </section>

      {!wedding.is_thank_you_mode && wedding.wedding_date && (
        <section id="countdown" data-native-composition data-native-countdown-section className="relative z-10 mx-auto max-w-2xl px-4 py-12 text-center sm:px-8">
          <p className="mb-3 text-[10px] font-sans uppercase tracking-[0.35em] text-[var(--native-ink)] opacity-80">
            {isPast ? 'Our Wedding Day Has Arrived' : 'Until We Say I Do'}
          </p>
          <h2
            data-native-title
            className={`mb-7 font-serif text-3xl text-[var(--native-ink)] sm:text-4xl ${titleStyle.className}`}
            style={titleStyle.style}
          >
            The Countdown
          </h2>
          <div data-native-countdown role="timer" aria-label="Time until the wedding" className="mx-auto grid max-w-md grid-cols-4 border-y border-[var(--native-border)] py-6">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="min-w-0 border-r border-[var(--native-border)] px-1 last:border-r-0">
                <span className="block font-serif text-2xl tabular-nums text-[var(--native-ink)] sm:text-4xl">{String(value).padStart(2, '0')}</span>
                <span className="mt-2 block text-[9px] font-sans uppercase tracking-wide text-[var(--native-ink)] sm:text-[10px]">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── OPTIONAL COUPLE QUOTE, HASHTAG & SECONDARY PORTRAIT ARCH ── */}
      {(wedding.quote?.trim() || wedding.hashtag?.trim() || showSecondPortrait) && (
        <section data-native-composition className="relative z-10 mx-auto max-w-2xl px-4 py-10 text-center sm:px-8">
          {wedding.quote?.trim() && (
            <div data-native-card className="mx-auto my-4 max-w-md rounded-3xl border border-[var(--native-border)]/45 bg-white/60 p-6 text-center backdrop-blur-sm sm:p-8">
              <p className="mb-2 font-serif text-2xl text-[var(--native-accent)]">&ldquo;</p>
              <p className="font-serif text-sm italic leading-relaxed text-[var(--native-ink)] sm:text-base">
                &ldquo;{wedding.quote.trim()}&rdquo;
              </p>
              <div className="mt-4 flex justify-center">
                <Heart className="h-3 w-3 fill-current text-[var(--native-accent)]" aria-hidden="true" />
              </div>
            </div>
          )}

          {wedding.hashtag?.trim() && (
            <div data-native-card className="mx-auto mt-6 max-w-xs rounded-2xl border border-[var(--native-border)]/35 bg-white/70 p-4 text-center shadow-sm">
              <Hash className="mx-auto mb-1.5 h-5 w-5 text-[var(--native-accent)]" aria-hidden="true" />
              <p className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--native-ink)]">Capture &amp; Tag</p>
              <p className="mt-1 font-serif text-sm italic text-[var(--native-ink)]">
                #{wedding.hashtag.replace(/^#/, '')}
              </p>
            </div>
          )}

          {showSecondPortrait && (
            <div className="relative mx-auto mt-8 max-w-xs">
              <div data-native-card className="relative aspect-[3/4] w-full overflow-hidden rounded-t-full border-2 border-[var(--native-border)]/60 bg-white p-1.5 shadow-lg">
                <div className="relative h-full w-full overflow-hidden rounded-t-full">
                  <WeddingHeroVisual
                    wedding={wedding}
                    gallery={gallery}
                    src={couplePhoto}
                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                    imgClassName="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {wedding.story && <BioSection id="bio" wedding={wedding} />}
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

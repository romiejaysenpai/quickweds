'use client';

import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { MapPin } from 'lucide-react';
import { BioSection, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import {
  formatWeddingDate,
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

function TornPaperDivider({
  className = '',
  position = 'bottom',
}: {
  className?: string;
  position?: 'top' | 'bottom';
}) {
  return (
    <div
      className={`z-20 w-full overflow-hidden leading-none ${className}`}
      style={{
        transform: position === 'top' ? 'rotate(180deg)' : 'none',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="h-8 w-full text-[var(--native-paper)] sm:h-12"
      >
        <path
          d="M0 0L30 18L70 8L110 24L160 12L200 20L250 8L300 22L360 10L420 25L470 14L520 22L580 8L640 24L700 12L760 20L820 6L880 22L940 10L1000 24L1060 12L1120 20L1160 8L1200 18V60H0V0Z"
          fill="currentColor"
        />
        <path
          d="M0 0L30 18L70 8L110 24L160 12L200 20L250 8L300 22L360 10L420 25L470 14L520 22L580 8L640 24L700 12L760 20L820 6L880 22L940 10L1000 24L1060 12L1120 20L1160 8L1200 18"
          stroke="#D6C6B6"
          strokeWidth="1.5"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

export default function TornPaperTerracottaTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#B65A3C';
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const couplePhoto = resolveCouplePhoto(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);

  const parsedDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : null;
  const hasValidDate = Boolean(parsedDate && !Number.isNaN(parsedDate.getTime()));
  const formattedMonth = hasValidDate ? parsedDate!.toLocaleDateString('en-US', { month: 'long' }).toUpperCase() : '';
  const formattedDay = hasValidDate ? parsedDate!.getDate() : '';
  const formattedYear = hasValidDate ? parsedDate!.getFullYear() : '';
  const formattedWeekday = hasValidDate ? parsedDate!.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() : '';
  const showSecondPortrait = Boolean(couplePhoto && couplePhoto !== heroImage);

  return (
    <div
      data-native-template="TornPaperTerracotta"
      data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined}
      className={`torn-paper-terracotta-template relative overflow-x-clip pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F7F2EB',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#4A3027',
        backgroundColor: hasBackgroundChoice ? 'var(--native-paper)' : '#38251E',
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Cotton deckle paper texture overlay */}
      <div aria-hidden="true" data-native-grain className="pointer-events-none absolute inset-0 z-0 opacity-[0.14]" />

      {/* ── PANEL 1: TORN DECKLE PAPER INVITATION HERO ── */}
      <div className="relative z-10 mx-auto max-w-2xl px-3 pt-10 sm:px-6">
        <div
          data-native-hero
          data-native-card
          className="relative overflow-hidden rounded-t-3xl bg-[var(--native-paper)] px-4 pt-10 pb-16 text-center shadow-2xl sm:px-10"
        >
          {/* Terracotta floral corner botanicals */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TEMPLATE_ELEMENT_ASSETS.terracottaFlorals}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 -left-4 w-28 rotate-180 object-contain opacity-65 sm:w-36"
          />

          <div className="relative z-10">
            {wedding.quote?.trim() ? (
              <blockquote className="mx-auto mb-6 max-w-xs font-serif text-xs italic leading-relaxed text-[var(--native-ink)] opacity-90 sm:text-sm">
                &ldquo;{wedding.quote.trim()}&rdquo;
              </blockquote>
            ) : null}

            <div className="mb-4 inline-block border-b border-[var(--native-border)]/35 px-6 py-2">
              <WeddingMonogram wedding={wedding} className="scale-75" />
            </div>

            <p className="mb-8 text-[10px] font-sans font-bold uppercase tracking-[0.35em] text-[var(--native-accent)] sm:text-xs">
              {copy.eyebrow}
            </p>

            {/* Primary Portrait with Ripped Bottom Edge */}
            <div data-native-portrait className="relative mx-auto mb-8 max-w-md">
              <div className="relative aspect-[3/4] w-full overflow-hidden border-2 border-white shadow-lg">
                <WeddingHeroVisual
                  wedding={wedding}
                  gallery={gallery}
                  src={heroImage}
                  ornamentSrc={TEMPLATE_ELEMENT_ASSETS.terracottaFlorals}
                  imgClassName="h-full w-full object-cover"
                />
              </div>
              <TornPaperDivider position="bottom" className="absolute inset-x-0 -bottom-1" />
            </div>

            {/* Terracotta Rose & Pampas Botanical Ornament Crest */}
            <div className="my-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TEMPLATE_ELEMENT_ASSETS.terracottaFlorals}
                alt=""
                aria-hidden="true"
                className="pointer-events-none h-24 w-auto object-contain opacity-90 sm:h-28"
              />
            </div>

            <h1
              data-native-title
              className={`break-words font-serif text-4xl italic tracking-wide text-[var(--native-ink)] sm:text-6xl ${titleStyle.className}`}
              style={titleStyle.style}
            >
              <span>{wedding.bride_name}</span>
              <span className="my-1 block text-2xl font-light not-italic text-[var(--native-accent)]">&amp;</span>
              <span>{wedding.groom_name}</span>
            </h1>

            <p className="mx-auto mt-3 max-w-xs font-serif text-xs italic text-[var(--native-ink)] opacity-85 sm:text-sm">
              {copy.subtitle}
            </p>

            {hasValidDate && (
              <div className="my-5 inline-block border-y border-[var(--native-border)]/40 px-8 py-2.5">
                <span className="mb-1 block text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-accent)]">
                  {formattedMonth}
                </span>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xs font-sans tracking-widest text-[var(--native-ink)]">{formattedWeekday}</span>
                  <span className="font-serif text-3xl font-bold text-[var(--native-ink)]">{formattedDay}</span>
                  <span className="text-xs font-sans tracking-widest text-[var(--native-ink)]">{formattedYear}</span>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col items-center gap-3">
              <a
                data-wedding-control="primary"
                href={copy.ctaHref}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--native-action)] px-9 py-3 text-xs font-sans font-bold uppercase tracking-[0.24em] text-[var(--native-on-action)] shadow-lg transition-all"
              >
                {copy.ctaLabel}
              </a>
              <TemplateHeroActions wedding={wedding} variant="pill" />
            </div>

            {!wedding.is_thank_you_mode && (
              <div id="countdown" data-native-countdown-section className="mt-8 pt-4">
                <p className="mb-3 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-ink)]">
                  {isPast ? 'Celebrating Our Union' : 'Time Remaining'}
                </p>
                <div
                  data-native-countdown
                  role="timer"
                  aria-label="Time until the wedding"
                  className="flex items-center justify-center gap-2 font-mono text-xl font-bold text-[var(--native-ink)] sm:gap-4 sm:text-2xl"
                >
                  <div data-native-card className="rounded-xl border border-[var(--native-border)]/20 bg-[var(--native-paper)] px-3 py-2">
                    <span className="block">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Days</span>
                  </div>
                  <span aria-hidden="true">:</span>
                  <div data-native-card className="rounded-xl border border-[var(--native-border)]/20 bg-[var(--native-paper)] px-3 py-2">
                    <span className="block">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Hours</span>
                  </div>
                  <span aria-hidden="true">:</span>
                  <div data-native-card className="rounded-xl border border-[var(--native-border)]/20 bg-[var(--native-paper)] px-3 py-2">
                    <span className="block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Mins</span>
                  </div>
                  <span aria-hidden="true">:</span>
                  <div data-native-card className="rounded-xl border border-[var(--native-border)]/20 bg-[var(--native-paper)] px-3 py-2">
                    <span className="block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Secs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PANEL 2: VENUE SPOTLIGHT & OPTIONAL SECONDARY KEEPSAKE PHOTO ── */}
      {(wedding.reception_venue_name || wedding.venue_name || showSecondPortrait) && (
        <div className="relative z-10 mx-auto my-6 max-w-2xl px-3 sm:px-6">
          <div data-native-card className="relative rounded-b-3xl bg-[var(--native-paper)] px-4 py-12 text-center shadow-2xl sm:px-10">
            {wedding.wedding_time && (
              <p className="mb-1 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-accent)]">
                {wedding.wedding_time}
              </p>
            )}
            <h2
              data-native-title
              className={`mb-2 font-serif text-2xl uppercase tracking-wide text-[var(--native-ink)] sm:text-3xl ${titleStyle.className}`}
              style={titleStyle.style}
            >
              {wedding.reception_venue_name ? 'Reception' : 'Celebration Venue'}
            </h2>
            {(wedding.reception_venue_name || wedding.venue_name) && (
              <p className="mb-1 font-serif text-base italic text-[var(--native-ink)]">
                {wedding.reception_venue_name || wedding.venue_name}
              </p>
            )}
            {(wedding.reception_venue_address || wedding.venue_address) && (
              <p className="mx-auto mb-6 max-w-xs font-sans text-xs text-[var(--native-ink)] opacity-85">
                {wedding.reception_venue_address || wedding.venue_address}
              </p>
            )}

            {(wedding.reception_maps_link || wedding.maps_link) && (
              <a
                href={wedding.reception_maps_link || wedding.maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--native-border)]/45 bg-white/75 px-7 py-2.5 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--native-ink)] shadow-sm transition-colors hover:bg-white"
              >
                <MapPin className="h-4 w-4 text-[var(--native-accent)]" aria-hidden="true" /> View Location
              </a>
            )}

            {showSecondPortrait && (
              <div className="relative mx-auto my-10 max-w-md">
                <TornPaperDivider position="top" className="absolute inset-x-0 -top-1 z-10" />
                <div className="relative aspect-[4/5] w-full overflow-hidden shadow-md">
                  <WeddingHeroVisual
                    wedding={wedding}
                    gallery={gallery}
                    src={couplePhoto}
                    alt={`${wedding.bride_name} & ${wedding.groom_name}`}
                    imgClassName="h-full w-full object-cover"
                  />
                </div>
                <TornPaperDivider position="bottom" className="absolute inset-x-0 -bottom-1 z-10" />
              </div>
            )}

            {wedding.wedding_date && (
              <p className="mt-6 text-[10px] font-sans uppercase tracking-[0.28em] opacity-70">
                {formatWeddingDate(wedding.wedding_date)}
              </p>
            )}
          </div>
        </div>
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

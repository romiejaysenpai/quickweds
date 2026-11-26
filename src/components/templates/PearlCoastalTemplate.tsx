'use client';

import { useEffect } from 'react';
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

function Pearl({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <span
      className={`inline-block shrink-0 rounded-full shadow-sm ${sizeClass} ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F5EAE1 50%, #D4C3B7 100%)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.9)',
      }}
      aria-hidden="true"
    />
  );
}

function ScallopShell({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 44C12 44 4 36 4 24C4 12 12 4 24 4C36 4 44 12 44 24C44 36 36 44 24 44Z"
        fill="#FBF6F0"
        stroke="#D9C2B0"
        strokeWidth="1.2"
        opacity="0.85"
      />
      <path d="M24 4V44M14 8C18 18 18 30 14 40M34 8C30 18 30 30 34 40M8 16C16 22 16 26 8 32M40 16C32 22 32 26 40 32" stroke="#C5AA94" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

export default function PearlCoastalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#B98B82';
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);
  const { registerSection, unregisterSection } = useSectionActions();
  const hasStory = Boolean(wedding.story?.trim());

  useEffect(() => {
    if (!hasStory) return;
    registerSection('bio', 'Our Story');
    return () => unregisterSection('bio');
  }, [hasStory, registerSection, unregisterSection]);

  const formattedDate = wedding.wedding_date
    ? formatWeddingDate(wedding.wedding_date, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '';

  return (
    <div
      data-native-template="PearlCoastal"
      data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined}
      className={`pearl-coastal-template relative overflow-x-clip pb-28 font-serif selection:bg-[var(--native-subtle)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F8F4EE',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#382D2A',
        backgroundColor: 'var(--native-paper)',
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Textured cotton paper finish */}
      <div aria-hidden="true" data-native-grain className="pointer-events-none absolute inset-0 z-0 opacity-[0.12]" />

      {/* Scattered Organic Pearls in Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-45">
        <Pearl size="sm" className="absolute top-24 left-[10%]" />
        <Pearl size="md" className="absolute top-72 right-[12%]" />
        <Pearl size="sm" className="absolute top-[45%] left-[8%]" />
        <Pearl size="lg" className="absolute top-[65%] right-[10%]" />
        <Pearl size="sm" className="absolute top-[85%] left-[14%]" />
      </div>

      {/* ── TOP HERO: ARCH PHOTO & COASTAL SHELL VIGNETTE ── */}
      <section data-native-composition data-native-hero className="relative z-10 mx-auto max-w-2xl px-4 pt-12 pb-10 text-center sm:px-8">
        <p className="mb-4 text-[10px] font-sans font-semibold uppercase tracking-[0.35em] text-[var(--native-ink)] opacity-75 sm:text-xs">
          {copy.eyebrow}
        </p>

        <div className="mb-6 flex justify-center">
          <WeddingMonogram wedding={wedding} className="scale-75" />
        </div>

        {/* Arch Portrait Frame with Botanical Coastal Crest */}
        <div data-native-portrait className="relative mx-auto mb-8 max-w-[380px]">
          <div className="pointer-events-none absolute -top-3 -left-3 z-20 flex items-center gap-1.5">
            <ScallopShell className="h-7 w-7" />
            <Pearl size="sm" />
          </div>

          <div
            data-native-card
            className="relative aspect-[3/3.8] w-full overflow-hidden rounded-t-[160px] rounded-b-2xl border-2 border-white bg-white p-2 shadow-xl"
          >
            <div className="relative h-full w-full overflow-hidden rounded-t-[150px] rounded-b-xl">
              <WeddingHeroVisual
                wedding={wedding}
                gallery={gallery}
                src={heroImage}
                ornamentSrc={TEMPLATE_ELEMENT_ASSETS.coastalShells}
                imgClassName="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-3 -right-3 z-20 flex items-center gap-1.5">
            <Pearl size="md" />
            <ScallopShell className="h-7 w-7" />
          </div>
        </div>

        {/* Bespoke Coastal Sea-Coral & Seashell Divider Crest */}
        <div className="mx-auto mb-5 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TEMPLATE_ELEMENT_ASSETS.coastalShells}
            alt=""
            aria-hidden="true"
            className="pointer-events-none h-auto w-56 object-contain opacity-90 sm:w-64"
          />
        </div>

        <h1
          data-native-title
          className={`break-words font-serif text-3xl uppercase tracking-wide text-[var(--native-ink)] sm:text-5xl ${titleStyle.className}`}
          style={titleStyle.style}
        >
          <span>{wedding.bride_name}</span>
          <span className="my-1 block font-sans text-xl font-light italic text-[var(--native-accent)] sm:text-2xl">&amp;</span>
          <span>{wedding.groom_name}</span>
        </h1>

        {formattedDate ? (
          <p className="mt-3 text-xs font-sans font-semibold tracking-[0.25em] text-[var(--native-ink)] sm:text-sm">
            {formattedDate}
          </p>
        ) : null}

        {wedding.venue_name ? (
          <p className="mt-1.5 text-xs font-sans uppercase tracking-[0.2em] opacity-70">
            {wedding.venue_name}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col items-center gap-3">
          <a
            data-wedding-control="primary"
            href={copy.ctaHref}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--native-action)] px-8 py-3 text-xs font-sans font-semibold uppercase tracking-[0.24em] text-[var(--native-on-action)] shadow-sm transition-all"
          >
            {copy.ctaLabel}
          </a>
          <TemplateHeroActions wedding={wedding} variant="pill" />
        </div>
      </section>

      {/* ── SCALLOPED WELCOME NOTE ── */}
      <section id={hasStory ? 'bio' : undefined} data-native-composition className="relative z-10 mx-auto my-8 max-w-2xl px-4 sm:px-6">
        <div
          data-native-card
          className="relative border border-[var(--native-border)] bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm sm:p-10"
          style={{
            borderRadius: '2.5rem 1.5rem 2.5rem 1.5rem',
          }}
        >
          <div className="mb-4 flex justify-center">
            <ScallopShell className="h-8 w-8 text-[var(--native-ink)]" />
          </div>

          <h2
            data-native-title
            className={`mb-4 text-sm font-sans font-bold uppercase tracking-[0.25em] text-[var(--native-ink)] sm:text-base ${titleStyle.className}`}
            style={titleStyle.style}
          >
            {wedding.is_thank_you_mode ? 'From Both of Us' : 'Dear Family & Friends'}
          </h2>

          <p className="mx-auto max-w-md font-serif text-sm italic leading-relaxed text-[var(--native-ink)] sm:text-base">
            {wedding.story?.trim() || copy.subtitle}
          </p>

          {wedding.quote?.trim() && wedding.quote.trim() !== wedding.story?.trim() ? (
            <blockquote className="mx-auto mt-5 max-w-md text-sm italic opacity-85">
              &ldquo;{wedding.quote.trim()}&rdquo;
            </blockquote>
          ) : null}

          <div className="mt-6 flex items-center justify-center gap-2">
            <Pearl size="sm" />
            <div className="h-px w-16 bg-[var(--native-subtle)]" />
            <Pearl size="sm" />
          </div>
        </div>
      </section>

      {/* ── OPTIONAL CELEBRATION NOTE & EVENT CONTACT (ONLY WHEN CONFIGURED) ── */}
      {(wedding.rsvp_allow_children === false || wedding.contact_person) && (
        <section data-native-composition className="relative z-10 mx-auto my-8 max-w-2xl px-4 sm:px-6">
          <div className={`grid gap-4 ${wedding.rsvp_allow_children === false && wedding.contact_person ? 'grid-cols-1 sm:grid-cols-2' : 'mx-auto max-w-md grid-cols-1'}`}>
            {wedding.rsvp_allow_children === false && (
              <div data-native-card className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-[var(--native-border)] bg-white/70 p-6 text-center">
                <div className="absolute top-3 right-3">
                  <Pearl size="sm" />
                </div>
                <p className="mb-2 text-xs font-sans font-bold uppercase tracking-widest text-[var(--native-ink)]">
                  Celebration Note
                </p>
                <p className="text-xs leading-relaxed text-[var(--native-ink)]">
                  Our celebration is an adults-only event. We look forward to an unforgettable evening together!
                </p>
              </div>
            )}

            {wedding.contact_person && (
              <div data-native-card className="flex flex-col justify-center rounded-3xl border border-[var(--native-border)] bg-white/70 p-6 text-center">
                <p className="mb-1 text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--native-ink)]">
                  Event Contact
                </p>
                <p className="font-serif text-sm font-semibold text-[var(--native-ink)]">
                  {wedding.contact_person}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── LIVE COUNTDOWN CARD WITH PEARLS ── */}
      {!wedding.is_thank_you_mode && (
        <section id="countdown" data-native-composition data-native-countdown-section className="relative z-10 mx-auto max-w-md px-4 py-8 text-center">
          <div data-native-card className="relative overflow-hidden rounded-3xl border border-[var(--native-border)] bg-white/75 p-6 shadow-sm backdrop-blur-sm">
            <div className="absolute top-2 left-4">
              <Pearl size="sm" />
            </div>
            <div className="absolute right-4 bottom-3">
              <Pearl size="sm" />
            </div>

            <p className="mb-4 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-ink)]">
              {isPast ? 'Celebrating Together' : 'See You In...'}
            </p>

            <div role="timer" aria-label="Time until the wedding" className="my-2 flex items-center justify-center gap-2 font-mono text-xl font-bold text-[var(--native-ink)] sm:gap-4 sm:text-2xl">
              <div data-native-card className="rounded-2xl border border-[var(--native-border)] bg-[var(--native-paper)] px-3 py-2">
                <span className="block font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Days</span>
              </div>
              <span aria-hidden="true">:</span>
              <div data-native-card className="rounded-2xl border border-[var(--native-border)] bg-[var(--native-paper)] px-3 py-2">
                <span className="block font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Hours</span>
              </div>
              <span aria-hidden="true">:</span>
              <div data-native-card className="rounded-2xl border border-[var(--native-border)] bg-[var(--native-paper)] px-3 py-2">
                <span className="block font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Mins</span>
              </div>
              <span aria-hidden="true">:</span>
              <div data-native-card className="rounded-2xl border border-[var(--native-border)] bg-[var(--native-paper)] px-3 py-2">
                <span className="block font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Secs</span>
              </div>
            </div>

            <p className="mt-4 font-serif text-xs italic text-[var(--native-ink)]">
              With love, {wedding.bride_name} &amp; {wedding.groom_name}
            </p>
          </div>
        </section>
      )}

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
          wedding={wedding}
        />
      )}

      <GiftSection id="gift" wedding={wedding} />

      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
    </div>
  );
}

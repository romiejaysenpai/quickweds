'use client';

import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { MapPin, CheckCircle2, Sparkles, Hash, PhoneCall } from 'lucide-react';
import { BioSection, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
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

function FlyingSwallows({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 25C15 15 25 15 30 20C35 15 45 15 50 25C40 22 30 25 30 35C30 25 20 22 10 25Z"
        fill="var(--native-accent)"
        opacity="0.75"
      />
      <path
        d="M60 15C63 8 70 8 74 12C78 8 85 8 88 15C81 13 74 15 74 22C74 15 67 13 60 15Z"
        fill="var(--native-accent)"
        opacity="0.6"
      />
    </svg>
  );
}

function PineTreesSilhouette({ className = '' }: { className?: string }) {
  return (
    <div className={`flex w-full justify-center overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full text-[var(--native-ink)]"
      >
        <path
          d="M0 120L40 80L80 120M70 120L110 65L150 120M130 120L180 50L230 120M220 120L260 75L300 120M290 120L340 55L390 120M370 120L420 40L470 120M460 120L510 60L560 120M540 120L590 70L640 120M630 120L680 45L730 120M710 120L760 75L800 120V120H0Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
        <path
          d="M30 120L70 90L110 120M170 120L210 70L250 120M330 120L380 70L430 120M490 120L540 75L590 120M670 120L710 80L750 120H800V120H0Z"
          fill="var(--native-accent)"
        />
      </svg>
    </div>
  );
}

export default function WatercolorMeadowTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#3B5938';
  const heroImage = resolveWeddingMedia(wedding, gallery);
  const copy = resolveTemplateCopy(wedding);
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);

  const formattedDate = wedding.wedding_date
    ? formatWeddingDate(wedding.wedding_date, { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    : '';

  const mapsUrl = wedding.maps_link || (wedding.venue_name
    ? `https://maps.google.com/?q=${encodeURIComponent(`${wedding.venue_name} ${wedding.venue_address || ''}`.trim())}`
    : '');

  // Build real guest notes only from configured couple data (no fabricated rules)
  const guestNotes: { title: string; detail: string; icon: 'rsvp' | 'children' | 'hashtag' | 'contact' }[] = [];
  if (!wedding.is_thank_you_mode && wedding.rsvp_deadline) {
    guestNotes.push({
      title: 'Kindly RSVP',
      detail: `Please confirm your attendance by ${wedding.rsvp_deadline}.`,
      icon: 'rsvp',
    });
  }
  if (wedding.rsvp_allow_children === false) {
    guestNotes.push({
      title: 'Adults-Only Evening',
      detail: 'We kindly ask that guests plan for an adults-only celebration.',
      icon: 'children',
    });
  }
  if (wedding.hashtag?.trim()) {
    guestNotes.push({
      title: 'Share Your Photos',
      detail: `Tag cherished candid moments with #${wedding.hashtag.replace(/^#/, '')}.`,
      icon: 'hashtag',
    });
  }
  if (wedding.contact_person?.trim()) {
    guestNotes.push({
      title: 'Event Contact',
      detail: wedding.contact_person.trim(),
      icon: 'contact',
    });
  }

  return (
    <div
      data-native-template="WatercolorMeadow"
      data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined}
      className={`watercolor-meadow-template relative overflow-x-clip pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F5F7F2',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#263825',
        backgroundColor: 'var(--native-paper)',
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Cotton deckle paper texture */}
      <div aria-hidden="true" data-native-grain className="pointer-events-none absolute inset-0 z-0 opacity-[0.12]" />

      {/* ── TOP WATERCOLOR MEADOW & WILDFLOWER ARCH HERO ── */}
      <section data-native-composition data-native-hero className="relative z-10 flex flex-col items-center justify-between overflow-hidden px-4 pt-12 pb-0 text-center">
        {/* Soft canopy glow backdrop */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,var(--native-accent)_0%,transparent_70%)] opacity-40" />

        {/* Bespoke Wildflower Botanical Arch Crest */}
        <figure aria-hidden="true" className="relative z-10 mx-auto -mt-4 mb-2 w-full max-w-md px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TEMPLATE_ELEMENT_ASSETS.meadowWreath}
            alt=""
            className="pointer-events-none mx-auto h-auto w-full object-contain opacity-90"
          />
        </figure>

        <div className="relative z-10 mx-auto max-w-md space-y-4">
          <div className="flex justify-center">
            <WeddingMonogram wedding={wedding} className="scale-75" />
          </div>

          <FlyingSwallows className="mx-auto w-20" />

          {wedding.quote?.trim() ? (
            <blockquote className="mx-auto max-w-xs font-serif text-xs italic leading-relaxed text-[var(--native-ink)] opacity-90 sm:text-sm">
              &ldquo;{wedding.quote.trim()}&rdquo;
            </blockquote>
          ) : (
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-[var(--native-ink)] opacity-80">
              {copy.eyebrow}
            </p>
          )}

          <h1
            data-native-title
            className={`break-words pt-1 font-serif text-4xl italic tracking-wide text-[var(--native-ink)] sm:text-6xl ${titleStyle.className}`}
            style={titleStyle.style}
          >
            <span>{wedding.bride_name}</span>
            <span className="my-1 block text-2xl font-light not-italic text-[var(--native-ink)]">&amp;</span>
            <span>{wedding.groom_name}</span>
          </h1>

          <p className="text-xs font-sans font-bold uppercase tracking-[0.22em] text-[var(--native-ink)] opacity-85">
            {copy.subtitle}
          </p>

          {(formattedDate || wedding.wedding_time) && (
            <div className="my-2 inline-block border-y border-[var(--native-border)]/45 px-8 py-2">
              <span className="font-sans text-xs font-semibold tracking-[0.22em] text-[var(--native-ink)] sm:text-sm">
                {formattedDate} {wedding.wedding_time ? `• ${wedding.wedding_time}` : ''}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-3">
            <a
              data-wedding-control="primary"
              href={copy.ctaHref}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--native-action)] px-8 py-3 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--native-on-action)] shadow-md transition-transform"
            >
              {copy.ctaLabel}
            </a>
            <TemplateHeroActions wedding={wedding} variant="pill" />
          </div>
        </div>

        {/* Couple Meadow Portrait Frame */}
        <div data-native-portrait className="relative mt-8 w-full max-w-lg px-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-3xl border-4 border-white shadow-xl">
            <WeddingHeroVisual
              wedding={wedding}
              gallery={gallery}
              src={heroImage}
              ornamentSrc={TEMPLATE_ELEMENT_ASSETS.meadowWreath}
              imgClassName="h-full w-full object-cover"
            />
          </div>
        </div>

        <PineTreesSilhouette className="relative z-20 -mt-8" />
      </section>

      {/* ── CEREMONY & LOCATION SUMMARY ── */}
      {(wedding.venue_name || wedding.venue_address) && (
        <section data-native-composition className="relative z-10 mx-auto max-w-xl px-4 py-12 text-center">
          <h2
            data-native-title
            className={`mb-2 font-serif text-3xl italic text-[var(--native-ink)] sm:text-4xl ${titleStyle.className}`}
            style={titleStyle.style}
          >
            Ceremony
          </h2>
          {wedding.venue_name && (
            <p className="mb-1 font-serif text-lg font-semibold text-[var(--native-ink)]">
              {wedding.venue_name}
            </p>
          )}
          {wedding.venue_address && (
            <p className="mx-auto mb-6 max-w-xs font-sans text-xs text-[var(--native-ink)] opacity-85">
              {wedding.venue_address}
            </p>
          )}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--native-border)] bg-white/75 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--native-ink)] shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <MapPin className="h-4 w-4 text-[var(--native-accent)]" aria-hidden="true" /> View Map &amp; Directions
            </a>
          )}
        </section>
      )}

      {/* ── COUNTDOWN CARD IN FOREST ACCENT ── */}
      {!wedding.is_thank_you_mode && (
        <section id="countdown" data-native-composition data-native-countdown-section className="relative z-10 mx-auto max-w-md px-4 py-8">
          <div
            data-native-accent-panel
            className="rounded-3xl p-8 text-center text-[var(--native-on-action)] shadow-xl"
            style={{
              backgroundColor: 'var(--native-action)',
              backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 60%)',
            }}
          >
            <p className="mb-1 text-xs font-sans uppercase tracking-[0.3em] opacity-85">
              {isPast ? 'Celebrating Together' : 'Countdown'}
            </p>
            <h3
              data-native-title
              className={`mb-4 font-serif text-2xl italic ${titleStyle.className}`}
              style={titleStyle.style}
            >
              To Our Special Day
            </h3>
            <p className="mb-6 text-xs font-sans opacity-85">
              Join us in counting down every moment until we say &ldquo;I do&rdquo;!
            </p>

            <div role="timer" aria-label="Time until the wedding" className="flex items-center justify-center gap-2 font-mono text-xl font-bold sm:gap-3 sm:text-2xl">
              <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-2">
                <span className="block">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider opacity-85">Days</span>
              </div>
              <span aria-hidden="true">:</span>
              <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-2">
                <span className="block">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider opacity-85">Hours</span>
              </div>
              <span aria-hidden="true">:</span>
              <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-2">
                <span className="block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider opacity-85">Mins</span>
              </div>
              <span aria-hidden="true">:</span>
              <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-2">
                <span className="block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider opacity-85">Secs</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── OPTIONAL GUEST NOTES (ONLY CONFIGURED DETAILS) ── */}
      {guestNotes.length > 0 && (
        <section data-native-composition className="relative z-10 mx-auto max-w-xl px-4 py-12 text-center">
          <h2
            data-native-title
            className={`mb-2 font-serif text-2xl italic text-[var(--native-ink)] sm:text-3xl ${titleStyle.className}`}
            style={titleStyle.style}
          >
            Guest Notes
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-xs font-sans text-[var(--native-ink)] opacity-75">
            Helpful details prepared for your visit.
          </p>

          <div
            data-native-guide
            className={`grid gap-4 text-left ${guestNotes.length > 1 ? 'grid-cols-1 min-[420px]:grid-cols-2' : 'mx-auto max-w-sm grid-cols-1'}`}
          >
            {guestNotes.map((note) => (
              <div
                key={note.title}
                data-native-card
                className="flex items-start gap-3 rounded-2xl border border-[var(--native-border)]/25 bg-white/75 p-4 backdrop-blur-sm"
              >
                {note.icon === 'rsvp' ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--native-accent)]" aria-hidden="true" />
                ) : note.icon === 'hashtag' ? (
                  <Hash className="mt-0.5 h-5 w-5 shrink-0 text-[var(--native-accent)]" aria-hidden="true" />
                ) : note.icon === 'contact' ? (
                  <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-[var(--native-accent)]" aria-hidden="true" />
                ) : (
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--native-accent)]" aria-hidden="true" />
                )}
                <div>
                  <p className="text-[11px] font-sans font-bold text-[var(--native-ink)]">{note.title}</p>
                  <p className="text-[11px] text-[var(--native-ink)] opacity-85">{note.detail}</p>
                </div>
              </div>
            ))}
          </div>
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

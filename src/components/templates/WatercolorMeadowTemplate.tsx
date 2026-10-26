'use client';

import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import Image from 'next/image';
import { MapPin, Clock, CheckCircle2, VolumeX, Sparkles } from 'lucide-react';
import { BioSection, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import { SharedNewSections, useCountdown } from './shared';
import type { TemplateProps } from '@/types/wedding';

// Hand-drawn flying swallows SVG
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

// Evergreen Pine Trees Silhouette Border
function PineTreesSilhouette({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden flex justify-center ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto text-[var(--native-ink)]"
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
  const motifColor = wedding.motif_color || '#3B5938'; // Eucalyptus Forest Green default
  const heroImage = wedding.hero_image || wedding.couple_photo || '/logo.png';
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);

  const weddingDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : new Date();

  const formattedDate = weddingDate.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  const mapsUrl = wedding.maps_link || (wedding.venue_name
    ? `https://maps.google.com/?q=${encodeURIComponent(`${wedding.venue_name} ${wedding.venue_address || ''}`.trim())}`
    : '');

  return (
    <div
      data-native-template="WatercolorMeadow" data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined} className={`watercolor-meadow-template relative pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F5F7F2',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#263825',
        backgroundColor: 'var(--native-paper)', // Soft botanical parchment
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* ── TOP WATERCOLOR MEADOW & PINE LANDSCAPE (From Image 3) ── */}
      <section data-native-composition data-native-hero className="relative min-h-[85vh] flex flex-col justify-between items-center text-center px-4 pt-12 pb-0 overflow-hidden">
        {/* Soft Eucalyptus leaves garland top */}
        <div className="absolute top-0 inset-x-0 h-28 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,var(--native-accent)_0%,transparent_70%)]" />

        <div className="max-w-md mx-auto space-y-4 relative z-10 pt-4">
          <FlyingSwallows className="w-20 mx-auto" />

          {/* Scripture / Quote */}
          <p className="text-[11px] sm:text-xs font-serif italic text-[var(--native-ink)] max-w-xs mx-auto leading-relaxed">
            {wedding.quote ? (
              <span>&ldquo;{wedding.quote}&rdquo;</span>
            ) : (
              <>
                &ldquo;So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.&rdquo;
                <span className="block not-italic text-[9px] uppercase font-sans tracking-widest text-[var(--native-ink)] mt-0.5">
                  Matthew 19:6
                </span>
              </>
            )}
          </p>

          {/* Couple Calligraphy Name */}
          <h1 data-native-title className={`text-4xl sm:text-6xl font-serif text-[var(--native-ink)] tracking-wide break-words pt-2 italic ${titleStyle.className}`} style={titleStyle.style}>
            <span>{wedding.bride_name}</span>
            <span className="block text-2xl font-light not-italic my-1 text-[var(--native-ink)]">&amp;</span>
            <span>{wedding.groom_name}</span>
          </h1>

          <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-[var(--native-ink)] font-bold">
            Invite you to celebrate their wedding
          </p>

          {/* Boxed Date Display */}
          <div className="inline-block border-y border-[var(--native-border)]/30 py-2 px-8 my-2">
            <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.25em] text-[var(--native-ink)]">
              {formattedDate} {wedding.wedding_time ? `• ${wedding.wedding_time}` : ''}
            </span>
          </div>
        </div>

        {/* Couple Meadow Portrait Frame */}
        <div data-native-portrait className="relative w-full max-w-lg mt-6 px-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-3xl shadow-xl border-4 border-white">
            <Image
              src={heroImage}
              alt={`${wedding.bride_name} and ${wedding.groom_name}`}
              priority
              fill
              sizes="(max-width: 768px) 100vw, 512px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Pine Tree Silhouette Divider Bottom */}
        <PineTreesSilhouette className="-mt-8 relative z-20" />
      </section>

      {/* ── CEREMONY & LOCATION CARD (From Image 3) ── */}
      <section data-native-composition className="relative max-w-xl mx-auto px-4 py-12 text-center z-10">
        <h2 data-native-title className={`text-3xl sm:text-4xl font-serif italic text-[var(--native-ink)] mb-2 ${titleStyle.className}`} style={titleStyle.style}>
          Ceremony
        </h2>
        <p className="text-lg font-serif text-[var(--native-ink)] mb-1 font-semibold">
          {wedding.venue_name}
        </p>
        {wedding.venue_address && (
          <p className="text-xs font-sans text-[var(--native-ink)] max-w-xs mx-auto mb-6">
            {wedding.venue_address}
          </p>
        )}

        {mapsUrl && (
          <a data-wedding-control="primary"
                href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[var(--native-action)] text-[var(--native-on-action)] text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-md transition-transform hover:scale-105"
          >
            <MapPin className="w-4 h-4" /> View Map &amp; Directions
          </a>
        )}
      </section>

      {/* ── COUNTDOWN CARD IN FOREST GREEN (From Image 3: "CONTAGEM Regressiva") ── */}
      {!wedding.is_thank_you_mode && (
        <section id="countdown" data-native-composition data-native-countdown-section className="relative max-w-md mx-auto px-4 py-8 z-10">
          <div
            data-native-accent-panel className="rounded-3xl p-8 text-center text-white shadow-xl"
            style={{
              backgroundColor: 'var(--native-action)',
              backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 60%)',
            }}
          >
            <p className="text-xs font-sans uppercase tracking-[0.3em] text-[var(--native-ink)] mb-1">
              {isPast ? 'Celebrating Together' : 'Countdown'}
            </p>
            <h3 data-native-title className={`font-serif italic text-2xl text-[var(--native-paper)] mb-4 ${titleStyle.className}`} style={titleStyle.style}>
              To Our Special Day
            </h3>
            <p className="text-xs font-sans text-[var(--native-ink)] mb-6">
              Join us in counting down every moment until we say &ldquo;I do&rdquo;!
            </p>

            <div className="flex justify-center items-center gap-3 font-mono text-xl sm:text-2xl font-bold">
              <div className="bg-black/25 rounded-xl px-3 py-2 border border-white/10">
                <span className="block">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider text-[var(--native-ink)]">Days</span>
              </div>
              <span>:</span>
              <div className="bg-black/25 rounded-xl px-3 py-2 border border-white/10">
                <span className="block">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider text-[var(--native-ink)]">Hours</span>
              </div>
              <span>:</span>
              <div className="bg-black/25 rounded-xl px-3 py-2 border border-white/10">
                <span className="block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider text-[var(--native-ink)]">Mins</span>
              </div>
              <span>:</span>
              <div className="bg-black/25 rounded-xl px-3 py-2 border border-white/10">
                <span className="block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans font-normal uppercase tracking-wider text-[var(--native-ink)]">Secs</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── GUEST GUIDE MANUAL WITH 4 CIRCULAR ICONS (From Image 3: "Manual do Convidado") ── */}
      <section data-native-composition className="relative max-w-xl mx-auto px-4 py-12 text-center z-10">
        <h2 data-native-title className={`text-2xl sm:text-3xl font-serif italic text-[var(--native-ink)] mb-1 ${titleStyle.className}`} style={titleStyle.style}>
          Guest Guide
        </h2>
        <p className="text-xs font-sans text-[var(--native-ink)] max-w-xs mx-auto mb-8">
          Help us make this special day joyful, smooth, and comfortable for everyone.
        </p>

        <div data-native-guide className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4 text-left">
          <div data-native-card className="bg-white/75 backdrop-blur-sm p-4 rounded-2xl border border-[var(--native-border)]/15 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--native-accent)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold font-sans text-[var(--native-ink)]">Kindly RSVP</p>
              <p className="text-[10px] text-[var(--native-ink)]">
                {wedding.rsvp_deadline ? `Please reply by ${wedding.rsvp_deadline}` : 'Please confirm your attendance in advance.'}
              </p>
            </div>
          </div>

          <div data-native-card className="bg-white/75 backdrop-blur-sm p-4 rounded-2xl border border-[var(--native-border)]/15 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[var(--native-accent)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold font-sans text-[var(--native-ink)]">Be Punctual</p>
              <p className="text-[10px] text-[var(--native-ink)]">Please take your seat before the ceremony begins.</p>
            </div>
          </div>

          <div data-native-card className="bg-white/75 backdrop-blur-sm p-4 rounded-2xl border border-[var(--native-border)]/15 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--native-accent)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold font-sans text-[var(--native-ink)]">Reserved White</p>
              <p className="text-[10px] text-[var(--native-ink)]">We kindly ask you to reserve white attire for the bride.</p>
            </div>
          </div>

          <div data-native-card className="bg-white/75 backdrop-blur-sm p-4 rounded-2xl border border-[var(--native-border)]/15 flex items-start gap-3">
            <VolumeX className="w-5 h-5 text-[var(--native-accent)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold font-sans text-[var(--native-ink)]">Silent Phones</p>
              <p className="text-[10px] text-[var(--native-ink)]">Please silence devices during the vows &amp; ceremony.</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a data-wedding-control="primary"
                href="#rsvp"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--native-action)] text-[var(--native-on-action)] text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-lg transition-transform hover:scale-105"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirmar Presença
          </a>
        </div>
      </section>

      {/* ── STANDARD QUICKWEDS STRUCTURED SECTIONS ── */}
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

      {/* Shared Lower Sections (Entourage, Venue, Guestbook, RSVP) */}
      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
    </div>
  );
}

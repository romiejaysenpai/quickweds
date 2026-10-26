'use client';

import { motion } from 'framer-motion';
import { MonogramMark } from '@/components/MonogramMark';
import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { getBuilderTheme } from '@/lib/invitation-theme';
import Image from 'next/image';

import { DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import { SharedNewSections, useCountdown } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function EnvelopeWaxSealTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const sealColor = wedding.logo_color || getBuilderTheme(wedding)['--builder-on-action'];
  const motifColor = wedding.motif_color || '#3D5239'; // Olive Green default from Image 1
  const heroImage = wedding.hero_image || wedding.couple_photo || '/logo.png';
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);

  const weddingDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : new Date();

  const weddingYear = weddingDate.getFullYear();
  const weddingMonth = weddingDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const weddingDayName = weddingDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const weddingDayNum = String(weddingDate.getDate()).padStart(2, '0');

  // Mini calendar generator for the wedding month
  const firstDayOfMonth = new Date(weddingYear, weddingDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(weddingYear, weddingDate.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div
      data-native-template="EnvelopeWaxSeal" data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined} className={`envelope-wax-seal-template relative pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F5F4EE',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#2A3027',
        backgroundColor: 'var(--native-paper)',
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Subtle eucalyptus watercolor leaf backdrop */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(var(--native-accent) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── TOP ENVELOPE FLAP WITH 3D WAX SEAL (From Image 1) ── */}
      <div data-native-envelope data-native-accent-panel className="relative w-full bg-[var(--native-action)] text-[var(--native-on-action)] pt-8 pb-14 px-4 text-center shadow-md">
        {/* Triangle envelope flap simulation */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom right, var(--native-action) 49%, var(--native-paper) 51%)',
          }}
        />

        <div className="max-w-md mx-auto space-y-2 relative z-10">
          <p className="font-serif italic text-xl tracking-wider text-[var(--native-ink)]">
            {wedding.bride_name} &amp; {wedding.groom_name}
          </p>
          <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-[var(--native-ink)]">
            {weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* 3D Wax Seal positioned at the envelope point */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-serif font-bold tracking-widest shadow-xl border-2 border-amber-200/40 transition-transform duration-500 hover:scale-105"
            style={{
              background: 'radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--native-action) 55%, white) 0%, var(--native-action) 70%, color-mix(in srgb, var(--native-action) 65%, black) 100%)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.4)',
            }}
          >
            <MonogramMark initials={wedding.logo_initials} brideName={wedding.bride_name} groomName={wedding.groom_name} shape={wedding.logo_shape} color={sealColor} motifColor={motifColor} animation={wedding.logo_animation} fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined} size="sm" className="mx-auto" />
          </div>
        </div>
      </div>

      {/* ── MAIN INVITATION CARD (From Image 1) ── */}
      <section data-native-composition data-native-hero className="relative max-w-3xl mx-auto px-4 sm:px-8 pt-16 pb-12 text-center overflow-hidden">
        {/* Top Watercolor Olive Wreath Arch */}
        <div className="flex justify-center mb-6">
          <svg
            viewBox="0 0 240 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-48 sm:w-60 h-auto text-[var(--native-ink)]"
            aria-hidden="true"
          >
            <path
              d="M12 50C40 20 80 14 120 14C160 14 200 20 228 50"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            {/* Olive Leaves */}
            <path d="M40 30C35 22 42 12 52 16C54 24 48 30 40 30Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
            <path d="M70 20C68 10 78 4 86 9C87 18 80 23 70 20Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
            <path d="M104 15C106 6 116 3 120 11C119 19 112 21 104 15Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1" />
            <path d="M136 15C128 21 121 19 120 11C124 3 134 6 136 15Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1" />
            <path d="M170 20C160 23 153 18 154 9C162 4 172 10 170 20Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
            <path d="M200 30C192 30 186 24 188 16C198 12 205 22 200 30Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Monogram Display */}
        <div className="mb-4">
          <MonogramMark initials={wedding.logo_initials} brideName={wedding.bride_name} groomName={wedding.groom_name} shape={wedding.logo_shape} color={wedding.logo_color} motifColor={motifColor} animation={wedding.logo_animation} fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined} size="sm" className="mx-auto" />
        </div>

        {/* Couple Names */}
        <h1 data-native-title className={`text-4xl sm:text-6xl font-serif text-[var(--native-ink)] tracking-tight break-words ${titleStyle.className}`} style={titleStyle.style}>
          <span className="block">{wedding.bride_name}</span>
          <span className="block text-[.5em] my-2 italic text-[var(--native-ink)] font-light">&amp;</span>
          <span className="block">{wedding.groom_name}</span>
        </h1>

        {/* Delicate cursive announcement */}
        <p className="font-serif italic text-base sm:text-lg text-[var(--native-ink)] max-w-md mx-auto leading-relaxed mb-6">
          {wedding.quote ||
            wedding.story ||
            'We joyfully invite you to celebrate our marriage and share this unforgettable moment with us.'}
        </p>

        {/* Boxed Date Display (Image 1 replica) */}
        <div className="inline-flex flex-col items-center border-t border-b border-[var(--native-border)]/30 py-3 px-8 my-4">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-accent)]">
            {weddingMonth}
          </span>
          <div className="flex items-center gap-4 my-1">
            <span className="text-xs font-sans uppercase tracking-widest text-[var(--native-ink)]">
              {weddingDayName}
            </span>
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[var(--native-ink)] px-2">
              {weddingDayNum}
            </span>
            <span className="text-xs font-sans tracking-widest text-[var(--native-ink)]">
              {weddingYear}
            </span>
          </div>
        </div>

        {/* Couple Hero Photo with Floral Bottom Garland */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative max-w-lg mx-auto mt-8 mb-4 px-2"
        >
          <div data-native-portrait className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-xl border-4 border-white">
            <Image
              src={heroImage}
              alt={`${wedding.bride_name} and ${wedding.groom_name}`}
              priority
              fill
              sizes="(max-width: 768px) 100vw, 512px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Scripture / Romantic Quote */}
        <p className="font-serif italic text-sm sm:text-base text-[var(--native-ink)] max-w-md mx-auto mt-4 leading-relaxed">
          {wedding.quote ? (
            <span>&ldquo;{wedding.quote}&rdquo;</span>
          ) : (
            <>
              &ldquo;Above all, love each other deeply, because love covers over a multitude of sins.&rdquo;
              <span className="block text-xs font-sans not-italic text-[var(--native-ink)] mt-1 uppercase tracking-widest">
                1 Peter 4:8
              </span>
            </>
          )}
        </p>

        {wedding.background_music_enabled && wedding.background_music_url && (
          <div data-native-card className="mt-8 max-w-sm mx-auto p-4 rounded-2xl border border-[var(--native-border)]">
            <p className="text-sm mb-2">{wedding.background_music_title || 'Our Wedding Song'}</p>
            <audio controls preload="none" src={wedding.background_music_url} aria-label={wedding.background_music_title || 'Our wedding song'} />
          </div>
        )}
      </section>

      {/* ── GREEN WAVE BLOCK: COUNTDOWN & MONTHLY CALENDAR (From Image 1) ── */}
      <section data-native-accent-panel className="relative bg-[var(--native-action)] text-[var(--native-on-action)] py-16 px-4 sm:px-8 overflow-hidden">
        {/* Soft decorative wave top */}
        <div
          className="absolute inset-x-0 top-0 h-8 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, var(--native-paper) 35%, transparent 36%)',
            backgroundSize: '32px 16px',
          }}
        />

        <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          <p className="font-serif italic text-base sm:text-lg text-[var(--native-paper)] max-w-md mx-auto">
            {wedding.story ? (
              <span>&ldquo;{wedding.story}&rdquo;</span>
            ) : (
              <span>&ldquo;With the blessing of our families, we invite you to share in our joy as we begin this new chapter together.&rdquo;</span>
            )}
          </p>

          <div data-native-card className="w-12 h-px bg-[var(--native-subtle)]/40 mx-auto" />

          {/* Countdown Clock Display */}
          {!wedding.is_thank_you_mode && (
            <div id="countdown" data-native-countdown-section className="py-2">
              <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-ink)] mb-2">
                {isPast ? 'Celebrating Our Marriage' : 'Countdown to the Big Day'}
              </p>
              <div className="flex justify-center items-center gap-3 sm:gap-4 font-mono text-2xl sm:text-3xl font-light text-white">
                <div className="bg-black/20 rounded-xl px-3 py-2 border border-white/10">
                  <span className="block font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Days</span>
                </div>
                <span>:</span>
                <div className="bg-black/20 rounded-xl px-3 py-2 border border-white/10">
                  <span className="block font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Hours</span>
                </div>
                <span>:</span>
                <div className="bg-black/20 rounded-xl px-3 py-2 border border-white/10">
                  <span className="block font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Mins</span>
                </div>
                <span>:</span>
                <div className="bg-black/20 rounded-xl px-3 py-2 border border-white/10">
                  <span className="block font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Secs</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Monthly Calendar (From Image 1: "EL GRAN DÍA") */}
          <div data-native-card className="mt-8 pt-4 max-w-xs mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-ink)] mb-3">
              The Big Day • {weddingMonth} {weddingYear}
            </p>
            <div className="grid grid-cols-7 gap-1 text-[10px] font-sans text-center mb-2 text-[var(--native-ink)] font-bold">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <span key={`empty-${i}`} className="opacity-0">0</span>
              ))}
              {calendarDays.map((d) => {
                const isWeddingDay = d === weddingDate.getDate();
                return (
                  <span
                    key={d}
                    className={`h-7 w-7 rounded-full flex items-center justify-center font-sans text-[11px] ${
                      isWeddingDay
                        ? 'bg-[var(--native-subtle)] text-black font-bold shadow-md'
                        : 'text-white/80'
                    }`}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── STRUCTURED SECTIONS WITH ACCURATE IMAGE 1 CARDS ── */}

      {/* Details Section */}
      <DetailsSection id="details" wedding={wedding} />

      {/* Timeline Section */}
      <TimelineSection
        id="timeline"
        timeline={wedding.program_timeline || ''}
        wedding={wedding}
      />

      {/* Gallery Section */}
      <GallerySection
        id="gallery"
        gallery={gallery}
        template={wedding.template}
        motifColor={motifColor}
        galleryLayout={wedding.gallery_layout || 'editorial'}
      />

      {/* Attire Section */}
      <AttireSection wedding={wedding} />

      {/* Video Section if present */}
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

      {/* Gift Section */}
      <GiftSection id="gift" wedding={wedding} />

      {/* Shared Lower Sections (Entourage, Venue, Guestbook, RSVP) */}
      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
    </div>
  );
}

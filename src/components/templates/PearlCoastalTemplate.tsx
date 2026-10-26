'use client';

import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import Image from 'next/image';


import { DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import { SharedNewSections, useCountdown } from './shared';
import { parseDressCodeValue } from '@/lib/dress-code';
import type { TemplateProps } from '@/types/wedding';

// Decorative 3D Freshwater Pearl Component
function Pearl({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <span
      className={`inline-block rounded-full shadow-sm shrink-0 ${sizeClass} ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F5EAE1 50%, #D4C3B7 100%)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.9)',
      }}
      aria-hidden="true"
    />
  );
}

// Decorative Scallop Seashell SVG
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
        opacity="0.8"
      />
      <path d="M24 4V44M14 8C18 18 18 30 14 40M34 8C30 18 30 30 34 40M8 16C16 22 16 26 8 32M40 16C32 22 32 26 40 32" stroke="#C5AA94" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// Blush Watercolor Floral Bouquet
function FloralBouquet({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none flex items-center gap-1 ${className}`}>
      <span className="text-xl sm:text-2xl opacity-75">🌸</span>
      <Pearl size="sm" className="-ml-1 -mt-2" />
    </div>
  );
}

export default function PearlCoastalTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#B98B82'; // Rose Gold / Blush Peach default from Image 2
  const heroImage = wedding.hero_image || wedding.couple_photo || '/logo.png';
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);
  const dressCodeSettings = parseDressCodeValue(wedding.dress_code, motifColor);

  const weddingDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : new Date();

  const formattedDate = weddingDate.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  const dressPalette = dressCodeSettings.guests.colors?.length
    ? dressCodeSettings.guests.colors
    : ['#E8DDD4', '#F3D7CD', '#E5BDB0', '#B2B5A5', '#827D79'];

  return (
    <div
      data-native-template="PearlCoastal" data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined} className={`pearl-coastal-template relative pb-28 font-serif selection:bg-[var(--native-subtle)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F8F4EE',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#382D2A',
        backgroundColor: 'var(--native-paper)', // Warm linen paper texture
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Scattered Organic Pearls in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <Pearl size="sm" className="absolute top-24 left-[10%]" />
        <Pearl size="md" className="absolute top-72 right-[12%]" />
        <Pearl size="sm" className="absolute top-[45%] left-[8%]" />
        <Pearl size="lg" className="absolute top-[65%] right-[10%]" />
        <Pearl size="sm" className="absolute top-[85%] left-[14%]" />
      </div>

      {/* ── TOP HERO: ARCH PHOTO & BLUSH FLOWERS (From Image 2) ── */}
      <section data-native-composition data-native-hero className="relative max-w-2xl mx-auto px-4 sm:px-8 pt-12 pb-10 text-center z-10">
        {/* Eyebrow */}
        <p className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.35em] text-[var(--native-ink)] mb-6">
          Wedding Invitation
        </p>

        {/* Arch Photo Container with Coastal Vibe */}
        <div data-native-portrait className="relative mx-auto max-w-[380px] mb-8">
          {/* Top Left Floral Accent with Pearls */}
          <div className="absolute -top-4 -left-4 z-20">
            <FloralBouquet />
          </div>

          <div data-native-card className="relative aspect-[3/3.8] w-full overflow-hidden rounded-t-[160px] rounded-b-2xl border-2 border-white shadow-xl bg-white p-2">
            <div className="relative w-full h-full overflow-hidden rounded-t-[150px] rounded-b-xl">
              <Image
                src={heroImage}
                alt={`${wedding.bride_name} & ${wedding.groom_name}`}
                priority
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover transition-transform duration-[10s] hover:scale-105"
              />
            </div>
          </div>

          {/* Right Bottom Floral Accent */}
          <div className="absolute -bottom-3 -right-3 z-20">
            <FloralBouquet />
          </div>
        </div>

        {/* Couple Names in Roman Serif */}
        <h1 data-native-title className={`text-3xl sm:text-5xl font-serif text-[var(--native-ink)] tracking-wide break-words uppercase ${titleStyle.className}`} style={titleStyle.style}>
          <span>{wedding.bride_name}</span>
          <span className="block text-xl sm:text-2xl font-light italic text-[var(--native-accent)] my-1 font-sans">&amp;</span>
          <span>{wedding.groom_name}</span>
        </h1>

        {/* Date Display */}
        <p className="mt-3 text-xs sm:text-sm font-sans tracking-[0.25em] text-[var(--native-ink)] font-semibold">
          {formattedDate}
        </p>
      </section>

      {/* ── WAVY LETTER TO GUESTS (From Image 2) ── */}
      <section data-native-composition className="relative max-w-2xl mx-auto px-4 sm:px-6 my-8 z-10">
        <div data-native-card
          className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-10 text-center shadow-sm border border-[var(--native-border)]"
          style={{
            borderRadius: '2.5rem 1.5rem 2.5rem 1.5rem',
          }}
        >
          {/* Decorative Seashell icon */}
          <div className="flex justify-center mb-4">
            <ScallopShell className="w-8 h-8 text-[var(--native-ink)]" />
          </div>

          <h2 data-native-title className={`text-sm sm:text-base font-sans font-bold uppercase tracking-[0.25em] text-[var(--native-ink)] mb-4 ${titleStyle.className}`} style={titleStyle.style}>
            Dear Family &amp; Friends
          </h2>

          <p className="text-sm sm:text-base font-serif italic text-[var(--native-ink)] leading-relaxed max-w-md mx-auto">
            {wedding.story ||
              wedding.quote ||
              'We are thrilled to share this special milestone with you! We warmly invite you to celebrate our wedding and look forward to spending this unforgettable day surrounded by our favorite people.'}
          </p>

          {wedding.quote && wedding.story && <blockquote className="mt-5 text-sm italic">{wedding.quote}</blockquote>}

          <div className="mt-6 flex justify-center items-center gap-2">
            <Pearl size="sm" />
            <div data-native-card className="w-16 h-px bg-[var(--native-subtle)]" />
            <Pearl size="sm" />
          </div>
        </div>
      </section>

      {/* ── DRESS CODE WITH COLOR SWATCHES (From Image 2) ── */}
      <section data-native-composition className="relative max-w-2xl mx-auto px-4 sm:px-6 my-10 text-center z-10">
        <div data-native-card className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-[var(--native-border)] shadow-sm">
          <h2 data-native-title className={`text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-ink)] mb-2 ${titleStyle.className}`} style={titleStyle.style}>
            Dress Code
          </h2>
          <p className="text-xs sm:text-sm text-[var(--native-ink)] mb-6">
            {dressCodeSettings.guests.attire || 'Cocktail / Elegant Beach Chic'}
          </p>
          {dressCodeSettings.guests.notes && <p className="text-sm mb-4">{dressCodeSettings.guests.notes}</p>}
          {/* Dynamic Circular Color Swatches */}
          <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
            {dressPalette.map((color, idx) => (
              <span
                key={`${color}-${idx}`}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-inner border-2 border-white transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── ADULTS ONLY & GIFTS NOTE (From Image 2) ── */}
      <section data-native-composition className="relative max-w-2xl mx-auto px-4 sm:px-6 my-8 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-native-card className="bg-white/70 rounded-3xl p-6 border border-[var(--native-border)] text-center flex flex-col justify-center">
            <ScallopShell className="w-6 h-6 mx-auto mb-2 text-[var(--native-ink)]" />
            <p className="text-xs font-sans uppercase tracking-widest text-[var(--native-ink)] font-bold mb-2">Wishes &amp; Gifts</p>
            <p className="text-xs text-[var(--native-ink)] leading-relaxed">
              {wedding.gift_bank || wedding.gift_account_number
                ? 'Your love and presence on our wedding day is the best gift of all. For those wishing to honor us with a gift, a honeymoon contribution is warmly appreciated.'
                : 'The greatest gift to us is having you celebrate our wedding day!'}
            </p>
          </div>
          <div data-native-card className="bg-white/70 rounded-3xl p-6 border border-[var(--native-border)] text-center flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <Pearl size="sm" />
            </div>
            <p className="text-xs font-sans uppercase tracking-widest text-[var(--native-ink)] font-bold mb-2">Celebration Note</p>
            <p className="text-xs text-[var(--native-ink)] leading-relaxed">
              {wedding.rsvp_allow_children === false
                ? 'Our celebration is an adults-only event. We hope you understand and enjoy a relaxing evening with us!'
                : 'We cannot wait to celebrate our love and make lasting memories together with all our loved ones.'}
            </p>
          </div>
        </div>

        {/* Wedding Coordinator / Contact Info if configured */}
        {wedding.contact_person && (
          <div data-native-card className="mt-4 bg-white/70 rounded-3xl p-5 border border-[var(--native-border)] text-center max-w-sm mx-auto">
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--native-ink)] mb-1">
              Event Contact
            </p>
            <p className="text-xs font-serif text-[var(--native-ink)] font-bold">
              {wedding.contact_person}
            </p>
          </div>
        )}
      </section>

      {/* ── LIVE COUNTDOWN CARD WITH PEARLS (From Image 2: "УВИДИМСЯ ЧЕРЕЗ...") ── */}
      {!wedding.is_thank_you_mode && (
        <section id="countdown" data-native-composition data-native-countdown-section className="relative max-w-md mx-auto px-4 py-8 z-10 text-center">
          <div data-native-card className="bg-white/75 backdrop-blur-sm rounded-3xl p-6 border border-[var(--native-border)] shadow-sm relative overflow-hidden">
            <div className="absolute top-2 left-4">
              <Pearl size="sm" />
            </div>
            <div className="absolute bottom-3 right-4">
              <Pearl size="sm" />
            </div>

            <p className="text-xs font-sans uppercase tracking-[0.3em] text-[var(--native-ink)] font-bold mb-4">
              {isPast ? 'Celebrating Together' : 'See You In...'}
            </p>

            <div className="flex justify-center items-center gap-3 sm:gap-4 font-mono text-xl sm:text-2xl font-bold text-[var(--native-ink)] my-2">
              <div data-native-card className="bg-[var(--native-paper)] rounded-2xl px-3 py-2 border border-[var(--native-border)]">
                <span className="block font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Days</span>
              </div>
              <span className="text-[var(--native-ink)]">:</span>
              <div data-native-card className="bg-[var(--native-paper)] rounded-2xl px-3 py-2 border border-[var(--native-border)]">
                <span className="block font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Hours</span>
              </div>
              <span className="text-[var(--native-ink)]">:</span>
              <div data-native-card className="bg-[var(--native-paper)] rounded-2xl px-3 py-2 border border-[var(--native-border)]">
                <span className="block font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Mins</span>
              </div>
              <span className="text-[var(--native-ink)]">:</span>
              <div data-native-card className="bg-[var(--native-paper)] rounded-2xl px-3 py-2 border border-[var(--native-border)]">
                <span className="block font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Secs</span>
              </div>
            </div>

            <p className="mt-4 text-xs font-serif italic text-[var(--native-ink)]">
              With love, {wedding.bride_name} &amp; {wedding.groom_name}
            </p>
          </div>
        </section>
      )}

      {/* ── STANDARD QUICKWEDS STRUCTURED SECTIONS ── */}
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

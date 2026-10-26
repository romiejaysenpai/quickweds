'use client';

import { MonogramMark } from '@/components/MonogramMark';
import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import Image from 'next/image';
import { Heart, Car, Hotel, Camera, Gift, QrCode, Church, Wine, UtensilsCrossed, Sparkles } from 'lucide-react';
import { BioSection, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import { SharedNewSections, parseTimelineItems, useCountdown } from './shared';
import { parseDressCodeValue } from '@/lib/dress-code';
import type { TemplateProps } from '@/types/wedding';

export default function VelureEditorialTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#4E5D4C'; // Dark Sage Green default from Image 4
  const heroImage = wedding.hero_image || wedding.couple_photo || '/logo.png';
  const couplePhoto = wedding.couple_photo || heroImage;
  const dressCodeSettings = parseDressCodeValue(wedding.dress_code, motifColor);
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);

  const weddingDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : new Date();

  const formattedMonth = weddingDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const formattedDay = weddingDate.getDate();
  const formattedYear = weddingDate.getFullYear();
  const formattedWeekday = weddingDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const defaultMilestones = [
    { time: wedding.wedding_time || '4:00 PM', event: 'Ceremony' },
    { time: '5:00 PM', event: 'Cocktail Hour' },
    { time: '6:30 PM', event: 'Dinner & Toasts' },
    { time: '8:30 PM', event: 'Dancing & Celebration' },
  ];
  const timelineMilestones = parseTimelineItems(wedding.program_timeline, defaultMilestones);

  const dressPalette = dressCodeSettings.guests.colors?.length
    ? dressCodeSettings.guests.colors
    : ['#3D4D3B', '#758673', '#D4C3B2', '#E8DDD0', '#C5A059'];

  return (
    <div
      data-native-template="VelureEditorial" data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined} className={`velure-editorial-template relative pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F8F6F0',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#2A3329',
        backgroundColor: 'var(--native-paper)', // Warm Alabaster Ivory
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* Marble / Gold Vein Ambiance */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 80% 20%, var(--native-accent) 0%, transparent 40%), radial-gradient(ellipse at 20% 80%, var(--native-accent) 0%, transparent 40%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── PANEL 1: ARCH MONOGRAM, EDITORIAL TITLES, HERO & FLOATING MUSIC PLAYER ── */}
      <section data-native-composition data-native-hero className="relative max-w-2xl mx-auto px-4 sm:px-8 pt-12 pb-16 text-center z-10">
        <MonogramMark initials={wedding.logo_initials} brideName={wedding.bride_name} groomName={wedding.groom_name} shape={wedding.logo_shape} color={wedding.logo_color} motifColor={motifColor} animation={wedding.logo_animation} fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined} size="lg" className="mx-auto" />

        <p className="text-[10px] font-sans uppercase tracking-[0.35em] text-[var(--native-ink)] font-semibold mb-3">
          Together With Their Families
        </p>

        {/* Couple Title: Didone Serif + Gold Script "and" */}
        <h1 data-native-title className={`text-4xl sm:text-6xl font-serif text-[var(--native-ink)] tracking-tight leading-[0.95] break-words uppercase ${titleStyle.className}`} style={titleStyle.style}>
          <span>{wedding.bride_name}</span>
          <span className="block text-2xl sm:text-3xl font-light italic text-[var(--native-accent)] my-2 lowercase font-serif">
            and
          </span>
          <span>{wedding.groom_name}</span>
        </h1>

        <div className="flex justify-center my-4">
          <Heart className="w-3.5 h-3.5 fill-current text-[var(--native-accent)]" />
        </div>

        {/* Boxed Date Display (Image 4 replica) */}
        <div className="inline-flex items-center gap-4 text-xs font-sans tracking-widest text-[var(--native-ink)] border-y border-[var(--native-border)]/40 py-2.5 px-8 my-2">
          <span className="font-bold">{formattedMonth}</span>
          <span className="text-2xl font-serif font-bold text-[var(--native-ink)]">{formattedDay}</span>
          <span className="font-bold">{formattedYear}</span>
        </div>
        <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-[var(--native-ink)] mt-1">
          {formattedWeekday}
        </p>

        {/* Full Vertical Photo Frame with Floating Spotify Player */}
        <div data-native-portrait className="relative mt-8 max-w-lg mx-auto">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
            <Image
              src={heroImage}
              alt={`${wedding.bride_name} and ${wedding.groom_name}`}
              priority
              fill
              sizes="(max-width: 768px) 100vw, 512px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {wedding.background_music_enabled && wedding.background_music_url && (
            <div data-native-card className="absolute -bottom-8 left-4 right-4 sm:left-8 sm:right-8 rounded-2xl p-4 shadow-xl border border-[var(--native-border)] z-20 bg-[var(--native-paper)]">
              <p className="text-base mb-2">{wedding.background_music_title || 'Our Wedding Song'}</p>
              <audio controls preload="none" src={wedding.background_music_url} aria-label={wedding.background_music_title || 'Our wedding song'} />
            </div>
          )}
        </div>
      </section>

      {!wedding.is_thank_you_mode && wedding.wedding_date && (
        <section id="countdown" data-native-composition data-native-countdown-section className="relative max-w-2xl mx-auto px-4 sm:px-8 py-12 text-center z-10">
          <p className="text-[10px] font-sans uppercase tracking-[0.35em] text-[var(--native-ink)] mb-3">
            {isPast ? 'Our Wedding Day Has Arrived' : 'Until We Say I Do'}
          </p>
          <h2 data-native-title className={`font-serif text-3xl sm:text-4xl text-[var(--native-ink)] mb-7 ${titleStyle.className}`} style={titleStyle.style}>
            The Countdown
          </h2>
          <div data-native-countdown className="grid grid-cols-4 border-y border-[var(--native-border)] py-6 max-w-md mx-auto">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="min-w-0 px-1 border-r last:border-r-0 border-[var(--native-border)]">
                <span className="block font-serif text-2xl sm:text-4xl tabular-nums text-[var(--native-ink)]">{String(value).padStart(2, '0')}</span>
                <span className="block mt-2 text-[9px] sm:text-[10px] uppercase tracking-wide font-sans text-[var(--native-ink)]">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PANEL 2: THE BIG DAY TIMELINE & DRESS CODE PALETTE (From Image 4) ── */}
      <section data-native-composition className="relative max-w-2xl mx-auto px-4 sm:px-8 pt-20 pb-12 text-center z-10">
        <h2 data-native-title className={`text-sm sm:text-base font-sans font-bold uppercase tracking-[0.35em] text-[var(--native-ink)] mb-1 ${titleStyle.className}`} style={titleStyle.style}>
          The Big Day
        </h2>
        <div className="flex justify-center mb-8">
          <Heart className="w-3 h-3 fill-current text-[var(--native-accent)]" />
        </div>

        {/* Dynamic Milestone Timeline with Circular Icons (Image 4 replica) */}
        <div className="relative max-w-md mx-auto space-y-6 text-left pl-6 sm:pl-10 border-l border-[var(--native-border)]/40 my-8">
          {timelineMilestones.map((item, idx) => (
            <div key={`milestone-${idx}`} className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0.5 w-6 h-6 rounded-full bg-[var(--native-action)] text-[var(--native-on-action)] flex items-center justify-center text-[10px] shadow-sm">
                {idx === 0 ? <Church size={12} strokeWidth={1.5} aria-hidden="true" /> : idx === 1 ? <Wine size={12} strokeWidth={1.5} aria-hidden="true" /> : idx === 2 ? <UtensilsCrossed size={12} strokeWidth={1.5} aria-hidden="true" /> : <Sparkles size={12} strokeWidth={1.5} aria-hidden="true" />}
              </span>
              <p className="text-xs font-bold font-sans uppercase tracking-wider text-[var(--native-accent)]">
                {item.time ? `${item.time} • ` : ''}{item.event}
              </p>
              {idx === 0 && wedding.venue_name && (
                <p className="text-xs text-[var(--native-ink)]">{wedding.venue_name}</p>
              )}
            </div>
          ))}
        </div>

        {/* Dress Code: Semi Formal with dynamic circular swatches (From Image 4) */}
        <div className="mt-12 pt-6 border-t border-[var(--native-border)]/30">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-ink)] mb-1">
            Dress Code
          </p>
          <p className="font-serif italic text-lg sm:text-xl text-[var(--native-ink)] mb-4">
            {dressCodeSettings.guests.attire || 'Semi Formal'}
          </p>
          {dressCodeSettings.guests.notes && <p className="text-sm mb-4">{dressCodeSettings.guests.notes}</p>}
          <div className="flex justify-center items-center gap-3 flex-wrap">
            {dressPalette.map((color, idx) => (
              <span
                key={`${color}-${idx}`}
                className="w-7 h-7 rounded-full border border-white shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SAGE GREEN WAVE SECTION: REGISTRY & QR CODE (From Image 4) ── */}
      <section data-native-accent-panel className="relative bg-[var(--native-action)] text-[var(--native-on-action)] py-14 px-4 sm:px-8 text-center my-8 rounded-3xl mx-4 sm:mx-8 shadow-xl">
        <div className="max-w-md mx-auto space-y-4">
          <div data-native-card className="w-10 h-10 rounded-full bg-white/10 mx-auto flex items-center justify-center border border-white/20">
            <Gift className="w-5 h-5 text-[var(--native-accent)]" />
          </div>
          <h3 data-native-title className={`font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-[var(--native-paper)] ${titleStyle.className}`} style={titleStyle.style}>
            Your Presence Is The Best Gift
          </h3>
          <p className="text-xs font-serif italic text-[var(--native-ink)] leading-relaxed">
            {wedding.gift_bank || wedding.gift_account_number
              ? 'If you wish to honor us with a wedding gift, a contribution to our future means the world to us.'
              : 'Having you with us to share this celebration is the greatest gift of all!'}
          </p>

          {/* Dynamic Bank / Registry details if present */}
          {(wedding.gift_bank || wedding.gift_account_number) && (
            <div data-native-card className="bg-white/10 rounded-2xl p-4 max-w-xs mx-auto border border-white/20 text-xs text-white/90 space-y-1">
              {wedding.gift_bank && <p className="font-bold text-[var(--native-paper)]">{wedding.gift_bank}</p>}
              {wedding.gift_account_number && (
                <p className="font-mono tracking-wider">{wedding.gift_account_number}</p>
              )}
              {wedding.gift_account_name && (
                <p className="text-[10px] text-white/70">{wedding.gift_account_name}</p>
              )}
            </div>
          )}

          {/* QR Code Presentation Box */}
          <div data-native-card className="mt-4 p-4 bg-white rounded-2xl inline-block shadow-lg">
            <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-neutral/20 text-[var(--native-ink)] overflow-hidden">
              {wedding.gift_qr_image ? (
                <div className="relative w-full h-full">
                  <Image
                    src={wedding.gift_qr_image}
                    alt="Gift Registry QR"
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <QrCode className="w-24 h-24 text-[var(--native-ink)]" />
              )}
            </div>
            <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-[var(--native-ink)] mt-2">
              Scan To Registry
            </p>
          </div>
        </div>
      </section>

      {/* ── PANEL 3: GUEST INFORMATION & RSVP (From Image 4) ── */}
      <section data-native-composition className="relative max-w-2xl mx-auto px-4 sm:px-8 py-12 text-center z-10">
        <h2 data-native-title className={`text-xl sm:text-2xl font-serif text-[var(--native-ink)] tracking-wider mb-1 ${titleStyle.className}`} style={titleStyle.style}>
          RSVP
        </h2>
        <div className="flex justify-center mb-3">
          <Heart className="w-3 h-3 fill-current text-[var(--native-accent)]" />
        </div>
        <p className="text-xs font-sans uppercase tracking-[0.25em] text-[var(--native-ink)] mb-6">
          Kindly reply by {wedding.rsvp_deadline || 'the designated date'}
        </p>

        <a data-wedding-control="primary"
                href="#rsvp"
          className="inline-flex min-h-[48px] items-center justify-center px-10 py-3.5 rounded-full bg-[var(--native-action)] text-[var(--native-on-action)] text-xs font-sans font-bold uppercase tracking-[0.25em] shadow-lg transition-transform hover:scale-105"
        >
          Yes, I&apos;ll Be There!
        </a>

        {/* Guest Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mt-14 mb-10">
          <div data-native-card className="p-4 rounded-2xl bg-white/70 border border-[var(--native-border)]/20 shadow-sm">
            <Car className="w-6 h-6 text-[var(--native-accent)] mx-auto mb-2" />
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--native-ink)]">Transport</p>
            <p className="text-[10px] text-[var(--native-ink)] mt-1">
              Shuttle service available from designated venues.
            </p>
          </div>

          <div data-native-card className="p-4 rounded-2xl bg-white/70 border border-[var(--native-border)]/20 shadow-sm">
            <Hotel className="w-6 h-6 text-[var(--native-accent)] mx-auto mb-2" />
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--native-ink)]">Stay</p>
            <p className="text-[10px] text-[var(--native-ink)] mt-1">
              Accommodations and room blocks reserved for guests.
            </p>
          </div>

          <div data-native-card className="p-4 rounded-2xl bg-white/70 border border-[var(--native-border)]/20 shadow-sm">
            <Camera className="w-6 h-6 text-[var(--native-accent)] mx-auto mb-2" />
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--native-ink)]">Photos</p>
            <p className="text-[10px] text-[var(--native-ink)] mt-1">
              Tag our moments with #{wedding.hashtag || `${wedding.bride_name}${wedding.groom_name}`.replace(/\s+/g, '')}
            </p>
          </div>
        </div>

        {/* Romantic Love Quote in Bordered Box */}
        <div data-native-card className="p-6 sm:p-8 rounded-3xl border border-[var(--native-border)]/40 bg-white/50 max-w-md mx-auto my-6 text-center">
          <p className="text-2xl text-[var(--native-accent)] mb-2 font-serif">&ldquo;</p>
          <p className="text-sm sm:text-base font-serif italic text-[var(--native-ink)] leading-relaxed">
            &ldquo;{wedding.quote || 'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.'}&rdquo;
          </p>
          <div className="flex justify-center mt-4">
            <Heart className="w-3 h-3 fill-current text-[var(--native-accent)]" />
          </div>
        </div>

        {/* Bottom Arch Photo Frame with Couple Photo */}
        <div className="relative max-w-xs mx-auto mt-8">
          <div data-native-card className="relative aspect-[3/4] w-full overflow-hidden rounded-t-full border-2 border-[var(--native-border)]/60 shadow-lg p-1.5 bg-white">
            <div className="relative w-full h-full overflow-hidden rounded-t-full">
              <Image
                src={couplePhoto}
                alt="Love on Film"
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </div>
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

      {/* Shared Lower Sections (Entourage, Venue, Guestbook, RSVP) */}
      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
    </div>
  );
}

'use client';

import { MonogramMark } from '@/components/MonogramMark';
import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import Image from 'next/image';
import { MapPin, Gift, Church, Wine, UtensilsCrossed, Sparkles } from 'lucide-react';
import { BioSection, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection } from '../wedding';
import { SharedNewSections, parseTimelineItems, useCountdown } from './shared';
import { parseDressCodeValue } from '@/lib/dress-code';
import type { TemplateProps } from '@/types/wedding';

// Realistic Torn / Ripped Paper Edge SVG Divider
function TornPaperDivider({
  className = '',
  position = 'bottom',
}: {
  className?: string;
  position?: 'top' | 'bottom';
}) {
  return (
    <div
      className={`w-full overflow-hidden leading-none z-20 ${className}`}
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
        className="w-full h-8 sm:h-12 text-[var(--native-paper)]"
      >
        <path
          d="M0 0L30 18L70 8L110 24L160 12L200 20L250 8L300 22L360 10L420 25L470 14L520 22L580 8L640 24L700 12L760 20L820 6L880 22L940 10L1000 24L1060 12L1120 20L1160 8L1200 18V60H0V0Z"
          fill="currentColor"
        />
        {/* Subtle deckle paper tear shadow */}
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

// Terracotta / Peach Floral Bouquet Emoji/Emblem Accent
function TerracottaFloralAccent({ className = '' }: { className?: string }) {
  return (
    <div className={`select-none pointer-events-none flex items-center justify-center gap-1 ${className}`}>
      <span className="text-2xl sm:text-3xl filter drop-shadow-sm">🥀</span>
      <span className="text-xl sm:text-2xl filter drop-shadow-sm -ml-2">🍂</span>
      <span className="text-2xl sm:text-3xl filter drop-shadow-sm -ml-2">🌹</span>
    </div>
  );
}

export default function TornPaperTerracottaTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
  const titleStyle = getSectionTitleStyle(wedding);
  const motifColor = wedding.motif_color || '#B65A3C'; // Terracotta / Rust default from Image 5
  const heroImage = wedding.hero_image || wedding.couple_photo || '/logo.png';
  const couplePhoto = wedding.couple_photo || heroImage;
  const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);
  const dressCodeSettings = parseDressCodeValue(wedding.dress_code, motifColor);

  const weddingDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`)
    : new Date();

  const formattedMonth = weddingDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const formattedDay = weddingDate.getDate();
  const formattedYear = weddingDate.getFullYear();
  const formattedWeekday = weddingDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const defaultItinerary = [
    { time: wedding.wedding_time || '17:00', event: 'Ceremony' },
    { time: '18:00', event: 'Grand Entrance & Toast' },
    { time: '18:30', event: 'Dinner' },
    { time: '19:30', event: 'Party & Dancing' },
  ];
  const itineraryItems = parseTimelineItems(wedding.program_timeline, defaultItinerary);

  return (
    <div
      data-native-template="TornPaperTerracotta" data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined} className={`torn-paper-terracotta-template relative pb-28 font-serif selection:bg-[var(--native-action)] selection:text-white ${nativeStyles.native}`}
      style={{
        '--native-paper': hasBackgroundChoice ? 'var(--builder-paper)' : '#F7F2EB',
        '--native-ink': hasBackgroundChoice ? 'var(--builder-ink)' : '#4A3027',
        backgroundColor: hasBackgroundChoice ? 'var(--native-paper)' : '#38251E', // Warm Dark Bark/Espresso Background
        color: 'var(--native-ink)',
      } as React.CSSProperties}
    >
      {/* ── PANEL 1: TORN DECKLE PAPER INVITATION CARD ── */}
      <div className="relative max-w-2xl mx-auto px-3 sm:px-6 pt-10">
        <div data-native-hero data-native-card className="relative bg-[var(--native-paper)] shadow-2xl overflow-hidden rounded-t-3xl pt-10 pb-16 px-4 sm:px-10 text-center">
          {/* Top Scripture Quote from Image 5 */}
          <p className="text-[10px] sm:text-xs font-serif italic text-[var(--native-ink)] max-w-xs mx-auto leading-relaxed mb-6">
            {wedding.quote ? (
              <span>&ldquo;{wedding.quote}&rdquo;</span>
            ) : (
              <>
                &ldquo;Above all, love each other deeply, because love covers over a multitude of sins.&rdquo;
                <span className="block not-italic text-[9px] font-sans uppercase tracking-widest text-[var(--native-ink)] mt-0.5">
                  1 Peter 4:8
                </span>
              </>
            )}
          </p>

          {/* Bold Monogram from Image 5: "C | C" */}
          <div className="inline-block py-2 px-6 border-b border-[var(--native-border)]/30 mb-4">
            <MonogramMark initials={wedding.logo_initials} brideName={wedding.bride_name} groomName={wedding.groom_name} shape={wedding.logo_shape} color={wedding.logo_color} motifColor={motifColor} animation={wedding.logo_animation} fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined} size="sm" className="mx-auto" />
          </div>

          <p className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.35em] text-[var(--native-accent)] font-bold mb-8">
            We Are Getting Married!
          </p>

          {/* First Couple Photo with Ripped Bottom Edge */}
          <div data-native-portrait className="relative max-w-md mx-auto mb-8">
            <div className="relative aspect-[3/4] w-full overflow-hidden shadow-lg border-2 border-white">
              <Image
                src={heroImage}
                alt={`${wedding.bride_name} & ${wedding.groom_name}`}
                priority
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover"
              />
            </div>
            {/* Ripped Bottom Edge Overlay */}
            <TornPaperDivider position="bottom" className="absolute -bottom-1 inset-x-0" />
          </div>

          {/* Parents Honoring Block (From Image 5) */}
          <div className="my-8 py-4 space-y-4 text-xs font-serif text-[var(--native-ink)]">
            <p className="italic text-sm text-[var(--native-ink)] max-w-sm mx-auto leading-relaxed">
              &ldquo;With hearts full of gratitude and joy, we thank God and our families for their love and prayers.&rdquo;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--native-border)]/20 max-w-md mx-auto">
              <div>
                <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-[var(--native-accent)]">
                  Parents of the Bride
                </p>
                <p className="text-xs font-serif mt-0.5">Family &amp; Loved Ones</p>
              </div>
              <div>
                <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-[var(--native-accent)]">
                  Parents of the Groom
                </p>
                <p className="text-xs font-serif mt-0.5">Family &amp; Loved Ones</p>
              </div>
            </div>
          </div>

          {/* Couple Calligraphy Title Framed with Terracotta Florals */}
          <div className="relative my-8 py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TerracottaFloralAccent className="scale-75 sm:scale-100" />
            </div>

            <h1 data-native-title className={`text-4xl sm:text-6xl font-serif text-[var(--native-ink)] tracking-wide break-words italic ${titleStyle.className}`} style={titleStyle.style}>
              <span>{wedding.bride_name}</span>
              <span className="block text-2xl font-light not-italic my-1 text-[var(--native-accent)]">&amp;</span>
              <span>{wedding.groom_name}</span>
            </h1>

            <p className="text-xs font-serif italic text-[var(--native-ink)] max-w-xs mx-auto mt-3">
              joyfully invite you to celebrate our marriage and the beginning of our new life together.
            </p>
          </div>

          {/* Boxed Date Display (Image 5 replica) */}
          <div className="inline-block border-y border-[var(--native-border)]/40 py-2.5 px-8 my-4">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-accent)] block mb-1">
              {formattedMonth}
            </span>
            <div className="flex items-center justify-center gap-4">
              <span className="text-xs font-sans tracking-widest text-[var(--native-ink)]">{formattedWeekday}</span>
              <span className="text-3xl font-serif font-bold text-[var(--native-ink)]">{formattedDay}</span>
              <span className="text-xs font-sans tracking-widest text-[var(--native-ink)]">{formattedYear}</span>
            </div>
          </div>

          {/* Countdown Clock (From Image 5: "TIME REMAINING") */}
          {!wedding.is_thank_you_mode && (
            <div id="countdown" data-native-countdown-section className="mt-8 pt-4">
              <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-[var(--native-ink)] font-bold mb-3">
                {isPast ? 'Celebrating Our Union' : 'Time Remaining'}
              </p>
              <div data-native-countdown className="flex justify-center items-center gap-3 sm:gap-4 font-mono text-xl sm:text-2xl font-bold text-[var(--native-ink)]">
                <div data-native-card className="bg-[var(--native-paper)] rounded-xl px-3 py-2 border border-[var(--native-border)]/20">
                  <span className="block">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Days</span>
                </div>
                <span>:</span>
                <div data-native-card className="bg-[var(--native-paper)] rounded-xl px-3 py-2 border border-[var(--native-border)]/20">
                  <span className="block">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Hours</span>
                </div>
                <span>:</span>
                <div data-native-card className="bg-[var(--native-paper)] rounded-xl px-3 py-2 border border-[var(--native-border)]/20">
                  <span className="block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Mins</span>
                </div>
                <span>:</span>
                <div data-native-card className="bg-[var(--native-paper)] rounded-xl px-3 py-2 border border-[var(--native-border)]/20">
                  <span className="block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[var(--native-ink)]">Secs</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PANEL 2: MIDDLE RECEPTION & ITINERARY ON TORN PAPER (From Image 5) ── */}
      <div className="relative max-w-2xl mx-auto px-3 sm:px-6 my-6">
        <div data-native-card className="relative bg-[var(--native-paper)] shadow-2xl py-12 px-4 sm:px-10 text-center">
          <p className="text-xs font-sans uppercase tracking-[0.3em] text-[var(--native-accent)] font-bold mb-1">
            {wedding.wedding_time || '17:00 HRS.'}
          </p>
          <h2 data-native-title className={`text-2xl sm:text-3xl font-serif text-[var(--native-ink)] tracking-wide uppercase mb-2 ${titleStyle.className}`} style={titleStyle.style}>
            Reception
          </h2>
          <p className="text-base font-serif italic text-[var(--native-ink)] mb-1">
            {wedding.reception_venue_name || wedding.venue_name}
          </p>
          {(wedding.reception_venue_address || wedding.venue_address) && (
            <p className="text-xs font-sans text-[var(--native-ink)] max-w-xs mx-auto mb-6">
              {wedding.reception_venue_address || wedding.venue_address}
            </p>
          )}

          {(wedding.reception_maps_link || wedding.maps_link) && (
            <a data-wedding-control="primary"
                href={wedding.reception_maps_link || wedding.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--native-action)] text-[var(--native-on-action)] text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[var(--native-action)] transition-colors"
            >
              <MapPin className="w-4 h-4" /> View Location
            </a>
          )}

          {/* Second Couple Photo with Ripped Edges Top & Bottom */}
          <div className="relative max-w-md mx-auto my-12">
            <TornPaperDivider position="top" className="absolute -top-1 inset-x-0 z-10" />
            <div className="relative aspect-[4/5] w-full overflow-hidden shadow-md">
              <Image
                src={couplePhoto}
                alt="Our Moment"
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover"
              />
            </div>
            <TornPaperDivider position="bottom" className="absolute -bottom-1 inset-x-0 z-10" />
          </div>

          {/* Dynamic Itinerary of Activities (Milestone Icons from Image 5) */}
          <div data-native-itinerary className="max-w-md mx-auto text-left space-y-5 my-8">
            <h3 data-native-title className={`text-center text-xs font-sans font-bold uppercase tracking-[0.3em] text-[var(--native-accent)] mb-6 ${titleStyle.className}`} style={titleStyle.style}>
              Itinerary of Activities
            </h3>
            {itineraryItems.map((item, idx) => (
              <div key={`itinerary-${idx}`} className="flex items-center justify-between border-b border-[var(--native-border)]/20 pb-3">
                <span className="flex items-center gap-3 text-xs font-bold text-[var(--native-ink)]">
                  <span aria-hidden="true">{idx === 0 ? <Church size={18} strokeWidth={1.25} /> : idx === 1 ? <Wine size={18} strokeWidth={1.25} /> : idx === 2 ? <UtensilsCrossed size={18} strokeWidth={1.25} /> : <Sparkles size={18} strokeWidth={1.25} />}</span>
                  {item.event}
                </span>
                <span className="text-xs font-sans text-[var(--native-ink)]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANEL 3: DRESS CODE, GIFTS & RSVP (From Image 5) ── */}
      <div className="relative max-w-2xl mx-auto px-3 sm:px-6 my-6">
        <div data-native-card className="relative bg-[var(--native-paper)] shadow-2xl rounded-b-3xl py-12 px-4 sm:px-10 text-center">
          {/* Dress Code Section */}
          <div className="mb-10">
            <p className="text-xs font-sans uppercase tracking-[0.3em] text-[var(--native-accent)] font-bold mb-1">
              Dress Code
            </p>
            <p className="font-serif italic text-lg sm:text-xl text-[var(--native-ink)] mb-2">
              {dressCodeSettings.guests.attire || 'Semi-Formal'}
            </p>
            <p className="text-xs font-serif text-[var(--native-ink)] max-w-sm mx-auto leading-relaxed">
              {dressCodeSettings.guests.notes || 'We look forward to celebrating with you in your chosen outfit.'}
            </p>
          </div>

          {/* Gift Suggestion (From Image 5) */}
          <div className="border-t border-b border-[var(--native-border)]/25 py-8 my-8 max-w-md mx-auto">
            <Gift className="w-8 h-8 text-[var(--native-accent)] mx-auto mb-2" />
            <p className="text-xs font-sans uppercase tracking-[0.3em] text-[var(--native-accent)] font-bold mb-2">
              Gift Suggestion
            </p>
            <p className="text-xs font-serif text-[var(--native-ink)] leading-relaxed mb-4">
              Your presence is the greatest gift of all. However, if you wish to honor us with a gift, monetary gifts or bank transfers are warmly appreciated.
            </p>

            {/* Dynamic Bank Transfer Box if bank details exist */}
            {(wedding.gift_bank || wedding.gift_account_number) && (
              <div data-native-card className="bg-[var(--native-paper)] rounded-2xl p-4 my-3 text-xs text-[var(--native-ink)] border border-[var(--native-border)]/20 space-y-1 text-left max-w-xs mx-auto">
                <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--native-accent)]">Bank Transfer</p>
                {wedding.gift_bank && <p className="font-bold">BANK: {wedding.gift_bank}</p>}
                {wedding.gift_account_name && <p>ACCOUNT NAME: {wedding.gift_account_name}</p>}
                {wedding.gift_account_number && <p className="font-mono">ACCOUNT: {wedding.gift_account_number}</p>}
              </div>
            )}

            <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--native-ink)] mt-3">
              Gift envelopes available at reception
            </p>
          </div>

          {/* Confirm Attendance (From Image 5) */}
          <div className="my-8">
            <p className="text-xs font-sans uppercase tracking-[0.3em] text-[var(--native-accent)] font-bold mb-2">
              Confirm Attendance
            </p>
            <p className="text-xs font-serif text-[var(--native-ink)] mb-6">
              Please confirm your attendance before {wedding.rsvp_deadline || 'the deadline'}.
            </p>

            <a data-wedding-control="primary"
                href="#rsvp"
              className="inline-flex min-h-[48px] items-center justify-center px-10 py-3.5 rounded-full bg-[var(--native-action)] text-[var(--native-on-action)] text-xs font-sans font-bold uppercase tracking-[0.25em] shadow-lg hover:bg-[var(--native-action)] transition-colors"
            >
              Respond to RSVP
            </a>
          </div>

          {/* Calligraphy Sign-Off: "Thank You!" Framed by Terracotta Florals */}
          <div className="mt-12 pt-6">
            <TerracottaFloralAccent className="mb-2" />
            <p className="font-serif italic text-3xl sm:text-4xl text-[var(--native-accent)]">
              Thank You!
            </p>
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-[var(--native-ink)] mt-2">
              We Look Forward To Celebrating With You!
            </p>
          </div>
        </div>
      </div>

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

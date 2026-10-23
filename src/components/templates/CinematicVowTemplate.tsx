'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  BioSection,
  CountdownTimer,
  DetailsSection,
  GallerySection,
  GiftSection,
  TimelineSection,
  VideoSection,
  AttireSection,
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function CinematicVowTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const motifColor = wedding.motif_color || '#C89666'; // Golden Amber Warm Tone
  const heroImage = wedding.hero_image || wedding.couple_photo || '/logo.png';
  const weddingYear = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`).getFullYear()
    : new Date().getFullYear();
  const formattedDate = wedding.wedding_date
    ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="bg-[#12100E] text-[#EDE4DC] font-serif relative pb-28 selection:bg-[#C89666] selection:text-black">
      {/* 2.39:1 Anamorphic Widescreen Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-white/10">
        {/* Top Cinematic Letterbox Bar */}
        <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.35em] text-white/60 bg-[#0A0908]/90 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Scene {weddingYear}</span>
            <span>•</span>
            <span>Take 01</span>
          </div>
          <span className="hidden sm:inline-block font-mono tracking-widest text-white/40">
            2.39:1 ANAMORPHIC WIDESCREEN
          </span>
          <span style={{ color: motifColor }}>PRESENTED IN SOUND &amp; VISION</span>
        </div>

        {/* Hero Visual Frame */}
        <div className="relative flex-1 min-h-[70vh] flex items-end px-4 sm:px-8 lg:px-16 py-16 sm:py-24">
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={heroImage}
              alt={`${wedding.bride_name} and ${wedding.groom_name}`}
              priority
              fill
              sizes="100vw"
              className="object-cover brightness-[0.55] contrast-[1.08] saturate-[0.9]"
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-black/40 to-[#0A0908]/80 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70 pointer-events-none" />
          </motion.div>

          {/* Subtitle-Style Romantic Overlay */}
          <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-xs sm:text-sm font-sans uppercase tracking-[0.4em] text-white/70 mb-4"
            >
              A Love Story Directed By Destiny
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-[clamp(3.5rem,7vw,6.5rem)] font-light leading-[0.95] tracking-tight text-white"
            >
              <span className="font-serif block sm:inline">{wedding.bride_name}</span>
              <span className="mx-4 text-[0.6em] italic font-serif" style={{ color: motifColor }}>
                &amp;
              </span>
              <span className="font-serif block sm:inline">{wedding.groom_name}</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-sans tracking-[0.25em] text-white/80"
            >
              <span className="font-semibold uppercase">{formattedDate}</span>
              <span className="text-white/40">•</span>
              <span className="font-serif italic text-base sm:text-lg text-[#F0E6DD]">
                {wedding.venue_name}
              </span>
            </motion.div>

            {wedding.venue_address && (
              <p className="mt-1 text-xs text-white/50 font-sans tracking-wider max-w-md mx-auto">
                {wedding.venue_address}
              </p>
            )}

            <p className="mt-6 text-sm sm:text-base italic text-white/80 max-w-xl mx-auto font-serif leading-relaxed">
              &ldquo;{wedding.quote || wedding.story || 'Every great love story feels like a masterpiece in motion.'}&rdquo;
            </p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-8 flex flex-wrap justify-center items-center gap-4"
            >
              <a
                href="#rsvp"
                aria-label="RSVP to the premiere"
                className="inline-flex min-h-[48px] items-center justify-center px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-black shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: motifColor }}
              >
                RSVP For The Premiere
              </a>
              <a
                href="#details"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3 rounded-full text-xs font-sans font-semibold uppercase tracking-[0.2em] border border-white/20 text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Program Schedule
              </a>
            </motion.div>
          </div>
        </div>

        {/* Bottom Cinematic Letterbox Bar */}
        <div className="relative z-20 w-full px-6 py-3 flex items-center justify-center text-[10px] font-sans uppercase tracking-[0.4em] text-white/40 bg-[#0A0908]/90 backdrop-blur-md border-t border-white/5">
          <span>ORIGINAL CELEBRATION • PRODUCTION NO. {weddingYear}</span>
        </div>
      </section>

      {/* Structured Sections */}
      {!wedding.is_thank_you_mode && (
        <CountdownTimer
          id="countdown"
          weddingDate={wedding.wedding_date}
          weddingTime={wedding.wedding_time}
          brideName={wedding.bride_name}
          groomName={wedding.groom_name}
          venueName={wedding.venue_name}
          venueAddress={wedding.venue_address}
          template={wedding.template}
          motifColor={motifColor}
        />
      )}

      <BioSection id="bio" wedding={wedding} />

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
        galleryLayout={wedding.gallery_layout || 'film'}
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

      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />

    </div>
  );
}

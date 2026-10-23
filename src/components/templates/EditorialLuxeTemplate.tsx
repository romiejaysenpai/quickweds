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

export default function EditorialLuxeTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const motifColor = wedding.motif_color || '#B85A66';
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
    <div className="bg-[#FAF7F2] text-[#241F1C] font-serif relative pb-28 selection:bg-[#241F1C] selection:text-white">
      {/* Subtle paper grain texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(#241F1C 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Hero: Asymmetrical 2-Column Magazine Cover */}
      <section className="relative min-h-[92vh] flex items-center px-4 sm:px-8 lg:px-14 py-12 lg:py-20 overflow-hidden border-b border-[#241F1C]/10">
        <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative aspect-[3/4] max-h-[780px] w-full overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl shadow-[#241F1C]/10 border border-[#241F1C]/10 bg-white p-2.5 sm:p-3"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl lg:rounded-2xl">
              <Image
                src={heroImage}
                alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                priority
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[12s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.35em] text-white/70">The Official Monograph</p>
                <p className="mt-1 text-lg sm:text-xl italic text-white/90 font-serif">
                  {wedding.quote || 'Two paths, one lifelong celebration.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Typography & Prologue */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8"
          >
            <div className="flex items-center gap-3 text-[11px] font-sans uppercase tracking-[0.3em] text-[#7A6F68]">
              <span>Special Edition</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: motifColor }} />
              <span>Vol. {weddingYear}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[clamp(3.5rem,6.5vw,5.5rem)] font-normal leading-[0.92] tracking-tight text-[#1F1A17]">
              <span className="block font-serif">{wedding.bride_name}</span>
              <span className="my-2 block text-[0.45em] italic font-light font-serif" style={{ color: motifColor }}>
                &amp;
              </span>
              <span className="block font-serif">{wedding.groom_name}</span>
            </h1>

            <div className="h-px w-20 bg-[#241F1C]/20" />

            <div className="space-y-2 text-sm sm:text-base text-[#6B5E55] leading-relaxed">
              <p className="font-sans text-xs uppercase tracking-[0.25em] font-semibold text-[#1F1A17]">
                {formattedDate}
              </p>
              <p className="font-serif italic text-lg text-[#241F1C]">
                {wedding.venue_name}
              </p>
              {wedding.venue_address && (
                <p className="text-xs text-[#7A6F68] font-sans">
                  {wedding.venue_address}
                </p>
              )}
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-[#594E46] max-w-lg font-serif">
              {wedding.story ||
                'Together with our families, we invite you to share in our vows, laughter, and an unforgettable celebration of love.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#rsvp"
                aria-label="RSVP Confirmation"
                className="inline-flex min-h-[48px] items-center justify-center px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-black/10 transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ backgroundColor: motifColor }}
              >
                Confirm Attendance
              </a>
              <a
                href="#details"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.2em] border border-[#241F1C]/25 text-[#241F1C] transition-colors hover:border-[#241F1C] hover:bg-[#241F1C]/5"
              >
                Event Details
              </a>
            </div>
          </motion.div>
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

      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />

    </div>
  );
}

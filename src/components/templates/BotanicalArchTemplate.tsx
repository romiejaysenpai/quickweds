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

export default function BotanicalArchTemplate({ wedding, gallery, isExpired }: TemplateProps) {
  const motifColor = wedding.motif_color || '#4A6B53'; // Botanical Sage Green default
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
    <div className="bg-[#FAF9F5] text-[#2D332D] font-serif relative pb-28 selection:bg-[#4A6B53] selection:text-white">
      {/* Soft botanical ambiance background overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#4A6B53 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Hero: Cathedral Arch Portrait Frame */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-8 lg:px-14 py-12 lg:py-20 overflow-hidden">
        {/* Soft background botanical glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E8EFE8] rounded-full blur-3xl pointer-events-none opacity-60" />

        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10">
          {/* Arch Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex justify-center order-2 lg:order-1"
          >
            <div className="relative w-full max-w-[420px] p-3 sm:p-4 bg-white/80 backdrop-blur-sm border border-[#4A6B53]/15 shadow-2xl shadow-[#4A6B53]/10 rounded-t-[180px] sm:rounded-t-[220px] rounded-b-2xl">
              <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-t-[170px] sm:rounded-t-[210px] rounded-b-xl">
                <Image
                  src={heroImage}
                  alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                  priority
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover transition-transform duration-[10s] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-sans uppercase tracking-[0.25em] text-white/90 mb-2">
                    <span>Botanical Union</span>
                    <span>•</span>
                    <span>Est. {weddingYear}</span>
                  </div>
                  <p className="text-sm italic text-white/90 font-serif max-w-xs mx-auto">
                    {wedding.quote || 'Rooted in devotion, blooming together.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Typography & Callout */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.3em] text-[#5C6E5F]">
              <span>We Invite You To Celebrate</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[clamp(3.2rem,6vw,5.2rem)] font-light leading-[0.98] tracking-normal text-[#242D25]">
              <span className="block font-serif">{wedding.bride_name}</span>
              <span
                className="my-2 block text-[0.55em] italic font-serif font-normal"
                style={{ color: motifColor }}
              >
                &amp;
              </span>
              <span className="block font-serif">{wedding.groom_name}</span>
            </h1>

            <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: motifColor }} />

            <div className="space-y-1.5 text-sm sm:text-base text-[#4F5950] font-sans">
              <p className="font-semibold uppercase tracking-[0.2em] text-[#242D25]">
                {formattedDate}
              </p>
              <p className="font-serif italic text-lg text-[#2D332D]">
                {wedding.venue_name}
              </p>
              {wedding.venue_address && (
                <p className="text-xs text-[#6F7B70] tracking-wide">
                  {wedding.venue_address}
                </p>
              )}
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-[#4A544B] max-w-md font-serif italic">
              {wedding.story ||
                'Two souls intertwining in nature’s grace. We warmly request the honor of your presence as we exchange our forever vows.'}
            </p>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start items-center gap-4">
              <a
                href="#rsvp"
                aria-label="RSVP to wedding"
                className="inline-flex min-h-[48px] items-center justify-center px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ backgroundColor: motifColor }}
              >
                Respond to RSVP
              </a>
              <a
                href="#details"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3 rounded-full text-xs font-sans font-semibold uppercase tracking-[0.2em] border border-[#4A6B53]/30 text-[#2D332D] transition-colors hover:border-[#4A6B53] hover:bg-[#4A6B53]/5"
              >
                Wedding Itinerary
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

      <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />

    </div>
  );
}

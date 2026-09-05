'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { 
    VideoSection, 
    BioSection, 
    DetailsSection, 
    CountdownTimer, 
    TimelineSection, 
    GallerySection, 
    GiftSection, 
    AttireSection, 
    FAQSection 
} from '../wedding';
import { SharedNewSections } from './shared';
import type { TemplateProps } from '@/types/wedding';

export default function TimelineTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#4D5B7C';
    const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="bg-[#f8fafc] text-slate-800 font-sans pb-24 relative selection:bg-[#4D5B7C]/20">
            {/* Architectural Timeline Grid Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

            <section className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="max-w-5xl w-full z-10 space-y-8 sm:space-y-12">

                    {/* Schedule Header Pill */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex justify-center"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm backdrop-blur-md">
                            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: motifColor }} />
                            <span className="text-xs uppercase tracking-[0.35em] font-mono font-bold text-slate-600">
                                The Wedding Day Itinerary
                            </span>
                        </div>
                    </motion.div>

                    {/* Hero Split Card */}
                    <div className="bg-white border border-slate-200/80 shadow-[0_20px_70px_rgba(15,23,42,0.06)] rounded-3xl p-6 sm:p-12 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-slate-900 leading-tight">
                                {wedding.bride_name} <br />
                                <span className="text-2xl sm:text-3xl md:text-4xl italic font-light serif text-slate-400">&amp;</span> <br />
                                {wedding.groom_name}
                            </h1>

                            <div className="h-px w-20 bg-slate-200 mx-auto lg:mx-0" />

                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start text-xs font-mono text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" style={{ color: motifColor }} />
                                    <span>{formattedDate}</span>
                                </div>
                                {wedding.wedding_time && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" style={{ color: motifColor }} />
                                        <span>{wedding.wedding_time}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" style={{ color: motifColor }} />
                                    <span>{wedding.venue_name}</span>
                                </div>
                            </div>

                            <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-sans max-w-lg">
                                {wedding.story || 'Join us for a carefully orchestrated celebration of love, music, dining, and unforgettable moments.'}
                            </p>

                            <div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
                                <a 
                                    href="#timeline" 
                                    className="px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-md transition-all inline-flex items-center justify-center min-h-[46px]"
                                    style={{ backgroundColor: motifColor }}
                                >
                                    Explore Schedule ↓
                                </a>
                                <a 
                                    href="#rsvp" 
                                    className="px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs border border-slate-300 text-slate-800 hover:bg-slate-50 transition-all inline-flex items-center justify-center min-h-[46px]"
                                >
                                    Confirm RSVP
                                </a>
                            </div>
                        </div>

                        {/* Right Photo Frame */}
                        <div className="lg:col-span-5">
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden border-4 border-slate-100 shadow-xl relative">
                                <Image
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    priority
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 450px"
                                    className="object-cover"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Structured Itinerary Flow takes center stage */}
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <DetailsSection id="details" wedding={wedding} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            {!wedding.is_thank_you_mode && (
                <CountdownTimer id="countdown"
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time} eventTimezone={wedding.event_timezone}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                />
            )}
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

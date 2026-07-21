'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MonogramMark } from '../MonogramMark';
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

export default function EditorialTemplate({ wedding, gallery, isExpired }: any) {
    if (wedding.template_style === 'editorial-photo') {
        return (
            <div className="bg-[#f7f3ee] pb-24 text-[#201c19]">
                <section className="relative min-h-screen overflow-hidden px-5 py-10 md:px-10">
                    <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-[1.08fr_0.92fr]">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9 }}
                            className="relative min-h-[58vh] overflow-hidden bg-black md:min-h-full"
                        >
                            <Image
                                src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                priority
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover opacity-90"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white md:p-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.42em] opacity-70">Wedding photography edition</p>
                                <p className="mt-3 max-w-lg font-serif text-2xl italic leading-tight md:text-4xl">
                                    {wedding.quote ? <>&ldquo;{wedding.quote}&rdquo;</> : <>&ldquo;Every frame, a quiet promise.&rdquo;</>}
                                </p>
                            </div>
                        </motion.div>
                        <div className="flex flex-col justify-between border-y border-[#201c19]/15 py-8 lg:py-12">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#201c19]/50">Issue 01</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#201c19]/50">{new Date(wedding.wedding_date).getFullYear()}</p>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.9, delay: 0.15 }}
                                className="py-12"
                            >
                                {wedding.logo_initials && (
                                    <MonogramMark
                                        initials={wedding.logo_initials}
                                        brideName={wedding.bride_name}
                                        groomName={wedding.groom_name}
                                        shape={wedding.logo_shape || 'minimal'}
                                        animation={wedding.is_premium ? wedding.logo_animation : 'none'}
                                        color="#201c19"
                                        motifColor={wedding.motif_color}
                                        fontFamily={`var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})`}
                                        size="sm"
                                        className="mb-8"
                                    />
                                )}
                                <h1 className="font-serif text-5xl leading-[0.86] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                                    {wedding.bride_name.split(' ')[0]}
                                    <span className="block font-light italic text-primary">&</span>
                                    {wedding.groom_name.split(' ')[0]}
                                </h1>
                                <p className="mt-8 max-w-md text-base leading-7 text-[#5d554f]">
                                    {wedding.story || 'A visual invitation to a day of vows, gathering, and beautifully kept memories.'}
                                </p>
                            </motion.div>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-primary">Date and place</p>
                                    <p className="mt-2 font-serif text-2xl italic">
                                        {new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-[#5d554f]">{wedding.venue_name}</p>
                                </div>
                                <a href="#rsvp" aria-label="RSVP" className="inline-flex min-h-[48px] items-center justify-center bg-[#201c19] px-7 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary">
                                    RSVP
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
                <BioSection id="bio" wedding={wedding} />
                <DetailsSection id="details" wedding={wedding} />
                {!wedding.is_thank_you_mode && (
                    <CountdownTimer id="countdown"
                        weddingDate={wedding.wedding_date}
                        weddingTime={wedding.wedding_time}
                        brideName={wedding.bride_name}
                        groomName={wedding.groom_name}
                        venueName={wedding.venue_name}
                        venueAddress={wedding.venue_address}
                        template={wedding.template}
                        motifColor={wedding.motif_color}
                    />
                )}
                <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
                <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
                <AttireSection wedding={wedding} />
                <FAQSection wedding={wedding} />
                <GiftSection id="gift" wedding={wedding} />
                <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
            </div>
        );
    }

    return (
        <div className="bg-white pb-24">
            <section className="min-h-screen py-12 lg:py-0 grid grid-cols-1 lg:grid-cols-12 gap-0 relative overflow-hidden">
                <div className="col-span-1 hidden lg:flex border-r border-black/5 flex-col items-center justify-between py-12 h-full uppercase text-[10px] font-black tracking-[1.5em] opacity-30">
                    <p className="rotate-90 whitespace-nowrap">EXT. {new Date(wedding.wedding_date).getFullYear()}</p>
                    <p className="rotate-90 whitespace-nowrap">ISSUE NO. 01</p>
                </div>
                <div className="col-span-1 lg:col-span-11 flex flex-col justify-end px-4 sm:px-6 md:px-12 lg:px-32 py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden group">
                    <motion.div
                        initial={{ scale: 1.1, filter: 'blur(20px)' }}
                        animate={{ scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 -z-10"
                    >
                        <Image
                            src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            priority
                            fill
                            sizes="100vw"
                            className="object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-1000"
                        />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }} className="text-white relative z-10 max-w-6xl">
                        {wedding.logo_initials && (
                            <MonogramMark
                                initials={wedding.logo_initials}
                                brideName={wedding.bride_name}
                                groomName={wedding.groom_name}
                                shape={wedding.logo_shape || 'editorial'}
                                animation={wedding.is_premium ? wedding.logo_animation : 'none'}
                                color="#ffffff"
                                motifColor={wedding.motif_color}
                                fontFamily={`var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})`}
                                size="md"
                                className="mb-8"
                                inverted
                            />
                        )}
                        <span className="inline-block px-4 py-1 bg-primary text-xs font-black uppercase tracking-widest mb-12">Special Invitation</span>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl lg:text-[18vw] font-serif leading-[0.75] tracking-tighter mb-16 mix-blend-screen drop-shadow-2xl">
                            {wedding.bride_name.split(' ')[0]} <br />
                            & <span className="text-primary italic font-light">{wedding.groom_name.split(' ')[0]}</span>
                        </h1>
                        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-12 lg:gap-24 items-start md:items-end w-full">
                            <div className="flex-1 border-l border-white/20 pl-4 sm:pl-6 md:pl-12">
                                <p className="text-2xl font-serif italic leading-tight max-w-lg mb-8 opacity-80">{wedding.story || "A tale of two souls becoming one, captured in a beauty that never fades."}</p>
                                <p className="text-xs uppercase tracking-[0.5em] font-black opacity-40">Photography by QuickWeds Editorial</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end">
                                <p className="text-4xl md:text-6xl font-serif border-b-2 border-primary pb-4 mb-12 italic">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</p>
                                <a href="#rsvp" className="text-2xl font-serif italic flex items-center gap-6 hover:gap-12 transition-all">
                                    THE GUEST LIST <span className="w-12 h-[1px] bg-white" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} />
            {!wedding.is_thank_you_mode && (
                <CountdownTimer id="countdown"
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} galleryLayout={wedding.gallery_layout} />
            <AttireSection wedding={wedding} />
            <FAQSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

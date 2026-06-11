'use client';

import Image from 'next/image';
import { Suspense, useEffect } from 'react';
import { Heart } from 'lucide-react';
import DecorativeLayer from '@/components/DecorativeLayer';
import { MonogramMark } from '@/components/MonogramMark';
import { motion } from 'framer-motion';
import {
    HeroEnhancer,
    PremiumBackgroundLayer,
    EntranceReveal,
    VoiceGreeting,
    TemplateNavigation,
    FAQSection,
} from '@/components/wedding';
import { getWeddingPageStyle, renderWeddingTemplate } from '@/components/templates/TemplateRenderer';
import WeddingFontProvider from '@/components/WeddingFontProvider';
import type { Wedding } from '@/types/wedding';
import { trackWeddingEvent } from '@/lib/wedding-features';

function safeParseArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== 'string') return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
        return [];
    }
}

export default function WeddingPageClient({ publicIdentifier, wedding }: { publicIdentifier: string; wedding: Wedding }) {
    useEffect(() => {
        if (!publicIdentifier || !wedding?.id || typeof window === 'undefined') return;

        const visitKey = `quickweds_visit_${publicIdentifier}`;
        if (window.sessionStorage.getItem(visitKey)) return;

        window.sessionStorage.setItem(visitKey, '1');

        const params = new URLSearchParams(window.location.search);
        const source = params.get('src') || 'direct';
        const eventType = source === 'qr' ? 'qr_scan' : 'visit';

        void trackWeddingEvent(wedding.id, 'visit', { source, publicIdentifier });
        if (eventType === 'qr_scan') {
            void trackWeddingEvent(wedding.id, 'qr_scan', { source, publicIdentifier });
        }
    }, [publicIdentifier, wedding?.id]);

    const isExpired = new Date(wedding.rsvp_deadline) < new Date();
    const gallery = safeParseArray<string>(wedding.gallery_images);
    const template = wedding.template || 'classic';
    const pageStyle = getWeddingPageStyle(wedding, { includeGradient: true });

    return (
        <WeddingFontProvider fontStyle={wedding.font_style} logoFont={wedding.logo_font}>
            <div
                className={`min-h-screen relative selection-dynamic template-${template} overflow-x-hidden`}
                style={pageStyle}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-white/70 to-transparent" />
                <div className="pointer-events-none absolute inset-0 z-0 opacity-80">
                    <div className="absolute left-[8%] top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-32 right-[8%] h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
                </div>
                <div className="pointer-events-none fixed inset-x-6 top-6 bottom-6 z-[1] hidden rounded-[2.5rem] border border-white/35 opacity-50 md:block" />
                <div className="noise-overlay" />
                <div className="paper-texture" />

                <EntranceReveal
                    weddingId={wedding.id}
                    initials={wedding.logo_initials || (`${wedding.bride_name[0]}${wedding.groom_name[0]}`)}
                    motifColor={wedding.motif_color}
                    coupleNames={`${wedding.bride_name} & ${wedding.groom_name}`}
                    weddingDate={wedding.wedding_date}
                    venueName={wedding.venue_name}
                    heroImage={wedding.hero_image || wedding.couple_photo}
                    template={template}
                />

                <PremiumBackgroundLayer wedding={wedding} />

                {wedding.voice_greeting_url && (
                    <VoiceGreeting audioUrl={wedding.voice_greeting_url} motifColor={wedding.motif_color} />
                )}

                {wedding.accent_style && wedding.accent_style !== 'none' && (
                    <>
                        <DecorativeLayer
                            type={wedding.accent_style}
                            color={wedding.motif_color}
                            position="top-right"
                            className="fixed -right-10 top-8 h-32 w-32 opacity-15 sm:right-0 sm:top-12 sm:h-52 sm:w-52 sm:opacity-20 lg:h-64 lg:w-64"
                        />
                        <DecorativeLayer
                            type={wedding.accent_style}
                            color={wedding.motif_color}
                            position="bottom-left"
                            className="fixed -bottom-8 -left-10 h-32 w-32 rotate-180 opacity-[0.12] sm:bottom-0 sm:left-0 sm:h-52 sm:w-52 sm:opacity-20 lg:h-64 lg:w-64"
                        />
                    </>
                )}

                {!wedding.is_thank_you_mode && <HeroEnhancer wedding={wedding} />}

                <Suspense fallback={<div className="h-screen flex items-center justify-center font-serif italic text-primary">Refining layout...</div>}>
                    {renderWeddingTemplate({ wedding, gallery, isExpired })}
                </Suspense>

                <FAQSection id="faq" faqItems={wedding.faq_items} wedding={wedding} />

                <TemplateNavigation wedding={wedding} />

                <footer className="relative z-10 px-6 py-14 md:py-24">
                    <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/45 bg-white/45 px-8 py-12 text-center shadow-[0_24px_80px_rgba(58,42,45,0.10)] backdrop-blur-xl">
                        {wedding.logo_initials ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="mb-10"
                            >
                                <MonogramMark
                                    initials={wedding.logo_initials}
                                    brideName={wedding.bride_name}
                                    groomName={wedding.groom_name}
                                    shape={wedding.logo_shape}
                                    color={wedding.logo_color}
                                    motifColor={wedding.motif_color}
                                    fontFamily={`var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})`}
                                    size="md"
                                    className="mx-auto"
                                />
                            </motion.div>
                        ) : (
                            <div className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Heart className="h-5 w-5 fill-primary text-primary" />
                            </div>
                        )}

                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/55">With love</p>
                        <p className="mt-3 font-serif text-2xl text-[#4A4444] md:text-3xl">
                            {wedding.bride_name} &amp; {wedding.groom_name}
                        </p>
                        {wedding.hashtag && (
                            <p className="mb-5 mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary drop-shadow-sm">
                                #{wedding.hashtag}
                            </p>
                        )}
                        <div className="mx-auto mb-6 mt-6 h-px w-24 bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/80">
                            {new Date(wedding.wedding_date).getFullYear()}
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-2 opacity-30 group hover:opacity-60 transition-opacity">
                            <Image src="/logo.png" alt="QuickWeds" width={120} height={43} className="h-6 w-auto grayscale contrast-125" />
                            <p className="text-[8px] uppercase tracking-[0.24em] font-black">
                                Crafting digital forever
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </WeddingFontProvider>
    );
}

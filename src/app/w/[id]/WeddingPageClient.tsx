'use client';

import { Suspense, useEffect } from 'react';
import DecorativeLayer from '@/components/DecorativeLayer';
import WeddingFooter from '@/components/wedding/WeddingFooter';
import {
    BackgroundMusicPlayer,
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

export default function WeddingPageClient({
    publicIdentifier,
    wedding,
    initialIsExpired,
}: {
    publicIdentifier: string;
    wedding: Wedding;
    initialIsExpired: boolean;
}) {
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

    const isExpired = initialIsExpired;
    const gallery = safeParseArray<string>(wedding.gallery_images);
    const template = wedding.template || 'classic';
    const pageStyle = getWeddingPageStyle(wedding, { includeGradient: true });

    return (
        <WeddingFontProvider fontStyle={wedding.font_style} logoFont={wedding.logo_font}>
            <div
                className={`wedding-page min-h-screen relative selection-dynamic template-${template} overflow-x-hidden`}
                style={pageStyle}
            >

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

                {wedding.voice_greeting_url && (
                    <VoiceGreeting audioUrl={wedding.voice_greeting_url} motifColor={wedding.motif_color} />
                )}

                {wedding.background_music_enabled && wedding.background_music_url && (
                    <BackgroundMusicPlayer
                        template={template}
                        audioUrl={wedding.background_music_url}
                        title={wedding.background_music_title}
                        motifColor={wedding.motif_color}
                    />
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

                <Suspense fallback={<div className="h-screen flex items-center justify-center font-serif italic text-primary">Refining layout...</div>}>
                    {renderWeddingTemplate({ wedding, gallery, isExpired })}
                </Suspense>

                <FAQSection id="faq" faqItems={wedding.faq_items} wedding={wedding} />

                <TemplateNavigation wedding={wedding} />

                <WeddingFooter wedding={wedding} />
            </div>
        </WeddingFontProvider>
    );
}

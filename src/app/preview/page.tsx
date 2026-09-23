'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import DecorativeLayer from '@/components/DecorativeLayer';
import WeddingFooter from '@/components/wedding/WeddingFooter';
import {
    EntranceReveal,
    BackgroundMusicPlayer,
    VoiceGreeting,
    TemplateNavigation,
    FAQSection,
} from '@/components/wedding';
import { getWeddingPageStyle, renderWeddingTemplate } from '@/components/templates/TemplateRenderer';
import type { Wedding } from '@/types/wedding';

const PREVIEW_STORAGE_KEY = 'quickweds-builder-preview';

export default function PreviewPage() {
    const [wedding, setWedding] = useState<Wedding | null>(null);
    const [gallery, setGallery] = useState<string[]>([]);
    const latestPreviewRevisionRef = useRef(-1);

    useEffect(() => {
        const previewInstanceId = new URLSearchParams(window.location.search).get('preview') || 'default';
        const previewStorageKey = `${PREVIEW_STORAGE_KEY}:${previewInstanceId}`;

        const applyPreview = (payload: unknown) => {
            const data = payload as { type?: string; wedding?: Wedding; gallery?: string[]; previewRevision?: number } | null;
            if (data?.type !== 'UPDATE_PREVIEW' || !data.wedding) return;

            const revision = typeof data.previewRevision === 'number' ? data.previewRevision : 0;
            if (revision < latestPreviewRevisionRef.current) return;
            latestPreviewRevisionRef.current = revision;
            setWedding(data.wedding);
            setGallery(Array.isArray(data.gallery) ? data.gallery : []);
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin || event.source !== window.parent) return;
            applyPreview(event.data);
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key !== previewStorageKey || !event.newValue) return;
            try {
                applyPreview(JSON.parse(event.newValue));
            } catch {
                // Ignore malformed preview cache values.
            }
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        const storedPreview = window.sessionStorage.getItem(previewStorageKey);
        if (storedPreview) {
            try {
                applyPreview(JSON.parse(storedPreview));
            } catch {
                window.sessionStorage.removeItem(previewStorageKey);
            }
        }

        window.parent.postMessage({ type: 'PREVIEW_READY' }, window.location.origin);

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    if (!wedding) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FFF8F4]">
                <Heart className="h-8 w-8 animate-pulse text-[#D16C78]" />
            </div>
        );
    }

    const isExpired = false;
    const template = wedding.template || 'classic';
    const pageStyle = getWeddingPageStyle(wedding);

    return (
        <div className={`wedding-page min-h-screen relative selection-dynamic template-${template} overflow-x-hidden`} style={pageStyle}>

            <EntranceReveal
                weddingId={wedding.id}
                initials={wedding.logo_initials || `${wedding.bride_name[0]}${wedding.groom_name[0]}`}
                motifColor={wedding.motif_color}
                coupleNames={`${wedding.bride_name} & ${wedding.groom_name}`}
                weddingDate={wedding.wedding_date}
                venueName={wedding.venue_name}
                heroImage={wedding.hero_image || wedding.couple_photo}
                template={template}
            />

            {wedding.voice_greeting_url && <VoiceGreeting audioUrl={wedding.voice_greeting_url} motifColor={wedding.motif_color} />}
            {wedding.background_music_enabled && wedding.background_music_url && <BackgroundMusicPlayer template={template} audioUrl={wedding.background_music_url} title={wedding.background_music_title} motifColor={wedding.motif_color} />}

            {wedding.accent_style && wedding.accent_style !== 'none' && (
                <>
                    <DecorativeLayer type={wedding.accent_style} color={wedding.motif_color} position="top-right" className="fixed -right-10 top-8 h-32 w-32 opacity-15 sm:right-0 sm:top-12 sm:h-52 sm:w-52 sm:opacity-20 lg:h-64 lg:w-64" />
                    <DecorativeLayer type={wedding.accent_style} color={wedding.motif_color} position="bottom-left" className="fixed -bottom-8 -left-10 h-32 w-32 rotate-180 opacity-[0.12] sm:bottom-0 sm:left-0 sm:h-52 sm:w-52 sm:opacity-20 lg:h-64 lg:w-64" />
                </>
            )}

            <Suspense fallback={<div className="h-screen flex items-center justify-center font-serif italic text-primary">Refining layout...</div>}>
                {renderWeddingTemplate({ wedding, gallery, isExpired })}
            </Suspense>

            <FAQSection id="faq" faqItems={wedding.faq_items} wedding={wedding} />
            <TemplateNavigation wedding={wedding} />

            <WeddingFooter wedding={wedding} />
        </div>
    );
}

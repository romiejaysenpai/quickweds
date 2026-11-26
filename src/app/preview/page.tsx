'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import DecorativeLayer from '@/components/DecorativeLayer';
import WeddingFontProvider from '@/components/WeddingFontProvider';
import WeddingFooter from '@/components/wedding/WeddingFooter';
import {
    EntranceReveal,
    BackgroundMusicPlayer,
    VoiceGreeting,
    TemplateNavigation,
    FAQSection,
} from '@/components/wedding';
import { getWeddingPageStyle, getWeddingThemeAttributes, hasInlineMusicPlayer, renderWeddingTemplate } from '@/components/templates/TemplateRenderer';
import type { Wedding } from '@/types/wedding';

const PREVIEW_STORAGE_KEY = 'quickweds-builder-preview';

export default function PreviewPage() {
    const [wedding, setWedding] = useState<Wedding | null>(null);
    const [gallery, setGallery] = useState<string[]>([]);
    const [waitingTimedOut, setWaitingTimedOut] = useState(false);
    const latestPreviewRevisionRef = useRef(-1);

    useEffect(() => {
        if (wedding) return;
        const timer = window.setTimeout(() => setWaitingTimedOut(true), 4000);
        return () => window.clearTimeout(timer);
    }, [wedding]);

    useEffect(() => {
        if (!wedding) return;
        const bride = wedding.bride_name || 'Wedding';
        const groom = wedding.groom_name || 'Preview';
        document.title = `${bride} & ${groom} · Wedding Preview`;
    }, [wedding]);

    useEffect(() => {
        const previewInstanceId = new URLSearchParams(window.location.search).get('preview') || 'default';
        const previewStorageKey = `${PREVIEW_STORAGE_KEY}:${previewInstanceId}`;

        const applyPreview = (payload: unknown) => {
            const data = payload as { type?: string; wedding?: Wedding; gallery?: string[]; previewRevision?: number } | null;
            if (data?.type !== 'UPDATE_PREVIEW' || !data.wedding) return;

            const revision = typeof data.previewRevision === 'number' ? data.previewRevision : 0;
            // Storage, BroadcastChannel and postMessage can deliver the same update.
            // Keep legacy senders without revisions working, but render numbered updates once.
            if (typeof data.previewRevision === 'number' && revision <= latestPreviewRevisionRef.current) return;
            latestPreviewRevisionRef.current = revision;
            setWedding(data.wedding);
            setGallery(Array.isArray(data.gallery) ? data.gallery : []);
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.source !== window.parent && event.source !== window.opener) return;
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

        let channel: BroadcastChannel | null = null;
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            channel = new BroadcastChannel('quickweds-preview-sync');
            channel.onmessage = (event: MessageEvent) => {
                if (event.data?.type === 'UPDATE_PREVIEW' && event.data?.previewInstanceId === previewInstanceId) {
                    applyPreview(event.data.payload);
                }
            };
        }

        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        const storedPreview =
            window.sessionStorage.getItem(previewStorageKey) ||
            window.localStorage.getItem(previewStorageKey);

        if (storedPreview) {
            try {
                applyPreview(JSON.parse(storedPreview));
            } catch {
                try {
                    window.sessionStorage.removeItem(previewStorageKey);
                    window.localStorage.removeItem(previewStorageKey);
                } catch {
                    // Ignore storage clean up errors
                }
            }
        }

        const readyMsg = { type: 'PREVIEW_READY', previewInstanceId };
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(readyMsg, window.location.origin);
        }
        if (window.opener && window.opener !== window) {
            window.opener.postMessage(readyMsg, window.location.origin);
        }
        try {
            channel?.postMessage(readyMsg);
        } catch {
            // Ignore channel post message errors
        }

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
            channel?.close();
        };
    }, []);

    if (!wedding) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFF8F4] px-6 text-center text-[#3A2A2D]">
                <Heart className="h-8 w-8 animate-pulse text-[#D16C78]" />
                {waitingTimedOut ? (
                    <div className="max-w-sm space-y-3">
                        <p className="font-serif text-lg">No active builder preview found</p>
                        <p className="text-sm text-[#6B5E58]">
                            Open this preview from the Wedding Builder to inspect your live template changes.
                        </p>
                        <Link
                            href="/builder"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#D16C78] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Open Wedding Builder
                        </Link>
                    </div>
                ) : (
                    <p className="font-serif text-sm italic text-[#6B5E58]">Loading live preview...</p>
                )}
            </div>
        );
    }

    const isExpired = false;
    const template = wedding.template || 'classic';
    const { className: invitationThemeClass, ...invitationThemeAttributes } = getWeddingThemeAttributes(wedding);
    const pageStyle = getWeddingPageStyle(wedding, { includeGradient: true });

    return (
        <WeddingFontProvider fontStyle={wedding.font_style} logoFont={wedding.logo_font}>
            <div className={`wedding-page min-h-screen relative selection-dynamic ${invitationThemeClass} template-${template} overflow-x-clip`} style={pageStyle} {...invitationThemeAttributes}>

                <EntranceReveal
                    weddingId={wedding.id}
                    initials={wedding.logo_initials || (`${wedding.bride_name?.trim()?.[0] || ''}${wedding.groom_name?.trim()?.[0] || ''}` || 'QW')}
                    motifColor={wedding.motif_color}
                    coupleNames={`${wedding.bride_name} & ${wedding.groom_name}`}
                    weddingDate={wedding.wedding_date}
                    venueName={wedding.venue_name}
                    heroImage={wedding.hero_image || wedding.couple_photo}
                    template={template}
                    wedding={wedding}
                />

                {wedding.voice_greeting_url && (
                    <VoiceGreeting
                        audioUrl={wedding.voice_greeting_url}
                        motifColor={wedding.motif_color}
                        coupleNames={`${wedding.bride_name} & ${wedding.groom_name}`}
                        template={template}
                    />
                )}
                {wedding.background_music_enabled && wedding.background_music_url && !hasInlineMusicPlayer(wedding) && <BackgroundMusicPlayer template={template} audioUrl={wedding.background_music_url} title={wedding.background_music_title} motifColor={wedding.motif_color} />}

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
        </WeddingFontProvider>
    );
}

'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react';
import { getTemplateMeta, getTemplateStyleLabel } from '@/lib/template-catalog';
import { serializeDressCodeValue } from '@/lib/dress-code';
import { getSafeMonogramConfig } from '@/lib/monogram';

const PREVIEW_STORAGE_KEY = 'quickweds-builder-preview';

export default function LivePreview({
    formData,
    previews,
    isMobileView = false,
    hasMonogramPro = false,
}: {
    formData: any;
    previews: any;
    isMobileView?: boolean;
    hasMonogramPro?: boolean;
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const retryTimersRef = useRef<number[]>([]);
    const payloadRevisionRef = useRef(0);
    const previewChannel = isMobileView ? 'mobile' : 'desktop';
    const previewInstanceId = `${previewChannel}-${useId().replaceAll(':', '')}`;
    const previewStorageKey = `${PREVIEW_STORAGE_KEY}:${previewInstanceId}`;
    const templateMeta = getTemplateMeta(formData.template);

    const previewPayload = useMemo(() => {
        const monogram = getSafeMonogramConfig(
            { shape: formData.logoShape, animation: formData.logoAnimation },
            hasMonogramPro
        );

        return {
            type: 'UPDATE_PREVIEW',
            wedding: {
                id: 'preview',
                bride_name: formData.brideName || 'Isabella',
                groom_name: formData.groomName || 'Julian',
                wedding_date: formData.weddingDate || '2026-10-24',
                wedding_time: formData.weddingTime,
                venue_name: formData.venueName || 'The Grand Conservatory',
                venue_address: formData.venueAddress,
                maps_link: formData.mapsLink,
                reception_venue_name: formData.receptionVenueName,
                reception_venue_address: formData.receptionVenueAddress,
                reception_maps_link: formData.receptionMapsLink,
                reception_venue_photos: previews.receptionVenuePhotos,
                motif_color: formData.motifColor || '#C08081',
                font_style: formData.fontStyle || 'Elegant',
                section_title_font_style: formData.sectionTitleFontStyle || 'default',
                section_title_color_style: formData.sectionTitleColorStyle || 'motif',
                background_style: formData.backgroundStyle || 'cream',
                template: formData.template || 'classic',
                template_style: formData.templateStyle || 'default',
                card_style: formData.cardStyle || 'default',
                dress_code: serializeDressCodeValue({
                    sponsors: { attire: formData.sponsorDressCode, color: formData.sponsorDressCodeColor },
                    guests: { attire: formData.dressCode, color: formData.dressCodeColor },
                }),
                program_timeline: formData.programTimeline,
                faq_items: formData.faqItems,
                story: formData.story,
                quote: formData.quote,
                hashtag: formData.hashtag,
                contact_person: formData.contactPerson,
                rsvp_deadline: formData.rsvpDeadline || '2026-09-24',
                rsvp_events: formData.rsvpEvents || [],
                gift_bank: formData.giftBank,
                gift_account_name: formData.giftAccountName,
                gift_account_number: formData.giftAccountNumber,
                logo_initials: formData.logoInitials,
                logo_font: formData.logoFont || 'Elegant',
                logo_shape: monogram.shape,
                logo_color: formData.logoColor || formData.motifColor,
                logo_animation: monogram.animation,
                spotify_playlist_url: formData.spotifyUrl,
                background_music_url: previews.backgroundMusic,
                background_music_title: formData.backgroundMusicTitle,
                background_music_enabled: Boolean(formData.backgroundMusicEnabled && previews.backgroundMusic),
                wedding_party: formData.weddingParty,
                gift_registry_links: formData.registryLinks,
                cash_funds: formData.cashFunds,
                payment_links: formData.paymentLinks,
                is_thank_you_mode: formData.isThankYouMode,
                thank_you_message: formData.thankYouMessage,
                photo_album_link: formData.photoAlbumLink,
                accent_style: formData.accentStyle || 'none',
                hero_image: previews.heroImage,
                couple_photo: previews.couplePhoto,
                gift_qr_image: previews.giftQr,
                invitation_image: JSON.stringify(previews.invitationImages),
                gallery_layout: formData.galleryLayout || 'auto',
                gallery_images: '[]',
            },
            gallery: previews.galleryImages || [],
        };
    }, [formData, previews, hasMonogramPro]);

    const latestPayloadRef = useRef<typeof previewPayload & { previewRevision?: number }>(previewPayload);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sendUpdate = useCallback(() => {
        const payload = latestPayloadRef.current;
        try {
            window.sessionStorage.setItem(previewStorageKey, JSON.stringify(payload));
        } catch {
            // postMessage remains available if storage is unavailable.
        }
        iframeRef.current?.contentWindow?.postMessage(payload, window.location.origin);
    }, [previewStorageKey]);

    useEffect(() => {
        payloadRevisionRef.current += 1;
        latestPayloadRef.current = { ...previewPayload, previewRevision: payloadRevisionRef.current };

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Debounce by 180ms to keep typing responsive and silky smooth
        debounceTimerRef.current = setTimeout(() => {
            sendUpdate();
            debounceTimerRef.current = null;
        }, 180);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [previewPayload, sendUpdate]);

    const syncAfterFrameLoad = useCallback(() => {
        retryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        sendUpdate();
        retryTimersRef.current = [
            window.setTimeout(sendUpdate, 100),
            window.setTimeout(sendUpdate, 350),
        ];
    }, [sendUpdate]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
            if (event.data?.type === 'PREVIEW_READY') sendUpdate();
        };

        window.addEventListener('message', handleMessage);
        sendUpdate();
        return () => {
            window.removeEventListener('message', handleMessage);
            retryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [sendUpdate]);

    return (
        <div className={`relative overflow-hidden ${isMobileView ? '' : 'rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,248,244,0.72))] p-4 shadow-[0_30px_90px_rgba(58,42,45,0.12)] backdrop-blur-sm'}`}>
            {!isMobileView && (
                <>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -right-12 bottom-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
                    <div className="mb-4 flex items-center justify-between px-1">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary/60">Live Preview</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{templateMeta.name}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-secondary/50">{getTemplateStyleLabel(formData.templateStyle)}</p>
                        </div>
                        <span className="rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary shadow-sm">{templateMeta.eyebrow}</span>
                    </div>
                </>
            )}

            <div className={`relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[2.6rem] border-[10px] border-[#171717] bg-[#111111] shadow-[0_35px_80px_rgba(0,0,0,0.35)] ${isMobileView ? 'h-[620px]' : 'h-[640px]'}`}>
                <div className="absolute left-1/2 top-0 z-30 h-7 w-36 -translate-x-1/2 rounded-b-[1.4rem] bg-black" />
                <div className="absolute inset-[3px] overflow-hidden rounded-[2.1rem] bg-white">
                    <iframe
                        ref={iframeRef}
                        src={`/preview?preview=${encodeURIComponent(previewInstanceId)}`}
                        allow="clipboard-write; clipboard-read"
                        onLoad={syncAfterFrameLoad}
                        className="h-full w-full rounded-[2.1rem] border-0"
                        title="Live Preview"
                    />
                </div>
            </div>
        </div>
    );
}

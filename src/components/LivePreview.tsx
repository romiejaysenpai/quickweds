'use client';

import { useEffect, useRef } from 'react';
import { getTemplateMeta } from '@/lib/template-catalog';

export default function LivePreview({ formData, previews }: { formData: any; previews: any }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const templateMeta = getTemplateMeta(formData.template);

    useEffect(() => {
        const sendUpdate = () => {
            if (!iframeRef.current || !iframeRef.current.contentWindow) return;
            
            const weddingMock = {
                id: 'preview',
                bride_name: formData.brideName || 'Isabella',
                groom_name: formData.groomName || 'Julian',
                wedding_date: formData.weddingDate || '2026-10-24',
                wedding_time: formData.weddingTime,
                venue_name: formData.venueName || 'The Grand Conservatory',
                venue_address: formData.venueAddress,
                maps_link: formData.mapsLink,
                motif_color: formData.motifColor || '#C08081',
                font_style: formData.fontStyle || 'Elegant',
                background_style: formData.backgroundStyle || 'cream',
                template: formData.template || 'classic',
                dress_code: formData.dressCode ? `${formData.dressCode}||${formData.dressCodeColor}` : '',
                program_timeline: formData.programTimeline,
                story: formData.story,
                quote: formData.quote,
                hashtag: formData.hashtag,
                contact_person: formData.contactPerson,
                rsvp_deadline: formData.rsvpDeadline || '2026-09-24',
                gift_bank: formData.giftBank,
                gift_account_name: formData.giftAccountName,
                gift_account_number: formData.giftAccountNumber,
                logo_initials: formData.logoInitials,
                logo_font: formData.logoFont || 'Elegant',
                logo_shape: formData.logoShape || 'minimal',
                logo_color: formData.logoColor || formData.motifColor,
                spotify_playlist_url: formData.spotifyUrl,
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
                gallery_images: formData.galleryImages ? "[]" : "[]", // actual array is passed in gallery
            };

            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_PREVIEW',
                wedding: weddingMock,
                gallery: previews.galleryImages || [] // We need to handle gallery if previews have it
            }, '*');
        };

        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'PREVIEW_READY') {
                sendUpdate();
            }
        };

        window.addEventListener('message', handleMessage);
        // We also send update on any changes, iframe might already be ready
        sendUpdate();

        return () => window.removeEventListener('message', handleMessage);
    }, [formData, previews]);

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,248,244,0.72))] p-4 shadow-[0_30px_90px_rgba(58,42,45,0.12)] backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-12 bottom-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />

            <div className="mb-4 flex items-center justify-between px-1">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary/60">Live Preview</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{templateMeta.name}</p>
                </div>
                <span className="rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary shadow-sm">
                    {templateMeta.eyebrow}
                </span>
            </div>

            <div className="relative mx-auto h-[640px] w-full max-w-[360px] overflow-hidden rounded-[2.6rem] border-[10px] border-[#171717] bg-[#111111] shadow-[0_35px_80px_rgba(0,0,0,0.35)]">
                <div className="absolute left-1/2 top-0 z-30 h-7 w-36 -translate-x-1/2 rounded-b-[1.4rem] bg-black" />
                <div className="absolute inset-[3px] overflow-hidden rounded-[2.1rem] bg-white">
                    <iframe
                        ref={iframeRef}
                        src="/preview"
                        className="w-full h-full border-0 rounded-[2.1rem]"
                        title="Live Preview"
                    />
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSectionActions } from '@/context/SectionContext';
import { copyToClipboard } from '@/lib/client-clipboard';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { toSafeHttpUrl } from '@/lib/url-safety';
import SafeWeddingImage from './SafeWeddingImage';
import type { Wedding } from '@/types/wedding';

function parseVenuePhotos(value: Wedding['reception_venue_photos']): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter((src): src is string => typeof src === 'string' && src.length > 0);
    if (typeof value !== 'string') return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((src): src is string => typeof src === 'string' && src.length > 0) : [];
    } catch {
        return value ? [value] : [];
    }
}

function getDirectionsUrl(name?: string, address?: string, mapsLink?: string) {
    const safeLink = toSafeHttpUrl(mapsLink);
    if (safeLink) return safeLink;
    const query = [name, address].filter(Boolean).join(', ');
    return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
}

export default function VenueDetailsSection({ wedding, id = 'reception-venue' }: { wedding: Wedding; id?: string }) {
    const { registerSection, unregisterSection } = useSectionActions();
    const [interactive, setInteractive] = useState(false);
    const [copied, setCopied] = useState(false);
    const photos = parseVenuePhotos(wedding.reception_venue_photos);
    const hasVenueDetails = Boolean(
        wedding.reception_venue_name ||
        wedding.reception_venue_address ||
        wedding.reception_maps_link ||
        photos.length > 0
    );

    useEffect(() => {
        if (hasVenueDetails) registerSection(id, 'Reception');
        return () => unregisterSection(id);
    }, [hasVenueDetails, id, registerSection, unregisterSection]);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    if (!hasVenueDetails) return null;

    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || '#D16C78', false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const venueName = wedding.reception_venue_name || 'Reception Venue';
    const queryText = [venueName, wedding.reception_venue_address].filter(Boolean).join(', ');
    const embedUrl = wedding.reception_venue_address
        ? `https://www.google.com/maps?q=${encodeURIComponent(queryText)}&output=embed`
        : '';
    const directionsUrl = getDirectionsUrl(wedding.reception_venue_name, wedding.reception_venue_address, wedding.reception_maps_link);
    const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(queryText)}`;
    const mapFilter = visual.isDark
        ? 'grayscale(0.95) invert(0.92) contrast(0.92)'
        : visual.isSharp
          ? 'grayscale(0.45) contrast(0.96)'
          : 'sepia(0.18) saturate(0.75) contrast(0.96)';

    const handleCopy = async () => {
        const text = wedding.reception_venue_address || venueName;
        if (!text) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                await copyToClipboard(text);
            }
            setCopied(true);
        } catch {
            try {
                await copyToClipboard(text);
                setCopied(true);
            } catch {
                setCopied(false);
            }
        }
    };

    return (
        <section data-wedding-section="reception-venue" id={id} className={`relative z-10 overflow-x-clip py-16 md:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className={visual.containerClass}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto mb-12 max-w-3xl text-center"
                >
                    <div className="mb-4 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual.badgeStyleClass || `text-[11px] font-medium uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}Reception` : 'Reception Venue'}
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-5xl ${titleStyle.className}`} style={titleStyle.style}>
                        The Venue
                    </h2>
                    <div data-wedding-divider="true" className={`mx-auto mt-5 ${visual.dividerClass}`} />
                    <p className={`mx-auto mt-5 max-w-2xl font-serif text-lg italic leading-8 md:text-xl ${visual.bodyClass}`}>
                        {venueName}
                    </p>
                    {wedding.reception_venue_address && (
                        <p className={`mx-auto mt-2 max-w-2xl text-sm leading-6 md:text-base ${visual.bodyClass}`}>
                            {wedding.reception_venue_address}
                        </p>
                    )}
                </motion.div>

                <div className={`grid grid-cols-1 gap-6 ${photos.length > 0 ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'mx-auto max-w-4xl'} lg:gap-8`}>
                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {photos.slice(0, 4).map((src, index) => (
                                <div
                                    key={`${src}-${index}`}
                                    className={`relative overflow-hidden bg-neutral ${index === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'} ${visual.isSharp ? 'rounded-none' : 'rounded-2xl'}`}
                                >
                                    <SafeWeddingImage src={src} alt={`${venueName} photo ${index + 1}`} className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div data-wedding-card="true" className={`overflow-hidden ${visual.cardClass}`}>
                        <div className={`relative overflow-hidden border border-current/10 bg-neutral ${visual.isSharp ? 'rounded-none' : 'rounded-2xl'}`}>
                            {embedUrl ? (
                                <>
                                    <iframe
                                        src={embedUrl}
                                        className={`h-[260px] w-full sm:h-[320px] transition-[filter] duration-500 ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
                                        style={{ border: 0, filter: mapFilter }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`${venueName} map`}
                                    />
                                    {!interactive && (
                                        <button
                                            type="button"
                                            onClick={() => setInteractive(true)}
                                            className="absolute inset-0 flex items-end justify-end bg-transparent p-3 focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
                                            aria-label="Enable interactive map controls"
                                        >
                                            <span className={`border border-black/15 bg-white/90 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-800 shadow-sm backdrop-blur-md ${visual.isSharp ? 'rounded-none' : 'rounded-full'}`}>
                                                Tap to explore map
                                            </span>
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="flex min-h-[280px] items-center justify-center px-6 text-center">
                                    <p className={`font-serif text-lg italic ${visual.bodyClass}`}>
                                        Venue map will appear when an address is added.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 px-4 pb-5 pt-6 text-center">
                            {directionsUrl && (
                                <a
                                    data-wedding-control="primary"
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex min-h-11 items-center gap-2 bg-primary px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm transition-all hover:opacity-90 ${visual.isSharp ? 'rounded-none' : 'rounded-full'}`}
                                >
                                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                    Google Maps
                                </a>
                            )}
                            <a
                                data-wedding-control="secondary"
                                href={appleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex min-h-11 items-center gap-1.5 border border-current/25 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-current/5 ${visual.isSharp ? 'rounded-none' : 'rounded-full'}`}
                            >
                                Apple Maps
                                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                            <button
                                data-wedding-control="quiet"
                                type="button"
                                onClick={() => void handleCopy()}
                                className={`inline-flex min-h-11 items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] opacity-80 transition-opacity hover:opacity-100 ${visual.isSharp ? 'rounded-none' : 'rounded-full'}`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                        Copy Address
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

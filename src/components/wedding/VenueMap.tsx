'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, MapPin } from 'lucide-react';
import { copyToClipboard } from '@/lib/client-clipboard';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { toSafeHttpUrl } from '@/lib/url-safety';
import type { Wedding } from '@/types/wedding';

interface VenueMapProps {
    venueName: string;
    venueAddress?: string;
    mapsLink?: string;
    id?: string;
    wedding?: Wedding;
}

export default function VenueMap({ venueName, venueAddress, mapsLink, id = 'venue', wedding }: VenueMapProps) {
    const [interactive, setInteractive] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    if (!mapsLink && !venueAddress) return null;

    const queryText = [venueName, venueAddress].filter(Boolean).join(', ');
    const embedUrl = venueAddress && queryText
        ? `https://www.google.com/maps?q=${encodeURIComponent(queryText)}&output=embed`
        : null;
    const visual = wedding ? getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || '#D16C78', false, wedding.card_style) : null;
    const isSharp = Boolean(visual?.isSharp);
    const directionsUrl = toSafeHttpUrl(mapsLink) || (queryText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryText)}` : '');
    const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(queryText)}`;
    const titleStyle = wedding
        ? getSectionTitleStyle(wedding, visual?.headingClass || 'font-serif text-[#4A4444]')
        : { className: 'font-serif text-[#4A4444]', style: undefined };

    const mapFilter = visual?.isDark
        ? 'grayscale(0.95) invert(0.92) contrast(0.92)'
        : visual?.isSharp
          ? 'grayscale(0.45) contrast(0.96)'
          : 'sepia(0.18) saturate(0.75) contrast(0.96)';

    const handleCopy = async () => {
        const text = venueAddress || venueName;
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
        <section data-wedding-section="venue" id={id} className={`relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 ${visual?.sectionClass || ''}`} style={visual?.sectionStyle}>
            <div className="relative mx-auto max-w-5xl">
                <div className="mb-10 text-center sm:mb-12">
                    <div className="mb-4 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual?.badgeStyleClass || 'text-[11px] font-medium uppercase tracking-[0.28em] text-primary'}>
                            {visual?.badgePrefix ? `${visual.badgePrefix}Map` : 'Location & Directions'}
                        </span>
                    </div>
                    <h2 className={`mb-4 text-4xl md:text-5xl ${titleStyle.className}`} style={titleStyle.style}>Ceremony Location</h2>
                    <div data-wedding-divider="true" className={`mx-auto mb-5 ${visual?.dividerClass || 'h-px w-20 bg-primary/30'}`} />
                    <p className={`font-serif text-lg italic sm:text-xl ${visual?.bodyClass || 'text-[#4A4444]/80'}`}>{venueName}</p>
                    {venueAddress && <p className={`mx-auto mt-2 max-w-2xl text-sm leading-6 ${visual?.bodyClass || 'text-[#4A4444]/70'}`}>{venueAddress}</p>}
                </div>

                <div data-wedding-card="true" className={`overflow-hidden ${visual?.cardClass || 'rounded-3xl border border-white/65 bg-white/72 shadow-[0_24px_70px_rgba(58,42,45,0.08)]'}`}>
                    <div className={`relative overflow-hidden bg-neutral ${isSharp ? 'rounded-none' : 'rounded-xl'}`}>
                        {embedUrl ? (
                            <>
                                <iframe
                                    src={embedUrl}
                                    className={`h-[260px] w-full sm:h-[340px] transition-[filter] duration-500 ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
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
                                        <span className={`border border-black/15 bg-white/90 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-800 shadow-sm backdrop-blur-md ${isSharp ? 'rounded-none' : 'rounded-full'}`}>
                                            Tap to explore map
                                        </span>
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-6 text-center">
                                <MapPin className="h-6 w-6 text-primary opacity-75" />
                                <p className={`font-serif text-lg italic ${visual?.bodyClass || 'text-[#4A4444]/85'}`}>{venueAddress || venueName}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 px-4 pb-5 pt-6 text-center sm:px-8 sm:pb-7">
                        {directionsUrl && (
                            <a
                                data-wedding-control="primary"
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex min-h-11 items-center gap-2 bg-primary px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm transition-all hover:opacity-90 ${isSharp ? 'rounded-none' : 'rounded-full'}`}
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
                            className={`inline-flex min-h-11 items-center gap-1.5 border border-current/25 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-current/5 ${isSharp ? 'rounded-none' : 'rounded-full'}`}
                        >
                            Apple Maps
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                        <button
                            data-wedding-control="quiet"
                            type="button"
                            onClick={() => void handleCopy()}
                            className={`inline-flex min-h-11 items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] opacity-80 transition-opacity hover:opacity-100 ${isSharp ? 'rounded-none' : 'rounded-full'}`}
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
        </section>
    );
}

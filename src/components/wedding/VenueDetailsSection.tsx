'use client';

import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSectionContext } from '@/context/SectionContext';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
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
    if (mapsLink) return mapsLink;
    const query = [name, address].filter(Boolean).join(', ');
    return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
}

export default function VenueDetailsSection({ wedding, id = 'reception-venue' }: { wedding: Wedding; id?: string }) {
    const { registerSection, unregisterSection } = useSectionContext();
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

    if (!hasVenueDetails) return null;

    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || '#D16C78', false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const venueName = wedding.reception_venue_name || 'Reception Venue';
    const embedUrl = wedding.reception_venue_address
        ? `https://www.google.com/maps?q=${encodeURIComponent([venueName, wedding.reception_venue_address].filter(Boolean).join(', '))}&output=embed`
        : '';
    const directionsUrl = getDirectionsUrl(wedding.reception_venue_name, wedding.reception_venue_address, wedding.reception_maps_link);

    return (
        <section id={id} className={`relative z-10 overflow-hidden py-16 md:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className={visual.containerClass}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto mb-12 max-w-3xl text-center"
                >
                    <div className="mb-4 flex items-center justify-center">
                        <span className={visual.badgeStyleClass || `text-[10px] font-black uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}RECEPTION` : 'Reception Details'}
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>
                        The Venue
                    </h2>
                    <div className={`mx-auto mt-6 ${visual.dividerClass}`} />
                    <p className={`mx-auto mt-6 max-w-2xl font-serif text-lg italic leading-8 md:text-xl ${visual.bodyClass}`}>
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
                                    className={`relative overflow-hidden bg-neutral ${index === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'} ${visual.isSharp ? 'rounded-none' : 'rounded-[1.25rem]'}`}
                                >
                                    <img src={src} alt={`${venueName} photo ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`overflow-hidden ${visual.cardClass}`}>
                        <div className={`overflow-hidden border border-primary/10 bg-neutral ${visual.isSharp ? 'rounded-none' : 'rounded-[1.5rem]'}`}>
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="h-[240px] w-full sm:h-[300px]"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`${venueName} map`}
                                />
                            ) : (
                                <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
                                    <p className={`font-serif text-lg italic ${visual.bodyClass}`}>
                                        Venue map will appear when an address is added.
                                    </p>
                                </div>
                            )}
                        </div>

                        {directionsUrl && (
                            <div className="px-4 pb-4 pt-6 text-center">
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Get Directions
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

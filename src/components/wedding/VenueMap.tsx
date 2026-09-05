'use client';

import { MapPin } from 'lucide-react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding } from '@/types/wedding';

interface VenueMapProps {
    venueName: string;
    venueAddress?: string;
    mapsLink?: string;
    id?: string;
    wedding?: Wedding;
}

export default function VenueMap({ venueName, venueAddress, mapsLink, id = 'venue', wedding }: VenueMapProps) {
    if (!mapsLink && !venueAddress) return null;

    // Extract Google Maps embed URL from a share link, or create one from address
    const getEmbedUrl = () => {
        if (venueAddress) {
            return `https://www.google.com/maps?q=${encodeURIComponent(venueName + ', ' + venueAddress)}&output=embed`;
        }
        return null;
    };

    const embedUrl = getEmbedUrl();
    const visual = wedding ? getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || '#D16C78', false, wedding.card_style) : null;
    const venueNote = 'Celebrate with us in one lovely location, from vows to reception. We kindly ask that you arrive on time to fully enjoy the celebration.';
    const titleStyle = wedding
        ? getSectionTitleStyle(wedding, visual?.headingClass || 'font-serif text-[#4A4444]')
        : { className: 'font-serif text-[#4A4444]', style: undefined };

    return (
        <section id={id} className={`relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 ${visual?.sectionClass || ''}`} style={visual?.sectionStyle}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,var(--primary)_0,transparent_28%),radial-gradient(circle_at_84%_88%,var(--primary)_0,transparent_26%)] opacity-[0.08]" />
            <div className="relative mx-auto max-w-6xl">
                <div className="mb-10 text-center sm:mb-12">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/60 bg-white/75 shadow-[0_16px_40px_rgba(58,42,45,0.10)] backdrop-blur-sm">
                        <MapPin className="h-6 w-6 text-primary opacity-80" />
                    </div>
                    <div className="mb-3 flex items-center justify-center">
                        <span className={visual?.badgeStyleClass || "text-[10px] font-black uppercase tracking-[0.34em] text-primary"}>
                            {visual?.badgePrefix ? `${visual.badgePrefix}MAP` : 'LOCATION'}
                        </span>
                    </div>
                    <h2 className={`mb-4 text-4xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>Ceremony Location</h2>
                    <div className={`mx-auto mb-4 ${visual?.dividerClass || 'h-0.5 w-20 bg-primary/30'}`} />
                    <p className={`font-serif text-lg italic sm:text-xl ${visual?.bodyClass || 'text-[#4A4444]/78'}`}>{venueName}</p>
                    {venueAddress && <p className={`mx-auto mt-2 max-w-2xl text-sm leading-6 ${visual?.bodyClass || 'text-[#4A4444]/68'}`}>{venueAddress}</p>}
                </div>

                <div className={`overflow-hidden p-3 backdrop-blur-xl sm:p-4 ${visual?.cardClass || 'rounded-[2rem] border border-white/65 bg-white/72 shadow-[0_28px_90px_rgba(58,42,45,0.12)]'}`}>
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-primary/10 bg-neutral sm:rounded-[2.25rem]">
                        <div className="absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
                        {embedUrl ? (
                            <iframe
                                src={embedUrl}
                                className="h-[340px] w-full sm:h-[430px]"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`${venueName} map`}
                            />
                        ) : (
                            <div className="flex min-h-[260px] items-center justify-center px-6 text-center">
                                <p className="font-serif text-lg italic text-[#4A4444]/72">{venueAddress}</p>
                            </div>
                        )}
                    </div>

                    <div className="px-4 pb-5 pt-6 text-center sm:px-8 sm:pb-7">
                        {mapsLink && (
                            <a
                                href={mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
                            >
                                <MapPin className="h-4 w-4" />
                                Get Directions
                            </a>
                        )}
                        <p className="mx-auto mt-5 max-w-2xl font-serif text-base italic leading-7 text-[#4A4444]/72 sm:text-lg">
                            {venueNote}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

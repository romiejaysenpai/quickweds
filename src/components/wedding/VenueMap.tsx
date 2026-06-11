'use client';

import { MapPin } from 'lucide-react';

interface VenueMapProps {
    venueName: string;
    venueAddress?: string;
    mapsLink?: string;
    id?: string;
}

export default function VenueMap({ venueName, venueAddress, mapsLink, id = 'venue' }: VenueMapProps) {
    if (!mapsLink && !venueAddress) return null;

    // Extract Google Maps embed URL from a share link, or create one from address
    const getEmbedUrl = () => {
        if (venueAddress) {
            return `https://www.google.com/maps?q=${encodeURIComponent(venueName + ', ' + venueAddress)}&output=embed`;
        }
        return null;
    };

    const embedUrl = getEmbedUrl();
    const venueNote = 'Celebrate with us in one lovely location, from vows to reception. We kindly ask that you arrive on time to fully enjoy the celebration.';

    return (
        <section id={id} className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,var(--primary)_0,transparent_28%),radial-gradient(circle_at_84%_88%,var(--primary)_0,transparent_26%)] opacity-[0.08]" />
            <div className="relative mx-auto max-w-6xl">
                <div className="mb-10 text-center sm:mb-12">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/60 bg-white/75 shadow-[0_16px_40px_rgba(58,42,45,0.10)] backdrop-blur-sm">
                        <MapPin className="h-6 w-6 text-primary opacity-80" />
                    </div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-primary/60">Location</p>
                    <h2 className="mb-4 font-serif text-4xl text-[#4A4444] md:text-6xl">The Venue</h2>
                    <p className="font-serif text-lg italic text-foreground/65 sm:text-xl">{venueName}</p>
                    {venueAddress && <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-foreground/50">{venueAddress}</p>}
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-white/65 bg-white/72 p-3 shadow-[0_28px_90px_rgba(58,42,45,0.12)] backdrop-blur-xl sm:rounded-[2.75rem] sm:p-4">
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
                                <p className="font-serif text-lg italic text-foreground/60">{venueAddress}</p>
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

'use client';

import { MapPin } from 'lucide-react';

interface VenueMapProps {
    venueName: string;
    venueAddress?: string;
    mapsLink?: string;
}

export default function VenueMap({ venueName, venueAddress, mapsLink }: VenueMapProps) {
    if (!mapsLink && !venueAddress) return null;

    // Extract Google Maps embed URL from a share link, or create one from address
    const getEmbedUrl = () => {
        if (venueAddress) {
            return `https://www.google.com/maps?q=${encodeURIComponent(venueName + ', ' + venueAddress)}&output=embed`;
        }
        return null;
    };

    const embedUrl = getEmbedUrl();

    return (
        <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/50 bg-white/65 shadow-[0_16px_40px_rgba(58,42,45,0.08)] backdrop-blur-sm">
                        <MapPin className="h-6 w-6 text-primary opacity-80" />
                    </div>
                    <h2 className="mb-4 text-4xl font-serif text-[#4A4444] md:text-5xl">Find the Venue</h2>
                    <p className="font-serif text-lg italic text-foreground/60">{venueName}</p>
                    {venueAddress && <p className="mt-2 text-sm text-foreground/40">{venueAddress}</p>}
                </div>

                {embedUrl && (
                    <div className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-3 shadow-[0_24px_80px_rgba(58,42,45,0.10)] backdrop-blur-sm md:rounded-[3rem]">
                        <iframe
                            src={embedUrl}
                            className="w-full h-[400px] rounded-[2.5rem]"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                )}

                {mapsLink && (
                    <div className="text-center mt-8">
                        <a
                            href={mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
                        >
                            <MapPin className="w-4 h-4" />
                            Get Directions
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}

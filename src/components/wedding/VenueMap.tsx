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
        <section className="py-24 px-6 bg-white/50">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-6 opacity-30" />
                    <h2 className="text-4xl md:text-5xl font-serif text-[#4A4444] mb-4">Find the Venue</h2>
                    <p className="text-foreground/60 font-serif italic text-lg">{venueName}</p>
                    {venueAddress && <p className="text-foreground/40 text-sm mt-2">{venueAddress}</p>}
                </div>

                {embedUrl && (
                    <div className="rounded-[3rem] overflow-hidden soft-shadow border border-primary/5 bg-white p-3">
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
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
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

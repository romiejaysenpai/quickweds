import { Music } from 'lucide-react';

import {
    GuestBook,
    RSVPSection,
    VenueMap,
    WeddingPartySection,
} from '@/components/wedding';
import type { Wedding, WeddingPartyMember } from '@/types/wedding';

function parseWeddingParty(wedding: Wedding): WeddingPartyMember[] {
    if (Array.isArray(wedding.wedding_party)) {
        return wedding.wedding_party as WeddingPartyMember[];
    }

    if (typeof wedding.wedding_party !== 'string') {
        return [];
    }

    try {
        const parsed = JSON.parse(wedding.wedding_party);
        return Array.isArray(parsed) ? parsed as WeddingPartyMember[] : [];
    } catch {
        return [];
    }
}

interface SharedNewSectionsProps {
    wedding: Wedding;
    isExpired: boolean;
}

export function SharedNewSections({ wedding, isExpired }: SharedNewSectionsProps) {
    const partyMembers = parseWeddingParty(wedding);

    return (
        <>
            {wedding.is_thank_you_mode ? (
                <div className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8 bg-primary/5 rounded-3xl my-12 border border-primary/20 soft-shadow">
                    <h2 className="text-4xl md:text-5xl font-serif text-primary italic">Thank You!</h2>
                    <p className="text-xl font-light leading-relaxed text-text-secondary">
                        {wedding.thank_you_message || 'Thank you so much for celebrating our special day with us.'}
                    </p>
                    {wedding.photo_album_link && (
                        <a
                            href={wedding.photo_album_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-10 py-4 bg-primary text-white font-bold rounded-full mt-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            View Wedding Album
                        </a>
                    )}
                </div>
            ) : null}
            <WeddingPartySection members={partyMembers} />
            <VenueMap
                venueName={wedding.venue_name}
                venueAddress={wedding.venue_address}
                mapsLink={wedding.maps_link}
            />
            <GuestBook weddingId={wedding.id} />
            {wedding.spotify_playlist_url && (
                <div className="fixed bottom-6 left-6 z-50">
                    <a
                        href={wedding.spotify_playlist_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1DB954] text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                    >
                        <Music className="w-4 h-4" /> Our Playlist
                    </a>
                </div>
            )}
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </>
    );
}

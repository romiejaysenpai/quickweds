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
    id: string;
}

export function SharedNewSections({ wedding, isExpired }: SharedNewSectionsProps) {
    const partyMembers = parseWeddingParty(wedding);

    return (
        <>
            {wedding.is_thank_you_mode ? (
                <section className="px-6 py-8 md:py-14">
                    <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,248,244,0.7))] px-8 py-14 text-center shadow-[0_24px_80px_rgba(58,42,45,0.10)] backdrop-blur-xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/55">After the celebration</p>
                        <h2 className="mt-4 text-4xl font-serif italic text-primary md:text-5xl">Thank You!</h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl">
                            {wedding.thank_you_message || 'Thank you so much for celebrating our special day with us.'}
                        </p>
                        {wedding.photo_album_link && (
                            <a
                                href={wedding.photo_album_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                View Wedding Album
                            </a>
                        )}
                    </div>
                </section>
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
                        className="flex items-center gap-2 rounded-full border border-white/20 bg-[#1DB954] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(29,185,84,0.30)] backdrop-blur-sm transition-transform hover:scale-105"
                    >
                        <Music className="w-4 h-4" /> Our Playlist
                    </a>
                </div>
            )}
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </>
    );
}

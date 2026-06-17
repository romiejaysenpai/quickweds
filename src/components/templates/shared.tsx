import { Music } from 'lucide-react';

import {
    GuestBook,
    RSVPSection,
    VenueDetailsSection,
    VenueMap,
    WeddingPartySection,
} from '@/components/wedding';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding, WeddingPartyMember } from '@/types/wedding';

function parseWeddingParty(wedding: Wedding): WeddingPartyMember[] {
    const parsePartyValue = (value: unknown): unknown[] => {
        if (Array.isArray(value)) return value;

        if (value && typeof value === 'object') {
            const record = value as Record<string, unknown>;
            if (Array.isArray(record.members)) return record.members;
            if (Array.isArray(record.wedding_party)) return record.wedding_party;
        }

        if (typeof value !== 'string' || value.trim().length === 0) return [];

        try {
            const parsed = JSON.parse(value);
            return parsePartyValue(parsed);
        } catch {
            return [];
        }
    };

    const normalizeMembers = (members: unknown[]) => members
        .filter((member): member is Record<string, unknown> => Boolean(member) && typeof member === 'object')
        .map((member) => ({
            memberKey: typeof member.memberKey === 'string' ? member.memberKey.trim() : '',
            id: typeof member.id === 'string' ? member.id.trim() : '',
            name: String(member.name || '').trim(),
            role: String(member.role || '').trim(),
            bio: typeof member.bio === 'string' ? member.bio.trim() : '',
            email: typeof member.email === 'string' ? member.email.trim() : '',
            proposalTemplateKey: typeof member.proposalTemplateKey === 'string'
                ? member.proposalTemplateKey as WeddingPartyMember['proposalTemplateKey']
                : undefined,
            proposalMessage: typeof member.proposalMessage === 'string' ? member.proposalMessage.trim() : '',
            photo: typeof member.photo === 'string' ? member.photo.trim() : '',
        }))
        .filter((member) => member.name.length > 0);

    return normalizeMembers(parsePartyValue(wedding.wedding_party));
}

interface SharedNewSectionsProps {
    wedding: Wedding;
    isExpired: boolean;
    id: string;
}

export function SharedNewSections({ wedding, isExpired }: SharedNewSectionsProps) {
    const partyMembers = parseWeddingParty(wedding);
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || '#D16C78');
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);

    return (
        <>
            {wedding.is_thank_you_mode ? (
                <section className={`px-6 py-8 md:py-14 ${visual.sectionClass}`} style={visual.sectionStyle}>
                    <div className={`mx-auto max-w-4xl px-8 py-14 text-center ${visual.cardClass}`}>
                        <p className={`text-[10px] font-bold uppercase ${visual.eyebrowClass}`}>After the celebration</p>
                        <h2 className={`mt-4 text-4xl md:text-5xl ${titleStyle.className}`} style={titleStyle.style}>Thank You!</h2>
                        <div className={`mx-auto mt-5 ${visual.dividerClass}`} />
                        <p className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl ${visual.bodyClass}`}>
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
            <WeddingPartySection members={partyMembers} wedding={wedding} />
            <VenueMap
                venueName={wedding.venue_name}
                venueAddress={wedding.venue_address}
                mapsLink={wedding.maps_link}
                wedding={wedding}
            />
            <VenueDetailsSection wedding={wedding} />
            <GuestBook weddingId={wedding.id} />
            {wedding.spotify_playlist_url && (
                <div className="fixed bottom-[calc(5.75rem+var(--safe-area-inset-bottom))] left-3 z-50 sm:bottom-6 sm:left-6">
                    <a
                        href={wedding.spotify_playlist_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-[#1DB954] px-4 py-3 text-xs font-bold text-white shadow-[0_18px_40px_rgba(29,185,84,0.30)] backdrop-blur-sm transition-transform hover:scale-105 sm:px-5 sm:text-sm"
                    >
                        <Music className="w-4 h-4" /> Our Playlist
                    </a>
                </div>
            )}
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </>
    );
}

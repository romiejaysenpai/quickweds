import { MonogramMark } from '@/components/MonogramMark';
import { Music } from 'lucide-react';
import { type CSSProperties, useEffect, useState } from 'react';

import {
    GuestBook,
    PostWeddingMemories,
    RSVPSection,
    VenueDetailsSection,
    VenueMap,
    WeddingPartySection,
} from '@/components/wedding';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
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

export function SharedNewSections({ wedding, isExpired, id }: SharedNewSectionsProps) {
    const partyMembers = parseWeddingParty(wedding);
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || '#D16C78', false, wedding.card_style);

    return (
        <div
            className="template-lower-sections"
            data-template-id={wedding.template || id}
            data-template-mood={visual.mood}
            data-template-ornament={visual.ornament}
            style={{ '--template-motif': wedding.motif_color || '#D16C78' } as CSSProperties}
        >
            {wedding.is_thank_you_mode ? (
                <PostWeddingMemories wedding={wedding} />
            ) : null}
            <WeddingPartySection members={partyMembers} wedding={wedding} />
            <VenueMap
                venueName={wedding.venue_name}
                venueAddress={wedding.venue_address}
                mapsLink={wedding.maps_link}
                wedding={wedding}
            />
            <VenueDetailsSection wedding={wedding} />
            {/* If thank you mode is on and guestbook is already rendered in PostWeddingMemories, avoid duplicate */}
            {!wedding.is_thank_you_mode && (
                <GuestBook weddingId={wedding.id} wedding={wedding} />
            )}
            {wedding.spotify_playlist_url && (
                <div className="mx-auto flex justify-center px-6 py-6">
                    <a
                        href={wedding.spotify_playlist_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex min-h-[44px] items-center gap-2 border-b border-current/25 px-2 py-3 text-sm ${visual.bodyClass}`}
                    >
                        <Music className="w-4 h-4" /> Our Playlist
                    </a>
                </div>
            )}
            {/* If thank you mode is on, the celebration has ended; omit active RSVP form */}
            {!wedding.is_thank_you_mode && (
                <RSVPSection wedding={wedding} isExpired={isExpired} />
            )}
        </div>
    );
}

/**
 * Live dynamic countdown calculation hook for wedding templates
 */
export function useCountdown(weddingDate?: string, weddingTime?: string) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isPast, setIsPast] = useState(false);

    useEffect(() => {
        if (!weddingDate) return;

        const cleanDateStr = String(weddingDate).trim();
        const dateMatch = cleanDateStr.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
        let target: Date;

        if (dateMatch) {
            const year = parseInt(dateMatch[1], 10);
            const month = parseInt(dateMatch[2], 10) - 1;
            const day = parseInt(dateMatch[3], 10);
            target = new Date(year, month, day);
        } else {
            target = new Date(weddingDate);
        }

        if (weddingTime && typeof weddingTime === 'string' && weddingTime.trim().length > 0) {
            const timeMatch = weddingTime.trim().match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/i);
            if (timeMatch) {
                let hour = Number(timeMatch[1]);
                const minute = Number(timeMatch[2] || 0);
                if (hour <= 23 && minute <= 59 && (!timeMatch[3] || hour <= 12)) {
                    if (timeMatch[3]) hour = (hour % 12) + (timeMatch[3].toLowerCase() === 'pm' ? 12 : 0);
                    target.setHours(hour, minute, 0, 0);
                }
            }
        } else {
            target.setHours(12, 0, 0, 0);
        }

        const update = () => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setIsPast(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setIsPast(false);
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [weddingDate, weddingTime]);

    return { timeLeft, isPast };
}

export interface ParsedTimelineItem {
    time: string;
    event: string;
}

/**
 * Parse raw multi-line timeline string into structured items with fallback
 */
export function parseTimelineItems(raw?: string, fallbackItems: ParsedTimelineItem[] = []): ParsedTimelineItem[] {
    if (!raw || !raw.trim()) return fallbackItems;
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed = lines.map((line) => {
        const match = line.match(/^(\d{1,2}(?::\d{2})?(?:\s?[apAP][mM])?)\s*[-–|:•]\s*(.+)$/);
        if (match) {
            return { time: match[1].trim(), event: match[2].trim() };
        }
        return { time: '', event: line };
    });
    return parsed.length > 0 ? parsed : fallbackItems;
}

/** Keep the selected logo appearance when a template has a native monogram slot. */
export function WeddingMonogram({ wedding, className = '' }: { wedding: Wedding; className?: string }) {
    return <MonogramMark initials={wedding.logo_initials} brideName={wedding.bride_name} groomName={wedding.groom_name}
        shape={wedding.logo_shape} color={wedding.logo_color} motifColor={wedding.motif_color}
        animation={wedding.logo_animation} size="lg" className={className}
        fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : 'var(--font-serif)'} />;
}

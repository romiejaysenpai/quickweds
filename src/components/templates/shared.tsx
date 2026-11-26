'use client';

import { MonogramMark } from '@/components/MonogramMark';
import { CalendarPlus, Check, Copy, MapPin, Music } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import {
    GuestBook,
    PostWeddingMemories,
    RSVPSection,
    VenueDetailsSection,
    VenueMap,
    WeddingPartySection,
} from '@/components/wedding';
import SafeWeddingImage from '@/components/wedding/SafeWeddingImage';
import { buildSmartCalendarLinks } from '@/components/wedding/SmartCalendar';
import { copyToClipboard } from '@/lib/client-clipboard';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import { toSafeHttpUrl } from '@/lib/url-safety';
import type { Wedding, WeddingPartyMember } from '@/types/wedding';

export const TEMPLATE_ELEMENT_ASSETS = {
    waxSeal: '/templates/elements/element-wax-seal.webp',
    coastalShells: '/templates/elements/element-coastal-shells.webp',
    meadowWreath: '/templates/elements/element-meadow-wreath.webp',
    terracottaFlorals: '/templates/elements/element-terracotta-florals.webp',
    ribbonVelvet: '/templates/elements/element-ribbon-velvet.webp',
    sakuraBranch: '/templates/elements/element-sakura-branch.webp',
    tropicalMonstera: '/templates/elements/element-tropical-monstera.webp',
    celestialAstrolabe: '/templates/elements/element-celestial-astrolabe.webp',
    decoCrest: '/templates/elements/element-deco-crest.webp',
    nordicPine: '/templates/elements/element-nordic-pine.webp',
    vintageCameo: '/templates/elements/element-vintage-cameo.webp',
    paperDeckle: '/templates/elements/texture-paper-deckle.webp',
} as const;

export function formatWeddingDate(
    weddingDate: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' },
    locale: string | undefined = 'en-US',
    fallback = ''
): string {
    if (!weddingDate || typeof weddingDate !== 'string') return fallback;
    const raw = weddingDate.trim().slice(0, 10);
    const parsed = raw ? new Date(`${raw}T12:00:00`) : new Date(weddingDate);
    if (Number.isNaN(parsed.getTime())) return fallback || weddingDate;
    return parsed.toLocaleDateString(locale, options);
}

export function getWeddingYear(weddingDate: string | null | undefined, fallback = ''): string | number {
    if (!weddingDate || typeof weddingDate !== 'string') return fallback;
    const raw = weddingDate.trim().slice(0, 10);
    const parsed = raw ? new Date(`${raw}T12:00:00`) : new Date(weddingDate);
    if (Number.isNaN(parsed.getTime())) return fallback;
    return parsed.getFullYear();
}

export function getFirstName(name: string | null | undefined, fallback = ''): string {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    return trimmed ? trimmed.split(/\s+/)[0] : fallback;
}

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
            {toSafeHttpUrl(wedding.spotify_playlist_url) && (
                <div className="mx-auto flex justify-center px-6 py-8">
                    <a
                        href={toSafeHttpUrl(wedding.spotify_playlist_url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-wedding-card="true"
                        className={`group flex min-h-[52px] items-center gap-3.5 rounded-full border border-current/20 px-6 py-3 text-sm transition-transform duration-200 hover:-translate-y-0.5 ${visual.bodyClass}`}
                    >
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
                            style={{ backgroundColor: wedding.motif_color || '#D16C78' }}
                            aria-hidden="true"
                        >
                            <Music className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col text-left leading-tight">
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-65">
                                Reception Soundtrack
                            </span>
                            <span className="font-serif text-sm font-medium">
                                Listen to Our Playlist
                            </span>
                        </span>
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

        if (Number.isNaN(target.getTime())) {
            return;
        }

        if (weddingTime && typeof weddingTime === 'string' && weddingTime.trim().length > 0) {
            const firstTimeToken = weddingTime.trim().split(/\s*(?:-|–|—|\bto\b)\s*/i)[0]?.trim() || '';
            const timeMatch = firstTimeToken.match(/^(\d{1,2})(?::(\d{1,2}))?(?::\d{1,2})?\s*(am|pm)?$/i);
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

/** Resolve primary hero media from couple's uploads/gallery without falling back to /logo.png. */
export function resolveWeddingMedia(wedding: Wedding, gallery?: string[]): string {
    const firstGallery = gallery?.find((item) => typeof item === 'string' && item.trim().length > 0)?.trim() || '';
    return wedding.hero_image?.trim() || wedding.couple_photo?.trim() || firstGallery;
}

/** Resolve secondary couple portrait distinct from hero when available, never falling back to /logo.png. */
export function resolveCouplePhoto(wedding: Wedding, gallery?: string[]): string {
    const hero = wedding.hero_image?.trim() || '';
    const couple = wedding.couple_photo?.trim() || '';
    if (couple && couple !== hero) return couple;
    const altGallery = gallery?.find((item) => {
        const clean = typeof item === 'string' ? item.trim() : '';
        return clean.length > 0 && clean !== hero;
    })?.trim();
    return altGallery || couple || hero;
}

/** Mode-aware editorial copy & primary anchor routing (avoids stale #rsvp links in Thank You mode). */
export function resolveTemplateCopy(wedding: Wedding) {
    const isThankYou = Boolean(wedding.is_thank_you_mode);
    const isSaveTheDate = Boolean(wedding.is_save_the_date);
    return {
        eyebrow: isThankYou
            ? 'With Gratitude & Love'
            : isSaveTheDate
                ? 'Save the Date'
                : 'Together With Their Families',
        subtitle: isThankYou
            ? (wedding.thank_you_message?.trim() || 'Thank you for celebrating our marriage and filling the day with lasting memories.')
            : isSaveTheDate
                ? 'Formal invitation and full weekend schedule to follow.'
                : 'We joyfully invite you to share in the beginning of our forever.',
        ctaLabel: isThankYou ? 'View Memories' : isSaveTheDate ? 'Weekend Preview' : 'Kindly RSVP',
        ctaHref: isThankYou ? '#memories' : isSaveTheDate ? '#details' : '#rsvp',
        detailsLabel: isThankYou ? 'Our Story' : 'The Details',
        detailsHref: '#details',
        venueSummary: [wedding.venue_name, wedding.venue_address].filter((v) => typeof v === 'string' && v.trim().length > 0).join(' · '),
        year: getWeddingYear(wedding.wedding_date),
    };
}

interface WeddingHeroVisualProps {
    wedding: Wedding;
    gallery?: string[];
    src?: string;
    alt?: string;
    className?: string;
    imgClassName?: string;
    ornamentSrc?: string;
    dark?: boolean;
}

/**
 * Renders the couple's portrait photo when provided, or a typographic monogram
 * atmospheric vignette when no photo is uploaded (eliminating /logo.png fallbacks).
 */
export function WeddingHeroVisual({
    wedding,
    gallery,
    src,
    alt,
    className = '',
    imgClassName = 'h-full w-full object-cover',
    ornamentSrc,
    dark = false,
}: WeddingHeroVisualProps) {
    const resolvedSrc = src?.trim() || resolveWeddingMedia(wedding, gallery);
    const label = alt || `${wedding.bride_name} and ${wedding.groom_name}`;

    if (resolvedSrc) {
        const resolvedImgClass = `h-full w-full object-cover ${imgClassName || ''}`.trim();
        return (
            <SafeWeddingImage
                src={resolvedSrc}
                alt={label}
                loading="eager"
                fetchPriority="high"
                className={resolvedImgClass}
                fallbackText={`${getFirstName(wedding.bride_name, 'A')[0]}${getFirstName(wedding.groom_name, 'B')[0]}`}
            />
        );
    }

    const formattedDate = formatWeddingDate(wedding.wedding_date);
    return (
        <div
            className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-10 text-center ${className}`}
            style={{
                background: dark
                    ? 'radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--primary, #C5A059) 20%, rgba(255,255,255,0.06)), rgba(0,0,0,0.28))'
                    : 'radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--primary, #D16C78) 12%, var(--builder-paper, #faf7f2)), color-mix(in srgb, var(--primary, #D16C78) 4%, var(--builder-subtle, #f2ece4)))',
            }}
        >
            {ornamentSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={ornamentSrc}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 m-auto h-4/5 w-4/5 object-contain opacity-25"
                />
            ) : null}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <WeddingMonogram wedding={wedding} className="scale-105" />
                {formattedDate ? (
                    <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] opacity-75">
                        {formattedDate}
                    </span>
                ) : null}
                {wedding.venue_name ? (
                    <span className="max-w-[18rem] font-serif text-sm italic opacity-70">
                        {wedding.venue_name}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

interface TemplateHeroActionsProps {
    wedding: Wedding;
    variant?: 'editorial' | 'pill' | 'minimal' | 'noir' | 'stationery';
    motifColor?: string;
    showVenueCopy?: boolean;
    showSaveDate?: boolean;
    className?: string;
}

/**
 * Lightweight, accessible interactive hero utility bar: Save-the-Date calendar links
 * (Google / Apple ICS / Outlook) + one-tap Copy Venue address with confirmation feedback.
 */
export function TemplateHeroActions({
    wedding,
    variant = 'editorial',
    showVenueCopy = true,
    showSaveDate = true,
    className = '',
}: TemplateHeroActionsProps) {
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const calendarLinks = !wedding.is_thank_you_mode && showSaveDate ? buildSmartCalendarLinks(wedding) : null;
    const venueCopyText = wedding.venue_address?.trim() || wedding.venue_name?.trim() || '';
    const hasCopy = showVenueCopy && Boolean(venueCopyText);

    useEffect(() => {
        if (!calendarOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
                setCalendarOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setCalendarOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [calendarOpen]);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    if (!calendarLinks && !hasCopy) return null;

    const btnShape =
        variant === 'pill' || variant === 'stationery'
            ? 'rounded-full'
            : variant === 'minimal'
                ? 'rounded-none'
                : 'rounded-full';
    const btnTone =
        variant === 'noir'
            ? 'border-white/20 bg-transparent text-white/85 hover:border-white/45 hover:bg-white/10 hover:text-white'
            : 'border-current/15 bg-transparent text-current opacity-80 hover:border-current/35 hover:opacity-100';

    const handleCopyVenue = async () => {
        if (!venueCopyText) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(venueCopyText);
            } else {
                await copyToClipboard(venueCopyText);
            }
            setCopied(true);
        } catch {
            try {
                await copyToClipboard(venueCopyText);
                setCopied(true);
            } catch {
                setCopied(false);
            }
        }
    };

    return (
        <div
            ref={wrapRef}
            className={`relative z-20 flex flex-wrap items-center justify-center gap-2 ${className}`}
        >
            {calendarLinks ? (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setCalendarOpen((prev) => !prev)}
                        aria-expanded={calendarOpen}
                        aria-haspopup="menu"
                        className={`inline-flex min-h-[40px] items-center gap-1.5 border px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-all ${btnShape} ${btnTone}`}
                    >
                        <CalendarPlus className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
                        <span>Save Date</span>
                    </button>
                    {calendarOpen ? (
                        <div
                            role="menu"
                            aria-label="Add wedding to calendar"
                            className="absolute left-1/2 top-full z-40 mt-2 w-52 -translate-x-1/2 overflow-hidden rounded-xl border border-stone-200 bg-white/95 p-1.5 text-left text-stone-800 shadow-xl backdrop-blur-md"
                        >
                            <a
                                role="menuitem"
                                href={calendarLinks.google}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setCalendarOpen(false)}
                                className="flex min-h-[40px] items-center rounded-lg px-3 py-2 text-xs font-medium hover:bg-stone-100"
                            >
                                Google Calendar
                            </a>
                            <a
                                role="menuitem"
                                href={calendarLinks.apple}
                                download={`${getFirstName(wedding.bride_name, 'wedding')}-${getFirstName(wedding.groom_name, 'date')}.ics`}
                                onClick={() => setCalendarOpen(false)}
                                className="flex min-h-[40px] items-center rounded-lg px-3 py-2 text-xs font-medium hover:bg-stone-100"
                            >
                                Apple Calendar (.ics)
                            </a>
                            <a
                                role="menuitem"
                                href={calendarLinks.outlook}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setCalendarOpen(false)}
                                className="flex min-h-[40px] items-center rounded-lg px-3 py-2 text-xs font-medium hover:bg-stone-100"
                            >
                                Outlook Calendar
                            </a>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {hasCopy ? (
                <button
                    type="button"
                    onClick={handleCopyVenue}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 border px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-all ${btnShape} ${btnTone}`}
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>Venue Copied</span>
                        </>
                    ) : (
                        <>
                            {wedding.maps_link ? <MapPin className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />}
                            <span>Copy Venue</span>
                        </>
                    )}
                </button>
            ) : null}
        </div>
    );
}


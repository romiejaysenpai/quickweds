'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Plane, Sparkles, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import DecorativeLayer from '@/components/DecorativeLayer';
import { MonogramMark } from '@/components/MonogramMark';
import { getBuilderTheme, getInvitationTheme } from '@/lib/invitation-theme';
import type { ReferenceInvitation } from '@/lib/reference-invitations';
import { getTemplateMeta } from '@/lib/template-catalog';
import { getSectionTitleStyle, getTemplateVisualProfile, resolveTemplateFamily, type TemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding } from '@/types/wedding';

const OPEN_DURATION_MS = 1100;
const PAPER_EASE = [0.32, 0.12, 0.23, 1] as const;

export type EntranceVariant = 'envelope' | 'arch-doors' | 'editorial-gate';
type PlaqueShape = 'arch' | 'oval' | 'torn' | 'scallop' | 'ticket' | 'editorial' | 'classic';
type OrnamentStyle = 'flowers' | 'leaves' | 'bow' | 'coastal' | 'calla' | 'pearls' | 'lights' | 'winter' | 'pavilion' | 'linework' | 'none';

interface EntranceRevealProps {
    weddingId: string;
    initials: string;
    motifColor: string;
    coupleNames: string;
    weddingDate: string;
    venueName?: string;
    heroImage?: string;
    template?: string;
    wedding?: Wedding;
}

const TORN_CLIP =
    'polygon(0% 1.5%, 4% 0%, 9% 2%, 15% 0.5%, 22% 2%, 29% 0%, 36% 1.5%, 44% 0.5%, 51% 2%, 59% 0%, 67% 1.5%, 75% 0.5%, 83% 2%, 91% 0%, 96% 1.5%, 100% 0.5%, 99% 14%, 100% 28%, 98.5% 43%, 100% 58%, 99% 73%, 100% 87%, 99% 98.5%, 93% 100%, 85% 98%, 77% 100%, 69% 98.5%, 60% 100%, 52% 98%, 43% 100%, 35% 98.5%, 27% 100%, 19% 98%, 11% 100%, 5% 98.5%, 0% 100%, 1% 86%, 0% 71%, 1.5% 56%, 0% 41%, 1% 26%, 0% 12%)';

/** Fine-line botanical, coastal, ribbon, and architectural vector ornaments matching the invitation suite. */
function FineOrnament({ kind, className = '' }: { kind: OrnamentStyle; className?: string }) {
    if (kind === 'none') return null;

    if (kind === 'bow') {
        return (
            <svg viewBox="0 0 240 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M120 44C88 6 24 8 42 39S103 65 120 44C152 6 216 8 198 39S137 65 120 44ZM116 48C104 67 95 80 73 91L79 72L61 73M124 48C136 67 145 80 167 91L161 72L179 73" />
                <ellipse cx="120" cy="45" rx="7" ry="9" fill="currentColor" fillOpacity="0.18" />
            </svg>
        );
    }

    if (kind === 'coastal') {
        return (
            <svg viewBox="0 0 180 150" className={className} fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
                <path
                    d="M56 130C39 112-7 69 19 38C30 20 47 30 48 25C50 5 79 3 90 17C101 3 130 5 132 25C133 30 150 20 161 38C187 69 141 112 124 130L111 143H69Z"
                    fill="currentColor"
                    fillOpacity="0.08"
                />
                {[20, 44, 67, 90, 113, 136, 160].map((x) => (
                    <path key={x} d={`M${x} 36Q${x} 80 90 132`} />
                ))}
            </svg>
        );
    }

    if (kind === 'calla') {
        return (
            <svg viewBox="0 0 130 240" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <path d="M28 230Q94 152 79 63M45 207Q20 165 12 133Q49 143 59 183" />
                <path d="M79 106C79 48 19 50 18 14C66 26 82 2 116 0C97 36 124 74 79 106Z" fill="currentColor" fillOpacity="0.12" />
                <path d="M78 71L68 32" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
            </svg>
        );
    }

    if (kind === 'pearls') {
        return (
            <svg viewBox="0 0 360 90" className={className} fill="none" stroke="currentColor" aria-hidden="true">
                {Array.from({ length: 19 }, (_, i) => (
                    <circle
                        key={i}
                        cx={18 + i * 18}
                        cy={14 + Math.sin((i / 18) * Math.PI) * 52}
                        r="4"
                        fill="currentColor"
                        fillOpacity="0.18"
                        strokeOpacity="0.45"
                    />
                ))}
            </svg>
        );
    }

    if (kind === 'pavilion') {
        return (
            <svg viewBox="0 0 320 150" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <path d="M48 84L160 22L272 84ZM66 84V142H254V84M92 84V142M120 84V142M200 84V142M228 84V142M108 142V104Q160 66 212 104V142" />
            </svg>
        );
    }

    // Botanical branch + optional blossoms
    const withFlowers = kind === 'flowers';
    return (
        <svg viewBox="0 0 280 200" className={className} fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
            <path d="M12 185Q121 152 250 18M60 166Q81 117 93 70M131 120Q178 127 230 104" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <g key={i} transform={`translate(${48 + i * 34} ${172 - i * 25}) rotate(${i % 2 ? 32 : -36})`}>
                    <path d="M0 0Q-49-44-48-11Q-35 8 0 0Z" fill="currentColor" fillOpacity={kind === 'linework' ? '0' : '0.2'} />
                    <path d="M0 0Q3-50 29-45Q39-24 0 0Z" fill="currentColor" fillOpacity={kind === 'linework' ? '0' : '0.13'} />
                </g>
            ))}
            {withFlowers &&
                [0, 1, 2].map((i) => (
                    <g key={i} transform={`translate(${85 + i * 52} ${132 - i * 33})`} strokeWidth="0.7">
                        {[0, 72, 144, 216, 288].map((angle) => (
                            <ellipse
                                key={angle}
                                cy="-15"
                                rx="11"
                                ry="19"
                                transform={`rotate(${angle})`}
                                fill="currentColor"
                                fillOpacity="0.12"
                            />
                        ))}
                        <circle r="5" fill="currentColor" fillOpacity="0.5" />
                    </g>
                ))}
        </svg>
    );
}

interface EntranceRecipe {
    variant: EntranceVariant;
    plaqueShape: PlaqueShape;
    ornamentKind: OrnamentStyle;
    ruleStyle: 'solid' | 'double' | 'dashed' | 'dotted';
    ruleWidth: number;
    artworkUrl?: string;
    isSplitMonogram: boolean;
    isPhotoFirst: boolean;
    accentType: string;
}

function deriveEntranceRecipe(
    wedding: Wedding | undefined,
    template: string,
    visual: TemplateVisualProfile,
    variantOverride: string | null,
    reference?: ReferenceInvitation
): EntranceRecipe {
    const family = resolveTemplateFamily(template);
    const layout = reference?.layout || '';
    const cardStyle = wedding?.card_style || 'default';

    // 1. Resolve Opening Mechanic (Envelope 4-Flap vs Grand Double Doors vs Editorial Split)
    let variant: EntranceVariant = 'envelope';
    if (variantOverride === 'envelope' || variantOverride === 'arch-doors' || variantOverride === 'editorial-gate') {
        variant = variantOverride;
    } else if (
        ['envelope', 'calla-envelope', 'magnolia', 'torn', 'doodle', 'classic', 'blue-scallop', 'rose-monogram'].includes(layout) ||
        ['envelope-wax-seal', 'love-letter', 'butter-blue', 'ribbon-romance', 'torn-paper-terracotta'].includes(template)
    ) {
        variant = 'envelope';
    } else if (
        ['ticket', 'editorial', 'monochrome-collage', 'split-monogram'].includes(layout) ||
        ['editorial', 'editorial-luxe', 'velure-editorial', 'vogue', 'minimal', 'monochrome', 'cinematic', 'cinematic-vow', 'film', 'urban', 'glitch', 'timeline', 'rsvpfocus'].includes(family)
    ) {
        variant = 'editorial-gate';
    } else if (
        [
            'winter-castle',
            'olive-lights',
            'hydrangea-coast',
            'blush-botanical',
            'sage-wreath',
            'cocoa-capsule',
            'winter-blue',
            'pearl-ballroom',
            'sea-glass',
            'ocean-coral',
            'coastal-silver',
            'gold-leaf-frame',
            'navy-celebration',
            'blue-chinoiserie',
            'olive-wave',
            'baroque',
            'botanical',
            'estate',
            'forest',
            'gold',
            'toile',
            'meadow',
            'coastal',
            'blue-floral',
            'western',
            'silk',
        ].includes(layout) ||
        ['garden', 'boho', 'royal', 'luxury', 'elegance', 'botanical-arch', 'watercolor-meadow', 'riviera', 'celestial', 'midnight', 'nordic', 'traditional', 'sakura', 'tropical', 'artdeco'].includes(family)
    ) {
        variant = 'arch-doors';
    }

    // 2. Resolve Plaque / Card Silhouette from couple's card_style + reference layout
    let plaqueShape: PlaqueShape = 'classic';
    if (layout === 'ticket') {
        plaqueShape = 'ticket';
    } else if (cardStyle === 'editorial_rules' || cardStyle === 'full_bleed_strip') {
        plaqueShape = 'editorial';
    } else if (cardStyle === 'arch_panel' || ['cocoa-capsule', 'olive-wave', 'silk', 'western', 'botanical', 'sage-wreath'].includes(layout) || ['garden', 'botanical-arch', 'elegance'].includes(template)) {
        plaqueShape = 'arch';
    } else if (['torn', 'olive-lights'].includes(layout) || template === 'torn-paper-terracotta' || family === 'rustic') {
        plaqueShape = 'torn';
    } else if (['magnolia', 'pearl-ballroom', 'coastal-silver', 'ocean-coral', 'sea-glass', 'coastal'].includes(layout) || template === 'pearl-coastal') {
        plaqueShape = 'oval';
    } else if (['blue-scallop', 'doodle', 'baroque', 'blue-chinoiserie', 'gold-leaf-frame'].includes(layout) || ['love-letter', 'ribbon-romance'].includes(template)) {
        plaqueShape = 'scallop';
    } else if (['editorial', 'monochrome-collage', 'split-monogram'].includes(layout) || visual.isSharp) {
        plaqueShape = 'editorial';
    } else if (variant === 'arch-doors' || (visual.isOrganic && variant !== 'envelope')) {
        plaqueShape = 'arch';
    }

    // 3. Resolve Border Rule Style
    let ruleStyle: 'solid' | 'double' | 'dashed' | 'dotted' = 'solid';
    let ruleWidth = 1;
    if (['envelope', 'calla-envelope', 'magnolia', 'sage-wreath', 'baroque', 'blue-floral', 'blue-chinoiserie', 'toile', 'gold-leaf-frame', 'western', 'estate', 'winter-castle', 'pearl-ballroom', 'gold'].includes(layout) || ['royal', 'luxury', 'envelope-wax-seal'].includes(template)) {
        ruleStyle = 'double';
        ruleWidth = 3;
    } else if (['ticket', 'doodle', 'torn', 'winter-blue', 'olive-lights', 'blue-scallop'].includes(layout) || ['rustic', 'torn-paper-terracotta'].includes(template)) {
        ruleStyle = 'dashed';
        ruleWidth = 1;
    } else if (['coastal', 'hydrangea-coast', 'ocean-coral', 'sea-glass', 'coastal-silver'].includes(layout) || template === 'pearl-coastal') {
        ruleStyle = 'dotted';
        ruleWidth = 2;
    }

    // 4. Resolve Ornament & Illustration Layer
    let ornamentKind: OrnamentStyle = 'leaves';
    if (reference?.decoration === 'none' || layout === 'monochrome-collage' || family === 'minimal') {
        ornamentKind = 'none';
    } else if (reference?.decoration === 'bow' || template === 'ribbon-romance' || wedding?.logo_shape === 'ribbon') {
        ornamentKind = 'bow';
    } else if (layout === 'calla-envelope') {
        ornamentKind = 'calla';
    } else if (['hydrangea-coast', 'sea-glass', 'ocean-coral', 'coastal-silver', 'coastal'].includes(layout) || template === 'pearl-coastal' || family === 'riviera') {
        ornamentKind = 'coastal';
    } else if (['pearl-ballroom'].includes(layout)) {
        ornamentKind = 'pearls';
    } else if (layout === 'toile') {
        ornamentKind = 'pavilion';
    } else if (reference?.decoration === 'flowers' || ['floral', 'sakura'].includes(visual.ornament)) {
        ornamentKind = 'flowers';
    } else if (reference?.decoration === 'linework' || visual.isSharp) {
        ornamentKind = 'linework';
    }

    let accentType = wedding?.accent_style;
    if (!accentType) {
        if (ornamentKind === 'none') accentType = 'none';
        else if (ornamentKind === 'flowers') accentType = 'sakura';
        else if (ornamentKind === 'bow') accentType = 'ribbon';
        else if (ornamentKind === 'coastal') accentType = 'petals';
        else if (visual.ornament === 'celestial') accentType = 'sparkles';
        else if (['royal', 'artdeco'].includes(visual.ornament)) accentType = 'gold-arch';
        else accentType = 'eucalyptus';
    }

    const isSplitMonogram = ['split-monogram', 'rose-monogram'].includes(layout);
    const isPhotoFirst = ['hydrangea-coast', 'monochrome-collage', 'sea-glass', 'navy-celebration', 'pearl-ballroom', 'coastal-silver', 'torn', 'coastal', 'western', 'gold', 'forest'].includes(layout);

    return {
        variant,
        plaqueShape,
        ornamentKind,
        ruleStyle,
        ruleWidth,
        artworkUrl: reference?.artwork,
        isSplitMonogram,
        isPhotoFirst,
        accentType,
    };
}

export default function EntranceReveal({
    weddingId,
    initials,
    motifColor,
    coupleNames,
    weddingDate,
    venueName,
    heroImage,
    template,
    wedding,
}: EntranceRevealProps) {
    const reduceMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const [manualVariant, setManualVariant] = useState<string | null>(null);
    const openTimerRef = useRef<number | null>(null);
    const autoOpenTimerRef = useRef<number | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const clearTimers = useCallback(() => {
        for (const timer of [autoOpenTimerRef, openTimerRef]) {
            if (timer.current !== null) window.clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    const openEntrance = useCallback((skipAnimation = false, startAudio = true) => {
        clearTimers();
        try {
            sessionStorage.setItem(`quickweds_entrance_seen_${weddingId}`, '1');
        } catch {
            /* The invitation can still open when storage is unavailable. */
        }
        if (startAudio) window.dispatchEvent(new Event('quickweds:start-background-music'));

        if (skipAnimation || reduceMotion) {
            setIsVisible(false);
            setIsOpening(false);
            return;
        }

        setIsOpening(true);
        openTimerRef.current = window.setTimeout(() => {
            setIsVisible(false);
            setIsOpening(false);
            openTimerRef.current = null;
        }, OPEN_DURATION_MS);
    }, [clearTimers, reduceMotion, weddingId]);

    const dismiss = () => {
        if (!isOpening) openEntrance();
    };

    const replayEntrance = useCallback((nextVariant?: string) => {
        clearTimers();
        setManualVariant(nextVariant ?? null);
        setIsOpening(false);
        setIsVisible(true);
    }, [clearTimers]);

    useEffect(() => {
        const handleReplay = () => replayEntrance();
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin || event.source !== window.parent) return;
            if (event.data?.type === 'REPLAY_ENTRANCE') replayEntrance(event.data.variant);
        };
        window.addEventListener('quickweds:replay-entrance', handleReplay);
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('quickweds:replay-entrance', handleReplay);
            window.removeEventListener('message', handleMessage);
        };
    }, [replayEntrance]);

    useEffect(() => {
        // A guest following a link to RSVP or another section can go straight there.
        if (reduceMotion || window.location.hash.length > 1) return clearTimers;
        try {
            if (sessionStorage.getItem(`quickweds_entrance_seen_${weddingId}`)) return clearTimers;
        } catch {
            /* Allow the entrance when storage is unavailable. */
        }

        const showTimer = window.setTimeout(() => setIsVisible(true), 0);
        if (weddingId === 'preview' && window.self !== window.top) {
            autoOpenTimerRef.current = window.setTimeout(() => openEntrance(false, false), 2600);
        }

        return () => {
            window.clearTimeout(showTimer);
            clearTimers();
        };
    }, [weddingId, reduceMotion, clearTimers, openEntrance]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!isVisible || !dialog) return;
        if (!dialog.open) {
            try {
                dialog.showModal();
            } catch {
                // Ignore if already open or detached during rapid Strict Mode remounts.
            }
        }
        return () => {
            if (dialog.open) {
                dialog.close();
            }
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const searchParams = new URLSearchParams(window.location.search);
    const rawGuest = searchParams.get('guest') || searchParams.get('to') || searchParams.get('invitee');
    const guestHonorific = rawGuest?.trim() ? rawGuest.trim().slice(0, 60) : null;
    const urlVariantOverride = searchParams.get('entrance');

    const effectiveTemplate = (wedding?.template || template || 'classic').toLowerCase();
    const templateAccent = getTemplateMeta(effectiveTemplate).accent;
    const invitationTheme = wedding ? getInvitationTheme(wedding) : undefined;
    const builderTheme = wedding && !invitationTheme ? getBuilderTheme(wedding) : undefined;

    const effectiveMotif = invitationTheme?.vars['--invitation-motif']
        || builderTheme?.['--builder-motif'] || motifColor || templateAccent;

    const visual = getTemplateVisualProfile(effectiveTemplate, effectiveMotif, false, wedding?.card_style);
    const recipe = deriveEntranceRecipe(
        wedding,
        effectiveTemplate,
        visual,
        manualVariant || urlVariantOverride,
        invitationTheme?.reference
    );

    // Reference designs use the wedding's heading font for names and the section font for body headings.
    const titleGradient = wedding && !invitationTheme
        ? getSectionTitleStyle(wedding).style?.backgroundImage
        : undefined;

    const nameParts = coupleNames.split(/\s*&\s*/);
    const brideName = wedding?.bride_name || nameParts[0] || coupleNames;
    const groomName = wedding?.groom_name || nameParts[1] || '';

    const parsedDate = (() => {
        if (!weddingDate) return null;
        const d = new Date(`${weddingDate.slice(0, 10)}T12:00:00`);
        if (Number.isNaN(d.getTime())) return null;
        return {
            dotted: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', ' · '),
            month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            day: String(d.getDate()).padStart(2, '0'),
            year: String(d.getFullYear()),
        };
    })();

    const eyebrowText = wedding?.is_thank_you_mode
        ? 'With Heartfelt Thanks'
        : wedding?.is_save_the_date
          ? 'Save the Date'
          : recipe.plaqueShape === 'ticket'
            ? 'Boarding Pass · Wedding Invitation'
            : 'Together With Their Families';

    const hasAudio = Boolean(
        (wedding?.background_music_enabled && wedding?.background_music_url) || wedding?.voice_greeting_url
    );

    const portraitUrl = (heroImage || wedding?.hero_image || wedding?.couple_photo)?.trim();
    const monogramShape =
        wedding?.logo_shape || (recipe.variant === 'envelope' ? 'wax-seal' : 'double-ring');
    const monogramColor = wedding?.logo_color || effectiveMotif;
    const monogramFont = wedding?.logo_font
        ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))`
        : undefined;

    const paperColor = invitationTheme?.vars['--invitation-paper'] || builderTheme?.['--builder-paper']
        || (visual.isDark ? '#151315' : '#FBF8F2');
    const inkColor = invitationTheme?.vars['--invitation-ink'] || builderTheme?.['--builder-ink']
        || (visual.isDark ? '#FFF8F0' : '#352C2C');
    const onAction = invitationTheme?.vars['--invitation-on-action'] || builderTheme?.['--builder-on-action'] || '#fff';
    const linkColor = invitationTheme?.vars['--invitation-link'] || builderTheme?.['--builder-link'] || inkColor;
    const buttonRadius = invitationTheme?.vars['--invitation-button-radius'] || builderTheme?.['--builder-button-radius'];
    const borderTone = `color-mix(in srgb, ${effectiveMotif} 38%, ${paperColor})`;
    const softTone = `color-mix(in srgb, ${effectiveMotif} 12%, ${paperColor})`;
    const flapOuterTone = `color-mix(in srgb, ${effectiveMotif} 34%, ${paperColor})`;
    const flapSideTone = `color-mix(in srgb, ${effectiveMotif} 19%, ${paperColor})`;
    const flapBottomTone = `color-mix(in srgb, ${effectiveMotif} 26%, ${paperColor})`;
    const doorTone = `color-mix(in srgb, ${effectiveMotif} 76%, #141913)`;
    const doorRule = `color-mix(in srgb, ${effectiveMotif} 46%, #f5e7c9)`;
    const sealGradient = `radial-gradient(circle at 30% 28%, color-mix(in srgb, ${effectiveMotif} 91%, white), ${effectiveMotif} 62%, color-mix(in srgb, ${effectiveMotif} 89%, black))`;

    // Dynamic Plaque Silhouette Styles
    const plaqueRadius =
        recipe.plaqueShape === 'arch'
            ? '999px 999px 24px 24px'
            : recipe.plaqueShape === 'oval'
              ? '999px'
              : recipe.plaqueShape === 'scallop'
                ? '32px'
                : recipe.plaqueShape === 'ticket'
                  ? '18px'
                  : recipe.plaqueShape === 'editorial'
                    ? '0px'
                    : 'var(--invitation-card-radius, var(--builder-card-radius, 20px))';

    const plaqueClipPath = recipe.plaqueShape === 'torn' ? TORN_CLIP : undefined;

    // Shared Composable Inner Invitation Card Content
    const renderPortraitCameo = (compact = false) => {
        if (!portraitUrl) return null;
        const frameRadius =
            recipe.plaqueShape === 'oval'
                ? '999px'
                : recipe.plaqueShape === 'arch'
                  ? '999px 999px 14px 14px'
                  : recipe.plaqueShape === 'editorial'
                    ? '0px'
                    : '16px';
        return (
            <div
                className={`relative mx-auto overflow-hidden shadow-md ${
                    compact ? 'h-24 w-20 sm:h-28 sm:w-24' : 'h-28 w-24 sm:h-36 sm:w-28'
                }`}
                style={{
                    borderRadius: frameRadius,
                    border: `${recipe.ruleWidth}px ${recipe.ruleStyle} ${borderTone}`,
                    padding: '3px',
                    backgroundColor: paperColor,
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={portraitUrl}
                    alt={coupleNames}
                    className="h-full w-full object-cover"
                    style={{ borderRadius: frameRadius }}
                />
            </div>
        );
    };

    const renderSealClasp = () => (
        <div className="relative flex flex-col items-center">
            {recipe.ornamentKind === 'bow' && (
                <div style={{ color: effectiveMotif }} className="-mb-3 w-28 sm:w-32 pointer-events-none">
                    <FineOrnament kind="bow" className="w-full h-auto" />
                </div>
            )}
            <button
                type="button"
                onClick={dismiss}
                aria-label="Open wedding invitation"
                className="group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full shadow-2xl transition-transform duration-300 hover:scale-105 active:scale-95"
                style={{
                    background: sealGradient,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.28), inset 0 2px 5px rgba(255,255,255,0.38)',
                    outline: `2px ${recipe.ruleStyle === 'dotted' ? 'dotted' : 'double'} rgba(255,255,255,0.45)`,
                    outlineOffset: '-6px',
                }}
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-2 rounded-full border opacity-45 transition-transform duration-500 group-hover:scale-110"
                    style={{
                        borderColor: effectiveMotif,
                        borderStyle: recipe.ruleStyle,
                    }}
                />
                <MonogramMark
                    initials={initials}
                    brideName={brideName}
                    groomName={groomName}
                    shape={monogramShape}
                    color={onAction}
                    fontFamily={monogramFont}
                    inverted
                    animation={wedding?.logo_animation || 'bloom'}
                    size="sm"
                />
            </button>
        </div>
    );

    const renderCoupleNames = () => (
        <h1
            className={`mt-2 max-w-full text-[clamp(1.85rem,6.5vw,3.3rem)] leading-[1.12] tracking-tight [overflow-wrap:anywhere] ${titleGradient ? 'bg-clip-text text-transparent' : ''}`}
            style={{
                fontFamily: 'var(--invitation-heading-font, var(--builder-heading-font, var(--font-serif)))',
                backgroundImage: titleGradient,
            }}
        >
            {groomName ? (
                <>
                    <span className="block">{brideName}</span>
                    <em
                        className="my-0.5 block font-serif text-xl sm:text-2xl italic font-normal"
                        style={{ color: linkColor }}
                    >
                        &amp;
                    </em>
                    <span className="block">{groomName}</span>
                </>
            ) : (
                coupleNames
            )}
        </h1>
    );

    const renderDateBlock = () => {
        if (!parsedDate) return null;
        if (recipe.plaqueShape === 'ticket') {
            return (
                <div
                    className="mt-4 grid grid-cols-2 border text-left text-[10px] uppercase tracking-[0.16em]"
                    style={{ borderColor: borderTone }}
                >
                    <div className="p-2.5">
                        <span className="block opacity-65">Destination</span>
                        <strong className="mt-0.5 block truncate text-xs font-semibold">
                            {venueName || 'Wedding Ceremony'}
                        </strong>
                    </div>
                    <div className="border-l p-2.5" style={{ borderColor: borderTone }}>
                        <span className="block opacity-65">Departure Date</span>
                        <strong className="mt-0.5 block text-xs font-semibold" style={{ color: linkColor }}>
                            {parsedDate.dotted}
                        </strong>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-4 flex flex-col items-center">
                <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]">
                    <span>{parsedDate.month}</span>
                    <strong
                        className="border-x px-3.5 font-serif text-2xl sm:text-3xl font-normal leading-none"
                        style={{ borderColor: borderTone, color: linkColor }}
                    >
                        {parsedDate.day}
                    </strong>
                    <span>{parsedDate.year}</span>
                </div>
                {venueName && (
                    <p className="mt-2 max-w-xs text-xs opacity-80 tracking-wide">{venueName}</p>
                )}
            </div>
        );
    };

    const renderInvitationPlaque = (compact = false) => (
        <div
            data-entrance-surface="true"
            style={
                {
                    backgroundColor: paperColor,
                    color: inkColor,
                    borderRadius: plaqueRadius,
                    clipPath: plaqueClipPath,
                    border:
                        recipe.plaqueShape === 'torn'
                            ? 'none'
                            : `${recipe.ruleWidth}px ${recipe.ruleStyle} ${borderTone}`,
                    backgroundImage: `radial-gradient(ellipse at 50% 0%, ${softTone}, transparent 70%), repeating-linear-gradient(116deg, transparent 0 3px, color-mix(in srgb, ${inkColor} 4%, transparent) 4px, transparent 5px)`,
                } as CSSProperties
            }
            className={`relative z-20 mx-auto flex w-full flex-col items-center overflow-hidden text-center shadow-[0_28px_80px_rgba(0,0,0,0.22)] ${
                compact
                    ? 'max-w-md px-6 pt-7 pb-5 sm:px-9 sm:pt-9 sm:pb-7'
                    : 'max-w-md px-6 pt-8 pb-6 sm:max-w-lg sm:px-10 sm:pt-10 sm:pb-8'
            }`}
        >
            {/* Optional Reference Watercolour Artwork Header */}
            {recipe.artworkUrl && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-contain bg-top bg-no-repeat opacity-55"
                    style={{ backgroundImage: `url("${recipe.artworkUrl}")` }}
                />
            )}

            {/* Fine-Line Botanical / Coastal / Architectural Corner Ornaments */}
            {!recipe.artworkUrl && recipe.ornamentKind !== 'none' && (
                <>
                    <div
                        aria-hidden="true"
                        style={{ color: effectiveMotif }}
                        className="pointer-events-none absolute -top-6 -right-6 w-32 sm:w-40 -rotate-90 opacity-50"
                    >
                        <FineOrnament kind={recipe.ornamentKind} className="w-full h-auto" />
                    </div>
                    <div
                        aria-hidden="true"
                        style={{ color: effectiveMotif }}
                        className="pointer-events-none absolute -bottom-6 -left-6 w-32 sm:w-40 rotate-90 opacity-45"
                    >
                        <FineOrnament kind={recipe.ornamentKind} className="w-full h-auto" />
                    </div>
                </>
            )}

            {/* Inner Inset Stationery Hairline */}
            {recipe.plaqueShape !== 'torn' && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-2.5 opacity-45"
                    style={{
                        borderRadius: plaqueRadius,
                        border: `1px ${recipe.ruleStyle} ${borderTone}`,
                    }}
                />
            )}

            <div className="relative z-10 flex w-full flex-col items-center">
                {guestHonorific && (
                    <span
                        className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ borderColor: borderTone, backgroundColor: softTone }}
                    >
                        <Sparkles className="h-3 w-3" style={{ color: effectiveMotif }} />
                        Reserved for {guestHonorific}
                    </span>
                )}

                {recipe.plaqueShape === 'ticket' && (
                    <div
                        className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: effectiveMotif }}
                    >
                        <Plane className="h-3.5 w-3.5" />
                        <span>First Class Pass</span>
                    </div>
                )}

                <div className="mb-3 flex justify-center">
                    {recipe.isPhotoFirst && portraitUrl ? (
                        renderPortraitCameo(compact)
                    ) : recipe.isSplitMonogram ? (
                        <div className="relative flex items-center justify-center gap-5 py-1 font-serif text-4xl sm:text-5xl">
                            <span>{initials.slice(0, 1)}</span>
                            <span
                                className="h-12 w-px"
                                style={{ backgroundColor: effectiveMotif }}
                            />
                            <span>{initials.slice(1, 2) || groomName.slice(0, 1)}</span>
                        </div>
                    ) : recipe.variant !== 'editorial-gate' ? (
                        renderSealClasp()
                    ) : portraitUrl ? (
                        renderPortraitCameo(true)
                    ) : (
                        <MonogramMark
                            initials={initials}
                            brideName={brideName}
                            groomName={groomName}
                            shape={monogramShape}
                            color={monogramColor}
                            motifColor={effectiveMotif}
                            fontFamily={monogramFont}
                            inverted={visual.isDark}
                            animation={wedding?.logo_animation || 'bloom'}
                            size="sm"
                        />
                    )}
                </div>

                <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-80">
                    {eyebrowText}
                </p>
                {renderCoupleNames()}

                {/* Delicate Heart Divider */}
                <div
                    className="my-3 flex items-center justify-center gap-2.5"
                    style={{ color: effectiveMotif }}
                >
                    <span className="h-px w-12 opacity-45" style={{ backgroundColor: effectiveMotif }} />
                    <Heart className="h-3 w-3 fill-current opacity-80" />
                    <span className="h-px w-12 opacity-45" style={{ backgroundColor: effectiveMotif }} />
                </div>

                {wedding?.quote && !compact && (
                    <p className="mx-auto mb-1 max-w-xs font-serif text-xs italic opacity-75 line-clamp-2">
                        &ldquo;{wedding.quote}&rdquo;
                    </p>
                )}

                {renderDateBlock()}

                <div className="mt-5 flex flex-col items-center">
                    <button
                        data-wedding-control="primary"
                        type="button"
                        onClick={dismiss}
                        className="inline-flex min-h-11 items-center gap-2 border px-6 py-2.5 text-xs font-medium tracking-[0.08em] transition hover:opacity-85"
                        style={{ backgroundColor: effectiveMotif, borderColor: effectiveMotif, color: onAction, borderRadius: buttonRadius }}
                    >
                        {hasAudio && <Volume2 className="h-3.5 w-3.5" />}
                        <span>Open invitation</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => openEntrance(true, !isOpening)}
                        className="min-h-11 px-3 text-xs underline underline-offset-4 hover:opacity-75"
                    >
                        Skip animation
                    </button>
                </div>
            </div>
        </div>
    );

    const isEnvelope = recipe.variant === 'envelope';
    const plaqueDelay = isEnvelope ? 0.16 : 0.04;

    return (
        <dialog
            ref={dialogRef}
            aria-label="Wedding invitation"
            data-wedding-entrance="true"
            data-entrance-variant={recipe.variant}
            data-entrance-plaque={recipe.plaqueShape}
            onCancel={(event) => {
                event.preventDefault();
                openEntrance(true, !isOpening);
            }}
            className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent"
            style={{ color: inkColor, fontFamily: 'var(--invitation-body-font, var(--builder-body-font, var(--font-sans)))' }}
        >
            <div className="absolute inset-0 overflow-hidden [perspective:1200px]">
                {/* Keep the live page behind the paper until the plaque text has cleared. */}
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundColor: recipe.variant === 'arch-doors' ? doorTone : paperColor }}
                    animate={{ opacity: isOpening ? 0 : 1 }}
                    transition={{ duration: 0.48, delay: isOpening ? plaqueDelay + 0.26 : 0, ease: 'easeInOut' }}
                />
                {/* ── MECHANIC 1: FULL-SCREEN 4-FLAP CANVA ENVELOPE ── */}
                {recipe.variant === 'envelope' && (
                    <>
                        {/* Left Envelope Wing (Parts Left to Reveal Live Page Underneath) */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={isOpening ? { x: '-105%' } : { x: '0%' }}
                            transition={{ duration: 0.85, delay: isOpening ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                backgroundColor: flapSideTone,
                                clipPath: 'polygon(0 0, 58% 50%, 0 100%)',
                                boxShadow: 'inset -12px 0 30px rgba(0,0,0,0.08)',
                            }}
                            className="pointer-events-none absolute inset-0 z-10"
                        >
                            <DecorativeLayer
                                type={recipe.accentType}
                                color={effectiveMotif}
                                position="top-left"
                                opacity={0.22}
                                className="h-44 w-44 sm:h-64 sm:w-64"
                            />
                        </motion.div>

                        {/* Right Envelope Wing (Parts Right to Reveal Live Page Underneath) */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={isOpening ? { x: '105%' } : { x: '0%' }}
                            transition={{ duration: 0.85, delay: isOpening ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                backgroundColor: flapSideTone,
                                clipPath: 'polygon(100% 0, 42% 50%, 100% 100%)',
                                boxShadow: 'inset 12px 0 30px rgba(0,0,0,0.08)',
                            }}
                            className="pointer-events-none absolute inset-0 z-10"
                        >
                            <DecorativeLayer
                                type={recipe.accentType}
                                color={effectiveMotif}
                                position="bottom-right"
                                opacity={0.22}
                                className="h-44 w-44 sm:h-64 sm:w-64"
                            />
                        </motion.div>

                        {/* Bottom Envelope Pocket (Glides Down on Open) */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={isOpening ? { y: '105%' } : { y: '0%' }}
                            transition={{ duration: 0.85, delay: isOpening ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                backgroundColor: flapBottomTone,
                                clipPath: 'polygon(0 100%, 50% 42%, 100% 100%)',
                                borderTop: `2px solid ${borderTone}`,
                            }}
                            className="pointer-events-none absolute inset-0 z-10 drop-shadow-[0_-10px_25px_rgba(0,0,0,0.12)]"
                        />

                        {/* Top Sealing Envelope Flap (Folds Open in 3D then Glides Up) */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={
                                isOpening
                                    ? { rotateX: 165, y: '-105%', opacity: 0.2 }
                                    : { rotateX: 0, y: '0%', opacity: 1 }
                            }
                            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                transformOrigin: 'top center',
                                backgroundColor: flapOuterTone,
                                backgroundImage: recipe.artworkUrl
                                    ? `linear-gradient(to bottom, color-mix(in srgb, ${flapOuterTone} 68%, transparent), color-mix(in srgb, ${flapOuterTone} 84%, transparent)), url("${recipe.artworkUrl}")`
                                    : `radial-gradient(circle at 50% 20%, ${softTone}, ${flapOuterTone})`,
                                backgroundSize: 'cover',
                                clipPath: 'polygon(0 0, 100% 0, 50% 56%)',
                            }}
                            className="pointer-events-none absolute inset-0 z-10 drop-shadow-[0_14px_28px_rgba(0,0,0,0.16)]"
                        />

                    </>
                )}

                {/* ── MECHANIC 2: GRAND ARCHITECTURAL & BOTANICAL DOUBLE DOORS ── */}
                {recipe.variant === 'arch-doors' && (
                    <>
                        {/* Left Full-Viewport Gatefold Door */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={
                                isOpening
                                    ? { rotateY: -104, opacity: 0 }
                                    : { rotateY: 0, opacity: 1 }
                            }
                            transition={{
                                rotateY: { duration: 1.04, ease: PAPER_EASE },
                                opacity: { duration: 0.36, delay: isOpening ? 0.58 : 0 },
                            }}
                            style={{
                                backgroundColor: doorTone,
                                borderColor: doorRule,
                                backfaceVisibility: 'hidden',
                                transformOrigin: 'left center',
                                backgroundImage: `radial-gradient(ellipse at 100% 45%, color-mix(in srgb, ${effectiveMotif} 62%, transparent), transparent 72%), repeating-linear-gradient(34deg, transparent 0 3px, #fff1da14 4px, transparent 5px)`,
                            }}
                            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 overflow-hidden border-r shadow-[16px_0_50px_rgba(0,0,0,0.18)]"
                        >
                            {/* Architectural Arch Moulding Inside Left Door */}
                            <div
                                className="
                                    absolute inset-y-6 left-4 right-0 sm:inset-y-10 sm:left-10
                                    rounded-tl-[8rem] sm:rounded-tl-[14rem] rounded-bl-2xl
                                "
                                style={{
                                    borderTop: `${recipe.ruleWidth}px ${recipe.ruleStyle} ${doorRule}`,
                                    borderLeft: `${recipe.ruleWidth}px ${recipe.ruleStyle} ${doorRule}`,
                                    borderBottom: `${recipe.ruleWidth}px ${recipe.ruleStyle} ${doorRule}`,
                                }}
                            />
                            {recipe.artworkUrl && (
                                <div
                                    className="absolute inset-x-0 top-0 h-56 bg-contain bg-right-top bg-no-repeat opacity-45"
                                    style={{ backgroundImage: `url("${recipe.artworkUrl}")` }}
                                />
                            )}
                            <DecorativeLayer
                                type={recipe.accentType}
                                color={effectiveMotif}
                                position="top-left"
                                opacity={0.32}
                                className="h-44 w-44 sm:h-64 sm:w-64"
                            />
                            <DecorativeLayer
                                type={recipe.accentType}
                                color={effectiveMotif}
                                position="bottom-left"
                                opacity={0.26}
                                className="h-44 w-44 sm:h-64 sm:w-64"
                            />
                        </motion.div>

                        {/* Right Full-Viewport Gatefold Door */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={
                                isOpening
                                    ? { rotateY: 104, opacity: 0 }
                                    : { rotateY: 0, opacity: 1 }
                            }
                            transition={{
                                rotateY: { duration: 1.04, ease: PAPER_EASE },
                                opacity: { duration: 0.36, delay: isOpening ? 0.58 : 0 },
                            }}
                            style={{
                                backgroundColor: doorTone,
                                borderColor: doorRule,
                                backfaceVisibility: 'hidden',
                                transformOrigin: 'right center',
                                backgroundImage: `radial-gradient(ellipse at 0% 45%, color-mix(in srgb, ${effectiveMotif} 62%, transparent), transparent 72%), repeating-linear-gradient(34deg, transparent 0 3px, #fff1da14 4px, transparent 5px)`,
                            }}
                            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/2 overflow-hidden border-l shadow-[-16px_0_50px_rgba(0,0,0,0.18)]"
                        >
                            {/* Architectural Arch Moulding Inside Right Door */}
                            <div
                                className="
                                    absolute inset-y-6 right-4 left-0 sm:inset-y-10 sm:right-10
                                    rounded-tr-[8rem] sm:rounded-tr-[14rem] rounded-br-2xl
                                "
                                style={{
                                    borderTop: `${recipe.ruleWidth}px ${recipe.ruleStyle} ${doorRule}`,
                                    borderRight: `${recipe.ruleWidth}px ${recipe.ruleStyle} ${doorRule}`,
                                    borderBottom: `${recipe.ruleWidth}px ${recipe.ruleStyle} ${doorRule}`,
                                }}
                            />
                            {recipe.artworkUrl && (
                                <div
                                    className="absolute inset-x-0 top-0 h-56 bg-contain bg-left-top bg-no-repeat opacity-45 scale-x-[-1]"
                                    style={{ backgroundImage: `url("${recipe.artworkUrl}")` }}
                                />
                            )}
                            <DecorativeLayer
                                type={recipe.accentType}
                                color={effectiveMotif}
                                position="top-right"
                                opacity={0.32}
                                className="h-44 w-44 sm:h-64 sm:w-64"
                            />
                            <DecorativeLayer
                                type={recipe.accentType}
                                color={effectiveMotif}
                                position="bottom-right"
                                opacity={0.26}
                                className="h-44 w-44 sm:h-64 sm:w-64"
                            />
                        </motion.div>

                    </>
                )}

                {/* ── MECHANIC 3: EDITORIAL LOOKBOOK / TICKET SPLIT CURTAIN ── */}
                {recipe.variant === 'editorial-gate' && (
                    <>
                        {/* Left Full-Viewport Editorial Panel */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={isOpening ? { x: '-102%' } : { x: '0%' }}
                            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                backgroundColor: paperColor,
                                borderColor: borderTone,
                            }}
                            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 border-r"
                        >
                            <div
                                className="absolute inset-y-8 left-8 right-0 border-y border-l opacity-35"
                                style={{ borderColor: borderTone }}
                            />
                        </motion.div>

                        {/* Right Full-Viewport Editorial Panel */}
                        <motion.div
                            aria-hidden="true"
                            data-entrance-surface="true"
                            animate={isOpening ? { x: '102%' } : { x: '0%' }}
                            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                backgroundColor: paperColor,
                                borderColor: borderTone,
                            }}
                            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/2 border-l"
                        >
                            <div
                                className="absolute inset-y-8 right-8 left-0 border-y border-r opacity-35"
                                style={{ borderColor: borderTone }}
                            />
                        </motion.div>

                    </>
                )}
            </div>
            <div className="relative z-20 h-full overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-8">
                <div className="flex min-h-full items-center justify-center">
                    <motion.div
                        animate={isOpening
                            ? { y: isEnvelope ? -56 : -10, scale: 0.97, opacity: 0 }
                            : { y: 0, scale: 1, opacity: 1 }}
                        transition={{
                            duration: 0.65,
                            delay: isOpening ? plaqueDelay : 0,
                            ease: PAPER_EASE,
                            opacity: { duration: 0.27, delay: isOpening ? plaqueDelay : 0, ease: 'easeOut' },
                        }}
                        className="flex shrink-0 justify-center"
                    >
                        {renderInvitationPlaque(isEnvelope)}
                    </motion.div>
                </div>
            </div>
        </dialog>
    );
}

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
    isLightBackgroundOverride,
    resolveTemplateElementTheme,
    type TemplateElementDividerVariant,
} from '@/lib/template-elements';
import DecorativeLayer from '@/components/DecorativeLayer';
import type { Wedding } from '@/types/wedding';

const AccentOverrideContext = createContext<string | undefined>(undefined);

export function WeddingAccentProvider({ accent, children }: { accent?: string; children: ReactNode }) {
    return <AccentOverrideContext.Provider value={accent}>{children}</AccentOverrideContext.Provider>;
}

const TemplateElementOverrideContext = createContext<string | undefined>(undefined);

/** Preserves the active template/sub-theme key inside wrappers like PremiumTemplate. */
export function TemplateElementProvider({
    template,
    children,
}: {
    template?: string;
    children: ReactNode;
}) {
    return (
        <TemplateElementOverrideContext.Provider value={template}>
            {children}
        </TemplateElementOverrideContext.Provider>
    );
}

export type SectionElementPlacement =
    | 'corner-top-right'
    | 'corner-bottom-left'
    | 'header-crest'
    | 'card-seal'
    | 'divider';

interface SectionTemplateElementProps {
    wedding?: Partial<Pick<Wedding, 'template' | 'template_style' | 'background_style' | 'motif_color' | 'accent_style'>>;
    template?: string;
    templateStyle?: string;
    motifColor?: string;
    isDark?: boolean;
    placement: SectionElementPlacement;
    className?: string;
}

function DividerOrnament({
    variant,
    color,
}: {
    variant: TemplateElementDividerVariant;
    color: string;
}) {
    switch (variant) {
        case 'coastal':
            return (
                <svg viewBox="0 0 28 24" className="h-5 w-6 shrink-0" fill="none" stroke={color} strokeWidth="1.35" aria-hidden="true">
                    <path d="M5 18C2.5 13 3.5 6 14 4c10.5 2 11.5 9 9 14H5Z" fill={color} fillOpacity="0.1" />
                    <path d="M14 4v14M9 6l4 12M19 6l-4 12" />
                </svg>
            );
        case 'crest':
            return (
                <svg viewBox="0 0 28 24" className="h-4 w-5 shrink-0" fill="none" stroke={color} strokeWidth="1.35" aria-hidden="true">
                    <path d="M14 2l6 10-6 10-6-10 6-10Z" fill={color} fillOpacity="0.12" />
                    <path d="M3 12h22" strokeOpacity="0.55" />
                </svg>
            );
        case 'stars':
            return (
                <svg viewBox="0 0 36 24" className="h-4 w-7 shrink-0" fill={color} aria-hidden="true">
                    <path d="M18 2l1.8 6.2L26 10l-6.2 1.8L18 18l-1.8-6.2L10 10l6.2-1.8L18 2Z" opacity="0.88" />
                    <circle cx="6" cy="12" r="1.4" opacity="0.55" />
                    <circle cx="30" cy="12" r="1.4" opacity="0.55" />
                </svg>
            );
        case 'nordic':
            return (
                <svg viewBox="0 0 28 24" className="h-4 w-6 shrink-0" fill="none" stroke={color} strokeWidth="1.4" aria-hidden="true">
                    <path d="M14 3v18M8 9l6-5 6 5M9 15l5-4 5 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'botanical':
            return (
                <svg viewBox="0 0 32 24" className="h-4 w-7 shrink-0" fill="none" stroke={color} strokeWidth="1.25" aria-hidden="true">
                    <path d="M4 18C10 13 18 10 28 6" strokeLinecap="round" />
                    <path d="M13 13c-1-5 2-8 6-9 0 5-2 8-6 9ZM20 10c1 4-1 7-5 8 0-4 2-7 5-8Z" fill={color} fillOpacity="0.16" />
                </svg>
            );
        case 'clean-rule':
            return (
                <svg viewBox="0 0 24 24" className="h-3.5 w-4 shrink-0" fill="none" stroke={color} strokeWidth="1.5" aria-hidden="true">
                    <rect x="8" y="8" width="8" height="8" transform="rotate(45 12 12)" fill={color} fillOpacity="0.14" />
                </svg>
            );
        case 'floral':
        default:
            return (
                <svg viewBox="0 0 28 24" className="h-4 w-6 shrink-0" fill="none" stroke={color} strokeWidth="1.2" aria-hidden="true">
                    <path d="M14 5c2.2 2.4 2.2 4.6 0 7-2.2-2.4-2.2-4.6 0-7ZM14 19c2.2-2.4 2.2-4.6 0-7-2.2 2.4-2.2 4.6 0 7ZM7 12c2.4-2.2 4.6-2.2 7 0-2.4 2.2-4.6 2.2-7 0ZM21 12c-2.4-2.2-4.6-2.2-7 0 2.4 2.2 4.6 2.2 7 0Z" fill={color} fillOpacity="0.12" />
                    <circle cx="14" cy="12" r="1.6" fill={color} />
                </svg>
            );
    }
}

/**
 * Renders template-matched illustrations and crisp vector dividers inside page
 * sections while keeping dark/light blending safe and layout pointer-transparent.
 */
export function SectionTemplateElement({
    wedding,
    template,
    templateStyle,
    motifColor,
    isDark = false,
    placement,
    className = '',
}: SectionTemplateElementProps) {
    const accent = useContext(AccentOverrideContext) ?? wedding?.accent_style;
    const contextTemplate = useContext(TemplateElementOverrideContext);
    const effectiveTemplate = contextTemplate || template || wedding?.template || 'classic';
    const effectiveStyle = templateStyle ?? wedding?.template_style;
    const effectiveDark = Boolean(isDark && !isLightBackgroundOverride(wedding?.background_style));
    const color = motifColor || wedding?.motif_color || '#D16C78';
    const theme = resolveTemplateElementTheme(effectiveTemplate, effectiveStyle);

    if (accent === 'clean') return null;
    const customAccent = accent && ['olive', 'pearls', 'coastal', 'deco', 'eucalyptus', 'pampas', 'ribbon', 'monstera', 'sakura', 'gold-arch', 'sparkles', 'petals', 'dots', 'floral', 'boho', 'tropical', 'minimal'].includes(accent);
    if (customAccent) {
        const positions = {
            'header-crest': 'relative mx-auto h-14 w-14',
            'card-seal': 'absolute right-3 top-3 h-14 w-14 opacity-30',
            'corner-top-right': 'absolute right-0 top-0 h-20 w-20 sm:h-28 sm:w-28 opacity-25',
            'corner-bottom-left': 'absolute bottom-0 left-0 h-20 w-20 sm:h-28 sm:w-28 opacity-25',
            divider: 'relative h-8 w-8',
        };
        const ornament = <span className={`block pointer-events-none select-none ${positions[placement]} ${placement === 'divider' ? '' : className}`} aria-hidden="true" data-section-accent={accent}>
            <DecorativeLayer type={accent} color={color} position="center" static className="!h-full !w-full" />
        </span>;
        return placement === 'divider' ? <div aria-hidden="true" className={`flex items-center justify-center gap-3 pointer-events-none ${className}`}>
            <span className="h-px w-12 opacity-40" style={{ background: color }} />{ornament}<span className="h-px w-12 opacity-40" style={{ background: color }} />
        </div> : ornament;
    }

    if (placement === 'divider') {
        return (
            <div
                aria-hidden="true"
                className={`pointer-events-none select-none flex items-center justify-center gap-3 ${className}`}
            >
                <span className="h-px w-10 sm:w-14 opacity-45" style={{ backgroundColor: color }} />
                <DividerOrnament variant={theme.dividerVariant} color={color} />
                <span className="h-px w-10 sm:w-14 opacity-45" style={{ backgroundColor: color }} />
            </div>
        );
    }

    const blendClass = effectiveDark
        ? 'opacity-[0.22] brightness-110'
        : 'opacity-[0.26] mix-blend-multiply';

    if (placement === 'header-crest') {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={theme.assetSrc}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className={`pointer-events-none select-none mx-auto h-12 w-12 object-contain sm:h-14 sm:w-14 ${
                    effectiveDark ? 'opacity-80 brightness-110' : 'opacity-85 mix-blend-multiply'
                } ${className}`}
            />
        );
    }

    if (placement === 'card-seal') {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={theme.assetSrc}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className={`pointer-events-none select-none absolute right-3 top-3 z-0 h-14 w-14 rotate-6 object-contain sm:right-4 sm:top-4 sm:h-16 sm:w-16 ${
                    effectiveDark ? 'opacity-[0.28] brightness-110' : 'opacity-[0.36] mix-blend-multiply'
                } ${className}`}
            />
        );
    }

    if (placement === 'corner-bottom-left') {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={theme.assetSrc}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className={`pointer-events-none select-none absolute -bottom-3 -left-3 z-0 h-20 w-20 object-contain sm:-bottom-4 sm:-left-4 sm:h-28 sm:w-28 ${blendClass} ${className}`}
            />
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={theme.assetSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={`pointer-events-none select-none absolute -right-3 -top-3 z-0 h-20 w-20 object-contain sm:-right-4 sm:-top-4 sm:h-28 sm:w-28 ${blendClass} ${className}`}
        />
    );
}


import type { CSSProperties } from 'react';

/**
 * Theme Engine Utility
 * 
 * Provides sophisticated color derivation, typography pairings, 
 * and layout presets to elevate standard template motif colors 
 * into high-end editorial palettes.
 */

export type TemplateCategory = 'classic' | 'modern' | 'romantic' | 'boho' | 'urban' | 'vintage' | 'nordic' | 'celestial' | 'riviera';
export type TemplateMood =
    | 'classic'
    | 'romantic'
    | 'editorial'
    | 'dark'
    | 'organic'
    | 'vintage'
    | 'destination'
    | 'cinematic'
    | 'playful'
    | 'nordic'
    | 'celestial'
    | 'riviera';

export interface ThemePalette {
    primary: string;       // Motif Color
    secondary: string;     // Soft 10% opacity version for backgrounds
    accent: string;        // Contrast color for text or highlights
    muted: string;         // Very low contrast for structural elements
    surface: string;       // Background surface color
    border: string;        // Subtle border color
}

export interface TypographyPreset {
    heading: string;
    body: string;
    letterSpacing: string;
    case: 'uppercase' | 'none' | 'capitalize';
}

export type CardContainerStyleId =
    | 'default'
    | 'cards_bordered'
    | 'borderless_glass'
    | 'editorial_rules'
    | 'soft_parchment'
    | 'arch_panel'
    | 'full_bleed_strip';

export const CARD_CONTAINER_STYLES = [
    { id: 'default', name: 'Template Default', description: 'Matched to template design mood' },
    { id: 'cards_bordered', name: 'Bordered Cards', description: 'Classic framed cards with subtle stroke borders' },
    { id: 'borderless_glass', name: 'Borderless Glass', description: 'Floating glass panels with soft backdrop blur and zero borders' },
    { id: 'editorial_rules', name: 'Editorial Rules & Dividers', description: 'Minimalist layout bounded by clean hairline rules' },
    { id: 'soft_parchment', name: 'Soft Elevated Shadow', description: 'Atmospheric paper cards with soft ambient elevation shadow' },
    { id: 'arch_panel', name: 'Architectural Arch & Pill', description: 'Curved arch-top silhouettes and rounded pill contours' },
    { id: 'full_bleed_strip', name: 'Full-Bleed Color Strips', description: 'Edge-to-edge section background blocks without card boxes' },
] as const;

export interface TemplateVisualProfile {
    mood: TemplateMood;
    cardStyleId: CardContainerStyleId;
    isDark: boolean;
    isSharp: boolean;
    isVintage: boolean;
    isOrganic: boolean;
    sectionClass: string;
    sectionStyle?: CSSProperties;
    containerClass: string;
    cardClass: string;
    accentCardClass: string;
    imageFrameClass: string;
    eyebrowClass: string;
    headingClass: string;
    bodyClass: string;
    dividerClass: string;
    ornament: 'none' | 'floral' | 'botanical' | 'geometric' | 'editorial' | 'film' | 'tropical' | 'royal' | 'glitch';
    galleryTitle: string;
    detailTitle: string;
    timelineTitle: string;
    giftTitle: string;
}

export const SECTION_TITLE_FONT_STYLES = [
    { id: 'default', name: 'Default', className: '' },
    { id: 'editorial-serif', name: 'Editorial Serif', className: '[font-family:var(--font-bodoni)] uppercase tracking-[0.08em]' },
    { id: 'romantic-script', name: 'Romantic Script', className: '[font-family:var(--font-script)] italic font-normal tracking-normal' },
    { id: 'modern-sans', name: 'Modern Sans', className: '[font-family:var(--font-modern)] font-black uppercase tracking-[0.02em]' },
] as const;

export const SECTION_TITLE_COLOR_STYLES = [
    { id: 'motif', name: 'Motif', swatches: ['var(--primary)', '#4A4444'] },
    { id: 'rose-gold', name: 'Rose Gold', gradient: 'linear-gradient(90deg, #B85C7A 0%, #D6B87C 52%, #F2C1CC 100%)', swatches: ['#B85C7A', '#D6B87C', '#F2C1CC'] },
    { id: 'champagne-blush', name: 'Champagne Blush', gradient: 'linear-gradient(90deg, #C5A059 0%, #EBD4C4 48%, #D16C78 100%)', swatches: ['#C5A059', '#EBD4C4', '#D16C78'] },
    { id: 'sage-ivory', name: 'Sage & Ivory', gradient: 'linear-gradient(90deg, #537A57 0%, #AFC3A4 48%, #8F6A45 100%)', swatches: ['#537A57', '#AFC3A4', '#8F6A45'] },
    { id: 'midnight-gold', name: 'Midnight Gold', gradient: 'linear-gradient(90deg, #111827 0%, #D6B87C 55%, #FFF3C4 100%)', swatches: ['#111827', '#D6B87C', '#FFF3C4'] },
] as const;

type SectionTitleWedding = {
    section_title_font_style?: string | null;
    section_title_color_style?: string | null;
    motif_color?: string | null;
};

function normalizeSectionTitleColorStyleId(styleId?: string | null) {
    if (!styleId || styleId === 'default') return 'motif';
    return SECTION_TITLE_COLOR_STYLES.some((style) => style.id === styleId) ? styleId : 'motif';
}

function normalizeHexColor(color?: string | null) {
    if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return '#D16C78';
    return color;
}

function mixHexColor(color: string, target: string, amount: number) {
    const from = normalizeHexColor(color).replace('#', '');
    const to = normalizeHexColor(target).replace('#', '');
    const mix = (fromPart: string, toPart: string) => {
        const fromValue = parseInt(fromPart, 16);
        const toValue = parseInt(toPart, 16);
        return Math.round(fromValue + (toValue - fromValue) * amount).toString(16).padStart(2, '0');
    };

    return `#${mix(from.slice(0, 2), to.slice(0, 2))}${mix(from.slice(2, 4), to.slice(2, 4))}${mix(from.slice(4, 6), to.slice(4, 6))}`;
}

function getHexLuminance(color: string) {
    const normalized = normalizeHexColor(color).replace('#', '');
    const rgb = [0, 2, 4].map((offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255);
    const linear = rgb.map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
}

export function getMotifSectionTitleGradient(motifColor?: string | null) {
    const motif = normalizeHexColor(motifColor);
    const anchor = getHexLuminance(motif) > 0.82 ? mixHexColor(motif, '#8F4D5D', 0.68) : motif;
    const deep = mixHexColor(anchor, '#3A2A2D', 0.2);
    const soft = mixHexColor(anchor, '#FFFFFF', 0.42);

    return `linear-gradient(90deg, ${deep} 0%, ${anchor} 48%, ${soft} 100%)`;
}

export function getSectionTitleStyle(wedding: SectionTitleWedding, defaultClassName = ''): { className: string; style?: CSSProperties } {
    const fontStyle = SECTION_TITLE_FONT_STYLES.find((style) => style.id === wedding.section_title_font_style);
    const colorStyleId = normalizeSectionTitleColorStyleId(wedding.section_title_color_style);
    const colorStyle = SECTION_TITLE_COLOR_STYLES.find((style) => style.id === colorStyleId);
    const classNames = [fontStyle?.className || defaultClassName];
    const style: CSSProperties = {};

    const gradient = colorStyle && 'gradient' in colorStyle ? colorStyle.gradient : '';

    if (gradient) {
        classNames.push('bg-clip-text text-transparent');
        style.backgroundImage = gradient;
    } else if (colorStyleId === 'motif') {
        classNames.push('bg-clip-text text-transparent');
        style.backgroundImage = getMotifSectionTitleGradient(wedding.motif_color);
    }

    return {
        className: classNames.filter(Boolean).join(' '),
        style: Object.keys(style).length > 0 ? style : undefined,
    };
}

/**
 * Derives a full palette from a single motif color.
 */
export function derivePalette(motifColor: string, isDark: boolean = false): ThemePalette {
    const color = motifColor || '#D16C78';
    
    // Simple hex to rgba-like helpers (could be more robust with a library, but keeping it light)
    const secondary = `${color}1A`; // 10% opacity
    const muted = `${color}0D`;     // 5% opacity
    const border = `${color}33`;    // 20% opacity
    
    return {
        primary: color,
        secondary,
        accent: isDark ? '#FFFFFF' : '#1A1A1A',
        muted,
        surface: isDark ? '#121212' : '#FFFFFF',
        border
    };
}

function normalizeTemplate(template?: string) {
    return (template || 'classic').toLowerCase();
}

export function getTemplateMood(template?: string): TemplateMood {
    const t = normalizeTemplate(template);

    if (t === 'celestial') return 'celestial';
    if (t === 'nordic') return 'nordic';
    if (t === 'riviera') return 'riviera';

    if (['royal', 'midnight', 'artdeco', 'luxury'].includes(t)) return 'dark';
    if (['cinematic', 'film'].includes(t)) return 'cinematic';
    if (['editorial', 'minimal', 'vogue', 'urban', 'glitch', 'timeline', 'rsvpfocus'].includes(t)) return 'editorial';
    if (['boho', 'garden', 'rustic', 'sakura'].includes(t)) return 'organic';
    if (['tropical', 'elopement'].includes(t)) return 'destination';
    if (['vintage', 'traditional'].includes(t)) return 'vintage';
    if (['whimsical', 'romantic'].includes(t)) return 'playful';

    return 'classic';
}

export function resolveCardContainerClasses(
    cardStyle: string | undefined | null,
    mood: TemplateMood,
    isDark: boolean,
    defaultCardClass: string,
    defaultAccentCardClass: string
): { cardStyleId: CardContainerStyleId; cardClass: string; accentCardClass: string } {
    const rawStyle = (cardStyle || 'default').toLowerCase().trim();
    let styleId: CardContainerStyleId = 'default';

    if (CARD_CONTAINER_STYLES.some((s) => s.id === rawStyle)) {
        styleId = rawStyle as CardContainerStyleId;
    }

    if (styleId === 'default') {
        if (mood === 'editorial') styleId = 'editorial_rules';
        else if (mood === 'celestial' || mood === 'dark' || mood === 'cinematic' || mood === 'nordic' || mood === 'riviera') styleId = 'borderless_glass';
        else if (mood === 'organic' || mood === 'playful') styleId = 'soft_parchment';
        else styleId = 'cards_bordered';
    }

    switch (styleId) {
        case 'borderless_glass':
            return {
                cardStyleId: styleId,
                cardClass: isDark
                    ? 'border-none bg-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-3xl'
                    : 'border-none bg-white/75 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-2xl rounded-3xl',
                accentCardClass: isDark
                    ? 'border-none bg-primary/20 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-3xl'
                    : 'border-none bg-primary/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl rounded-3xl',
            };
        case 'editorial_rules':
            return {
                cardStyleId: styleId,
                cardClass: isDark
                    ? 'border-none border-y border-white/20 bg-transparent rounded-none shadow-none py-6'
                    : 'border-none border-y border-black/15 bg-transparent rounded-none shadow-none py-6',
                accentCardClass: isDark
                    ? 'border-none border-y-2 border-primary/80 bg-white/[0.04] rounded-none shadow-none py-6'
                    : 'border-none border-y-2 border-black bg-black/5 rounded-none shadow-none py-6',
            };
        case 'soft_parchment':
            return {
                cardStyleId: styleId,
                cardClass: isDark
                    ? 'border-none bg-[#191716]/90 shadow-[0_28px_80px_rgba(0,0,0,0.65)] rounded-[2.25rem]'
                    : 'border-none bg-white/95 shadow-[0_24px_65px_rgba(70,50,45,0.12)] rounded-[2.25rem]',
                accentCardClass: isDark
                    ? 'border-none bg-[#241f1c]/90 shadow-[0_28px_80px_rgba(0,0,0,0.6)] rounded-[2.25rem]'
                    : 'border-none bg-[#fffaf5] shadow-[0_24px_65px_rgba(70,50,45,0.15)] rounded-[2.25rem]',
            };
        case 'arch_panel':
            return {
                cardStyleId: styleId,
                cardClass: isDark
                    ? 'border-none bg-white/10 backdrop-blur-xl shadow-2xl rounded-t-[4rem] rounded-b-2xl'
                    : 'border-none bg-white/85 backdrop-blur-xl shadow-xl rounded-t-[4rem] rounded-b-2xl',
                accentCardClass: isDark
                    ? 'border-none bg-primary/25 backdrop-blur-xl shadow-2xl rounded-t-[4rem] rounded-b-2xl'
                    : 'border-none bg-primary/15 backdrop-blur-xl shadow-xl rounded-t-[4rem] rounded-b-2xl',
            };
        case 'full_bleed_strip':
            return {
                cardStyleId: styleId,
                cardClass: isDark
                    ? 'border-none bg-white/[0.05] rounded-none shadow-none px-6 py-8'
                    : 'border-none bg-black/[0.03] rounded-none shadow-none px-6 py-8',
                accentCardClass: isDark
                    ? 'border-none bg-primary/20 rounded-none shadow-none px-6 py-8'
                    : 'border-none bg-primary/10 rounded-none shadow-none px-6 py-8',
            };
        case 'cards_bordered':
            return {
                cardStyleId: styleId,
                cardClass: isDark
                    ? 'border border-white/20 bg-black/40 shadow-xl backdrop-blur-xl rounded-2xl'
                    : 'border border-primary/20 bg-white/75 shadow-lg backdrop-blur-xl rounded-2xl',
                accentCardClass: isDark
                    ? 'border border-primary/40 bg-primary/20 shadow-xl backdrop-blur-xl rounded-2xl'
                    : 'border border-primary/30 bg-primary/15 shadow-lg backdrop-blur-xl rounded-2xl',
            };
        default:
            return {
                cardStyleId: styleId,
                cardClass: defaultCardClass,
                accentCardClass: defaultAccentCardClass,
            };
    }
}

export function getTemplateVisualProfile(
    template?: string,
    motifColor = '#D16C78',
    invert = false,
    cardStyleOverride?: string | null
): TemplateVisualProfile {
    const t = normalizeTemplate(template);
    const mood = getTemplateMood(t);
    const isDark = invert || mood === 'dark' || mood === 'cinematic' || ['urban', 'glitch'].includes(t);
    const isSharp = mood === 'editorial' || ['artdeco', 'luxury', 'urban', 'glitch'].includes(t);
    const isVintage = mood === 'vintage' || ['rustic', 'boho', 'film'].includes(t);
    const isOrganic = mood === 'organic' || mood === 'destination' || mood === 'playful';

    const base = {
        mood,
        isDark,
        isSharp,
        isVintage,
        isOrganic,
        detailTitle: 'Wedding Details',
        timelineTitle: 'The Program',
        giftTitle: 'Gift Registry',
    };

    const getProfile = (): TemplateVisualProfile => {
        if (mood === 'celestial') {
            return {
                ...base,
                cardStyleId: 'borderless_glass',
                isDark: true,
                sectionClass: 'relative overflow-hidden bg-[#0a0e1a] text-amber-100',
                sectionStyle: { backgroundImage: `radial-gradient(circle at 50% 20%, ${motifColor}33, transparent 45%), radial-gradient(circle at 10% 80%, #1e1b4b 0%, #090d16 100%)` },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'rounded-2xl border border-amber-300/20 bg-slate-950/60 shadow-[0_20px_70px_rgba(15,23,42,0.6)] backdrop-blur-2xl',
                accentCardClass: 'rounded-2xl border border-amber-300/40 bg-amber-500/10 shadow-[0_20px_70px_rgba(217,119,6,0.2)]',
                imageFrameClass: 'rounded-2xl border-4 border-amber-300/30 shadow-[0_25px_80px_rgba(217,119,6,0.25)]',
                eyebrowClass: 'text-amber-300/90 tracking-[0.45em]',
                headingClass: 'font-serif tracking-widest text-amber-200 uppercase',
                bodyClass: 'text-slate-300/90',
                dividerClass: 'h-px w-32 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent',
                ornament: 'royal',
                galleryTitle: 'Celestial Memories',
            };
        }

        if (mood === 'nordic') {
            return {
                ...base,
                cardStyleId: 'borderless_glass',
                sectionClass: 'relative overflow-hidden bg-[#f4f6f5] text-slate-800',
                sectionStyle: { backgroundImage: `linear-gradient(180deg, #f4f6f5 0%, #e5e9e6 100%)` },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'rounded-3xl border border-slate-200 bg-white/80 shadow-[0_12px_40px_rgba(30,41,59,0.05)] backdrop-blur-xl',
                accentCardClass: 'rounded-3xl border border-emerald-900/10 bg-slate-100 shadow-[0_12px_40px_rgba(30,41,59,0.07)]',
                imageFrameClass: 'rounded-3xl border-8 border-white shadow-[0_20px_60px_rgba(30,41,59,0.08)]',
                eyebrowClass: 'text-slate-500 tracking-[0.38em]',
                headingClass: 'font-sans font-light tracking-wide text-slate-900',
                bodyClass: 'text-slate-600',
                dividerClass: 'h-px w-20 bg-slate-300',
                ornament: 'botanical',
                galleryTitle: 'Fjord & Meadow',
            };
        }

        if (mood === 'riviera') {
            return {
                ...base,
                cardStyleId: 'borderless_glass',
                sectionClass: 'relative overflow-hidden bg-[#fffdfa] text-cyan-950',
                sectionStyle: { backgroundImage: `radial-gradient(circle at 90% 10%, #0284c718, transparent 40%), linear-gradient(180deg, #fffdfa 0%, #f0f9ff 100%)` },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'rounded-3xl border border-sky-100 bg-white/90 shadow-[0_20px_60px_rgba(14,165,233,0.08)] backdrop-blur-xl',
                accentCardClass: 'rounded-3xl border border-amber-300/40 bg-amber-500/5 shadow-[0_20px_60px_rgba(245,158,11,0.08)]',
                imageFrameClass: 'rounded-3xl border-[10px] border-white shadow-[0_25px_70px_rgba(14,165,233,0.12)]',
                eyebrowClass: 'text-sky-600 tracking-[0.35em]',
                headingClass: 'font-serif italic tracking-normal text-sky-950',
                bodyClass: 'text-sky-900/80',
                dividerClass: 'h-0.5 w-24 bg-gradient-to-r from-sky-400 via-amber-400 to-sky-400',
                ornament: 'tropical',
                galleryTitle: 'Amalfi Stories',
            };
        }

        if (mood === 'dark') {
            return {
                ...base,
                cardStyleId: 'borderless_glass',
                sectionClass: 'relative overflow-hidden bg-[#101010] text-white',
                sectionStyle: { backgroundImage: `radial-gradient(circle at 16% 10%, ${motifColor}24, transparent 34%), linear-gradient(180deg, #101010 0%, #17120f 100%)` },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'border border-primary/25 bg-black/35 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl rounded-none',
                accentCardClass: 'border border-primary/35 bg-primary/10 shadow-[0_24px_70px_rgba(0,0,0,0.35)] rounded-none',
                imageFrameClass: 'rounded-none border-[10px] border-primary/30 shadow-[0_30px_90px_rgba(0,0,0,0.55)]',
                eyebrowClass: 'text-primary/85 tracking-[0.42em]',
                headingClass: 'font-serif uppercase tracking-[0.12em] text-primary',
                bodyClass: 'text-white/82',
                dividerClass: 'h-px w-28 bg-gradient-to-r from-transparent via-primary/70 to-transparent',
                ornament: t === 'artdeco' ? 'geometric' : 'royal',
                galleryTitle: 'The Gallery',
            };
        }

        if (mood === 'editorial') {
            return {
                ...base,
                cardStyleId: 'editorial_rules',
                sectionClass: 'relative overflow-hidden bg-white text-neutral-950',
                sectionStyle: { backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(180deg, #fff 0%, ${motifColor}0A 100%)`, backgroundSize: '72px 72px, auto' },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'rounded-none border border-black/10 bg-white shadow-none',
                accentCardClass: 'rounded-none border border-black bg-black text-white shadow-[18px_18px_0_rgba(0,0,0,0.08)]',
                imageFrameClass: 'rounded-none border border-black/10 grayscale hover:grayscale-0 shadow-[18px_18px_0_rgba(0,0,0,0.06)]',
                eyebrowClass: 'text-black/65 tracking-[0.5em]',
                headingClass: 'font-sans font-black uppercase tracking-[-0.04em] text-black',
                bodyClass: 'text-black/74',
                dividerClass: 'h-[2px] w-24 bg-black',
                ornament: t === 'glitch' ? 'glitch' : 'editorial',
                galleryTitle: 'Photo Edit',
            };
        }

        if (mood === 'cinematic') {
            return {
                ...base,
                cardStyleId: 'borderless_glass',
                sectionClass: 'relative overflow-hidden bg-[#17110d] text-white',
                sectionStyle: { backgroundImage: `radial-gradient(circle at 80% 16%, ${motifColor}2E, transparent 34%), linear-gradient(180deg, #0d0d10 0%, #221711 100%)` },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'rounded-[1.5rem] border border-white/10 bg-white/[0.06] shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl',
                accentCardClass: 'rounded-[1.5rem] border border-primary/30 bg-primary/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)]',
                imageFrameClass: 'rounded-[1rem] border-[8px] border-black shadow-[0_28px_80px_rgba(0,0,0,0.55)] sepia-[0.12]',
                eyebrowClass: 'text-primary/85 tracking-[0.42em]',
                headingClass: 'font-serif tracking-tight text-white',
                bodyClass: 'text-white/82',
                dividerClass: 'h-px w-28 bg-gradient-to-r from-transparent via-primary/70 to-transparent',
                ornament: 'film',
                galleryTitle: 'Film Stills',
            };
        }

        if (mood === 'organic' || mood === 'destination' || mood === 'playful') {
            return {
                ...base,
                cardStyleId: 'soft_parchment',
                sectionClass: 'relative overflow-hidden text-[#4A4444]',
                sectionStyle: { backgroundImage: `radial-gradient(circle at 8% 8%, ${motifColor}18, transparent 32%), radial-gradient(circle at 92% 20%, ${motifColor}12, transparent 30%), linear-gradient(180deg, #fffaf6 0%, #f8efe8 100%)` },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'rounded-[2rem] md:rounded-[3.25rem] border border-white/70 bg-white/68 shadow-[0_28px_90px_rgba(58,42,45,0.10)] backdrop-blur-xl',
                accentCardClass: 'rounded-[2rem] md:rounded-[3.25rem] border border-primary/20 bg-white/80 shadow-[0_24px_80px_rgba(58,42,45,0.09)]',
                imageFrameClass: 'rounded-[2.5rem] md:rounded-[4rem] border-[12px] border-white shadow-[0_30px_90px_rgba(58,42,45,0.16)]',
                eyebrowClass: 'text-primary/82 tracking-[0.32em]',
                headingClass: 'font-serif italic tracking-tight text-[#4A4444]',
                bodyClass: 'text-[#4A4444]/78',
                dividerClass: 'h-px w-24 bg-gradient-to-r from-transparent via-primary/45 to-transparent',
                ornament: mood === 'destination' ? 'tropical' : 'botanical',
                galleryTitle: mood === 'destination' ? 'Paradise Moments' : 'Captured Moments',
            };
        }

        if (mood === 'vintage') {
            return {
                ...base,
                cardStyleId: 'cards_bordered',
                sectionClass: 'relative overflow-hidden bg-[#fbf5ea] text-[#4A3A31]',
                sectionStyle: { backgroundImage: `linear-gradient(180deg, #fbf5ea 0%, #efe1cd 100%)` },
                containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                cardClass: 'rounded-sm border-[1px] border-primary/25 bg-[#fffaf0]/80 shadow-[0_24px_70px_rgba(74,58,49,0.14)] ring-4 ring-primary/5',
                accentCardClass: 'rounded-sm border-[4px] double border-primary/30 bg-[#fffaf0]/90 shadow-[0_24px_80px_rgba(74,58,49,0.16)]',
                imageFrameClass: 'rounded-sm border-[16px] border-[#f5ead8] shadow-[0_24px_70px_rgba(74,58,49,0.18)] sepia-[0.16]',
                eyebrowClass: 'text-primary/82 tracking-[0.38em]',
                headingClass: 'font-serif tracking-tight text-[#4A3A31]',
                bodyClass: 'text-[#4A3A31]/80',
                dividerClass: 'h-px w-28 bg-gradient-to-r from-transparent via-primary/55 to-transparent',
                ornament: 'floral',
                galleryTitle: 'Keepsake Gallery',
            };
        }

        return {
            ...base,
            cardStyleId: 'cards_bordered',
            sectionClass: 'relative overflow-hidden text-[#4A4444]',
            sectionStyle: { backgroundImage: `radial-gradient(circle at 15% 12%, ${motifColor}14, transparent 30%), linear-gradient(180deg, #fffdfb 0%, #f8eeea 100%)` },
            containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
            cardClass: 'rounded-[2rem] md:rounded-[4rem] border border-white/65 bg-white/62 shadow-[0_28px_90px_rgba(58,42,45,0.10)] backdrop-blur-xl',
            accentCardClass: 'rounded-[2rem] md:rounded-[4rem] border border-primary/18 bg-white/78 shadow-[0_24px_80px_rgba(58,42,45,0.10)]',
            imageFrameClass: 'rounded-[2rem] md:rounded-[4rem] border-[12px] border-white shadow-[0_30px_90px_rgba(58,42,45,0.14)]',
            eyebrowClass: 'text-primary/82 tracking-[0.36em]',
            headingClass: 'font-serif tracking-tight text-[#4A4444]',
            bodyClass: 'text-[#4A4444]/78',
            dividerClass: 'h-px w-24 bg-gradient-to-r from-transparent via-primary/45 to-transparent',
            ornament: 'floral',
            galleryTitle: 'Our Gallery',
        };
    };

    const initialProfile = getProfile();

    if (cardStyleOverride && cardStyleOverride !== 'default') {
        const resolved = resolveCardContainerClasses(
            cardStyleOverride,
            initialProfile.mood,
            initialProfile.isDark,
            initialProfile.cardClass,
            initialProfile.accentCardClass
        );
        return {
            ...initialProfile,
            cardStyleId: resolved.cardStyleId,
            cardClass: resolved.cardClass,
            accentCardClass: resolved.accentCardClass,
        };
    }

    return initialProfile;
}

/**
 * Gets typography configuration based on template style.
 */
export function getTypography(template: string): TypographyPreset {
    const t = template.toLowerCase();
    
    if (['royal', 'classic', 'traditional', 'elegance'].includes(t)) {
        return {
            heading: 'font-serif',
            body: 'font-sans',
            letterSpacing: 'tracking-tight',
            case: 'none'
        };
    }
    
    if (['urban', 'minimal', 'vogue', 'editorial', 'glitch'].includes(t)) {
        return {
            heading: 'font-sans font-black',
            body: 'font-sans',
            letterSpacing: 'tracking-tighter',
            case: 'uppercase'
        };
    }
    
    if (['boho', 'romantic', 'garden', 'rustic', 'whimsical'].includes(t)) {
        return {
            heading: 'font-serif italic',
            body: 'font-serif',
            letterSpacing: 'tracking-wide',
            case: 'none'
        };
    }

    return {
        heading: 'font-serif',
        body: 'font-sans',
        letterSpacing: 'tracking-normal',
        case: 'none'
    };
}

/**
 * Layout configuration for Bento-style sections.
 */
export const BENTO_PRESETS = {
    details: [
        "md:col-span-2 md:row-span-2", // Large Date card
        "md:col-span-2",               // Wide Venue card
        "md:col-span-1",               // Small Dress Code
        "md:col-span-1"                // Small Socials
    ],
    gallery: [
        "md:col-span-2 md:row-span-2", // Featured
        "md:col-span-1 md:row-span-1", // Small
        "md:col-span-1 md:row-span-1", // Small
        "md:col-span-1 md:row-span-1", // Small
        "md:col-span-1 md:row-span-1", // Small
        "md:col-span-2 md:row-span-1", // Wide
    ]
};

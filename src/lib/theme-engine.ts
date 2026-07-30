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
    templateId: string;
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
    badgeStyleClass?: string;
    badgePrefix?: string;
    ornament: 'none' | 'floral' | 'botanical' | 'geometric' | 'editorial' | 'film' | 'tropical' | 'royal' | 'glitch' | 'celestial' | 'artdeco' | 'vintage' | 'sakura';
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
    const isDark = invert || mood === 'dark' || mood === 'cinematic' || ['urban', 'glitch', 'artdeco', 'luxury', 'midnight', 'celestial'].includes(t);
    const isSharp = mood === 'editorial' || ['artdeco', 'luxury', 'urban', 'glitch', 'vogue'].includes(t);
    const isVintage = mood === 'vintage' || ['rustic', 'boho', 'film', 'traditional'].includes(t);
    const isOrganic = mood === 'organic' || mood === 'destination' || mood === 'playful';

    const base = {
        mood,
        templateId: t,
        isDark,
        isSharp,
        isVintage,
        isOrganic,
        detailTitle: 'Wedding Details',
        timelineTitle: 'The Program',
        giftTitle: 'Gift Registry',
    };

    const getProfile = (): TemplateVisualProfile => {
        switch (t) {
            case 'artdeco':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#0d0d0d] text-[#d4af37]',
                    sectionStyle: { backgroundImage: 'radial-gradient(circle at center, #1a1600 0%, #080808 100%)' },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-none border-2 border-[#d4af37]/40 bg-black/85 shadow-[0_0_35px_rgba(212,175,55,0.15)] backdrop-blur-xl',
                    accentCardClass: 'rounded-none border-2 border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_50px_rgba(212,175,55,0.25)]',
                    imageFrameClass: 'rounded-none border-4 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)]',
                    eyebrowClass: 'text-[#d4af37] tracking-[0.5em] font-sans font-bold uppercase',
                    headingClass: 'font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#fceabb] to-[#d4af37] uppercase',
                    bodyClass: 'text-amber-100/80',
                    dividerClass: 'h-0.5 w-36 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent',
                    badgeStyleClass: 'border border-[#d4af37]/60 bg-black text-[#d4af37] px-4 py-1.5 text-[10px] tracking-[0.4em] font-bold uppercase',
                    badgePrefix: '1920S GATSBY N°',
                    ornament: 'artdeco',
                    galleryTitle: 'Deco Impressions',
                };

            case 'boho':
                return {
                    ...base,
                    cardStyleId: 'soft_parchment',
                    sectionClass: 'relative overflow-hidden bg-[#fcf8f1] text-[#5d2e0a]',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 10% 20%, ${motifColor}18, transparent 40%), linear-gradient(180deg, #fcf8f1 0%, #f4eae0 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-[2.5rem] border border-[#8b4513]/20 bg-[#fffdfa]/90 shadow-[0_20px_50px_rgba(93,46,10,0.08)] backdrop-blur-xl',
                    accentCardClass: 'rounded-[2.5rem] border-2 border-[#8b4513]/30 bg-[#8b4513]/10 shadow-[0_20px_50px_rgba(93,46,10,0.12)]',
                    imageFrameClass: 'rounded-[3rem] border-[10px] border-white shadow-[0_25px_60px_rgba(93,46,10,0.15)]',
                    eyebrowClass: 'text-[#8b4513] tracking-[0.35em] font-bold uppercase',
                    headingClass: 'font-serif italic text-[#5d2e0a]',
                    bodyClass: 'text-[#8b4513]/85',
                    dividerClass: 'h-px w-28 bg-[#8b4513]/30',
                    badgeStyleClass: 'rounded-full bg-[#8b4513]/15 text-[#5d2e0a] px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'WILD & FREE N°',
                    ornament: 'botanical',
                    galleryTitle: 'Bohemian Whispers',
                };

            case 'celestial':
                return {
                    ...base,
                    cardStyleId: 'borderless_glass',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#090d16] text-amber-100',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 50% 20%, ${motifColor}33, transparent 45%), radial-gradient(circle at 10% 80%, #1e1b4b 0%, #090d16 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-3xl border border-amber-300/25 bg-slate-950/70 shadow-[0_20px_70px_rgba(15,23,42,0.6)] backdrop-blur-2xl',
                    accentCardClass: 'rounded-3xl border border-amber-300/40 bg-amber-500/15 shadow-[0_20px_70px_rgba(217,119,6,0.25)]',
                    imageFrameClass: 'rounded-3xl border-4 border-amber-300/30 shadow-[0_25px_80px_rgba(217,119,6,0.25)]',
                    eyebrowClass: 'text-amber-300/90 tracking-[0.45em] uppercase font-bold',
                    headingClass: 'font-serif tracking-widest text-amber-200 uppercase',
                    bodyClass: 'text-slate-300/90',
                    dividerClass: 'h-px w-32 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent',
                    badgeStyleClass: 'rounded-full border border-amber-300/40 bg-slate-900/80 text-amber-300 px-4 py-1 text-[10px] tracking-[0.4em] font-bold uppercase',
                    badgePrefix: 'STARDUST SEC N°',
                    ornament: 'celestial',
                    galleryTitle: 'Celestial Memories',
                };

            case 'cinematic':
                return {
                    ...base,
                    cardStyleId: 'borderless_glass',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#0d0d10] text-white',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 80% 16%, ${motifColor}2E, transparent 34%), linear-gradient(180deg, #0d0d10 0%, #1f1712 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-2xl border border-white/15 bg-white/[0.06] shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl',
                    accentCardClass: 'rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_30px_90px_rgba(0,0,0,0.4)]',
                    imageFrameClass: 'rounded-xl border-[6px] border-black shadow-[0_28px_80px_rgba(0,0,0,0.6)] sepia-[0.1]',
                    eyebrowClass: 'text-amber-400/90 tracking-[0.45em] font-mono uppercase',
                    headingClass: 'font-serif tracking-tight text-white',
                    bodyClass: 'text-white/80',
                    dividerClass: 'h-px w-32 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent',
                    badgeStyleClass: 'border border-amber-500/40 bg-black/80 text-amber-400 font-mono px-3 py-1 text-[10px] tracking-[0.3em] uppercase',
                    badgePrefix: 'SCENE N°',
                    ornament: 'film',
                    galleryTitle: 'Film Stills',
                };

            case 'editorial':
                return {
                    ...base,
                    cardStyleId: 'editorial_rules',
                    sectionClass: 'relative overflow-hidden bg-white text-neutral-950',
                    sectionStyle: { backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(180deg, #fff 0%, ${motifColor}0A 100%)`, backgroundSize: '72px 72px, auto' },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-none border border-black bg-white shadow-[12px_12px_0_rgba(0,0,0,0.08)]',
                    accentCardClass: 'rounded-none border-2 border-black bg-black text-white shadow-[16px_16px_0_rgba(0,0,0,0.12)]',
                    imageFrameClass: 'rounded-none border-2 border-black grayscale hover:grayscale-0 shadow-[14px_14px_0_rgba(0,0,0,0.1)]',
                    eyebrowClass: 'text-black/70 tracking-[0.5em] font-mono uppercase font-bold',
                    headingClass: 'font-sans font-black uppercase tracking-tighter text-black',
                    bodyClass: 'text-black/80',
                    dividerClass: 'h-[2px] w-24 bg-black',
                    badgeStyleClass: 'border border-black bg-black text-white px-3 py-1 text-[10px] font-mono font-bold tracking-[0.3em] uppercase',
                    badgePrefix: 'ISSUE N°',
                    ornament: 'editorial',
                    galleryTitle: 'Photo Edit',
                };

            case 'elegance':
                return {
                    ...base,
                    cardStyleId: 'arch_panel',
                    sectionClass: 'relative overflow-hidden bg-[#fffaf8] text-rose-950',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 80% 20%, ${motifColor}18, transparent 40%), linear-gradient(180deg, #fffaf8 0%, #f7ebe6 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-[3rem] border border-rose-200/60 bg-white/85 shadow-[0_20px_60px_rgba(225,110,130,0.08)] backdrop-blur-2xl',
                    accentCardClass: 'rounded-[3rem] border border-rose-300/80 bg-rose-50 shadow-[0_20px_60px_rgba(225,110,130,0.12)]',
                    imageFrameClass: 'rounded-[3.5rem] border-[12px] border-white shadow-[0_25px_70px_rgba(225,110,130,0.15)]',
                    eyebrowClass: 'text-rose-500 tracking-[0.38em] font-medium uppercase',
                    headingClass: 'font-serif italic text-rose-950',
                    bodyClass: 'text-rose-900/80',
                    dividerClass: 'h-0.5 w-28 bg-gradient-to-r from-transparent via-rose-300 to-transparent',
                    badgeStyleClass: 'rounded-full bg-rose-100 text-rose-700 px-4 py-1 text-[10px] tracking-[0.3em] font-medium uppercase',
                    badgePrefix: 'ELEGANCE N°',
                    ornament: 'floral',
                    galleryTitle: 'Silken Moments',
                };

            case 'elopement':
                return {
                    ...base,
                    cardStyleId: 'soft_parchment',
                    sectionClass: 'relative overflow-hidden bg-[#f4f3ee] text-[#2b2d42]',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #f4f3ee 0%, #e0e1dd 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-2xl border border-stone-300 bg-[#faf9f6] shadow-[0_16px_45px_rgba(43,45,66,0.08)]',
                    accentCardClass: 'rounded-2xl border-2 border-emerald-800/30 bg-emerald-900/5 shadow-[0_16px_45px_rgba(43,45,66,0.12)]',
                    imageFrameClass: 'rounded-2xl border-[10px] border-white shadow-[0_20px_50px_rgba(43,45,66,0.14)]',
                    eyebrowClass: 'text-emerald-800 tracking-[0.4em] font-bold uppercase',
                    headingClass: 'font-serif tracking-wide text-stone-900',
                    bodyClass: 'text-stone-700',
                    dividerClass: 'h-px w-24 bg-stone-400',
                    badgeStyleClass: 'rounded-md bg-emerald-800 text-white px-3 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'ADVENTURE N°',
                    ornament: 'botanical',
                    galleryTitle: 'Wild Vows',
                };

            case 'film':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    isDark: false,
                    sectionClass: 'relative overflow-hidden bg-[#f7f4ed] text-stone-900',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #f7f4ed 0%, #ebe5d8 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-none border-2 border-stone-800 bg-[#fffdfa] shadow-[10px_10px_0_rgba(0,0,0,0.06)]',
                    accentCardClass: 'rounded-none border-2 border-amber-900 bg-amber-950/10 shadow-[10px_10px_0_rgba(0,0,0,0.1)]',
                    imageFrameClass: 'rounded-none border-[12px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] sepia-[0.2]',
                    eyebrowClass: 'text-amber-900 tracking-[0.4em] font-mono font-bold uppercase',
                    headingClass: 'font-serif tracking-normal text-stone-950',
                    bodyClass: 'text-stone-800',
                    dividerClass: 'h-0.5 w-28 bg-stone-800',
                    badgeStyleClass: 'border border-stone-800 bg-[#fffdfa] font-mono px-3 py-1 text-[10px] tracking-[0.3em] uppercase',
                    badgePrefix: '35MM FRAME N°',
                    ornament: 'film',
                    galleryTitle: 'Film Rolls',
                };

            case 'garden':
                return {
                    ...base,
                    cardStyleId: 'arch_panel',
                    sectionClass: 'relative overflow-hidden bg-[#f4f8f4] text-[#1b382b]',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 10% 10%, #2d5a4415, transparent 35%), linear-gradient(180deg, #f4f8f4 0%, #e5efe6 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-t-[4rem] rounded-b-2xl border border-emerald-800/15 bg-white/90 shadow-[0_20px_60px_rgba(27,56,43,0.08)] backdrop-blur-xl',
                    accentCardClass: 'rounded-t-[4rem] rounded-b-2xl border border-emerald-800/30 bg-emerald-900/10 shadow-[0_20px_60px_rgba(27,56,43,0.12)]',
                    imageFrameClass: 'rounded-t-[4.5rem] rounded-b-3xl border-[10px] border-white shadow-[0_25px_70px_rgba(27,56,43,0.14)]',
                    eyebrowClass: 'text-emerald-800 tracking-[0.38em] font-bold uppercase',
                    headingClass: 'font-serif italic text-emerald-950',
                    bodyClass: 'text-emerald-900/80',
                    dividerClass: 'h-px w-28 bg-emerald-800/30',
                    badgeStyleClass: 'rounded-full bg-emerald-800 text-emerald-50 px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'BOTANICAL N°',
                    ornament: 'botanical',
                    galleryTitle: 'Bloom Gallery',
                };

            case 'glitch':
                return {
                    ...base,
                    cardStyleId: 'borderless_glass',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#0a0a0f] text-cyan-200',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #0a0a0f 0%, #120024 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-none border-l-4 border-r-4 border-cyan-400/80 bg-black/80 shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-xl',
                    accentCardClass: 'rounded-none border-l-4 border-r-4 border-pink-500 bg-pink-950/20 shadow-[0_0_40px_rgba(236,72,153,0.3)]',
                    imageFrameClass: 'rounded-none border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.3)]',
                    eyebrowClass: 'text-cyan-400 font-mono tracking-[0.5em] uppercase font-bold',
                    headingClass: 'font-sans font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500',
                    bodyClass: 'text-cyan-100/80 font-mono',
                    dividerClass: 'h-0.5 w-32 bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400',
                    badgeStyleClass: 'border border-cyan-400 bg-black text-cyan-400 font-mono px-3 py-1 text-[10px] tracking-[0.4em] uppercase',
                    badgePrefix: 'SYNTH DATA // 0',
                    ornament: 'glitch',
                    galleryTitle: 'Cyber Album',
                };

            case 'luxury':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#0c0a09] text-amber-200',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at center, #2b1f0d 0%, #0c0a09 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-xl border border-amber-400/30 bg-stone-950/80 shadow-[0_24px_80px_rgba(217,119,6,0.15)] backdrop-blur-2xl',
                    accentCardClass: 'rounded-xl border-2 border-amber-400/60 bg-amber-500/15 shadow-[0_24px_80px_rgba(217,119,6,0.25)]',
                    imageFrameClass: 'rounded-xl border-4 border-amber-400/40 shadow-[0_30px_90px_rgba(217,119,6,0.3)]',
                    eyebrowClass: 'text-amber-400 tracking-[0.5em] font-serif uppercase font-bold',
                    headingClass: 'font-serif tracking-widest text-amber-100 uppercase',
                    bodyClass: 'text-amber-200/80',
                    dividerClass: 'h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent',
                    badgeStyleClass: 'border border-amber-400/60 bg-stone-900 text-amber-300 px-4 py-1 text-[10px] tracking-[0.4em] font-serif uppercase',
                    badgePrefix: 'COUTURE EDITION N°',
                    ornament: 'royal',
                    galleryTitle: 'Grand Portfolio',
                };

            case 'midnight':
                return {
                    ...base,
                    cardStyleId: 'borderless_glass',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#070b19] text-blue-100',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 70% 30%, ${motifColor}28, transparent 40%), linear-gradient(180deg, #070b19 0%, #03050c 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-3xl border border-blue-400/20 bg-slate-950/75 shadow-[0_20px_70px_rgba(7,11,25,0.7)] backdrop-blur-2xl',
                    accentCardClass: 'rounded-3xl border border-blue-400/40 bg-blue-600/15 shadow-[0_20px_70px_rgba(37,99,235,0.25)]',
                    imageFrameClass: 'rounded-3xl border-4 border-blue-400/30 shadow-[0_25px_80px_rgba(37,99,235,0.3)]',
                    eyebrowClass: 'text-blue-300 tracking-[0.45em] uppercase font-bold',
                    headingClass: 'font-serif tracking-wider text-blue-50',
                    bodyClass: 'text-blue-200/80',
                    dividerClass: 'h-px w-32 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent',
                    badgeStyleClass: 'rounded-full border border-blue-400/30 bg-slate-900 text-blue-300 px-4 py-1 text-[10px] tracking-[0.4em] uppercase font-bold',
                    badgePrefix: 'MIDNIGHT N°',
                    ornament: 'celestial',
                    galleryTitle: 'Moonlit Memories',
                };

            case 'minimal':
                return {
                    ...base,
                    cardStyleId: 'editorial_rules',
                    sectionClass: 'relative overflow-hidden bg-[#fafafa] text-neutral-900',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-none border border-neutral-200 bg-white shadow-none',
                    accentCardClass: 'rounded-none border border-neutral-400 bg-neutral-100 shadow-none',
                    imageFrameClass: 'rounded-none border border-neutral-300 shadow-none',
                    eyebrowClass: 'text-neutral-500 tracking-[0.45em] font-sans font-light uppercase',
                    headingClass: 'font-sans font-light tracking-wide text-neutral-900',
                    bodyClass: 'text-neutral-600',
                    dividerClass: 'h-px w-20 bg-neutral-300',
                    badgeStyleClass: 'border border-neutral-300 bg-white text-neutral-800 px-3 py-1 text-[10px] tracking-[0.3em] font-sans uppercase',
                    badgePrefix: 'SECTION 0',
                    ornament: 'none',
                    galleryTitle: 'Gallery',
                };

            case 'nordic':
                return {
                    ...base,
                    cardStyleId: 'borderless_glass',
                    sectionClass: 'relative overflow-hidden bg-[#f4f6f5] text-slate-800',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #f4f6f5 0%, #e5e9e6 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-3xl border border-slate-200 bg-white/85 shadow-[0_12px_40px_rgba(30,41,59,0.05)] backdrop-blur-xl',
                    accentCardClass: 'rounded-3xl border border-emerald-900/10 bg-slate-100 shadow-[0_12px_40px_rgba(30,41,59,0.07)]',
                    imageFrameClass: 'rounded-3xl border-8 border-white shadow-[0_20px_60px_rgba(30,41,59,0.08)]',
                    eyebrowClass: 'text-slate-500 tracking-[0.38em] font-bold uppercase',
                    headingClass: 'font-sans font-light tracking-wide text-slate-900',
                    bodyClass: 'text-slate-600',
                    dividerClass: 'h-px w-20 bg-slate-300',
                    badgeStyleClass: 'rounded-lg bg-slate-200 text-slate-700 px-3 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'FJORD SEC N°',
                    ornament: 'botanical',
                    galleryTitle: 'Fjord & Meadow',
                };

            case 'riviera':
                return {
                    ...base,
                    cardStyleId: 'borderless_glass',
                    sectionClass: 'relative overflow-hidden bg-[#fffdfa] text-cyan-950',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 90% 10%, #0284c718, transparent 40%), linear-gradient(180deg, #fffdfa 0%, #f0f9ff 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-3xl border border-sky-200/80 bg-white/95 shadow-[0_20px_60px_rgba(14,165,233,0.08)] backdrop-blur-xl',
                    accentCardClass: 'rounded-3xl border border-amber-300/40 bg-amber-500/10 shadow-[0_20px_60px_rgba(245,158,11,0.12)]',
                    imageFrameClass: 'rounded-3xl border-[10px] border-white shadow-[0_25px_70px_rgba(14,165,233,0.14)]',
                    eyebrowClass: 'text-sky-600 tracking-[0.35em] font-bold uppercase',
                    headingClass: 'font-serif italic tracking-normal text-sky-950',
                    bodyClass: 'text-sky-900/85',
                    dividerClass: 'h-0.5 w-28 bg-gradient-to-r from-sky-400 via-amber-400 to-sky-400',
                    badgeStyleClass: 'rounded-full bg-sky-100 text-sky-800 px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'AMALFI CHAPTER N°',
                    ornament: 'tropical',
                    galleryTitle: 'Amalfi Stories',
                };

            case 'romantic':
                return {
                    ...base,
                    cardStyleId: 'soft_parchment',
                    sectionClass: 'relative overflow-hidden bg-[#fff8f8] text-[#4a2e35]',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 10% 20%, ${motifColor}20, transparent 40%), linear-gradient(180deg, #fff8f8 0%, #faecee 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-[3rem] border border-rose-200 bg-white/90 shadow-[0_20px_60px_rgba(209,108,120,0.08)] backdrop-blur-xl',
                    accentCardClass: 'rounded-[3rem] border border-rose-300 bg-rose-50 shadow-[0_20px_60px_rgba(209,108,120,0.12)]',
                    imageFrameClass: 'rounded-[3.5rem] border-[12px] border-white shadow-[0_25px_70px_rgba(209,108,120,0.15)]',
                    eyebrowClass: 'text-rose-500 tracking-[0.35em] font-bold uppercase',
                    headingClass: 'font-serif italic text-[#4a2e35]',
                    bodyClass: 'text-[#4a2e35]/80',
                    dividerClass: 'h-0.5 w-28 bg-gradient-to-r from-transparent via-rose-300 to-transparent',
                    badgeStyleClass: 'rounded-full bg-rose-100 text-rose-700 px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'LOVE STORY N°',
                    ornament: 'floral',
                    galleryTitle: 'Cherished Moments',
                };

            case 'royal':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#14060b] text-amber-200',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 50% 20%, #3d0e1b 0%, #14060b 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-xl border-2 border-amber-400/40 bg-stone-950/85 shadow-[0_24px_80px_rgba(180,30,60,0.25)] backdrop-blur-xl',
                    accentCardClass: 'rounded-xl border-2 border-amber-400 bg-amber-500/20 shadow-[0_24px_80px_rgba(217,119,6,0.3)]',
                    imageFrameClass: 'rounded-xl border-[6px] border-amber-400/50 shadow-[0_30px_90px_rgba(180,30,60,0.35)]',
                    eyebrowClass: 'text-amber-400 tracking-[0.5em] font-serif uppercase font-bold',
                    headingClass: 'font-serif tracking-widest text-amber-100 uppercase',
                    bodyClass: 'text-amber-100/80',
                    dividerClass: 'h-0.5 w-36 bg-gradient-to-r from-transparent via-amber-400 to-transparent',
                    badgeStyleClass: 'border-2 border-amber-400/70 bg-stone-900 text-amber-300 px-4 py-1.5 text-[10px] tracking-[0.4em] font-serif uppercase font-bold',
                    badgePrefix: 'ROYAL DECREE N°',
                    ornament: 'royal',
                    galleryTitle: 'Regal Gallery',
                };

            case 'rustic':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    isVintage: true,
                    sectionClass: 'relative overflow-hidden bg-[#f7f2ea] text-[#4a3b32]',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #f7f2ea 0%, #eae0d0 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-lg border-2 border-dashed border-[#8c6d58]/40 bg-[#fffbf5] shadow-[0_16px_40px_rgba(74,59,50,0.08)]',
                    accentCardClass: 'rounded-lg border-2 border-[#8c6d58] bg-[#8c6d58]/10 shadow-[0_16px_40px_rgba(74,59,50,0.12)]',
                    imageFrameClass: 'rounded-lg border-[12px] border-[#ede3d4] shadow-[0_20px_50px_rgba(74,59,50,0.15)] sepia-[0.15]',
                    eyebrowClass: 'text-[#8c6d58] tracking-[0.4em] font-bold uppercase',
                    headingClass: 'font-serif text-[#4a3b32]',
                    bodyClass: 'text-[#4a3b32]/85',
                    dividerClass: 'h-px w-28 bg-dashed border-t border-[#8c6d58]/50',
                    badgeStyleClass: 'rounded border border-[#8c6d58] bg-[#fffbf5] text-[#4a3b32] px-3 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'COUNTRYSIDE N°',
                    ornament: 'vintage',
                    galleryTitle: 'Barn & Field',
                };

            case 'sakura':
                return {
                    ...base,
                    cardStyleId: 'soft_parchment',
                    sectionClass: 'relative overflow-hidden bg-[#fff7f9] text-[#59323b]',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 80% 20%, #fbcfe830, transparent 40%), linear-gradient(180deg, #fff7f9 0%, #fce7f0 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-[3rem] border border-pink-200 bg-white/90 shadow-[0_20px_60px_rgba(244,114,182,0.08)] backdrop-blur-xl',
                    accentCardClass: 'rounded-[3rem] border border-pink-300 bg-pink-50 shadow-[0_20px_60px_rgba(244,114,182,0.12)]',
                    imageFrameClass: 'rounded-[3.5rem] border-[12px] border-white shadow-[0_25px_70px_rgba(244,114,182,0.15)]',
                    eyebrowClass: 'text-pink-500 tracking-[0.4em] font-bold uppercase',
                    headingClass: 'font-serif italic text-[#59323b]',
                    bodyClass: 'text-[#59323b]/80',
                    dividerClass: 'h-0.5 w-28 bg-gradient-to-r from-transparent via-pink-300 to-transparent',
                    badgeStyleClass: 'rounded-full bg-pink-100 text-pink-700 px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'BLOSSOM N°',
                    ornament: 'sakura',
                    galleryTitle: 'Blossom Memories',
                };

            case 'timeline':
                return {
                    ...base,
                    cardStyleId: 'editorial_rules',
                    sectionClass: 'relative overflow-hidden bg-[#fcfcfc] text-neutral-900',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #fcfcfc 0%, #f3f3f3 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-xl border border-neutral-300 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]',
                    accentCardClass: 'rounded-xl border-2 border-indigo-600 bg-indigo-50 shadow-[0_10px_30px_rgba(79,70,229,0.1)]',
                    imageFrameClass: 'rounded-xl border-4 border-white shadow-[0_15px_40px_rgba(0,0,0,0.08)]',
                    eyebrowClass: 'text-indigo-600 tracking-[0.4em] font-mono font-bold uppercase',
                    headingClass: 'font-sans font-bold tracking-tight text-neutral-900',
                    bodyClass: 'text-neutral-700',
                    dividerClass: 'h-px w-24 bg-indigo-600/40',
                    badgeStyleClass: 'rounded-full bg-indigo-600 text-white font-mono px-3 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'TIMELINE STEP N°',
                    ornament: 'editorial',
                    galleryTitle: 'Chronological Gallery',
                };

            case 'traditional':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    isVintage: true,
                    sectionClass: 'relative overflow-hidden bg-[#fcf9f2] text-[#3b2d22]',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #fcf9f2 0%, #efe7d8 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-sm border-2 border-[#b8977e]/50 bg-[#fffcf7] shadow-[0_18px_50px_rgba(59,45,34,0.09)]',
                    accentCardClass: 'rounded-sm border-4 border-double border-[#b8977e] bg-[#b8977e]/10 shadow-[0_18px_50px_rgba(59,45,34,0.14)]',
                    imageFrameClass: 'rounded-sm border-[14px] border-[#f4ebdc] shadow-[0_22px_60px_rgba(59,45,34,0.16)] sepia-[0.1]',
                    eyebrowClass: 'text-[#8f6d53] tracking-[0.4em] font-serif font-bold uppercase',
                    headingClass: 'font-serif text-[#3b2d22]',
                    bodyClass: 'text-[#3b2d22]/85',
                    dividerClass: 'h-0.5 w-32 bg-gradient-to-r from-transparent via-[#b8977e] to-transparent',
                    badgeStyleClass: 'border-2 border-[#b8977e] bg-[#fffcf7] text-[#3b2d22] px-4 py-1 text-[10px] tracking-[0.3em] font-serif font-bold uppercase',
                    badgePrefix: 'HERITAGE N°',
                    ornament: 'vintage',
                    galleryTitle: 'Family Keepsakes',
                };

            case 'tropical':
                return {
                    ...base,
                    cardStyleId: 'soft_parchment',
                    sectionClass: 'relative overflow-hidden bg-[#f2f9f5] text-[#133c2e]',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 90% 20%, #10b98115, transparent 40%), linear-gradient(180deg, #f2f9f5 0%, #e1f2e8 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-[2.5rem] border border-emerald-300/60 bg-white/90 shadow-[0_20px_60px_rgba(19,60,46,0.08)] backdrop-blur-xl',
                    accentCardClass: 'rounded-[2.5rem] border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_20px_60px_rgba(19,60,46,0.12)]',
                    imageFrameClass: 'rounded-[3rem] border-[10px] border-white shadow-[0_25px_70px_rgba(19,60,46,0.14)]',
                    eyebrowClass: 'text-emerald-600 tracking-[0.4em] font-bold uppercase',
                    headingClass: 'font-serif italic text-[#133c2e]',
                    bodyClass: 'text-[#133c2e]/85',
                    dividerClass: 'h-0.5 w-28 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400',
                    badgeStyleClass: 'rounded-full bg-emerald-600 text-white px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'ISLAND N°',
                    ornament: 'tropical',
                    galleryTitle: 'Tropical Escape',
                };

            case 'urban':
                return {
                    ...base,
                    cardStyleId: 'editorial_rules',
                    isDark: true,
                    sectionClass: 'relative overflow-hidden bg-[#121316] text-slate-100',
                    sectionStyle: { backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(180deg, #121316 0%, #1c1e24 100%)`, backgroundSize: '40px 40px, auto' },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-none border border-slate-700 bg-slate-900/90 shadow-[8px_8px_0_rgba(0,0,0,0.5)]',
                    accentCardClass: 'rounded-none border-2 border-amber-400 bg-amber-400/10 shadow-[10px_10px_0_rgba(245,158,11,0.2)]',
                    imageFrameClass: 'rounded-none border-2 border-slate-600 shadow-[10px_10px_0_rgba(0,0,0,0.5)]',
                    eyebrowClass: 'text-amber-400 tracking-[0.45em] font-mono font-bold uppercase',
                    headingClass: 'font-sans font-black uppercase tracking-tighter text-white',
                    bodyClass: 'text-slate-300',
                    dividerClass: 'h-1 w-24 bg-amber-400',
                    badgeStyleClass: 'border border-amber-400 bg-amber-400 text-slate-950 font-mono font-bold px-3 py-1 text-[10px] tracking-[0.3em] uppercase',
                    badgePrefix: 'CITY ZONE // 0',
                    ornament: 'editorial',
                    galleryTitle: 'Metro Views',
                };

            case 'vintage':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    isVintage: true,
                    sectionClass: 'relative overflow-hidden bg-[#fbf5ea] text-[#4a3a31]',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #fbf5ea 0%, #efe1cd 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-sm border border-primary/30 bg-[#fffaf0]/90 shadow-[0_20px_60px_rgba(74,58,49,0.12)] ring-4 ring-primary/5',
                    accentCardClass: 'rounded-sm border-4 border-double border-primary/50 bg-[#fffaf0] shadow-[0_20px_70px_rgba(74,58,49,0.16)]',
                    imageFrameClass: 'rounded-sm border-[16px] border-[#f5ead8] shadow-[0_24px_70px_rgba(74,58,49,0.18)] sepia-[0.2]',
                    eyebrowClass: 'text-primary tracking-[0.4em] font-serif font-bold uppercase',
                    headingClass: 'font-serif tracking-tight text-[#4a3a31]',
                    bodyClass: 'text-[#4a3a31]/80',
                    dividerClass: 'h-px w-28 bg-gradient-to-r from-transparent via-primary/60 to-transparent',
                    badgeStyleClass: 'border-2 border-primary/40 bg-[#fffaf0] text-[#4a3a31] font-serif px-3 py-1 text-[10px] tracking-[0.3em] uppercase',
                    badgePrefix: 'KEEPSAKE N°',
                    ornament: 'vintage',
                    galleryTitle: 'Keepsake Gallery',
                };

            case 'vogue':
                return {
                    ...base,
                    cardStyleId: 'editorial_rules',
                    isDark: false,
                    sectionClass: 'relative overflow-hidden bg-[#faf7f5] text-black',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #faf7f5 0%, #f2ece8 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-none border-b-2 border-black bg-white/80 shadow-none py-6',
                    accentCardClass: 'rounded-none border-y-2 border-black bg-black text-white shadow-none py-6',
                    imageFrameClass: 'rounded-none border border-black/20 grayscale hover:grayscale-0 shadow-2xl',
                    eyebrowClass: 'text-black tracking-[0.5em] font-sans font-black uppercase',
                    headingClass: 'font-serif font-normal uppercase tracking-widest text-black',
                    bodyClass: 'text-black/80',
                    dividerClass: 'h-0.5 w-32 bg-black',
                    badgeStyleClass: 'border-b-2 border-black text-black font-sans font-black px-4 py-1 text-[10px] tracking-[0.4em] uppercase',
                    badgePrefix: 'VOGUE EDIT // 0',
                    ornament: 'editorial',
                    galleryTitle: 'Editorial Runway',
                };

            case 'whimsical':
                return {
                    ...base,
                    cardStyleId: 'soft_parchment',
                    sectionClass: 'relative overflow-hidden bg-[#faf5ff] text-[#4c1d95]',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 50% 20%, #c084fc25, transparent 40%), linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-[3rem] border border-purple-200/80 bg-white/90 shadow-[0_20px_60px_rgba(192,132,252,0.12)] backdrop-blur-xl',
                    accentCardClass: 'rounded-[3rem] border border-purple-300 bg-purple-50 shadow-[0_20px_60px_rgba(192,132,252,0.18)]',
                    imageFrameClass: 'rounded-[3.5rem] border-[12px] border-white shadow-[0_25px_70px_rgba(192,132,252,0.2)]',
                    eyebrowClass: 'text-purple-600 tracking-[0.4em] font-bold uppercase',
                    headingClass: 'font-serif italic text-[#4c1d95]',
                    bodyClass: 'text-[#4c1d95]/80',
                    dividerClass: 'h-0.5 w-28 bg-gradient-to-r from-transparent via-purple-300 to-transparent',
                    badgeStyleClass: 'rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'FAIRYTALE N°',
                    ornament: 'celestial',
                    galleryTitle: 'Wonderland',
                };

            case 'rsvpfocus':
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    sectionClass: 'relative overflow-hidden bg-[#f8fafc] text-slate-900',
                    sectionStyle: { backgroundImage: `linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-2xl border-2 border-slate-300 bg-white shadow-xl',
                    accentCardClass: 'rounded-2xl border-2 border-primary bg-primary/10 shadow-2xl',
                    imageFrameClass: 'rounded-2xl border-4 border-white shadow-xl',
                    eyebrowClass: 'text-primary tracking-[0.4em] font-bold uppercase',
                    headingClass: 'font-sans font-extrabold text-slate-900',
                    bodyClass: 'text-slate-700',
                    dividerClass: 'h-1 w-24 bg-primary',
                    badgeStyleClass: 'rounded-lg bg-primary text-white px-3 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'RSVP ACTION N°',
                    ornament: 'none',
                    galleryTitle: 'Event Highlights',
                };

            default:
                return {
                    ...base,
                    cardStyleId: 'cards_bordered',
                    sectionClass: 'relative overflow-hidden text-[#4A4444]',
                    sectionStyle: { backgroundImage: `radial-gradient(circle at 15% 12%, ${motifColor}14, transparent 30%), linear-gradient(180deg, #fffdfb 0%, #f8eeea 100%)` },
                    containerClass: 'relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8',
                    cardClass: 'rounded-[2rem] md:rounded-[3rem] border border-white/70 bg-white/70 shadow-[0_20px_60px_rgba(58,42,45,0.08)] backdrop-blur-xl',
                    accentCardClass: 'rounded-[2rem] md:rounded-[3rem] border border-primary/20 bg-white/85 shadow-[0_20px_60px_rgba(58,42,45,0.12)]',
                    imageFrameClass: 'rounded-[2rem] md:rounded-[3rem] border-[12px] border-white shadow-[0_25px_70px_rgba(58,42,45,0.14)]',
                    eyebrowClass: 'text-primary tracking-[0.36em] font-bold uppercase',
                    headingClass: 'font-serif tracking-tight text-[#4A4444]',
                    bodyClass: 'text-[#4A4444]/80',
                    dividerClass: 'h-px w-24 bg-gradient-to-r from-transparent via-primary/45 to-transparent',
                    badgeStyleClass: 'rounded-full bg-primary/10 text-primary px-4 py-1 text-[10px] tracking-[0.3em] font-bold uppercase',
                    badgePrefix: 'CHAPTER N°',
                    ornament: 'floral',
                    galleryTitle: 'Our Gallery',
                };
        }
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

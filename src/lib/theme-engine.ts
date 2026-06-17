import type { CSSProperties } from 'react';

/**
 * Theme Engine Utility
 * 
 * Provides sophisticated color derivation, typography pairings, 
 * and layout presets to elevate standard template motif colors 
 * into high-end editorial palettes.
 */

export type TemplateCategory = 'classic' | 'modern' | 'romantic' | 'boho' | 'urban' | 'vintage';
export type TemplateMood =
    | 'classic'
    | 'romantic'
    | 'editorial'
    | 'dark'
    | 'organic'
    | 'vintage'
    | 'destination'
    | 'cinematic'
    | 'playful';

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

export interface TemplateVisualProfile {
    mood: TemplateMood;
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

    if (['royal', 'midnight', 'artdeco', 'luxury'].includes(t)) return 'dark';
    if (['cinematic', 'film'].includes(t)) return 'cinematic';
    if (['editorial', 'minimal', 'vogue', 'urban', 'glitch', 'timeline', 'rsvpfocus'].includes(t)) return 'editorial';
    if (['boho', 'garden', 'rustic', 'sakura'].includes(t)) return 'organic';
    if (['tropical', 'elopement'].includes(t)) return 'destination';
    if (['vintage', 'traditional'].includes(t)) return 'vintage';
    if (['whimsical', 'romantic'].includes(t)) return 'playful';

    return 'classic';
}

export function getTemplateVisualProfile(template?: string, motifColor = '#D16C78', invert = false): TemplateVisualProfile {
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

    if (mood === 'dark') {
        return {
            ...base,
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

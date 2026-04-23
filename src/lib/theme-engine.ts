/**
 * Theme Engine Utility
 * 
 * Provides sophisticated color derivation, typography pairings, 
 * and layout presets to elevate standard template motif colors 
 * into high-end editorial palettes.
 */

export type TemplateCategory = 'classic' | 'modern' | 'romantic' | 'boho' | 'urban' | 'vintage';

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

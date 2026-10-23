import type { CSSProperties, ReactNode } from 'react';
import {
    Cormorant_Garamond,
    Cinzel,
    Great_Vibes,
    Pinyon_Script,
    Bodoni_Moda,
    Libre_Baskerville,
    Plus_Jakarta_Sans,
} from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
    variable: '--font-cormorant-loaded',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    display: 'swap',
});

const cinzel = Cinzel({
    variable: '--font-cinzel-loaded',
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    display: 'swap',
});

const greatVibes = Great_Vibes({
    variable: '--font-great-vibes',
    subsets: ['latin'],
    weight: '400',
    display: 'swap',
});

const pinyonScript = Pinyon_Script({
    variable: '--font-pinyon-loaded',
    subsets: ['latin'],
    weight: '400',
    display: 'swap',
});

const bodoniModa = Bodoni_Moda({
    variable: '--font-bodoni-loaded',
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    style: ['normal', 'italic'],
    display: 'swap',
});

const libreBaskerville = Libre_Baskerville({
    variable: '--font-libre-loaded',
    subsets: ['latin'],
    weight: ['400', '700'],
    style: ['normal', 'italic'],
    display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: '--font-jakarta-loaded',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

const LOADED_FONT_CLASSNAMES = [
    cormorantGaramond.variable,
    cinzel.variable,
    greatVibes.variable,
    pinyonScript.variable,
    bodoniModa.variable,
    libreBaskerville.variable,
    plusJakartaSans.variable,
].join(' ');

type WeddingFontProviderProps = {
    children: ReactNode;
    fontStyle?: string;
    logoFont?: string;
};

const SERIF_STACK = 'var(--font-playfair), Georgia, serif';
const CORMORANT_STACK = 'var(--font-cormorant-loaded), var(--font-playfair), Georgia, serif';
const CINZEL_STACK = 'var(--font-cinzel-loaded), var(--font-playfair), Georgia, serif';
const BODONI_STACK = 'var(--font-bodoni-loaded), var(--font-playfair), "Times New Roman", serif';
const LIBRE_STACK = 'var(--font-libre-loaded), var(--font-playfair), Georgia, serif';
const SANS_STACK = 'var(--font-inter), system-ui, sans-serif';
const JAKARTA_STACK = 'var(--font-jakarta-loaded), var(--font-inter), system-ui, sans-serif';
const MODERN_STACK = 'var(--font-montserrat), var(--font-inter), system-ui, sans-serif';
export const SCRIPT_STACK = 'var(--font-great-vibes), var(--font-pinyon-loaded), "Great Vibes", "Pinyon Script", cursive';
const PINYON_STACK = 'var(--font-pinyon-loaded), var(--font-great-vibes), "Pinyon Script", "Great Vibes", cursive';
const DISPLAY_STACK = 'var(--font-bodoni-loaded), var(--font-playfair), "Times New Roman", serif';

export type FontVariableMap = Record<string, string>;

export const BASE_FONT_VARIABLES: FontVariableMap = {
    '--font-cormorant': CORMORANT_STACK,
    '--font-eb': CORMORANT_STACK,
    '--font-eb-garamond': CORMORANT_STACK,
    '--font-bodoni': BODONI_STACK,
    '--font-prata': DISPLAY_STACK,
    '--font-lora': LIBRE_STACK,
    '--font-cardo': CORMORANT_STACK,
    '--font-libre': LIBRE_STACK,
    '--font-marcellus': CINZEL_STACK,
    '--font-forum': CINZEL_STACK,
    '--font-alice': CORMORANT_STACK,
    '--font-spectral': CORMORANT_STACK,
    '--font-cinzel': CINZEL_STACK,
    '--font-abril': DISPLAY_STACK,
    '--font-cormorant-upright': CORMORANT_STACK,
    '--font-old-standard': LIBRE_STACK,
    '--font-caslon': LIBRE_STACK,
    '--font-quattrocento': CINZEL_STACK,
    '--font-fraunces': DISPLAY_STACK,
    '--font-cormorant-sc': CINZEL_STACK,
    '--font-tenor': JAKARTA_STACK,
    '--font-questrial': JAKARTA_STACK,
    '--font-syne': MODERN_STACK,
    '--font-fauna': LIBRE_STACK,
    '--font-josefin': MODERN_STACK,
    '--font-outfit': JAKARTA_STACK,
    '--font-space': MODERN_STACK,
    '--font-script': SCRIPT_STACK,
    '--font-alex': SCRIPT_STACK,
    '--font-allura': SCRIPT_STACK,
    '--font-arizonia': SCRIPT_STACK,
    '--font-dancing': SCRIPT_STACK,
    '--font-italianno': PINYON_STACK,
    '--font-pinyon': PINYON_STACK,
    '--font-sacramento': SCRIPT_STACK,
    '--font-tangerine': PINYON_STACK,
    '--font-parisienne': SCRIPT_STACK,
    '--font-mrs-saint': PINYON_STACK,
    '--font-monsieur': PINYON_STACK,
    '--font-homemade': SCRIPT_STACK,
    '--font-herr': PINYON_STACK,
    '--font-lavishly': SCRIPT_STACK,
} as const;

export const FONT_STYLE_OVERRIDES: Record<string, FontVariableMap> = {
    Classic: {
        '--font-serif': CINZEL_STACK,
        '--font-sans': CORMORANT_STACK,
    },
    Traditional: {
        '--font-serif': CORMORANT_STACK,
        '--font-sans': SANS_STACK,
    },
    Editorial: {
        '--font-serif': LIBRE_STACK,
        '--font-sans': SANS_STACK,
    },
    Modern: {
        '--font-serif': MODERN_STACK,
        '--font-sans': SANS_STACK,
    },
    Clean: {
        '--font-serif': JAKARTA_STACK,
        '--font-sans': SANS_STACK,
    },
    Bold: {
        '--font-serif': MODERN_STACK,
        '--font-sans': SANS_STACK,
    },
    Romantic: {
        '--font-serif': SCRIPT_STACK,
        '--font-sans': DISPLAY_STACK,
    },
    Calligraphy: {
        '--font-serif': SCRIPT_STACK,
        '--font-sans': DISPLAY_STACK,
    },
    PremiumScript: {
        '--font-serif': PINYON_STACK,
        '--font-sans': SERIF_STACK,
    },
    SoftScript: {
        '--font-serif': SCRIPT_STACK,
        '--font-sans': CORMORANT_STACK,
    },
    Whimsy: {
        '--font-serif': SCRIPT_STACK,
        '--font-sans': SANS_STACK,
    },
    Handwritten: {
        '--font-serif': SCRIPT_STACK,
        '--font-sans': MODERN_STACK,
    },
    MinimalScript: {
        '--font-serif': SCRIPT_STACK,
        '--font-sans': SANS_STACK,
    },
    Luxe: {
        '--font-serif': BODONI_STACK,
        '--font-sans': SANS_STACK,
    },
    VogueEdit: {
        '--font-serif': BODONI_STACK,
        '--font-sans': JAKARTA_STACK,
    },
};

export function logoFontVariable(font?: string): FontVariableMap {
    if (!font) return {};
    return {
        [`--font-${font.toLowerCase()}`]: /script|brush|calligraphy|allura|alex|pinyon|sacramento|tangerine|paris|lavish/i.test(font)
            ? SCRIPT_STACK
            : DISPLAY_STACK,
    };
}

export function getWeddingFontStyleVariables(fontStyle?: string, logoFont?: string): FontVariableMap {
    const overrideKey = fontStyle
        ? Object.keys(FONT_STYLE_OVERRIDES).find((k) => k.toLowerCase() === fontStyle.toLowerCase())
        : undefined;
    return {
        ...BASE_FONT_VARIABLES,
        ...(overrideKey ? FONT_STYLE_OVERRIDES[overrideKey] : null),
        ...logoFontVariable(logoFont),
    };
}

export default function WeddingFontProvider({ children, fontStyle, logoFont }: WeddingFontProviderProps) {
    const style = {
        '--font-serif': SERIF_STACK,
        '--font-sans': SANS_STACK,
        ...getWeddingFontStyleVariables(fontStyle, logoFont),
    } as CSSProperties;

    return <div className={LOADED_FONT_CLASSNAMES} style={style}>{children}</div>;
}

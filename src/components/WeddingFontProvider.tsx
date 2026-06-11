import type { CSSProperties, ReactNode } from 'react';

type WeddingFontProviderProps = {
    children: ReactNode;
    fontStyle?: string;
    logoFont?: string;
};

const SERIF_STACK = 'var(--font-playfair), Georgia, serif';
const SANS_STACK = 'var(--font-inter), system-ui, sans-serif';
const MODERN_STACK = 'var(--font-montserrat), var(--font-inter), system-ui, sans-serif';
const SCRIPT_STACK = '"Brush Script MT", "Segoe Script", cursive';
const DISPLAY_STACK = 'var(--font-playfair), "Times New Roman", serif';

type FontVariableMap = Record<string, string>;

const BASE_FONT_VARIABLES: FontVariableMap = {
    '--font-cormorant': SERIF_STACK,
    '--font-eb-garamond': SERIF_STACK,
    '--font-bodoni': DISPLAY_STACK,
    '--font-prata': DISPLAY_STACK,
    '--font-lora': SERIF_STACK,
    '--font-cardo': SERIF_STACK,
    '--font-libre': SERIF_STACK,
    '--font-marcellus': DISPLAY_STACK,
    '--font-forum': DISPLAY_STACK,
    '--font-alice': DISPLAY_STACK,
    '--font-spectral': SERIF_STACK,
    '--font-cinzel': DISPLAY_STACK,
    '--font-abril': DISPLAY_STACK,
    '--font-cormorant-upright': SERIF_STACK,
    '--font-old-standard': SERIF_STACK,
    '--font-caslon': SERIF_STACK,
    '--font-quattrocento': SERIF_STACK,
    '--font-fraunces': DISPLAY_STACK,
    '--font-cormorant-sc': DISPLAY_STACK,
    '--font-tenor': SANS_STACK,
    '--font-questrial': SANS_STACK,
    '--font-syne': MODERN_STACK,
    '--font-fauna': SERIF_STACK,
    '--font-josefin': MODERN_STACK,
    '--font-outfit': SANS_STACK,
    '--font-space': MODERN_STACK,
    '--font-script': SCRIPT_STACK,
    '--font-alex': SCRIPT_STACK,
    '--font-allura': SCRIPT_STACK,
    '--font-arizonia': SCRIPT_STACK,
    '--font-dancing': SCRIPT_STACK,
    '--font-italianno': SCRIPT_STACK,
    '--font-pinyon': SCRIPT_STACK,
    '--font-sacramento': SCRIPT_STACK,
    '--font-tangerine': SCRIPT_STACK,
    '--font-parisienne': SCRIPT_STACK,
    '--font-mrs-saint': SCRIPT_STACK,
    '--font-monsieur': SCRIPT_STACK,
    '--font-homemade': SCRIPT_STACK,
    '--font-herr': SCRIPT_STACK,
    '--font-lavishly': SCRIPT_STACK,
} as const;

const FONT_STYLE_OVERRIDES: Record<string, FontVariableMap> = {
    Modern: {
        '--font-serif': MODERN_STACK,
        '--font-sans': SANS_STACK,
    },
    Clean: {
        '--font-serif': SANS_STACK,
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
    SoftScript: {
        '--font-serif': SCRIPT_STACK,
        '--font-sans': SERIF_STACK,
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
        '--font-serif': DISPLAY_STACK,
        '--font-sans': SANS_STACK,
    },
    VogueEdit: {
        '--font-serif': DISPLAY_STACK,
        '--font-sans': SANS_STACK,
    },
};

function logoFontVariable(font?: string) {
    if (!font) return {};
    return {
        [`--font-${font.toLowerCase()}`]: /script|brush|calligraphy|allura|alex|pinyon|sacramento|tangerine|paris|lavish/i.test(font)
            ? SCRIPT_STACK
            : DISPLAY_STACK,
    };
}

export default function WeddingFontProvider({ children, fontStyle, logoFont }: WeddingFontProviderProps) {
    const style = {
        ...BASE_FONT_VARIABLES,
        '--font-serif': SERIF_STACK,
        '--font-sans': SANS_STACK,
        ...(fontStyle ? FONT_STYLE_OVERRIDES[fontStyle] : null),
        ...logoFontVariable(logoFont),
    } as CSSProperties;

    return <div style={style}>{children}</div>;
}

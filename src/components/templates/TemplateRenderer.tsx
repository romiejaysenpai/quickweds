'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties, ComponentType } from 'react';

import type { TemplateProps, Wedding } from '@/types/wedding';

const PremiumTemplate = dynamic(() => import('./PremiumTemplate'));

export type TemplateId = keyof typeof TEMPLATE_COMPONENTS;
export type ThemeFontVars = Record<'--font-serif' | '--font-sans', string>;
export type WeddingPageStyle = CSSProperties & Record<'--primary', string> & ThemeFontVars;

export const TEMPLATE_COMPONENTS = {
    classic: dynamic(() => import('./ClassicTemplate')),
    minimal: dynamic(() => import('./MinimalTemplate')),
    vintage: dynamic(() => import('./VintageTemplate')),
    editorial: dynamic(() => import('./EditorialTemplate')),
    royal: dynamic(() => import('./RoyalTemplate')),
    whimsical: dynamic(() => import('./WhimsicalTemplate')),
    urban: dynamic(() => import('./UrbanTemplate')),
    tropical: dynamic(() => import('./TropicalTemplate')),
    midnight: dynamic(() => import('./MidnightTemplate')),
    sakura: dynamic(() => import('./SakuraTemplate')),
    vogue: dynamic(() => import('./VogueTemplate')),
    rustic: dynamic(() => import('./RusticTemplate')),
    film: dynamic(() => import('./FilmTemplate')),
    glitch: dynamic(() => import('./GlitchTemplate')),
    garden: dynamic(() => import('./GardenTemplate')),
    romantic: dynamic(() => import('./RomanticTemplate')),
    luxury: dynamic(() => import('./LuxuryTemplate')),
    elopement: dynamic(() => import('./ElopementTemplate')),
    traditional: dynamic(() => import('./TraditionalTemplate')),
    timeline: dynamic(() => import('./TimelineTemplate')),
    rsvpfocus: dynamic(() => import('./RSVPFocusTemplate')),
    cinematic: dynamic(() => import('./CinematicTemplate')),
    elegance: dynamic(() => import('./EleganceTemplate')),
    artdeco: dynamic(() => import('./ArtDecoTemplate')),
    boho: dynamic(() => import('./BohoTemplate')),
    nordic: dynamic(() => import('./NordicTemplate')),
    celestial: dynamic(() => import('./CelestialTemplate')),
    riviera: dynamic(() => import('./RivieraTemplate')),
    heirloom: PremiumTemplate,
    estate: PremiumTemplate,
    moonlit: PremiumTemplate,
    saffron: PremiumTemplate,
    'cinema-noir': PremiumTemplate,
    'modern-vow': PremiumTemplate,
    atelier: PremiumTemplate,
    wildflower: PremiumTemplate,
    regency: PremiumTemplate,
    lovescript: PremiumTemplate,
    'coastal-vow': PremiumTemplate,
    'orchid-noir': PremiumTemplate,
    papercut: PremiumTemplate,
    'marigold-house': PremiumTemplate,
    'the-weekend': PremiumTemplate,
    'winter-rose': PremiumTemplate,
    gallery: PremiumTemplate,
    'petal-note': PremiumTemplate,
    'sunset-ceremony': PremiumTemplate,
    // 20 New Trending Styles
    kinfolk: PremiumTemplate,
    neobrutalist: PremiumTemplate,
    highfashion: PremiumTemplate,
    glassbotanical: PremiumTemplate,
    cyberromantic: PremiumTemplate,
    amalfi: PremiumTemplate,
    japandi: PremiumTemplate,
    desertmirage: PremiumTemplate,
    chateau: PremiumTemplate,
    travelogue: PremiumTemplate,
    gothicnoir: PremiumTemplate,
    discofever: PremiumTemplate,
    baroque: PremiumTemplate,
    lofifilm: PremiumTemplate,
    stargazer: PremiumTemplate,
    cottagecore: PremiumTemplate,
    bauhaus: PremiumTemplate,
    nordicdrift: PremiumTemplate,
    sunsetriviera: PremiumTemplate,
    storybook: PremiumTemplate,
} satisfies Record<string, ComponentType<TemplateProps>>;

const FONT_VARIABLES: Record<string, ThemeFontVars> = {
    Elegant: { '--font-serif': 'var(--font-playfair)', '--font-sans': 'var(--font-inter)' },
    Classic: { '--font-serif': 'var(--font-cinzel)', '--font-sans': 'var(--font-cormorant)' },
    Modern: { '--font-serif': 'var(--font-montserrat)', '--font-sans': 'var(--font-inter)' },
    Romantic: { '--font-serif': 'var(--font-script)', '--font-sans': 'var(--font-playfair)' },
    Traditional: { '--font-serif': 'var(--font-cormorant)', '--font-sans': 'var(--font-inter)' },
    Renaissance: { '--font-serif': 'var(--font-eb)', '--font-sans': 'var(--font-cormorant)' },
    Luxe: { '--font-serif': 'var(--font-bodoni)', '--font-sans': 'var(--font-inter)' },
    Poetic: { '--font-serif': 'var(--font-prata)', '--font-sans': 'var(--font-lora)' },
    Storyteller: { '--font-serif': 'var(--font-lora)', '--font-sans': 'var(--font-inter)' },
    Academic: { '--font-serif': 'var(--font-cardo)', '--font-sans': 'var(--font-eb)' },
    Editorial: { '--font-serif': 'var(--font-libre)', '--font-sans': 'var(--font-inter)' },
    Deco: { '--font-serif': 'var(--font-marcellus)', '--font-sans': 'var(--font-montserrat)' },
    Ancient: { '--font-serif': 'var(--font-forum)', '--font-sans': 'var(--font-cardo)' },
    Fairytale: { '--font-serif': 'var(--font-alice)', '--font-sans': 'var(--font-montserrat)' },
    Artistic: { '--font-serif': 'var(--font-spectral)', '--font-sans': 'var(--font-syne)' },
    Nature: { '--font-serif': 'var(--font-fauna)', '--font-sans': 'var(--font-lora)' },
    Chic: { '--font-serif': 'var(--font-tenor)', '--font-sans': 'var(--font-lora)' },
    Clean: { '--font-serif': 'var(--font-questrial)', '--font-sans': 'var(--font-inter)' },
    Bold: { '--font-serif': 'var(--font-syne)', '--font-sans': 'var(--font-inter)' },
    Calligraphy: { '--font-serif': 'var(--font-alex)', '--font-sans': 'var(--font-playfair)' },
    SoftScript: { '--font-serif': 'var(--font-allura)', '--font-sans': 'var(--font-eb)' },
    Whimsy: { '--font-serif': 'var(--font-arizonia)', '--font-sans': 'var(--font-inter)' },
    Handwritten: { '--font-serif': 'var(--font-dancing)', '--font-sans': 'var(--font-montserrat)' },
    Italian: { '--font-serif': 'var(--font-italianno)', '--font-sans': 'var(--font-cinzel)' },
    PremiumScript: { '--font-serif': 'var(--font-pinyon)', '--font-sans': 'var(--font-playfair)' },
    MinimalScript: { '--font-serif': 'var(--font-sacramento)', '--font-sans': 'var(--font-inter)' },
    Ornate: { '--font-serif': 'var(--font-tangerine)', '--font-sans': 'var(--font-cormorant)' },
    Paris: { '--font-serif': 'var(--font-parisienne)', '--font-sans': 'var(--font-montserrat)' },
    Abril: { '--font-serif': 'var(--font-abril)', '--font-sans': 'var(--font-inter)' },
    Upright: { '--font-serif': 'var(--font-cormorant-upright)', '--font-sans': 'var(--font-lora)' },
    Vintage: { '--font-serif': 'var(--font-old-standard)', '--font-sans': 'var(--font-eb-garamond)' },
    Josefin: { '--font-serif': 'var(--font-playfair)', '--font-sans': 'var(--font-josefin)' },
    Caslon: { '--font-serif': 'var(--font-caslon)', '--font-sans': 'var(--font-inter)' },
    Quattro: { '--font-serif': 'var(--font-quattrocento)', '--font-sans': 'var(--font-lora)' },
    Saint: { '--font-serif': 'var(--font-mrs-saint)', '--font-sans': 'var(--font-playfair)' },
    Monsieur: { '--font-serif': 'var(--font-monsieur)', '--font-sans': 'var(--font-eb-garamond)' },
    Handmade: { '--font-serif': 'var(--font-homemade)', '--font-sans': 'var(--font-inter)' },
    Mueller: { '--font-serif': 'var(--font-herr)', '--font-sans': 'var(--font-playfair)' },
    Lavish: { '--font-serif': 'var(--font-lavishly)', '--font-sans': 'var(--font-outfit)' },
    RoyalSC: { '--font-serif': 'var(--font-cormorant-sc)', '--font-sans': 'var(--font-montserrat)' },
    ModernGrotesk: { '--font-serif': 'var(--font-fraunces)', '--font-sans': 'var(--font-space)' },
    VogueEdit: { '--font-serif': 'var(--font-bodoni)', '--font-sans': 'var(--font-outfit)' },
    Estate: { '--font-serif': 'var(--font-fraunces)', '--font-sans': 'var(--font-inter)' },
};

const BACKGROUND_COLOR_MAP: Record<string, string> = {
    white: '#FFFFFF',
    cream: '#FFF8F4',
    satin: '#FDF5E6',
    paper: '#F4F1EA',
    minimal: '#F9F9F9',
    rose: '#FFF5F5',
    linen: '#FAF9F6',
};

export function normalizeTemplateId(template?: string): TemplateId {
    const normalized = (template || 'classic').toLowerCase();
    return normalized in TEMPLATE_COMPONENTS ? normalized as TemplateId : 'classic';
}

export function getWeddingFontVariables(style?: string): ThemeFontVars {
    return FONT_VARIABLES[style || ''] || FONT_VARIABLES.Elegant;
}

export function getWeddingPageStyle(wedding: Wedding, options?: { includeGradient?: boolean }): WeddingPageStyle {
    const fontVars = getWeddingFontVariables(wedding.font_style);
    const backgroundKey = String((wedding as Wedding & { background_style?: string }).background_style || 'cream');
    const backgroundColor = BACKGROUND_COLOR_MAP[backgroundKey] || '#FFF8F4';

    return {
        '--primary': wedding.motif_color || '#D16C78',
        backgroundColor,
        ...(options?.includeGradient
            ? {
                backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.65), transparent 32%), linear-gradient(180deg, #fffaf6 0%, #fff5ef 52%, #f8ece7 100%)',
            }
            : {}),
        ...fontVars,
    };
}

export function renderWeddingTemplate(props: TemplateProps) {
    const Component = TEMPLATE_COMPONENTS[normalizeTemplateId(props.wedding.template)];
    return <Component {...props} />;
}

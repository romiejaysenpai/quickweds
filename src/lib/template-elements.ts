import { resolveTemplateFamily } from '@/lib/theme-engine';

export const TEMPLATE_ELEMENT_PATHS = {
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

export type TemplateElementAssetKey = Exclude<keyof typeof TEMPLATE_ELEMENT_PATHS, 'paperDeckle'>;

export type TemplateElementDividerVariant =
    | 'floral'
    | 'botanical'
    | 'coastal'
    | 'crest'
    | 'stars'
    | 'nordic'
    | 'clean-rule';

export interface TemplateElementTheme {
    assetKey: TemplateElementAssetKey;
    assetSrc: string;
    dividerVariant: TemplateElementDividerVariant;
    paperSurface: boolean;
}

const LIGHT_PAPER_BACKGROUNDS = new Set([
    'white',
    'cream',
    'satin',
    'paper',
    'minimal',
    'rose',
    'linen',
]);

export function isLightBackgroundOverride(backgroundStyle?: string | null): boolean {
    return LIGHT_PAPER_BACKGROUNDS.has((backgroundStyle || '').toLowerCase().trim());
}

const DIRECT_TEMPLATE_ELEMENT_MAP: Record<
    string,
    { assetKey: TemplateElementAssetKey; dividerVariant: TemplateElementDividerVariant; paperSurface: boolean }
> = {
    // Sakura / Blossom
    sakura: { assetKey: 'sakuraBranch', dividerVariant: 'floral', paperSurface: true },
    'petal-note': { assetKey: 'sakuraBranch', dividerVariant: 'floral', paperSurface: true },
    'orchid-noir': { assetKey: 'sakuraBranch', dividerVariant: 'floral', paperSurface: false },

    // Tropical / Sunlit
    tropical: { assetKey: 'tropicalMonstera', dividerVariant: 'botanical', paperSurface: true },
    'butter-blue': { assetKey: 'tropicalMonstera', dividerVariant: 'floral', paperSurface: true },

    // Coastal / Sea
    riviera: { assetKey: 'coastalShells', dividerVariant: 'coastal', paperSurface: true },
    'pearl-coastal': { assetKey: 'coastalShells', dividerVariant: 'coastal', paperSurface: true },
    'coastal-vow': { assetKey: 'coastalShells', dividerVariant: 'coastal', paperSurface: true },
    'the-weekend': { assetKey: 'coastalShells', dividerVariant: 'coastal', paperSurface: true },

    // Terracotta / Earthy / Warm Heritage
    boho: { assetKey: 'terracottaFlorals', dividerVariant: 'botanical', paperSurface: true },
    rustic: { assetKey: 'terracottaFlorals', dividerVariant: 'botanical', paperSurface: true },
    'torn-paper-terracotta': { assetKey: 'terracottaFlorals', dividerVariant: 'botanical', paperSurface: true },
    wildflower: { assetKey: 'terracottaFlorals', dividerVariant: 'floral', paperSurface: true },
    saffron: { assetKey: 'terracottaFlorals', dividerVariant: 'floral', paperSurface: true },
    'marigold-house': { assetKey: 'terracottaFlorals', dividerVariant: 'floral', paperSurface: true },
    'sunset-ceremony': { assetKey: 'terracottaFlorals', dividerVariant: 'botanical', paperSurface: true },

    // Meadow / Conservatory Botanicals
    garden: { assetKey: 'meadowWreath', dividerVariant: 'botanical', paperSurface: true },
    'botanical-arch': { assetKey: 'meadowWreath', dividerVariant: 'botanical', paperSurface: true },
    'watercolor-meadow': { assetKey: 'meadowWreath', dividerVariant: 'botanical', paperSurface: true },
    heirloom: { assetKey: 'meadowWreath', dividerVariant: 'floral', paperSurface: true },
    whimsical: { assetKey: 'meadowWreath', dividerVariant: 'floral', paperSurface: true },

    // Wax Seal / Ceremonial Classic
    'envelope-wax-seal': { assetKey: 'waxSeal', dividerVariant: 'floral', paperSurface: true },
    traditional: { assetKey: 'waxSeal', dividerVariant: 'crest', paperSurface: true },
    estate: { assetKey: 'waxSeal', dividerVariant: 'crest', paperSurface: true },
    classic: { assetKey: 'waxSeal', dividerVariant: 'floral', paperSurface: true },

    // Art Deco / Heraldic Gold
    artdeco: { assetKey: 'decoCrest', dividerVariant: 'crest', paperSurface: false },
    royal: { assetKey: 'decoCrest', dividerVariant: 'crest', paperSurface: false },
    regency: { assetKey: 'decoCrest', dividerVariant: 'crest', paperSurface: false },
    luxury: { assetKey: 'decoCrest', dividerVariant: 'crest', paperSurface: false },

    // Nordic / Architectural Minimal
    nordic: { assetKey: 'nordicPine', dividerVariant: 'nordic', paperSurface: true },
    elopement: { assetKey: 'nordicPine', dividerVariant: 'nordic', paperSurface: true },
    minimal: { assetKey: 'nordicPine', dividerVariant: 'clean-rule', paperSurface: false },
    'modern-vow': { assetKey: 'nordicPine', dividerVariant: 'nordic', paperSurface: true },
    monochrome: { assetKey: 'nordicPine', dividerVariant: 'clean-rule', paperSurface: false },
    urban: { assetKey: 'nordicPine', dividerVariant: 'clean-rule', paperSurface: false },

    // Vintage / Heirloom Keepsake
    vintage: { assetKey: 'vintageCameo', dividerVariant: 'floral', paperSurface: true },
    'love-letter': { assetKey: 'vintageCameo', dividerVariant: 'floral', paperSurface: true },
    timeline: { assetKey: 'vintageCameo', dividerVariant: 'clean-rule', paperSurface: false },
    papercut: { assetKey: 'vintageCameo', dividerVariant: 'floral', paperSurface: true },
    rsvpfocus: { assetKey: 'vintageCameo', dividerVariant: 'clean-rule', paperSurface: false },

    // Celestial / Noir / Cinema
    celestial: { assetKey: 'celestialAstrolabe', dividerVariant: 'stars', paperSurface: false },
    midnight: { assetKey: 'celestialAstrolabe', dividerVariant: 'stars', paperSurface: false },
    moonlit: { assetKey: 'celestialAstrolabe', dividerVariant: 'stars', paperSurface: false },
    cinematic: { assetKey: 'celestialAstrolabe', dividerVariant: 'clean-rule', paperSurface: false },
    'cinematic-vow': { assetKey: 'celestialAstrolabe', dividerVariant: 'clean-rule', paperSurface: false },
    film: { assetKey: 'celestialAstrolabe', dividerVariant: 'clean-rule', paperSurface: false },
    glitch: { assetKey: 'celestialAstrolabe', dividerVariant: 'clean-rule', paperSurface: false },

    // Silk Ribbon / Editorial Romance
    romantic: { assetKey: 'ribbonVelvet', dividerVariant: 'floral', paperSurface: true },
    'ribbon-romance': { assetKey: 'ribbonVelvet', dividerVariant: 'floral', paperSurface: true },
    elegance: { assetKey: 'ribbonVelvet', dividerVariant: 'floral', paperSurface: true },
    editorial: { assetKey: 'ribbonVelvet', dividerVariant: 'clean-rule', paperSurface: false },
    'editorial-luxe': { assetKey: 'ribbonVelvet', dividerVariant: 'clean-rule', paperSurface: false },
    'editorial-romance': { assetKey: 'ribbonVelvet', dividerVariant: 'floral', paperSurface: true },
    'velure-editorial': { assetKey: 'ribbonVelvet', dividerVariant: 'crest', paperSurface: true },
    atelier: { assetKey: 'ribbonVelvet', dividerVariant: 'clean-rule', paperSurface: false },
    lovescript: { assetKey: 'ribbonVelvet', dividerVariant: 'floral', paperSurface: true },
    vogue: { assetKey: 'ribbonVelvet', dividerVariant: 'clean-rule', paperSurface: false },
    gallery: { assetKey: 'ribbonVelvet', dividerVariant: 'clean-rule', paperSurface: false },
};

const STYLE_VARIANT_ASSET_OVERRIDES: Record<
    string,
    { assetKey: TemplateElementAssetKey; dividerVariant: TemplateElementDividerVariant; paperSurface: boolean }
> = {
    'luxury-planner': { assetKey: 'decoCrest', dividerVariant: 'crest', paperSurface: true },
    'editorial-photo': { assetKey: 'ribbonVelvet', dividerVariant: 'clean-rule', paperSurface: false },
    'romantic-estate': { assetKey: 'meadowWreath', dividerVariant: 'floral', paperSurface: true },
};

export function resolveTemplateElementTheme(
    template?: string | null,
    templateStyle?: string | null
): TemplateElementTheme {
    const normalizedStyle = (templateStyle || '').toLowerCase().trim();
    if (normalizedStyle && STYLE_VARIANT_ASSET_OVERRIDES[normalizedStyle]) {
        const match = STYLE_VARIANT_ASSET_OVERRIDES[normalizedStyle];
        return {
            ...match,
            assetSrc: TEMPLATE_ELEMENT_PATHS[match.assetKey],
        };
    }

    const normalizedTemplate = (template || 'classic').toLowerCase().trim();
    const direct =
        DIRECT_TEMPLATE_ELEMENT_MAP[normalizedTemplate] ||
        DIRECT_TEMPLATE_ELEMENT_MAP[resolveTemplateFamily(normalizedTemplate)] ||
        DIRECT_TEMPLATE_ELEMENT_MAP.classic;

    return {
        ...direct,
        assetSrc: TEMPLATE_ELEMENT_PATHS[direct.assetKey],
    };
}


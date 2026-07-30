export type TemplateCatalogItem = {
    id: string;
    name: string;
    desc: string;
    accent: string;
    eyebrow: string;
    mood: string;
    image?: string;
    tier: 'free' | 'premium';
    previewGradient: string;
};

export type TemplateFilter = 'all' | 'classic' | 'modern' | 'romantic' | 'destination' | 'bold';
export type TemplateRecommendationInput = {
    mood?: 'timeless' | 'soft' | 'clean' | 'dramatic' | 'playful';
    venue?: 'ballroom' | 'garden' | 'beach' | 'city' | 'intimate';
    priority?: 'photos' | 'schedule' | 'rsvp' | 'story';
};

const TEMPLATE_FILTERS: Record<Exclude<TemplateFilter, 'all'>, readonly string[]> = {
    classic: ['classic', 'traditional', 'elegance', 'vintage', 'royal', 'artdeco'],
    modern: ['minimal', 'timeline', 'rsvpfocus', 'vogue', 'editorial'],
    romantic: ['romantic', 'whimsical', 'sakura', 'garden', 'rustic', 'boho'],
    destination: ['elopement', 'tropical', 'cinematic', 'film'],
    bold: ['luxury', 'midnight', 'urban', 'glitch', 'vogue', 'editorial'],
};

export function templateMatchesFilter(templateId: string, filter: TemplateFilter) {
    return filter === 'all' || TEMPLATE_FILTERS[filter].includes(templateId);
}

export function recommendTemplateIds(input: TemplateRecommendationInput) {
    const signals: Record<string, readonly string[]> = {
        'mood:timeless': ['classic', 'traditional', 'elegance', 'royal'],
        'mood:soft': ['romantic', 'sakura', 'garden', 'whimsical'],
        'mood:clean': ['minimal', 'editorial', 'timeline', 'rsvpfocus'],
        'mood:dramatic': ['luxury', 'midnight', 'cinematic', 'artdeco'],
        'mood:playful': ['boho', 'tropical', 'whimsical', 'glitch'],
        'venue:ballroom': ['classic', 'luxury', 'royal', 'artdeco'],
        'venue:garden': ['garden', 'romantic', 'sakura', 'boho'],
        'venue:beach': ['tropical', 'elopement', 'boho', 'cinematic'],
        'venue:city': ['urban', 'editorial', 'vogue', 'minimal'],
        'venue:intimate': ['elopement', 'minimal', 'romantic', 'vintage'],
        'priority:photos': ['editorial', 'cinematic', 'film', 'vogue'],
        'priority:schedule': ['timeline', 'minimal', 'classic', 'elegance'],
        'priority:rsvp': ['rsvpfocus', 'minimal', 'timeline', 'classic'],
        'priority:story': ['romantic', 'vintage', 'film', 'garden'],
    };
    const scores = new Map<string, number>();
    for (const [key, value] of Object.entries(input)) {
        if (!value) continue;
        signals[`${key}:${value}`]?.forEach((id, rank) => scores.set(id, (scores.get(id) || 0) + 5 - rank));
    }
    return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id).slice(0, 4);
}

export type TemplateStyleVariant = {
    id: string;
    templateId: string;
    variationKey: 'v1' | 'v2' | 'v3' | 'v4' | 'v5';
    name: string;
    desc: string;
    source?: string;
    accent: string;
    heroLayout: string;
    typography: string;
    sectionArrangement: string;
    galleryStyle: string;
    buttonStyle: string;
    backgroundDesign: string;
    rsvpStyle: string;
    mobileLayout: string;
    previewGradient?: string;
};

export const DEFAULT_TEMPLATE_STYLE = 'default';

export const CLASSIC_VARIATIONS: TemplateStyleVariant[] = [
    {
        id: 'classic_v1',
        templateId: 'classic',
        variationKey: 'v1',
        name: 'Timeless Grand Centered (V1)',
        desc: 'Centered portrait hero overlay with elegant serif names, gold dividers, and glassmorphism pill buttons.',
        accent: '#C08081',
        heroLayout: 'Centered Overlay Hero with Gold Divider',
        typography: 'Classic Serif (Cinzel / Playfair) & Clean Sans (Inter)',
        sectionArrangement: 'Standard Story Flow (Hero -> Video -> Bio -> Details -> Countdown -> Timeline -> Gallery -> Attire -> FAQ -> Gift -> RSVP)',
        galleryStyle: 'Balanced Masonry Grid with smooth light-box',
        buttonStyle: 'Rounded Glassmorphism Pill (border border-white/50 bg-black/20 backdrop-blur)',
        backgroundDesign: 'Soft Warm Cream with Subtle Top Radial Gradient',
        rsvpStyle: 'Embedded Centered Glass Card Form',
        mobileLayout: 'Standard Vertical Responsive Stack with Floating Action Bar',
        previewGradient: 'linear-gradient(135deg, #fff9f5 0%, #f8eeea 55%, #ecd4d9 100%)',
    },
    {
        id: 'classic_v2',
        templateId: 'classic',
        variationKey: 'v2',
        name: 'Split-Screen Modern Editorial (V2)',
        desc: 'High-contrast 50/50 split hero with photography on left, bold typography on right, and filmstrip gallery.',
        accent: '#8F394A',
        heroLayout: '50/50 Asymmetric Split-Screen Hero',
        typography: 'Bold Display Serif (Fraunces / Bodoni) & High-Contrast Grotesk Sans',
        sectionArrangement: 'Story-First Flow (Hero -> Bio -> Gallery -> Video -> Details -> Timeline -> RSVP -> FAQ -> Gift)',
        galleryStyle: 'Horizontal Filmstrip / Carousel with subtle page counters',
        buttonStyle: 'Sharp Gold-Bordered Box (rounded-none border-2 border-primary uppercase)',
        backgroundDesign: 'High-Contrast Ivory & Noir Duo-Tone with clean accent borders',
        rsvpStyle: 'Side-by-Side Photo & Interactive RSVP Form Card',
        mobileLayout: 'Card-based full-width mobile sections with sticky top header',
        previewGradient: 'linear-gradient(135deg, #2b1f24 0%, #4a2830 50%, #8f394a 100%)',
    },
    {
        id: 'classic_v3',
        templateId: 'classic',
        variationKey: 'v3',
        name: 'Floating Glass Romance (V3)',
        desc: 'Atmospheric blurred hero with an elevated glassmorphism card, polaroid stack gallery, and soft script accents.',
        accent: '#D9777F',
        heroLayout: 'Elevated Floating Glassmorphism Hero Card',
        typography: 'Soft Romantic Script (Pinyon Script / Alex Brush) & Light Serif',
        sectionArrangement: 'Schedule & Venue Flow (Hero -> Details -> Countdown -> Timeline -> Bio -> Video -> Gallery -> RSVP -> Gift)',
        galleryStyle: 'Polaroid Stack Collage with interactive tilt effects',
        buttonStyle: 'Soft Gradient Pill with Hover Elevation (bg-gradient-to-r from-primary to-rose-400 shadow-lg)',
        backgroundDesign: 'Textured Linen look with subtle floating vector flower accents',
        rsvpStyle: 'Elevated Modal-Style Card with ornamental gold corners',
        mobileLayout: 'Accordion-style expandable mobile sections with quick jump pill tabs',
        previewGradient: 'linear-gradient(135deg, #fff0f3 0%, #fcd5ce 50%, #f8edeb 100%)',
    },
    {
        id: 'classic_v4',
        templateId: 'classic',
        variationKey: 'v4',
        name: 'Magazine Monogram Grid (V4)',
        desc: 'Architectural header featuring large monogram mark, offset 3-photo hero grid, and magazine 2x3 gallery.',
        accent: '#9A5B64',
        heroLayout: 'Monogram Header & Asymmetric 3-Photo Hero Grid',
        typography: 'Modern Editorial Sans (Syne / Outfit) & Bold Bodoni Headings',
        sectionArrangement: 'Media Showcase Flow (Hero -> Video -> Gallery -> Bio -> Details -> Timeline -> Gift -> RSVP)',
        galleryStyle: '2x3 Asymmetric Magazine Grid with full-width highlight banner',
        buttonStyle: 'Underlined Accent Link with Motion Dot (border-b-2 border-primary uppercase font-serif)',
        backgroundDesign: 'Ultra-clean Pure White Canvas with fine line dividers',
        rsvpStyle: 'Step-by-Step Interactive RSVP Wizard Cards',
        mobileLayout: 'Fullscreen Mobile Cards with touch-swipe navigation indicators',
        previewGradient: 'linear-gradient(135deg, #f7f7f7 0%, #e3e3e3 50%, #9a5b64 100%)',
    },
    {
        id: 'classic_v5',
        templateId: 'classic',
        variationKey: 'v5',
        name: 'Minimalist Couture (V5)',
        desc: 'Oversized typography header with inline countdown bar, minimal 3-column grid, and shadow pill buttons.',
        accent: '#5A2A32',
        heroLayout: 'Pure Typography Oversized Banner with Inline Countdown',
        typography: 'Minimalist Sans Grotesk (Space Grotesk / Inter) & Serif Accents',
        sectionArrangement: 'RSVP First Flow (Hero -> RSVP -> Countdown -> Details -> Timeline -> Bio -> Gallery -> Gift)',
        galleryStyle: 'Clean Minimalist 3-Column Grid with hover zoom effects',
        buttonStyle: 'Dual-tone Shadow Pill (rounded-2xl bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)])',
        backgroundDesign: 'Soft Motif-tinted gradient with organic wave section separators',
        rsvpStyle: 'Minimalist Bottom Drawer RSVP Card with quick response buttons',
        mobileLayout: 'Single-column clean scroll with extra large touch targets',
        previewGradient: 'linear-gradient(135deg, #faf6f0 0%, #f0e6d8 50%, #5a2a32 100%)',
    },
];

export const TEMPLATE_STYLE_VARIANTS: TemplateStyleVariant[] = [
    ...CLASSIC_VARIATIONS,
    {
        id: 'luxury-planner',
        templateId: 'luxury',
        variationKey: 'v2',
        name: 'Luxury Planner',
        desc: 'Ivory, champagne, editorial spacing, and wedding-planner polish inspired by luxury landing pages.',
        source: 'Nicepage wedding landing reference',
        accent: '#B9975B',
        heroLayout: 'Full Bleed Luxury Frame',
        typography: 'Luxe Serif & High Contrast Sans',
        sectionArrangement: 'Editorial Schedule Flow',
        galleryStyle: 'Masonry Grid',
        buttonStyle: 'Gold Bordered Pill',
        backgroundDesign: 'Ivory & Champagne',
        rsvpStyle: 'Embedded Luxe Form',
        mobileLayout: 'Responsive Stack',
    },
    {
        id: 'editorial-photo',
        templateId: 'editorial',
        variationKey: 'v2',
        name: 'Editorial Photo',
        desc: 'Photography-led hero composition with quiet captions and magazine-style image rhythm.',
        source: 'Nicepage photographer references',
        accent: '#2F2A27',
        heroLayout: 'Photo Focus Split',
        typography: 'Editorial Serif',
        sectionArrangement: 'Gallery Showcase Flow',
        galleryStyle: 'Asymmetric Magazine Grid',
        buttonStyle: 'Minimal Border Button',
        backgroundDesign: 'Pure White Canvas',
        rsvpStyle: 'Minimal Form Card',
        mobileLayout: 'Full-width Cards',
    },
    {
        id: 'romantic-estate',
        templateId: 'romantic',
        variationKey: 'v2',
        name: 'Romantic Estate',
        desc: 'Soft estate romance with airy type, warm neutrals, and refined storybook pacing.',
        source: 'Nicepage romantic wedding references',
        accent: '#B97983',
        heroLayout: 'Floating Glass Card',
        typography: 'Romantic Script & Serif',
        sectionArrangement: 'Story First Flow',
        galleryStyle: 'Polaroid Collage',
        buttonStyle: 'Gradient Soft Pill',
        backgroundDesign: 'Linen Texture with Floral Accents',
        rsvpStyle: 'Modal Style Card',
        mobileLayout: 'Expandable Accordion',
    },
];

/**
 * Returns 5 distinct design variations for any template.
 * For templates with bespoke variation definitions (like `classic`), returns those.
 * Generates 5 structured variations for other template IDs.
 */
export function getTemplateStyleVariants(templateId?: string): TemplateStyleVariant[] {
    const targetId = (templateId || 'classic').toLowerCase();
    const explicit = TEMPLATE_STYLE_VARIANTS.filter((variant) => variant.templateId === targetId);

    if (explicit.length >= 5) {
        return explicit;
    }

    // Default template accent map fallback
    const templateMeta = TEMPLATES.find((t) => t.id === targetId);
    const accent = templateMeta?.accent || '#C08081';

    const defaultFive: TemplateStyleVariant[] = [
        {
            id: 'default',
            templateId: targetId,
            variationKey: 'v1',
            name: `${templateMeta?.name || 'Classic'} Original (V1)`,
            desc: 'The original signature layout with centered hero, standard section ordering, and standard gallery.',
            accent,
            heroLayout: 'Centered Hero Overlay',
            typography: 'Signature Template Fonts',
            sectionArrangement: 'Standard Linear Flow',
            galleryStyle: 'Standard Grid',
            buttonStyle: 'Signature Pill Button',
            backgroundDesign: 'Signature Theme Background',
            rsvpStyle: 'Standard Embedded RSVP Card',
            mobileLayout: 'Standard Responsive Stack',
        },
        {
            id: `${targetId}_v2`,
            templateId: targetId,
            variationKey: 'v2',
            name: 'Split-Screen Modern Editorial (V2)',
            desc: 'Asymmetric 50/50 split hero with photography focus, horizontal filmstrip gallery, and sharp border buttons.',
            accent,
            heroLayout: '50/50 Asymmetric Split Hero',
            typography: 'High-Contrast Bold Display Serif & Grotesk Sans',
            sectionArrangement: 'Story-First Priority Flow',
            galleryStyle: 'Horizontal Filmstrip Carousel',
            buttonStyle: 'Sharp Gold-Bordered Box Button',
            backgroundDesign: 'High-Contrast Duo-Tone Background',
            rsvpStyle: 'Side-by-Side Photo & Interactive Form',
            mobileLayout: 'Card-based Mobile Sections with Sticky Header',
        },
        {
            id: `${targetId}_v3`,
            templateId: targetId,
            variationKey: 'v3',
            name: 'Floating Glass Romance (V3)',
            desc: 'Elevated glassmorphism hero card over atmospheric backdrop with polaroid collage and soft script accents.',
            accent,
            heroLayout: 'Elevated Glassmorphism Floating Hero Card',
            typography: 'Soft Romantic Script & Light Serif',
            sectionArrangement: 'Schedule & Venue Priority Flow',
            galleryStyle: 'Polaroid Stack Interactive Collage',
            buttonStyle: 'Soft Gradient Pill with Hover Lift',
            backgroundDesign: 'Textured Linen Canvas with Vector Accents',
            rsvpStyle: 'Elevated Modal Card with Gold Corners',
            mobileLayout: 'Accordion-style Mobile Sections with Quick Jump Tabs',
        },
        {
            id: `${targetId}_v4`,
            templateId: targetId,
            variationKey: 'v4',
            name: 'Magazine Monogram Grid (V4)',
            desc: 'Monogram header banner with asymmetric 3-photo hero grid, 2x3 magazine layout, and underlined accent links.',
            accent,
            heroLayout: 'Monogram Header & Asymmetric 3-Photo Hero Grid',
            typography: 'Modern Editorial Sans & Bold Bodoni Serif',
            sectionArrangement: 'Media Showcase Priority Flow',
            galleryStyle: '2x3 Asymmetric Magazine Grid',
            buttonStyle: 'Underlined Accent Link with Motion Indicator',
            backgroundDesign: 'Pure Light Minimalist Canvas',
            rsvpStyle: 'Step-by-Step Interactive Form Cards',
            mobileLayout: 'Fullscreen Mobile Swipe Cards',
        },
        {
            id: `${targetId}_v5`,
            templateId: targetId,
            variationKey: 'v5',
            name: 'Minimalist Couture (V5)',
            desc: 'Pure typography hero banner with inline countdown bar, minimal 3-column grid, and dual-tone shadow pill buttons.',
            accent,
            heroLayout: 'Pure Typography Banner with Inline Countdown',
            typography: 'Minimalist Sans Grotesk & Elegant Serif Accents',
            sectionArrangement: 'RSVP-First Priority Flow',
            galleryStyle: 'Minimalist 3-Column Grid with Zoom Effects',
            buttonStyle: 'Dual-Tone Shadow Pill Button',
            backgroundDesign: 'Soft Motif Gradient with Organic Wave Dividers',
            rsvpStyle: 'Minimalist Bottom Drawer RSVP Card',
            mobileLayout: 'Single-Column Clean Scroll with Big Touch Targets',
        },
    ];

    // Combine explicit and dynamic variations to ensure 5 total unique variations
    const map = new Map<string, TemplateStyleVariant>();
    explicit.forEach((v) => map.set(v.id, v));
    defaultFive.forEach((v) => {
        if (!map.has(v.id)) map.set(v.id, v);
    });

    return Array.from(map.values()).slice(0, 5);
}

export function isTemplateStyleAvailable(templateId?: string, styleId?: string) {
    if (!styleId || styleId === DEFAULT_TEMPLATE_STYLE || styleId === 'classic_v1' || styleId === 'v1') return true;
    const variants = getTemplateStyleVariants(templateId);
    return variants.some((variant) => variant.id === styleId);
}

export function getTemplateStyleLabel(styleId?: string) {
    if (!styleId || styleId === DEFAULT_TEMPLATE_STYLE) return 'Original (V1)';
    const found = TEMPLATE_STYLE_VARIANTS.find((variant) => variant.id === styleId);
    if (found) return found.name;
    if (styleId.includes('_v2') || styleId === 'v2') return 'Split-Screen Modern (V2)';
    if (styleId.includes('_v3') || styleId === 'v3') return 'Floating Glass Romance (V3)';
    if (styleId.includes('_v4') || styleId === 'v4') return 'Magazine Monogram Grid (V4)';
    if (styleId.includes('_v5') || styleId === 'v5') return 'Minimalist Couture (V5)';
    return 'Original (V1)';
}

export const FREE_TEMPLATE_IDS = [
    'classic',
    'minimal',
    'romantic',
    'luxury',
    'elopement',
    'traditional',
    'timeline',
    'rsvpfocus',
    'cinematic',
    'elegance',
    'artdeco',
    'boho',
    'whimsical',
    'urban',
    'tropical',
    'midnight',
    'sakura',
    'vogue',
    'rustic',
    'film',
    'glitch',
    'vintage',
    'editorial',
    'royal',
    'garden',
] as const;
export const LANDING_TEMPLATE_IDS = ['classic', 'minimal', 'boho', 'royal', 'midnight', 'tropical'] as const;
export const SHOWCASE_TEMPLATE_IDS = ['classic', 'minimal', 'royal', 'boho', 'urban', 'tropical'] as const;

export const TEMPLATES: TemplateCatalogItem[] = [
    {
        id: 'classic',
        name: 'Classic Elegance',
        desc: 'Timeless, centered layout with graceful serif typography.',
        accent: '#C08081',
        eyebrow: 'Timeless Romance',
        mood: 'Ivory, rose, and heirloom softness',
        image: '/templates/classic.png',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff9f5 0%, #f8eeea 55%, #ecd4d9 100%)',
    },
    {
        id: 'minimal',
        name: 'Modern Minimal',
        desc: 'Clean lines, high contrast, and restrained luxury.',
        accent: '#3A2A2D',
        eyebrow: 'Clean Editorial',
        mood: 'Quiet contrast and gallery-grade whitespace',
        image: '/templates/minimal.png',
        tier: 'free',
        previewGradient: 'linear-gradient(145deg, #ffffff 0%, #f4f2ef 48%, #e7dfda 100%)',
    },
    {
        id: 'romantic',
        name: 'Romantic',
        desc: 'Soft textures, script details, and nostalgic framing.',
        accent: '#B85C7A',
        eyebrow: 'Soft Love Story',
        mood: 'Powder blush, poetry, and candlelight',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff8fb 0%, #f8e6ee 55%, #eed3df 100%)',
    },
    {
        id: 'luxury',
        name: 'Luxury Editorial',
        desc: 'Magazine-style composition with fashion-house drama.',
        accent: '#C5A059',
        eyebrow: 'Fashion House',
        mood: 'Black lacquer and brushed gold',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #080808 0%, #18130f 50%, #382914 100%)',
    },
    {
        id: 'elopement',
        name: 'Intimate Elopement',
        desc: 'A heartfelt layout focused on the couple and their journey.',
        accent: '#6B7A62',
        eyebrow: 'Quiet Escape',
        mood: 'Alpine light and understated intimacy',
        tier: 'free',
        previewGradient: 'linear-gradient(140deg, #f7f4ee 0%, #dfe6d7 50%, #bcc9b2 100%)',
    },
    {
        id: 'traditional',
        name: 'Traditional Ceremonial',
        desc: 'Ornate details and majestic styling for formal celebrations.',
        accent: '#8F6A45',
        eyebrow: 'Grand Ceremony',
        mood: 'Ceremonial warmth and polished heritage',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff7ed 0%, #ecd9c4 55%, #caa783 100%)',
    },
    {
        id: 'timeline',
        name: 'Timeline Based',
        desc: 'Structured around the flow of the day and guest clarity.',
        accent: '#4D5B7C',
        eyebrow: 'Structured Flow',
        mood: 'Architectural rhythm with calm precision',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 52%, #c9d4e7 100%)',
    },
    {
        id: 'rsvpfocus',
        name: 'RSVP First',
        desc: 'Guest confirmation takes center stage with a crisp layout.',
        accent: '#A0616A',
        eyebrow: 'Guest Forward',
        mood: 'High-conversion clarity with elegance',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff9f7 0%, #f3e4e4 52%, #dfc4c8 100%)',
    },
    {
        id: 'cinematic',
        name: 'Media Forward',
        desc: 'A motion-led layout for sharing your love story in filmic style.',
        accent: '#C7704D',
        eyebrow: 'Cinema Frame',
        mood: 'Moody amber light and widescreen drama',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #0f1116 0%, #241b17 50%, #533427 100%)',
    },
    {
        id: 'elegance',
        name: 'Minimal Elegant',
        desc: 'Refined typography and sophisticated restraint.',
        accent: '#9B7A5E',
        eyebrow: 'Quiet Luxe',
        mood: 'Soft taupe and couture spacing',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fffcf8 0%, #f0e6dc 55%, #dcc9b6 100%)',
    },
    {
        id: 'artdeco',
        name: 'Art Deco Gold',
        desc: 'Geometric framing and opulent metallic accents.',
        accent: '#C5A059',
        eyebrow: 'Gilded Geometry',
        mood: 'Jazz-era glamour and symmetry',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #121212 0%, #241d15 50%, #5d4520 100%)',
    },
    {
        id: 'boho',
        name: 'Boho Dream',
        desc: 'Organic shapes, earthy color, and warm, freeform romance.',
        accent: '#A56D52',
        eyebrow: 'Earthy Poetry',
        mood: 'Clay, linen, and artisanal warmth',
        image: '/templates/boho.png',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff7ef 0%, #edd8c6 50%, #d4a27e 100%)',
    },
    {
        id: 'whimsical',
        name: 'Whimsical Garden',
        desc: 'Playful motion and airy floral delight.',
        accent: '#8D7BC4',
        eyebrow: 'Storybook Bloom',
        mood: 'Petal mist and playful detail',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff9fd 0%, #ebdef8 50%, #cdb9f3 100%)',
    },
    {
        id: 'urban',
        name: 'Industrial Urban',
        desc: 'Raw textures, stark contrast, and fashion-week edge.',
        accent: '#FF4D5A',
        eyebrow: 'City After Dark',
        mood: 'Concrete, chrome, and neon tension',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #090909 0%, #202020 55%, #4f171d 100%)',
    },
    {
        id: 'tropical',
        name: 'Tropical Paradise',
        desc: 'Vibrant color, lush framing, and destination energy.',
        accent: '#0B8F7B',
        eyebrow: 'Destination Glow',
        mood: 'Sea glass, palms, and sunset freshness',
        image: '/templates/tropical.png',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #effcf8 0%, #d1f4ee 48%, #7fd7c8 100%)',
    },
    {
        id: 'midnight',
        name: 'Midnight Luxury',
        desc: 'A premium dark theme with luminous gold detailing.',
        accent: '#CFB53B',
        eyebrow: 'After-Hours Luxe',
        mood: 'Champagne glow over black velvet',
        image: '/templates/midnight.png',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #05060a 0%, #12192d 48%, #3d3416 100%)',
    },
    {
        id: 'sakura',
        name: 'Sakura Blossom',
        desc: 'Cherry blossom softness with graceful Japanese notes.',
        accent: '#D88DA9',
        eyebrow: 'Bloom Season',
        mood: 'Petal pink and spring air',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff8fb 0%, #f7e4ee 55%, #edbfd3 100%)',
    },
    {
        id: 'vogue',
        name: 'High Fashion',
        desc: 'Asymmetry, large type, and runway-confidence.',
        accent: '#111111',
        eyebrow: 'Runway Edit',
        mood: 'Monochrome confidence with couture pacing',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #ffffff 0%, #efefef 52%, #d7d7d7 100%)',
    },
    {
        id: 'rustic',
        name: 'Rustic Charm',
        desc: 'Warm timber tones, string-light softness, and cozy romance.',
        accent: '#8C6446',
        eyebrow: 'Barn Glow',
        mood: 'Honey wood and candlelit comfort',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fff8ee 0%, #ead9c4 52%, #bb8e60 100%)',
    },
    {
        id: 'film',
        name: 'Retro Film',
        desc: 'Grain, analog edges, and memory-like nostalgia.',
        accent: '#B4875C',
        eyebrow: 'Analog Memory',
        mood: 'Warm grain and silver halide softness',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #1b1815 0%, #5b4734 52%, #c49c74 100%)',
    },
    {
        id: 'glitch',
        name: 'Cyber Glitch',
        desc: 'Digital texture, chromatic accents, and avant-garde energy.',
        accent: '#4EF2E0',
        eyebrow: 'Neo Signal',
        mood: 'Cyan, magenta, and digital pulse',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #05070f 0%, #11182c 48%, #2a0f3d 100%)',
    },
    {
        id: 'vintage',
        name: 'Vintage Postcard',
        desc: 'Antique paper, old-world lettering, and keepsake charm.',
        accent: '#A67C52',
        eyebrow: 'Keepsake Paper',
        mood: 'Faded parchment and heirloom stamps',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fcf7ef 0%, #e7d8c4 55%, #c4a179 100%)',
    },
    {
        id: 'editorial',
        name: 'Editorial Chic',
        desc: 'Large-format imagery with a luxury magazine attitude.',
        accent: '#1E1E1E',
        eyebrow: 'Magazine Cover',
        mood: 'Hero photography and stark elegance',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #fefefe 0%, #ececec 50%, #d7d0cb 100%)',
    },
    {
        id: 'royal',
        name: 'Royal Proclamation',
        desc: 'Majestic darkness with heraldic gold refinement.',
        accent: '#D6B87C',
        eyebrow: 'Regal Drama',
        mood: 'Velvet halls and ceremonial gold',
        image: '/templates/royal.png',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #0c0c0c 0%, #181818 44%, #49351d 100%)',
    },
    {
        id: 'garden',
        name: 'Secret Garden',
        desc: 'Botanical elegance with lush, layered greenery.',
        accent: '#537A57',
        eyebrow: 'Botanical Estate',
        mood: 'Green canopies and conservatory light',
        tier: 'free',
        previewGradient: 'linear-gradient(135deg, #f8fbf5 0%, #d8e7d1 52%, #9fba94 100%)',
    },
    {
        id: 'heirloom',
        name: 'Heirloom Watercolor',
        desc: 'Illustrated invitation details with soft paper, botanical framing, and graceful pacing.',
        accent: '#6A7D54',
        eyebrow: 'Painted Invitation',
        mood: 'Watercolor botanicals and a handwritten keepsake',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fffdf6 0%, #eef1df 48%, #b7c59f 100%)',
    },
    {
        id: 'estate',
        name: 'The Estate',
        desc: 'Understated country-house luxury with ample space for a multi-day celebration.',
        accent: '#7D705B',
        eyebrow: 'Country House',
        mood: 'Limestone, cream linen, and quiet grandeur',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fbf8f1 0%, #e5ded0 52%, #b9ab93 100%)',
    },
    {
        id: 'moonlit',
        name: 'Moonlit Romance',
        desc: 'A cinematic dark invitation with luminous type and after-hours polish.',
        accent: '#D8C494',
        eyebrow: 'After Dark',
        mood: 'Black silk, champagne light, and midnight florals',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #090a10 0%, #1b1d2c 50%, #54472c 100%)',
    },
    {
        id: 'saffron',
        name: 'Saffron Ceremony',
        desc: 'A celebratory heritage design for colorful, multi-event wedding weekends.',
        accent: '#B65B2A',
        eyebrow: 'Heritage Celebration',
        mood: 'Saffron, marigold, and jewel-toned ceremony',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fff4df 0%, #f2c785 50%, #b85d31 100%)',
    },
    {
        id: 'cinema-noir',
        name: 'Cinema Noir',
        desc: 'Film-still imagery, rich contrast, and a dramatic love-story reveal.',
        accent: '#C78A63',
        eyebrow: 'Love on Film',
        mood: 'Amber grain, smoke, and widescreen romance',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #070809 0%, #241a18 54%, #714735 100%)',
    },
    {
        id: 'modern-vow',
        name: 'Modern Vow',
        desc: 'Fresh typography and refined utility for a contemporary wedding weekend.',
        accent: '#437E70',
        eyebrow: 'Contemporary Union',
        mood: 'Soft mint, clean type, and purposeful detail',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fbfffd 0%, #dceee8 52%, #93c4b5 100%)',
    },
    {
        id: 'atelier',
        name: 'Atelier Editorial',
        desc: 'A fashion-led composition for couples who want a magazine-worthy celebration.',
        accent: '#332B2B',
        eyebrow: 'The Fashion Edit',
        mood: 'Studio white, ink, and art-directed photography',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #ffffff 0%, #e9e4df 50%, #b8aaa0 100%)',
    },
    {
        id: 'wildflower',
        name: 'Wildflower Weekend',
        desc: 'Relaxed color, organic forms, and a warm destination-wedding spirit.',
        accent: '#B46C52',
        eyebrow: 'Free-Spirited Love',
        mood: 'Sun-baked clay, meadow blooms, and long tables',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fff7ee 0%, #edd3bc 50%, #d69069 100%)',
    },
    {
        id: 'regency',
        name: 'Regency Ball',
        desc: 'Formal portraiture and gilded ornament for a black-tie, ballroom celebration.',
        accent: '#C8A962',
        eyebrow: 'Black Tie Affair',
        mood: 'Deep ink, antique gold, and grand entrances',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #090a0e 0%, #20202a 50%, #665229 100%)',
    },
    {
        id: 'lovescript',
        name: 'Love Script',
        desc: 'An invitation-first design with oversized calligraphy and intimate storytelling.',
        accent: '#B76883',
        eyebrow: 'Written With Love',
        mood: 'Rose paper, fine ink, and handwritten promises',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fff9fb 0%, #f3dfe7 50%, #d999b2 100%)',
    },
    {
        id: 'coastal-vow',
        name: 'Coastal Vow',
        desc: 'Fresh ocean color and a relaxed itinerary for destination celebrations.',
        accent: '#2C7891',
        eyebrow: 'By The Sea',
        mood: 'Salt air, crisp linen, and sunset vows',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #f5fcfc 0%, #cde9ec 50%, #73afc0 100%)',
    },
    {
        id: 'orchid-noir',
        name: 'Orchid Noir',
        desc: 'A floral after-dark invitation with dramatic contrast and couture energy.',
        accent: '#8D5273',
        eyebrow: 'Evening In Bloom',
        mood: 'Orchid shadows, silk, and a little mystery',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #100b11 0%, #2e1e30 52%, #8d5273 100%)',
    },
    {
        id: 'papercut',
        name: 'Paper Cut',
        desc: 'A graphic, modern invitation built around expressive type and colorful shape.',
        accent: '#E06D48',
        eyebrow: 'Modern Invitation',
        mood: 'Terracotta paper, sharp type, joyful composition',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fff9f5 0%, #fae3d8 50%, #e06d48 100%)',
    },
    {
        id: 'celestial',
        name: 'Celestial',
        desc: 'An atmospheric night-sky design for starry, unforgettable celebrations.',
        accent: '#9BADE0',
        eyebrow: 'Written In The Stars',
        mood: 'Constellations, midnight blue, and luminous promise',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #11162a 0%, #1e2748 52%, #9bade0 100%)',
    },
    {
        id: 'marigold-house',
        name: 'Marigold House',
        desc: 'A colorful ceremonial design for joyful, multi-day family celebrations.',
        accent: '#C56A16',
        eyebrow: 'Joyful Gathering',
        mood: 'Marigold, music, and generations together',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fff6dc 0%, #f8d575 52%, #c56a16 100%)',
    },
    {
        id: 'the-weekend',
        name: 'The Weekend',
        desc: 'An elevated guest-first layout for welcome parties, ceremonies, and brunch.',
        accent: '#5A6C62',
        eyebrow: 'Wedding Weekend',
        mood: 'Country-house ease and thoughtful details',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #f8faf5 0%, #d9e0d4 52%, #8fa197 100%)',
    },
    {
        id: 'winter-rose',
        name: 'Winter Rose',
        desc: 'Velvet darkness and rose-red detail for an unforgettable winter celebration.',
        accent: '#A33D4A',
        eyebrow: 'Winter Celebration',
        mood: 'Candlelight, velvet, and deep red roses',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #150d11 0%, #341a24 52%, #a33d4a 100%)',
    },
    {
        id: 'gallery',
        name: 'The Gallery',
        desc: 'A considered, art-directed canvas for couples with a creative point of view.',
        accent: '#6C5A46',
        eyebrow: 'Gallery Of Us',
        mood: 'Gallery white, antique brass, and artful imagery',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fbfaf8 0%, #e8e1d7 52%, #aa9278 100%)',
    },
    {
        id: 'petal-note',
        name: 'Petal Note',
        desc: 'A tender, handwritten invitation with blush paper and botanical warmth.',
        accent: '#C8889A',
        eyebrow: 'A Note For You',
        mood: 'Petal pink, gentle script, and a personal welcome',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fff9fb 0%, #f6e2e8 52%, #c8889a 100%)',
    },
    {
        id: 'sunset-ceremony',
        name: 'Sunset Ceremony',
        desc: 'Golden-hour warmth and destination energy for celebrations by the horizon.',
        accent: '#D4774F',
        eyebrow: 'Golden Hour',
        mood: 'Warm light, open skies, and an evening to remember',
        tier: 'premium',
        previewGradient: 'linear-gradient(135deg, #fff6ec 0%, #f5d3a5 52%, #d4774f 100%)',
    },
];

export const TEMPLATE_LOOKUP = Object.fromEntries(
    TEMPLATES.map((template) => [template.id, template])
) as Record<string, TemplateCatalogItem>;

export function getTemplateMeta(templateId?: string) {
    return TEMPLATE_LOOKUP[templateId || 'classic'] || TEMPLATE_LOOKUP.classic;
}

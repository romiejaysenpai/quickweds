export const THANK_YOU_DEFAULT_MESSAGE = `Thank you for celebrating our special day with us. Your presence, love, and support made our wedding even more meaningful. We are so grateful to have shared this beautiful moment with you.

With love,
[Couple Names]`;

export const THANK_YOU_TEMPLATE_IDS = [
    'elegant-classic',
    'modern-minimal',
    'romantic-floral',
    'photo-highlight',
    'simple-warm',
] as const;

export type ThankYouTemplateId = typeof THANK_YOU_TEMPLATE_IDS[number];

export type ThankYouStyle = {
    accentColor: string;
    fontFamily: string;
};

export type ThankYouTemplate = {
    id: ThankYouTemplateId;
    name: string;
    description: string;
    eyebrow: string;
    defaultStyle: ThankYouStyle;
    supportsPhoto: boolean;
    previewClassName: string;
};

export type ThankYouEmailInput = {
    recipientName?: string;
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
    message?: string;
    personalizedMessage?: string;
    coupleSignature?: string;
    templateId?: string;
    style?: Partial<ThankYouStyle>;
    photoUrl?: string;
};

export const THANK_YOU_FONT_OPTIONS = [
    { value: 'Georgia, serif', label: 'Classic Serif' },
    { value: 'Arial, Helvetica, sans-serif', label: 'Modern Sans' },
    { value: 'Trebuchet MS, Arial, sans-serif', label: 'Warm Sans' },
    { value: 'Palatino, Palatino Linotype, serif', label: 'Romantic Serif' },
] as const;

export const THANK_YOU_COLOR_OPTIONS = [
    '#D16C78',
    '#A85F6A',
    '#86624E',
    '#4F6F64',
    '#2F3A45',
    '#B4778A',
] as const;

export const THANK_YOU_TEMPLATES: ThankYouTemplate[] = [
    {
        id: 'elegant-classic',
        name: 'Elegant Classic',
        description: 'A soft serif card with formal spacing and a timeless finish.',
        eyebrow: 'With gratitude',
        defaultStyle: { accentColor: '#D16C78', fontFamily: 'Georgia, serif' },
        supportsPhoto: false,
        previewClassName: 'border-primary/20 bg-[#fffaf7]',
    },
    {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Clean typography, quiet borders, and a polished editorial card.',
        eyebrow: 'Thank you',
        defaultStyle: { accentColor: '#2F3A45', fontFamily: 'Arial, Helvetica, sans-serif' },
        supportsPhoto: false,
        previewClassName: 'border-slate-200 bg-white',
    },
    {
        id: 'romantic-floral',
        name: 'Romantic Floral',
        description: 'Warm blush tones with delicate floral-inspired framing.',
        eyebrow: 'Forever thankful',
        defaultStyle: { accentColor: '#B4778A', fontFamily: 'Palatino, Palatino Linotype, serif' },
        supportsPhoto: false,
        previewClassName: 'border-rose-200 bg-[#fff7fa]',
    },
    {
        id: 'photo-highlight',
        name: 'Photo Highlight',
        description: 'A photo-first design for sharing a favorite wedding moment.',
        eyebrow: 'A memory with you',
        defaultStyle: { accentColor: '#86624E', fontFamily: 'Georgia, serif' },
        supportsPhoto: true,
        previewClassName: 'border-stone-200 bg-[#fffaf2]',
    },
    {
        id: 'simple-warm',
        name: 'Simple Warm',
        description: 'Friendly, readable, and personal for a heartfelt follow-up.',
        eyebrow: 'From our hearts',
        defaultStyle: { accentColor: '#4F6F64', fontFamily: 'Trebuchet MS, Arial, sans-serif' },
        supportsPhoto: false,
        previewClassName: 'border-emerald-100 bg-[#fbfff9]',
    },
];

const TEMPLATE_LOOKUP = new Map<ThankYouTemplateId, ThankYouTemplate>(
    THANK_YOU_TEMPLATES.map((template) => [template.id, template])
);

export function isThankYouTemplateId(value: string): value is ThankYouTemplateId {
    return THANK_YOU_TEMPLATE_IDS.includes(value as ThankYouTemplateId);
}

export function getThankYouTemplate(templateId?: string) {
    if (templateId && isThankYouTemplateId(templateId)) {
        return TEMPLATE_LOOKUP.get(templateId) || THANK_YOU_TEMPLATES[0];
    }
    return THANK_YOU_TEMPLATES[0];
}

export function getDefaultCoupleSignature(brideName?: string | null, groomName?: string | null) {
    const names = [brideName, groomName].map((name) => String(name || '').trim()).filter(Boolean);
    return names.length > 0 ? names.join(' & ') : 'The happy couple';
}

export function normalizeThankYouColor(value: unknown, fallback = '#D16C78') {
    const color = String(value || '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

export function normalizeThankYouFont(value: unknown, fallback: string = THANK_YOU_FONT_OPTIONS[0].value) {
    const font = String(value || '').trim();
    return THANK_YOU_FONT_OPTIONS.some((option) => option.value === font) ? font : fallback;
}

export function normalizeThankYouStyle(templateId?: string, style?: Partial<ThankYouStyle>): ThankYouStyle {
    const template = getThankYouTemplate(templateId);
    return {
        accentColor: normalizeThankYouColor(style?.accentColor, template.defaultStyle.accentColor),
        fontFamily: normalizeThankYouFont(style?.fontFamily, template.defaultStyle.fontFamily),
    };
}

export function normalizeThankYouPhotoUrl(value: unknown) {
    const url = String(value || '').trim();
    if (!url) return '';

    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
        return parsed.toString();
    } catch {
        return '';
    }
}

export function buildThankYouSubject(brideName?: string | null, groomName?: string | null) {
    const signature = getDefaultCoupleSignature(brideName, groomName);
    return `Thank you from ${signature}`;
}

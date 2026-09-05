export type EntourageProposalTemplateKey = 'heartfelt' | 'elegant' | 'simple' | 'playful' | 'formal';
export type EntourageCardThemeKey = 'classic' | 'blush' | 'emerald' | 'midnight' | 'gold';

export type EntourageProposalTemplate = {
    key: EntourageProposalTemplateKey;
    alias: string;
    label: string;
    description: string;
    defaultTitle: string;
    defaultMessage: string;
};

export type EntourageCardTheme = {
    key: EntourageCardThemeKey;
    label: string;
    bgClass: string;
    borderClass: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    accentClass: string;
    badgeBg: string;
    badgeText: string;
    previewBg: string;
};

export const ENTOURAGE_PROPOSAL_TEMPLATES: EntourageProposalTemplate[] = [
    {
        key: 'heartfelt',
        alias: 'quickweds-entourage-heartfelt',
        label: 'Heartfelt',
        description: 'Warm and personal for close family and friends.',
        defaultTitle: 'Will you stand by our side?',
        defaultMessage: 'You have been such an important part of our story, and it would mean so much to have you standing with us on our wedding day.',
    },
    {
        key: 'elegant',
        alias: 'quickweds-entourage-elegant',
        label: 'Elegant',
        description: 'Polished and formal for a classic invitation tone.',
        defaultTitle: 'You are cordially invited to join our Entourage',
        defaultMessage: 'We would be honored if you would join our wedding entourage and share in this meaningful role on our special day.',
    },
    {
        key: 'simple',
        alias: 'quickweds-entourage-simple',
        label: 'Simple',
        description: 'Short, clear, and easy to personalize.',
        defaultTitle: 'Be part of our special day!',
        defaultMessage: 'We would love for you to be part of our wedding entourage. Will you join us?',
    },
    {
        key: 'playful',
        alias: 'quickweds-entourage-playful',
        label: 'Playful & Fun',
        description: 'Upbeat and fun for best friends and squad members.',
        defaultTitle: 'Suit up / Dress up! The squad needs you.',
        defaultMessage: 'We are getting married, and there is no way we are doing this without you! Will you join our wedding party?',
    },
    {
        key: 'formal',
        alias: 'quickweds-entourage-formal',
        label: 'Principal Sponsor / Formal',
        description: 'Respectful and honored tone for sponsors and elders.',
        defaultTitle: 'We would be deeply honored by your presence',
        defaultMessage: 'As we step into marriage, your guidance and presence mean the world to us. We request the honor of your participation as our Principal Sponsor.',
    },
];

export const ENTOURAGE_CARD_THEMES: Record<EntourageCardThemeKey, EntourageCardTheme> = {
    classic: {
        key: 'classic',
        label: 'Classic Cream',
        bgClass: 'bg-amber-50/60',
        borderClass: 'border-amber-200/60',
        cardBg: 'bg-white',
        textPrimary: 'text-amber-950',
        textSecondary: 'text-amber-800/80',
        accentClass: 'bg-amber-800 text-white hover:bg-amber-900',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-900',
        previewBg: 'from-amber-50 to-orange-50',
    },
    blush: {
        key: 'blush',
        label: 'Romantic Blush',
        bgClass: 'bg-rose-50/60',
        borderClass: 'border-rose-200/60',
        cardBg: 'bg-white',
        textPrimary: 'text-rose-950',
        textSecondary: 'text-rose-800/80',
        accentClass: 'bg-rose-600 text-white hover:bg-rose-700',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-900',
        previewBg: 'from-rose-50 to-pink-100',
    },
    emerald: {
        key: 'emerald',
        label: 'Emerald Luxe',
        bgClass: 'bg-emerald-50/60',
        borderClass: 'border-emerald-200/60',
        cardBg: 'bg-white',
        textPrimary: 'text-emerald-950',
        textSecondary: 'text-emerald-800/80',
        accentClass: 'bg-emerald-700 text-white hover:bg-emerald-800',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-900',
        previewBg: 'from-emerald-50 to-teal-100',
    },
    midnight: {
        key: 'midnight',
        label: 'Midnight Charcoal',
        bgClass: 'bg-slate-900',
        borderClass: 'border-slate-700',
        cardBg: 'bg-slate-800',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-300',
        accentClass: 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold',
        badgeBg: 'bg-slate-700',
        badgeText: 'text-amber-300',
        previewBg: 'from-slate-900 to-slate-800',
    },
    gold: {
        key: 'gold',
        label: 'Golden Glam',
        bgClass: 'bg-yellow-50/60',
        borderClass: 'border-yellow-300/60',
        cardBg: 'bg-white',
        textPrimary: 'text-yellow-950',
        textSecondary: 'text-yellow-900/80',
        accentClass: 'bg-yellow-600 text-white hover:bg-yellow-700',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-900',
        previewBg: 'from-yellow-50 to-amber-100',
    },
};

export const DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY: EntourageProposalTemplateKey = 'heartfelt';
export const DEFAULT_ENTOURAGE_CARD_THEME_KEY: EntourageCardThemeKey = 'classic';

export function getEntourageProposalTemplate(key?: string | null): EntourageProposalTemplate {
    return ENTOURAGE_PROPOSAL_TEMPLATES.find((template) => template.key === key)
        || ENTOURAGE_PROPOSAL_TEMPLATES[0];
}

export function getEntourageCardTheme(key?: string | null): EntourageCardTheme {
    const themeKey = (key as EntourageCardThemeKey) || DEFAULT_ENTOURAGE_CARD_THEME_KEY;
    return ENTOURAGE_CARD_THEMES[themeKey] || ENTOURAGE_CARD_THEMES.classic;
}

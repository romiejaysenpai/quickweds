export type EntourageProposalTemplateKey = 'heartfelt' | 'elegant' | 'simple';

export type EntourageProposalTemplate = {
    key: EntourageProposalTemplateKey;
    alias: string;
    label: string;
    description: string;
    defaultMessage: string;
};

export const ENTOURAGE_PROPOSAL_TEMPLATES: EntourageProposalTemplate[] = [
    {
        key: 'heartfelt',
        alias: 'quickweds-entourage-heartfelt',
        label: 'Heartfelt',
        description: 'Warm and personal for close family and friends.',
        defaultMessage: 'You have been such an important part of our story, and it would mean so much to have you standing with us on our wedding day.',
    },
    {
        key: 'elegant',
        alias: 'quickweds-entourage-elegant',
        label: 'Elegant',
        description: 'Polished and formal for a classic invitation tone.',
        defaultMessage: 'We would be honored if you would join our wedding entourage and share in this meaningful role on our special day.',
    },
    {
        key: 'simple',
        alias: 'quickweds-entourage-simple',
        label: 'Simple',
        description: 'Short, clear, and easy to personalize.',
        defaultMessage: 'We would love for you to be part of our wedding entourage. Will you join us?',
    },
];

export const DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY: EntourageProposalTemplateKey = 'heartfelt';

export function getEntourageProposalTemplate(key?: string | null) {
    return ENTOURAGE_PROPOSAL_TEMPLATES.find((template) => template.key === key)
        || ENTOURAGE_PROPOSAL_TEMPLATES[0];
}


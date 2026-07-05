export type WeddingHealthSeverity = 'critical' | 'warning' | 'suggestion';

export type WeddingHealthItem = {
    id: string;
    title: string;
    description: string;
    severity: WeddingHealthSeverity;
    stepIndex: number;
    stepLabel: string;
};

export type WeddingPublishHealthSummary = {
    score: number;
    status: 'ready' | 'needs_attention' | 'blocked';
    completedChecks: number;
    totalChecks: number;
    criticalItems: WeddingHealthItem[];
    warningItems: WeddingHealthItem[];
    suggestionItems: WeddingHealthItem[];
    items: WeddingHealthItem[];
};

export type WeddingPublishHealthMedia = {
    heroImage?: boolean;
    couplePhoto?: boolean;
    giftQr?: boolean;
    backgroundMusic?: boolean;
    galleryCount?: number;
    invitationCount?: number;
};

const STEP_LABELS = [
    'Details',
    'Layout',
    'Style',
    'Monogram',
    'Media',
    'Dress Code',
    'Gifts',
    'RSVP',
    'Timeline',
    'FAQs',
];

function hasText(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0;
}

function hasArrayItems(value: unknown) {
    return Array.isArray(value) && value.length > 0;
}

function hasCompletedFaq(value: unknown) {
    return Array.isArray(value) && value.some((item) => {
        if (!item || typeof item !== 'object') return false;
        const faq = item as { question?: unknown; answer?: unknown };
        return hasText(faq.question) && hasText(faq.answer);
    });
}

function parseDate(value: unknown) {
    if (!hasText(value)) return null;
    const date = new Date(String(value));
    return Number.isFinite(date.getTime()) ? date : null;
}

function createItem(
    id: string,
    title: string,
    description: string,
    severity: WeddingHealthSeverity,
    stepIndex: number
): WeddingHealthItem {
    return {
        id,
        title,
        description,
        severity,
        stepIndex,
        stepLabel: STEP_LABELS[stepIndex] || 'Builder',
    };
}

export function evaluateWeddingPublishHealth(
    formData: Record<string, unknown>,
    media: WeddingPublishHealthMedia = {}
): WeddingPublishHealthSummary {
    const items: WeddingHealthItem[] = [];
    const weddingDate = parseDate(formData.weddingDate);
    const rsvpDeadline = parseDate(formData.rsvpDeadline);
    const galleryCount = Number(media.galleryCount || 0);
    const hasGiftDetails = hasText(formData.giftBank)
        || hasText(formData.giftAccountName)
        || hasText(formData.giftAccountNumber)
        || Boolean(media.giftQr)
        || hasArrayItems(formData.registryLinks)
        || hasArrayItems(formData.cashFunds)
        || hasArrayItems(formData.paymentLinks);

    if (!hasText(formData.brideName) || !hasText(formData.groomName)) {
        items.push(createItem(
            'couple-names',
            'Add both couple names',
            'The public invitation needs both names for the hero, footer, QR sharing text, and generated links.',
            'critical',
            0
        ));
    }

    if (!weddingDate || !hasText(formData.weddingTime)) {
        items.push(createItem(
            'date-time',
            'Add wedding date and time',
            'Guests need a complete schedule before the invitation should be published.',
            'critical',
            0
        ));
    }

    if (!hasText(formData.venueName) || !hasText(formData.venueAddress)) {
        items.push(createItem(
            'venue',
            'Add ceremony venue details',
            'A venue name and address are required so guests know where to go.',
            'critical',
            0
        ));
    }

    if (!rsvpDeadline) {
        items.push(createItem(
            'rsvp-deadline',
            'Add an RSVP deadline',
            'The RSVP form uses the deadline to set guest expectations and close late responses.',
            'critical',
            7
        ));
    } else if (weddingDate && rsvpDeadline > weddingDate) {
        items.push(createItem(
            'rsvp-after-wedding',
            'Move the RSVP deadline before the wedding',
            'The RSVP deadline is currently after the wedding date.',
            'critical',
            7
        ));
    }

    if (!hasText(formData.mapsLink)) {
        items.push(createItem(
            'map-link',
            'Add a map link',
            'A Google Maps or venue map link reduces day-of guest confusion.',
            'warning',
            0
        ));
    }

    if (!media.heroImage && !media.couplePhoto) {
        items.push(createItem(
            'hero-media',
            'Add a hero or couple photo',
            'Templates look much stronger when the first screen has a real couple image.',
            'warning',
            4
        ));
    }

    if (galleryCount < 3) {
        items.push(createItem(
            'gallery',
            'Add at least 3 gallery photos',
            'A small gallery helps the invitation feel personal and complete.',
            'warning',
            4
        ));
    }

    if (Boolean(formData.backgroundMusicEnabled) && !media.backgroundMusic) {
        items.push(createItem(
            'background-music-file',
            'Upload the selected background music',
            'Background music is enabled, but no audio file is attached yet.',
            'warning',
            4
        ));
    }

    if (!hasText(formData.contactPerson)) {
        items.push(createItem(
            'contact-person',
            'Add an RSVP contact person',
            'Guests need one person to contact if they have RSVP or day-of questions.',
            'warning',
            7
        ));
    }

    if (!hasText(formData.programTimeline)) {
        items.push(createItem(
            'timeline',
            'Add the wedding timeline',
            'A simple timeline helps guests know arrival, ceremony, reception, and party flow.',
            'warning',
            8
        ));
    }

    if (!hasText(formData.dressCode)) {
        items.push(createItem(
            'dress-code',
            'Add dress code guidance',
            'Dress code details reduce guest uncertainty and make photos more cohesive.',
            'warning',
            5
        ));
    }

    if (!hasGiftDetails) {
        items.push(createItem(
            'gift-details',
            'Add gift or registry details',
            'Gift details are optional, but many guests look for registry, cash fund, or bank transfer information.',
            'warning',
            6
        ));
    }

    if (!hasCompletedFaq(formData.faqItems)) {
        items.push(createItem(
            'faq',
            'Add guest FAQs',
            'FAQs are useful for parking, children, arrival time, plus-ones, and reception details.',
            'suggestion',
            9
        ));
    }

    if (!hasText(formData.story) && !hasText(formData.quote)) {
        items.push(createItem(
            'story',
            'Add a story or quote',
            'A short story or quote gives the invitation more warmth and context.',
            'suggestion',
            2
        ));
    }

    if (!hasText(formData.logoInitials)) {
        items.push(createItem(
            'monogram',
            'Add a monogram',
            'A monogram gives the site, footer, and opening reveal a more polished identity.',
            'suggestion',
            3
        ));
    }

    if (!hasText(formData.hashtag)) {
        items.push(createItem(
            'hashtag',
            'Add a wedding hashtag',
            'A hashtag can help guests tag and find social posts after the event.',
            'suggestion',
            0
        ));
    }

    const totalChecks = 16;
    const completedChecks = Math.max(0, totalChecks - items.length);
    const criticalItems = items.filter((item) => item.severity === 'critical');
    const warningItems = items.filter((item) => item.severity === 'warning');
    const suggestionItems = items.filter((item) => item.severity === 'suggestion');

    return {
        score: Math.round((completedChecks / totalChecks) * 100),
        status: criticalItems.length > 0 ? 'blocked' : warningItems.length > 0 ? 'needs_attention' : 'ready',
        completedChecks,
        totalChecks,
        criticalItems,
        warningItems,
        suggestionItems,
        items,
    };
}

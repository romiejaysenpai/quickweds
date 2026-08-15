import 'server-only';

import { revalidateTag, unstable_cache } from 'next/cache';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';
import { redisDel, redisJsonGet, redisJsonSet } from '@/lib/redis';

export const PUBLIC_WEDDING_FIELDS = [
    'id',
    'public_slug',
    'bride_name',
    'groom_name',
    'wedding_date',
    'wedding_time',
    'venue_name',
    'venue_address',
    'maps_link',
    'reception_venue_name',
    'reception_venue_address',
    'reception_maps_link',
    'reception_venue_photos',
    'story',
    'quote',
    'hero_image',
    'couple_photo',
    'teaser_video',
    'gallery_images',
    'gallery_layout',
    'custom_domain',
    'template',
    'template_style',
    'card_style',
    'section_title_font_style',
    'section_title_color_style',
    'font_style',
    'motif_color',
    'dress_code',
    'contact_person',
    'hashtag',
    'rsvp_deadline',
    'rsvp_events',
    'program_timeline',
    'faq_items',
    'invitation_image',
    'accent_style',
    'logo_initials',
    'logo_shape',
    'logo_color',
    'logo_font',
    'logo_animation',
    'gift_bank',
    'gift_account_name',
    'gift_account_number',
    'gift_qr_image',
    'gift_registry_links',
    'cash_funds',
    'payment_links',
    'wedding_party',
    'include_entourage_section',
    'spotify_playlist_url',
    'background_music_url',
    'background_music_title',
    'background_music_enabled',
    'is_save_the_date',
    'is_thank_you_mode',
    'thank_you_message',
    'photo_album_link',
    'voice_greeting_url',
    'created_at',
    'updated_at',
] as const;

function normalizeWeddingParty(value: unknown) {
    const parsePartyValue = (partyValue: unknown): unknown[] => {
        if (Array.isArray(partyValue)) return partyValue;

        if (partyValue && typeof partyValue === 'object') {
            const record = partyValue as Record<string, unknown>;
            if (Array.isArray(record.members)) return record.members;
            if (Array.isArray(record.wedding_party)) return record.wedding_party;
        }

        if (typeof partyValue !== 'string' || partyValue.trim().length === 0) return [];

        try {
            return parsePartyValue(JSON.parse(partyValue));
        } catch {
            return [];
        }
    };

    return parsePartyValue(value)
        .filter((member): member is Record<string, unknown> => Boolean(member) && typeof member === 'object')
        .map((member) => ({
            memberKey: typeof member.memberKey === 'string' ? member.memberKey.trim() : '',
            id: typeof member.id === 'string' ? member.id.trim() : '',
            name: String(member.name || '').trim(),
            role: String(member.role || '').trim(),
            bio: typeof member.bio === 'string' ? member.bio.trim() : '',
            email: typeof member.email === 'string' ? member.email.trim() : '',
            proposalTemplateKey: typeof member.proposalTemplateKey === 'string' ? member.proposalTemplateKey : undefined,
            proposalMessage: typeof member.proposalMessage === 'string' ? member.proposalMessage.trim() : '',
            photo: typeof member.photo === 'string' ? member.photo.trim() : '',
        }))
        .filter((member) => member.name.length > 0);
}

function normalizeSectionTitleColorStyle(value: unknown) {
    return typeof value === 'string' && value.trim() && value !== 'default' ? value : 'motif';
}

export function toPublicWedding(record: Record<string, unknown>) {
    const publicWedding = PUBLIC_WEDDING_FIELDS.reduce<Record<string, unknown>>((publicWedding, field) => {
        if (field in record) {
            publicWedding[field] = record[field];
        }
        return publicWedding;
    }, {});

    return {
        ...publicWedding,
        reception_venue_photos: publicWedding.reception_venue_photos ?? [],
        gallery_images: publicWedding.gallery_images ?? [],
        rsvp_events: Array.isArray(publicWedding.rsvp_events) ? publicWedding.rsvp_events : [],
        gallery_layout: typeof publicWedding.gallery_layout === 'string' && publicWedding.gallery_layout
            ? publicWedding.gallery_layout
            : 'auto',
        template_style: typeof publicWedding.template_style === 'string' && publicWedding.template_style
            ? publicWedding.template_style
            : 'default',
        section_title_font_style: typeof publicWedding.section_title_font_style === 'string' && publicWedding.section_title_font_style
            ? publicWedding.section_title_font_style
            : 'default',
        section_title_color_style: normalizeSectionTitleColorStyle(publicWedding.section_title_color_style),
        wedding_party: normalizeWeddingParty(publicWedding.wedding_party),
        include_entourage_section: publicWedding.include_entourage_section === false ? false : true,
        background_music_enabled: publicWedding.background_music_enabled === true,
        is_save_the_date: publicWedding.is_save_the_date === true,
        is_thank_you_mode: publicWedding.is_thank_you_mode === true,
    };
}

export function getSupabaseErrorMessage(error: unknown) {
    if (!error) return '';
    if (error instanceof Error) return error.message;
    if (typeof error === 'object') {
        const value = error as Record<string, unknown>;
        return [value.message, value.details, value.hint, value.code]
            .filter(Boolean)
            .map((item) => String(item))
            .join(' ');
    }
    return String(error);
}

function publicWeddingCacheKey(rawIdentifier: string) {
    return `quickweds:wedding:public:${rawIdentifier}`;
}

function isMissingOptionalColumnError(error: unknown, columns: readonly string[]) {
    const message = getSupabaseErrorMessage(error).toLowerCase();
    return columns.some((column) => message.includes(column.toLowerCase())) && (
        message.includes('column') ||
        message.includes('schema cache') ||
        message.includes('could not find') ||
        message.includes('does not exist') ||
        message.includes('pgrst204') ||
        message.includes('42703')
    );
}

function getTemplateTestWedding(rawIdentifier: string) {
    if (!rawIdentifier.startsWith('template-')) return null;

    const includeEntourageSection = !rawIdentifier.endsWith('-no-entourage');
    const template = rawIdentifier.replace(/^template-/, '').replace(/-no-entourage$/, '') || 'classic';
    const imageData =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600"%3E%3Crect width="1200" height="1600" fill="%23f4d7c8"/%3E%3Ccircle cx="600" cy="620" r="260" fill="%23d16c78" opacity=".35"/%3E%3Cpath d="M260 1120c180-210 420-210 600 0" fill="none" stroke="%233a2a2d" stroke-width="32" stroke-linecap="round"/%3E%3C/svg%3E';

    return toPublicWedding({
        id: rawIdentifier,
        public_slug: rawIdentifier,
        bride_name: 'Amelia Rose',
        groom_name: 'Mateo James',
        wedding_date: '2027-06-20',
        wedding_time: '4:30 PM',
        venue_name: 'The Glass Garden Estate',
        venue_address: '123 Celebration Lane, Napa, CA',
        maps_link: 'https://maps.google.com/?q=The+Glass+Garden+Estate',
        reception_venue_name: 'The Glass Garden Reception Hall',
        reception_venue_address: '125 Celebration Lane, Napa, CA',
        reception_maps_link: 'https://maps.google.com/?q=The+Glass+Garden+Reception+Hall',
        reception_venue_photos: JSON.stringify([imageData, imageData, imageData]),
        story: 'We met on a rainy afternoon and have been finding sunshine together ever since.',
        quote: 'Together is our favorite place to be.',
        hero_image: imageData,
        couple_photo: imageData,
        teaser_video: '',
        gallery_images: JSON.stringify([imageData, imageData, imageData, imageData, imageData, imageData]),
        gallery_layout: 'auto',
        custom_domain: '',
        template,
        template_style: 'default',
        section_title_font_style: 'default',
        section_title_color_style: 'motif',
        font_style: 'Elegant',
        motif_color: template === 'midnight' || template === 'royal' ? '#D6B87C' : '#D16C78',
        dress_code: 'Formal garden attire||Blush, sage, champagne',
        contact_person: 'Lena, Wedding Coordinator',
        hashtag: 'AmeliaAndMateo',
        rsvp_deadline: '2027-05-01',
        program_timeline: '4:30 PM - Ceremony\n5:30 PM - Cocktails\n7:00 PM - Dinner\n8:30 PM - Dancing',
        faq_items: JSON.stringify([
            { question: 'Can I bring a plus one?', answer: 'Please refer to the names listed on your invitation.' },
            { question: 'Is parking available?', answer: 'Yes, valet and self-parking are available at the venue.' },
        ]),
        invitation_image: imageData,
        accent_style: 'none',
        logo_initials: 'AM',
        logo_shape: 'circle',
        logo_color: '',
        logo_font: 'serif',
        logo_animation: 'none',
        gift_bank: 'QuickWeds Bank',
        gift_account_name: 'Amelia Rose and Mateo James',
        gift_account_number: '1234 5678 9012',
        gift_qr_image: imageData,
        gift_registry_links: JSON.stringify([{ title: 'Home Registry', url: 'https://example.com/registry' }]),
        cash_funds: JSON.stringify([{ title: 'Honeymoon Fund', description: 'A little help for our first adventure.', targetAmount: 5000, current: 1200, currency: '$' }]),
        payment_links: JSON.stringify([{ label: 'PayPal', url: 'https://example.com/pay' }]),
        wedding_party: JSON.stringify([{ name: 'Lena Park', role: 'Maid of Honor', bio: 'Best friend and dance floor captain.' }]),
        include_entourage_section: includeEntourageSection,
        spotify_playlist_url: 'https://open.spotify.com/',
        background_music_url: '',
        background_music_title: 'Our Wedding Song',
        background_music_enabled: false,
        is_save_the_date: false,
        is_thank_you_mode: false,
        thank_you_message: '',
        photo_album_link: '',
        voice_greeting_url: '',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    });
}

async function loadPublicWedding(rawIdentifier: string) {
    const templateTestWedding = getTemplateTestWedding(rawIdentifier);
    if (templateTestWedding) return templateTestWedding;

    // CI/browser tests must never fall back to a configured Supabase project
    // for unknown identifiers. Public template fixtures above remain available.
    if (process.env.E2E_TEST_MODE === 'true') return null;

    const cached = await redisJsonGet<Record<string, unknown>>(publicWeddingCacheKey(rawIdentifier));
    if (cached) return cached;

    const db = getSupabaseAdminClient() as any;
    const { wedding, error, identifier } = await resolvePublicWeddingByIdentifier(
        db,
        rawIdentifier,
        PUBLIC_WEDDING_FIELDS.join(',')
    );

    if (error && isMissingOptionalColumnError(error, ['background_music_url', 'background_music_title', 'background_music_enabled'])) {
        const fallbackFields = PUBLIC_WEDDING_FIELDS.filter((field) => ![
            'background_music_url',
            'background_music_title',
            'background_music_enabled',
        ].includes(field));
        const fallback = await resolvePublicWeddingByIdentifier(db, rawIdentifier, fallbackFields.join(','));

        if (fallback.error) throw fallback.error;
        if (!fallback.identifier || !fallback.wedding) return null;

        const publicWedding = toPublicWedding(fallback.wedding);
        await redisJsonSet(publicWeddingCacheKey(rawIdentifier), publicWedding, 10 * 60);
        return publicWedding;
    }

    if (error) throw error;
    if (!identifier || !wedding) return null;

    const publicWedding = toPublicWedding(wedding);
    const cacheableWedding = publicWedding as Record<string, unknown>;
    await Promise.all([
        redisJsonSet(publicWeddingCacheKey(rawIdentifier), publicWedding, 10 * 60),
        typeof cacheableWedding.public_slug === 'string' && cacheableWedding.public_slug !== rawIdentifier
            ? redisJsonSet(publicWeddingCacheKey(cacheableWedding.public_slug), publicWedding, 10 * 60)
            : Promise.resolve(false),
        typeof cacheableWedding.id === 'string' && cacheableWedding.id !== rawIdentifier
            ? redisJsonSet(publicWeddingCacheKey(cacheableWedding.id), publicWedding, 10 * 60)
            : Promise.resolve(false),
    ]);
    return publicWedding;
}

export async function invalidateWeddingPublicCache(...identifiers: Array<string | null | undefined>) {
    const keys = identifiers
        .filter((identifier): identifier is string => typeof identifier === 'string' && identifier.trim().length > 0)
        .map((identifier) => publicWeddingCacheKey(identifier.trim()));

    await redisDel(...keys);
    revalidateTag('public-wedding', 'max');
}

export const getCachedPublicWedding = unstable_cache(
    async (rawIdentifier: string) => loadPublicWedding(rawIdentifier),
    ['public-wedding'],
    { revalidate: 60, tags: ['public-wedding'] }
);

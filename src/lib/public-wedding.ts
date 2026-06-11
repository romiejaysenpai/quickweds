import 'server-only';

import { unstable_cache } from 'next/cache';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';

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
    'story',
    'quote',
    'hero_image',
    'couple_photo',
    'teaser_video',
    'gallery_images',
    'custom_domain',
    'template',
    'font_style',
    'motif_color',
    'dress_code',
    'contact_person',
    'hashtag',
    'rsvp_deadline',
    'program_timeline',
    'faq_items',
    'invitation_image',
    'accent_style',
    'logo_initials',
    'logo_shape',
    'logo_color',
    'logo_font',
    'gift_bank',
    'gift_account_name',
    'gift_account_number',
    'gift_qr_image',
    'gift_registry_links',
    'cash_funds',
    'payment_links',
    'wedding_party',
    'spotify_playlist_url',
    'is_save_the_date',
    'is_thank_you_mode',
    'thank_you_message',
    'photo_album_link',
    'voice_greeting_url',
    'created_at',
    'updated_at',
] as const;

export function toPublicWedding(record: Record<string, unknown>) {
    return PUBLIC_WEDDING_FIELDS.reduce<Record<string, unknown>>((publicWedding, field) => {
        if (field in record) {
            publicWedding[field] = record[field];
        }
        return publicWedding;
    }, {});
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

function getTemplateTestWedding(rawIdentifier: string) {
    if (process.env.NODE_ENV === 'production') return null;
    if (!rawIdentifier.startsWith('template-')) return null;

    const template = rawIdentifier.replace(/^template-/, '') || 'classic';
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
        story: 'We met on a rainy afternoon and have been finding sunshine together ever since.',
        quote: 'Together is our favorite place to be.',
        hero_image: imageData,
        couple_photo: imageData,
        teaser_video: '',
        gallery_images: JSON.stringify([imageData, imageData, imageData, imageData, imageData, imageData]),
        custom_domain: '',
        template,
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
        gift_bank: 'QuickWeds Bank',
        gift_account_name: 'Amelia Rose and Mateo James',
        gift_account_number: '1234 5678 9012',
        gift_qr_image: imageData,
        gift_registry_links: JSON.stringify([{ title: 'Home Registry', url: 'https://example.com/registry' }]),
        cash_funds: JSON.stringify([{ title: 'Honeymoon Fund', description: 'A little help for our first adventure.', targetAmount: 5000, current: 1200, currency: '$' }]),
        payment_links: JSON.stringify([{ label: 'PayPal', url: 'https://example.com/pay' }]),
        wedding_party: JSON.stringify([{ name: 'Lena Park', role: 'Maid of Honor', bio: 'Best friend and dance floor captain.' }]),
        spotify_playlist_url: 'https://open.spotify.com/',
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

    const db = getSupabaseAdminClient() as any;
    const { wedding, error, identifier } = await resolvePublicWeddingByIdentifier(
        db,
        rawIdentifier,
        PUBLIC_WEDDING_FIELDS.join(',')
    );

    if (error) throw error;
    if (!identifier || !wedding) return null;

    return toPublicWedding(wedding);
}

export const getCachedPublicWedding = unstable_cache(
    async (rawIdentifier: string) => loadPublicWedding(rawIdentifier),
    ['public-wedding'],
    { revalidate: 60, tags: ['public-wedding'] }
);

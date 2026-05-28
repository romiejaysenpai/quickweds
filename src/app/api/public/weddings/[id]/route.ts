import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limiter';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';
import { getCachedServerValue } from '@/lib/server-cache';

export const dynamic = 'force-dynamic';

const PUBLIC_WEDDING_CACHE_TTL_MS = 60 * 1000;

const PUBLIC_WEDDING_FIELDS = [
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

function toPublicWedding(record: Record<string, unknown>) {
    return PUBLIC_WEDDING_FIELDS.reduce<Record<string, unknown>>((publicWedding, field) => {
        if (field in record) {
            publicWedding[field] = record[field];
        }
        return publicWedding;
    }, {});
}

function getSupabaseErrorMessage(error: unknown) {
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const rawIdentifier = String(id || '');

    const rateLimit = createRateLimitMiddleware('WEDDING_PAGE_VIEW');
    const limited = rateLimit.check(`${getClientIP(req)}:${rawIdentifier}`);
    if (limited.limited) return limited.response;

    try {
        const { value, cacheStatus } = await getCachedServerValue(
            `public-wedding:${rawIdentifier}`,
            PUBLIC_WEDDING_CACHE_TTL_MS,
            async () => {
                const db = getSupabaseAdminClient() as any;
                const { wedding, error, identifier } = await resolvePublicWeddingByIdentifier(db, rawIdentifier, '*');

                if (error) throw error;

                return {
                    identifier,
                    wedding: wedding ? toPublicWedding(wedding) : null,
                };
            }
        );

        if (!value.identifier || !value.wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        return NextResponse.json(
            { wedding: value.wedding },
            {
                headers: {
                    ...limited.headers,
                    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                    'X-QuickWeds-Cache': cacheStatus,
                },
            }
        );
    } catch (error) {
        const message = getSupabaseErrorMessage(error) || 'Unable to load wedding.';
        console.error('Public wedding load failed:', message);
        return NextResponse.json({ error: 'Unable to load wedding.' }, { status: 500 });
    }
}

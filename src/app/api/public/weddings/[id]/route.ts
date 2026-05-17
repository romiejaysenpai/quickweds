import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

const PUBLIC_WEDDING_COLUMNS = [
    'id',
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
].join(', ');

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const weddingId = sanitizeWeddingId(id);
    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
    }

    const rateLimit = createRateLimitMiddleware('WEDDING_PAGE_VIEW');
    const limited = rateLimit.check(`${getClientIP(req)}:${weddingId}`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('weddings')
            .select(PUBLIC_WEDDING_COLUMNS)
            .eq('id', weddingId)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        return NextResponse.json(
            { wedding: data },
            {
                headers: {
                    ...limited.headers,
                    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load wedding.';
        console.error('Public wedding load failed:', message);
        return NextResponse.json({ error: 'Unable to load wedding.' }, { status: 500 });
    }
}

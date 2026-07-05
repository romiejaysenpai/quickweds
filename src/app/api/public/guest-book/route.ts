import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limit';

const GUEST_BOOK_COLUMNS = 'id, guest_name, message, photo_url, created_at';

export async function GET(req: NextRequest) {
    const weddingId = sanitizeWeddingId(req.nextUrl.searchParams.get('weddingId') || '');
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    const rateLimit = createRateLimitMiddleware('WEDDING_READ');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}:guest-book`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('guest_book')
            .select(GUEST_BOOK_COLUMNS)
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return NextResponse.json(
            { entries: data || [] },
            { headers: { ...limited.headers, 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load guest book.';
        console.error('Guest book load failed:', message);
        return NextResponse.json({ error: 'Unable to load guest book.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(body.weddingId || '');
    const guestName = sanitizeInput(body.guestName || '', { maxLength: 120 });
    const message = sanitizeInput(body.message || '', { maxLength: 1000, allowNewlines: true });

    if (!weddingId || !guestName || !message) {
        return NextResponse.json({ error: 'Wedding ID, name, and message are required.' }, { status: 400 });
    }

    const rateLimit = createRateLimitMiddleware('GUEST_BOOK');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id')
            .eq('id', weddingId)
            .is('deleted_at', null)
            .maybeSingle();

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        const { data, error } = await db
            .from('guest_book')
            .insert({
                wedding_id: weddingId,
                guest_name: guestName,
                message,
            })
            .select(GUEST_BOOK_COLUMNS)
            .single();

        if (error) throw error;
        return NextResponse.json({ entry: data }, { headers: limited.headers });
    } catch (error) {
        const detail = error instanceof Error ? error.message : 'Unable to sign guest book.';
        console.error('Guest book submit failed:', detail);
        return NextResponse.json({ error: 'Unable to sign guest book.' }, { status: 500 });
    }
}

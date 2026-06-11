import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limiter';
import { getCachedPublicWedding, getSupabaseErrorMessage } from '@/lib/public-wedding';

export const revalidate = 60;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const rawIdentifier = String(id || '');

    const rateLimit = createRateLimitMiddleware('WEDDING_PAGE_VIEW');
    const limited = rateLimit.check(`${getClientIP(req)}:${rawIdentifier}`);
    if (limited.limited) return limited.response;

    try {
        const wedding = await getCachedPublicWedding(rawIdentifier);
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        return NextResponse.json(
            { wedding },
            {
                headers: {
                    ...limited.headers,
                    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (error) {
        const message = getSupabaseErrorMessage(error) || 'Unable to load wedding.';
        console.error('Public wedding load failed:', message);
        return NextResponse.json({ error: 'Unable to load wedding.' }, { status: 500 });
    }
}

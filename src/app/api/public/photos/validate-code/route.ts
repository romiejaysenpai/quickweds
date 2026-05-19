import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeInput } from '@/lib/rate-limiter';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';

export const dynamic = 'force-dynamic';
const MAX_UPLOADS_PER_SHARING_CODE = 3;

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingIdentifier = String(body.weddingId || '');
    const code = sanitizeInput(String(body.code || ''), { maxLength: 32 }).toUpperCase();

    if (!weddingIdentifier || !code) {
        return NextResponse.json({ error: 'Wedding and sharing code are required.' }, { status: 400 });
    }

    const rateLimit = createRateLimitMiddleware('PHOTO_UPLOAD');
    const clientIP = getClientIP(req);
    const limited = rateLimit.check(`${clientIP}:${weddingIdentifier}:photo-code`);
    if (limited.limited) return limited.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const { wedding, error: weddingError } = await resolvePublicWeddingByIdentifier(db, weddingIdentifier, 'id');

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        const weddingId = wedding.id;

        const { data: sharingCode, error: codeError } = await db
            .from('photo_sharing_codes')
            .select('id, max_uploads, current_uploads')
            .eq('wedding_id', weddingId)
            .eq('code', code)
            .eq('is_active', true)
            .maybeSingle();

        if (codeError) throw codeError;
        if (!sharingCode) {
            return NextResponse.json({ error: 'Invalid or inactive sharing code. Please check with the couple.' }, { status: 403 });
        }

        const currentUploads = Number(sharingCode.current_uploads ?? 0);
        const codeLimit = Math.min(Number(sharingCode.max_uploads ?? MAX_UPLOADS_PER_SHARING_CODE), MAX_UPLOADS_PER_SHARING_CODE);
        const remainingUploads = Math.max(0, codeLimit - currentUploads);

        return NextResponse.json(
            {
                success: true,
                remainingUploads,
                maxUploads: codeLimit,
                currentUploads,
            },
            { headers: { ...limited.headers, 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to validate sharing code.';
        console.error('Photo sharing code validation failed:', message);
        return NextResponse.json({ error: 'Unable to validate sharing code.' }, { status: 500 });
    }
}

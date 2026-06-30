import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

const responseSchema = z.object({
    token: z.string().min(20).max(200),
    response: z.enum(['accepted', 'declined']),
});

function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

async function findInvitationByToken(token: string) {
    const db = getSupabaseAdminClient() as any;
    const tokenHash = hashToken(token);
    const { data, error } = await db
        .from('entourage_invitations')
        .select('id, wedding_id, member_key, name, email, role, message, template_key, status, sent_at, responded_at, weddings(bride_name, groom_name, wedding_date, venue_name)')
        .eq('token_hash', tokenHash)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function GET(req: NextRequest) {
    const limited = createRateLimitMiddleware('ENTOURAGE_RESPONSE').check(getClientIP(req));
    if (limited.limited) return limited.response;

    const token = new URL(req.url).searchParams.get('token') || '';
    if (token.length < 20 || token.length > 200) {
        return NextResponse.json({ error: 'Invalid proposal link.' }, { status: 400 });
    }

    try {
        const invitation = await findInvitationByToken(token);
        if (!invitation) {
            return NextResponse.json({ error: 'Proposal link not found.' }, { status: 404 });
        }

        return NextResponse.json({ invitation });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load proposal.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const limited = createRateLimitMiddleware('ENTOURAGE_RESPONSE').check(getClientIP(req));
    if (limited.limited) return limited.response;

    const parsed = responseSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid proposal response.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const tokenHash = hashToken(parsed.data.token);
        const { data: invitation, error } = await db
            .from('entourage_invitations')
            .update({
                status: parsed.data.response,
                responded_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('token_hash', tokenHash)
            .select('id, wedding_id, member_key, name, email, role, message, template_key, status, sent_at, responded_at, weddings(bride_name, groom_name, wedding_date, venue_name)')
            .maybeSingle();

        if (error) throw error;
        if (!invitation) {
            return NextResponse.json({ error: 'Proposal link not found.' }, { status: 404 });
        }

        return NextResponse.json({ invitation });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save proposal response.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


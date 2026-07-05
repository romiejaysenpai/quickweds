import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware, getClientIP, sanitizeEmail } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const AUTH_ACTIONS = new Set(['login', 'signup', 'password-reset']);

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const email = sanitizeEmail(String(body.email || ''));

    if (!AUTH_ACTIONS.has(action)) {
        return NextResponse.json({ error: 'Invalid auth action.' }, { status: 400 });
    }

    const limiter = createRateLimitMiddleware(action === 'signup' ? 'SIGNUP' : 'LOGIN');
    const identifier = `${getClientIP(req)}:${email || 'unknown'}:${action}`;
    const limited = await limiter.check(identifier);
    if (limited.limited) return limited.response;

    return NextResponse.json({ success: true }, { headers: limited.headers });
}

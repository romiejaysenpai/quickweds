import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { checkRateLimitAsync, type RateLimitKey } from '@/lib/rate-limit';

type AuthenticatedResult =
    | { user: { id: string; email?: string }; response?: never; rateLimitHeaders: Record<string, string> }
    | { user?: never; response: NextResponse; rateLimitHeaders?: never };

/**
 * Combined auth + rate limit check for authenticated API routes.
 *
 * Extracts the user from the request, then applies the specified rate limit
 * keyed by `user.id`. Returns either the authenticated user or a pre-built
 * error response (401/429).
 *
 * Usage:
 * ```ts
 * const auth = await getAuthenticatedRequest(req, 'AUTHENTICATED_DEFAULT');
 * if (auth.response) return auth.response;
 * const { user, rateLimitHeaders } = auth;
 * ```
 */
export async function getAuthenticatedRequest(
    req: NextRequest,
    limitKey: RateLimitKey = 'AUTHENTICATED_DEFAULT',
): Promise<AuthenticatedResult> {
    const { user, error } = await getRequestUser(req);

    if (!user) {
        return {
            response: NextResponse.json(
                { error: error || 'Unauthorized' },
                { status: 401 },
            ),
        };
    }

    const rateCheck = await checkRateLimitAsync(user.id, limitKey);

    if (!rateCheck.allowed) {
        const retryAfter = Math.max(1, Math.ceil((rateCheck.resetTime - Date.now()) / 1000));
        return {
            response: NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfter),
                        'X-RateLimit-Limit': String(rateCheck.maxRequests),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(rateCheck.resetTime),
                    },
                },
            ),
        };
    }

    return {
        user,
        rateLimitHeaders: {
            'X-RateLimit-Limit': String(rateCheck.maxRequests),
            'X-RateLimit-Remaining': String(rateCheck.remaining),
            'X-RateLimit-Reset': String(rateCheck.resetTime),
        },
    };
}

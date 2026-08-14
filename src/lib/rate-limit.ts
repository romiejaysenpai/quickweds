import 'server-only';

import { createHash } from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient, logRedisFailure } from '@/lib/redis';
import {
    RATE_LIMITS,
    checkRateLimit,
    getClientIP,
    sanitizeEmail,
    sanitizeInput,
    sanitizeURL,
    sanitizeUUID,
    sanitizeWeddingId,
    type RateLimitKey,
} from '@/lib/rate-limiter';

export {
    RATE_LIMITS,
    getClientIP,
    sanitizeEmail,
    sanitizeInput,
    sanitizeURL,
    sanitizeUUID,
    sanitizeWeddingId,
};
export type { RateLimitKey };

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    maxRequests: number;
    unavailable?: boolean;
};

const upstashLimiters = new Map<RateLimitKey, Ratelimit>();

// In production these routes can cause an external side effect or reveal
// sensitive data. A per-instance fallback does not provide a real limit, so
// deny requests until the shared limiter is healthy instead of silently
// weakening the control.
const DISTRIBUTED_LIMIT_KEYS = new Set<RateLimitKey>([
    'RSVP_SUBMIT',
    'REMINDER_EMAIL',
    'THANK_YOU_EMAIL',
    'EMAIL_RESEND',
    'ENTOURAGE_INVITE',
    'GUEST_BOOK',
    'PHOTO_UPLOAD',
    'SEAT_LOOKUP',
    'SEAT_MUTATION',
    'CHECKOUT',
    'SUPPLIER_REVIEW',
    'SIGNUP_NOTIFY',
    'LOGIN',
    'SIGNUP',
    'DOMAIN_MANAGEMENT',
]);

function hashIdentifier(identifier: string) {
    return createHash('sha256').update(identifier).digest('hex').slice(0, 32);
}

function getDuration(limitKey: RateLimitKey) {
    const seconds = Math.max(1, Math.ceil(RATE_LIMITS[limitKey].windowMs / 1000));
    if (seconds % 3600 === 0) return `${seconds / 3600} h` as const;
    if (seconds % 60 === 0) return `${seconds / 60} m` as const;
    return `${seconds} s` as const;
}

function getUpstashLimiter(limitKey: RateLimitKey) {
    const redis = getRedisClient();
    if (!redis) return null;

    const existing = upstashLimiters.get(limitKey);
    if (existing) return existing;

    const config = RATE_LIMITS[limitKey];
    const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(config.maxRequests, getDuration(limitKey)),
        prefix: `quickweds:ratelimit:${limitKey.toLowerCase()}`,
        analytics: true,
    });
    upstashLimiters.set(limitKey, limiter);
    return limiter;
}

function unavailableRateLimit(limitKey: RateLimitKey): RateLimitResult {
    return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60_000,
        maxRequests: RATE_LIMITS[limitKey].maxRequests,
        unavailable: true,
    };
}

export async function checkRateLimitAsync(identifier: string, limitKey: RateLimitKey = 'DEFAULT'): Promise<RateLimitResult> {
    const safeIdentifier = hashIdentifier(`${limitKey}:${identifier || 'anonymous'}`);
    const limiter = getUpstashLimiter(limitKey);

    if (!limiter) {
        return process.env.NODE_ENV === 'production' && DISTRIBUTED_LIMIT_KEYS.has(limitKey)
            ? unavailableRateLimit(limitKey)
            : checkRateLimit(safeIdentifier, limitKey);
    }

    try {
        const result = await limiter.limit(safeIdentifier);
        return {
            allowed: result.success,
            remaining: result.remaining,
            resetTime: result.reset,
            maxRequests: RATE_LIMITS[limitKey].maxRequests,
        };
    } catch (error) {
        logRedisFailure(`rate limit ${limitKey}`, error);
        return process.env.NODE_ENV === 'production' && DISTRIBUTED_LIMIT_KEYS.has(limitKey)
            ? unavailableRateLimit(limitKey)
            : checkRateLimit(safeIdentifier, limitKey);
    }
}

export function createRateLimitMiddleware(limitKey: RateLimitKey) {
    return {
        check: async (identifier: string) => {
            const result = await checkRateLimitAsync(identifier, limitKey);
            if (!result.allowed) {
                const retryAfter = Math.max(1, Math.ceil((result.resetTime - Date.now()) / 1000));
                const unavailable = Boolean(result.unavailable);
                return {
                    limited: true,
                    response: new Response(
                        JSON.stringify({
                            error: unavailable ? 'This action is temporarily unavailable. Please try again shortly.' : 'Too many requests. Please try again later.',
                            message: unavailable ? 'This action is temporarily unavailable. Please try again shortly.' : 'Too many requests. Please try again later.',
                            retryAfter,
                            resetTime: result.resetTime,
                        }),
                        {
                            status: unavailable ? 503 : 429,
                            headers: {
                                'Content-Type': 'application/json',
                                'Retry-After': String(retryAfter),
                                'Cache-Control': 'no-store',
                                'X-RateLimit-Limit': String(result.maxRequests),
                                'X-RateLimit-Remaining': '0',
                                'X-RateLimit-Reset': String(result.resetTime),
                            },
                        }
                    ),
                };
            }

            return {
                limited: false,
                headers: {
                    'X-RateLimit-Limit': String(result.maxRequests),
                    'X-RateLimit-Remaining': String(result.remaining),
                    'X-RateLimit-Reset': String(result.resetTime),
                },
            };
        },
    };
}

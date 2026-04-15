// Simple in-memory rate limiter for serverless/Edge environments
// Uses a sliding window algorithm

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (note: not shared across Vercel edge functions, but still provides basic protection)
const rateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    maxRequests: number;  // Maximum number of requests allowed
    windowMs: number;     // Time window in milliseconds
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
    // Strict limits for email sending (prevent abuse)
    RSVP_NOTIFY: { maxRequests: 10, windowMs: 60 * 60 * 1000 },      // 10 per hour
    REMINDER_EMAIL: { maxRequests: 5, windowMs: 60 * 60 * 1000 },    // 5 per hour
    
    // Moderate limits for read operations
    WEDDING_READ: { maxRequests: 100, windowMs: 15 * 60 * 1000 },    // 100 per 15 minutes
    DASHBOARD_LOAD: { maxRequests: 50, windowMs: 15 * 60 * 1000 },   // 50 per 15 minutes
    
    // Lenient limits for public wedding pages
    WEDDING_PAGE_VIEW: { maxRequests: 200, windowMs: 15 * 60 * 1000 }, // 200 per 15 minutes
    
    // Strict limits for authentication
    LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 },             // 5 per 15 minutes
    SIGNUP: { maxRequests: 3, windowMs: 15 * 60 * 1000 },            // 3 per 15 minutes
    
    // Domain management (admin operations)
    DOMAIN_MANAGEMENT: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
    
    // Default limit for unspecified endpoints
    DEFAULT: { maxRequests: 50, windowMs: 15 * 60 * 1000 },          // 50 per 15 minutes
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier (e.g., IP address, user ID, wedding ID)
 * @param limitKey - Rate limit configuration to use
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    limitKey: RateLimitKey = 'DEFAULT'
): { allowed: boolean; remaining: number; resetTime: number; maxRequests: number } {
    const config = RATE_LIMITS[limitKey];
    const now = Date.now();
    const key = `${limitKey}:${identifier}`;
    
    const entry = rateLimitMap.get(key);
    
    // If no entry or window expired, create new entry
    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: now + config.windowMs,
            maxRequests: config.maxRequests,
        };
    }
    
    // Window still active
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
            maxRequests: config.maxRequests,
        };
    }
    
    // Increment counter
    entry.count += 1;
    
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
        maxRequests: config.maxRequests,
    };
}

/**
 * Create a rate limit helper for Next.js API routes
 */
export function createRateLimitMiddleware(limitKey: RateLimitKey) {
    return {
        /**
         * Check rate limit and return response if exceeded
         */
        check: (identifier: string) => {
            const result = checkRateLimit(identifier, limitKey);
            
            if (!result.allowed) {
                return {
                    limited: true,
                    response: new Response(
                        JSON.stringify({
                            error: 'Rate limit exceeded',
                            message: `Too many requests. Please try again after ${new Date(result.resetTime).toISOString()}`,
                            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
                        }),
                        {
                            status: 429,
                            headers: {
                                'Content-Type': 'application/json',
                                'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
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

/**
 * Clean up old entries from rate limit map (call periodically or before checks)
 */
export function cleanupRateLimits() {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}

// Auto-cleanup every 5 minutes (in serverless this only works in long-running environments)
if (typeof globalThis !== 'undefined') {
    setInterval(cleanupRateLimits, 5 * 60 * 1000).unref?.();
}

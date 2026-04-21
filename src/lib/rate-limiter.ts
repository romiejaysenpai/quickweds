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
    RSVP_NOTIFY: { maxRequests: 30, windowMs: 60 * 60 * 1000 },      // 30 per hour
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
    
    // Analytics events - strict to prevent spam (CRITICAL FIX #1)
    ANALYTICS_TRACK: { maxRequests: 50, windowMs: 60 * 1000 },        // 50 per minute per IP
    ANALYTICS_BATCH: { maxRequests: 10, windowMs: 60 * 1000 },        // 10 batch requests per minute
    
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
 * Get client IP from request headers
 * Works with Vercel, AWS, Cloudflare, and standard proxies
 */
export function getClientIP(req: Request): string {
    // Vercel specific headers
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        // Get the first IP in the chain (original client)
        return forwarded.split(',')[0].trim();
    }
    
    // Cloudflare
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
        return cfConnectingIP;
    }
    
    // AWS ALB/ELB
    const awsIP = req.headers.get('x-amzn-trace-id');
    if (awsIP) {
        // Extract IP from trace ID if present
        const match = awsIP.match(/Root=.*-([\d\.]+)/);
        if (match) return match[1];
    }
    
    // Standard remote address (may not work in serverless)
    // @ts-ignore - some environments have this
    if (req.socket?.remoteAddress) {
        // @ts-ignore
        return req.socket.remoteAddress;
    }
    
    // Fallback to a hash of user agent + timestamp for anonymous tracking
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `anon-${Buffer.from(userAgent).toString('base64').slice(0, 16)}`;
}

/**
 * Sanitize string input to prevent injection attacks
 * CRITICAL FIX #2: Input sanitization
 */
export function sanitizeInput(input: string, options: {
    maxLength?: number;
    allowHTML?: boolean;
    allowNewlines?: boolean;
} = {}): string {
    const { maxLength = 1000, allowHTML = false, allowNewlines = false } = options;
    
    if (!input || typeof input !== 'string') {
        return '';
    }
    
    let sanitized = input;
    
    // Remove or encode HTML tags unless explicitly allowed
    if (!allowHTML) {
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    // Handle newlines
    if (!allowNewlines) {
        sanitized = sanitized.replace(/[\r\n]+/g, ' ');
    }
    
    // Remove null bytes and other control characters except newlines
    sanitized = sanitized.replace(/\x00/g, '');
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Enforce max length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
        return '';
    }
    
    // Remove whitespace and convert to lowercase
    let sanitized = email.trim().toLowerCase();
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
        return '';
    }
    
    // Enforce max length
    if (sanitized.length > 254) {
        sanitized = sanitized.substring(0, 254);
    }
    
    return sanitized;
}

/**
 * Sanitize UUID
 */
export function sanitizeUUID(uuid: string): string {
    if (!uuid || typeof uuid !== 'string') {
        return '';
    }
    
    // UUID v4 regex
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    const cleaned = uuid.trim().toLowerCase().replace(/[^0-9a-f-]/g, '');
    
    if (!uuidRegex.test(cleaned)) {
        return '';
    }
    
    return cleaned;
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string, allowedProtocols: string[] = ['http:', 'https:']): string {
    if (!url || typeof url !== 'string') {
        return '';
    }
    
    try {
        const parsed = new URL(url.trim());
        
        // Check protocol
        if (!allowedProtocols.includes(parsed.protocol)) {
            return '';
        }
        
        // Reconstruct URL to prevent injection
        return `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
    } catch {
        return '';
    }
}

/**
 * Validate and sanitize wedding ID (8-character alphanumeric)
 */
export function sanitizeWeddingId(id: string): string {
    if (!id || typeof id !== 'string') {
        return '';
    }
    
    // Wedding IDs are 8-character alphanumeric strings
    const cleaned = id.trim().replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleaned.length < 4 || cleaned.length > 32) {
        return '';
    }
    
    return cleaned;
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

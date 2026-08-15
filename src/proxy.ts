import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         * - manifest.webmanifest, sw.js, icons, offline, share-target (PWA assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|sw.js|icons|offline|share-target).*)',
    ],
};

type DomainCacheEntry = {
    weddingId: string | null;
    expiresAt: number;
};

const domainCache = new Map<string, DomainCacheEntry>();
const MAX_DOMAIN_CACHE_SIZE = 500;

function setDomainCache(hostname: string, weddingId: string | null, ttlMs: number) {
    if (domainCache.size >= MAX_DOMAIN_CACHE_SIZE) {
        const firstKey = domainCache.keys().next().value;
        if (firstKey) domainCache.delete(firstKey);
    }
    domainCache.set(hostname, {
        weddingId,
        expiresAt: Date.now() + ttlMs,
    });
}

export async function proxy(req: NextRequest) {
    const url = req.nextUrl;
    const path = url.pathname;

    // VERY IMPORTANT: Skip API routes and other static assets immediately
    if (
        path.startsWith('/api') || 
        path.startsWith('/_next') || 
        path.startsWith('/icons') ||
        path === '/manifest.webmanifest' ||
        path === '/sw.js' ||
        path === '/offline' ||
        path === '/share-target' ||
        path.includes('.') || // Static files like favicon.ico, etc.
        path === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Get hostname...
    const hostname = req.nextUrl.hostname.toLowerCase();
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site').toLowerCase();

    // Allow vercel preview URLs, localhost, and base domain
    if (
        hostname.includes('vercel.app') ||
        hostname.includes('vercel.pub') ||
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname === rootDomain ||
        hostname.endsWith(`.${rootDomain}`)
    ) {
        return NextResponse.next();
    }

    // It is a custom domain requested!
    // Query Supabase directly from Edge using REST API with edge in-memory caching
    const cached = domainCache.get(hostname);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
        if (cached.weddingId) {
            return NextResponse.rewrite(new URL(`/w/${cached.weddingId}`, req.url));
        }
        return NextResponse.next();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
        try {
            const res = await fetch(`${supabaseUrl}/rest/v1/rpc/quickweds_lookup_custom_domain`, {
                method: 'POST',
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_domain: hostname }),
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const weddingId = data[0].id;
                // Cache valid domain mapping for 5 minutes
                setDomainCache(hostname, weddingId, 5 * 60 * 1000);
                return NextResponse.rewrite(new URL(`/w/${weddingId}`, req.url));
            } else {
                // Negative cache for 60 seconds to mitigate repeated misses
                setDomainCache(hostname, null, 60 * 1000);
            }
        } catch (e) {
            console.error('Error fetching custom domain mapping from Supabase:', e);
        }
    }

    // If no mapping found, proceed normally (will likely 404)
    return NextResponse.next();
}

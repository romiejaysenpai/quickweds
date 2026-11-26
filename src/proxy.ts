import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeWeddingId } from '@/lib/rate-limiter';

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

const VALID_HOSTNAME_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
const DOMAIN_CACHE_TTL_MS = 60_000;
const DOMAIN_CACHE_MAX_SIZE = 500;
const domainCache = new Map<string, { weddingId: string | null; expiresAt: number }>();

const PASSTHROUGH_PREFIXES = ['/w/', '/rsvp/', '/seat/', '/entourage/'];

async function lookupCustomDomainWeddingId(hostWithoutPort: string): Promise<string | null> {
    const now = Date.now();
    const cached = domainCache.get(hostWithoutPort);
    if (cached && cached.expiresAt > now) {
        return cached.weddingId;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/quickweds_lookup_custom_domain`, {
            method: 'POST',
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ p_domain: hostWithoutPort }),
            cache: 'no-store',
            signal: AbortSignal.timeout(2500),
        });

        let weddingId: string | null = null;
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && typeof data[0]?.id === 'string') {
                weddingId = sanitizeWeddingId(data[0].id) || null;
            }
        }

        if (domainCache.size >= DOMAIN_CACHE_MAX_SIZE) {
            const oldestKey = domainCache.keys().next().value;
            if (oldestKey) domainCache.delete(oldestKey);
        }
        domainCache.set(hostWithoutPort, { weddingId, expiresAt: now + DOMAIN_CACHE_TTL_MS });
        return weddingId;
    } catch (e) {
        console.error('Error fetching custom domain mapping from Supabase:', e);
        return null;
    }
}

export async function proxy(req: NextRequest) {
    const url = req.nextUrl;
    const path = url.pathname;

    // Skip API routes and static assets immediately
    if (
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.startsWith('/icons') ||
        path === '/manifest.webmanifest' ||
        path === '/sw.js' ||
        path === '/offline' ||
        path === '/share-target' ||
        path.includes('.') ||
        path === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    const rawHost = req.headers.get('host');
    if (!rawHost) {
        return NextResponse.next();
    }
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site')
        .split(':')[0]
        .toLowerCase();
    const hostname = rawHost.replace('.localhost:3000', `.${rootDomain}`);
    const hostWithoutPort = hostname.split(':')[0].toLowerCase().trim();

    // Allow vercel preview URLs, localhost, and base domain
    if (
        hostWithoutPort === 'localhost' ||
        hostWithoutPort === '127.0.0.1' ||
        hostWithoutPort.endsWith('.localhost') ||
        hostWithoutPort.endsWith('.vercel.app') ||
        hostWithoutPort.endsWith('.vercel.pub') ||
        hostWithoutPort === rootDomain ||
        hostWithoutPort.endsWith(`.${rootDomain}`)
    ) {
        return NextResponse.next();
    }

    // Reject syntactically invalid Host headers before hitting Supabase
    if (!VALID_HOSTNAME_RE.test(hostWithoutPort)) {
        return NextResponse.next();
    }

    // Pass through already-namespaced public guest sub-routes (e.g. /w/[id]/photos, /rsvp/manage, /seat/[token])
    if (PASSTHROUGH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        return NextResponse.next();
    }

    const weddingId = await lookupCustomDomainWeddingId(hostWithoutPort);
    if (weddingId) {
        const targetPath = path === '/' ? `/w/${weddingId}` : `/w/${weddingId}${path}`;
        return NextResponse.rewrite(new URL(targetPath, req.url));
    }

    return NextResponse.next();
}

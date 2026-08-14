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

    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site').trim().toLowerCase();
    const rawHost = (req.headers.get('host') || '').trim().toLowerCase();
    const hostname = rawHost.startsWith('[')
        ? rawHost.slice(1, rawHost.indexOf(']'))
        : rawHost.split(':')[0];
    const isRootDomain = hostname === rootDomain || hostname.endsWith(`.${rootDomain}`);
    const isPreviewDomain = hostname === 'vercel.app' || hostname.endsWith('.vercel.app')
        || hostname === 'vercel.pub' || hostname.endsWith('.vercel.pub');
    const isLocalHost = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1' || hostname === '::1';

    // Allow vercel preview URLs, localhost, and base domain
    if (
        isPreviewDomain ||
        isLocalHost ||
        isRootDomain
    ) {
        return NextResponse.next();
    }

    // It is a custom domain requested!
    // Query Supabase directly from Edge using REST API
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
                cache: 'no-store',
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const weddingId = data[0].id;
                // Rewrite to the dynamically generated wedding page
                return NextResponse.rewrite(new URL(`/w/${weddingId}`, req.url));
            }
        } catch (e) {
            console.error('Error fetching custom domain mapping from Supabase:', e);
        }
    }

    // If no mapping found, proceed normally (will likely 404)
    return NextResponse.next();
}

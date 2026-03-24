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
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};

export async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const path = url.pathname;

    // VERY IMPORTANT: Skip API routes and other static assets immediately
    if (
        path.startsWith('/api') || 
        path.startsWith('/_next') || 
        path.includes('.') || // Static files like favicon.ico, etc.
        path === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Get hostname...
    let hostname = req.headers
        .get('host')!
        .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site'}`);

    // Allow vercel preview URLs, localhost, and base domain
    if (
        hostname.includes('vercel.app') ||
        hostname.includes('vercel.pub') ||
        hostname.includes('localhost') ||
        hostname.endsWith(process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site')
    ) {
        return NextResponse.next();
    }

    // It is a custom domain requested!
    // Query Supabase directly from Edge using REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
        try {
            const res = await fetch(`${supabaseUrl}/rest/v1/weddings?custom_domain=eq.${hostname}&select=id`, {
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`
                }
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

import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env";

// Validate environment variables on build/startup
if (process.env.NODE_ENV !== 'production' || process.env.VALIDATE_ENV === 'true') {
  try {
    // Only validate in non-build contexts or when explicitly requested
    if (typeof window === 'undefined') {
      // Don't throw during config load, just warn
      validateEnv();
    }
  } catch (e) {
    console.warn('⚠️  Environment validation warning:', (e as Error).message);
  }
}

const isVercelBuild = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  // Docker consumes standalone output, while Vercel's Next.js adapter creates
  // its own serverless artifacts and requires the standard trace output.
  ...(isVercelBuild ? {} : { output: 'standalone' }),
  // A lockfile also exists in the parent directory. Pinning the project root
  // keeps Turbopack from scanning and resolving modules from the wrong tree.
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/embed/rsvp/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors https: http://localhost:* http://127.0.0.1:*;",
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
        ],
      },
      {
        source: '/dashboard/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
        ],
      },
      {
        source: '/:path*.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/templates/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/textures/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;

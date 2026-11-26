import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env";

// Validate environment variables on build/startup
if (process.env.NODE_ENV !== 'production' || process.env.VALIDATE_ENV === 'true') {
  try {
    if (typeof window === 'undefined') {
      validateEnv();
    }
  } catch (e) {
    console.warn('⚠️  Environment validation warning:', (e as Error).message);
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    agentUpgrade: 'security',
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  // A lockfile also exists in the parent directory. Pinning the project root
  // keeps Turbopack from scanning and resolving modules from the wrong tree.
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(self), payment=(self)' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      ...[
        '/seat/:token',
        '/entourage/respond/:token',
        '/builder',
        '/forgot-password',
        '/reset-password',
        '/planner',
        '/profile',
        '/supplier/dashboard',
        '/rsvp/manage',
      ].map((source) => ({
        source,
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      })),
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
        source: '/templates/:path+.(png|jpg|jpeg|webp|avif|gif|svg|json)',
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
    unoptimized: process.env.NODE_ENV !== 'production',
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

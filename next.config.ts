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

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
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

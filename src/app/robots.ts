import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/auth/',
          '/dashboard',
          '/dashboard/',
          '/debug/',
          '/login',
          '/onboarding/',
          '/payment/',
          '/preview',
          '/settings',
          '/share-target',
        ],
      },
    ],
    sitemap: 'https://quickweds.site/sitemap.xml',
  };
}

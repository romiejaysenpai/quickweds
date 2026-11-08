import type { MetadataRoute } from 'next';
import { rsvpWordingPath, siteOrigin, sitePreviewImage } from '@/lib/seo';

const publicPaths = [
  '/',
  '/templates',
  '/wedding-budget-planner',
  '/wedding-checklist',
  '/wedding-rsvp',
  '/wedding-seating-chart',
  '/wedding-website-builder',
  '/tips',
  rsvpWordingPath,
  '/user-guide',
  '/user-guide/wedding-website-builder',
  '/user-guide/rsvp-guest-list',
  '/user-guide/planner-workspace',
  '/user-guide/checklist-calendar',
  '/user-guide/entourage-proposals',
  '/user-guide/budget-planner',
  '/user-guide/suppliers-directory',
  '/user-guide/food-drinks-planner',
  '/user-guide/photo-sharing',
  '/user-guide/thank-you-notes',
  '/user-guide/qr-codes-sharing',
  '/user-guide/seating-planner',
  '/user-guide/honeymoon-planner',
  '/user-guide/wedding-day-mode',
  '/user-guide/event-qr-kit',
  '/user-guide/collaboration-access',
  '/user-guide/analytics-reminders',
  '/user-guide/theme-marketplace-presets',
  '/user-guide/supplier-profiles',
  '/user-guide/post-wedding-memories',
  '/user-guide/attire-guide-dress-code',
  '/user-guide/smart-rsvp-search',
  '/user-guide/community-reviews',
  '/suppliers',
  '/supplier/signup',
  '/demo',
  '/support',
  '/privacy',
  '/terms',
  '/cookies',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `${siteOrigin}${path}`,
    ...(path === '/' ? { images: [sitePreviewImage] } : {}),
  }));
}

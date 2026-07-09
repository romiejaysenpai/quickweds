import type { MetadataRoute } from 'next';

const baseUrl = 'https://quickweds.site';
const landingPreviewImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Minimalist%20Neutral%20Multi%20Device%20Computer%20Mockup%20Website%20Launch%20Instagram%20Post.png';

const now = new Date();

const publicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  images?: string[];
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1, images: [landingPreviewImageUrl] },
  { path: '/tips', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/user-guide', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/user-guide/wedding-website-builder', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/user-guide/rsvp-guest-list', changeFrequency: 'monthly', priority: 0.78 },
  { path: '/user-guide/planner-workspace', changeFrequency: 'monthly', priority: 0.72 },
  { path: '/user-guide/checklist-calendar', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/user-guide/entourage-proposals', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/user-guide/budget-planner', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/user-guide/suppliers-directory', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/user-guide/food-drinks-planner', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/photo-sharing', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/thank-you-notes', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/user-guide/qr-codes-sharing', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/seating-planner', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/user-guide/honeymoon-planner', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/wedding-day-mode', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/user-guide/event-qr-kit', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/collaboration-access', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/analytics-reminders', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/theme-marketplace-presets', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/user-guide/supplier-profiles', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/suppliers', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/supplier/signup', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/demo', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/support', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.25 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.images ? { images: route.images } : {}),
  }));
}

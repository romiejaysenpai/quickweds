import type { MetadataRoute } from 'next';
import { TIPS_GUIDES, siteOrigin, sitePreviewImage } from '@/lib/seo';
import { landingTemplatePreviews } from '@/lib/landing-templates';
import {
  filterSuppliersByLocation,
  getApprovedSuppliers,
  getSupplierCategorySlug,
  getSupplierLocationSlug,
} from '@/lib/suppliers-server';
import { PHILIPPINE_SUPPLIER_LOCATIONS, SUPPLIER_CATEGORIES } from '@/lib/suppliers';

export const revalidate = 3600;

const STATIC_UPDATED_AT = new Date('2026-11-26T00:00:00Z');

const staticPublicPaths = [
  '/',
  '/templates',
  '/wedding-budget-planner',
  '/wedding-checklist',
  '/wedding-rsvp',
  '/wedding-seating-chart',
  '/wedding-website-builder',
  '/wedding-planner-philippines',
  '/tips',
  ...TIPS_GUIDES.map((guide) => guide.path),
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
  '/reviews',
  '/demo',
  '/support',
  '/privacy',
  '/terms',
  '/cookies',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticPublicPaths.map((path) => ({
    url: `${siteOrigin}${path}`,
    lastModified: STATIC_UPDATED_AT,
    ...(path === '/' ? { images: [sitePreviewImage] } : {}),
  }));

  for (const template of landingTemplatePreviews) {
    entries.push({
      url: `${siteOrigin}/templates/${template.id}`,
      lastModified: STATIC_UPDATED_AT,
    });
  }

  const suppliers = await getApprovedSuppliers();

  for (const supplier of suppliers) {
    if (!supplier.slug) continue;
    entries.push({
      url: `${siteOrigin}/suppliers/${supplier.slug}`,
      lastModified: supplier.updated_at ? new Date(supplier.updated_at) : STATIC_UPDATED_AT,
    });
  }

  // Only include category and location landing pages that currently have approved listings
  for (const category of SUPPLIER_CATEGORIES) {
    const count = suppliers.filter((supplier) => supplier.category === category).length;
    if (count > 0) {
      entries.push({
        url: `${siteOrigin}/suppliers/category/${getSupplierCategorySlug(category)}`,
        lastModified: STATIC_UPDATED_AT,
      });
    }
  }

  for (const location of PHILIPPINE_SUPPLIER_LOCATIONS) {
    const count = filterSuppliersByLocation(suppliers, location).length;
    if (count > 0) {
      entries.push({
        url: `${siteOrigin}/suppliers/location/${getSupplierLocationSlug(location)}`,
        lastModified: STATIC_UPDATED_AT,
      });
    }
  }

  // Deduplicate by URL while preserving order
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

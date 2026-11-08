import type { Metadata } from 'next';

// This is the public search origin, independent of preview hosts and app callback URLs.
export const siteOrigin = 'https://www.quickweds.site';
export const siteName = 'QuickWeds';
export const homeTitle = 'Free Wedding Website, RSVP & Planning Tools | QuickWeds';
export const homeDescription =
  'Build a free wedding website with digital invitations and online RSVPs. Plan your guest list, seating, budget, and wedding day in one place.';
export const sitePreviewImage = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Minimalist%20Neutral%20Multi%20Device%20Computer%20Mockup%20Website%20Launch%20Instagram%20Post.png';
export const rsvpWordingPath = '/tips/wedding-rsvp-wording';

export function publicPageMetadata(
  path: string,
  title: string,
  description: string,
  type: 'website' | 'article' = 'website',
): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  const images = [{ url: sitePreviewImage, alt: 'QuickWeds wedding website and planning tools' }];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, url: path, title: fullTitle, description, siteName, images },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images },
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

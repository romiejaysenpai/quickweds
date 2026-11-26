import type { Metadata } from 'next';
import {
  HOME_FAQS,
  buildFaqJsonLd,
  homeDescription,
  homeTitle,
  serializeJsonLd,
  siteOrigin,
  sitePreviewImage,
  sitePreviewImageHeight,
  sitePreviewImageWidth,
} from '@/lib/seo';
import { calculateReviewStats } from '@/lib/reviews';
import { getServerApprovedReviews } from '@/lib/reviews-server';
import HomeClient from './HomeClient';

export const revalidate = 300;

const homeUrl = `${siteOrigin}/`;

export const metadata: Metadata = {
  alternates: { canonical: homeUrl },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: homeUrl,
    siteName: 'QuickWeds',
    title: homeTitle,
    description: homeDescription,
    images: [
      {
        url: sitePreviewImage,
        width: sitePreviewImageWidth,
        height: sitePreviewImageHeight,
        alt: 'QuickWeds wedding website and planning tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
    images: [
      {
        url: sitePreviewImage,
        alt: 'QuickWeds wedding website and planning tools',
      },
    ],
  },
};

const heroImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/lastfinal%20hero%20imagfe.png';

export default async function HomePage() {
  const { reviews, hasDatabaseReviews } = await getServerApprovedReviews(6);
  const reviewStats = calculateReviewStats(reviews);

  const webAppSchema: Record<string, unknown> = {
    '@type': 'WebApplication',
    '@id': `${homeUrl}#webapp`,
    name: 'QuickWeds',
    url: homeUrl,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any (web browser)',
    description: homeDescription,
    image: sitePreviewImage,
    screenshot: heroImageUrl,
    featureList: [
      'Free wedding website builder',
      'Digital wedding invitations',
      'RSVP tracking',
      'Guest list management',
      'Wedding seating chart and QR seat finder',
      'Wedding budget tracker',
      'Supplier and vendor planning',
      'Guest photo sharing portal',
      'Wedding day QR kit',
      'Thank-you email and card builder',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Wedding Website',
        price: '0',
        priceCurrency: 'PHP',
        url: `${siteOrigin}/wedding-website-builder`,
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Planner Pro',
        price: '850',
        priceCurrency: 'PHP',
        url: `${homeUrl}#pricing`,
        availability: 'https://schema.org/InStock',
      },
    ],
    publisher: {
      '@id': `${homeUrl}#organization`,
    },
  };

  if (hasDatabaseReviews && reviewStats.totalCount > 0) {
    webAppSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewStats.averageRating,
      reviewCount: reviewStats.totalCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const landingStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${homeUrl}#organization`,
        name: 'QuickWeds',
        url: homeUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${homeUrl}logo.png`,
        },
        sameAs: ['https://www.facebook.com/profile.php?id=61587661715324'],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'support@quickweds.site',
            contactType: 'customer support',
            availableLanguage: ['en', 'tl'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${homeUrl}#website`,
        name: 'QuickWeds',
        url: homeUrl,
        description: homeDescription,
        publisher: {
          '@id': `${homeUrl}#organization`,
        },
        inLanguage: 'en',
      },
      webAppSchema,
      {
        '@type': 'WebPage',
        '@id': `${homeUrl}#webpage`,
        url: homeUrl,
        name: homeTitle,
        description: homeDescription,
        isPartOf: {
          '@id': `${homeUrl}#website`,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: sitePreviewImage,
          width: sitePreviewImageWidth,
          height: sitePreviewImageHeight,
        },
        mainEntity: {
          '@id': `${homeUrl}#webapp`,
        },
        inLanguage: 'en',
      },
      buildFaqJsonLd(HOME_FAQS),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(landingStructuredData) }} />
      <HomeClient initialReviews={reviews} />
    </>
  );
}

import type { Metadata } from 'next';
import { homeDescription, homeTitle, serializeJsonLd, siteOrigin, sitePreviewImage } from '@/lib/seo';
import HomeClient from './HomeClient';

const homeUrl = `${siteOrigin}/`;

export const metadata: Metadata = {
  alternates: { canonical: homeUrl },
  openGraph: {
    type: 'website',
    url: homeUrl,
    siteName: 'QuickWeds',
    title: homeTitle,
    description: homeDescription,
    images: [{ url: sitePreviewImage, alt: 'QuickWeds wedding website and planning tools' }],
  },
};

const heroImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/lastfinal%20hero%20imagfe.png';

const landingStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${homeUrl}#organization`,
      name: 'QuickWeds',
      url: homeUrl,
      logo: `${homeUrl}logo.png`,
      sameAs: ['https://www.facebook.com/profile.php?id=61587661715324'],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email: 'support@quickweds.site',
          contactType: 'customer support',
          availableLanguage: ['en'],
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
    {
      '@type': 'WebApplication',
      '@id': `${homeUrl}#webapp`,
      name: 'QuickWeds',
      url: homeUrl,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any (web browser)',
      description: homeDescription,
      image: heroImageUrl,
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
          url: `${homeUrl}builder`,
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Planner Pro',
          price: '850',
          priceCurrency: 'PHP',
          url: `${homeUrl}signup`,
          availability: 'https://schema.org/InStock',
        },
      ],
      publisher: {
        '@id': `${homeUrl}#organization`,
      },
    },
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
        url: heroImageUrl,
      },
      mainEntity: {
        '@id': `${homeUrl}#webapp`,
      },
      inLanguage: 'en',
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(landingStructuredData) }} />
      <HomeClient />
    </>
  );
}

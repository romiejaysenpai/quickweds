import {
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/seo';
import { calculateReviewStats } from '@/lib/reviews';
import { getServerApprovedReviews } from '@/lib/reviews-server';
import ReviewsClient from './ReviewsClient';

export const revalidate = 300;

export const metadata = publicPageMetadata(
  '/reviews',
  'Real Couple Reviews & Wedding Stories',
  'Read genuine couple reviews and wedding planning stories from newlyweds who built their wedding websites, RSVPs, and seating charts with QuickWeds.',
);

export default async function ReviewsPage() {
  const { reviews, hasDatabaseReviews } = await getServerApprovedReviews(50);
  const stats = calculateReviewStats(reviews);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteOrigin}/reviews#webpage`,
        url: `${siteOrigin}/reviews`,
        name: 'Real Couple Reviews & Wedding Stories | QuickWeds',
        description:
          'Genuine reviews and wedding planning stories from couples using QuickWeds.',
        isPartOf: { '@id': `${siteOrigin}/#website` },
        inLanguage: 'en',
      },
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Couple Reviews', path: '/reviews' },
      ]),
      ...(hasDatabaseReviews && stats.totalCount > 0
        ? [
            {
              '@type': 'WebApplication',
              '@id': `${siteOrigin}/#webapp`,
              name: 'QuickWeds',
              url: `${siteOrigin}/`,
              applicationCategory: 'LifestyleApplication',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: stats.averageRating,
                reviewCount: stats.totalCount,
                bestRating: 5,
                worstRating: 1,
              },
              review: reviews.slice(0, 10).map((item) => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: item.couple_names },
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: item.rating || 5,
                  bestRating: 5,
                  worstRating: 1,
                },
                reviewBody: item.quote,
                ...(item.created_at ? { datePublished: item.created_at } : {}),
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <ReviewsClient initialReviews={reviews} />
    </>
  );
}

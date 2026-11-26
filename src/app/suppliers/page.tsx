import SupplierDirectoryClient from '@/components/suppliers/SupplierDirectoryClient';
import {
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/seo';
import { getApprovedSuppliers } from '@/lib/suppliers-server';

export const revalidate = 300;

export const metadata = publicPageMetadata(
  '/suppliers',
  'Philippines Wedding Supplier Directory — Venues, Photo & Catering',
  'Browse trusted Philippines wedding suppliers for venues, catering, photography, coordination, florists, styling, and more. Save favorites straight to your QuickWeds planner.',
);

export default async function SuppliersPage() {
  const suppliers = await getApprovedSuppliers();

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteOrigin}/suppliers#webpage`,
        url: `${siteOrigin}/suppliers`,
        name: 'Philippines Wedding Supplier Directory | QuickWeds',
        description:
          'Browse trusted Philippines wedding suppliers for venues, catering, photography, coordination, styling, and more.',
        isPartOf: { '@id': `${siteOrigin}/#website` },
        inLanguage: 'en',
      },
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Wedding Suppliers', path: '/suppliers' },
      ]),
      ...(suppliers.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: 'Approved Philippines Wedding Suppliers',
              numberOfItems: suppliers.length,
              itemListElement: suppliers.slice(0, 50).map((supplier, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: supplier.business_name,
                url: `${siteOrigin}/suppliers/${supplier.slug}`,
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
      <SupplierDirectoryClient suppliers={suppliers} />
    </>
  );
}

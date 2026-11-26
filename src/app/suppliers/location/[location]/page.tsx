import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import SupplierCard from '@/components/suppliers/SupplierCard';
import {
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/seo';
import {
  filterSuppliersByLocation,
  getApprovedSuppliers,
  getSupplierCategorySlug,
  getSupplierLocationSlug,
  resolveSupplierLocationBySlug,
} from '@/lib/suppliers-server';
import { PHILIPPINE_SUPPLIER_LOCATIONS, SUPPLIER_CATEGORIES } from '@/lib/suppliers';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ location: string }>;
};

export function generateStaticParams() {
  return PHILIPPINE_SUPPLIER_LOCATIONS.map((location) => ({
    location: getSupplierLocationSlug(location),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location: slug } = await params;
  const location = resolveSupplierLocationBySlug(slug);
  if (!location) return {};

  const suppliers = filterSuppliersByLocation(await getApprovedSuppliers(), location);
  const path = `/suppliers/location/${slug}`;
  const title = `Wedding Suppliers & Venues in ${location}`;
  const description = `Find trusted wedding venues, photographers, caterers, coordinators, and stylists serving ${location}. Save vendors straight into your QuickWeds planner.`;

  return publicPageMetadata(path, title, description, 'website', {
    noIndex: suppliers.length === 0,
  });
}

export default async function SupplierLocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const location = resolveSupplierLocationBySlug(slug);
  if (!location) notFound();

  const allSuppliers = await getApprovedSuppliers();
  const suppliers = filterSuppliersByLocation(allSuppliers, location);
  const path = `/suppliers/location/${slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteOrigin}${path}#webpage`,
        url: `${siteOrigin}${path}`,
        name: `Wedding Suppliers & Venues in ${location} | QuickWeds`,
        description: `Browse approved wedding suppliers serving ${location} on QuickWeds.`,
        isPartOf: { '@id': `${siteOrigin}/#website` },
        inLanguage: 'en',
      },
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Wedding Suppliers', path: '/suppliers' },
        { name: location, path },
      ]),
      ...(suppliers.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: `Wedding Suppliers in ${location}`,
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
    <div className="min-h-screen bg-neutral text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <header className="border-b border-border/70 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo.png" alt="QuickWeds" width={140} height={40} className="h-10 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/suppliers" className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5">
              <ArrowLeft className="h-4 w-4" />
              All Suppliers
            </Link>
            <Link href="/supplier/signup" className="hidden rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover sm:inline-flex">
              List Your Business
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary shadow-sm">
            <MapPin className="h-4 w-4" />
            {location} Wedding Directory
          </span>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-foreground sm:text-6xl">
            Wedding Suppliers in <span className="text-primary">{location}</span>
          </h1>
          <p className="mt-4 text-base leading-8 text-text-secondary sm:text-lg">
            Planning a celebration in {location}? Explore approved local wedding venues, photographers, caterers, coordinators, florists, and stylists ready for your wedding date.
          </p>
        </div>

        {suppliers.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-border bg-white p-8 text-center shadow-sm">
            <Sparkles className="mx-auto h-10 w-10 text-primary/40" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">
              Serve weddings in {location}?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary">
              Create your free supplier profile on QuickWeds so couples planning in {location} can discover your work and inquire directly.
            </p>
            <Link
              href="/supplier/signup"
              className="mt-6 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
            >
              Join the {location} Directory Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        )}

        <section className="mt-16 grid gap-6 rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Other Locations</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {PHILIPPINE_SUPPLIER_LOCATIONS.filter((loc) => loc !== location).map((loc) => (
                <Link
                  key={loc}
                  href={`/suppliers/location/${getSupplierLocationSlug(loc)}`}
                  className="rounded-full border border-border bg-neutral px-3.5 py-1.5 text-xs font-bold text-text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {loc}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Browse by Category</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUPPLIER_CATEGORIES.map((item) => (
                <Link
                  key={item}
                  href={`/suppliers/category/${getSupplierCategorySlug(item)}`}
                  className="rounded-full border border-border bg-neutral px-3.5 py-1.5 text-xs font-bold text-text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

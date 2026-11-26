import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Globe2, Instagram, Mail, MapPin, Phone, Sparkles, type LucideIcon } from 'lucide-react';
import SupplierSaveButton from '@/components/suppliers/SupplierSaveButton';
import SupplierShareControls from '@/components/suppliers/SupplierShareControls';
import {
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/seo';
import {
  getApprovedSupplierBySlug,
  getSchemaTypeForSupplierCategory,
  getSupplierCategorySlug,
  getSupplierLocationSlug,
  isOptimizableImageHost,
} from '@/lib/suppliers-server';
import { toSafeHttpUrl } from '@/lib/url-safety';
import {
  getSupplierDisplayLocation,
  sanitizeSupplierUrl,
} from '@/lib/suppliers';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getWhatsappUrl(value?: string | null) {
  if (!value) return null;
  const safeUrl = toSafeHttpUrl(value);
  if (safeUrl) return safeUrl;
  const digits = value.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supplier = await getApprovedSupplierBySlug(slug);

  if (!supplier) {
    return {
      title: 'Supplier Not Found',
      robots: { index: false, follow: false },
    };
  }

  const location = getSupplierDisplayLocation(supplier);
  const title = location
    ? `${supplier.business_name} — ${supplier.category} in ${location}`
    : `${supplier.business_name} — Wedding ${supplier.category}`;
  const description =
    supplier.summary ||
    supplier.description?.slice(0, 160) ||
    `View ${supplier.business_name} (${supplier.category}${location ? ` in ${location}` : ''}) in the QuickWeds Philippines wedding supplier directory.`;

  return publicPageMetadata(`/suppliers/${supplier.slug}`, title, description, 'website', {
    ...(supplier.cover_image_url
      ? {
          image: {
            url: supplier.cover_image_url,
            alt: `${supplier.business_name} — ${supplier.category}`,
          },
        }
      : {}),
  });
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supplier = await getApprovedSupplierBySlug(slug);

  if (!supplier) notFound();

  const location = getSupplierDisplayLocation(supplier);
  const gallery = (supplier.gallery_images || []).filter(Boolean);
  const websiteUrl = sanitizeSupplierUrl(supplier.website_url);
  const instagramUrl = sanitizeSupplierUrl(supplier.instagram_url);
  const facebookUrl = sanitizeSupplierUrl(supplier.facebook_url);
  const whatsappUrl = getWhatsappUrl(supplier.whatsapp);

  const contactLinks = [
    supplier.phone ? { label: supplier.phone, href: `tel:${supplier.phone}`, icon: Phone } : null,
    supplier.email ? { label: supplier.email, href: `mailto:${supplier.email}`, icon: Mail } : null,
    whatsappUrl ? { label: 'WhatsApp', href: whatsappUrl, icon: Phone } : null,
    websiteUrl ? { label: 'Website', href: websiteUrl, icon: Globe2 } : null,
    instagramUrl ? { label: 'Instagram', href: instagramUrl, icon: Instagram } : null,
    facebookUrl ? { label: 'Facebook', href: facebookUrl, icon: ExternalLink } : null,
  ].filter(Boolean) as Array<{ label: string; href: string; icon: LucideIcon }>;

  const categorySlug = getSupplierCategorySlug(supplier.category);
  const locationSlug = supplier.province ? getSupplierLocationSlug(supplier.province) : null;
  const sameAs = [websiteUrl, instagramUrl, facebookUrl].filter(Boolean) as string[];
  const pageUrl = `${siteOrigin}/suppliers/${supplier.slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': getSchemaTypeForSupplierCategory(supplier.category),
        '@id': `${pageUrl}#business`,
        name: supplier.business_name,
        url: pageUrl,
        description: supplier.summary || supplier.description || `${supplier.business_name} provides ${supplier.category} services for weddings in ${location || 'the Philippines'}.`,
        ...(supplier.cover_image_url ? { image: supplier.cover_image_url } : {}),
        ...(supplier.phone ? { telephone: supplier.phone } : {}),
        ...(supplier.email ? { email: supplier.email } : {}),
        ...(supplier.price_band ? { priceRange: supplier.price_band } : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
        address: {
          '@type': 'PostalAddress',
          ...(supplier.city ? { addressLocality: supplier.city } : {}),
          ...(supplier.province ? { addressRegion: supplier.province } : {}),
          addressCountry: 'PH',
        },
        ...((supplier.service_areas || []).length > 0
          ? {
              areaServed: (supplier.service_areas || []).map((area) => ({
                '@type': 'Place',
                name: area,
              })),
            }
          : {}),
      },
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Wedding Suppliers', path: '/suppliers' },
        { name: supplier.category, path: `/suppliers/category/${categorySlug}` },
        { name: supplier.business_name, path: `/suppliers/${supplier.slug}` },
      ]),
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
          <Link href="/suppliers" className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5">
            <ArrowLeft className="h-4 w-4" />
            Directory
          </Link>
        </div>
      </header>

      <main>
        <section className="px-4 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-text-secondary lg:justify-start">
                <Link href="/suppliers" className="hover:text-primary">Suppliers</Link>
                <span aria-hidden="true">/</span>
                <Link href={`/suppliers/category/${categorySlug}`} className="hover:text-primary">{supplier.category}</Link>
                {locationSlug && supplier.province && (
                  <>
                    <span aria-hidden="true">/</span>
                    <Link href={`/suppliers/location/${locationSlug}`} className="hover:text-primary">{supplier.province}</Link>
                  </>
                )}
              </nav>
              <Link
                href={`/suppliers/category/${categorySlug}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary shadow-sm transition hover:border-primary/40"
              >
                <Sparkles className="h-4 w-4" />
                {supplier.category}
              </Link>
              <h1 className="mt-5 font-serif text-[2.6rem] font-bold leading-[1.04] text-foreground sm:text-6xl">
                {supplier.business_name}
              </h1>
              {location && (
                <p className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-2 text-sm font-bold text-text-secondary lg:mx-0 lg:justify-start">
                  <MapPin className="h-4 w-4 text-primary" />
                  {location}
                </p>
              )}
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg lg:mx-0">
                {supplier.summary || supplier.description || 'A trusted QuickWeds wedding supplier ready to support your celebration.'}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <SupplierSaveButton supplierId={supplier.id} />
                <SupplierShareControls slug={supplier.slug} businessName={supplier.business_name} />
                {contactLinks[0] && (
                  <a href={contactLinks[0].href} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary/5">
                    Contact Supplier
                  </a>
                )}
              </div>
            </div>

            <div className="order-1 overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-2xl shadow-primary/10 lg:order-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(209,108,120,0.16),transparent_35%),linear-gradient(135deg,#fff8f4,#f3ddd8)]">
                {supplier.cover_image_url ? (
                  isOptimizableImageHost(supplier.cover_image_url) ? (
                    <Image
                      src={supplier.cover_image_url}
                      alt={`${supplier.business_name} — ${supplier.category}`}
                      fill
                      priority
                      sizes="(min-width: 1024px) 45vw, 95vw"
                      className="object-contain p-6"
                    />
                  ) : (
                    <img src={supplier.cover_image_url} alt={`${supplier.business_name} — ${supplier.category}`} className="h-full w-full object-contain p-6" />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Sparkles className="h-14 w-14 text-primary/45" />
                  </div>
                )}
                {supplier.is_featured && (
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_360px]">
            <article className="rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">About</p>
              <div className="mt-4 whitespace-pre-line text-base leading-8 text-text-secondary">
                {supplier.description || supplier.summary || `${supplier.business_name} serves couples in ${location || 'the Philippines'}.`}
              </div>

              {gallery.length > 0 && (
                <div className="mt-8 border-t border-border pt-8">
                  <h2 className="font-serif text-3xl font-bold text-foreground">Gallery</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {gallery.map((imageUrl, idx) =>
                      isOptimizableImageHost(imageUrl) ? (
                        <div key={imageUrl} className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                          <Image
                            src={imageUrl}
                            alt={`${supplier.business_name} portfolio photo ${idx + 1}`}
                            fill
                            sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 95vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <img
                          key={imageUrl}
                          src={imageUrl}
                          alt={`${supplier.business_name} portfolio photo ${idx + 1}`}
                          className="aspect-[4/3] w-full rounded-2xl object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ),
                    )}
                  </div>
                </div>
              )}
            </article>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-border bg-white p-5 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-foreground">Supplier Details</h2>
                <div className="mt-5 space-y-3 text-sm text-text-secondary">
                  <p><span className="font-bold text-foreground">Category:</span> <Link href={`/suppliers/category/${categorySlug}`} className="text-primary hover:underline">{supplier.category}</Link></p>
                  {location && <p><span className="font-bold text-foreground">Location:</span> {location}</p>}
                  <p><span className="font-bold text-foreground">Price:</span> {supplier.price_band || 'Custom quote'}</p>
                  {(supplier.service_areas || []).length > 0 && (
                    <p><span className="font-bold text-foreground">Service areas:</span> {(supplier.service_areas || []).join(', ')}</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-primary/20 bg-white p-5 shadow-xl shadow-primary/10">
                <h2 className="font-serif text-2xl font-bold text-foreground">Contact</h2>
                <div className="mt-5 grid gap-2">
                  {contactLinks.length === 0 ? (
                    <p className="text-sm text-text-secondary">Contact details will appear once this supplier adds them.</p>
                  ) : contactLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex min-h-[46px] items-center gap-3 rounded-xl bg-neutral px-4 py-3 text-sm font-bold text-foreground transition hover:bg-primary hover:text-white"
                      >
                        <Icon className="h-4 w-4 flex-none" />
                        <span className="truncate">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

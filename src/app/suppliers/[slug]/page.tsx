import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Globe2, Instagram, Mail, MapPin, Phone, Sparkles, type LucideIcon } from 'lucide-react';
import SupplierSaveButton from '@/components/suppliers/SupplierSaveButton';
import { supabase } from '@/lib/supabase';
import {
  getSupplierDisplayLocation,
  sanitizeSupplierUrl,
  type SupplierProfile,
} from '@/lib/suppliers';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getSupplier(slug: string) {
  try {
    const { data, error } = await supabase
      .from('supplier_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'approved')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn('Unable to load supplier:', error.message);
      return null;
    }

    return data as SupplierProfile | null;
  } catch (error) {
    console.warn('Unable to load supplier:', error);
    return null;
  }
}

function getWhatsappUrl(value?: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supplier = await getSupplier(slug);

  if (!supplier) {
    return {
      title: 'Supplier Not Found | QuickWeds',
    };
  }

  return {
    title: `${supplier.business_name} | QuickWeds Suppliers`,
    description: supplier.summary || supplier.description || `View ${supplier.business_name} in the QuickWeds wedding supplier directory.`,
    alternates: {
      canonical: `/suppliers/${supplier.slug}`,
    },
    openGraph: {
      title: `${supplier.business_name} | QuickWeds Suppliers`,
      description: supplier.summary || supplier.description || '',
      images: supplier.cover_image_url ? [supplier.cover_image_url] : undefined,
    },
  };
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supplier = await getSupplier(slug);

  if (!supplier) notFound();

  const location = getSupplierDisplayLocation(supplier);
  const gallery = (supplier.gallery_images || []).filter(Boolean);
  const contactLinks = [
    supplier.phone ? { label: supplier.phone, href: `tel:${supplier.phone}`, icon: Phone } : null,
    supplier.email ? { label: supplier.email, href: `mailto:${supplier.email}`, icon: Mail } : null,
    getWhatsappUrl(supplier.whatsapp) ? { label: 'WhatsApp', href: getWhatsappUrl(supplier.whatsapp)!, icon: Phone } : null,
    sanitizeSupplierUrl(supplier.website_url) ? { label: 'Website', href: sanitizeSupplierUrl(supplier.website_url)!, icon: Globe2 } : null,
    sanitizeSupplierUrl(supplier.instagram_url) ? { label: 'Instagram', href: sanitizeSupplierUrl(supplier.instagram_url)!, icon: Instagram } : null,
    sanitizeSupplierUrl(supplier.facebook_url) ? { label: 'Facebook', href: sanitizeSupplierUrl(supplier.facebook_url)!, icon: ExternalLink } : null,
  ].filter(Boolean) as Array<{ label: string; href: string; icon: LucideIcon }>;

  return (
    <div className="min-h-screen bg-neutral text-foreground">
      <header className="border-b border-border/70 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <img src="/logo.png" alt="QuickWeds" className="h-10 w-auto object-contain" />
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
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary shadow-sm">
                <Sparkles className="h-4 w-4" />
                {supplier.category}
              </span>
              <h1 className="mt-5 font-serif text-[2.6rem] font-bold leading-[1.04] text-foreground sm:text-6xl">
                {supplier.business_name}
              </h1>
              <p className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-2 text-sm font-bold text-text-secondary lg:mx-0 lg:justify-start">
                <MapPin className="h-4 w-4 text-primary" />
                {location}
              </p>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg lg:mx-0">
                {supplier.summary || supplier.description || 'A trusted QuickWeds wedding supplier ready to support your celebration.'}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <SupplierSaveButton supplierId={supplier.id} />
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
                  <img src={supplier.cover_image_url} alt={`${supplier.business_name} cover`} className="h-full w-full object-cover" />
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
                {supplier.description || supplier.summary || `${supplier.business_name} serves couples in ${location}.`}
              </div>

              {gallery.length > 0 && (
                <div className="mt-8 border-t border-border pt-8">
                  <h2 className="font-serif text-3xl font-bold text-foreground">Gallery</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {gallery.map((imageUrl) => (
                      <img key={imageUrl} src={imageUrl} alt={`${supplier.business_name} gallery`} className="aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" />
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-border bg-white p-5 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-foreground">Supplier Details</h2>
                <div className="mt-5 space-y-3 text-sm text-text-secondary">
                  <p><span className="font-bold text-foreground">Category:</span> {supplier.category}</p>
                  <p><span className="font-bold text-foreground">Location:</span> {location}</p>
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

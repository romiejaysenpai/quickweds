import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Palette, Sparkles } from 'lucide-react';
import { landingTemplatePreviews } from '@/lib/landing-templates';
import {
  TEMPLATES,
  getTemplateStyleVariants,
  templateMatchesFilter,
  type TemplateFilter,
} from '@/lib/template-catalog';
import {
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  rsvpWordingPath,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/seo';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const STYLE_CATEGORIES: Exclude<TemplateFilter, 'all'>[] = [
  'classic',
  'modern',
  'romantic',
  'destination',
  'bold',
];

function getTemplateRecord(slug: string) {
  const preview = landingTemplatePreviews.find((item) => item.id === slug);
  if (!preview) return null;
  const catalog = TEMPLATES.find((item) => item.id === slug);
  const categories = STYLE_CATEGORIES.filter((filter) => templateMatchesFilter(slug, filter));
  return { preview, catalog, categories };
}

export function generateStaticParams() {
  return landingTemplatePreviews.map((template) => ({ slug: template.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = getTemplateRecord(slug);
  if (!record) return {};

  const { preview, catalog, categories } = record;
  const styleLabel = categories.length > 0 ? categories[0] : 'wedding';
  const title = `${preview.name} Wedding Website Template`;
  const description =
    catalog?.desc
      ? `${catalog.desc} Customize the ${preview.name} ${styleLabel} wedding website template free on QuickWeds with online RSVP, schedule, venue map, and photo gallery.`
      : `Customize the ${preview.name} wedding website template (${preview.mood}) free on QuickWeds with online RSVP, venue details, timeline, and mobile-ready design.`;

  const absoluteImageUrl = preview.image.startsWith('http')
    ? preview.image
    : `${siteOrigin}${preview.image}`;

  return publicPageMetadata(`/templates/${preview.id}`, title, description, 'website', {
    image: {
      url: absoluteImageUrl,
      alt: `${preview.name} wedding website template preview`,
    },
    keywords: [
      `${preview.name.toLowerCase()} wedding website template`,
      `${styleLabel} wedding website template`,
      'free wedding website template',
      'digital wedding invitation template',
    ],
  });
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const record = getTemplateRecord(slug);
  if (!record) notFound();

  const { preview, catalog, categories } = record;
  const variants = getTemplateStyleVariants(preview.id).slice(0, 5);
  const primaryCategory = categories[0] || 'classic';
  const related = landingTemplatePreviews
    .filter((item) => item.id !== preview.id && templateMatchesFilter(item.id, primaryCategory))
    .slice(0, 4);

  const path = `/templates/${preview.id}`;
  const absoluteImageUrl = preview.image.startsWith('http')
    ? preview.image
    : `${siteOrigin}${preview.image}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteOrigin}${path}#webpage`,
        url: `${siteOrigin}${path}`,
        name: `${preview.name} Wedding Website Template | QuickWeds`,
        description: catalog?.desc || `${preview.name} wedding website design on QuickWeds.`,
        isPartOf: { '@id': `${siteOrigin}/#website` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: absoluteImageUrl,
        },
        inLanguage: 'en',
      },
      {
        '@type': 'CreativeWork',
        name: `${preview.name} Wedding Website Template`,
        description: catalog?.desc || `Customizable ${preview.mood.toLowerCase()} wedding website template with built-in RSVP.`,
        image: absoluteImageUrl,
        url: `${siteOrigin}${path}`,
        creator: { '@id': `${siteOrigin}/#organization` },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'PHP',
          availability: 'https://schema.org/InStock',
          url: `${siteOrigin}/builder?template=${preview.id}`,
        },
      },
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Templates', path: '/templates' },
        { name: preview.name, path },
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
            <Image src="/logo.png" alt="QuickWeds" width={140} height={40} className="h-9 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/templates"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              All Templates
            </Link>
            <Link
              href={`/builder?template=${preview.id}`}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
            >
              Use Template
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-text-secondary">
          <Link href="/" className="hover:text-primary">QuickWeds</Link>
          <span aria-hidden="true">/</span>
          <Link href="/templates" className="hover:text-primary">Templates</Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{preview.name}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-2xl shadow-primary/10">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-[#fffaf7]">
              <Image
                src={preview.image}
                alt={`${preview.name} wedding website template preview`}
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 96vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {catalog?.eyebrow || preview.mood}
              </span>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {preview.name} Wedding Website Template
              </h1>
              <p className="mt-4 text-base leading-8 text-text-secondary sm:text-lg">
                {catalog?.desc ||
                  `A ${preview.mood.toLowerCase()} wedding website design built for phones and desktop, complete with online RSVP, event schedule, venue directions, and photo gallery.`}
              </p>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">Styles:</span>
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs font-bold capitalize text-foreground"
                  >
                    {cat}
                  </span>
                ))}
                {catalog?.accent && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-foreground">
                    <span
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: catalog.accent }}
                      aria-hidden="true"
                    />
                    Signature Accent
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/builder?template=${preview.id}`}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover sm:text-base"
              >
                Customize {preview.name} Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary sm:text-base"
              >
                Watch Product Demo
              </Link>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Included with every QuickWeds template
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  'Built-in mobile-friendly online RSVP form',
                  'Custom motif colors, fonts & couple monogram',
                  'Venue map, ceremony & reception timeline',
                  'Visual attire guide & guest color swatches',
                  'QR code sharing for printed & digital invites',
                  'Post-wedding photo gallery & Wall of Love',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm font-semibold text-text-secondary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Layout variations for {preview.name}
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Switch between 5 curated layout compositions inside the builder without retyping your wedding details.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {variants.map((variant) => (
                  <div key={variant.id} className="rounded-2xl border border-border/80 bg-neutral p-4">
                    <p className="text-sm font-bold text-foreground">{variant.name}</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">{variant.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm font-bold text-primary">
              <Link href="/wedding-website-builder" className="underline">Wedding Website Builder</Link>
              <Link href="/wedding-rsvp" className="underline">Online Wedding RSVP</Link>
              <Link href={rsvpWordingPath} className="underline">Wedding RSVP Wording Examples</Link>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">More designs</p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">
                  Similar wedding website templates
                </h2>
              </div>
              <Link href="/templates" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                View all {landingTemplatePreviews.length} templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <Link href={`/templates/${item.id}`} className="flex h-full flex-col">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#fffaf7]">
                      <Image
                        src={item.image}
                        alt={`${item.name} wedding website template`}
                        fill
                        sizes="(max-width: 1023px) 48vw, 24vw"
                        className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4">
                      <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-primary/70">{item.mood}</p>
                      <h3 className="mt-1 font-serif text-lg font-bold text-foreground">{item.name}</h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

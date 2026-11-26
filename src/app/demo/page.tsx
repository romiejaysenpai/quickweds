import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarCheck, Video } from 'lucide-react';
import AppDemoVideo from '@/components/AppDemoVideo';
import {
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  serializeJsonLd,
  siteOrigin,
  sitePreviewImage,
} from '@/lib/seo';

export const metadata = publicPageMetadata(
  '/demo',
  'Interactive Demo — Wedding Website Builder & RSVP Planner',
  'Watch how QuickWeds helps couples create wedding websites, collect online RSVPs, manage guests, track budgets, and plan seating in one workspace.',
);

export default function DemoPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteOrigin}/demo#webpage`,
        url: `${siteOrigin}/demo`,
        name: 'QuickWeds Demo — Wedding Website Builder & RSVP Planner',
        description:
          'Watch how QuickWeds helps couples create wedding websites, collect online RSVPs, and plan their celebration.',
        isPartOf: { '@id': `${siteOrigin}/#website` },
        inLanguage: 'en',
      },
      {
        '@type': 'VideoObject',
        name: 'QuickWeds Wedding Website & Planner Walkthrough',
        description:
          'Step-by-step product walkthrough showing how to build a wedding website, collect online RSVPs, organize seating, and manage your wedding budget with QuickWeds.',
        thumbnailUrl: [sitePreviewImage],
        contentUrl: `${siteOrigin}/demo/quickweds-app-demo.mp4`,
        uploadDate: '2026-10-31T00:00:00Z',
        publisher: { '@id': `${siteOrigin}/#organization` },
      },
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Demo', path: '/demo' },
      ]),
    ],
  };

  return (
    <main className="min-h-screen bg-neutral px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <section className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-2xl shadow-primary/10 sm:rounded-[2rem]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative flex min-h-[360px] items-center bg-[linear-gradient(135deg,#3A2A2D_0%,#7A5A61_55%,#D16C78_100%)] p-5 text-white sm:min-h-[480px] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(214,184,124,0.3),transparent_28%)]" />
              <AppDemoVideo className="relative w-full" />
            </div>

            <div className="p-6 text-center sm:p-8 lg:p-10 lg:text-left">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.28em]">
                <Video className="h-3.5 w-3.5" />
                Product Walkthrough
              </span>
              <h1 className="font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                See how QuickWeds simplifies the whole wedding.
              </h1>
              <p className="mt-4 text-sm leading-7 text-text-secondary sm:text-base">
                Watch the QuickWeds app walkthrough, then start building instantly or explore our collection of wedding website templates.
              </p>

              <div className="mt-6 grid gap-3 text-left">
                {[
                  'Create a wedding website and online RSVP flow in minutes',
                  'Track guests, budgets, vendors, checklists, and seating charts',
                  'Send automated RSVP emails, notifications, and guest reminders',
                ].map((item) => (
                  <p key={item} className="flex gap-3 rounded-2xl bg-neutral p-3 text-sm font-semibold leading-6 text-foreground">
                    <CalendarCheck className="mt-0.5 h-5 w-5 flex-none text-primary" />
                    {item}
                  </p>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/builder"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                >
                  Browse Templates
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

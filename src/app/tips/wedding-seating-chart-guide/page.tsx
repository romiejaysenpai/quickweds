import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  publicPageMetadata,
  serializeJsonLd,
} from '@/lib/seo';

const path = '/tips/wedding-seating-chart-guide';
const title = 'Wedding Reception Seating Chart & QR Seat Finder Guide';
const description =
  'Learn how to arrange VIP, principal sponsor, family, and friend tables, avoid reception bottlenecks, and let guests find their seats with a QR Seat Finder.';

export const metadata = publicPageMetadata(path, title, description, 'article', {
  keywords: [
    'wedding seating chart guide',
    'wedding reception seating arrangement',
    'qr seat finder wedding',
    'principal sponsors table seating',
  ],
});

const faqs = [
  {
    question: 'When should we finalize our wedding seating chart?',
    answer:
      'Start drafting tables 3 weeks before the wedding as RSVPs roll in, and lock the final seating chart 5 to 7 days before the reception once your caterer confirms final counts.',
  },
  {
    question: 'How does a QR Seat Finder work at a wedding reception?',
    answer:
      'Instead of guests crowding around one printed seating board, place a venue QR code at the reception entrance. Guests scan it on their phone, type their name or guest code, and immediately see their table number.',
  },
];

export default function WeddingSeatingChartGuidePage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      buildArticleJsonLd({
        path,
        headline: title,
        description,
        datePublished: '2026-11-26',
        dateModified: '2026-11-26',
      }),
      buildFaqJsonLd(faqs),
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Wedding Planning Tips', path: '/tips' },
        { name: 'Wedding Seating Chart Guide', path },
      ]),
    ],
  };

  return (
    <main className="min-h-screen bg-neutral px-5 py-10 text-foreground sm:px-8 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/tips" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Wedding Planning Tips
        </Link>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">Seating &amp; Reception</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-text-secondary">
          A thoughtful wedding seating chart prevents awkward gaps, keeps elderly relatives comfortable, and stops entrance bottlenecks when dinner starts. Group guests by shared context—immediate family, principal sponsors, college friends, workmates—and keep tables near the front for VIPs.
        </p>

        <section className="mt-10 space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-bold">1. Map VIP &amp; Principal Sponsor Tables First</h2>
            <p className="mt-3 leading-7 text-text-secondary">
              Place parents, grandparents, and Principal Sponsors (Ninong &amp; Ninang) closest to the couple&apos;s stage with a clear line of sight—and away from loud main speakers so older guests can talk comfortably.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-bold">2. Standard Table Capacities &amp; Buffer Seats</h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-6 text-text-secondary sm:text-base">
              <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /><span><strong>60-inch round tables:</strong> Comfortable for 8 guests (10 max if tight).</span></li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /><span><strong>72-inch round tables:</strong> Comfortable for 10 guests (up to 12).</span></li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /><span><strong>Buffer rule:</strong> Leave 1–2 flex seats per zone for unexpected plus-ones or last-minute changes.</span></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-bold">3. Skip Entrance Queues with a QR Seat Finder</h2>
            <p className="mt-3 leading-7 text-text-secondary">
              Traditional printed boards create long queues right before the program begins—and break if someone cancels the morning of the wedding. With QuickWeds, you can email personal seat links beforehand and display one reception QR code that updates live if you swap seats on the wedding day.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-border bg-white p-5">
                <summary className="cursor-pointer font-serif text-lg font-bold text-foreground">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="mt-12 rounded-2xl border border-primary/20 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Visual Table Planner</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Drag-and-drop your floor plan &amp; generate seat QRs</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            Pull confirmed RSVP guests straight onto tables, generate venue QR signage, and run fast arrival check-in on wedding day.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-primary">
            <Link href="/wedding-seating-chart" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-white hover:bg-primary-hover">
              Try Seating Chart Maker <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/user-guide/seating-planner" className="inline-flex min-h-11 items-center underline">Read Seating Planner Tutorial</Link>
          </div>
        </aside>
      </article>
    </main>
  );
}

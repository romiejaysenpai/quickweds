import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  publicPageMetadata,
  serializeJsonLd,
} from '@/lib/seo';

const path = '/tips/philippines-wedding-budget-breakdown';
const title = 'Philippines Wedding Budget Breakdown: ₱150k to ₱1M Guide';
const description =
  'Plan your wedding budget in the Philippines with realistic cost percentages for ₱150k, ₱300k, ₱500k, and ₱1M celebrations, plus hidden fees to watch out for.';

export const metadata = publicPageMetadata(path, title, description, 'article', {
  keywords: [
    'philippines wedding budget breakdown',
    'wedding cost philippines',
    '300k wedding budget philippines',
    '500k wedding budget philippines',
    'wedding budget planner philippines',
  ],
});

const allocations = [
  { category: 'Venue & Catering (Food + Drinks)', share: '40% – 45%', p150: '₱65,000', p300: '₱130,000', p500: '₱215,000', p1m: '₱430,000' },
  { category: 'Photography & Videography', share: '12% – 15%', p150: '₱20,000', p300: '₱42,000', p500: '₱70,000', p1m: '₱140,000' },
  { category: 'Event Styling, Florals & Lights', share: '10% – 12%', p150: '₱16,000', p300: '₱33,000', p500: '₱55,000', p1m: '₱115,000' },
  { category: 'Attire, Hair & Makeup (HMUA)', share: '8% – 10%', p150: '₱14,000', p300: '₱28,000', p500: '₱45,000', p1m: '₱90,000' },
  { category: 'Coordination, Host & Music', share: '7% – 10%', p150: '₱12,000', p300: '₱25,000', p500: '₱42,000', p1m: '₱85,000' },
  { category: 'Church / Civil Fees, Rings & Invites', share: '5% – 7%', p150: '₱8,000', p300: '₱15,000', p500: '₱28,000', p1m: '₱50,000' },
  { category: 'Emergency Buffer & Crew Meals', share: '10%', p150: '₱15,000', p300: '₱27,000', p500: '₱45,000', p1m: '₱90,000' },
];

const faqs = [
  {
    question: 'How much does an average wedding cost in the Philippines?',
    answer:
      'An intimate 50-guest wedding in the Philippines typically ranges from ₱150,000 to ₱300,000, while a 100–150 guest hotel or garden wedding commonly lands between ₱450,000 and ₱900,000 depending on location (Metro Manila, Tagaytay, Cebu, or provincial venues).',
  },
  {
    question: 'What hidden wedding costs surprise Filipino couples most?',
    answer:
      'Corkage fees, supplier crew meals (usually 15–30 crew members), venue ingress/egress overtime, electricity charges for lights and sounds, and out-of-town transportation fees (OOTF) are the most common unplanned expenses.',
  },
  {
    question: 'How can couples reduce wedding costs without sacrificing guest experience?',
    answer:
      'Trimming the guest list has the largest impact because catering, chairs, linens, and favors scale per head. Switching to a free digital wedding website with online RSVP also saves ₱10,000–₱30,000 in printing and delivery costs.',
  },
];

export default function PhilippinesWeddingBudgetPage() {
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
        { name: 'Philippines Wedding Budget Breakdown', path },
      ]),
    ],
  };

  return (
    <main className="min-h-screen bg-neutral px-5 py-10 text-foreground sm:px-8 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <article className="mx-auto max-w-4xl">
        <Link href="/tips" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Wedding Planning Tips
        </Link>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">Budget &amp; Costs</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-text-secondary">
          A realistic Philippines wedding budget allocates roughly <strong>40–45% to venue and catering</strong>, <strong>12–15% to photo and video</strong>, <strong>10–12% to styling</strong>, and reserves at least <strong>10% as an emergency buffer</strong> for corkage, crew meals, and overtime fees.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-3xl font-bold">Sample Budget Table (₱150k to ₱1M)</h2>
          <p className="mt-3 leading-7 text-text-secondary">
            Use these benchmarks as a starting point, then adjust percentages based on your top 3 priorities and guest count.
          </p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-[#fffaf7] text-xs font-black uppercase tracking-wider text-foreground">
                <tr>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Share</th>
                  <th className="px-4 py-3.5">₱150k</th>
                  <th className="px-4 py-3.5">₱300k</th>
                  <th className="px-4 py-3.5">₱500k</th>
                  <th className="px-4 py-3.5">₱1M</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-secondary">
                {allocations.map((row) => (
                  <tr key={row.category}>
                    <td className="px-4 py-3.5 font-bold text-foreground">{row.category}</td>
                    <td className="px-4 py-3.5">{row.share}</td>
                    <td className="px-4 py-3.5">{row.p150}</td>
                    <td className="px-4 py-3.5">{row.p300}</td>
                    <td className="px-4 py-3.5">{row.p500}</td>
                    <td className="px-4 py-3.5">{row.p1m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-bold">6 Hidden Wedding Costs to Budget Early</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              'Supplier crew meals (breakfast, lunch & dinner)',
              'Out-of-town transportation fees (OOTF) for Tagaytay/destination venues',
              'Venue corkage for outside lechon, grazing tables, or mobile bar',
              'Lights, sounds & LED wall electricity surcharges',
              'Ingress/egress overtime fees past reception curfew',
              'Marriage license, CENOMAR, seminar & church stipend fees',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-text-secondary">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-border bg-white p-5">
                <summary className="cursor-pointer font-serif text-lg font-bold text-foreground">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="mt-12 rounded-2xl border border-primary/20 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Free PHP Budget Tool</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Track every deposit and balance in PHP</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            QuickWeds includes a free multi-currency wedding budget planner (supporting PHP, USD, AUD, CAD, EUR, and more) linked directly to your suppliers and guest list.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-primary">
            <Link href="/wedding-budget-planner" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-white hover:bg-primary-hover">
              Try Free Wedding Budget Planner <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/suppliers" className="inline-flex min-h-11 items-center underline">Browse Philippines Wedding Suppliers</Link>
            <Link href="/wedding-planner-philippines" className="inline-flex min-h-11 items-center underline">Philippines Wedding Planner</Link>
          </div>
        </aside>
      </article>
    </main>
  );
}

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  publicPageMetadata,
  serializeJsonLd,
} from '@/lib/seo';

const path = '/tips/12-month-wedding-checklist-philippines';
const title = '12-Month Wedding Planning Checklist (Philippines Church & Civil)';
const description =
  'Follow a month-by-month wedding planning checklist tailored for Philippines church and civil weddings, including marriage license, CENOMAR, and vendor booking milestones.';

export const metadata = publicPageMetadata(path, title, description, 'article', {
  keywords: [
    'wedding checklist philippines',
    '12 month wedding planning checklist',
    'philippines church wedding requirements',
    'civil wedding requirements philippines',
  ],
});

const timeline = [
  {
    window: '10 – 12 Months Before',
    tasks: [
      'Align on target budget, guest count range, and top 3 priorities with your partner',
      'Reserve your church or civil ceremony date and book the reception venue',
      'Hire your wedding coordinator (full or semi) and shortlist photo/video teams',
      'Draft your initial guest list and principal sponsors (Ninong & Ninang)',
    ],
  },
  {
    window: '7 – 9 Months Before',
    tasks: [
      'Book catering, event stylist, hair & makeup artist (HMUA), host, and band/DJ',
      'Send entourage proposals to principal sponsors, bridesmaids, and groomsmen',
      'Launch your free QuickWeds wedding website and share save-the-date links',
      'Start wedding gown and Barong/suit design consultations',
    ],
  },
  {
    window: '4 – 6 Months Before',
    tasks: [
      'Request PSA birth certificates and CENOMAR (valid 6 months for church/civil use)',
      'Book prenup shoot location, outfits, and HMUA',
      'Schedule food tasting and finalize menu selections with your caterer',
      'Confirm wedding rings, cake, souvenirs, and hotel prep rooms',
    ],
  },
  {
    window: '2 – 3 Months Before',
    tasks: [
      'Apply for your Marriage License at the Local Civil Registrar (valid 120 days) and attend Pre-Cana / Family Planning Seminar',
      'Complete canonical interview and marriage banns (for Catholic church weddings)',
      'Send official invitations and wedding website RSVP link with a clear deadline',
      'Hold first gown/suit fitting and finalize entourage attire',
    ],
  },
  {
    window: '1 Month to Wedding Week',
    tasks: [
      'Follow up on pending RSVPs and lock your final catering headcount',
      'Finalize your reception seating chart, VIP tables, and print QR Seat Finder signage',
      'Send crew meal counts, ingress/egress schedule, and supplier balances to your coordinator',
      'Pack wedding day essentials, rings, vows, and final vendor balance envelopes',
    ],
  },
];

const faqs = [
  {
    question: 'When should we get our Marriage License in the Philippines?',
    answer:
      'Apply 2 to 3 months before your wedding. A Philippine Marriage License requires a 10-day posting period before release and stays valid for 120 days from the date of issue.',
  },
  {
    question: 'How far in advance should we book a church and venue in the Philippines?',
    answer:
      'Popular churches and Tagaytay/Metro Manila venues often fill up 10 to 18 months ahead for December, January, and weekend dates. Lock in your ceremony and reception venues first before booking other suppliers.',
  },
];

export default function WeddingChecklistPhilippinesPage() {
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
        { name: '12-Month Wedding Checklist', path },
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
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">Timeline &amp; Checklist</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-text-secondary">
          Planning a church or civil wedding in the Philippines runs smoothly when you sequence bookings from biggest constraints (venue, church, and major suppliers) down to legal requirements (CENOMAR, Marriage License, Pre-Cana) and final guest counts.
        </p>

        <div className="mt-10 space-y-6">
          {timeline.map((phase) => (
            <section key={phase.window} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-foreground">{phase.window}</h2>
              <ul className="mt-4 space-y-3">
                {phase.tasks.map((task) => (
                  <li key={task} className="flex items-start gap-2.5 text-sm leading-6 text-text-secondary sm:text-base">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Interactive Checklist</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Load a 12-month checklist tailored to your date</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            QuickWeds seeds a complete wedding checklist based on your wedding date and lets you share progress with your partner and coordinator.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-primary">
            <Link href="/wedding-checklist" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-white hover:bg-primary-hover">
              Open Free Wedding Checklist <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tips/philippines-wedding-budget-breakdown" className="inline-flex min-h-11 items-center underline">Philippines Wedding Budget Breakdown</Link>
          </div>
        </aside>
      </article>
    </main>
  );
}

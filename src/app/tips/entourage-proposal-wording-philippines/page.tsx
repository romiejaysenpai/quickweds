import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  serializeJsonLd,
} from '@/lib/seo';

const path = '/tips/entourage-proposal-wording-philippines';
const title = 'Ninong, Ninang & Wedding Entourage Proposal Wording';
const description =
  'Copy warm English and Tagalog wedding entourage proposal messages for Principal Sponsors (Ninong & Ninang), Best Man, Maid of Honor, bridesmaids, and groomsmen.';

export const metadata = publicPageMetadata(path, title, description, 'article', {
  keywords: [
    'ninong ninang proposal wording',
    'principal sponsor invitation message philippines',
    'bridesmaid proposal wording',
    'wedding entourage invitation message',
  ],
});

const messages = [
  {
    title: 'Principal Sponsors (Ninong / Ninang) — Formal English',
    text: 'Dear Tito [Name] & Tita [Name], as we prepare to begin our new chapter together on [Wedding Date] at [Venue], we would be deeply honored to have your guidance and blessing as our Principal Sponsors (Ninong & Ninang). You have always been an inspiration to us, and having you stand as witnesses to our vows would mean the world to our families.',
  },
  {
    title: 'Principal Sponsors (Ninong / Ninang) — Warm Tagalog',
    language: 'tl',
    text: 'Mahal naming Tito [Pangalan] at Tita [Pangalan], buong puso po namin kayong inaanyayahang maging aming Ninong at Ninang sa aming kasal sa [Petsa ng Kasal] sa [Lugar]. Malaki po ang naging bahagi ninyo sa aming buhay, at isang malaking karangalan po para sa amin na makasama kayo at matanggap ang inyong basbas sa araw ng aming pag-iisang dibdib.',
  },
  {
    title: 'Maid of Honor / Best Man',
    text: 'I can’t imagine walking into marriage without you right beside me. Thank you for every laugh, honest advice, and memory that brought us here. Will you be my [Maid of Honor / Best Man] on [Wedding Date]?',
  },
  {
    title: 'Bridesmaids & Groomsmen',
    text: 'We’re getting married on [Wedding Date] and our wedding party wouldn’t be complete without you! Will you stand by our side as one of our [Bridesmaids / Groomsmen] and celebrate with us?',
  },
  {
    title: 'Secondary Sponsors (Veil, Cord, Candle)',
    text: 'Dear [Names], you have shown us what love, faith, and support look like in real life. We would love to ask you to be our [Veil / Cord / Candle] Sponsors on [Wedding Date] and share this special blessing during our ceremony.',
  },
];

export default function EntourageProposalWordingPage() {
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
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Wedding Planning Tips', path: '/tips' },
        { name: 'Entourage Proposal Wording', path },
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
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">Entourage &amp; Family</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-text-secondary">
          Ask your Principal Sponsors (Ninong &amp; Ninang) and wedding party <strong>6 to 9 months before the wedding</strong> so they have time to arrange attire, leave, and travel. Keep the message personal, mention the wedding date and city, and clearly state the role you are inviting them to take.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="font-serif text-3xl font-bold">Entourage Messages You Can Copy</h2>
          {messages.map((item) => (
            <section key={item.title} className="rounded-2xl border border-border bg-white p-5 sm:p-6">
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              <blockquote lang={item.language} className="mt-2 border-l-2 border-primary/40 pl-4 leading-7 text-text-secondary">
                {item.text}
              </blockquote>
            </section>
          ))}
        </section>

        <aside className="mt-12 rounded-2xl border border-primary/20 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Digital Proposals</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Send entourage proposals &amp; track who accepted</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            QuickWeds lets you send styled email proposals to sponsors and wedding party members with 1-tap accept/decline tracking inside your Planner.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-primary">
            <Link href="/user-guide/entourage-proposals" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-white hover:bg-primary-hover">
              See Entourage Proposal Guide <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tips/wedding-rsvp-wording" className="inline-flex min-h-11 items-center underline">Wedding RSVP Wording Examples</Link>
          </div>
        </aside>
      </article>
    </main>
  );
}

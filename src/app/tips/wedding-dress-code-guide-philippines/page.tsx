import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  publicPageMetadata,
  serializeJsonLd,
} from '@/lib/seo';

const path = '/tips/wedding-dress-code-guide-philippines';
const title = 'Wedding Dress Code & Attire Guide for Guests (Philippines)';
const description =
  'Explain formal, Barong Tagalog, Modern Filipiniana, semi-formal, garden, and beach wedding dress codes clearly with color palettes and footwear notes.';

export const metadata = publicPageMetadata(path, title, description, 'article', {
  keywords: [
    'wedding dress code guide philippines',
    'filipiniana wedding dress code',
    'garden wedding attire philippines',
    'wedding attire wording guests',
  ],
});

const dressCodes = [
  {
    name: 'Formal / Modern Filipiniana & Barong',
    guests: 'Long gowns or Modern Filipiniana dresses for women; classic Barong Tagalog with dark slacks or formal suit for men.',
    bestFor: 'Church ceremonies, hotel ballrooms, heritage venues.',
  },
  {
    name: 'Semi-Formal / Cocktail Attire',
    guests: 'Midi or tea-length dresses, dressy jumpsuits, button-down long sleeves with tailored trousers (blazer optional in tropical weather).',
    bestFor: 'Afternoon receptions, restaurant weddings, intimate city celebrations.',
  },
  {
    name: 'Garden / Tagaytay Chic',
    guests: 'Breathable flowing fabrics (chiffon, linen, silk), pastel or earth tones, and block heels, wedges, or dressy flats for grass lawns.',
    bestFor: 'Tagaytay, Alfonso, Antipolo, and outdoor courtyard venues.',
  },
  {
    name: 'Beach Formal (Boracay / Palawan / Batangas)',
    guests: 'Lightweight maxi dresses, linen suits, or short-sleeve Barong/guayabera shirts paired with loafers or dress sandals.',
    bestFor: 'Coastal resorts and sunset destination ceremonies.',
  },
];

export default function WeddingDressCodeGuidePage() {
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
        { name: 'Wedding Dress Code Guide', path },
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
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">Attire &amp; Styling</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-text-secondary">
          Guests almost always ask two things after receiving a wedding invite: <strong>what to wear</strong> and <strong>which colors to follow or avoid</strong>. Adding visual color swatches and footwear tips on your wedding website removes guesswork and keeps photos cohesive.
        </p>

        <div className="mt-10 grid gap-4">
          {dressCodes.map((code) => (
            <section key={code.name} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-foreground">{code.name}</h2>
              <p className="mt-2 text-sm leading-7 text-text-secondary sm:text-base">{code.guests}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-primary">Best for: {code.bestFor}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-bold">3 Quick Tips for Attire Wording</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-text-secondary sm:text-base">
            <li>Show 4–6 exact color swatches instead of vague labels like &quot;earth tones&quot;.</li>
            <li>Politely note reserved colors (e.g., &quot;Please reserve white and ivory for the bride&quot;).</li>
            <li>Mention venue surfaces and climate (grass lawns, evening breeze in Tagaytay, air-conditioned ballroom).</li>
          </ul>
        </section>

        <aside className="mt-12 rounded-2xl border border-primary/20 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Built-In Visual Attire Guide</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Show attire silhouettes &amp; color swatches on your website</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            Every QuickWeds wedding website includes a Visual Attire Guide with interactive color palette swatches and illustrated cards for guests, sponsors, and bridesmaids.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-primary">
            <Link href="/wedding-website-builder" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-white hover:bg-primary-hover">
              Build Your Wedding Website Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/user-guide/attire-guide-dress-code" className="inline-flex min-h-11 items-center underline">Read Attire Guide Tutorial</Link>
          </div>
        </aside>
      </article>
    </main>
  );
}

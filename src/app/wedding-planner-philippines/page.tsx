import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Heart, MapPin, QrCode, Sparkles, Wallet } from 'lucide-react';
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  publicPageMetadata,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/seo';

const path = '/wedding-planner-philippines';
const title = 'Free Wedding Website & Wedding Planner in the Philippines';
const description =
  'Plan your Philippine wedding in one calm workspace. Build a free wedding website with online RSVP, PHP budget tracker, QR Seat Finder, entourage proposals, and Philippines supplier directory.';

export const metadata = publicPageMetadata(path, title, description, 'website', {
  keywords: [
    'wedding planner philippines',
    'free wedding website philippines',
    'online wedding rsvp philippines',
    'wedding budget tracker php',
    'philippines wedding supplier directory',
  ],
});

const philippinesFaqs = [
  {
    question: 'How much does QuickWeds cost in Philippine Pesos (PHP)?',
    answer:
      'QuickWeds is free to start—including all 60 wedding website templates, online RSVP tracking, QR sharing, 50 guest emails, and Planner Lite. When you need unlimited planning tools, QR Seat Finder, Wedding Day Mode, photo moderation, and custom domains, Planner Pro is a one-time ₱850 upgrade with no monthly subscription.',
  },
  {
    question: 'Does QuickWeds work for Filipino weddings with Ninong, Ninang, and large families?',
    answer:
      'Yes. QuickWeds supports household/group RSVPs, reserved seat counts, Entourage Proposals for Principal Sponsors (Ninong & Ninang), Visual Attire Guides for sponsors and guests, and Messenger/Viber-friendly invitation links.',
  },
  {
    question: 'Can I find Philippine wedding suppliers inside QuickWeds?',
    answer:
      'Yes. Browse approved venues, photographers, caterers, coordinators, florists, and stylists across Metro Manila, Cavite, Tagaytay, Laguna, Batangas, Cebu, Davao, and Boracay, then save them straight into your budget and planner.',
  },
];

export default function WeddingPlannerPhilippinesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteOrigin}${path}#webpage`,
        url: `${siteOrigin}${path}`,
        name: `${title} | QuickWeds`,
        description,
        isPartOf: { '@id': `${siteOrigin}/#website` },
        about: { '@id': `${siteOrigin}/#webapp` },
        inLanguage: 'en',
      },
      buildFaqJsonLd(philippinesFaqs),
      buildBreadcrumbJsonLd([
        { name: 'QuickWeds', path: '/' },
        { name: 'Philippines Wedding Planner', path },
      ]),
    ],
  };

  return (
    <div className="min-h-screen bg-neutral text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />

      <header className="border-b border-border/70 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo.png" alt="QuickWeds" width={140} height={40} className="h-9 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/suppliers" className="hidden text-sm font-bold text-text-secondary hover:text-primary sm:inline-flex">
              PH Suppliers
            </Link>
            <Link href="/templates" className="hidden text-sm font-bold text-text-secondary hover:text-primary sm:inline-flex">
              Templates
            </Link>
            <Link href="/builder" className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-hover">
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-[#fce3e9] via-[#fff6f8] to-neutral px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Built for Filipino Couples
            </span>
            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-foreground sm:text-6xl">
              Plan your Philippine wedding in one <span className="text-primary">calm workspace</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
              Create a free mobile-ready wedding website you can share via Messenger and Viber, collect online RSVPs, track expenses in PHP, organize seating with QR Seat Finder, and discover local wedding suppliers—with a one-time ₱850 Planner Pro upgrade when you want it all.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/builder" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover sm:text-base">
                Create Your Free Wedding Site
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/templates" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-border bg-white px-7 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary sm:text-base">
                Browse 60 Wedding Templates
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                title: 'Messenger & Viber Ready',
                body: 'Share one clean link or QR code with family, friends, and balikbayan guests—no app download required.',
                href: '/wedding-rsvp',
                cta: 'Online Wedding RSVP',
              },
              {
                icon: Wallet,
                title: 'PHP Budget & Deposits',
                body: 'Track venue, catering, photo/video, crew meals, and balances in Philippine Pesos (plus 9 other currencies).',
                href: '/wedding-budget-planner',
                cta: 'Budget Planner',
              },
              {
                icon: QrCode,
                title: 'QR Seat Finder & Check-In',
                body: 'Seat VIPs, Ninong & Ninang, and friends easily, then let guests scan at reception to find their table.',
                href: '/wedding-seating-chart',
                cta: 'Seating Chart Maker',
              },
              {
                icon: MapPin,
                title: 'Philippines Supplier Directory',
                body: 'Discover venues, photographers, caterers, and stylists across Metro Manila, Cavite, Cebu, and more.',
                href: '/suppliers',
                cta: 'Browse Suppliers',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="flex flex-col justify-between rounded-[1.5rem] border border-border bg-white p-6 shadow-sm">
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-5 font-serif text-xl font-bold text-foreground">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{item.body}</p>
                  </div>
                  <Link href={item.href} className="mt-5 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline">
                    {item.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Philippines Planning Guides</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">Helpful resources for Filipino couples</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Philippines Wedding Budget Breakdown (₱150k to ₱1M)', href: '/tips/philippines-wedding-budget-breakdown' },
                { label: '12-Month Church & Civil Wedding Checklist', href: '/tips/12-month-wedding-checklist-philippines' },
                { label: 'Wedding RSVP Wording (English & Tagalog)', href: '/tips/wedding-rsvp-wording' },
                { label: 'Ninong, Ninang & Entourage Proposal Wording', href: '/tips/entourage-proposal-wording-philippines' },
                { label: 'Wedding Dress Code Guide (Filipiniana, Barong, Garden)', href: '/tips/wedding-dress-code-guide-philippines' },
                { label: 'Reception Seating Chart & QR Seat Finder Guide', href: '/tips/wedding-seating-chart-guide' },
              ].map((guide) => (
                <li key={guide.href}>
                  <Link href={guide.href} className="flex items-start gap-2.5 rounded-xl bg-neutral p-4 text-sm font-bold text-foreground transition hover:bg-primary/5 hover:text-primary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{guide.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-center font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-3">
            {philippinesFaqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <summary className="cursor-pointer font-serif text-lg font-bold text-foreground">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

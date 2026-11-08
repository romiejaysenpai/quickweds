import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { publicPageMetadata, rsvpWordingPath, serializeJsonLd, siteOrigin } from '@/lib/seo';

const title = 'Wedding RSVP Wording: English & Tagalog Examples';
const description = 'Find wedding RSVP wording for invitations, Messenger, and Viber. Copy English and Tagalog examples for reply deadlines, reserved seats, and reminders.';

export const metadata = publicPageMetadata(rsvpWordingPath, title, description, 'article');

const examples = [
  {
    title: 'Formal invitation',
    text: 'Kindly confirm your attendance by [date] at [wedding website link]. Please let us know whether you will be able to join us.',
  },
  {
    title: 'Messenger or Viber message',
    text: 'Hi [name]! We’d love to celebrate with you on [wedding date]. Can you let us know by [RSVP date] if you can come? Here’s our wedding website and RSVP link: [link].',
  },
  {
    title: 'Tagalog message for family',
    text: 'Kumusta po, [pangalan]! Ikagagalak po naming makasama kayo sa aming kasal sa [petsa ng kasal]. Pakisabi po kung makakadalo kayo bago o sa [huling araw ng pagsagot]. Narito po ang link para sumagot: [link]. Maraming salamat po!',
    language: 'tl',
  },
  {
    title: 'Reserved seats and plus-ones',
    text: 'We’ve reserved [number] seat(s) for [guest names]. As our venue has limited seating, we can only accommodate the guests named on this invitation. Please reply by [date] at [link].',
  },
  {
    title: 'Gentle reminder',
    text: 'Hi [name], we’re confirming our wedding headcount soon and wanted to check in. Could you let us know either way by [date]? You can reply here: [link]. Thank you!',
  },
];

export default function WeddingRsvpWordingPage() {
  const url = `${siteOrigin}${rsvpWordingPath}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description,
        url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        author: { '@type': 'Organization', name: 'QuickWeds', url: `${siteOrigin}/` },
        publisher: { '@id': `${siteOrigin}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'QuickWeds', item: `${siteOrigin}/` },
          { '@type': 'ListItem', position: 2, name: 'Wedding Planning Tips', item: `${siteOrigin}/tips` },
          { '@type': 'ListItem', position: 3, name: 'Wedding RSVP Wording', item: url },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-neutral px-5 py-10 text-foreground sm:px-8 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/tips" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Wedding Planning Tips
        </Link>
        <h1 className="mt-5 font-serif text-4xl font-bold leading-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-text-secondary">
          A wedding RSVP message should say who’s invited, when to reply, and how to accept or decline. Start with:
          {' '}“Please let us know by [date] whether you can join us. Reply at [link].” If you’re sending the message by
          itself, include the couple’s names and wedding date so guests know which event it’s for.
        </p>

        <section aria-labelledby="rsvp-examples" className="mt-10">
          <h2 id="rsvp-examples" className="font-serif text-3xl font-bold">RSVP messages you can copy</h2>
          <p className="mt-3 leading-7 text-text-secondary">
            Replace the details in brackets before sending. For a printed invitation, put the reply date next to
            the QR code and print the web address too, so guests can type it if they can’t scan.
          </p>
          <div className="mt-5 grid gap-4">
            {examples.map((example) => (
              <section key={example.title} className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                <h3 className="text-lg font-bold">{example.title}</h3>
                <blockquote lang={example.language} className="mt-2 border-l-2 border-primary/40 pl-4 leading-7 text-text-secondary">
                  {example.text}
                </blockquote>
              </section>
            ))}
          </div>
        </section>

        <section aria-labelledby="rsvp-deadline" className="mt-10">
          <h2 id="rsvp-deadline" className="font-serif text-3xl font-bold">When should wedding RSVPs be due?</h2>
          <p className="mt-3 leading-7 text-text-secondary">
            Set your RSVP deadline a few days before your venue or caterer needs the final headcount, so you have
            time to follow up. If your caterer needs the count on June 20, you could ask guests to reply by June 14,
            follow up on June 15, and leave the rest of the week to confirm meals and seating.
          </p>
        </section>

        <section aria-labelledby="rsvp-sharing" className="mt-10">
          <h2 id="rsvp-sharing" className="font-serif text-3xl font-bold">How do you share a wedding RSVP link?</h2>
          <p className="mt-3 leading-7 text-text-secondary">
            Send the wedding website link with the RSVP deadline in the same message. Open the link on a phone
            before sending it to check that the RSVP button is easy to find. For guests who reply by call or text,
            log their answers in your guest list so everyone is counted in one place.
          </p>
        </section>

        <aside aria-label="QuickWeds RSVP tools" className="mt-10 rounded-2xl border border-primary/20 bg-white p-5 sm:p-7">
          <p className="font-bold">Ready to collect replies?</p>
          <p className="mt-2 leading-7 text-text-secondary">
            QuickWeds gives you a free wedding website with online RSVP. Guests can reply in their browser, and you
            can track who’s attending, who declined, and who still needs a reminder.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-primary">
            <Link href="/wedding-rsvp" className="inline-flex min-h-11 items-center gap-2 underline">
              Explore online wedding RSVP <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link href="/templates" className="inline-flex min-h-11 items-center underline">Browse wedding website templates</Link>
          </div>
        </aside>
      </article>
    </main>
  );
}

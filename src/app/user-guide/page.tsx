import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Gift,
  Heart,
  LayoutDashboard,
  MailCheck,
  Palette,
  Send,
  Sparkles,
  UsersRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'QuickWeds User Guide | Build Your Wedding Site',
  description: 'A step-by-step QuickWeds text guide for creating your wedding site, choosing your design, managing guests, and using planner tools.',
};

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-primary">{children}</span>;
}

const guideSteps = [
  {
    eyebrow: 'Step 1',
    title: 'Create Your Wedding Site',
    icon: Heart,
    content: [
      'Open the builder and enter your couple names, wedding date, time, venue, and RSVP deadline.',
      'Add the important guest-facing details first. You can always return later to polish the design or update the wording.',
      'When you publish, QuickWeds creates a wedding link that you can share with guests.',
    ],
  },
  {
    eyebrow: 'Step 2',
    title: 'Choose Your Aesthetic',
    icon: Palette,
    content: [
      'Pick a template style that matches the wedding mood, such as Royal, Editorial, Vintage, Minimal, Garden, or Romantic.',
      'Choose your motif color. This controls accents, buttons, section details, and visual highlights across the generated page.',
      'Preview the site while editing so you can check the flow before sharing it.',
    ],
  },
  {
    eyebrow: 'Step 3',
    title: 'Add Your Wedding Content',
    icon: Calendar,
    content: [
      'Fill in your story, timeline, wedding attire, FAQ, venue information, gift details, and RSVP instructions.',
      'Use the timeline section to guide guests through the ceremony, reception, dinner, speeches, and party moments.',
      'Keep wording short and clear so guests can quickly understand what they need to know.',
    ],
  },
  {
    eyebrow: 'Step 4',
    title: 'Publish and Share',
    icon: Send,
    content: [
      'After saving, open your dashboard and copy the guest link.',
      'Share the link through Messenger, email, WhatsApp, SMS, or printed QR codes.',
      'Guests can open the page on mobile, review the details, and submit their RSVP.',
    ],
  },
  {
    eyebrow: 'Step 5',
    title: 'Manage Guests and RSVPs',
    icon: UsersRound,
    content: [
      'Use the dashboard to see who confirmed, declined, or has not responded yet.',
      'Add manual guests, update guest groups, track plus-ones, and organize RSVP status.',
      'Check the dashboard regularly as responses come in so planning stays accurate.',
    ],
  },
  {
    eyebrow: 'Step 6',
    title: 'Use Planner Pro When Needed',
    icon: LayoutDashboard,
    content: [
      'Your wedding website, builder, RSVP page, and guest tracking are free.',
      'Planner Pro unlocks deeper planning tools like budget, vendors, seating, tasks, collaborators, reminders, guest photos, and thank-you features.',
      'Upgrade when you are ready to organize the full wedding workflow in one place.',
    ],
  },
];

const quickTips = [
  {
    title: 'Keep Guest Details Clear',
    icon: CheckCircle2,
    text: 'Put the most important information in the venue, timeline, attire, FAQ, and RSVP sections.',
  },
  {
    title: 'Turn On RSVP Awareness',
    icon: MailCheck,
    text: 'Use your dashboard to monitor new responses and follow up with pending guests before the deadline.',
  },
  {
    title: 'Add Gift Details Carefully',
    icon: Gift,
    text: 'Double-check bank names, account numbers, QR details, and registry links before sharing the site.',
  },
  {
    title: 'Ask for Help',
    icon: Bell,
    text: 'Use the support link on the landing page if you need help while building or managing your wedding site.',
  },
];

export default function UserGuidePage() {
  return (
    <main className="min-h-screen bg-neutral text-foreground">
      <section className="relative px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <Link href="/" className="mb-8 inline-flex items-center justify-center font-serif text-3xl font-black text-primary">
            QuickWeds
          </Link>
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary shadow-sm">
            <Heart className="h-4 w-4 fill-primary" />
            User Guide
          </div>
          <h1 className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-[1.05] text-foreground sm:text-6xl">
            Build a beautiful <Accent>wedding site</Accent> without the stress.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            Follow this simple text guide to create your site, publish your guest link, manage RSVPs, and use planner tools when you need them.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/builder" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover">
              Create Free Site
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border bg-white px-6 py-3 font-bold text-foreground transition hover:border-primary hover:text-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-5xl space-y-5">
          {guideSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.eyebrow} className="rounded-[1.5rem] border border-border bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                      <Icon className="h-4 w-4" />
                      {step.eyebrow}
                    </div>
                    <h2 className="font-serif text-2xl font-bold leading-tight text-foreground sm:text-4xl">
                      {step.title}
                    </h2>
                  </div>
                </div>
                <ol className="space-y-3 text-sm leading-7 text-text-secondary sm:text-base">
                  {step.content.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[1.5rem] border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-3xl font-bold text-foreground">Quick Tips</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div key={tip.title} className="rounded-2xl border border-border bg-neutral p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="font-bold text-foreground">{tip.title}</p>
                  </div>
                  <p className="text-sm leading-6 text-text-secondary">{tip.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

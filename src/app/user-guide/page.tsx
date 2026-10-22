import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Camera,
  Clock,
  Gift,
  Heart,
  History,
  LayoutDashboard,
  Lock,
  MailCheck,
  Palette,
  PartyPopper,
  Plane,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Table2,
  Utensils,
  Wallet,
  WandSparkles,
  UserCheck,
  UsersRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'QuickWeds User Guide | Wedding Website, RSVP, and Planner Tutorials',
  description: 'Master QuickWeds with comprehensive guides for website building, smart RSVP search, deadline locks, visual attire guides, seating charts, multi-currency budgets, and post-wedding memories.',
  alternates: {
    canonical: '/user-guide',
  },
};

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-primary">{children}</span>;
}

const recentUpdates = [
  {
    badge: 'New',
    title: 'Post-Wedding Memories & Disposable Camera Recap',
    desc: 'Relive your wedding day! Turn your website into a celebration recap featuring guest photo uploads (Polaroid or Grid style), digital guestbook messages, and photographer gallery links.',
    href: '/user-guide/post-wedding-memories',
    icon: History,
  },
  {
    badge: 'New',
    title: 'Visual Attire Guide & Dress Code',
    desc: 'Help guests dress with confidence using illustrated character silhouettes, color palette swatches, and custom attire cards for guests, bridesmaids, and sponsors.',
    href: '/user-guide/attire-guide-dress-code',
    icon: Shirt,
  },
  {
    badge: 'New',
    title: 'Smart RSVP Instant Search & Deadline Locks',
    desc: 'Guests can find invitations in seconds with real-time search. Automated deadline countdowns lock RSVPs on your cutoff date to protect catering commitments.',
    href: '/user-guide/smart-rsvp-search',
    icon: Search,
  },
  {
    badge: 'Updated',
    title: 'Interactive Seating Planner & QR Check-In',
    desc: 'Drag-and-drop floor plan designer with customizable venue shapes, live seat counts, guest table lookup codes, and fast coordinator arrival check-in.',
    href: '/user-guide/seating-planner',
    icon: Table2,
  },
  {
    badge: 'Updated',
    title: 'Multi-Currency Budget & Expense Tracker',
    desc: 'Track wedding spending in PHP, USD, EUR, GBP, CAD, AUD, NZD, JPY, SGD, or INR. Record costs, mark paid items, and auto-sync with catering.',
    href: '/user-guide/budget-planner',
    icon: Wallet,
  },
  {
    badge: 'New',
    title: 'Community Reviews & Verified Couple Stories',
    desc: 'Read real wedding journeys, vendor recommendations, and honest ratings from verified couples, or submit your own story after your wedding.',
    href: '/user-guide/community-reviews',
    icon: Star,
  },
];

const guideSteps = [
  {
    eyebrow: 'Step 1',
    title: 'Create Your Wedding Site & Save Drafts',
    icon: Heart,
    content: [
      'Open the builder and enter your couple names, wedding date, ceremony time, venue name, and Google Maps location.',
      'Your work auto-saves locally and to server drafts continuously, so you never lose progress if your browser closes.',
      'Add a custom couple monogram and essential guest details first. You can refine wording, photos, and layouts anytime.',
    ],
  },
  {
    eyebrow: 'Step 2',
    title: 'Choose Your Aesthetic & Visual Attire Guide',
    icon: Palette,
    content: [
      'Select a designer template such as Royal, Editorial, Vintage, Minimal, Garden, Luxury, or Romantic.',
      'Pick your motif color to establish harmonious buttons, accents, icons, and typography highlights.',
      'Configure the Visual Attire Guide with illustrated character models (guests, sponsors, bridesmaids) and color palette swatches so guests know exactly what to wear.',
    ],
  },
  {
    eyebrow: 'Step 3',
    title: 'Add Wedding Content & Multi-Event Schedules',
    icon: Calendar,
    content: [
      'Fill in your love story, wedding quote, social hashtag, and high-resolution couple hero photo.',
      'Set up your timeline for the ceremony, reception, dinner, speeches, party, or secondary events like rehearsal dinners.',
      'Provide essential guest FAQs, bank/e-wallet gift QR codes, registry links, and venue directions.',
    ],
  },
  {
    eyebrow: 'Step 4',
    title: 'Publish, Share, and Instant RSVP Search',
    icon: Send,
    content: [
      'After publishing, copy your unique guest website link from the dashboard or download the print-ready QR codes.',
      'Share your link via WhatsApp, Messenger, email, SMS, or printed invitation cards.',
      'Guests open the site on mobile or desktop, find their names in seconds with Smart RSVP search, and submit responses.',
    ],
  },
  {
    eyebrow: 'Step 5',
    title: 'Manage Guests, Deadline Locks, and Seating',
    icon: UsersRound,
    content: [
      'Monitor real-time responses, plus-ones, meal preferences, dietary notes, and song requests on your dashboard.',
      'Set an automated RSVP deadline lock to close responses on your cutoff date, preventing unexpected last-minute headcount changes.',
      'Assign confirmed guests to tables on the interactive Seating Planner, generate personal seat codes, and check guests in at the venue.',
    ],
  },
  {
    eyebrow: 'Step 6',
    title: 'Organize Full Workflow with Planner Pro',
    icon: LayoutDashboard,
    content: [
      'Free accounts include wedding website building, RSVP forms, guest tracking, and partner collaboration.',
      'Planner Pro unlocks multi-currency budget tracking, vendor directory management, digital entourage proposals, event-day coordinator mode, and guest photo sharing.',
      'Activate Planner Pro when you are ready to manage all contracts, schedules, and logistics in one unified workspace.',
    ],
  },
  {
    eyebrow: 'Step 7',
    title: 'Post-Wedding Memories & Celebration Recap',
    icon: History,
    content: [
      'After the wedding, switch your site to Post-Wedding Mode from your dashboard with a single click.',
      'Showcase guest photo uploads in charming Polaroid or clean Grid layouts, and highlight messages on the digital Wall of Love.',
      'Link your photographer’s full high-res album (Google Drive, Dropbox, Pixieset) and send personalized thank-you emails with send-tracking logs.',
    ],
  },
];

const quickTips = [
  {
    title: 'Draft Autosave Recovery',
    icon: CheckCircle2,
    text: 'QuickWeds auto-saves your builder progress. If your browser closes or disconnects, you can safely restore your unsaved draft.',
  },
  {
    title: 'Set RSVP Cutoff Deadlines',
    icon: Lock,
    text: 'Set an RSVP deadline 2–4 weeks prior to your wedding. RSVPs automatically lock globally at end of deadline day to freeze caterer numbers.',
  },
  {
    title: 'Clear Attire Color Swatches',
    icon: Shirt,
    text: 'Use the Visual Attire palette swatches to highlight requested guest colors, and add clear footwear notes for lawn or outdoor venues.',
  },
  {
    title: 'Post-Wedding Photo Recap',
    icon: Camera,
    text: 'Toggle on Post-Wedding mode after the wedding to replace the RSVP form with a beautiful guest photo gallery and digital guestbook recap.',
  },
  {
    title: 'Event-Day QR Seat Finder',
    icon: QrCode,
    text: 'Print the venue QR code at the reception entrance so arriving guests can instantly find their table assignment by scanning with their phones.',
  },
  {
    title: 'Double-Check Gift Info',
    icon: Gift,
    text: 'Confirm bank details, account numbers, and e-wallet QR codes before sharing your wedding link with friends and family.',
  },
];

const featureGuides = [
  {
    title: 'Wedding Website Builder',
    href: '/user-guide/wedding-website-builder',
    icon: Palette,
    text: 'Design, preview, publish, and edit your website with draft autosave and monograms.',
    badge: 'Updated',
  },
  {
    title: 'Smart RSVP & Guest List',
    href: '/user-guide/rsvp-guest-list',
    icon: UsersRound,
    text: 'Track responses, manage plus-ones, meal choices, and organize guest lists.',
    badge: 'Updated',
  },
  {
    title: 'Smart RSVP Search & Deadline Locks',
    href: '/user-guide/smart-rsvp-search',
    icon: Search,
    text: 'Instant name search autocomplete, plus-one controls, and automated deadline locks.',
    badge: 'New',
  },
  {
    title: 'Visual Attire Guide & Dress Code',
    href: '/user-guide/attire-guide-dress-code',
    icon: Shirt,
    text: 'Illustrated silhouettes, color swatches, and attire cards for guests and entourage.',
    badge: 'New',
  },
  {
    title: 'Interactive Seating Planner',
    href: '/user-guide/seating-planner',
    icon: Table2,
    text: 'Drag-and-drop floor plan, table capacity, QR seat codes, and guest check-in.',
    badge: 'Updated',
  },
  {
    title: 'Post-Wedding Memories & Recap',
    href: '/user-guide/post-wedding-memories',
    icon: History,
    text: 'Polaroid/grid guest photo recaps, digital Wall of Love, and photographer album links.',
    badge: 'New',
  },
  {
    title: 'Planner Workspace',
    href: '/user-guide/planner-workspace',
    icon: LayoutDashboard,
    text: 'Understand planner tabs and how each wedding manages separate workspaces.',
  },
  {
    title: 'Checklist and Calendar',
    href: '/user-guide/checklist-calendar',
    icon: ClipboardList,
    text: '12-month wedding timeline, task milestones, schedules, and Google Calendar sync.',
  },
  {
    title: 'Entourage Proposals',
    href: '/user-guide/entourage-proposals',
    icon: UserCheck,
    text: 'Invite sponsors and bridal party with elegant templates and response tracking.',
  },
  {
    title: 'Smart Budget & Expense Tracker',
    href: '/user-guide/budget-planner',
    icon: Wallet,
    text: 'Multi-currency budget tracking, payment milestones, deposits, and caterer sync.',
    badge: 'Updated',
  },
  {
    title: 'Suppliers and Directory',
    href: '/user-guide/suppliers-directory',
    icon: Gift,
    text: 'Manage booked vendors, link quote balances, and browse the public directory.',
  },
  {
    title: 'Food and Drinks Planner',
    href: '/user-guide/food-drinks-planner',
    icon: Utensils,
    text: 'Curate menu ideas, upload food references, link caterers, and track course costs.',
  },
  {
    title: 'Wedding Day Mode',
    href: '/user-guide/wedding-day-mode',
    icon: PartyPopper,
    text: 'Coordinator notes, live arrival counters, public toggles, and printable run sheets.',
    badge: 'Updated',
  },
  {
    title: 'Event QR Kit',
    href: '/user-guide/event-qr-kit',
    icon: QrCode,
    text: 'High-res QR downloads for website, RSVP, seat finder, photos, and thank-you notes.',
  },
  {
    title: 'Guest Photo Sharing',
    href: '/user-guide/photo-sharing',
    icon: Camera,
    text: 'Guest photo upload portal with sharing codes, moderation queue, and bulk ZIP export.',
    badge: 'Updated',
  },
  {
    title: 'Thank You Notes & Cards',
    href: '/user-guide/thank-you-notes',
    icon: MailCheck,
    text: 'Send personalized digital thank-you notes and track delivered emails.',
  },
  {
    title: 'QR Codes and Sharing',
    href: '/user-guide/qr-codes-sharing',
    icon: QrCode,
    text: 'Guide to sharing links, invitations, table signage, and guest lookup codes.',
  },
  {
    title: 'Honeymoon Planner',
    href: '/user-guide/honeymoon-planner',
    icon: Plane,
    text: 'Track flights, hotels, activities, booking links, and travel budgets.',
  },
  {
    title: 'Collaboration Access',
    href: '/user-guide/collaboration-access',
    icon: ShieldCheck,
    text: 'Invite your partner, wedding coordinator, or family helpers into your workspace.',
  },
  {
    title: 'Analytics & RSVP Reminders',
    href: '/user-guide/analytics-reminders',
    icon: BarChart3,
    text: 'Track website visits, QR scans, RSVP conversions, and send reminder blasts.',
  },
  {
    title: 'Theme Marketplace & Presets',
    href: '/user-guide/theme-marketplace-presets',
    icon: WandSparkles,
    text: 'Apply curated designer themes, prebuilt section blocks, and custom saved presets.',
  },
  {
    title: 'Community Reviews & Stories',
    href: '/user-guide/community-reviews',
    icon: Star,
    text: 'Browse real couple reviews, vendor recommendations, and submit your wedding story.',
    badge: 'New',
  },
  {
    title: 'Supplier Profiles & Directory',
    href: '/user-guide/supplier-profiles',
    icon: Building2,
    text: 'Create, edit, submit, and manage your wedding business directory profile.',
  },
];

export default function UserGuidePage() {
  return (
    <main className="min-h-screen bg-neutral text-foreground">
      {/* Hero Header */}
      <section className="relative px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <Link href="/" className="mb-6 inline-flex items-center justify-center font-serif text-3xl font-black text-primary">
            QuickWeds
          </Link>
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-primary shadow-sm">
            <Heart className="h-4 w-4 fill-primary" />
            Official Documentation & Tutorials
          </div>
          <h1 className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-[1.08] text-foreground sm:text-6xl">
            QuickWeds <Accent>User Guide</Accent>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-text-secondary sm:text-lg">
            Everything you need to create a stunning wedding website, streamline RSVPs with instant search and deadline locks, plan seating, manage multi-currency budgets, and celebrate with post-wedding memories.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/builder" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover">
              Create Free Wedding Site
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border bg-white px-6 py-3 font-bold text-foreground transition hover:border-primary hover:text-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* What's New Section */}
      <section className="px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-white via-white to-primary/[0.04] p-6 shadow-xl shadow-primary/10 sm:p-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Product Highlights</p>
                <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">What&apos;s New in QuickWeds</h2>
              </div>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Recently Added Features
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentUpdates.map((update) => {
              const Icon = update.icon;
              return (
                <Link
                  key={update.title}
                  href={update.href}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        update.badge === 'New'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {update.badge}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {update.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-text-secondary sm:text-sm">
                      {update.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary">
                    Learn more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Guides Grid */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Comprehensive Documentation</p>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">All Feature Guides</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group relative flex flex-col justify-between rounded-[1.25rem] border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      {guide.badge && (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          guide.badge === 'New'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {guide.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{guide.text}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open Guide <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">End-to-End Walkthrough</p>
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">How QuickWeds Works from Setup to Celebration</h2>
          </div>
          <div className="space-y-5">
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
                      <h3 className="font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                        {step.title}
                      </h3>
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
        </div>
      </section>

      {/* Quick Tips */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[1.5rem] border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Pro Recommendations</p>
              <h2 className="font-serif text-3xl font-bold text-foreground">Planning Best Practice Tips</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

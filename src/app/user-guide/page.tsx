import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  Camera,
  CheckCircle2,
  Gift,
  Heart,
  LayoutDashboard,
  MailCheck,
  Palette,
  Sparkles,
  UsersRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'QuickWeds User Guide | Build Your Wedding Site',
  description: 'A step-by-step QuickWeds guide for choosing your design, adding media, managing guests, tracking RSVPs, and using planner tools.',
};

const templateShots = [
  { name: 'Royal', img: '/templates/royal.png', desc: 'Grand, palace-like feel' },
  { name: 'Editorial', img: '/templates/classic.png', desc: 'Modern, magazine-style' },
  { name: 'Vintage', img: '/templates/boho.png', desc: 'Timeless and romantic' },
  { name: 'Minimal', img: '/templates/minimal.png', desc: 'Clean and sophisticated' },
];

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-primary">{children}</span>;
}

function ScreenshotFrame({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-white p-3 shadow-2xl shadow-primary/10">
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-neutral px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{label}</p>
      </div>
      <div className="overflow-hidden rounded-[1.1rem] bg-neutral">{children}</div>
    </div>
  );
}

function AestheticScreenshot() {
  return (
    <ScreenshotFrame label="Design Builder">
      <div className="grid gap-3 p-3 sm:grid-cols-2">
        {templateShots.map((template) => (
          <div key={template.name} className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="relative h-28">
              <Image src={template.img} alt={`${template.name} template preview`} fill sizes="240px" className="object-cover" />
            </div>
            <div className="p-3">
              <p className="font-serif text-lg font-bold text-foreground">{template.name}</p>
              <p className="text-xs text-text-secondary">{template.desc}</p>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-border bg-white p-4 sm:col-span-2">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-primary">Motif color</p>
          <div className="flex gap-3">
            {['#D16C78', '#F2C1CC', '#D6B87C', '#7A5A61'].map((color) => (
              <span key={color} className="h-10 w-10 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </ScreenshotFrame>
  );
}

function MediaScreenshot() {
  return (
    <ScreenshotFrame label="Media Uploads">
      <div className="p-4">
        <div className="relative mb-3 h-44 overflow-hidden rounded-2xl">
          <Image src="/uploads/85ceacea-hero-IMG_2489.jpeg" alt="Hero image upload preview" fill sizes="520px" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 text-white">
            <p className="font-serif text-2xl font-bold">Hero Image</p>
            <p className="text-xs uppercase tracking-widest text-white/80">First guest impression</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            '/uploads/85ceacea-gallery-0-490854271_122160741506389814_7547493862735825022_n.jpg',
            '/uploads/85ceacea-gallery-1-492229450_122161502432389814_5615830485283674964_n.jpg',
            '/uploads/85ceacea-gallery-2-494225512_122163485210389814_7116900047770446388_n.jpg',
          ].map((src) => (
            <div key={src} className="relative h-20 overflow-hidden rounded-xl bg-white">
              <Image src={src} alt="Gallery upload preview" fill sizes="120px" className="object-cover" />
            </div>
          ))}
          <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-primary bg-white text-primary">
            <Gift className="h-7 w-7" />
          </div>
        </div>
      </div>
    </ScreenshotFrame>
  );
}

function DashboardScreenshot() {
  return (
    <ScreenshotFrame label="Planner Dashboard">
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold text-foreground">RSVP Tracking</p>
            <MailCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="h-3 rounded-full bg-neutral">
            <div className="h-3 w-3/4 rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-sm font-semibold text-text-secondary">126 attending · 38 pending</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold text-foreground">Guest List</p>
            <UsersRound className="h-5 w-5 text-primary" />
          </div>
          {['Sarah M. +1', 'David L.', 'Aunt Maria'].map((guest) => (
            <p key={guest} className="border-t border-border py-2 text-sm text-text-secondary">{guest}</p>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="mb-3 font-bold text-foreground">Tasks</p>
          {['Confirm florists', 'Review seating', 'Finalize menu'].map((task) => (
            <p key={task} className="flex items-center gap-2 py-1 text-sm text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {task}
            </p>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="mb-3 font-bold text-foreground">Budget</p>
          <p className="font-serif text-3xl font-bold text-primary">$18,420</p>
          <p className="text-sm text-text-secondary">Deposits and balances in sync</p>
        </div>
      </div>
    </ScreenshotFrame>
  );
}

function TipsScreenshot() {
  return (
    <ScreenshotFrame label="Guest Experience">
      <div className="p-4">
        <div className="mx-auto max-w-[230px] rounded-[2rem] border-8 border-foreground bg-white p-3 shadow-xl">
          <div className="relative h-72 overflow-hidden rounded-[1.25rem] bg-neutral">
            <Image src="/templates/minimal.png" alt="Mobile wedding website preview" fill sizes="230px" className="object-cover" />
            <div className="absolute inset-x-3 bottom-3 flex justify-around rounded-full bg-white/90 px-3 py-2 shadow-xl backdrop-blur">
              {['Story', 'Gallery', 'RSVP'].map((item) => (
                <span key={item} className="text-[10px] font-black uppercase tracking-wider text-primary">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScreenshotFrame>
  );
}

const guideSteps = [
  {
    eyebrow: 'Step 2',
    title: 'Choose Your Aesthetic',
    icon: Palette,
    screenshot: <AestheticScreenshot />,
    content: (
      <>
        <p>This is where the magic happens. Customize the look and feel of your site without any coding.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Royal', 'For a grand, palace-like feel.'],
            ['Editorial', 'Sleek, modern, and magazine-style.'],
            ['Vintage', 'Timeless and romantic with classic textures.'],
            ['Minimal', 'Clean and sophisticated.'],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-2xl border border-border bg-white p-4">
              <p className="font-serif text-xl font-bold text-foreground">{name}</p>
              <p className="text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
        <p><strong>Pick your motif:</strong> choose a color for buttons, accents, and icons so your site feels cohesive from top to bottom.</p>
      </>
    ),
  },
  {
    eyebrow: 'Step 3',
    title: 'Add Your Media',
    icon: Camera,
    screenshot: <MediaScreenshot />,
    content: (
      <>
        <p>A wedding site is not complete without your beautiful photos.</p>
        <ul className="space-y-3">
          <li><strong>Hero Image:</strong> the first thing guests see. Choose a high-quality photo of you both.</li>
          <li><strong>Gallery:</strong> upload up to 10 photos to showcase your journey together.</li>
          <li><strong>Gift QR Code:</strong> upload a QR code for digital gifting like GCash, Venmo, or other payment apps.</li>
        </ul>
      </>
    ),
  },
  {
    eyebrow: 'Step 4',
    title: 'Manage Your Guests',
    icon: LayoutDashboard,
    screenshot: <DashboardScreenshot />,
    content: (
      <>
        <p>Once your site is live, manage everything from your Planner Dashboard.</p>
        <ul className="space-y-3">
          <li><strong>RSVP Tracking:</strong> see who is coming in real time.</li>
          <li><strong>Guest List:</strong> add plus-ones and manage dietary requirements.</li>
          <li><strong>Task Manager:</strong> track confirmations, seating reviews, and planning work.</li>
          <li><strong>Budget Tracker:</strong> keep deposits and balances in sync.</li>
        </ul>
      </>
    ),
  },
  {
    eyebrow: 'Pro Tips',
    title: 'Plan Smarter',
    icon: Sparkles,
    screenshot: <TipsScreenshot />,
    content: (
      <>
        <ul className="space-y-3">
          <li><strong>Floating Navigation:</strong> generated pages include a sleek dock so guests can jump between Story, Gallery, and RSVP.</li>
          <li><strong>Mobile First:</strong> your site is automatically optimized for every guest phone.</li>
          <li><strong>Admin Alerts:</strong> you receive an email notification every time someone RSVPs.</li>
          <li><strong>Need help?</strong> click the WhatsApp icon on the landing page to chat with support directly.</li>
        </ul>
      </>
    ),
  },
];

export default function UserGuidePage() {
  return (
    <main className="min-h-screen bg-neutral text-foreground">
      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(209,108,120,0.14),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(214,184,124,0.18),transparent_28%)]" />
        <div className="mx-auto max-w-6xl text-center">
          <Link href="/" className="mb-8 inline-flex justify-center">
            <Image src="/logo.png" alt="QuickWeds" width={210} height={74} className="h-12 w-auto object-contain" priority />
          </Link>
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary shadow-sm">
            <Heart className="h-4 w-4 fill-primary" />
            User Guide
          </div>
          <h1 className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-[1.05] text-foreground sm:text-6xl">
            Build a beautiful <Accent>wedding site</Accent> without the stress.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            Follow these steps to choose your aesthetic, add your photos, manage guests, and keep planning organized inside QuickWeds.
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

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-16">
          {guideSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
              >
                <div className={index % 2 ? 'lg:order-2' : ''}>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
                    <Icon className="h-4 w-4" />
                    {step.eyebrow}
                  </div>
                  <h2 className="font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                    {step.title.includes('Wedding') ? step.title : <>{step.title.split(' ')[0]} <Accent>{step.title.split(' ').slice(1).join(' ')}</Accent></>}
                  </h2>
                  <div className="mt-5 space-y-5 text-base leading-7 text-text-secondary">
                    {step.content}
                  </div>
                </div>
                <div className={index % 2 ? 'lg:order-1' : ''}>
                  {step.screenshot}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[1.5rem] bg-primary p-8 text-center text-white shadow-2xl shadow-primary/25 sm:rounded-[2rem] sm:p-14">
          <Bell className="mx-auto mb-5 h-10 w-10 text-secondary" />
          <h2 className="font-serif text-3xl font-bold sm:text-5xl">Need help while building?</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/85">
            Click the WhatsApp icon on the landing page to chat with the QuickWeds support team directly.
          </p>
          <Link href="/" className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 py-3 font-bold text-primary transition hover:bg-neutral">
            Go to Landing Page
          </Link>
        </div>
      </section>
    </main>
  );
}

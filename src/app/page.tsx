'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  MailCheck,
  Menu,
  MessageCircle,
  Moon,
  PartyPopper,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UsersRound,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DemoSection from '@/components/DemoSection';
import ExamplesSection from '@/components/ExamplesSection';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

const heroImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Minimalist%20Neutral%20Multi%20Device%20Computer%20Mockup%20Website%20Launch%20Instagram%20Post.png';
const joySectionDesktopImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/pc%20vew.png';
const joySectionMobileImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/sdgsdfgsd.png';
const navItemClass = 'inline-flex h-10 items-center px-1 text-sm font-bold leading-none text-text-secondary transition hover:text-primary';
const footerItemClass = 'inline-flex h-9 items-center px-1 leading-none transition hover:text-primary';

const featureCards = [
  {
    icon: LayoutDashboard,
    title: 'Wedding Website Builder',
    body: 'Create a beautiful, personalized wedding site in minutes with all of the details guests need.',
  },
  {
    icon: MailCheck,
    title: 'Smart RSVP Management',
    body: 'Track responses instantly, send automated RSVP emails, get couple notifications, and schedule reminders without chasing guests.',
  },
  {
    icon: UsersRound,
    title: 'Guest List & Seating Manager',
    body: 'Organize guests, plus-ones, groups, and seating plans without spreadsheet chaos.',
  },
  {
    icon: CircleDollarSign,
    title: 'Budget Tracker',
    body: 'Stay in control of deposits, balances, and every wedding expense before surprises happen.',
  },
  {
    icon: Phone,
    title: 'Vendor Organizer',
    body: 'Keep vendor contacts, bookings, notes, and deadlines together in one calm dashboard.',
  },
  {
    icon: ClipboardCheck,
    title: 'Task & Checklist Planner',
    body: 'Know what is done, what is next, and what needs attention before the big day.',
  },
  {
    icon: Heart,
    title: 'Collaboration Tools',
    body: 'Invite your partner, family, or planner so everyone can help without losing context.',
  },
  {
    icon: Camera,
    title: 'Photo Sharing Portal',
    body: 'Let guests upload and share wedding memories in one private, easy-to-find place.',
  },
  {
    icon: PartyPopper,
    title: 'Post-Wedding Tools',
    body: 'Send thank-you messages, share albums, and stay connected after the celebration.',
  },
];

const painPoints = [
  'Guests replying across texts, emails, DMs, and group chats',
  'Spreadsheet chaos, duplicate names, and missing information',
  'Repeated questions about schedule, dress code, venue, and gifts',
  'Budget surprises that appear too late in the planning process',
  'Tasks and vendor details scattered across multiple tools',
];

const solutionPoints = [
  'Wedding website plus digital invitations',
  'RSVP and guest management',
  'Automated response emails, host notifications, and guest reminders',
  'Budget and vendor tracking',
  'Seating arrangement tools',
  'Task and checklist planner',
  'Collaborator access for your partner or coordinator',
];

const quickWedsComparison = [
  ['All-in-one wedding planning system', 'Multiple tools required'],
  ['Built-in seating and task management', 'No connected seating or task flow'],
  ['Partner and planner collaboration', 'Limited collaboration'],
  ['No ads or distractions', 'Cluttered guest experience'],
  ['Fast, simple setup', 'Manual setup across apps'],
];

const testimonials = [
  {
    names: 'Mia & Carlo',
    detail: 'Planned a 120-guest wedding',
    quote: 'QuickWeds made our RSVPs feel effortless. We finally had one place for guest answers, questions, budget notes, and the planning checklist.',
  },
  {
    names: 'Sofia & Daniel',
    detail: 'Shared planning with family',
    quote: 'The dashboard helped us stop jumping between chats and spreadsheets. Our guests had the website, and we had the calm planning view.',
  },
  {
    names: 'Ari & James',
    detail: 'Built their site in one evening',
    quote: 'We wanted something elegant without hiring a designer. QuickWeds gave us a beautiful site and the tools to manage everything behind it.',
  },
];

const faqs = [
  {
    question: 'Is QuickWeds only a wedding website builder?',
    answer: 'No. QuickWeds includes your wedding website, RSVP tracking, guest list, seating tools, budget tracker, vendor notes, task planning, photo sharing, collaborator access, and post-wedding messaging.',
  },
  {
    question: 'Can guests RSVP from their phones?',
    answer: 'Yes. Your wedding website and RSVP flow are mobile-friendly, so guests can view details and respond from iPhone, Android, tablets, or desktop.',
  },
  {
    question: 'Will I get notifications when someone RSVPs?',
    answer: 'Yes. QuickWeds supports RSVP response emails, host notifications, and reminders so you can keep guests moving without manually chasing every reply.',
  },
  {
    question: 'Can my partner or planner help manage the wedding?',
    answer: 'Yes. You can invite collaborators so your partner, family member, or wedding planner can help manage planning details from the dashboard.',
  },
  {
    question: 'Do I need technical skills to launch my site?',
    answer: 'No. Choose a design, add your details and photos, then share your wedding link. QuickWeds handles the polished layout and mobile experience for you.',
  },
  {
    question: 'Can I start free?',
    answer: 'Yes. All templates, the builder, your wedding website, RSVP tools, and guest tracking are free. Planner Pro is a one-time upgrade for seating, budgets, vendors, tasks, collaborators, photo sharing, and thank-you tools.',
  },
];

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-primary">{children}</span>;
}

function PrimaryCta({ children = 'Create Your Free Wedding Site' }: { children?: string }) {
  return (
    <Link
      href="/builder"
      className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-center text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover sm:w-auto sm:px-6 sm:text-base"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent,
  afterAccent,
  body,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  afterAccent?: string;
  body?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-14">
      {eyebrow && (
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-primary/70 sm:text-xs sm:tracking-[0.28em]">{eyebrow}</p>
      )}
      <h2 className="text-[2rem] font-bold leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
        {title} {accent && <Accent>{accent}</Accent>}{afterAccent}
      </h2>
      {body && <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-text-secondary sm:text-lg">{body}</p>}
    </div>
  );
}

function HeroImagePanel() {
  return (
    <div className="relative mx-auto w-full max-w-[390px] sm:max-w-[580px] lg:max-w-[650px]">
      <div className="relative flex min-h-[300px] items-center justify-center sm:min-h-[420px] lg:min-h-[520px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl}
          alt="QuickWeds multi-device wedding website and planning dashboard mockup"
          className="h-auto w-full object-contain drop-shadow-2xl"
          loading="eager"
          decoding="async"
        />
        <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center justify-center rounded-2xl border border-white/70 bg-white/85 px-4 py-2 shadow-xl shadow-primary/10 backdrop-blur-md sm:top-5 sm:px-5 sm:py-3">
          <Image
            src="/logo.png"
            alt="QuickWeds"
            width={190}
            height={68}
            className="h-8 w-auto object-contain sm:h-10"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasWeddingSite, setHasWeddingSite] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const showDashboardLink = Boolean(user && hasWeddingSite);

  useEffect(() => {
    if (!user) return;

    const phoneView = window.matchMedia('(max-width: 639px)');
    if (phoneView.matches) {
      router.replace('/dashboard');
    }
  }, [router, user]);

  useEffect(() => {
    let isMounted = true;

    const checkWeddingSite = async () => {
      if (!user) {
        setHasWeddingSite(false);
        return;
      }

      const { data, error } = await supabase
        .from('weddings')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .limit(1);

      if (isMounted) {
        setHasWeddingSite(!error && Boolean(data?.length));
      }
    };

    void checkWeddingSite();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openTemplates = () => {
    setIsExamplesOpen(true);
    closeMobileMenu();
  };
  const openDemo = () => {
    setIsDemoOpen(true);
    closeMobileMenu();
  };

  return (
    <div className="min-h-screen overflow-hidden bg-neutral pb-20 text-foreground sm:pb-0">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-xl">
        <div className="mobile-safe-px mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="QuickWeds" width={180} height={64} className="h-8 w-auto object-contain sm:h-11" priority />
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            <a href="#features" className={navItemClass}>Features</a>
            <a href="#pricing" className={navItemClass}>Pricing</a>
            <button type="button" onClick={openTemplates} className={navItemClass}>Templates</button>
            <button type="button" onClick={openDemo} className={navItemClass}>Demo</button>
            {!user && <Link href="/login" className={navItemClass}>Login</Link>}
          </div>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary hover:text-primary sm:h-11 sm:w-11"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            {user ? (
              <>
                {showDashboardLink && (
                  <Link href="/dashboard" className="hidden min-h-[40px] items-center rounded-xl border border-primary/20 bg-primary/10 px-4 text-sm font-bold leading-none text-primary transition hover:border-primary/40 hover:bg-primary hover:text-white sm:inline-flex">
                    Dashboard
                  </Link>
                )}
                <button type="button" onClick={logout} className="hidden h-10 items-center text-sm font-bold leading-none text-text-secondary transition hover:text-primary sm:inline-flex">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="hidden h-10 items-center text-sm font-bold leading-none text-text-secondary transition hover:text-primary sm:inline-flex lg:hidden">
                Login
              </Link>
            )}
            <Link
              href="/builder"
              className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover sm:min-h-[44px] sm:px-5 sm:text-sm"
              onClick={closeMobileMenu}
            >
              <span className="sm:hidden">Free Site</span>
              <span className="hidden sm:inline">Create Free Site</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary hover:bg-primary/5 hover:text-primary sm:h-11 sm:w-11 lg:hidden"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="landing-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div id="landing-mobile-menu" className="mobile-safe-px border-t border-border/60 bg-white/95 px-4 py-4 shadow-xl shadow-primary/10 backdrop-blur-xl lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              <a
                href="#features"
                onClick={closeMobileMenu}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Features
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                onClick={closeMobileMenu}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Pricing
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={openTemplates}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-left text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Templates
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={openDemo}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-left text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Demo
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/user-guide"
                onClick={closeMobileMenu}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Guide
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#faq"
                onClick={closeMobileMenu}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                FAQ
                <ArrowRight className="h-4 w-4" />
              </a>
              {user ? (
                <>
                  {showDashboardLink && (
                    <Link
                      href="/dashboard"
                      onClick={closeMobileMenu}
                      className="flex min-h-[48px] items-center justify-between rounded-2xl bg-primary/10 px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                    >
                      Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                    }}
                    className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-left text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
                  >
                    Logout
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
                >
                  Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/builder"
                onClick={closeMobileMenu}
                className="mt-2 flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover"
              >
                Create Your Free Wedding Site
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16 sm:pt-20">
        <section className="relative px-4 pb-14 pt-9 sm:px-6 sm:pb-24 sm:pt-16 lg:pb-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(209,108,120,0.13),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(214,184,124,0.16),transparent_26%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="text-center lg:text-left">
              <div className="mx-auto mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-white/75 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary shadow-sm sm:mb-6 sm:px-4 sm:text-xs sm:tracking-[0.22em] lg:mx-0">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="truncate">Complete wedding planning system</span>
              </div>
              <h1 className="mx-auto max-w-3xl text-[2.55rem] font-bold leading-[1.03] tracking-tight text-foreground min-[390px]:text-[2.85rem] sm:text-5xl lg:mx-0 lg:text-7xl">
                Plan, invite, and manage your <Accent>wedding</Accent> all in one place.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-text-secondary sm:mt-6 sm:text-xl sm:leading-8 lg:mx-0">
                Create your wedding website, manage RSVPs, track guests, organize budgets, coordinate vendors, and keep every detail together in one calm dashboard.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row lg:justify-start">
                <PrimaryCta />
                <button
                  type="button"
                  onClick={openDemo}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary sm:w-auto sm:px-6 sm:text-base"
                >
                  View Demo
                </button>
              </div>
              <p className="mt-5 flex items-start justify-center gap-2 text-sm font-bold leading-6 text-text-secondary lg:justify-start">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-primary" />
                No spreadsheets. No chasing guests. No stress.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }}>
              <HeroImagePanel />
            </motion.div>
          </div>
        </section>

        <section className="border-y border-border bg-white px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto grid max-w-6xl gap-3 text-center sm:grid-cols-3 sm:gap-4">
            {['Thousands of guests managed', 'RSVPs tracked effortlessly', 'Couples planning smarter weddings'].map((item) => (
              <p key={item} className="rounded-2xl bg-neutral px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-text-secondary sm:py-4 sm:text-sm sm:tracking-[0.18em]">
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="text-center lg:text-left">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-primary/70 sm:text-xs sm:tracking-[0.28em]">The problem</p>
              <h2 className="text-[2rem] font-bold leading-[1.08] sm:text-5xl">Planning a <Accent>wedding</Accent> should not feel like a full-time job.</h2>
              <p className="mt-4 text-[15px] leading-7 text-text-secondary sm:mt-5 sm:text-lg sm:leading-8">
                When every decision lives in a different app, planning starts to feel heavier than the celebration itself.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {painPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
                  <p className="flex gap-3 text-left text-sm font-semibold leading-6 text-foreground">
                    <span className="mt-1 h-2 w-2 flex-none rounded-full bg-primary" />
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
            <div className="rounded-[1.5rem] border border-border bg-neutral p-4 sm:rounded-[2rem] sm:p-8">
              <div className="rounded-2xl bg-white p-4 shadow-lg shadow-primary/5 sm:rounded-3xl sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.25em]">Dashboard</p>
                    <h3 className="font-serif text-2xl font-bold sm:text-3xl">Everything in sync</h3>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-3">
                  {solutionPoints.map((point) => (
                    <div key={point} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 sm:p-4">
                      <CheckCircle2 className="h-5 w-5 flex-none text-primary" />
                      <span className="text-sm font-semibold text-foreground sm:text-base">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-primary/70 sm:text-xs sm:tracking-[0.28em]">The solution</p>
              <h2 className="text-[2rem] font-bold leading-[1.08] sm:text-5xl">One simple <Accent>system</Accent> for your entire wedding.</h2>
              <p className="mt-4 text-[15px] leading-7 text-text-secondary sm:mt-5 sm:text-lg sm:leading-8">
                QuickWeds brings your guest experience, planning workflow, budget, vendors, seating, tasks, photos, and post-wedding messages into one organized home.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <PrimaryCta>Start Planning Free</PrimaryCta>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Core features"
              title="Everything you"
              accent="need."
              afterAccent=" Nothing you do not."
              body="From the first invitation to the final thank-you, QuickWeds keeps every planning detail clear, beautiful, and easy to manage."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 sm:rounded-3xl sm:p-6 sm:text-left">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mx-0 sm:mb-5 sm:h-12 sm:w-12">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-bold text-foreground sm:text-2xl">{feature.title}</h3>
                    <p className="text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{feature.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="How it works" title="Set everything up in" accent="minutes" />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['1', 'Create your wedding site', 'Choose your look, add your story, schedule, location, and RSVP details.'],
                ['2', 'Share your link with guests', 'Send one beautiful link instead of scattered messages and repeated updates.'],
                ['3', 'Manage it all from one dashboard', 'Track RSVPs, guests, seating, budget, vendors, tasks, photos, and thank-you messages.'],
              ].map(([number, title, body]) => (
                <div key={number} className="rounded-2xl border border-border bg-neutral p-5 text-center sm:rounded-3xl sm:p-6 md:text-left">
                  <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary font-serif text-xl font-bold text-white sm:mb-6 sm:h-12 sm:w-12 sm:text-2xl md:mx-0">{number}</div>
                  <h3 className="mb-3 font-serif text-xl font-bold sm:text-2xl">{title}</h3>
                  <p className="text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Why couples choose QuickWeds" title="Built to replace the planning" accent="mess," afterAccent=" not add another tab." />
            <div className="space-y-3 sm:hidden">
              {quickWedsComparison.map(([quickweds, others]) => (
                <div key={quickweds} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex gap-3 font-semibold text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" />
                    <div>
                      <p>{quickweds}</p>
                      <p className="mt-2 border-t border-border pt-2 text-sm font-medium text-text-secondary">Others: {others}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-hidden rounded-[2rem] border border-border bg-white shadow-xl shadow-primary/5 sm:block">
              <div className="grid grid-cols-2 bg-neutral text-sm font-black uppercase tracking-[0.18em] text-text-secondary">
                <div className="border-r border-border p-4 sm:p-6">QuickWeds</div>
                <div className="p-4 sm:p-6">Other tools</div>
              </div>
              {quickWedsComparison.map(([quickweds, others]) => (
                <div key={quickweds} className="grid grid-cols-2 border-t border-border">
                  <div className="flex gap-3 border-r border-border p-4 font-semibold text-foreground sm:p-6">
                    <CheckCircle2 className="h-5 w-5 flex-none text-primary" />
                    {quickweds}
                  </div>
                  <div className="p-4 text-text-secondary sm:p-6">{others}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 sm:py-10">
          <div className="relative mx-auto min-h-[480px] max-w-7xl overflow-hidden rounded-[1.5rem] border border-border bg-foreground sm:min-h-[420px] sm:rounded-[2rem]">
            <picture>
              <source media="(min-width: 640px)" srcSet={joySectionDesktopImageUrl} />
              <img
                src={joySectionMobileImageUrl}
                alt="QuickWeds planning experience preview"
                className="absolute inset-0 h-full w-full object-cover object-center opacity-70 sm:opacity-65"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/92 via-foreground/55 to-foreground/10 sm:bg-gradient-to-r sm:from-foreground/85 sm:via-foreground/45 sm:to-transparent" />
            <div className="relative flex min-h-[480px] max-w-2xl flex-col justify-end p-6 text-white sm:min-h-[420px] sm:justify-center sm:p-12 lg:p-16">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-white/75 sm:mb-4 sm:text-xs sm:tracking-[0.28em]">More joy, less admin</p>
              <h2 className="text-[2.15rem] font-bold leading-[1.08] sm:text-5xl">Spend less time managing, more time <span className="text-secondary">celebrating.</span></h2>
              <p className="mt-4 text-[15px] leading-7 text-white/85 sm:mt-5 sm:text-lg sm:leading-8">Focus on moments, not logistics. QuickWeds keeps the details handled so the day feels lighter.</p>
              <div className="mt-8">
                <Link href="/builder" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-neutral sm:w-auto sm:px-6 sm:text-base">
                  Create Your Free Wedding Site
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="Simple pricing"
              title="Build free. Unlock"
              accent="Planner Pro"
              afterAccent=" once."
              body="Start with every template and the full wedding website builder free. Upgrade only when you want the complete planning workspace."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.25em]">Free forever</p>
                <h3 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">Wedding Site</h3>
                <p className="mt-3 text-text-secondary">Launch a polished wedding website with RSVP tools and guest tracking.</p>
                <div className="mt-6">
                  <PrimaryCta>Create Free Site</PrimaryCta>
                </div>
                <div className="mt-8 grid gap-3">
                  {[
                    'All templates included',
                    'Website builder and design tools',
                    'RSVP form and guest tracking',
                    'Automated RSVP emails and host notifications',
                  ].map((item) => (
                    <p key={item} className="flex items-center gap-3 rounded-2xl bg-neutral p-3 text-sm font-semibold sm:p-4 sm:text-base">
                      <CheckCircle2 className="h-5 w-5 flex-none text-primary" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-primary/25 bg-white p-5 shadow-2xl shadow-primary/10 sm:rounded-[2rem] sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.25em]">One-time upgrade</p>
                <div className="mt-2 flex flex-col gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                  <h3 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Planner Pro</h3>
                  <p className="font-serif text-3xl font-bold text-primary">$29</p>
                </div>
                <p className="mt-3 text-text-secondary">Unlock the planning workspace when you are ready for deeper coordination.</p>
                <div className="mt-8 grid gap-3">
                  {[
                    'Seating chart and guest placement',
                    'Budget, vendor, and task management',
                    'Collaborator access',
                    'RSVP reminders and planning notifications',
                    'Photo sharing and post-wedding thank-you tools',
                  ].map((item) => (
                    <p key={item} className="flex items-center gap-3 rounded-2xl bg-neutral p-3 text-sm font-semibold sm:p-4 sm:text-base">
                      <CheckCircle2 className="h-5 w-5 flex-none text-primary" />
                      {item}
                    </p>
                  ))}
                </div>
                <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-text-secondary sm:text-left">No subscription. No surprises.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
            {[
              [LockKeyhole, 'Secure and private', 'Your planning details and guest information stay protected.'],
              [Phone, 'Mobile-friendly', 'Designed for couples and guests on any screen.'],
              [Sparkles, 'No technical skills', 'Launch a polished wedding hub without code or setup stress.'],
            ].map(([Icon, title, body]) => {
              const TrustIcon = Icon as typeof LockKeyhole;
              return (
                <div key={title as string} className="rounded-2xl border border-border bg-neutral p-5 text-center sm:rounded-3xl sm:p-6">
                  <TrustIcon className="mx-auto mb-4 h-7 w-7 text-primary sm:h-8 sm:w-8" />
                  <h3 className="font-serif text-xl font-bold sm:text-2xl">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{body as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Couple stories"
              title="Planning feels lighter when everything is"
              accent="together."
              body="QuickWeds is built for couples who want a beautiful guest experience and a calm planning dashboard behind it."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.names} className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm sm:rounded-3xl sm:p-6 md:text-left">
                  <div className="mb-5 flex items-center justify-center gap-1 text-secondary md:justify-start">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="mx-auto mb-4 h-8 w-8 text-primary/25 md:mx-0" />
                  <p className="text-[15px] font-semibold leading-7 text-foreground sm:text-base sm:leading-8">&quot;{testimonial.quote}&quot;</p>
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="font-serif text-xl font-bold text-foreground">{testimonial.names}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-primary/70">{testimonial.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              eyebrow="FAQ"
              title="Questions before you start"
              accent="planning?"
              body="Here are the answers couples usually need before creating their QuickWeds site."
            />
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-border bg-neutral p-4 shadow-sm open:border-primary/25 open:bg-white sm:rounded-3xl sm:p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-serif text-lg font-bold text-foreground sm:text-xl">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-5 w-5 flex-none text-primary transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 border-t border-border pt-4 text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <PrimaryCta>Start Your Free Site</PrimaryCta>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-5xl rounded-[1.5rem] bg-primary p-6 text-center text-white shadow-2xl shadow-primary/25 sm:rounded-[2rem] sm:p-14 lg:p-20">
            <h2 className="mx-auto max-w-3xl text-[2.15rem] font-bold leading-[1.08] sm:text-6xl">Ready to simplify your <span className="text-secondary">wedding planning?</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-white/85 sm:mt-5 sm:text-lg sm:leading-8">
              Build the website your guests see and the planning system you actually need behind it.
            </p>
            <div className="mt-8">
              <Link href="/builder" className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-neutral sm:w-auto sm:px-7 sm:text-base">
                Create Your Free Wedding Site
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white px-4 py-12 pb-24 sm:px-6 sm:pb-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <Link href="/" className="inline-flex justify-center md:justify-start">
              <Image src="/logo.png" alt="QuickWeds" width={180} height={64} className="h-10 w-auto object-contain" />
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
              The all-in-one wedding planning system for websites, RSVPs, guests, budgets, vendors, seating, tasks, photos, and thank-you messages.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-text-secondary md:justify-end">
            <a href="#features" className={footerItemClass}>Features</a>
            <a href="#pricing" className={footerItemClass}>Pricing</a>
            <button type="button" onClick={openTemplates} className={footerItemClass}>Templates</button>
            <button type="button" onClick={openDemo} className={footerItemClass}>Demo</button>
            <a href="#faq" className={footerItemClass}>FAQ</a>
            <a href="mailto:support@quickweds.site" className={footerItemClass}>Contact</a>
            <Link href="/privacy" className={footerItemClass}>Privacy</Link>
          </div>
        </div>
      </footer>

      <div className="mobile-safe-px mobile-safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-white/90 px-4 py-3 backdrop-blur-xl sm:hidden">
        <Link
          href="/builder"
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-primary/30"
        >
          Create Free Site
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-3 sm:flex">
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-500/30 transition hover:scale-105"
          aria-label="Chat with QuickWeds"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-xl transition hover:bg-neutral"
          aria-label="Back to top"
        >
          <ChevronDown className="h-6 w-6 rotate-180" />
        </button>
      </div>

      <DemoSection isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <ExamplesSection isOpen={isExamplesOpen} onClose={() => setIsExamplesOpen(false)} />
    </div>
  );
}

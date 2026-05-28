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
  Instagram,
  Twitter,
  Facebook,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DemoSection from '@/components/DemoSection';
import ExamplesSection from '@/components/ExamplesSection';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import UpgradeButton from '@/components/UpgradeButton';
import { submitInquiry } from '@/app/actions/support';

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
    answer: 'No. You can build and publish a free wedding website with RSVP tracking, QR sharing, a basic guest list, 50 guest emails, and Planner Lite. Planner Pro is the one-time upgrade for unlimited guest emails, full planner tools, seating, collaborators, reminders, photo tools, exports, and custom domains.',
  },
  {
    question: 'Can guests RSVP from their phones?',
    answer: 'Yes. Your wedding website and RSVP flow are mobile-friendly, so guests can view details and respond from iPhone, Android, tablets, or desktop.',
  },
  {
    question: 'Will I get notifications when someone RSVPs?',
    answer: 'Yes. Automatic RSVP confirmations and host notifications stay free and do not count toward your 50 guest email allowance. User-triggered sends like RSVP reminders, seat emails, and thank-you emails count toward that allowance.',
  },
  {
    question: 'Can my partner or planner help manage the wedding?',
    answer: 'Yes. Free workspaces include 1 partner collaborator. Planner Pro unlocks coordinators and more helpers for managing budgets, vendors, tasks, seating, reminders, and post-wedding details.',
  },
  {
    question: 'Do I need technical skills to launch my site?',
    answer: 'No. Choose a design, add your details and photos, then share your wedding link. QuickWeds handles the polished layout and mobile experience for you.',
  },
  {
    question: 'Can I start free?',
    answer: 'Yes. All templates, the builder, your wedding website, RSVP tools, QR sharing, basic guest tracking, 50 guest emails, and Planner Lite are free. Planner Pro unlocks unlimited planning, unlimited guest emails, seating, reminders, collaborators, exports, photo tools, and thank-you tools.',
  },
];

const weddingTips = [
  {
    title: 'Finalize Your Guest Count Early',
    body: 'Knowing your exact guest count helps with budget precision and venue capacity planning.',
    icon: UsersRound,
  },
  {
    title: 'Automate Your RSVP Flow',
    body: 'Stop chasing guests manually. Use automated reminders to get responses 3 weeks before your deadline.',
    icon: MailCheck,
  },
  {
    title: 'Keep a "Buffer" in Your Budget',
    body: 'Unexpected costs always arise. Set aside 10% of your total budget for small surprises.',
    icon: CircleDollarSign,
  },
  {
    title: 'Prioritize Your "Must-Haves"',
    body: 'Focus your spending on the 3 things that matter most to you as a couple, and be flexible on the rest.',
    icon: Heart,
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
      <h2 className="text-[1.8rem] font-bold leading-[1.08] text-foreground min-[390px]:text-[2rem] sm:text-4xl lg:text-5xl">
        {title} {accent && <Accent>{accent}</Accent>}{afterAccent}
      </h2>
      {body && (
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-text-secondary sm:mt-5 sm:text-lg sm:leading-8">{body}</p>
      )}
    </div>
  );
}

function WeddingTipsSection() {
  return (
    <section id="tips" className="px-4 py-16 sm:px-6 sm:py-28 bg-neutral/30">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Wedding Tips"
          title="Plan your big day with"
          accent="confidence."
          body="Expert advice to help you navigate the planning process without the stress."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weddingTips.map((tip) => (
            <div key={tip.title} className="group rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                <tip.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">{tip.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await submitInquiry(formData);
    setLoading(false);
    setSent(true);
  };

  return (
    <section id="contact" className="px-4 py-16 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Contact Us"
          title="Have a question or need"
          accent="help?"
          body="Our team is here to support you. Send us a message and we'll get back to you shortly."
        />
        
        <div className="w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-2xl shadow-primary/5 sm:rounded-[2rem]">
          <div className="grid min-w-0 md:grid-cols-5">
            <div className="min-w-0 bg-primary p-5 text-white sm:p-8 md:col-span-2">
              <h3 className="font-serif text-2xl font-bold">Get in touch</h3>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Whether you&apos;re just starting or finalizing your details, we&apos;re here to help make your wedding planning journey a success.
              </p>
              
              <div className="mt-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <MailCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/50">Email</p>
                    <p className="font-bold">support@quickweds.site</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/50">Chat</p>
                    <p className="font-bold">Available via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="min-w-0 p-5 sm:p-8 md:col-span-3">
              {sent ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-10">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">Message Sent!</h3>
                  <p className="mt-2 text-text-secondary">We&apos;ve received your inquiry and will respond to you as soon as possible.</p>
                  <button onClick={() => setSent(false)} className="mt-6 text-sm font-bold text-primary hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-text-secondary/60 mb-2">Full Name</label>
                      <input required type="text" id="name" name="name" className="w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="userEmail" className="block text-xs font-black uppercase tracking-widest text-text-secondary/60 mb-2">Email Address</label>
                      <input required type="email" id="userEmail" name="userEmail" className="w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs font-black uppercase tracking-widest text-text-secondary/60 mb-2">Subject</label>
                    <input required type="text" id="subject" name="subject" className="w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs font-black uppercase tracking-widest text-text-secondary/60 mb-2">Message</label>
                    <textarea required id="message" name="message" rows={4} className="w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none" placeholder="Tell us more about your inquiry..."></textarea>
                  </div>
                  <button type="submit" disabled={loading} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-70">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
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
  const { user, isAdmin, logout } = useAuth();
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
    <div className="min-h-screen overflow-x-hidden bg-neutral pb-20 text-foreground sm:pb-0">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-xl">
        <div className="mobile-safe-px mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6">
          <Link href="/" className="flex min-w-0 shrink items-center gap-2" aria-label="QuickWeds home">
            <Image src="/logo.png" alt="QuickWeds" width={180} height={64} className="h-7 w-auto max-w-[128px] object-contain min-[390px]:h-8 min-[390px]:max-w-[150px] sm:h-11 sm:max-w-none" priority />
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            <a href="#features" className={navItemClass}>Features</a>
            <Link href="/suppliers" className={navItemClass}>Directory</Link>
            <a href="#tips" className={navItemClass}>Wedding Tips</a>
            <button type="button" onClick={openDemo} className={navItemClass}>Demo</button>
            <a href="#pricing" className={navItemClass}>Pricing</a>
            <a href="#contact" className={navItemClass}>Contact</a>
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
              className="hidden min-h-[40px] shrink-0 items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover min-[360px]:inline-flex sm:min-h-[44px] sm:px-5 sm:text-sm"
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
          <div id="landing-mobile-menu" className="mobile-safe-px max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border/60 bg-white/95 px-4 py-4 shadow-xl shadow-primary/10 backdrop-blur-xl lg:hidden">
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
              <Link
                href="/suppliers"
                onClick={closeMobileMenu}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Directory
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#tips"
                onClick={closeMobileMenu}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Wedding Tips
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
              <a
                href="#contact"
                onClick={closeMobileMenu}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-primary/5 px-4 text-sm font-bold text-primary transition hover:bg-primary/10 border border-primary/10"
              >
                Contact Support
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
              <h1 className="mx-auto max-w-3xl text-[2.1rem] font-bold leading-[1.05] text-foreground min-[390px]:text-[2.65rem] sm:text-5xl lg:mx-0 lg:text-7xl">
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

        <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-[1.5rem] border border-border bg-neutral p-5 shadow-sm sm:rounded-[2rem] sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="text-center lg:text-left">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-primary/70 sm:text-xs sm:tracking-[0.28em]">Supplier directory</p>
              <h2 className="text-[2rem] font-bold leading-[1.08] sm:text-5xl">Find trusted <Accent>wedding suppliers</Accent> near you.</h2>
              <p className="mt-4 text-[15px] leading-7 text-text-secondary sm:mt-5 sm:text-lg sm:leading-8">
                Browse Philippines-focused venues, photographers, coordinators, caterers, stylists, and more. Contact suppliers directly, then save favorites into Planner Pro when you are ready.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <Link href="/suppliers" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover sm:w-auto sm:px-6 sm:text-base">
                  Find Wedding Suppliers
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Venues', 'Photography', 'Coordination', 'Catering', 'Styling', 'Hair & Makeup'].map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-white p-4 text-center shadow-sm sm:p-5">
                  <p className="font-serif text-xl font-bold text-foreground">{item}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Browse free</p>
                </div>
              ))}
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
                <h3 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">Free</h3>
                <p className="mt-3 text-text-secondary">Perfect for starting your wedding site and collecting early RSVPs.</p>
                <div className="mt-6">
                  <PrimaryCta>Create Free Site</PrimaryCta>
                </div>
                <div className="mt-8 grid gap-3">
                  {[
                    'Wedding website and all templates',
                    'RSVP tracking and basic guest list',
                    'QR sharing for invitations',
                    '50 guest emails per wedding',
                    'Planner Lite with starter limits',
                    'Automatic RSVP emails and host notifications',
                  ].map((item) => (
                    <p key={item} className="flex items-center gap-3 rounded-2xl bg-neutral p-3 text-sm font-semibold sm:p-4 sm:text-base">
                      <CheckCircle2 className="h-5 w-5 flex-none text-primary" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
                <div className="rounded-[1.5rem] border border-primary/25 bg-white p-5 shadow-2xl shadow-primary/10 sm:rounded-[2rem] sm:p-8 relative">
                  <div className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                    Most Popular
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.25em]">One-time upgrade</p>
                  <div className="mt-2 flex flex-col gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                    <h3 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Planner Pro</h3>
                    <p className="font-serif text-3xl font-bold text-primary">$29</p>
                  </div>
                  <p className="mt-3 text-text-secondary">Built for finalizing the real wedding plan when guests, suppliers, seating, and reminders matter.</p>
                  <div className="mt-8 grid gap-3">
                    {[
                      'Unlimited guest emails',
                      'Full planner with unlimited tasks, budgets, suppliers, and calendar items',
                      'Seating chart, guest check-in, and seat-link emails',
                      'RSVP reminders and unlimited collaborators',
                      'Google Calendar sync and custom domain',
                      'Photo tools, thank-you tools, CSV exports, and advanced analytics',
                    ].map((item) => (
                      <p key={item} className="flex items-center gap-3 rounded-2xl bg-neutral p-3 text-sm font-semibold sm:p-4 sm:text-base">
                        <CheckCircle2 className="h-5 w-5 flex-none text-primary" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-text-secondary sm:text-left">No subscription. No surprises.</p>
                  <div className="mt-8 flex justify-center sm:justify-start">
                    {user && isAdmin ? (
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                      >
                        Open Dashboard
                      </Link>
                    ) : user ? (
                      <UpgradeButton variant="primary" className="px-8 py-4 text-base" />
                    ) : (
                      <Link
                        href="/signup"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                      >
                        Sign Up to Upgrade
                      </Link>
                    )}
                  </div>
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

        <section className="px-4 py-16 sm:px-6 sm:py-28 overflow-hidden">
          <div className="relative isolate mx-auto max-w-4xl overflow-hidden rounded-[1.5rem] bg-primary shadow-2xl shadow-primary/25 sm:rounded-[2.5rem]">
            {/* Wave effect like the dashboard hero */}
            <div className="pointer-events-none absolute inset-x-0 top-[-50%] h-[150%] opacity-10 bg-white/10 blur-3xl" />
            <div 
                className="pointer-events-none absolute inset-x-0 bottom-[-80%] h-[120%] bg-white/5" 
                style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
            />

            <div className="relative z-10 grid gap-6 lg:grid-cols-2 items-center p-6 sm:p-10 lg:p-12">
              <div className="text-center lg:text-left">
                <h2 className="text-[2rem] font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                  Ready to simplify your <span className="text-secondary">wedding planning?</span>
                </h2>
                <p className="mt-4 text-[14px] leading-6 text-white/80 sm:text-base sm:leading-7">
                  Build the website your guests see and the planning system you actually need behind it.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/builder" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-primary transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 active:scale-95">
                    Create Your Free Wedding Site
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                {/* Decorative glow behind bird */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 blur-[60px] rounded-full" />
                
                <img 
                  src="https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/icons/computer%20quicky.png" 
                  alt="QuickWeds Mascot" 
                  className="relative z-20 h-[240px] sm:h-[320px] lg:h-[400px] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-[1.05]"
                />
              </div>
            </div>
          </div>
        </section>

        <WeddingTipsSection />
        
        <ContactSection />
      </main>

      <footer className="border-t border-border bg-white pt-16 pb-24 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 text-center md:text-left">
            {/* Brand Column */}
            <div className="space-y-6">
              <Link href="/" className="inline-block">
                <Image src="/logo.png" alt="QuickWeds" width={180} height={64} className="h-10 w-auto object-contain" />
              </Link>
              <p className="max-w-xs mx-auto md:mx-0 text-sm leading-7 text-text-secondary">
                The all-in-one wedding planning system for websites, RSVPs, guests, budgets, vendors, and more. Simplifying your journey to &quot;I do&quot;.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <a href="#" className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral text-text-secondary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral text-text-secondary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61587661715324" target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral text-text-secondary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">Product</h4>
              <ul className="space-y-4">
                <li><button type="button" onClick={openTemplates} className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Wedding Templates</button></li>
                <li><button type="button" onClick={openDemo} className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">View Live Demo</button></li>
                <li><a href="#pricing" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Pricing & Features</a></li>
                <li><Link href="/suppliers" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Vendor Directory</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#tips" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Wedding Tips</a></li>
                <li><Link href="/user-guide" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Planning Guide</Link></li>
                <li><a href="#faq" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">FAQ</a></li>
                <li><Link href="/privacy" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#contact" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Contact Support</a></li>
                <li><a href="mailto:support@quickweds.site" className="inline-flex min-h-[44px] items-center break-all text-sm font-bold text-text-secondary transition-colors hover:text-primary">support@quickweds.site</a></li>
                <li><a href="https://wa.me/639454602270" className="inline-flex min-h-[44px] items-center text-sm font-bold text-text-secondary transition-colors hover:text-primary">Chat on WhatsApp</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-bold text-text-secondary/60">
              © {new Date().getFullYear()} QuickWeds. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
              <Link href="/privacy" className="text-xs font-bold text-text-secondary/60 hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="text-xs font-bold text-text-secondary/60 hover:text-primary transition-colors">Terms</Link>
              <Link href="/cookies" className="text-xs font-bold text-text-secondary/60 hover:text-primary transition-colors">Cookies</Link>
            </div>
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
          href="https://wa.me/639454602270"
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

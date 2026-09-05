'use client';

import { useEffect, useRef, useState } from 'react';
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
  MailCheck,
  Menu,
  MessageCircle,
  PartyPopper,
  Phone,
  QrCode,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  UsersRound,
  X,
  Instagram,
  Twitter,
  Facebook,
  Loader2,
  Mouse,
} from 'lucide-react';
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionStyle, type MotionValue } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DemoSection from '@/components/DemoSection';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import UpgradeButton from '@/components/UpgradeButton';
import { submitInquiry } from '@/app/actions/support';

const heroImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/lastfinal%20hero%20imagfe.png';
const joySectionDesktopImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/253b06e1-93cf-446c-a0fe-b3397777c185.png';
const joySectionMobileImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/253b06e1-93cf-446c-a0fe-b3397777c185.png';
const siteUrl = 'https://quickweds.site';
const landingPageTitle = 'Free Wedding Website Builder & RSVP Planner | QuickWeds';
const landingPageDescription = 'Create a free wedding website, send digital invitations, manage RSVPs, organize guests, seating, budgets, suppliers, photos, and wedding-day plans in QuickWeds.';
const navItemClass = 'inline-flex h-10 items-center px-1 text-sm font-bold leading-none text-text-secondary transition hover:text-primary';
const landingSectionTitleClass = '[font-family:var(--font-montserrat)] text-[clamp(2.25rem,5vw,4.25rem)] font-black leading-[0.98] tracking-[-0.045em] text-foreground';
const landingHeroTitleClass = '[font-family:var(--font-montserrat)] text-[clamp(3rem,7vw,5.5rem)] font-black leading-[0.94] tracking-[-0.055em]';
const landingLightTitleClass = '[font-family:var(--font-montserrat)] text-[clamp(2.25rem,5vw,4.25rem)] font-black leading-[0.98] tracking-[-0.045em] text-white';
const landingTitleStyle = { fontFamily: 'var(--font-montserrat), Arial, sans-serif' };
const plannerProDisplayPrice = '$15';
const defaultCoreFeatureImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/scrool%20images/IMG_4415.JPG';
const newFeaturesImageUrl = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/079f3b98-6106-45fe-8d55-407f65fe4d9f.png';

import { landingTemplatePreviews } from '@/lib/landing-templates';

const featureCards = [
  {
    number: '01',
    icon: LayoutDashboard,
    title: 'Wedding Website Builder',
    body: 'Create a beautiful, personalized wedding site with your story, schedule, venue, gifts, FAQs, photos, and guest-facing details.',
    bullets: ['Elegant mobile invitation pages', 'Story, venue, FAQ, and gallery sections', 'Share-ready wedding link and QR flow'],
    tags: ['Website', 'QR Code', 'Gallery'],
    mockupType: 'website',
    imageUrl: defaultCoreFeatureImageUrl,
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Wedding%20Website%20Builder.png',
  },
  {
    number: '02',
    icon: MailCheck,
    title: 'Smart RSVP Management',
    body: 'Track responses instantly, send automated RSVP emails, notify hosts, and remind pending guests without chasing every reply.',
    bullets: ['Live yes, no, and maybe counts', 'Host notifications and guest confirmations', 'Reminder-ready pending guest list'],
    tags: ['RSVP', 'Automation', 'Reminders'],
    mockupType: 'rsvp',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Smart%20RSVP%20Management.png',
  },
  {
    number: '03',
    icon: UsersRound,
    title: 'Guest List & Seating',
    body: 'Organize guests, plus-ones, groups, table assignments, QR seat lookup, and event check-in without spreadsheet chaos.',
    bullets: ['Guest groups and plus-one details', 'Visual table assignments', 'QR seat finder and check-in tools'],
    tags: ['Guest List', 'Seating', 'Check-in'],
    mockupType: 'seating',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/GUERST%20LIST%20SEETING.png',
  },
  {
    number: '04',
    icon: CircleDollarSign,
    title: 'Budget Tracker',
    body: 'Stay in control of deposits, balances, and every wedding expense before surprises happen.',
    bullets: ['Track paid, due, and remaining costs', 'Supplier-linked budget items', 'Clear category totals'],
    tags: ['Budget', 'Payments', 'Totals'],
    mockupType: 'budget',
    imageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/att.Uu4BO4BGj0dAwnqRMAAIylgMK9dm-h9-0P60gXATrKw.jpg',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/BUDGET%20TARCKER.png',
  },
  {
    number: '05',
    icon: Phone,
    title: 'Vendor Organizer',
    body: 'Keep vendor contacts, bookings, notes, and deadlines together in one calm dashboard.',
    bullets: ['Save suppliers into your planner', 'Keep notes and contact details together', 'Compare venues, teams, and services'],
    tags: ['Vendors', 'Bookings', 'Planner'],
    mockupType: 'vendors',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/VENDO%20ORGANIZER.png',
  },
  {
    number: '06',
    icon: ClipboardCheck,
    title: 'Task & Checklist Planner',
    body: 'Load a 12-month checklist, add custom tasks, connect supplier details, and know what needs attention before the big day.',
    bullets: ['12-month planning checklist', 'Custom tasks and due dates', 'Progress view for next steps'],
    tags: ['Checklist', 'Tasks', 'Progress'],
    mockupType: 'tasks',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/TASK%20AND%20CHECK%20LIST%20PALNNER.png',
  },
  {
    number: '07',
    icon: Heart,
    title: 'Collaboration Tools',
    body: 'Invite your partner, coordinator, or family helpers so everyone can help without losing context.',
    bullets: ['Partner and helper access', 'Shared planning context', 'Coordinator-friendly workspace'],
    tags: ['Collaborate', 'Shared Access', 'Planner'],
    mockupType: 'collab',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/COLABORATION%20TOOLS.png',
  },
  {
    number: '08',
    icon: Camera,
    title: 'Photo Sharing Portal',
    body: 'Let guests upload memories through sharing codes, then review, approve, and reveal photos from your dashboard.',
    bullets: ['Guest upload codes', 'Moderation before publishing', 'Disposable-camera reveal settings'],
    tags: ['Photo Upload', 'Gallery', 'Sharing'],
    mockupType: 'photos',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/PHOTO%20PORTAL.png',
  },
  {
    number: '09',
    icon: PartyPopper,
    title: 'Post-Wedding Tools',
    body: 'Send thank-you messages, share albums, and stay connected after the celebration.',
    bullets: ['Thank-you email builder', 'Guest-aware follow-up', 'Post-wedding album sharing'],
    tags: ['Thank You', 'Albums', 'Follow-up'],
    mockupType: 'thanks',
    mobileImageUrl: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/POST%20WEDDING%20TOOLS.png',
  },
];

const fallingFeaturePills = [
  { title: 'Wedding Website', icon: LayoutDashboard, startX: -28, startY: 0, mobileStartX: -47, mobileStartY: 0, endX: -27, endY: 528, mobileEndX: -47, mobileEndY: 438, drift: 6, rotate: -8, delay: 0, tone: 'rose' },
  { title: 'RSVP Manager', icon: MailCheck, startX: -9, startY: 0, mobileStartX: -23, mobileStartY: 0, endX: -9, endY: 528, mobileEndX: -23, mobileEndY: 438, drift: -6, rotate: 7, delay: 0.04, tone: 'ivory' },
  { title: 'QR Invitations', icon: QrCode, startX: 9, startY: 0, mobileStartX: 1, mobileStartY: 0, endX: 9, endY: 528, mobileEndX: 1, mobileEndY: 438, drift: 6, rotate: -5, delay: 0.08, tone: 'gold' },
  { title: 'Seating Planner', icon: UsersRound, startX: 28, startY: 0, mobileStartX: 25, mobileStartY: 0, endX: 27, endY: 528, mobileEndX: 25, mobileEndY: 438, drift: -6, rotate: 9, delay: 0.12, tone: 'rose' },
  { title: 'Budget Tracker', icon: CircleDollarSign, startX: -28, startY: 62, mobileStartX: -47, mobileStartY: 38, endX: -27, endY: 590, mobileEndX: -47, mobileEndY: 478, drift: 6, rotate: 6, delay: 0.16, tone: 'ivory' },
  { title: 'Guest List', icon: UserCheck, startX: -9, startY: 62, mobileStartX: -23, mobileStartY: 38, endX: -9, endY: 590, mobileEndX: -23, mobileEndY: 478, drift: -6, rotate: -7, delay: 0.2, tone: 'gold' },
  { title: 'Vendor Management', icon: Phone, startX: 9, startY: 62, mobileStartX: 1, mobileStartY: 38, endX: 9, endY: 590, mobileEndX: 1, mobileEndY: 478, drift: 6, rotate: 5, delay: 0.24, tone: 'rose' },
  { title: 'Checklist', icon: ClipboardCheck, startX: 28, startY: 62, mobileStartX: 25, mobileStartY: 38, endX: 27, endY: 590, mobileEndX: 25, mobileEndY: 478, drift: -6, rotate: -9, delay: 0.28, tone: 'ivory' },
  { title: 'Wedding Day Mode', icon: PartyPopper, startX: -18, startY: 124, mobileStartX: -35, mobileStartY: 76, endX: -18, endY: 652, mobileEndX: -35, mobileEndY: 518, drift: 5, rotate: 8, delay: 0.32, tone: 'gold' },
  { title: 'Photo Sharing', icon: Camera, startX: 0, startY: 124, mobileStartX: -11, mobileStartY: 76, endX: 0, endY: 652, mobileEndX: -11, mobileEndY: 518, drift: -5, rotate: -6, delay: 0.36, tone: 'rose' },
  { title: 'Thank You Cards', icon: Heart, startX: 18, startY: 124, mobileStartX: 13, mobileStartY: 76, endX: 18, endY: 652, mobileEndX: 13, mobileEndY: 518, drift: 5, rotate: 7, delay: 0.4, tone: 'ivory' },
];

type FallingFeaturePillStyle = MotionStyle & {
  '--qw-pill-start-x': string;
  '--qw-pill-start-y': string;
  '--qw-pill-mobile-start-x': string;
  '--qw-pill-mobile-start-y': string;
  '--qw-pill-mid-x': string;
  '--qw-pill-mid-y': string;
  '--qw-pill-end-x': string;
  '--qw-pill-end-y': string;
  '--qw-pill-mobile-end-x': string;
  '--qw-pill-mobile-end-y': string;
  '--qw-pill-mobile-drift-x': string;
  '--qw-pill-mobile-rebound-x': string;
  '--qw-pill-mobile-mid-y': string;
  '--qw-pill-mobile-overshoot-y': string;
  '--qw-pill-mobile-rebound-y': string;
  '--qw-pill-mobile-start-rotate': string;
  '--qw-pill-mobile-mid-rotate': string;
  '--qw-pill-mobile-overshoot-rotate': string;
  '--qw-pill-mobile-rebound-rotate': string;
  '--qw-pill-rotate': string;
  '--qw-pill-mobile-animation-start': string;
  '--qw-pill-mobile-animation-end': string;
  '--qw-pill-animation-start': string;
  '--qw-pill-animation-end': string;
  '--qw-pill-mobile-transform'?: string;
};

const newFeatureCards = [
  {
    icon: UserCheck,
    title: 'Entourage Proposals',
    body: 'Invite sponsors, wedding party, and special helpers by email, then track who accepted or declined from Planner.',
    meta: 'Proposal emails + response tracking',
  },
  {
    icon: Sparkles,
    title: 'Theme Marketplace',
    body: 'Apply curated looks, reusable section blocks, and saved presets so your website can be polished faster.',
    meta: 'Presets + content blocks',
  },
  {
    icon: Camera,
    title: 'Guest Photo Portal',
    body: 'Collect guest uploads with QR-friendly sharing codes, moderation, filters, and disposable-camera reveal settings.',
    meta: 'Codes, approval, reveal date',
  },
  {
    icon: QrCode,
    title: 'QR Seat Finder',
    body: 'Generate guest codes, email seat links, print one venue QR, and check guests in at the reception.',
    meta: 'Venue QR + check-in',
  },
  {
    icon: PartyPopper,
    title: 'Wedding Day Mode',
    body: 'Keep event-day toggles, QR links, photo reminders, coordinator notes, seating, and check-in tools ready for staff.',
    meta: 'Event-day command center',
  },
  {
    icon: LayoutDashboard,
    title: 'Planner Pro Workspace',
    body: 'Coordinate calendar sync, food and drink notes, honeymoon plans, thank-you notes, budgets, vendors, tasks, and seating.',
    meta: 'One calm planning dashboard',
  },
  {
    icon: MailCheck,
    title: 'Thank-You Builder',
    body: 'Create post-wedding thank-you emails and card-style messages with templates, photos, guest context, and sending logs.',
    meta: 'Post-wedding follow-up',
  },
  {
    icon: ShieldCheck,
    title: 'Analytics & Reminders',
    body: 'See visits, QR scans, RSVP conversion, reminder performance, and follow up with pending guests from the dashboard.',
    meta: 'Traffic + RSVP follow-through',
  },
];

const solutionFeatureCards = [
  {
    title: 'Automated RSVP Emails',
    image: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/fd2847c2-2d21-44ce-908a-baf99f948005.png',
  },
  {
    title: 'All in One Dashboard',
    image: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/2df72133-22a1-4b56-9612-38513a3c3ef3.png',
  },
  {
    title: 'Smart Seating Planner',
    image: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/c352bd11-0695-4ab2-ac5e-fb513fb64e8a.png',
  },
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
    answer: 'No. You can build and publish a free wedding website with RSVP tracking, QR sharing, a basic guest list, 50 guest emails, and Planner Lite. Planner Pro is the one-time upgrade for full planner tools, QR seating, Wedding Day Mode, collaborators, reminders, photo tools, exports, thank-you tools, and custom domains.',
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
    answer: 'Yes. Free workspaces include 1 partner collaborator. Planner Pro unlocks coordinators and more helpers for managing budgets, vendors, tasks, seating, reminders, guest photos, and post-wedding details.',
  },
  {
    question: 'Do I need technical skills to launch my site?',
    answer: 'No. Choose a design, add your details and photos, then share your wedding link. QuickWeds handles the polished layout and mobile experience for you.',
  },
  {
    question: 'Can I start free?',
    answer: 'Yes. All templates, the builder, your wedding website, RSVP tools, QR sharing, basic guest tracking, 50 guest emails, and Planner Lite are free. Planner Lite includes starter limits for checklist, budget, supplier, calendar, food, honeymoon, seating, and partner collaboration. Planner Pro unlocks unlimited planning, unlimited guest emails, QR seating, reminders, collaborators, exports, photo tools, and thank-you tools.',
  },
  {
    question: 'Can wedding suppliers join QuickWeds?',
    answer: 'Yes. Wedding businesses can create a supplier profile, submit it for review, and appear in the public supplier directory once approved. Couples can browse suppliers and save directory listings into their planner.',
  },
];

const landingStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'QuickWeds',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: ['https://www.facebook.com/profile.php?id=61587661715324'],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email: 'support@quickweds.site',
          contactType: 'customer support',
          availableLanguage: ['en'],
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'QuickWeds',
      url: siteUrl,
      description: landingPageDescription,
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      inLanguage: 'en',
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#webapp`,
      name: 'QuickWeds',
      url: siteUrl,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      description: landingPageDescription,
      image: heroImageUrl,
      screenshot: heroImageUrl,
      featureList: [
        'Free wedding website builder',
        'Digital wedding invitations',
        'RSVP tracking',
        'Guest list management',
        'Wedding seating chart and QR seat finder',
        'Wedding budget tracker',
        'Supplier and vendor planning',
        'Guest photo sharing portal',
        'Wedding day QR kit',
        'Thank-you email and card builder',
      ],
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Wedding Website',
          price: '0',
          priceCurrency: 'USD',
          url: `${siteUrl}/builder`,
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Planner Pro',
          price: '15',
          priceCurrency: 'USD',
          url: `${siteUrl}/signup`,
          availability: 'https://schema.org/InStock',
        },
      ],
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: landingPageTitle,
      description: landingPageDescription,
      isPartOf: {
        '@id': `${siteUrl}/#website`,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: heroImageUrl,
        width: 1080,
        height: 1080,
      },
      mainEntity: {
        '@id': `${siteUrl}/#webapp`,
      },
      inLanguage: 'en',
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
};

function getJsonLdMarkup(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

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
      <h2 className={landingSectionTitleClass} style={landingTitleStyle}>
        {title} {accent && <Accent>{accent}</Accent>}{afterAccent}
      </h2>
      {body && (
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-text-secondary sm:mt-5 sm:text-lg sm:leading-8">{body}</p>
      )}
    </div>
  );
}

function FeatureMockup({ feature }: { feature: (typeof featureCards)[number] }) {
  const visualImageUrl = 'imageUrl' in feature && feature.imageUrl ? feature.imageUrl : defaultCoreFeatureImageUrl;
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-secondary/70 via-[#fff8f4] to-primary/35">
      <Image
        src={feature.mobileImageUrl}
        alt={`${feature.title} interface preview`}
        fill
        sizes="(max-width: 639px) 90vw, 1px"
        className="object-cover sm:hidden"
      />
      <Image
        src={visualImageUrl}
        alt=""
        fill
        sizes="(max-width: 1023px) 680px, 1px"
        className="hidden object-cover sm:block lg:hidden"
      />
      <div className="absolute -right-10 -top-12 hidden h-40 w-40 rounded-full border-[28px] border-white/30 lg:block" />
      <div className="absolute -bottom-12 -left-8 hidden h-36 w-52 rotate-[-12deg] rounded-[50%] bg-primary/12 blur-[1px] lg:block" />
      <div className="absolute inset-[7%] hidden overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/35 shadow-[0_24px_55px_rgba(82,40,50,0.16)] backdrop-blur-sm lg:block">
        <Image
          src={feature.mobileImageUrl}
          alt={`${feature.title} app preview`}
          fill
          sizes="520px"
          className="object-cover object-center transition duration-500 group-hover:scale-[1.025]"
        />
      </div>
    </div>
  );
}

function AnimatedFeatureCard({
  feature,
  index,
}: {
  feature: (typeof featureCards)[number];
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);
  const isCardInView = useInView(cardRef, {
    amount: 0.15,
    margin: '0px 0px -12% 0px',
    initial: Boolean(reduceMotion),
  });
  const cardIsVisible = Boolean(reduceMotion) || isCardInView;
  const isEvenCard = index % 2 === 0;

  return (
    <motion.article
      ref={cardRef}
      className="group sticky mt-10 overflow-hidden rounded-[1.6rem] border border-[#d9c9bf] bg-white shadow-[0_18px_42px_rgba(82,40,50,0.12)] first:mt-0 sm:mt-12 sm:rounded-[2rem] lg:mt-8 lg:rounded-[2.25rem] lg:border-[#d8cbc3] lg:shadow-[0_20px_50px_rgba(82,40,50,0.1)]"
      initial={reduceMotion ? false : { y: 92, rotate: isEvenCard ? -0.8 : 0.8, scale: 0.965, opacity: 0.62 }}
      animate={cardIsVisible ? { y: 0, rotate: 0, scale: 1, opacity: 1 } : { y: 92, rotate: isEvenCard ? -0.8 : 0.8, scale: 0.965, opacity: 0.62 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        top: `${110 + index * 4}px`,
        zIndex: index + 10,
      }}
    >
      <div className="flex min-h-[520px] flex-col gap-0 p-3 min-[390px]:min-h-[560px] sm:min-h-[620px] sm:p-4 lg:grid lg:min-h-[450px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-5 lg:p-5">
        <motion.div
          className={`relative aspect-[16/9] w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-secondary/70 to-primary/45 sm:rounded-[1.6rem] lg:aspect-auto lg:h-full lg:min-h-[408px] lg:rounded-[1.75rem] ${isEvenCard ? 'lg:col-start-2' : 'lg:col-start-1'}`}
          initial={reduceMotion ? false : { y: 28, scale: 0.98 }}
          animate={cardIsVisible ? { y: 0, scale: 1 } : { y: 28, scale: 0.98 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <FeatureMockup feature={feature} />
          </motion.div>

        <div className={`relative flex flex-1 flex-col justify-center px-3 pb-4 pt-5 min-[390px]:px-4 sm:px-7 sm:py-8 lg:row-start-1 lg:px-8 lg:py-9 ${isEvenCard ? 'lg:col-start-1' : 'lg:col-start-2'}`}>
          <div className="mb-8 hidden w-full justify-center lg:flex" aria-hidden="true">
            <feature.icon className="h-[138px] w-[138px] stroke-[1.35] text-primary" />
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full border-2 border-foreground text-[12px] font-black text-foreground sm:h-11 sm:w-11 sm:text-sm lg:h-12 lg:w-12 lg:border-primary/20 lg:bg-primary/[0.07] lg:text-primary">
              {feature.number}
            </span>
            <h3
              className="[font-family:var(--font-montserrat)] text-[2rem] font-black leading-[1.02] tracking-[-0.035em] text-foreground min-[390px]:text-[2.25rem] sm:text-[2.75rem] lg:max-w-[25rem] lg:text-[3rem]"
              style={landingTitleStyle}
            >
              {feature.title}
            </h3>
          </div>
          <p className="mt-3 text-[13px] font-semibold leading-6 text-text-secondary sm:mt-5 sm:text-base sm:leading-7">{feature.body}</p>
          <ul className="mt-4 grid gap-2 sm:mt-6 sm:gap-3 lg:hidden">
            {feature.bullets.map((bullet, bulletIndex) => (
              <li key={bullet} className="flex items-center gap-2.5 text-[12px] font-black leading-5 text-foreground sm:text-[14px]">
                <span className="h-2 w-2 flex-none rounded-full bg-primary" style={{ opacity: 1 - bulletIndex * 0.14 }} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
            {feature.tags.map((tag, tagIndex) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black tracking-[0.02em] ${
                  tagIndex % 3 === 0
                    ? 'border-primary/15 bg-primary/[0.07] text-primary'
                    : tagIndex % 3 === 1
                      ? 'border-secondary/35 bg-secondary/20 text-foreground'
                      : 'border-accent/25 bg-[#fff8e9] text-foreground'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function FallingFeaturePill({
  pill,
  index,
  scrollY,
}: {
  pill: (typeof fallingFeaturePills)[number];
  index: number;
  scrollY: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [needsJsScrollFallback, setNeedsJsScrollFallback] = useState(false);
  const isMobileRef = useRef(false);
  const viewportHeightRef = useRef(0);
  const pillRef = useRef<HTMLDivElement>(null);
  const Icon = pill.icon;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const updateViewport = () => {
      isMobileRef.current = mediaQuery.matches;
      setIsMobile(mediaQuery.matches);
      setNeedsJsScrollFallback(mediaQuery.matches && !CSS.supports('animation-timeline: scroll(root block)'));
      viewportHeightRef.current = window.innerHeight;
    };

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    window.addEventListener('resize', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!needsJsScrollFallback) return;

    const updateFallbackTransform = () => {
      const animationStart = 984 - window.innerHeight * 0.52 + pill.delay * 180;
      const fallDistance = 520 + ((index * 47) % 5) * 32;
      const progress = Math.max(0, Math.min(1, (window.scrollY - animationStart) / fallDistance));
      const easedProgress = 1 - Math.pow(1 - progress, 2.7);
      const x = pill.mobileStartX
        + (pill.mobileEndX - pill.mobileStartX) * progress
        + Math.sin(progress * Math.PI) * pill.drift;
      const y = pill.mobileStartY + (pill.mobileEndY - pill.mobileStartY) * easedProgress;
      const rotate = pill.rotate * progress
        + Math.sin(progress * Math.PI) * (index % 2 === 0 ? 4 : -4);
      const scale = 0.94 + Math.sin(progress * Math.PI) * 0.05;

      pillRef.current?.style.setProperty(
        '--qw-pill-mobile-transform',
        `translate3d(${x}vw, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
      );
    };

    updateFallbackTransform();
    window.addEventListener('scroll', updateFallbackTransform, { passive: true });
    window.addEventListener('resize', updateFallbackTransform, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateFallbackTransform);
      window.removeEventListener('resize', updateFallbackTransform);
    };
  }, [index, needsJsScrollFallback, pill]);

  const mobileDelayDistance = Number((pill.delay * 180).toFixed(1));
  const mobileFallDistance = 520 + ((index * 47) % 5) * 32;
  const delayedProgress = useTransform(scrollY, (latest) => {
    const isMobile = isMobileRef.current;
    const animationStart = isMobile ? 984 - viewportHeightRef.current * 0.52 : 300;
    const delayDistance = isMobile ? mobileDelayDistance : pill.delay * 280;
    const fallDistance = isMobile ? mobileFallDistance : 760;

    return Math.max(0, Math.min(1, (latest - animationStart - delayDistance) / fallDistance));
  });
  const pillX = useTransform(delayedProgress, (progress) => {
    const startX = isMobileRef.current ? pill.mobileStartX : pill.startX;
    const endX = isMobileRef.current ? pill.mobileEndX : pill.endX;
    const wave = Math.sin(progress * Math.PI) * pill.drift;
    return `${startX + (endX - startX) * progress + wave}vw`;
  });
  const pillY = useTransform(delayedProgress, (progress) => {
    const startY = isMobileRef.current ? pill.mobileStartY : pill.startY;
    const endY = isMobileRef.current ? pill.mobileEndY : pill.endY;
    const eased = 1 - Math.pow(1 - progress, 2.7);
    return `${startY + (endY - startY) * eased}px`;
  });
  const pillRotate = useTransform(delayedProgress, (progress) => pill.rotate * progress + Math.sin(progress * Math.PI) * (index % 2 === 0 ? 4 : -4));
  const pillOpacity = useTransform(delayedProgress, (progress) => {
    if (progress < 0.04) {
      return isMobileRef.current ? 0.88 + progress * 3 : 0.58 + progress * 7;
    }

    if (progress > 0.88) {
      return Math.max(0.68, 1 - (progress - 0.88) * 1.1);
    }

    return 1;
  });
  const pillScale = useTransform(delayedProgress, (progress) => 0.94 + Math.sin(progress * Math.PI) * 0.05);
  const toneClass =
    pill.tone === 'gold'
      ? 'border-accent/90 bg-[#fffaf0] text-foreground ring-accent/35 shadow-accent/25'
      : pill.tone === 'rose'
        ? 'border-primary/75 bg-white text-foreground ring-primary/30 shadow-primary/25'
        : 'border-primary/60 bg-neutral text-foreground ring-primary/25 shadow-primary/20';
  const iconClass =
    pill.tone === 'gold'
      ? 'border border-accent/25 bg-accent/15 text-accent'
      : pill.tone === 'rose'
        ? 'border border-primary/20 bg-primary/10 text-primary'
        : 'border border-primary/15 bg-white text-primary';
  const staticTop = `${pill.mobileStartY}px`;
  const staticLeft = `${8 + (index * 17) % 78}%`;
  const mobileMidY = pill.mobileStartY + (pill.mobileEndY - pill.mobileStartY) * 0.72;
  const mobileDrift = (index % 2 === 0 ? 1 : -1) * (2.6 + (index % 3) * 1.1);
  const mobileRotationDirection = index % 2 === 0 ? 1 : -1;
  const pillStyle = {
    '--qw-pill-start-x': `${pill.startX}vw`,
    '--qw-pill-start-y': `${pill.startY}px`,
    '--qw-pill-mobile-start-x': `${pill.mobileStartX}vw`,
    '--qw-pill-mobile-start-y': `${pill.mobileStartY}px`,
    '--qw-pill-mid-x': `${(pill.startX + pill.endX) / 2 + pill.drift}vw`,
    '--qw-pill-mid-y': `${pill.endY}px`,
    '--qw-pill-end-x': `${pill.endX}vw`,
    '--qw-pill-end-y': `${pill.endY}px`,
    '--qw-pill-mobile-end-x': `${pill.mobileEndX}vw`,
    '--qw-pill-mobile-end-y': `${pill.mobileEndY}px`,
    '--qw-pill-mobile-drift-x': `${Number(mobileDrift.toFixed(1))}vw`,
    '--qw-pill-mobile-rebound-x': `${Number((-mobileDrift * 0.18).toFixed(2))}vw`,
    '--qw-pill-mobile-mid-y': `${Number(mobileMidY.toFixed(1))}px`,
    '--qw-pill-mobile-overshoot-y': `${pill.mobileEndY + 14 + (index % 3) * 2}px`,
    '--qw-pill-mobile-rebound-y': `${pill.mobileEndY - 6 - (index % 2) * 2}px`,
    '--qw-pill-mobile-start-rotate': `${Number((-pill.rotate * 0.16).toFixed(1))}deg`,
    '--qw-pill-mobile-mid-rotate': `${Number((pill.rotate * 0.58 + mobileRotationDirection * 2.2).toFixed(1))}deg`,
    '--qw-pill-mobile-overshoot-rotate': `${Number((pill.rotate + mobileRotationDirection * 2.4).toFixed(1))}deg`,
    '--qw-pill-mobile-rebound-rotate': `${Number((pill.rotate - mobileRotationDirection * 1.2).toFixed(1))}deg`,
    '--qw-pill-rotate': `${pill.rotate}deg`,
    '--qw-pill-mobile-animation-start': `calc(984px - 52svh + ${mobileDelayDistance}px)`,
    '--qw-pill-mobile-animation-end': `calc(${984 + mobileFallDistance}px - 52svh + ${mobileDelayDistance}px)`,
    '--qw-pill-animation-start': `${Number((300 + pill.delay * 220).toFixed(1))}px`,
    '--qw-pill-animation-end': `${Number((1320 + pill.delay * 120).toFixed(1))}px`,
    ...(needsJsScrollFallback ? {} : {
      '--qw-pill-mobile-transform': `translate3d(${pill.mobileStartX}vw, ${pill.mobileStartY}px, 0) rotate(0deg) scale(0.94)`,
    }),
    x: isMobile ? undefined : reduceMotion ? '-50%' : pillX,
    y: isMobile ? undefined : reduceMotion ? staticTop : pillY,
    left: reduceMotion ? staticLeft : '50%',
    rotate: isMobile ? undefined : reduceMotion ? pill.rotate * 0.45 : pillRotate,
    opacity: reduceMotion ? 0.92 : pillOpacity,
    scale: isMobile ? undefined : reduceMotion ? 1 : pillScale,
  } satisfies FallingFeaturePillStyle;

  return (
    <motion.div
      ref={pillRef}
      data-qw-feature-pill={pill.title}
      className={`qw-falling-feature-pill ${needsJsScrollFallback ? 'qw-mobile-js-scroll-fallback' : ''} absolute left-1/2 top-0 z-20 inline-flex min-h-[36px] w-[22vw] max-w-[90px] origin-center items-center justify-center gap-1 rounded-xl border-2 px-1 py-1 shadow-[0_18px_42px_rgba(82,40,50,0.22),0_4px_12px_rgba(192,128,129,0.22)] ring-[3px] ring-offset-1 ring-offset-white/80 backdrop-blur-md before:pointer-events-none before:absolute before:inset-[2px] before:rounded-[inherit] before:border before:border-white/90 before:shadow-[inset_0_1px_0_rgba(255,255,255,1)] before:content-[''] will-change-transform sm:min-h-[44px] sm:w-auto sm:max-w-none sm:justify-start sm:gap-2.5 sm:rounded-full sm:px-3.5 sm:py-2 ${toneClass}`}
      style={pillStyle}
      aria-hidden="true"
    >
      <span className={`qw-feature-pill-icon grid h-[22px] w-[22px] flex-none place-items-center rounded-full sm:h-8 sm:w-8 ${iconClass}`}>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      </span>
      <span className="qw-feature-pill-label text-center text-[9.5px] font-black leading-[1.05] sm:whitespace-nowrap sm:text-left sm:text-sm sm:leading-none">{pill.title}</span>
    </motion.div>
  );
}

function FeaturePillBridge() {
  const bridgeRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [driverReady, setDriverReady] = useState(false);

  useEffect(() => {
    // Child pill effects detect viewport/CSS support before the bridge tells
    // tests and assistive tooling that the scroll driver is ready.
    const frame = window.requestAnimationFrame(() => setDriverReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={bridgeRef} data-qw-pill-driver-ready={driverReady ? 'true' : 'false'} className="qw-feature-pill-bridge pointer-events-none absolute inset-x-0 top-[892px] z-30 h-[760px] overflow-visible sm:top-[calc(100svh+3rem)] sm:h-[800px] lg:top-[810px]" aria-hidden="true">
      <div className="relative mx-auto h-full max-w-7xl overflow-visible px-4 sm:px-6">
        {fallingFeaturePills.map((pill, index) => (
          <FallingFeaturePill key={pill.title} pill={pill} index={index} scrollY={scrollY} />
        ))}
      </div>
    </div>
  );
}

function SidebarDot({ index, scrollYProgress, totalCards, title }: { index: number; scrollYProgress: MotionValue<number>; totalCards: number; title: string }) {
  const segment = 1 / Math.max(totalCards - 1, 1);
  const center = index * segment;
  
  let inputRange: number[];
  let scaleOutput: number[];
  let opacityOutput: number[];

  if (index === 0) {
    inputRange = [0, segment / 2];
    scaleOutput = [1.3, 0.5];
    opacityOutput = [1, 0.4];
  } else if (index === totalCards - 1) {
    inputRange = [center - segment / 2, 1];
    scaleOutput = [0.5, 1.3];
    opacityOutput = [0.4, 1];
  } else {
    inputRange = [center - segment / 2, center, center + segment / 2];
    scaleOutput = [0.5, 1.3, 0.5];
    opacityOutput = [0.4, 1, 0.4];
  }
  
  const scale = useTransform(scrollYProgress, inputRange, scaleOutput);
  const opacity = useTransform(scrollYProgress, inputRange, opacityOutput);

  return (
    <div className="group relative flex w-full items-center justify-center pointer-events-auto cursor-pointer py-1">
      <span className="absolute right-6 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-x-2 text-[10px] font-bold uppercase tracking-wider text-primary whitespace-nowrap bg-white/95 px-3 py-1.5 rounded-lg shadow-md border border-primary/10">
        {title}
      </span>
      <motion.div 
        style={{ scale, opacity }} 
        className="relative z-10 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white" 
      />
    </div>
  );
}

function CoreFeaturesSidebar({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  return (
    <div className="absolute right-1 top-[15vh] bottom-[15vh] w-8 sm:right-3 sm:w-12 lg:right-6 lg:top-[10vh] lg:bottom-[10vh] lg:w-24 pointer-events-none z-50">
      <div className="sticky top-[40vh] lg:top-[35vh] flex flex-col items-center">
        <div className="flex flex-col items-center gap-1.5 lg:gap-2 mb-2 lg:mb-3 opacity-60 lg:opacity-50 text-primary">
          <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-[0.25em] [writing-mode:vertical-lr] rotate-180">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
          </motion.div>
        </div>

        <div className="relative flex h-[240px] lg:h-[360px] w-6 flex-col items-center justify-between">
          <div className="absolute bottom-0 top-0 w-[2px] rounded-full bg-primary/20 lg:bg-primary/20" />
          <motion.div 
            className="absolute bottom-0 top-0 w-[2px] origin-top rounded-full bg-primary"
            style={{ scaleY: scrollYProgress }}
          />
          {featureCards.map((feature, i) => (
            <SidebarDot key={i} index={i} scrollYProgress={scrollYProgress} totalCards={featureCards.length} title={feature.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CoreFeaturesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={containerRef} id="features" className="relative sticky-feature-section -mt-28 overflow-visible bg-neutral px-3 pb-12 pt-44 sm:mt-0 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-16 lg:pt-28">
      <CoreFeaturesSidebar scrollYProgress={scrollYProgress} />
      <div className="mx-auto max-w-[1380px] relative">
        <div className="relative z-40 mx-auto max-w-4xl text-center">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-primary sm:text-xs">Core features</p>
          <h2 className={`${landingSectionTitleClass} mx-auto max-w-[21rem] sm:max-w-4xl`} style={landingTitleStyle}>
            QuickWeds is designed <Accent>to make</Accent> wedding planning feel calmer than spreadsheets.
          </h2>
        </div>

        <div className="h-[140px] min-[390px]:h-[170px] sm:h-[450px] lg:h-[420px]" aria-hidden="true" />

        <div className="sticky-feature-stack mx-auto w-full max-w-full pb-20 sm:max-w-[860px] sm:pb-32 lg:max-w-[1260px] lg:pb-24">
          {featureCards.map((feature, index) => (
            <AnimatedFeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewFeatureDeckCard({
  feature,
  index,
  total,
  scrollYProgress,
}: {
  feature: (typeof newFeatureCards)[number];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const segmentCount = Math.max(total - 1, 1);
  const cardPosition = useTransform(scrollYProgress, (progress) => index - progress * segmentCount);
  const cardX = useTransform(cardPosition, (position) => {
    if (position < -1) {
      return '-132%';
    }

    if (position > 1) {
      return `${132 + Math.min(position - 1, 3) * 18}%`;
    }

    return `${position * 108}%`;
  });
  const visualX = useTransform(cardPosition, (position) => `${Math.max(-18, Math.min(18, position * 18))}%`);
  const cardRotate = useTransform(cardPosition, (position) => Math.max(-1.4, Math.min(1.4, position * 1.4)));
  const cardOpacity = useTransform(cardPosition, (position) => {
    const distance = Math.abs(position);

    if (distance <= 0.12) {
      return 1;
    }

    if (distance <= 1) {
      return 0.48 + (1 - distance) * 0.3;
    }

    return Math.max(0, 0.18 - (distance - 1) * 0.12);
  });
  const cardScale = useTransform(cardPosition, (position) => {
    const distance = Math.min(Math.abs(position), 1);
    return 1 - distance * 0.08;
  });
  const cardShadow = useTransform(cardPosition, (position) => {
    const distance = Math.min(Math.abs(position), 1);
    const shadowOpacity = 0.2 - distance * 0.1;
    return `0 24px 62px rgba(82,40,50,${shadowOpacity})`;
  });
  const borderColor = useTransform(cardPosition, (position) => (Math.abs(position) <= 0.18 ? 'rgba(211,103,119,0.42)' : 'rgba(217,201,191,0.88)'));
  const cardZIndex = useTransform(cardPosition, (position) => Math.round(100 - Math.min(Math.abs(position), 4) * 10));
  const Icon = feature.icon;

  return (
    <motion.article
      className="group absolute inset-0 overflow-hidden rounded-[1.6rem] border border-[#d9c9bf] bg-white p-3 shadow-[0_18px_42px_rgba(82,40,50,0.12)] sm:rounded-[2rem] sm:p-4"
      style={{
        x: reduceMotion ? '0%' : cardX,
        rotate: reduceMotion ? 0 : cardRotate,
        opacity: reduceMotion ? 1 : cardOpacity,
        scale: reduceMotion ? 1 : cardScale,
        boxShadow: reduceMotion ? '0 24px 62px rgba(82,40,50,0.16)' : cardShadow,
        borderColor: reduceMotion ? 'rgba(211,103,119,0.42)' : borderColor,
        zIndex: reduceMotion ? index + 10 : cardZIndex,
      }}
    >
      <div className="flex h-full flex-col gap-0">
        <motion.div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-secondary/70 to-primary/45 sm:rounded-[1.6rem]"
          style={{
            x: reduceMotion ? '0%' : visualX,
          }}
        >
          <Image
            src={newFeaturesImageUrl}
            alt={`${feature.title} preview`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 680px, 760px"
            quality={85}
            className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-lg shadow-primary/10 ring-1 ring-white/70 backdrop-blur sm:left-5 sm:top-5 sm:h-12 sm:w-12">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </motion.div>

        <div className="flex flex-1 flex-col justify-start px-3 pb-3 pt-4 min-[390px]:px-4 sm:justify-center sm:px-7 sm:py-8 lg:px-10">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full border-2 border-foreground text-[11px] font-black text-foreground sm:h-11 sm:w-11 sm:text-sm">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-serif text-[1.35rem] font-black leading-[1.05] text-foreground min-[390px]:text-[1.5rem] sm:text-[2.15rem] lg:text-[2.35rem]">{feature.title}</h3>
          </div>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-text-secondary sm:mt-5 sm:text-base sm:leading-7">{feature.body}</p>
          <div className="mt-3 inline-flex w-fit rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-primary sm:mt-5 sm:text-[10px]">
            {feature.meta}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function DeckProgressSegment({
  scrollYProgress,
  index,
  total,
}: {
  scrollYProgress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const segment = 1 / Math.max(total - 1, 1);
  const center = index * segment;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const inputRange = isFirst
    ? [0, segment / 2]
    : isLast
      ? [center - segment / 2, 1]
      : [center - segment / 2, center, center + segment / 2];
  const widthOutput = isFirst
    ? ["24px", "6px"]
    : isLast
      ? ["6px", "24px"]
      : ["6px", "24px", "6px"];
  const opacityOutput = isFirst
    ? [1, 0.3]
    : isLast
      ? [0.3, 1]
      : [0.3, 1, 0.3];
  const width = useTransform(scrollYProgress, inputRange, widthOutput);
  const opacity = useTransform(scrollYProgress, inputRange, opacityOutput);

  return <motion.div style={{ width, opacity }} className="h-1.5 rounded-full bg-primary" />;
}

function DeckProgressIndicator({ scrollYProgress, total }: { scrollYProgress: MotionValue<number>; total: number }) {
  return (
    <div className="absolute -bottom-6 sm:-bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-1.5 z-50">
      {Array.from({ length: total }).map((_, index) => (
        <DeckProgressSegment key={index} scrollYProgress={scrollYProgress} index={index} total={total} />
      ))}
    </div>
  );
}

function NewFeaturesSection() {
  const deckRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: deckRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section className="sticky-feature-section overflow-visible bg-white px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-8">
      <div className="mx-auto max-w-6xl overflow-visible">
        <SectionHeading
          eyebrow="New in QuickWeds"
          title="More ways to keep the"
          accent="real plan"
          afterAccent=" organized."
          body="Recent tools help couples move beyond the wedding website into entourage coordination, presets, analytics, guest photos, event-day QR workflows, and post-wedding follow-up."
        />
        <div ref={deckRef} className="relative mx-auto max-w-[430px] overflow-visible sm:max-w-[620px] lg:max-w-[760px]" style={{ height: `${newFeatureCards.length * 82}vh` }}>
          <div className="sticky top-[104px] h-[500px] max-h-[calc(100svh-170px)] min-h-[430px] overflow-visible sm:top-[112px] sm:h-[calc(100svh-140px)] sm:min-h-[560px] sm:max-h-[720px]">
            {newFeatureCards.map((feature, index) => (
              <NewFeatureDeckCard
                key={feature.title}
                feature={feature}
                index={index}
                total={newFeatureCards.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
            
            <DeckProgressIndicator scrollYProgress={scrollYProgress} total={newFeatureCards.length} />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <PrimaryCta>Explore QuickWeds Free</PrimaryCta>
          <Link href="/user-guide" className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary sm:w-auto">
            Read Feature Guides
          </Link>
          <p className="max-w-md text-sm font-semibold leading-6 text-text-secondary">
            Start with your website and RSVP flow, then unlock the full planning workspace when you need it.
          </p>
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
    <section id="contact" className="px-4 py-12 sm:px-6 sm:py-16">
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

function HeroCloudBackground() {
  const clouds = [
    'left-[-2rem] top-[24%] h-16 w-36 opacity-75 sm:left-[6%] sm:top-[28%] sm:h-20 sm:w-44 lg:left-[5%] lg:top-[32%]',
    'right-[-3rem] top-[38%] h-14 w-40 opacity-65 sm:right-[7%] sm:top-[30%] sm:h-16 sm:w-48 lg:right-[8%] lg:top-[22%]',
    'left-[13%] bottom-[31%] h-12 w-28 opacity-55 sm:left-[20%] sm:bottom-[25%] sm:h-14 sm:w-36 lg:left-[45%] lg:bottom-[24%]',
    'right-[12%] bottom-[20%] h-10 w-28 opacity-50 sm:right-[24%] sm:bottom-[17%] sm:h-12 sm:w-32 lg:right-[36%] lg:bottom-[16%]',
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-[8%] top-[14%] h-24 w-24 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute right-[-2rem] top-[10%] h-40 w-40 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute bottom-[18%] left-[-4rem] h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      {clouds.map((cloud, index) => (
        <motion.div
          key={cloud}
          className={`absolute rounded-full bg-white/60 shadow-[0_18px_55px_rgba(255,255,255,0.35)] ${cloud}`}
          animate={{ y: [0, index % 2 === 0 ? -8 : 8, 0] }}
          transition={{ duration: 8 + index, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="absolute -top-5 left-5 h-14 w-14 rounded-full bg-white/70 sm:h-16 sm:w-16" />
          <span className="absolute -top-7 left-16 h-20 w-20 rounded-full bg-white/65 sm:left-20 sm:h-24 sm:w-24" />
          <span className="absolute -top-4 right-6 h-12 w-12 rounded-full bg-white/65 sm:h-14 sm:w-14" />
        </motion.div>
      ))}
    </div>
  );
}

function HeroBottomClouds({ sectionDivider = false }: { sectionDivider?: boolean }) {
  const cloudColorClass = sectionDivider ? 'text-white' : 'text-neutral';
  const cloudBackgroundClass = sectionDivider ? 'bg-white' : 'bg-neutral';

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 overflow-hidden ${
        sectionDivider
          ? 'bottom-0 z-20 h-20 sm:h-28'
          : 'bottom-36 z-30 h-28 sm:bottom-14 sm:h-32 lg:bottom-28 lg:h-36'
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        className={`absolute inset-x-0 bottom-0 h-full w-full ${cloudColorClass}`}
        fill="currentColor"
      >
        <path d="M0 86c58-32 124-34 190-9 43-53 129-59 180-8 63-53 156-43 204 18 59-20 128-10 177 29 66-61 171-58 230 8 62-36 146-34 204 7 70-67 184-59 241 18 25-10 53-16 84-16v47H0V86Z" />
      </svg>
      <div className={`absolute bottom-0 left-[-8%] h-24 w-44 rounded-t-full sm:h-32 sm:w-64 ${cloudBackgroundClass}`} />
      <div className={`absolute bottom-0 left-[22%] h-20 w-52 rounded-t-full sm:h-28 sm:w-72 ${cloudBackgroundClass}`} />
      <div className={`absolute bottom-0 right-[14%] h-24 w-56 rounded-t-full sm:h-32 sm:w-80 ${cloudBackgroundClass}`} />
      <div className={`absolute bottom-0 right-[-10%] h-20 w-48 rounded-t-full sm:h-28 sm:w-72 ${cloudBackgroundClass}`} />
    </div>
  );
}

function SectionTopClouds({ fillClass = 'text-neutral', bgClass = 'bg-neutral' }: { fillClass?: string, bgClass?: string } = {}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-8 z-20 h-20 rotate-180 overflow-hidden sm:-top-10 sm:h-28" aria-hidden="true">
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        className={`absolute inset-x-0 bottom-0 h-full w-full ${fillClass}`}
        fill="currentColor"
      >
        <path d="M0 86c58-32 124-34 190-9 43-53 129-59 180-8 63-53 156-43 204 18 59-20 128-10 177 29 66-61 171-58 230 8 62-36 146-34 204 7 70-67 184-59 241 18 25-10 53-16 84-16v47H0V86Z" />
      </svg>
      <div className={`absolute bottom-0 left-[-8%] h-20 w-40 rounded-t-full sm:h-28 sm:w-60 ${bgClass}`} />
      <div className={`absolute bottom-0 left-[28%] h-16 w-44 rounded-t-full sm:h-24 sm:w-64 ${bgClass}`} />
      <div className={`absolute bottom-0 right-[12%] h-20 w-48 rounded-t-full sm:h-28 sm:w-72 ${bgClass}`} />
      <div className={`absolute bottom-0 right-[-10%] h-16 w-40 rounded-t-full sm:h-24 sm:w-60 ${bgClass}`} />
    </div>
  );
}

function FooterCloudLayers() {
  const cloudPath = 'M0 86c58-32 124-34 190-9 43-53 129-59 180-8 63-53 156-43 204 18 59-20 128-10 177 29 66-61 171-58 230 8 62-36 146-34 204 7 70-67 184-59 241 18 25-10 53-16 84-16v47H0V86Z';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 overflow-hidden sm:h-40" aria-hidden="true">
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-5 h-full w-full translate-x-[-3%] scale-x-110 text-[#f8dce2]"
        fill="currentColor"
      >
        <path d={cloudPath} />
      </svg>
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[-1rem] h-[92%] w-full translate-x-[3%] scale-x-110 text-primary/35"
        fill="currentColor"
      >
        <path d={cloudPath} />
      </svg>
      <div className="absolute bottom-0 left-[-5%] h-16 w-36 rounded-t-full bg-primary/35 sm:h-20 sm:w-52" />
      <div className="absolute bottom-0 left-[32%] h-14 w-44 rounded-t-full bg-primary/35 sm:h-20 sm:w-64" />
      <div className="absolute bottom-0 right-[-4%] h-16 w-40 rounded-t-full bg-primary/35 sm:h-24 sm:w-60" />
    </div>
  );
}

function LandingHero({ onDemoClick }: { onDemoClick: () => void }) {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroVisualScale = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1.025, 1.01]);
  const heroVisualY = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const heroVisualRotate = useTransform(scrollYProgress, [0, 0.55, 1], [0, 0.35, 0]);

  return (
    <section ref={heroRef} className="relative isolate min-h-[1080px] overflow-hidden bg-gradient-to-b from-[#f7a9ba] via-[#f8c8d2] to-[#fde9ed] px-5 pb-28 pt-7 text-center sm:min-h-[1020px] sm:px-6 sm:pb-32 sm:pt-14 lg:min-h-[820px] lg:px-8 lg:pb-36 lg:pt-20">
      <HeroCloudBackground />
      <div className="relative mx-auto grid w-full min-w-0 max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10 lg:text-left">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative z-40 mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
          <div className="mx-auto mb-4 hidden max-w-[min(100%,22rem)] items-center justify-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur-md sm:mb-6 sm:inline-flex sm:max-w-full sm:px-4 sm:text-xs sm:tracking-[0.22em] lg:mx-0 lg:mb-4 lg:px-3 lg:py-1.5 lg:text-[10px]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="truncate">Complete wedding planning system</span>
          </div>
          <h1 className={`${landingHeroTitleClass} mx-auto max-w-[12.5ch] text-center text-white drop-shadow-[0_3px_14px_rgba(122,90,97,0.22)] sm:max-w-3xl lg:mx-0 lg:text-left lg:text-[4.65rem]`} style={landingTitleStyle}>
            Plan your wedding in one <span className="text-primary">Smart system.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[20rem] text-center text-[14px] font-bold leading-6 text-white/90 drop-shadow-[0_2px_10px_rgba(122,90,97,0.16)] min-[390px]:max-w-[21rem] sm:mt-6 sm:max-w-[28rem] sm:text-xl sm:leading-8 lg:mx-0 lg:mt-4 lg:text-left lg:text-lg lg:leading-7">
            Build your wedding website, track RSVPs, and keep every detail beautifully organized.
          </p>
          <div className="mt-5 hidden items-center justify-start gap-2 lg:flex">
            <Link
              href="/builder"
              className="group inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-1.5 text-center text-xs font-black text-white shadow-xl shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Create Your Free Wedding Site
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={onDemoClick}
              className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-white/75 bg-white/30 px-5 py-1.5 text-xs font-black text-white shadow-lg shadow-primary/10 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-white hover:bg-white/45 hover:shadow-xl hover:shadow-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              View Demo
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="relative z-20 mx-auto flex w-full min-w-0 max-w-[44rem] flex-col items-center lg:max-w-[46rem]"
        >
          <div className="mx-auto mb-4 flex w-full max-w-[21rem] flex-col items-center justify-center gap-2 sm:mb-5 sm:w-auto sm:max-w-none sm:flex-row lg:hidden">
            <Link
              href="/builder"
              className="group inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-center text-xs font-black text-white shadow-xl shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:w-auto sm:px-6 sm:text-sm"
            >
              Create Your Free Wedding Site
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={onDemoClick}
              className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-white/75 bg-white/30 px-5 py-2 text-xs font-black text-white shadow-lg shadow-primary/10 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-white hover:bg-white/45 hover:shadow-xl hover:shadow-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:w-auto sm:px-6 sm:text-sm"
            >
              View Demo
            </button>
          </div>
          <motion.div
            className="group will-change-transform"
            style={reduceMotion ? undefined : { scale: heroVisualScale, y: heroVisualY, rotate: heroVisualRotate }}
          >
            <Image
              src={heroImageUrl}
              alt="QuickWeds cute 3D wedding planning hero illustration"
              width={1200}
              height={900}
              priority
              sizes="(max-width: 640px) 112vw, (max-width: 1024px) 820px, 860px"
              className="h-auto !w-[112vw] !max-w-none object-contain drop-shadow-[0_30px_55px_rgba(209,108,120,0.25)] transition-transform duration-500 ease-out group-hover:scale-[1.015] sm:!w-[112%] sm:max-h-[620px] lg:!w-[118%] lg:max-h-[680px]"
            />
          </motion.div>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-neutral sm:h-44 lg:h-36" aria-hidden="true" />
      <HeroBottomClouds />
    </section>
  );
}

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasWeddingSite, setHasWeddingSite] = useState(false);
  const { user, isAdmin, logout } = useAuth();
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
  const navigateToSection = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    closeMobileMenu();

    const target = document.getElementById(sectionId);
    if (!target) return;

    window.history.pushState(null, '', `#${sectionId}`);
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  };
  const openDemo = () => {
    setIsDemoOpen(true);
    closeMobileMenu();
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-neutral text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getJsonLdMarkup(landingStructuredData) }}
      />
      <nav className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-0">
        <div className="mobile-safe-px mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-2 rounded-full border border-white/80 bg-[#fffaf7]/90 px-3 shadow-[0_10px_35px_rgba(87,55,62,0.10)] backdrop-blur-xl sm:h-20 sm:w-[94%] sm:gap-4 sm:px-8 lg:px-10">
          <Link href="/" className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5" aria-label="QuickWeds home">
            <Image
              src="/icon.png"
              alt="QuickWeds Logo"
              width={48}
              height={48}
              className="h-8 w-8 rounded-xl object-contain shadow-xs transition-transform group-hover:scale-105 min-[390px]:h-9 min-[390px]:w-9 sm:h-11 sm:w-11"
              priority
            />
            <span className="font-serif text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary min-[390px]:text-xl sm:text-2xl">
              QuickWeds
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            <a href="#features" onClick={(event) => navigateToSection(event, 'features')} className={navItemClass}>Features</a>
            <a href="#templates" onClick={(event) => navigateToSection(event, 'templates')} className={navItemClass}>Templates</a>
            <Link href="/suppliers" className={navItemClass}>Directory</Link>
            <button type="button" onClick={openDemo} className={navItemClass}>Demo</button>
            <a href="#pricing" onClick={(event) => navigateToSection(event, 'pricing')} className={navItemClass}>Pricing</a>
            <a href="#contact" onClick={(event) => navigateToSection(event, 'contact')} className={navItemClass}>Contact</a>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
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
          <div id="landing-mobile-menu" className="mobile-safe-px mx-auto mt-2 max-h-[calc(100dvh-5.5rem)] w-full max-w-[1440px] overflow-y-auto rounded-[2rem] border border-white/70 bg-[#fffaf7]/92 px-4 py-4 shadow-[0_16px_45px_rgba(87,55,62,0.14)] backdrop-blur-xl sm:w-[94%] lg:hidden">
            <div className="mx-auto grid gap-2">
              <a
                href="#features"
                onClick={(event) => navigateToSection(event, 'features')}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Features
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#templates"
                onClick={(event) => navigateToSection(event, 'templates')}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                Templates
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                onClick={(event) => navigateToSection(event, 'pricing')}
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
                onClick={(event) => navigateToSection(event, 'faq')}
                className="flex min-h-[48px] items-center justify-between rounded-2xl bg-neutral px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary"
              >
                FAQ
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#contact"
                onClick={(event) => navigateToSection(event, 'contact')}
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

      <main className="qw-landing-page bg-[#f7a9ba] pt-16 sm:pt-20">
        <div className="relative overflow-visible">
          <LandingHero onDemoClick={openDemo} />
          <FeaturePillBridge />
          <CoreFeaturesSection />
        </div>

        <section id="templates" className="relative isolate overflow-hidden bg-gradient-to-b from-white via-[#fff8f5] to-[#fbdce3] px-4 py-16 sm:px-6 sm:py-24">
          <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Wedding website templates"
              title="Find the design that feels"
              accent="like your day."
              body="Start with a polished layout, then make it entirely your own with your story, photos, schedule, and RSVP details."
            />

            <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-4">
              {landingTemplatePreviews.slice(0, 4).map((template, index) => (
                <motion.article
                  key={template.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.24), ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <Link
                    href={`/templates`}
                    className="group flex flex-col h-full overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_42px_rgba(87,55,62,0.10)] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_58px_rgba(87,55,62,0.16)] sm:rounded-[1.75rem]"
                    aria-label={`View the ${template.name} template`}
                  >
                    <div className="relative shrink-0 aspect-[4/5] overflow-hidden bg-neutral">
                      <Image
                        src={template.image}
                        alt={`${template.name} wedding website template preview`}
                        fill
                        sizes="(max-width: 639px) calc(50vw - 1rem), (max-width: 1023px) calc(50vw - 2rem), 300px"
                        className="object-cover object-top transition duration-500 group-hover:scale-[1.035]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                      <span className="absolute bottom-2 left-2 hidden items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-primary opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-4 sm:left-4 sm:inline-flex sm:px-3 sm:py-2 sm:text-[10px]">
                        Use this template <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3 sm:flex-row sm:items-start sm:gap-3 sm:p-5">
                      <div className="min-w-0">
                        <p className="truncate text-[8px] font-black uppercase tracking-[0.15em] text-primary/65 sm:text-[10px] sm:tracking-[0.18em]">{template.mood}</p>
                        <h3 className="mt-0.5 font-serif text-[11px] font-bold leading-tight text-foreground sm:mt-1 sm:text-xl">{template.name}</h3>
                      </div>
                      <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1 sm:block sm:h-5 sm:w-5" />
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            <div className="mt-10 text-center sm:mt-12">
              <Link href="/templates" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover sm:px-7 sm:text-base">
                Explore all templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-gradient-to-b from-primary/25 via-[#fbe4e8] to-white px-4 pb-8 pt-20 sm:px-6 sm:pb-16 sm:pt-28">
          <SectionTopClouds fillClass="text-[#fbdce3]" bgClass="bg-[#fbdce3]" />
          <div className="group relative mx-auto flex min-h-[320px] max-w-7xl items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/30 px-6 py-12 shadow-[0_24px_70px_rgba(87,55,62,0.16)] sm:min-h-[500px] sm:rounded-[2.5rem] sm:px-10 sm:py-16">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0.72, scale: 1.035 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/5fb8ca9e-86fb-40cc-9d53-ae8292da501c.png"
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-[center_32%] transition-transform duration-700 ease-out group-hover:scale-[1.04] sm:object-center"
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover:bg-black/20" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-primary/25" aria-hidden="true" />
            <h2
              className="relative z-10 max-w-3xl text-center [font-family:var(--font-montserrat)] text-[clamp(1.65rem,4vw,3.75rem)] font-black leading-[1.04] tracking-[-0.035em] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.45)]"
              style={landingTitleStyle}
            >
              Stress Free and Easy Wedding Planning.
            </h2>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#fbdce3] via-[#fff4f1] to-[#fffaf7] px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24 lg:pt-28">
          <HeroCloudBackground />
          <div className="relative z-10 mx-auto max-w-7xl">
            <motion.div
              className="mx-auto mb-10 max-w-4xl text-center sm:mb-14"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mb-4 inline-flex rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary shadow-sm sm:text-xs">
                Why QuickWeds?
              </p>
              <h2
                className="mx-auto [font-family:var(--font-montserrat)] text-[clamp(2.25rem,5.5vw,4.75rem)] font-black leading-[0.96] tracking-[-0.05em] text-foreground"
                style={landingTitleStyle}
              >
                One simple <Accent>system</Accent> for your entire wedding.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-text-secondary sm:mt-6 sm:text-lg sm:leading-8">
                Plan, organize, and manage every important part of your wedding in one seamless platform.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {solutionFeatureCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  className={`group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_20px_55px_rgba(87,55,62,0.12)] sm:rounded-[2rem] ${
                    index === 2 ? 'sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)] lg:col-span-1 lg:mx-0 lg:w-auto' : ''
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.65, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0.86, filter: 'brightness(0.82)' }}
                    whileInView={{ opacity: 1, filter: 'brightness(1.05)' }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw"
                      className="object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.025] group-hover:brightness-110"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/20 to-transparent" aria-hidden="true" />
                  <h3 className="absolute left-5 right-5 top-5 z-10 [font-family:var(--font-montserrat)] text-xl font-black leading-tight tracking-[-0.025em] text-foreground drop-shadow-[0_1px_8px_rgba(255,255,255,0.8)] sm:left-6 sm:right-6 sm:top-6 sm:text-2xl">
                    {card.title}
                  </h3>
                </motion.article>
              ))}
            </div>
          </div>
          <HeroBottomClouds sectionDivider />
        </section>

        <NewFeaturesSection />

        <section className="bg-white px-4 pb-6 pt-10 sm:px-6 sm:pb-8 sm:pt-12">
          <div className="relative mx-auto max-w-7xl overflow-visible rounded-[1.75rem] border border-secondary/20 bg-gradient-to-br from-[#fffaf4] via-neutral to-primary/5 px-5 pb-5 pt-10 shadow-[0_24px_70px_rgba(87,55,62,0.08)] sm:rounded-[2.5rem] sm:px-10 sm:pb-6 sm:pt-14 lg:px-14 lg:pt-16">
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative mx-auto max-w-4xl text-center">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-primary/70 sm:text-xs sm:tracking-[0.28em]">Supplier directory</p>
              <h2 className={landingSectionTitleClass} style={landingTitleStyle}>Find or list trusted <Accent>wedding suppliers</Accent>.</h2>
              <p className="mt-4 text-[15px] leading-7 text-text-secondary sm:mt-5 sm:text-lg sm:leading-8">
                Couples can browse Philippines-focused venues, photographers, coordinators, caterers, stylists, and more. Wedding businesses can create a profile, submit it for review, and reach couples already planning in QuickWeds.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/suppliers" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover sm:w-auto sm:px-6 sm:text-base">
                  Find Wedding Suppliers
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/supplier/signup" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary/5 sm:w-auto sm:px-6 sm:text-base">
                  List Your Business
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative left-1/2 mt-10 w-screen -translate-x-1/2 overflow-hidden border-y border-primary/20 bg-primary py-3 shadow-lg shadow-primary/20 sm:mt-12 sm:py-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-primary to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-primary to-transparent sm:w-24" />
              <div className="animate-supplier-marquee flex w-max motion-reduce:animate-none">
                {[0, 1, 2].map((copy) => (
                  <div key={copy} className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4" aria-hidden={copy !== 0}>
                    {['Venues', 'Photography', 'Coordination', 'Catering', 'Styling', 'Supplier profiles'].map((item) => (
                      <span key={`${copy}-${item}`} className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full border border-white/60 bg-white/95 px-5 py-2.5 font-serif text-base font-bold text-foreground shadow-sm sm:px-6 sm:text-lg">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {item}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="How it works" title="Set everything up in" accent="minutes" />
            <div className="relative grid gap-4 md:grid-cols-3 md:gap-5">
              <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-12 hidden border-t border-dashed border-primary/25 md:block" />
              {[
                { number: '1', title: 'Create your wedding site', body: 'Choose your look, add your story, schedule, location, and RSVP details.', icon: LayoutDashboard },
                { number: '2', title: 'Share your link with guests', body: 'Send one beautiful link instead of scattered messages and repeated updates.', icon: QrCode },
                { number: '3', title: 'Manage it all from one dashboard', body: 'Track RSVPs, guests, seating, budget, vendors, tasks, photos, and thank-you messages.', icon: ClipboardCheck },
              ].map(({ number, title, body, icon: StepIcon }) => (
                <div key={number} className="relative rounded-[1.5rem] border border-border/80 bg-gradient-to-b from-white to-neutral/70 p-5 pt-6 text-center shadow-[0_16px_42px_rgba(87,55,62,0.06)] sm:rounded-[2rem] sm:p-7 md:text-left">
                  <div className="relative z-10 mx-auto mb-8 h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 md:mx-0">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[1.35rem] bg-primary/20 shadow-inner" aria-hidden="true" />
                    <div className="relative flex h-full w-full items-center justify-center rounded-[1.35rem] border border-white/80 bg-gradient-to-br from-white via-[#fff5ef] to-primary/25 text-primary shadow-[0_14px_28px_rgba(192,128,129,0.28),inset_0_1px_0_rgba(255,255,255,0.9)]">
                      <StepIcon className="h-8 w-8 drop-shadow-[0_3px_3px_rgba(192,128,129,0.24)] sm:h-9 sm:w-9" strokeWidth={2.2} />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-black text-white shadow-md">
                        {number}
                      </span>
                    </div>
                  </div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Step {number}</p>
                  <h3 className="mb-3 font-serif text-xl font-bold leading-tight sm:text-2xl">{title}</h3>
                  <p className="text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-[#f7a9ba] px-4 pb-24 pt-12 sm:px-6 sm:pb-32 sm:pt-16">
          <HeroCloudBackground />
          <div className="relative z-10 mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Couple stories"
              title="Planning feels lighter when everything is"
              accent="together."
              body="QuickWeds is built for couples who want a beautiful guest experience and a calm planning dashboard behind it."
            />
            <div className="rounded-[1.75rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-secondary/10 p-3 shadow-[0_24px_70px_rgba(87,55,62,0.07)] sm:rounded-[2.5rem] sm:p-6 lg:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <article key={testimonial.names} className={`relative flex min-h-full flex-col overflow-hidden rounded-[1.4rem] border bg-white p-5 text-left shadow-[0_14px_38px_rgba(87,55,62,0.07)] sm:rounded-[2rem] sm:p-7 ${index === 1 ? 'border-primary/20 md:-translate-y-3' : 'border-border/80'}`}>
                    <div className="absolute right-5 top-4 font-serif text-6xl font-bold leading-none text-primary/[0.07]" aria-hidden="true">“</div>
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 text-secondary" aria-label="5 out of 5 stars">
                        {[0, 1, 2, 3, 4].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-primary/50">Story {String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <Quote className="mb-4 h-8 w-8 text-primary/25" />
                    <p className="flex-1 text-[15px] font-semibold leading-7 text-foreground sm:text-base sm:leading-8">&quot;{testimonial.quote}&quot;</p>
                    <div className="mt-7 flex items-center gap-3 border-t border-border/80 pt-5">
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
                        {testimonial.names.split(' ').filter((name) => name !== '&').map((name) => name[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-serif text-xl font-bold text-foreground">{testimonial.names}</p>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-primary/70">{testimonial.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <HeroBottomClouds sectionDivider />
        </section>

        <section className="bg-white px-4 py-8 sm:px-6 sm:py-10">
          <div className="relative mx-auto min-h-[480px] max-w-7xl overflow-hidden rounded-[1.5rem] border border-border bg-foreground sm:min-h-[420px] sm:rounded-[2rem]">
            <picture>
              <source media="(min-width: 640px)" srcSet={joySectionDesktopImageUrl} />
              <img
                src={joySectionMobileImageUrl}
                alt="QuickWeds planning experience preview"
                className="absolute inset-0 h-full w-full object-cover object-center opacity-70 sm:opacity-65 sm:object-right-center"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-black/10 sm:bg-gradient-to-r sm:from-black/45 sm:via-black/25 sm:to-transparent" />
            <div className="relative flex min-h-[480px] max-w-2xl flex-col justify-end p-6 text-white sm:min-h-[420px] sm:justify-center sm:p-12 lg:p-16">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-white/75 sm:mb-4 sm:text-xs sm:tracking-[0.28em]">More joy, less admin</p>
              <h2 className={landingLightTitleClass} style={landingTitleStyle}>Spend less time managing, more time <span className="text-secondary">celebrating.</span></h2>
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

        <section id="pricing" className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Simple pricing"
              title="Build free. Unlock"
              accent="Planner Pro"
              afterAccent=" once."
              body="Start with every template and the full wedding website builder free. Upgrade only when you want the complete planning workspace."
            />
            <div className="grid overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white shadow-[0_28px_80px_rgba(87,55,62,0.1)] sm:rounded-[2.5rem] md:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-neutral/70 p-5 sm:p-8 lg:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.25em]">Free forever</p>
                    <h3 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">Free</h3>
                  </div>
                  <span className="rounded-full border border-border bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Start here</span>
                </div>
                <p className="mt-3 text-text-secondary">Perfect for starting your wedding site and collecting early RSVPs.</p>
                <div className="mt-6">
                  <PrimaryCta>Create Free Site</PrimaryCta>
                </div>
                <div className="mt-8 grid gap-2.5">
                  {[
                    'Wedding website and all templates',
                    'RSVP tracking and basic guest list',
                    'QR sharing for invitations',
                    '50 guest emails per wedding',
                    'Planner Lite starter limits: 25 checklist tasks, 10 budget items, 5 suppliers, 5 calendar events, 5 food/drink items, 3 honeymoon items, 3 seating tables, and 1 partner collaborator',
                    'Automatic RSVP confirmations and host notifications',
                  ].map((item) => (
                    <p key={item} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/80 p-3 text-sm font-semibold leading-6 sm:p-4 sm:text-base">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary/70" />
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="relative border-t border-primary/15 bg-gradient-to-br from-white via-white to-primary/10 p-5 sm:p-8 md:border-l md:border-t-0 lg:p-10">
                <div className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/20 sm:right-8 sm:top-8 sm:text-[10px] sm:tracking-[0.18em]">
                  Most Popular
                </div>
                <p className="max-w-[10rem] text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:max-w-none sm:text-xs sm:tracking-[0.25em]">One-time upgrade</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <h3 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Planner Pro</h3>
                  <div className="sm:text-right">
                    <p className="font-serif text-4xl font-bold leading-none text-primary sm:text-5xl">{plannerProDisplayPrice}</p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-text-secondary">Pay once</p>
                  </div>
                </div>
                <p className="mt-3 text-text-secondary">Built for finalizing the real wedding plan when guests, suppliers, seating, and reminders matter.</p>
                <div className="mt-8 grid gap-2.5">
                  {[
                    'Unlimited guest emails',
                    'Full planner with tasks, budgets, suppliers, food, calendar, and honeymoon items',
                    'Wedding Day Mode, QR Kit, seating chart, QR Seat Finder, guest check-in, and seat-link emails',
                    'RSVP reminders, entourage proposals, and unlimited collaborators',
                    'Google Calendar sync, theme presets, custom domain, and CSV exports',
                    'Photo portal moderation, thank-you email/card builder, and advanced analytics',
                  ].map((item) => (
                    <p key={item} className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white p-3 text-sm font-semibold leading-6 shadow-[0_6px_18px_rgba(87,55,62,0.04)] sm:p-4 sm:text-base">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-text-secondary">No subscription. No surprises.</p>
                <div className="mt-8 flex">
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

        <section id="faq" className="bg-white px-4 py-12 sm:px-6 sm:py-16">
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

        <ContactSection />
      </main>

      <footer className="relative isolate overflow-hidden border-t border-border bg-white pb-36 pt-10 sm:pb-44 sm:pt-24">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 text-left md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4 text-center md:space-y-6 md:text-left lg:col-span-1">
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
              <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-foreground sm:mb-6 sm:text-sm">Product</h4>
              <ul className="space-y-0.5 sm:space-y-4">
                <li><button type="button" onClick={openDemo} className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">View Live Demo</button></li>
                <li><a href="#pricing" onClick={(event) => navigateToSection(event, 'pricing')} className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">Pricing & Features</a></li>
                <li><Link href="/suppliers" className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">Vendor Directory</Link></li>
                <li><Link href="/supplier/signup" className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">List Your Business</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-foreground sm:mb-6 sm:text-sm">Resources</h4>
              <ul className="space-y-0.5 sm:space-y-4">
                <li><Link href="/user-guide" className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">Planning Guide</Link></li>
                <li><Link href="/user-guide/wedding-day-mode" className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">Wedding Day Guide</Link></li>
                <li><a href="#faq" onClick={(event) => navigateToSection(event, 'faq')} className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">FAQ</a></li>
                <li><Link href="/privacy" className="inline-flex min-h-9 items-center text-[13px] font-bold leading-tight text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="col-span-2 text-center md:col-span-1 md:text-left">
              <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-foreground sm:mb-6 sm:text-sm">Support</h4>
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 md:block md:space-y-4">
                <li><a href="#contact" onClick={(event) => navigateToSection(event, 'contact')} className="inline-flex min-h-9 items-center text-[13px] font-bold text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">Contact Support</a></li>
                <li><a href="mailto:support@quickweds.site" className="inline-flex min-h-9 items-center text-[13px] font-bold text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">support@quickweds.site</a></li>
                <li><a href="https://wa.me/639454602270" className="inline-flex min-h-9 items-center text-[13px] font-bold text-text-secondary transition-colors hover:text-primary sm:min-h-11 sm:text-sm">Chat on WhatsApp</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 border-t border-border pt-5 text-center sm:mt-16 sm:gap-6 sm:pt-8 md:flex-row md:justify-between md:text-left">
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
        <FooterCloudLayers />
      </footer>

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
    </div>
  );
}

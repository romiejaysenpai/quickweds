import type { Metadata } from 'next';

// This is the public search origin, independent of preview hosts and app callback URLs.
export const siteOrigin = 'https://www.quickweds.site';
export const siteName = 'QuickWeds';
export const homeTitle = 'Free Wedding Website, RSVP & Planning Tools | QuickWeds';
export const homeDescription =
  'Build a free wedding website with digital invitations and online RSVPs. Plan your guest list, seating, budget, and wedding day in one place.';
export const sitePreviewImage = `${siteOrigin}/opengraph-image`;
export const sitePreviewImageWidth = 1200;
export const sitePreviewImageHeight = 630;
export const rsvpWordingPath = '/tips/wedding-rsvp-wording';

export const HOME_FAQS = [
  {
    question: 'Is QuickWeds only a wedding website builder?',
    answer:
      'No. You can build and publish a free wedding website with RSVP tracking, QR sharing, a basic guest list, 50 guest emails, and Planner Lite. Planner Pro is the one-time upgrade for full planner tools, QR seating, Wedding Day Mode, collaborators, reminders, photo tools, exports, thank-you tools, and custom domains.',
  },
  {
    question: 'Can guests RSVP from their phones?',
    answer:
      'Yes. Your wedding website and RSVP flow are mobile-friendly, so guests can view details and respond from iPhone, Android, tablets, or desktop.',
  },
  {
    question: 'Will I get notifications when someone RSVPs?',
    answer:
      'Yes. Automatic RSVP confirmations and host notifications stay free and do not count toward your 50 guest email allowance. User-triggered sends like RSVP reminders, seat emails, and thank-you emails count toward that allowance.',
  },
  {
    question: 'Can my partner or planner help manage the wedding?',
    answer:
      'Yes. Free workspaces include 1 partner collaborator. Planner Pro unlocks coordinators and more helpers for managing budgets, vendors, tasks, seating, reminders, guest photos, and post-wedding details.',
  },
  {
    question: 'Do I need technical skills to launch my site?',
    answer:
      'No. Choose a design, add your details and photos, then share your wedding link. QuickWeds handles the polished layout and mobile experience for you.',
  },
  {
    question: 'Can I start free?',
    answer:
      'Yes. All templates, the builder, your wedding website, RSVP tools, QR sharing, basic guest tracking, 50 guest emails, and Planner Lite are free. Planner Lite includes starter limits for checklist, budget, supplier, calendar, food, honeymoon, seating, and partner collaboration. Planner Pro unlocks unlimited planning, unlimited guest emails, QR seating, reminders, collaborators, exports, photo tools, and thank-you tools.',
  },
  {
    question: 'Can wedding suppliers join QuickWeds?',
    answer:
      'Yes. Wedding businesses can create a supplier profile, submit it for review, and appear in the public supplier directory once approved. Couples can browse suppliers and save directory listings into their planner.',
  },
] as const;

export const TIPS_GUIDES = [
  {
    slug: 'wedding-rsvp-wording',
    path: '/tips/wedding-rsvp-wording',
    title: 'Wedding RSVP Wording: English & Tagalog Examples',
    shortTitle: 'Wedding RSVP Wording',
    description:
      'Find wedding RSVP wording for invitations, Messenger, and Viber. Copy English and Tagalog examples for reply deadlines, reserved seats, and reminders.',
    category: 'Invitations & RSVP',
    datePublished: '2026-11-09',
  },
  {
    slug: 'philippines-wedding-budget-breakdown',
    path: '/tips/philippines-wedding-budget-breakdown',
    title: 'Philippines Wedding Budget Breakdown: ₱150k to ₱1M Guide',
    shortTitle: 'Philippines Wedding Budget Breakdown',
    description:
      'Plan your wedding budget in the Philippines with realistic cost percentages for ₱150k, ₱300k, ₱500k, and ₱1M celebrations, plus hidden fees to watch out for.',
    category: 'Budget & Costs',
    datePublished: '2026-11-26',
  },
  {
    slug: '12-month-wedding-checklist-philippines',
    path: '/tips/12-month-wedding-checklist-philippines',
    title: '12-Month Wedding Planning Checklist (Philippines Church & Civil)',
    shortTitle: '12-Month Wedding Checklist',
    description:
      'Follow a month-by-month wedding planning checklist tailored for Philippines church and civil weddings, including marriage license, CENOMAR, and vendor booking milestones.',
    category: 'Timeline & Checklist',
    datePublished: '2026-11-26',
  },
  {
    slug: 'wedding-seating-chart-guide',
    path: '/tips/wedding-seating-chart-guide',
    title: 'Wedding Reception Seating Chart & QR Seat Finder Guide',
    shortTitle: 'Reception Seating Chart Guide',
    description:
      'Learn how to arrange VIP, principal sponsor, family, and friend tables, avoid reception bottlenecks, and let guests find their seats with a QR Seat Finder.',
    category: 'Seating & Reception',
    datePublished: '2026-11-26',
  },
  {
    slug: 'entourage-proposal-wording-philippines',
    path: '/tips/entourage-proposal-wording-philippines',
    title: 'Ninong, Ninang & Wedding Entourage Proposal Wording',
    shortTitle: 'Entourage Proposal Wording',
    description:
      'Copy warm English and Tagalog wedding entourage proposal messages for Principal Sponsors (Ninong & Ninang), Best Man, Maid of Honor, bridesmaids, and groomsmen.',
    category: 'Entourage & Family',
    datePublished: '2026-11-26',
  },
  {
    slug: 'wedding-dress-code-guide-philippines',
    path: '/tips/wedding-dress-code-guide-philippines',
    title: 'Wedding Dress Code & Attire Guide for Guests (Philippines)',
    shortTitle: 'Wedding Dress Code Guide',
    description:
      'Explain formal, Barong Tagalog, Modern Filipiniana, semi-formal, garden, and beach wedding dress codes clearly with color palettes and footwear notes.',
    category: 'Attire & Styling',
    datePublished: '2026-11-26',
  },
] as const;

export type PublicMetadataOptions = {
  image?: { url: string; alt: string; width?: number; height?: number };
  keywords?: string[];
  noIndex?: boolean;
};

export function publicPageMetadata(
  path: string,
  title: string,
  description: string,
  type: 'website' | 'article' = 'website',
  options?: PublicMetadataOptions,
): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const ogImage = options?.image
    ? [
        {
          url: options.image.url,
          alt: options.image.alt,
          ...(options.image.width ? { width: options.image.width } : {}),
          ...(options.image.height ? { height: options.image.height } : {}),
        },
      ]
    : [
        {
          url: sitePreviewImage,
          width: sitePreviewImageWidth,
          height: sitePreviewImageHeight,
          alt: 'QuickWeds wedding website builder and planning tools',
        },
      ];

  return {
    title: title.includes(siteName) ? { absolute: title } : title,
    description,
    ...(options?.keywords ? { keywords: options.keywords } : {}),
    ...(options?.noIndex ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: 'en_US',
      url: path,
      title: fullTitle,
      description,
      siteName,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ogImage.map((img) => ({ url: img.url, alt: img.alt })),
    },
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${siteOrigin}${item.path}`,
    })),
  };
}

export function buildFaqJsonLd(faqs: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleJsonLd(article: {
  path: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  const url = `${siteOrigin}${article.path}`;
  return {
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    image: article.image || sitePreviewImage,
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    author: { '@type': 'Organization', name: siteName, url: `${siteOrigin}/` },
    publisher: { '@id': `${siteOrigin}/#organization` },
  };
}

export function buildHowToJsonLd(howTo: {
  name: string;
  description: string;
  steps: ReadonlyArray<string>;
}) {
  return {
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text,
    })),
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

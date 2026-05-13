import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  Gift,
  LayoutDashboard,
  MailCheck,
  Palette,
  QrCode,
  Send,
  Utensils,
  Wallet,
  UsersRound,
} from 'lucide-react';

const guides = {
  'wedding-website-builder': {
    title: 'Wedding Website Builder Guide',
    description: 'Create, design, preview, publish, and edit your wedding website.',
    icon: Palette,
    overview: 'The builder creates your guest-facing wedding website. This is where you add couple details, venue information, story, photos, timeline, RSVP settings, attire, FAQs, gifts, and design style.',
    steps: [
      'Open Dashboard and click Create New Wedding or edit an existing wedding.',
      'Add the couple names, wedding date, time, venue, and RSVP deadline.',
      'Choose a template and motif color that match the wedding style.',
      'Add story, photos, timeline, attire, gift details, FAQs, and other guest instructions.',
      'Preview the website, then save or publish it.',
      'Copy the guest link and share it with guests through chat, email, SMS, or printed QR.',
    ],
    automated: [
      'QuickWeds generates a public wedding website link.',
      'The selected design applies across the guest-facing page.',
      'Guest RSVP submissions connect back to the dashboard.',
    ],
    tips: [
      'Complete the venue, timeline, attire, and FAQ sections before sharing.',
      'Use clear short wording because most guests will open the site on a phone.',
    ],
  },
  'rsvp-guest-list': {
    title: 'RSVP and Guest List Guide',
    description: 'Track replies, add manual guests, manage plus-ones, and organize guest groups.',
    icon: UsersRound,
    overview: 'The RSVP and guest list tools help you know who is attending, who declined, and who still needs follow-up. Guests can come from online RSVP submissions or manual entries.',
    steps: [
      'Share the wedding website link with guests.',
      'Guests open the site and submit their RSVP.',
      'Open the dashboard or planner guest tools to review responses.',
      'Add manual guests when someone confirms outside the online RSVP form.',
      'Update RSVP status, guest group, plus-one details, and notes when needed.',
      'Use the confirmed guest list as the source for seating assignments.',
    ],
    automated: [
      'Online RSVP submissions are saved automatically.',
      'Guest reply counts update in the dashboard.',
      'Confirmed guests can appear in planner tools like Seating.',
    ],
    tips: [
      'Set an RSVP deadline before sharing the site.',
      'Manually add guests who confirmed through phone, Messenger, or family lists.',
    ],
  },
  'planner-workspace': {
    title: 'Planner Workspace Guide',
    description: 'Understand Planner tabs and how each wedding has its own planner.',
    icon: LayoutDashboard,
    overview: 'Every wedding website has its own planner workspace. This keeps budget, suppliers, seating, checklist, calendar, food, photos, honeymoon, and thank-you planning separate for each wedding.',
    steps: [
      'Open Dashboard and choose the wedding website you want to manage.',
      'Click that wedding card’s Planner button.',
      'Use each Planner tab for a specific planning area.',
      'Keep supplier, budget, and checklist information updated as planning changes.',
      'Return to the same wedding card when you need that wedding’s specific planner.',
    ],
    automated: [
      'Planner data is loaded for the selected wedding only.',
      'Account Pro can unlock Planner access across owned weddings.',
      'Wedding-level premium access still works for older paid weddings.',
    ],
    tips: [
      'Always open Planner from the correct wedding card if you manage multiple weddings.',
      'Use the dashboard planner picker only when you want to choose from multiple weddings.',
    ],
  },
  'checklist-calendar': {
    title: 'Checklist and Calendar Guide',
    description: 'Use the wedding checklist, 12-month plan, schedules, reminders, and Google Calendar connection.',
    icon: ClipboardList,
    overview: 'Checklist and Calendar help you organize preparation tasks and wedding schedules. The checklist is best for things to complete, while the calendar is best for appointments and scheduled events.',
    steps: [
      'Open Planner and go to Checklist.',
      'Add checklist items under General, Entourage, Parents, Bride Attire, Groom Attire, or 12-Month Wedding Plan.',
      'Mark an item done by clicking the circle when finished.',
      'Use Load 12-month checklist to seed recommended milestones based on the wedding date.',
      'Open Calendar and add scheduled events, fittings, meetings, deadlines, and appointments.',
      'Connect Google Calendar if you want supported calendar syncing for your own calendar.',
    ],
    automated: [
      'The 12-month checklist can seed common wedding milestones.',
      'Calendar events can create upcoming schedule reminders.',
      'Google Calendar connection can sync supported planner events when configured.',
    ],
    tips: [
      'Use checklist for tasks, calendar for date/time appointments.',
      'Load the 12-month checklist once, then customize it for the couple’s real timeline.',
    ],
  },
  'budget-planner': {
    title: 'Budget Planner Guide',
    description: 'Track wedding spending, supplier costs, balances, and budget totals.',
    icon: Wallet,
    overview: 'The Budget Planner helps you list expected and actual wedding costs so the couple can understand where the money is going.',
    steps: [
      'Open Planner and go to Budget.',
      'Add the total wedding budget if available.',
      'Add budget items for venue, catering, attire, photo/video, styling, entertainment, and other costs.',
      'Record estimated cost, actual cost, paid amount, and balance when available.',
      'Update costs as suppliers confirm quotes or payments.',
      'Review remaining budget regularly.',
    ],
    automated: [
      'Budget totals update when items are added or edited.',
      'Food and Drinks custom costs can count into budget when no catering supplier is linked.',
      'Supplier-related costs can help keep planning totals consistent.',
    ],
    tips: [
      'Update the budget after every deposit or supplier quote.',
      'Keep custom costs separate from supplier package costs to avoid double counting.',
    ],
  },
  'suppliers-directory': {
    title: 'Suppliers and Directory Guide',
    description: 'Save suppliers, manage planner vendors, and use the business directory.',
    icon: Gift,
    overview: 'Supplier tools help couples track vendors they are considering or already booked. The directory helps users discover business listings and save suppliers into the planner.',
    steps: [
      'Open the Suppliers tab in Planner to add a wedding supplier.',
      'Enter supplier name, category, contact details, notes, and cost information.',
      'Use the public Supplier Directory to browse listed businesses.',
      'Save a directory supplier into the planner when it matches your wedding needs.',
      'Update payment status, notes, and details as planning continues.',
    ],
    automated: [
      'Saved suppliers can appear as selectable linked vendors in planner features.',
      'Catering-related suppliers can be selected inside Food and Drinks.',
      'Supplier records stay tied to the selected wedding planner.',
    ],
    tips: [
      'Use categories consistently, such as Catering, Photo, Video, HMUA, Venue, or Styling.',
      'Keep supplier contact details updated for the coordinator.',
    ],
  },
  'food-drinks-planner': {
    title: 'Food and Drinks Planner Guide',
    description: 'List menu ideas, upload food references, add suppliers, and track costs.',
    icon: Utensils,
    overview: 'Food and Drinks Planner helps organize menu ideas, drink choices, desserts, reference photos, supplier sources, and estimated costs.',
    steps: [
      'Open Planner and go to Food & Drinks.',
      'Add food, drink, dessert, or other menu items.',
      'Upload a reference photo directly from phone gallery or computer folder.',
      'Enter estimated cost, serving/category, notes, and supplier source.',
      'Choose an existing catering supplier when available, or type a custom supplier.',
      'Delete or edit items as the menu changes.',
    ],
    automated: [
      'Existing catering suppliers can be selected from planner vendors.',
      'Custom/no linked supplier item costs can count into wedding budget totals.',
      'Linked catering supplier items avoid double-counting when the supplier package already covers the cost.',
    ],
    tips: [
      'Use photos for visual menu references during supplier meetings.',
      'Link to a catering supplier when the food is already included in a package quote.',
    ],
  },
  'photo-sharing': {
    title: 'Photo Sharing Guide',
    description: 'Let guests upload wedding photos and manage the shared gallery.',
    icon: Camera,
    overview: 'Photo Sharing gives the wedding a guest photo upload space so guests can contribute memories from the event.',
    steps: [
      'Open Planner and go to Photos.',
      'Share the wedding photo upload link or QR with guests.',
      'Guests upload photos directly from their phone gallery.',
      'Review uploaded photos from the planner.',
      'Use the gallery as a shared collection of guest moments.',
    ],
    automated: [
      'Uploaded guest photos are stored under the wedding photo area.',
      'The photo page works from phone browsers.',
      'Guest uploads can be collected without asking guests to send files one by one.',
    ],
    tips: [
      'Display the photo upload QR at the venue.',
      'Ask guests to upload candid moments the official photographer may miss.',
    ],
  },
  'thank-you-notes': {
    title: 'Thank You Notes Guide',
    description: 'Prepare and send thank-you messages after the wedding.',
    icon: MailCheck,
    overview: 'Thank You tools help the couple follow up with guests after the wedding, especially after gifts, attendance, and support.',
    steps: [
      'Open Planner and go to Thank You.',
      'Review guests and gift or attendance context when available.',
      'Prepare thank-you message text.',
      'Send or manage thank-you notes after the wedding.',
      'Keep track of who has already been thanked.',
    ],
    automated: [
      'Guest records help organize who should receive a note.',
      'Email sending can use the existing app email system when configured.',
      'Thank-you status can help avoid duplicate follow-ups.',
    ],
    tips: [
      'Send thank-you notes soon after the wedding while details are fresh.',
      'Personalize messages for family, entourage, sponsors, and gift-givers.',
    ],
  },
  'qr-codes-sharing': {
    title: 'QR Codes and Sharing Guide',
    description: 'Use guest links, RSVP QR codes, seat finder QR codes, and printed sharing.',
    icon: QrCode,
    overview: 'QR codes help guests open wedding tools quickly from their phones. QuickWeds can use links and QR codes for the wedding website, RSVP, photo sharing, and seat finder.',
    steps: [
      'Copy the public wedding website link from the dashboard.',
      'Use the link in chat, email, SMS, or printed materials.',
      'Use QR codes on invitations, welcome signs, reception tables, or coordinator materials.',
      'For seating, generate the venue QR from QR Seat Finder after assigning guests.',
      'Test every QR code with a phone before printing.',
    ],
    automated: [
      'Wedding links route guests to the correct public wedding page.',
      'Seat Finder QR opens the public lookup page for the selected wedding.',
      'Personal seat email links can include QR codes for individual guests.',
    ],
    tips: [
      'Always test QR codes before printing.',
      'Use large printed QR codes with a short label explaining what guests should do.',
    ],
  },
} as const;

type GuideSlug = keyof typeof guides;

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug as GuideSlug];
  if (!guide) return {};
  return {
    title: `${guide.title} | QuickWeds`,
    description: guide.description,
  };
}

export default async function FeatureGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides[slug as GuideSlug];
  if (!guide) notFound();
  const Icon = guide.icon;

  return (
    <main className="min-h-screen bg-neutral px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/user-guide" className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary sm:w-fit">
            <ArrowLeft className="h-4 w-4" />
            User Guide
          </Link>
          <Link href="/dashboard" className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-primary-hover sm:w-fit">
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <header className="overflow-hidden rounded-[1.5rem] border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Icon className="h-4 w-4" />
            Feature Guide
          </div>
          <h1 className="max-w-4xl font-serif text-3xl font-bold leading-tight text-foreground sm:text-6xl">
            {guide.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-text-secondary sm:text-lg">
            {guide.overview}
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <Send className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-3xl font-bold text-foreground">Step-by-Step Setup</h2>
            </div>
            <ol className="space-y-3 text-sm leading-7 text-text-secondary sm:text-base">
              {guide.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-3xl font-bold text-foreground">What Is Automated</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-text-secondary">
              {guide.automated.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl bg-neutral p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-[1.5rem] border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Gift className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-3xl font-bold text-foreground">Best Practice Tips</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {guide.tips.map((tip) => (
              <div key={tip} className="rounded-2xl border border-border bg-neutral p-5 text-sm leading-6 text-text-secondary">
                {tip}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

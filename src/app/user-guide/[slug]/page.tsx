import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardList,
  Building2,
  Gift,
  LayoutDashboard,
  MailCheck,
  Palette,
  PartyPopper,
  Plane,
  QrCode,
  Send,
  ShieldCheck,
  Utensils,
  Wallet,
  WandSparkles,
  UserCheck,
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
  'entourage-proposals': {
    title: 'Entourage Proposals Guide',
    description: 'Invite sponsors, wedding party, and helpers, then track proposal responses.',
    icon: UserCheck,
    overview: 'Entourage Proposals help couples invite principal sponsors, wedding party members, family helpers, and special roles with prepared email templates and response tracking inside Planner.',
    steps: [
      'Open Planner and choose the Entourage tab.',
      'Add each person with their name, email, role, and proposal template.',
      'Review the prepared invitation message before sending.',
      'Send proposal emails to the selected entourage members.',
      'Track accepted, declined, and pending responses from the same planner tab.',
      'Follow up manually with anyone who has not responded before finalizing the program.',
    ],
    automated: [
      'QuickWeds uses the selected entourage template when preparing each proposal email.',
      'Invitation rows stay connected to the selected wedding planner.',
      'Responses submitted through the entourage response page update the planner status.',
    ],
    tips: [
      'Confirm spelling, role labels, and email addresses before sending.',
      'Use clear role names so the invitation feels personal and easy to understand.',
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
    overview: 'Photo Sharing gives the wedding a guest photo upload space so guests can contribute memories from the event. Planner controls support sharing codes, QR downloads, moderation, upload limits, reveal settings, and approved-photo downloads.',
    steps: [
      'Open Planner and go to Photos.',
      'Review the photo portal settings, including approval mode, reveal date, guest upload limits, and display options.',
      'Create or activate a sharing code, then download or display the QR code.',
      'Guests open the photo upload link and enter the active sharing code if required.',
      'Review pending uploads from Planner or Wedding Day Photo Uploads.',
      'Approve, reject, delete, open, or download approved guest photos as needed.',
    ],
    automated: [
      'Uploaded guest photos are stored under the wedding photo area.',
      'Sharing codes control which uploads are accepted for the wedding.',
      'Moderation status controls which photos are approved for the shared gallery.',
    ],
    tips: [
      'Display the photo upload QR at the venue.',
      'Use approval mode when you want to review photos before guests see the final gallery.',
    ],
  },
  'thank-you-notes': {
    title: 'Thank You Email and Card Builder Guide',
    description: 'Prepare and send thank-you messages after the wedding.',
    icon: MailCheck,
    overview: 'Thank You tools help the couple follow up after the wedding with template-based email/card layouts, optional photos, personalized copy, and send tracking.',
    steps: [
      'Open Planner and go to Thanks, or open Thank You from the wedding dashboard.',
      'Choose a thank-you template and adjust the accent color, font, subject, and message.',
      'Add a photo URL when the selected template supports a photo.',
      'Preview the thank-you email/card before sending.',
      'Select recipients and send after the wedding.',
      'Review send logs so guests are not thanked twice by mistake.',
    ],
    automated: [
      'Guest records help organize who should receive a note.',
      'Email sending can use the existing app email system when configured.',
      'Thank-you email logs track send status when the database table is installed.',
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
  'honeymoon-planner': {
    title: 'Honeymoon Planner Guide',
    description: 'Track honeymoon ideas, travel bookings, suppliers, statuses, and costs.',
    icon: Plane,
    overview: 'The Honeymoon Planner keeps post-wedding travel ideas and bookings beside the rest of the wedding budget and planning context.',
    steps: [
      'Open Planner and go to Honeymoon.',
      'Choose the item category, such as flight, hotel, activity, transport, or package.',
      'Add the title, destination, travel dates, estimated cost, supplier or agency, booking link, and notes.',
      'Set the status to idea, quoted, booked, paid, or done as plans become final.',
      'Update items when travel details or costs change.',
      'Use the list as a reference while finalizing post-wedding travel.',
    ],
    automated: [
      'Honeymoon items stay tied to the selected wedding planner.',
      'Planner Lite counts honeymoon items against the free starter limit.',
      'Planner Pro removes the starter limit for honeymoon planning.',
    ],
    tips: [
      'Add booking links and supplier names so travel details are easy to find later.',
      'Keep estimated costs current if you want the couple to see a realistic full celebration budget.',
    ],
  },
  'wedding-day-mode': {
    title: 'Wedding Day Mode Guide',
    description: 'Prepare event-day links, toggles, reminders, coordinator notes, and reports.',
    icon: PartyPopper,
    overview: 'Wedding Day Mode gathers event-day controls into one screen for the couple or coordinator: public tool toggles, QR Kit, photo uploads, seating, photo reminders, coordinator notes, and a printable coordinator report.',
    steps: [
      'Open a wedding dashboard and choose Wedding Day Mode.',
      'Confirm the wedding date, guest counts, photo upload count, and key event metrics.',
      'Use the action cards to open QR Kit, Photo Uploads, Seating, or the Coordinator Report.',
      'Turn Seat Finder and Photo Uploads on or off depending on what should be live for guests.',
      'Add coordinator notes for vendor arrivals, family contacts, transportation, or venue instructions.',
      'Send a photo reminder when you want guests to upload event photos.',
    ],
    automated: [
      'Wedding Day Mode loads counters from the selected wedding.',
      'Seat Finder and Photo Upload toggles update the wedding-day settings.',
      'The coordinator report pulls guest, seating, supplier, and budget details from planner data.',
    ],
    tips: [
      'Review Wedding Day Mode before printing signage or handing links to staff.',
      'Use coordinator notes for details that should not live on the public wedding website.',
    ],
  },
  'event-qr-kit': {
    title: 'Event QR Kit Guide',
    description: 'Download QR codes for guest-facing wedding tools.',
    icon: QrCode,
    overview: 'The Event QR Kit creates downloadable QR codes for the wedding website, RSVP, Seat Finder, Photo Uploads, and Thank You links so couples can print or display the right code at the right moment.',
    steps: [
      'Open QR Kit from the dashboard, Planner, or Wedding Day Mode.',
      'Review each generated QR card and the destination it opens.',
      'Download the QR image you need for invitations, welcome signage, table cards, or coordinator materials.',
      'Use the website or RSVP QR before the event.',
      'Use the Seat Finder and Photo Upload QR codes at the venue.',
      'Use the Thank You QR after the wedding if you enable a post-wedding thank-you section.',
    ],
    automated: [
      'QR Kit builds URLs for the selected wedding.',
      'Custom domains are used when available for the wedding website URL.',
      'Each QR can be downloaded as an image for print or digital sharing.',
    ],
    tips: [
      'Test every QR code with a phone before printing.',
      'Print large enough for guests to scan from a comfortable distance.',
    ],
  },
  'collaboration-access': {
    title: 'Collaboration Access Guide',
    description: 'Invite a partner, coordinator, or helper to work inside the wedding workspace.',
    icon: ShieldCheck,
    overview: 'Collaboration Access lets wedding owners invite trusted people into a wedding workspace so planning can happen with the partner, coordinator, or family helpers without sharing one login.',
    steps: [
      'Open the wedding dashboard and go to Team or Collaboration Access.',
      'Enter the collaborator email address.',
      'Choose Partner or Coordinator as the role.',
      'Send the invitation.',
      'Ask the invited person to sign in with the invited email and accept the invite from their dashboard.',
      'Remove collaborators when access is no longer needed.',
    ],
    automated: [
      'Invite status shows as pending or accepted.',
      'Free workspaces include 1 partner collaborator.',
      'Planner Pro unlocks coordinators and more helpers.',
    ],
    tips: [
      'Invite only people who should see planning details and guest information.',
      'Use coordinator access for people managing logistics close to the event.',
    ],
  },
  'analytics-reminders': {
    title: 'Analytics and RSVP Reminders Guide',
    description: 'Review visits, QR scans, RSVP conversion, and reminder performance.',
    icon: BarChart3,
    overview: 'Analytics and reminders show how the wedding website is performing and help the couple follow up with pending guests before the RSVP deadline.',
    steps: [
      'Open the wedding dashboard and choose Analytics.',
      'Review visits, unique guests, QR visits, RSVP conversion, and share actions.',
      'Check pending guest count before sending reminders.',
      'Click Send RSVP Reminder to email guests who have not responded.',
      'Review reminder runs, recipients, and responses after the latest reminder.',
      'Upgrade to Planner Pro when you need unlimited reminders, exports, and deeper analytics.',
    ],
    automated: [
      'Wedding visits, QR scans, and share actions are tracked when guests use the site.',
      'Reminder emails use the existing guest list and pending RSVP status.',
      'Reminder performance updates after emails are sent and guests respond.',
    ],
    tips: [
      'Send reminders close enough to the RSVP deadline that guests understand the urgency.',
      'Check guest email addresses before sending a reminder run.',
    ],
  },
  'theme-marketplace-presets': {
    title: 'Theme Marketplace and Presets Guide',
    description: 'Apply curated themes, reusable section blocks, and saved website presets.',
    icon: WandSparkles,
    overview: 'Theme Marketplace and Presets help couples build faster by applying curated looks, dropping in reusable content sections, and saving a custom website style for later reuse.',
    steps: [
      'Open the wedding builder and find Theme Marketplace.',
      'Apply a curated preset such as Editorial Luxe, Garden Weekend, or Modern City.',
      'Use reusable section blocks for timeline, story, registry, or thank-you content.',
      'Adjust template, motif color, fonts, background style, copy, and media after applying a preset.',
      'Save the current setup as a custom preset when you want to reuse it.',
      'Apply or delete saved presets from the same marketplace panel.',
    ],
    automated: [
      'Curated presets apply multiple design and content fields at once.',
      'Section blocks prefill focused copy or structured wedding content.',
      'Saved presets are tied to the current user account.',
    ],
    tips: [
      'Use presets as a starting point, then personalize names, dates, venue details, and story copy.',
      'Save a preset after polishing the design if you manage multiple wedding pages.',
    ],
  },
  'supplier-profiles': {
    title: 'Supplier Profiles Guide',
    description: 'Create, edit, submit, and manage a wedding business directory profile.',
    icon: Building2,
    overview: 'Supplier Profiles let wedding businesses create a directory listing with photos, service details, locations, and contact links. Listings are reviewed before they appear publicly.',
    steps: [
      'Open List Your Business from the landing page or go to Supplier Signup.',
      'Create or sign in to a QuickWeds account.',
      'Open Supplier Dashboard.',
      'Add business name, category, service areas, photos, description, and contact links.',
      'Submit the profile for admin review.',
      'After approval, keep the profile active and update details when services or contact information changes.',
    ],
    automated: [
      'Submitted supplier profiles can be reviewed before becoming public.',
      'Approved active suppliers appear in the public supplier directory.',
      'Couples can browse directory listings and save matching suppliers into their planner.',
    ],
    tips: [
      'Use clear service areas and categories so couples can find the business quickly.',
      'Keep phone, email, website, WhatsApp, and social links current.',
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
    alternates: {
      canonical: `/user-guide/${slug}`,
    },
    openGraph: {
      title: `${guide.title} | QuickWeds`,
      description: guide.description,
      url: `/user-guide/${slug}`,
      siteName: 'QuickWeds',
      type: 'article',
    },
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

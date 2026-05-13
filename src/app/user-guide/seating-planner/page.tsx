import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPinned,
  QrCode,
  ScanLine,
  Sparkles,
  Table2,
  UserPlus,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seating Planner Guide | QuickWeds',
  description: 'Learn how the QuickWeds Seating Planner, guest assignment, QR Seat Finder, guest codes, and venue check-in work.',
};

const setupSteps = [
  'Open the wedding dashboard and choose the wedding website you want to manage.',
  'Open Planner, then go to the Seating section.',
  'Set the venue shape, width, height, grid, and measurement display.',
  'Add venue objects like Dance Floor, Stage, Bar, Buffet, DJ Booth, Photo Booth, Gift Table, Entrance, or Custom Block.',
  'Add tables, choose the table shape, and set the number of seats.',
  'Drag tables and venue objects into place, or use the move arrows for more accurate positioning.',
  'Select a table, search guests, and assign guests to that table.',
  'After guests are assigned, open QR Seat Finder and click Generate.',
  'Download or print the venue QR, then optionally send seat links by email.',
  'Use Check-In at the venue to search guests and mark arrivals.',
];

const automatedItems = [
  'RSVP guests who confirmed attendance can appear in the Seating Planner guest list.',
  'Manual guests added by the wedding owner can also be assigned to tables.',
  'The app counts seated guests, unassigned parties, total tables, and open seats.',
  'The app checks table capacity while assigning guests.',
  'Guest table assignments stay synced with RSVP records.',
  'Generate creates guest lookup codes and private seat tokens automatically.',
  'The venue QR link is generated automatically for the public Seat Finder page.',
  'Send Links emails assigned guests their seat link, QR code, guest code, and table details.',
  'Check-In tracks guests who arrived at the venue.',
];

const manualItems = [
  'The couple or coordinator still chooses who sits at each table.',
  'Manual guests must be added by the user if they did not RSVP online.',
  'The venue layout, table placement, and special areas are arranged by the user.',
  'Guests without email can still use the venue QR, but they will not receive an email link.',
  'QR codes should still be printed or displayed at the venue for easy guest access.',
];

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-11 sm:w-11">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="min-w-0 font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function getSafeReturnTo(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/user-guide';
  return raw;
}

export default async function SeatingPlannerGuidePage({
  searchParams,
}: {
  searchParams?: Promise<{ returnTo?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const backHref = getSafeReturnTo(resolvedSearchParams?.returnTo);

  return (
    <main className="min-h-screen bg-neutral px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={backHref} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary sm:w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/dashboard" className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-primary-hover sm:w-fit">
            Open Dashboard
          </Link>
        </div>

        <header className="overflow-hidden rounded-[1.5rem] border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Table2 className="h-4 w-4" />
            Seating Planner Guide
          </div>
          <h1 className="max-w-4xl font-serif text-3xl font-bold leading-tight text-foreground sm:text-6xl">
            Plan tables, assign guests, and let guests find their seats by QR.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-text-secondary sm:text-lg">
            The Seating Planner combines a visual floor plan, guest assignment, QR Seat Finder, emailed seat links, and venue check-in. It helps the couple organize seating clearly while still keeping the final seating decision in their control.
          </p>
        </header>

        <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-6">
            <MapPinned className="mb-4 h-7 w-7 text-primary" />
            <h2 className="font-serif text-2xl font-bold">Build the Layout</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Create the venue shape, add tables, and place important areas like the entrance, dance floor, buffet, bar, and stage.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-6">
            <Users className="mb-4 h-7 w-7 text-primary" />
            <h2 className="font-serif text-2xl font-bold">Assign Guests</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Select a table, search for guests, and assign them. The app updates seating counts and open seats automatically.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-6">
            <QrCode className="mb-4 h-7 w-7 text-primary" />
            <h2 className="font-serif text-2xl font-bold">Use QR Finder</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Generate codes, print the venue QR, send personal seat links, and check guests in at the event.</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <SectionCard icon={ClipboardList} title="Recommended Setup Steps">
            <ol className="space-y-3 text-sm leading-7 text-text-secondary sm:text-base">
              {setupSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard icon={UserPlus} title="How Guests Are Added">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-neutral p-5">
                <h3 className="font-bold text-foreground">Automatically From RSVP</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  When a guest submits the wedding website RSVP and confirms attendance, their record can appear in the Seating Planner guest list. The couple can then assign that guest to a table.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-neutral p-5">
                <h3 className="font-bold text-foreground">Manually Added Guests</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  The wedding owner can manually add guests who confirmed by phone, message, family list, or coordinator list. Once added and marked attending, they can be seated like RSVP guests.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={QrCode} title="How Guests Get Seat Codes">
            <p className="text-sm leading-7 text-text-secondary sm:text-base">
              Seat codes are created when the user clicks Generate inside QR Seat Finder. The app checks attending guests, creates a private seat lookup token, creates a guest code, and prepares the public venue QR link. The couple does not need to manually create codes.
            </p>
            <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-5">
              <p className="text-sm font-bold text-foreground">Example</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Maria Santos is assigned to Table 3. After Generate, the app creates a guest code like MAR-1234 and a private seat link. Maria can use the email link, her guest code, or the venue QR lookup to find Table 3.
              </p>
            </div>
          </SectionCard>

          <SectionCard icon={Mail} title="How Guests Receive Their Seat">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-neutral p-5">
                <h3 className="font-bold text-foreground">Email Seat Links</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  If a guest has an email and is assigned to a table, Send Links emails their table, guest code, QR code, and personal seat link.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-neutral p-5">
                <h3 className="font-bold text-foreground">Venue QR Code</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  The venue QR opens the public Seat Finder. Guests can enter their guest code, email, phone, or exact name to see their table.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Sparkles} title="What Is Automated">
            <ul className="grid gap-3 text-sm leading-6 text-text-secondary sm:grid-cols-2">
              {automatedItems.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl bg-neutral p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard icon={ScanLine} title="What Is Manual">
            <ul className="grid gap-3 text-sm leading-6 text-text-secondary sm:grid-cols-2">
              {manualItems.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl bg-neutral p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard icon={ScanLine} title="Best Event-Day Flow">
            <ol className="space-y-3 text-sm leading-7 text-text-secondary sm:text-base">
              <li>Print or display the venue QR at the entrance or reception table.</li>
              <li>Guests scan the QR and search using their code, email, phone, or exact name.</li>
              <li>The Seat Finder shows their assigned table and party size.</li>
              <li>Reception staff can open Check-In, search the guest, and mark them arrived.</li>
              <li>If a guest cannot find their seat, staff can search them manually and help from the planner.</li>
            </ol>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

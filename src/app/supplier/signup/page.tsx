import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'List Your Wedding Business | QuickWeds',
  description: 'Create a free wedding supplier profile in the QuickWeds Philippines supplier directory.',
  alternates: {
    canonical: '/supplier/signup',
  },
};

const benefits = [
  'Create a free supplier profile with photos, service areas, and contact links',
  'Reach couples already planning inside QuickWeds',
  'Receive direct inquiries through phone, email, WhatsApp, website, and socials',
  'Submit edits for admin approval before your listing goes public',
];

export default function SupplierSignupPage() {
  return (
    <div className="min-h-screen bg-neutral text-foreground">
      <header className="border-b border-border/70 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <img src="/logo.png" alt="QuickWeds" className="h-10 w-auto object-contain" />
          </Link>
          <Link href="/suppliers" className="rounded-xl border border-primary/20 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5">
            Browse Directory
          </Link>
        </div>
      </header>

      <main className="px-4 py-14 sm:px-6 sm:py-20">
        <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Supplier Directory
            </span>
            <h1 className="mt-6 font-serif text-[2.65rem] font-bold leading-[1.03] text-foreground sm:text-6xl">
              List your wedding business on <span className="italic text-primary">QuickWeds</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg lg:mx-0">
              Suppliers can create and customize their own profile for free. Once submitted, QuickWeds reviews the listing before it appears in the public directory.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/signup?next=/supplier/dashboard" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover">
                Create Supplier Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/supplier/dashboard" className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-primary/20 bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary/5">
                Manage Existing Profile
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-white p-5 shadow-2xl shadow-primary/10 sm:p-8">
            <h2 className="font-serif text-3xl font-bold text-foreground">Free at launch</h2>
            <div className="mt-6 grid gap-3">
              {benefits.map((benefit) => (
                <p key={benefit} className="flex gap-3 rounded-2xl bg-neutral p-4 text-sm font-semibold leading-6 text-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" />
                  {benefit}
                </p>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

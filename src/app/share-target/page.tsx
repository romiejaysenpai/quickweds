import Link from 'next/link';
import { ArrowRight, ExternalLink, Heart, LayoutDashboard, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Shared to QuickWeds',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ShareTargetPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const params = await searchParams;
  const sharedTitle = params.title || 'Shared item';
  const sharedText = params.text || '';
  const sharedUrl = params.url || '';

  return (
    <main className="mobile-safe-screen flex min-h-screen items-center justify-center bg-background px-4 py-10 mobile-safe-px">
      <section className="w-full max-w-lg rounded-[2rem] border border-border bg-white p-6 shadow-2xl shadow-primary/10 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Heart className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Shared to QuickWeds</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">Where would you like to continue?</h1>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-neutral/60 p-4">
          <p className="truncate text-sm font-bold text-foreground">{sharedTitle}</p>
          {sharedText && <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{sharedText}</p>}
          {sharedUrl && (
            <a href={sharedUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary">
              <ExternalLink className="h-4 w-4" />
              Open shared link
            </a>
          )}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/builder" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-neutral px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary">
            <Sparkles className="h-4 w-4 text-primary" />
            Builder
          </Link>
        </div>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition hover:text-primary">
          Back home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}

import Link from 'next/link';
import { WifiOff, RefreshCw, Heart } from 'lucide-react';

export const metadata = {
  title: 'Offline | QuickWeds',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <main className="mobile-safe-screen flex min-h-screen items-center justify-center bg-background px-4 py-10 mobile-safe-px">
      <section className="w-full max-w-md rounded-[2rem] border border-border bg-white p-6 text-center shadow-2xl shadow-primary/10 sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <WifiOff className="h-8 w-8" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-primary">QuickWeds Offline</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-foreground">You are offline</h1>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Previously opened pages may still be available. Reconnect to update RSVPs, planner details, payments, and dashboard data.
        </p>
        <div className="mt-7 grid gap-3">
          <a
            href=""
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </a>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-neutral px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <Heart className="h-4 w-4 text-primary" />
            Open Home
          </Link>
        </div>
      </section>
    </main>
  );
}

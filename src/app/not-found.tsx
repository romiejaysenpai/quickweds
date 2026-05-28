import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral px-4 py-16 text-foreground sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Link href="/" className="mb-8 inline-flex">
          <Image src="/logo.png" alt="QuickWeds" width={180} height={64} className="h-12 w-auto object-contain" />
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">404</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
          This wedding page could not be found.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary sm:text-lg">
          The link may be outdated, private, or mistyped. You can return home, create a wedding website, or browse the planning guide.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover"
          >
            Back to QuickWeds
          </Link>
          <Link
            href="/builder"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
          >
            Create Free Site
          </Link>
          <Link
            href="/user-guide"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
          >
            View Guide
          </Link>
        </div>
      </div>
    </main>
  );
}

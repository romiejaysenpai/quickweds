'use client';

import Link from 'next/link';
import { ArrowLeft, Cookie, ShieldCheck, Info, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-neutral pb-20">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:h-20 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pt-32 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-border bg-white p-8 shadow-2xl shadow-primary/5 sm:p-14"
        >
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Cookie className="h-8 w-8" />
          </div>

          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">Cookies Policy</h1>
          <p className="mt-4 text-sm font-bold text-text-secondary/60 uppercase tracking-widest">Last updated: May 2026</p>

          <div className="mt-12 space-y-12">
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground">
                <Info className="h-6 w-6 text-primary" />
                What are cookies?
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-text-secondary">
                <p>
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
                </p>
                <p>
                  At QuickWeds, we use cookies to improve your planning experience, remember your preferences, and understand how you use our platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground">
                <Settings className="h-6 w-6 text-primary" />
                How we use cookies
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-neutral/50 p-6">
                  <h3 className="font-bold text-foreground">Essential Cookies</h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    These are required for the website to function. They allow you to log in securely and navigate the dashboard.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-neutral/50 p-6">
                  <h3 className="font-bold text-foreground">Functional Cookies</h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    These remember your settings and preferences (like your theme or language) to provide a more personalized experience.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-neutral/50 p-6">
                  <h3 className="font-bold text-foreground">Analytics Cookies</h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    These help us understand how visitors interact with our site, allowing us to improve our tools and performance.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-neutral/50 p-6">
                  <h3 className="font-bold text-foreground">Marketing Cookies</h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    Used to track visitors across websites to display relevant advertisements that are engaging for the user.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Managing your cookies
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-text-secondary">
                <p>
                  You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
                </p>
                <p>
                  To manage cookies, please visit your browser's settings:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Google Chrome</li>
                  <li>Safari</li>
                  <li>Firefox</li>
                  <li>Microsoft Edge</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-16 border-t border-border pt-10">
            <p className="text-sm leading-7 text-text-secondary">
              If you have any questions about our use of cookies or other technologies, please email us at{' '}
              <a href="mailto:privacy@quickweds.site" className="font-bold text-primary hover:underline">
                privacy@quickweds.site
              </a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

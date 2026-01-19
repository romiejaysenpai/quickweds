'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Smartphone, Share2, Calendar } from 'lucide-react';
import ExamplesSection from '@/components/ExamplesSection';

import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 rounded-bl-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/10 rounded-tr-full blur-3xl -z-10" />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <header className="flex justify-between items-center mb-24">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="QuickWeds Logo" className="h-16 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-primary font-bold hover:underline">Dashboard</Link>
                <button onClick={logout} className="px-6 py-2.5 rounded-xl border border-border text-foreground font-bold hover:bg-neutral-hover transition-all text-sm">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="px-8 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all text-sm shadow-lg shadow-primary/20">
                Log In
              </Link>
            )}
          </div>
        </header>

        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Made for Modern Couples
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-[1.1] mb-8">
            Instant Wedding Landing Pages <br />
            <span className="text-primary italic">Elegant & Effortless.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed">
            Generate a beautiful, mobile-first wedding invitation in minutes.
            Integrated RSVP system, elegant designs, and instant sharing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/builder" className="px-10 py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
              Get Started for Free <Heart className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsExamplesOpen(true)}
              className="px-10 py-5 rounded-2xl bg-secondary text-foreground font-bold text-lg hover:bg-secondary-hover transition-all shadow-md shadow-secondary/10"
            >
              View Examples
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Smartphone className="w-6 h-6" />,
              title: "Mobile First",
              desc: "Designed to look stunning on every guest's smartphone."
            },
            {
              icon: <Calendar className="w-6 h-6" />,
              title: "RSVP System",
              desc: "Collect responses and meal preferences in one simple dashboard."
            },
            {
              icon: <Share2 className="w-6 h-6" />,
              title: "Instant Share",
              desc: "Unique URLs and QR codes for effortless sharing."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white border border-border hover:border-primary/20 transition-all hover:translate-y-[-4px] soft-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <ExamplesSection isOpen={isExamplesOpen} onClose={() => setIsExamplesOpen(false)} />

      <footer className="py-12 border-t border-border text-center text-text-secondary text-sm">
        &copy; 2026 QuickWeds. Elegant Invitations for Modern Couples.
      </footer>
    </div>
  );
}

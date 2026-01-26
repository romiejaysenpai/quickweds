'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Smartphone, Share2, Calendar, ArrowRight, Play, CheckCircle2, Star, Zap } from 'lucide-react';
import ExamplesSection from '@/components/ExamplesSection';
import TemplatesSection from '@/components/TemplatesSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral selection:bg-primary/20">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/2 h-[80vh] bg-gradient-to-bl from-primary/5 via-primary/2 to-transparent rounded-bl-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-[80vh] bg-gradient-to-tr from-secondary/10 via-secondary/5 to-transparent rounded-tr-full blur-3xl -z-10" />

      {/* Floating Sparkles Decoration */}
      <div className="absolute inset-0 pointer-events-none -z-5">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="QuickWeds Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <div className="flex items-center gap-8">
            <Link href="#templates" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors hidden md:block">Templates</Link>
            <button onClick={() => setIsExamplesOpen(true)} className="text-sm font-bold text-text-secondary hover:text-primary transition-colors hidden md:block">Examples</button>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="px-6 py-2 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all text-sm">Dashboard</Link>
                <button onClick={logout} className="text-sm font-bold text-text-secondary hover:text-foreground transition-all">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors">Log In</Link>
                <Link href="/signup" className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all text-sm shadow-lg shadow-primary/20">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-40 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-border soft-shadow text-primary text-xs font-black uppercase tracking-widest mb-10"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> AI-Powered Elegance
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-[7rem] font-serif font-bold text-foreground leading-[0.9] mb-12 tracking-tighter"
          >
            Your Love Story, <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic font-normal">Digitally Perfected.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-inter text-text-secondary max-w-2xl mx-auto mb-16 leading-relaxed font-light"
          >
            Create a stunning, interactive wedding landing page in under 5 minutes.
            No design skills needed—just your beautiful moments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link href="/builder" className="group relative px-12 py-6 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
              Start Building Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <button
              onClick={() => setIsExamplesOpen(true)}
              className="px-12 py-6 rounded-2xl bg-white text-foreground font-bold text-lg hover:bg-neutral transition-all border border-border flex items-center justify-center gap-2 group"
            >
              <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" /> Watch Experience
            </button>
          </motion.div>

          {/* Social Proof / Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-24 pt-12 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8 grayscale opacity-50"
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-bold text-foreground">10k+</span>
              <span className="text-[10px] uppercase font-black tracking-widest">Happy Couples</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-bold text-foreground">150+</span>
              <span className="text-[10px] uppercase font-black tracking-widest">Designs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-bold text-foreground">Instant</span>
              <span className="text-[10px] uppercase font-black tracking-widest">RSVP Sync</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-bold text-foreground">Unlimited</span>
              <span className="text-[10px] uppercase font-black tracking-widest">Photo Storage</span>
            </div>
          </motion.div>
        </section>

        {/* INTERACTIVE FEATURE CARDS */}
        <section className="bg-neutral/50 py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Smartphone className="w-8 h-8 text-primary" />,
                  title: "Mobile Mastery",
                  desc: "Every design is crafted for a perfect smartphone experience, ensuring every guest feels VIP.",
                  accent: "bg-primary/5"
                },
                {
                  icon: <Calendar className="w-8 h-8 text-secondary" />,
                  title: "Smart RSVP",
                  desc: "Real-time response tracking with automated guest list management and meal preference logs.",
                  accent: "bg-secondary/10"
                },
                {
                  icon: <Share2 className="w-8 h-8 text-accent" />,
                  title: "One-Tap Sharing",
                  desc: "Unique URLs and QR codes ready for your invitations. Share via WhatsApp, Email, or Print.",
                  accent: "bg-accent/5"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className={`p-10 rounded-[3rem] bg-white border border-border hover:border-primary/20 transition-all soft-shadow relative overflow-hidden group`}
                >
                  <div className={`w-16 h-16 ${feature.accent} rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed mb-6">{feature.desc}</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TEMPLATES SECTION */}
        <div id="templates">
          <TemplatesSection />
        </div>

        {/* TESTIMONIAL / HOOK */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto bg-primary text-white p-16 md:p-24 rounded-[4rem] relative overflow-hidden shadow-2xl shadow-primary/40">
            <div className="absolute top-0 right-0 p-8 opacity-20"><Star className="w-32 h-32 rotate-12" /></div>
            <div className="absolute bottom-0 left-0 p-8 opacity-20"><Heart className="w-32 h-32 -rotate-12" /></div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 relative z-10 leading-tight">
              "We had our site up and running in minutes, and our guests couldn't stop raving about how beautiful it was!"
            </h2>
            <div className="flex flex-col items-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mb-4 border border-white/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold tracking-widest uppercase text-xs">Sarah & Marc, December 2025</p>
            </div>
          </div>
        </section>
      </main>

      <ExamplesSection isOpen={isExamplesOpen} onClose={() => setIsExamplesOpen(false)} />

      <footer className="py-20 bg-white border-t border-border px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src="/logo.png" alt="QuickWeds Logo" className="h-8 w-auto grayscale opacity-50" />
            <p className="text-text-secondary text-sm">© 2026 QuickWeds. Crafting digital forever.</p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-4">
              <p className="font-bold text-xs uppercase tracking-widest text-foreground">Product</p>
              <Link href="/builder" className="text-text-secondary text-sm hover:text-primary">Builder</Link>
              <Link href="#templates" className="text-text-secondary text-sm hover:text-primary">Templates</Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-bold text-xs uppercase tracking-widest text-foreground">Support</p>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary">Help Center</Link>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

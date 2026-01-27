'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Smartphone, Share2, Calendar, ArrowRight, Play, CheckCircle2, Star, Zap, Image as ImageIcon, Video, Palette, Globe, ShieldCheck } from 'lucide-react';
import ExamplesSection from '@/components/ExamplesSection';
import TemplatesSection from '@/components/TemplatesSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAFB] selection:bg-primary/20">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-[70vw] h-[70vh] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-bl-[40%] blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-gradient-to-tr from-secondary/15 via-secondary/5 to-transparent rounded-tr-[40%] blur-[120px] -z-10" />

      {/* Decorative SVG Patterns */}
      <div className="absolute top-20 left-10 opacity-[0.03] pointer-events-none -z-10">
        <svg width="400" height="400" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <img src="/logo.png" alt="QuickWeds Logo" className="h-11 w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {['Templates', 'Features', 'Showcase'].map((item) => (
              <Link
                key={item}
                href={item === 'Templates' ? '#templates' : '#'}
                className="text-[13px] font-bold uppercase tracking-[0.15em] text-text-secondary hover:text-primary transition-all duration-300"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="px-7 py-2.5 rounded-full bg-black text-white text-[13px] font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-black/10">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-[13px] font-bold text-text-secondary hover:text-black transition-all">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-[13px] font-bold text-text-secondary hover:text-primary transition-colors pr-2">
                  Log In
                </Link>
                <Link href="/signup" className="px-8 py-3 rounded-full bg-primary text-white text-[13px] font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20">
                  Create Invitation
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-black/[0.05] shadow-sm mb-12"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Next-Gen Wedding Tech</span>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-7xl md:text-[8.5rem] font-serif font-bold text-[#1A1A1A] leading-[0.85] mb-12 tracking-[-0.03em]"
            >
              The Modern Way <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic font-normal px-2">to say &quot;I Do&quot;</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-10 -right-10 hidden lg:block"
            >
              <div className="p-4 bg-white rounded-2xl shadow-2xl border border-black/[0.03] rotate-12 scale-90">
                <Heart className="w-10 h-10 text-primary fill-primary/10" />
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl font-medium text-text-secondary max-w-2xl mx-auto mb-16 leading-relaxed opacity-80"
          >
            Ditch the paper and the stress. Create a breathtaking, interactive digital wedding
            experience that your guests will actually remember.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/builder" className="group relative px-14 py-7 rounded-full bg-[#1A1A1A] text-white font-bold text-lg hover:bg-black transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3 overflow-hidden">
              <span className="relative z-10">Start Your Story</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
            <button
              onClick={() => setIsExamplesOpen(true)}
              className="group px-14 py-7 rounded-full bg-white text-[#1A1A1A] font-bold text-lg hover:bg-[#F3F3F4] transition-all border border-black/[0.08] flex items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Play className="w-4 h-4 text-primary fill-primary" />
              </div>
              View Showreel
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-32 pt-16 border-t border-black/[0.05]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary mb-12 opacity-40">Trusted by modern couples worldwide</p>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 items-center justify-items-center grayscale opacity-30 px-10">
              <span className="text-2xl font-serif font-black italic">VOGUE</span>
              <span className="text-2xl font-serif font-black">Brides</span>
              <span className="text-2xl font-serif font-black tracking-tighter">ELITE</span>
              <span className="text-2xl font-serif font-black">Modern</span>
              <span className="text-2xl font-serif font-black tracking-widest">LUXE</span>
            </div>
          </motion.div>
        </section>

        {/* INTERACTIVE FEATURE GRID */}
        <section className="bg-white py-40 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-24">
              <div className="lg:col-span-12">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#1A1A1A] mb-8 pr-10">
                  Everything you need for a <br />
                  <span className="italic text-primary">seamless celebration</span>.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Smartphone className="w-7 h-7 text-primary" />,
                  title: "Mobile First Experience",
                  desc: "Optimized for the way people actually use the web—on their phones. Beautiful, fast, and tactile.",
                  image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80"
                },
                {
                  icon: <ShieldCheck className="w-7 h-7 text-secondary" />,
                  title: "Real-time RSVP Sync",
                  desc: "Instant notifications when guests respond. Manage dietary requirements and guest counts with ease.",
                  image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80"
                },
                {
                  icon: <Palette className="w-7 h-7 text-accent" />,
                  title: "Artisan Templates",
                  desc: "Choose from curated styles ranging from Minimalist Modern to Royal Grandeur. One click to apply.",
                  image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="group relative flex flex-col h-full"
                >
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl shadow-black/5">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                    <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-sm font-bold text-[#1A1A1A]">{feature.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">{feature.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TEMPLATES SECTION */}
        <section id="templates" className="bg-[#1A1A1A] py-40 rounded-[4rem] mx-6">
          <TemplatesSection />
        </section>

        {/* THE HOOK / CALL TO ACTION */}
        <section className="py-40 px-6 text-center">
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 blur-[80px] -z-10"
            />
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-[#1A1A1A] mb-12 leading-[1.1]">
              Ready to create something <br />
              <span className="italic font-normal text-primary">truly timeless?</span>
            </h2>
            <p className="text-xl text-text-secondary mb-16 max-w-xl mx-auto font-medium opacity-60">
              Join thousands of happy couples who made their wedding planning
              just as beautiful as the day itself.
            </p>
            <Link href="/builder" className="inline-flex items-center gap-4 px-16 py-8 rounded-full bg-primary text-white font-bold text-xl hover:bg-primary-hover transition-all shadow-2xl shadow-primary/30">
              Build Your Experience <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>
      </main>

      <ExamplesSection isOpen={isExamplesOpen} onClose={() => setIsExamplesOpen(false)} />

      <footer className="py-24 bg-white border-t border-black/[0.03] px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="max-w-xs">
            <img src="/logo.png" alt="QuickWeds Logo" className="h-10 w-auto mb-8 pr-12" />
            <p className="text-text-secondary text-sm leading-relaxed mb-8">
              The premier platform for modern wedding digital experiences.
              Crafting digital forever, one love story at a time.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border border-black/[0.05] flex items-center justify-center hover:bg-primary/5 cursor-pointer transition-colors">
                  <Heart className="w-4 h-4 text-[#1A1A1A]" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div className="flex flex-col gap-6">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]">Product</p>
              <Link href="/builder" className="text-text-secondary text-sm hover:text-primary transition-colors">Digital Invitations</Link>
              <Link href="#templates" className="text-text-secondary text-sm hover:text-primary transition-colors">Style Templates</Link>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary transition-colors">RSVP Manager</Link>
            </div>
            <div className="flex flex-col gap-6">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]">Resources</p>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary transition-colors">Design Guide</Link>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary transition-colors">Photography</Link>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary transition-colors">Help Docs</Link>
            </div>
            <div className="flex flex-col gap-6">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]">Company</p>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary transition-colors">Our Story</Link>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="text-text-secondary text-sm hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-black/[0.03] flex justify-between items-center text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em]">
          <p>© 2026 QuickWeds INC.</p>
          <div className="flex gap-8">
            <span>Made with love by Romie</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

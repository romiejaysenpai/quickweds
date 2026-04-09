'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Smartphone, Share2, ArrowRight, Play, CheckCircle2, Star, Zap, Instagram, Twitter, Facebook, ChevronDown, Plus, Minus, MessageCircle, Globe, Mail, PieChart, LayoutDashboard, Camera, ListTodo, Users, Wallet } from 'lucide-react';
import ExamplesSection from '@/components/ExamplesSection';
import TemplatesSection from '@/components/TemplatesSection';
import PhoneMockupSection from '@/components/PhoneMockupSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const FAQS = [
  {
    question: "How long does it take to create a site?",
    answer: "You can make your wedding site in under 5 minutes. Just type in your details, pick a design, and your site is ready to share."
  },
  {
    question: "Can I use my own web link?",
    answer: "Yes! You can use our free quickweds.com link, or easily attach your own custom web link if you have one."
  },
  {
    question: "Is the RSVP automated?",
    answer: "Yes. When guests RSVP, you will see it right away in your dashboard. We also send an email to confirm their spot automatically."
  },
  {
    question: "Can I add videos?",
    answer: "Yes, you can upload clear videos to share your story with guests."
  },
  {
    question: "Does it work well on phones?",
    answer: "Yes! Every single design we offer looks perfect on both phones and computers."
  },
  {
    question: "What happens after the wedding?",
    answer: "You can turn off the RSVP form and change your site into a 'Thank You' page where you can share your final wedding photos."
  }
];

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/ Event",
    desc: "Try out QuickWeds for free. Great for testing how your site will look.",
    features: ["3 Basic Themes", "RSVP Form & Guest List", "Wedding Timeline", "12 Photos", "Standard Web Link"],
    cta: "Start Free",
    href: "/builder",
    popular: false
  },
  {
    name: "Full Access",
    price: "$14.99",
    period: "/ Year",
    desc: "Get everything you need for your big day. The best choice for most couples.",
    features: ["All 25+ Premium Themes", "Use Your Own Web Link", "Auto Email Replies", "Download Guest List", "Post-Wedding Photo sharing"],
    cta: "Get Full Access for $14.99",
    href: "/builder",
    popular: true
  },
  {
    name: "Custom Build",
    price: "Custom",
    period: "",
    desc: "Want a site built just for you? Our team will design and build it for you.",
    features: ["Private Design Call", "100% Unique Design", "Special Added Features", "We Build It For You", "VIP Support"],
    cta: "Chat With Us",
    href: "https://cal.com/romie-jay-bacasmas-4ywlbo/quikweds-costum-wedding-website-discussion",
    popular: false
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah & Marc",
    date: "December 2025",
    text: "QuickWeds made our invites look so good. Our guests really liked the timeline!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    name: "James & Lily",
    date: "January 2026",
    text: "The RSVP tracker saved us hours of messy spreadsheet work. Also adding our bank details for gifts was super helpful.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily"
  },
  {
    name: "Elena & David",
    date: "February 2026",
    text: "We tried other site builders, but QuickWeds was the easiest to use. It works great on phones too.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
  }
];

function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full flex justify-center items-center gap-4 py-12 opacity-20 pointer-events-none ${className}`}>
      <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-primary" />
      <Heart className="w-4 h-4 text-primary fill-primary" />
      <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-primary" />
    </div>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 -z-20 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 40H0V0h40v40zM1 39h38V1H1v38z' fill='%23C08081' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
  );
}

function Glow({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute glow-decoration w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -z-10 animate-pulse ${className}`} />
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/50 py-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group"
      >
        <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">{question}</h3>
        <div className={`w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all ${isOpen ? 'bg-primary border-primary text-white' : 'text-text-secondary group-hover:border-primary group-hover:text-primary'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-text-secondary leading-relaxed font-light text-lg">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const { user, logout } = useAuth();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubmitted(false), 3000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral selection:bg-primary/20">
      {/* Advanced Background Ornaments */}
      <GridBackground />
      <Glow className="top-0 -right-48" />
      <Glow className="bottom-0 -left-48 opacity-50" />
      <Glow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

      {/* Parallax Mouse Effect Container */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(192, 128, 129, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 40%, rgba(192, 128, 129, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 60%, rgba(192, 128, 129, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(192, 128, 129, 0.05) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img src="/logo.png" alt="QuickWeds Logo" className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8 ml-auto">
            <Link href="#templates" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors hidden md:block">Templates</Link>
            <button onClick={() => setIsExamplesOpen(true)} className="text-sm font-bold text-text-secondary hover:text-primary transition-colors hidden md:block">Examples</button>
            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link href="/dashboard" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all text-xs sm:text-sm min-h-[44px] flex items-center">Dashboard</Link>
                <button onClick={logout} className="text-xs sm:text-sm font-bold text-text-secondary hover:text-foreground transition-all">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link href="/login" className="text-xs sm:text-base font-bold text-text-secondary hover:text-primary transition-colors">Log In</Link>
                <Link href="/signup" className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all text-xs sm:text-sm shadow-lg shadow-primary/20 whitespace-nowrap min-h-[40px] sm:min-h-[44px] flex items-center justify-center">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-32 sm:pb-40 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white border border-border soft-shadow text-primary text-xs font-black uppercase tracking-widest mb-8 sm:mb-10"
          >
            <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" /> Fast & Beautiful
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[7rem] font-serif font-bold text-foreground leading-[1.1] sm:leading-[0.95] md:leading-[0.9] mb-6 sm:mb-12 tracking-tighter"
          >
            Share Your Wedding, <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic font-normal">In Minutes.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-inter text-text-secondary max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed font-light px-2"
          >
            Make a beautiful website for your wedding in less than 5 minutes.
            No coding needed. Just add your details and share the link easily.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-2"
          >
            <Link href="/builder" className="group relative px-6 sm:px-12 py-4 sm:py-6 rounded-lg sm:rounded-2xl bg-primary text-white font-bold text-sm sm:text-lg hover:bg-primary-hover transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 min-h-[44px]">
              Start Building Now <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute -inset-1 rounded-lg sm:rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <section className="bg-neutral/50 py-20 px-6 sm:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-primary/60 mb-3 md:mb-4 block">Built for ease</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">Why Couples Love <span className="italic text-primary">QuickWeds</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <Smartphone className="w-8 h-8 text-primary" />,
                  title: "Looks Great on Phones",
                  desc: "Your website looks perfect on any phone, so guests can easily RSVP and view details.",
                  accent: "bg-primary/5"
                },
                {
                  icon: <LayoutDashboard className="w-8 h-8 text-secondary" />,
                  title: "Easy to Build",
                  desc: "See your changes as you make them. Building is as simple as filling out a form.",
                  accent: "bg-secondary/10"
                },
                {
                  icon: <Globe className="w-8 h-8 text-accent" />,
                  title: "Your Own Link",
                  desc: "Get a simple link to share, or use your own custom web address (like jackandrose.com).",
                  accent: "bg-accent/5"
                },
                {
                  icon: <Mail className="w-8 h-8 text-primary" />,
                  title: "Auto Emails",
                  desc: "We take care of the heavy lifting. We auto-email guests when they RSVP.",
                  accent: "bg-primary/5"
                },
                {
                  icon: <PieChart className="w-8 h-8 text-secondary" />,
                  title: "Track Guests",
                  desc: "See who is coming, their meals, and total guest count in one dashboard.",
                  accent: "bg-secondary/10"
                },
                {
                  icon: <Camera className="w-8 h-8 text-accent" />,
                  title: "Share Photos After",
                  desc: "After the wedding, turn your site into a 'Thank You' page to share photos.",
                  accent: "bg-accent/5"
                },
                {
                  icon: <ListTodo className="w-8 h-8 text-primary" />,
                  title: "Wedding Checklist",
                  desc: "Stay on track with our built-in checklist for all your wedding tasks.",
                  accent: "bg-primary/5"
                },
                {
                  icon: <Wallet className="w-8 h-8 text-secondary" />,
                  title: "Track Budget",
                  desc: "Keep an eye on how much you are spending and stay within your budget effortlessly.",
                  accent: "bg-secondary/10"
                },
                {
                  icon: <Users className="w-8 h-8 text-secondary" />,
                  title: "Manage Vendors",
                  desc: "Save all your vendor contacts, like your florist and photographer, in one spot.",
                  accent: "bg-secondary/10"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`p-8 md:p-10 rounded-3xl md:rounded-[3rem] bg-white border border-border hover:border-primary/20 transition-all soft-shadow relative overflow-hidden group`}
                >
                  <div className={`w-14 md:w-16 h-14 md:h-16 ${feature.accent} rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mb-6 md:mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold mb-3 md:mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-4 md:mb-6 font-light">{feature.desc}</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* WEDDING BUDGET PLANNER HIGHLIGHT SECTION */}
        <section className="py-32 sm:py-40 px-6 bg-gradient-to-br from-secondary/5 to-accent/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-secondary/20 mb-8">
                  <Wallet className="w-4 h-4 text-secondary" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary">Simple Budget Tracking</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                  Keep Your Spending <span className="text-secondary italic">Under Control</span>
                </h2>
                
                <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-6 md:mb-8 font-light">
                  Weddings can get expensive. Our simple budget tool helps you track every dollar, from the venue to the flowers, so you always know where you stand.
                </p>

                <div className="space-y-4 mb-8 md:mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1 text-sm sm:text-base">Track Every Cost</h4>
                      <p className="text-xs sm:text-sm text-text-secondary">Add your costs and see your budget update right away.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1 text-sm sm:text-base">Sort by Group</h4>
                      <p className="text-xs sm:text-sm text-text-secondary">Keep your costs neat by putting them in groups like 'Food' or 'Music'.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1 text-sm sm:text-base">Clear Summary</h4>
                      <p className="text-xs sm:text-sm text-text-secondary">See simple charts that show you exactly how much money is left.</p>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/builder" 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary-hover transition-all shadow-lg shadow-secondary/20 group"
                >
                  Explore Budget Planner
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Right: Visual */}
              <motion.div
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/10 rounded-3xl blur-3xl -z-10"></div>
                  
                  {/* Card Container */}
                  <div className="bg-white border border-border rounded-3xl p-8 soft-shadow">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-serif font-bold text-foreground">Wedding Budget</h3>
                        <div className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">$45,000</div>
                      </div>

                      {/* Budget Items */}
                      <div className="space-y-4">
                        {[
                          { name: "Venue & Catering", spent: 15000, budget: 18000, color: "bg-primary" },
                          { name: "Photography", spent: 3500, budget: 4000, color: "bg-secondary" },
                          { name: "Florals & Decor", spent: 2800, budget: 3500, color: "bg-accent" },
                          { name: "Entertainment", spent: 1200, budget: 2000, color: "bg-emerald-500" }
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-foreground">{item.name}</span>
                              <span className="text-xs text-text-secondary">${item.spent.toLocaleString()} / ${item.budget.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-neutral rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.color} rounded-full transition-all`}
                                style={{ width: `${(item.spent / item.budget) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="border-t border-border pt-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">Total Spent</span>
                          <span className="font-bold text-primary">$22,500</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">Remaining Budget</span>
                          <span className="font-bold text-secondary">$22,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <div id="templates">
          <TemplatesSection />
        </div>

        <SectionDivider />

        {/* PRICING SECTION */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-primary/60 mb-4 block">Simple & Transparent</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Choose Your <span className="italic text-primary">Subscription Plan</span></h2>
              <p className="text-text-secondary max-w-xl mx-auto font-light">Whether it's an intimate ceremony or a grand gala, we have a plan that fits your needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {PRICING_PLANS.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-10 rounded-[3rem] border transition-all duration-500 hover:scale-105 ${plan.popular ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/40 ring-4 ring-primary/10' : 'bg-white text-foreground border-border soft-shadow'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>
                  )}
                  <h3 className="text-xl font-serif font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-serif font-bold tracking-tight">{plan.price}</span>
                    <span className={`text-sm opacity-60 font-light`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mb-8 font-light ${plan.popular ? 'text-white/80' : 'text-text-secondary'}`}>{plan.desc}</p>

                  <div className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                        <span className="text-sm font-light">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={plan.href}
                    target={plan.href.startsWith('http') ? '_blank' : undefined}
                    className={`block w-full py-4 rounded-2xl font-bold text-center transition-all ${plan.popular ? 'bg-white text-primary hover:bg-neutral' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* TESTIMONIALS SECTION */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <Star className="w-12 h-12 text-primary mx-auto mb-6 opacity-20" />
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Trusted by <span className="italic text-primary">Beautiful Souls</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-border p-10 rounded-[3rem] soft-shadow relative group hover:border-primary/20 transition-all"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-lg font-serif italic text-foreground mb-8 line-clamp-4 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-border" />
                    <div>
                      <p className="font-bold text-sm text-foreground">{t.name}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-40">{t.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 md:py-32 px-6 bg-neutral/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 md:mb-6">Common Questions</h2>
              <p className="text-text-secondary text-base md:text-lg font-light">Everything you need to know about making your wedding site.</p>
            </div>
            <div className="bg-white border border-border p-6 md:p-16 rounded-3xl md:rounded-[4rem] soft-shadow">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* NEWSLETTER SECTION */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20 rounded-3xl md:rounded-[4rem] bg-white border border-border soft-shadow relative overflow-hidden text-center group">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-45 duration-700">
              <Share2 className="w-32 h-32" />
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <span className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mb-4 block">Wedding Tips</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 md:mb-6">Get wedding tips & ideas</h2>
              <p className="text-sm md:text-base text-text-secondary mx-auto max-w-lg mb-8 md:mb-10 font-light">Join 5,000+ couples getting our free emails about wedding planning and trends.</p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-xl md:rounded-2xl bg-neutral border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light min-h-[44px]"
                  required
                />
                <button 
                  onClick={handleNewsletterSubmit}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl md:rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all whitespace-nowrap min-h-[44px]"
                >
                  {newsletterSubmitted ? '✓ Subscribed!' : 'Subscribe'}
                </button>
              </div>
              {newsletterSubmitted && <p className="text-xs text-green-600 font-bold mt-3">✓ Thank you for subscribing!</p>}
            </motion.div>
          </div>
        </section>

        {/* FINAL HOOK */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-6xl mx-auto bg-primary text-white p-10 md:p-24 rounded-3xl md:rounded-[4rem] relative overflow-hidden shadow-2xl shadow-primary/40 text-center">
            <div className="absolute top-0 right-0 p-8 opacity-20"><Star className="w-24 md:w-32 h-24 md:h-32 rotate-12" /></div>
            <div className="absolute bottom-0 left-0 p-8 opacity-20"><Heart className="w-24 md:w-32 h-24 md:h-32 -rotate-12" /></div>

            <h2 className="text-3xl md:text-6xl font-serif font-bold mb-6 md:mb-10 relative z-10 leading-[1.1] max-w-2xl mx-auto">
              Ready to make your <span className="italic font-normal">wedding site</span>?
            </h2>
            <p className="text-sm md:text-xl mb-8 md:mb-12 opacity-90 font-light max-w-xl mx-auto relative z-10">
              Join thousands of happy couples who used QuickWeds to share their special day.
            </p>
            <Link href="/builder" className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-12 py-4 md:py-5 bg-white text-primary rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-neutral transition-all relative z-10">
              Get Started for Free <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
            </Link>
          </div>
        </section>
      </main>

      <ExamplesSection isOpen={isExamplesOpen} onClose={() => setIsExamplesOpen(false)} />

      <footer className="py-32 bg-white border-t border-border px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="inline-block mb-8">
                <img src="/logo.png" alt="QuickWeds Logo" className="h-10 w-auto object-contain" />
              </Link>
              <p className="text-text-secondary text-sm leading-relaxed font-light mb-8">
                QuickWeds is the fastest way to create premium, interactive, and mobile-first wedding landing pages.
              </p>
              <div className="flex gap-4">
                <a href="https://instagram.com/quickweds" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-primary hover:border-primary hover:text-white transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://twitter.com/quickweds" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-primary hover:border-primary hover:text-white transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://facebook.com/quickweds" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-primary hover:border-primary hover:text-white transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-12">
              <div className="flex flex-col gap-6">
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground">Platform</p>
                <div className="flex flex-col gap-4">
                  <Link href="/builder" className="text-text-secondary text-sm hover:text-primary transition-colors">Builder</Link>
                  <Link href="#templates" className="text-text-secondary text-sm hover:text-primary transition-colors">Templates</Link>
                  <button onClick={() => setIsExamplesOpen(true)} className="text-left text-text-secondary text-sm hover:text-primary transition-colors">Examples</button>
                  <Link href="/login" className="text-text-secondary text-sm hover:text-primary transition-colors">Login</Link>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground">Support</p>
                <div className="flex flex-col gap-4">
                  <a href="mailto:support@quickweds.site" className="text-text-secondary text-sm hover:text-primary transition-colors">Help Center</a>
                  <a href="mailto:support@quickweds.site" className="text-text-secondary text-sm hover:text-primary transition-colors">Guidelines</a>
                  <a href="mailto:support@quickweds.site" className="text-text-secondary text-sm hover:text-primary transition-colors">Contact</a>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground">Legal</p>
                <div className="flex flex-col gap-4">
                  <a href="/privacy" className="text-text-secondary text-sm hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="/terms" className="text-text-secondary text-sm hover:text-primary transition-colors">Terms of Service</a>
                  <a href="/cookies" className="text-text-secondary text-sm hover:text-primary transition-colors">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em]">© 2026 QuickWeds. Crafting digital forever.</p>
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        <motion.a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 group cursor-pointer"
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute right-full mr-4 px-4 py-2 bg-white text-foreground text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat with us</span>
        </motion.a>

        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          className="w-16 h-16 bg-white border border-border text-foreground rounded-full flex items-center justify-center shadow-xl hover:bg-neutral transition-all cursor-pointer"
        >
          <ChevronDown className="w-6 h-6 rotate-180" />
        </motion.button>
      </div>
    </div>
  );
}

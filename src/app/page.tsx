'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Smartphone, Share2, ArrowRight, Play, CheckCircle2, Star, Zap, Instagram, Twitter, Facebook, ChevronDown, Plus, Minus, MessageCircle, Globe, Mail, PieChart, LayoutDashboard, Camera, ListTodo, Users } from 'lucide-react';
import ExamplesSection from '@/components/ExamplesSection';
import TemplatesSection from '@/components/TemplatesSection';
import PhoneMockupSection from '@/components/PhoneMockupSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const FAQS = [
  {
    question: "How long does it take to create a site?",
    answer: "With QuickWeds, you can have a professional wedding landing page ready in under 5 minutes. Simply fill in your details, choose a template, and your site is live instantly."
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes! While we provide a clean quickweds.com/w/your-id URL for free, you can easily map your own custom domain in the dashboard."
  },
  {
    question: "Is the RSVP system automated?",
    answer: "Absolutely. All guest responses are tracked in real-time on your dashboard analytics. Our integration with Resend automatically fires a confirmation email to your guests, and an instant notification to you with their dietary specifics."
  },
  {
    question: "Can I upload high-quality videos?",
    answer: "Yes, we support high-definition video uploads (up to 50MB) for your wedding teasers and stories, ensuring your memories look stunning on all devices."
  },
  {
    question: "Are the templates mobile-friendly?",
    answer: "Every single one of our 25+ templates is designed with a mobile-first approach. They look and function perfectly on iPhones, Androids, and tablets."
  },
  {
    question: "What happens after the wedding?",
    answer: "Activate 'Thank You Mode' to hide the RSVP form and swap it out for a heartfelt thank-you message and a link to your official photo gallery for all guests to relive the memories."
  }
];

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/ Event",
    desc: "Experience the magic of QuickWeds with no commitment. Perfect for exploring our platform and starting your journey.",
    features: ["3 Basic Templates", "RSVP Form & Analytics", "Interactive Timeline", "12 Gallery Photos", "Automated OG SEO Tags"],
    cta: "Start for Free",
    href: "/builder",
    popular: false
  },
  {
    name: "1-Year Access",
    price: "$14.99",
    period: "/ Year",
    desc: "Our most loved plan. Unlock the full potential of your wedding website with every premium feature included. Limited time offer for couples who want perfection.",
    features: ["All 25+ Designer Templates", "Custom Domain Connect (e.g. yourname.com)", "Two-Way Email Automations", "CSV Guest List Export & Editing", "Post-Wedding 'Thank You' Mode"],
    cta: "GET 1-Year Access for Only $14.99 Now",
    href: "/builder",
    popular: true
  },
  {
    name: "Custom Website",
    price: "Custom",
    period: "",
    desc: "Need something truly unique? Our design team will build your dream wedding website from scratch, tailored perfectly to your vision and style.",
    features: ["Bespoke Designer Consultation", "Fully Custom Layouts & Content", "Advanced Interactive Features", "Concierge Setup & Management", "White-glove Service Start-to-Finish"],
    cta: "Book a Consultation Now",
    href: "https://cal.com/romie-jay-bacasmas-4ywlbo/quikweds-costum-wedding-website-discussion",
    popular: false
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah & Marc",
    date: "December 2025",
    text: "QuickWeds made our digital invitations look so premium. Our guests were genuinely impressed by the interactive timeline!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    name: "James & Lily",
    date: "January 2026",
    text: "The RSVP tracking saved us hours of stressful spreadsheet work. The ability to add our bank details and QR codes for gifts was a lifesaver.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily"
  },
  {
    name: "Elena & David",
    date: "February 2026",
    text: "We tried other site builders, but nothing was as easy or looked as elegant as QuickWeds. The mobile experience is flawless.",
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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img src="/logo.png" alt="QuickWeds Logo" className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-8 ml-auto">
            <Link href="#templates" className="text-xs sm:text-sm font-bold text-text-secondary hover:text-primary transition-colors hidden md:block">Templates</Link>
            <button onClick={() => setIsExamplesOpen(true)} className="text-xs sm:text-sm font-bold text-text-secondary hover:text-primary transition-colors hidden md:block">Examples</button>
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/dashboard" className="px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all text-xs sm:text-sm">Dashboard</Link>
                <button onClick={logout} className="text-xs sm:text-sm font-bold text-text-secondary hover:text-foreground transition-all hidden sm:block">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/login" className="text-xs sm:text-sm font-bold text-text-secondary hover:text-primary transition-colors hidden sm:block">Log In</Link>
                <Link href="/signup" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all text-xs sm:text-sm shadow-lg shadow-primary/20 whitespace-nowrap">Get Started</Link>
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
            <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" /> AI-Powered Elegance
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[7rem] font-serif font-bold text-foreground leading-[1.1] sm:leading-[0.95] md:leading-[0.9] mb-8 sm:mb-12 tracking-tighter"
          >
            Your Love Story, <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic font-normal">Digitally Perfected.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-inter text-text-secondary max-w-2xl mx-auto mb-12 sm:mb-16 leading-relaxed font-light px-2"
          >
            Craft a breathtaking, interactive wedding landing page in under 5 minutes.
            No code, no stress—just pure, digital enchantment for your most special day.
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
        <section className="bg-neutral/50 py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-primary/60 mb-4 block">Engineered for perfection</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Why Couples Love <span className="italic text-primary">QuickWeds</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Smartphone className="w-8 h-8 text-primary" />,
                  title: "Mobile Mastery",
                  desc: "Every design is crafted for a perfect smartphone experience, ensuring every guest feels VIP.",
                  accent: "bg-primary/5"
                },
                {
                  icon: <LayoutDashboard className="w-8 h-8 text-secondary" />,
                  title: "Live Split-Pane Builder",
                  desc: "Build your dream site visually. See your edits update instantly side-by-side with no coding required.",
                  accent: "bg-secondary/10"
                },
                {
                  icon: <Globe className="w-8 h-8 text-accent" />,
                  title: "Custom Domains",
                  desc: "Connect your own unique web address (e.g., jackandrose.com) for a truly premium, white-labeled experience.",
                  accent: "bg-accent/5"
                },
                {
                  icon: <Mail className="w-8 h-8 text-primary" />,
                  title: "Two-Way Emails",
                  desc: "Automated Resend integration instantly emails confirmation to your guests and sends you their dietary needs.",
                  accent: "bg-primary/5"
                },
                {
                  icon: <PieChart className="w-8 h-8 text-secondary" />,
                  title: "Analytics Dashboard",
                  desc: "Track attendance via beautiful pie charts, instantly export CSVs, and manage your guest list seamlessly.",
                  accent: "bg-secondary/10"
                },
                {
                  icon: <Camera className="w-8 h-8 text-accent" />,
                  title: "Post-Wedding Mode",
                  desc: "Swap out the RSVP form for a beautiful 'Thank You' banner linking directly to your official photo albums.",
                  accent: "bg-accent/5"
                },
                {
                  icon: <ListTodo className="w-8 h-8 text-primary" />,
                  title: "Smart Planner Ecosystem",
                  desc: "Manage your big day flawlessly with our interactive checklist, customizable budget tracker, and more.",
                  accent: "bg-primary/5"
                },
                {
                  icon: <Users className="w-8 h-8 text-secondary" />,
                  title: "Vendor Rolodex",
                  desc: "Keep all your hired professionals' contacts, deposit statuses, and custom supplier profiles in one clean place.",
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
                  className={`p-10 rounded-[3rem] bg-white border border-border hover:border-primary/20 transition-all soft-shadow relative overflow-hidden group`}
                >
                  <div className={`w-16 h-16 ${feature.accent} rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed mb-6 font-light">{feature.desc}</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Feature <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        <PhoneMockupSection />

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
        <section className="py-32 px-6 bg-neutral/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Common Questions</h2>
              <p className="text-text-secondary text-lg font-light">Everything you need to know about creating your dream invitations.</p>
            </div>
            <div className="bg-white border border-border p-8 md:p-16 rounded-[4rem] soft-shadow">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* NEWSLETTER SECTION */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto px-10 py-20 rounded-[4rem] bg-white border border-border soft-shadow relative overflow-hidden text-center group">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-45 duration-700">
              <Share2 className="w-32 h-32" />
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <span className="text-primary text-xs font-black uppercase tracking-[0.4em] mb-4 block">The Wedding Edit</span>
              <h2 className="text-4xl font-serif font-bold text-foreground mb-6">Get wedding tips and inspiration</h2>
              <p className="text-text-secondary mx-auto max-w-lg mb-10 font-light">Join 5,000+ couples receiving our monthly newsletter on trends, planning, and digital etiquette.</p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-neutral border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light min-h-[44px]"
                  required
                />
                <button 
                  onClick={handleNewsletterSubmit}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all whitespace-nowrap min-h-[44px]"
                >
                  {newsletterSubmitted ? '✓ Subscribed!' : 'Subscribe'}
                </button>
              </div>
              {newsletterSubmitted && <p className="text-xs text-green-600 font-bold mt-3">✓ Thank you for subscribing!</p>}
            </motion.div>
          </div>
        </section>

        {/* FINAL HOOK */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto bg-primary text-white p-16 md:p-24 rounded-[4rem] relative overflow-hidden shadow-2xl shadow-primary/40 text-center">
            <div className="absolute top-0 right-0 p-8 opacity-20"><Star className="w-32 h-32 rotate-12" /></div>
            <div className="absolute bottom-0 left-0 p-8 opacity-20"><Heart className="w-32 h-32 -rotate-12" /></div>

            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10 relative z-10 leading-[1.1] max-w-2xl mx-auto">
              Ready to create your <span className="italic font-normal">digital forever</span>?
            </h2>
            <p className="text-xl mb-12 opacity-80 font-light max-w-xl mx-auto relative z-10">
              Join thousands of couples who have chosen QuickWeds to tell their unique love stories.
            </p>
            <Link href="/builder" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-primary rounded-2xl font-bold text-lg hover:bg-neutral transition-all relative z-10">
              Get Started for Free <ArrowRight className="w-5 h-5" />
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

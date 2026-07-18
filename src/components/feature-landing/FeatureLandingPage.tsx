'use client';

import { useMemo, useRef, useState, type DragEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Armchair, ArrowRight, CalendarClock, Check, ChevronDown, CircleDollarSign, HeartHandshake,
  LayoutDashboard, ListTodo, MailCheck, PanelsTopLeft, PieChart, QrCode,
  Send, Smartphone, Sparkles, Star, UtensilsCrossed, UsersRound, WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { featureContent, featureKeys, type FeatureKey } from './content';

const siteUrl = 'https://quickweds.site';
const screenshotUrls: Record<FeatureKey, string> = {
  budget: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/BUDGET%20TARCKER.png',
  checklist: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/TASK%20AND%20CHECK%20LIST%20PALNNER.png',
  rsvp: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Smart%20RSVP%20Management.png',
  seating: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/GUERST%20LIST%20SEETING.png',
  website: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Wedding%20Website%20Builder.png',
};

const heroImagePaths: Record<FeatureKey, string> = {
  budget: '/feature-heroes/budget-planner-couple-hero.png',
  checklist: '/feature-heroes/checklist-couple-hero.png',
  rsvp: '/feature-heroes/rsvp-couple-hero.png',
  seating: '/feature-heroes/seating-chart-couple-hero.png',
  website: '/feature-heroes/website-builder-couple-hero.png',
};

const iconMap: Record<string, LucideIcon> = {
  WalletCards, PieChart, HeartHandshake, ListTodo, CalendarClock, UsersRound, MailCheck,
  QrCode, UtensilsCrossed, LayoutDashboard, Armchair, PanelsTopLeft, Send, Smartphone,
};

function Cta({ children = 'Start planning free', variant = 'primary' }: { children?: React.ReactNode; variant?: 'primary' | 'light' }) {
  return (
    <Link
      href="/builder"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        variant === 'primary'
          ? 'bg-primary text-white shadow-xl shadow-primary/25 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-primary/35'
          : 'border border-primary/20 bg-white/85 text-primary shadow-sm hover:border-primary hover:bg-white'
      }`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{eyebrow}</p>
      <h2 className="[font-family:var(--font-montserrat)] text-[clamp(2.1rem,5vw,3.85rem)] font-black leading-[0.98] tracking-[-0.055em] text-foreground">{title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-text-secondary sm:text-lg sm:leading-8">{body}</p>
    </div>
  );
}

function FeatureHeroVisual({ feature, title }: { feature: FeatureKey; title: string }) {
  return (
    <div className="relative mx-auto w-full max-w-3xl py-3 sm:py-5">
      <div aria-hidden="true" className="absolute -left-6 top-0 h-32 w-32 rounded-full border border-white/65 bg-white/25 shadow-[0_18px_50px_rgba(128,75,89,.14)]" />
      <div aria-hidden="true" className="absolute -bottom-2 -right-3 h-36 w-36 rounded-full border-[10px] border-accent/35 bg-white/20" />
      <div aria-hidden="true" className="absolute bottom-2 left-1/4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/40 p-2 shadow-[0_30px_80px_rgba(87,55,62,.22)] backdrop-blur-sm sm:rotate-[1.3deg] sm:p-3">
        <Image
          src={heroImagePaths[feature]}
          alt={`A couple planning with QuickWeds ${title}`}
          width={1792}
          height={1024}
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="aspect-[7/4] w-full rounded-[1.25rem] object-cover object-center"
        />
        <div className="pointer-events-none absolute bottom-5 left-5 rounded-2xl border border-white/75 bg-white/84 px-3 py-2 shadow-lg backdrop-blur-md sm:bottom-7 sm:left-7 sm:px-4"><p className="text-[9px] font-black uppercase tracking-[.16em] text-primary">Plan together</p><p className="mt-0.5 text-xs font-black text-foreground">Every detail, in one place</p></div>
      </div>
    </div>
  );
}

function LiveBudgetScreenshot() {
  return (
    <div className="relative mx-auto w-full max-w-md sm:max-w-lg">
      <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-primary/12 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white p-2 shadow-[0_24px_60px_rgba(87,55,62,.14)] sm:p-3">
        <Image
          src="/app-screenshots/budget-tracker-dashboard.png"
          alt="QuickWeds Budget Tracker dashboard"
          width={1500}
          height={1050}
          sizes="(min-width: 1024px) 42vw, (min-width: 640px) 65vw, 92vw"
          className="h-auto w-full rounded-[1.2rem] object-contain"
        />
      </div>
      <div className="absolute -bottom-4 -right-2 rounded-2xl border border-white bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:right-3"><p className="text-[9px] font-black uppercase tracking-[.14em] text-primary">Live QuickWeds screen</p><p className="mt-0.5 text-xs font-black text-foreground">Designed for planning together</p></div>
    </div>
  );
}

function LiveSeatingScreenshot() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-primary/12 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white p-2 shadow-[0_24px_60px_rgba(87,55,62,.14)] sm:p-3">
        <Image
          src="/app-screenshots/seating-chart-builder-dashboard.png"
          alt="QuickWeds Seating Chart Builder dashboard"
          width={1698}
          height={1698}
          sizes="(min-width: 1024px) 42vw, (min-width: 640px) 65vw, 92vw"
          className="h-auto w-full rounded-[1.2rem] object-contain"
        />
      </div>
      <div className="absolute -bottom-4 -right-2 rounded-2xl border border-white bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:right-3"><p className="text-[9px] font-black uppercase tracking-[.14em] text-primary">Live QuickWeds screen</p><p className="mt-0.5 text-xs font-black text-foreground">See every seat at a glance</p></div>
    </div>
  );
}

function LiveChecklistScreenshot() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-primary/12 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white p-2 shadow-[0_24px_60px_rgba(87,55,62,.14)] sm:p-3">
        <Image
          src="/app-screenshots/planner-checklist-dashboard.png"
          alt="QuickWeds Planner Checklist dashboard"
          width={1536}
          height={1024}
          sizes="(min-width: 1024px) 50vw, (min-width: 640px) 75vw, 92vw"
          className="h-auto w-full rounded-[1.2rem] object-contain"
        />
      </div>
      <div className="absolute -bottom-4 -right-2 rounded-2xl border border-white bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:right-3"><p className="text-[9px] font-black uppercase tracking-[.14em] text-primary">Live QuickWeds screen</p><p className="mt-0.5 text-xs font-black text-foreground">Keep every task in view</p></div>
    </div>
  );
}

function LiveWebsiteBuilderScreenshot() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-primary/12 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white p-2 shadow-[0_24px_60px_rgba(87,55,62,.14)] sm:p-3">
        <Image
          src="/app-screenshots/wedding-website-builder-dashboard.png"
          alt="QuickWeds wedding website builder dashboard"
          width={1536}
          height={1024}
          sizes="(min-width: 1024px) 50vw, (min-width: 640px) 75vw, 92vw"
          className="h-auto w-full rounded-[1.2rem] object-contain"
        />
      </div>
      <div className="absolute -bottom-4 -right-2 rounded-2xl border border-white bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:right-3"><p className="text-[9px] font-black uppercase tracking-[.14em] text-primary">Live QuickWeds screen</p><p className="mt-0.5 text-xs font-black text-foreground">Build and preview in one place</p></div>
    </div>
  );
}

function ProductSnapshot({ feature, compact = false }: { feature: FeatureKey; compact?: boolean }) {
  if (compact && feature === 'budget') return <LiveBudgetScreenshot />;
  if (compact && feature === 'seating') return <LiveSeatingScreenshot />;
  if (compact && feature === 'checklist') return <LiveChecklistScreenshot />;
  if (compact && feature === 'website') return <LiveWebsiteBuilderScreenshot />;
  const labels: Record<FeatureKey, string[]> = {
    budget: ['Budget overview', 'Expenses', 'Payments'],
    checklist: ['Planning overview', 'Tasks', 'Timeline'],
    rsvp: ['RSVP dashboard', 'Guest list', 'Messages'],
    seating: ['Table plan', 'Guests', 'Seat finder'],
    website: ['Website editor', 'Sections', 'Preview'],
  };
  const tabs = labels[feature];

  return (
    <div className={`overflow-hidden rounded-[1.65rem] border border-primary/15 bg-white shadow-[0_28px_70px_rgba(87,55,62,.16)] ${compact ? '' : 'sm:rotate-[1.3deg]'}`}>
      <div className="flex items-center gap-2 border-b border-border bg-[#fffaf7] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-primary/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-secondary/80" />
        <span className="ml-2 rounded-md bg-white px-3 py-1 text-[10px] font-bold text-text-secondary">quickweds.site</span>
      </div>
      <div className="grid min-h-72 grid-cols-[8.5rem_1fr]">
        <aside className="hidden border-r border-border bg-neutral p-4 sm:block">
          <Image src="/logo.png" alt="QuickWeds" width={105} height={38} className="h-auto w-24" />
          {tabs.map((tab, index) => <span key={tab} className={`mt-5 block rounded-xl px-3 py-2 text-xs font-bold ${index === 0 ? 'bg-primary text-white' : 'text-text-secondary'}`}>{tab}</span>)}
        </aside>
        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">QuickWeds</p><p className="mt-1 text-xl font-black tracking-[-.04em] text-foreground">{tabs[0]}</p></div><span className="h-10 w-10 rounded-full bg-secondary/50" /></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">{['Guests', 'Progress', 'Upcoming'].map((label, index) => <div key={label} className="rounded-2xl border border-border bg-[#fffaf7] p-3"><span className="block h-2 w-10 rounded-full bg-primary/20" /><span className="mt-3 block h-5 w-14 rounded-full bg-primary/65" /><span className={`mt-2 block h-2 rounded-full ${index === 1 ? 'w-10 bg-accent/70' : 'w-8 bg-primary/15'}`} /></div>)}</div>
          <div className="mt-4 flex h-28 items-end gap-2 rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/25 to-accent/20 p-4">{[38, 66, 48, 82, 59, 94, 72].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-primary/60" style={{ height: `${height}%` }} />)}</div>
        </div>
      </div>
    </div>
  );
}

function LegacyBudgetDemo() {
  const [budget, setBudget] = useState(28000);
  const [expenses, setExpenses] = useState({ Venue: 9800, Catering: 6200, Photo: 3400, Style: 2100 });
  const spent = Object.values(expenses).reduce((total, amount) => total + amount, 0);
  const percent = Math.min(100, Math.round((spent / Math.max(budget, 1)) * 100));
  const remaining = budget - spent;
  return <div className="grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
    <div className="rounded-[1.5rem] border border-primary/10 bg-white p-5 shadow-[0_20px_50px_rgba(87,55,62,.09)] sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-primary">Total wedding budget</p><label className="mt-2 flex items-baseline gap-1 text-4xl font-black text-foreground"><span className="text-xl text-primary">$</span><input aria-label="Total wedding budget" type="number" min="0" value={budget} onChange={(event) => setBudget(Number(event.target.value) || 0)} className="w-40 bg-transparent outline-none" /></label></div><CircleDollarSign className="h-10 w-10 text-primary/45" /></div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-neutral"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${percent}%` }} /></div>
      <div className="mt-3 flex justify-between gap-4 text-xs font-bold text-text-secondary"><span>${spent.toLocaleString()} allocated</span><span className={remaining < 0 ? 'text-red-600' : 'text-primary'}>${Math.abs(remaining).toLocaleString()} {remaining < 0 ? 'over' : 'remaining'}</span></div>
      <div className="mt-7 space-y-3">{Object.entries(expenses).map(([name, amount], index) => <label key={name} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-neutral px-4 py-3"><span className="flex items-center gap-2 text-sm font-bold text-foreground"><span className={`h-2.5 w-2.5 rounded-full ${['bg-primary', 'bg-secondary', 'bg-accent', 'bg-[#8eb8a3]'][index]}`} />{name}</span><span className="flex items-center gap-1 text-sm font-black"><span className="text-text-secondary">$</span><input aria-label={`${name} budget`} type="number" min="0" value={amount} onChange={(event) => setExpenses((current) => ({ ...current, [name]: Number(event.target.value) || 0 }))} className="w-20 bg-transparent text-right outline-none" /></span></label>)}</div>
    </div>
    <div className="rounded-[1.5rem] bg-primary p-6 text-white shadow-xl shadow-primary/20 sm:p-7"><p className="text-xs font-black uppercase tracking-[.2em] text-white/60">At a glance</p><p className="mt-4 text-5xl font-black tracking-[-.07em]">{percent}%</p><p className="mt-1 text-sm font-bold text-white/75">of your budget is planned</p><div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-sm font-bold">You are {remaining >= 0 ? 'planning with room to breathe.' : 'over your goal—time to rebalance.'}</p><p className="mt-2 text-sm leading-6 text-white/70">Every quote, deposit, and final payment stays in one calm workspace.</p></div><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">4</p><p className="text-[10px] font-black uppercase tracking-wider text-white/60">categories</p></div><div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">2</p><p className="text-[10px] font-black uppercase tracking-wider text-white/60">due soon</p></div></div></div>
  </div>;
}

function BudgetDemo() {
  const currencies = [
    { code: 'USD', label: 'US Dollar ($)', symbol: '$', locale: 'en-US' },
    { code: 'PHP', label: 'Philippine Peso (₱)', symbol: '₱', locale: 'en-PH' },
    { code: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥', locale: 'ja-JP' },
    { code: 'EUR', label: 'Euro (€)', symbol: '€', locale: 'de-DE' },
    { code: 'GBP', label: 'British Pound (£)', symbol: '£', locale: 'en-GB' },
    { code: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$', locale: 'en-AU' },
  ] as const;
  const [currencyCode, setCurrencyCode] = useState<typeof currencies[number]['code']>('USD');
  const [budgetInput, setBudgetInput] = useState('0');
  const [expenses, setExpenses] = useState<Record<string, number>>({ Venue: 9800, Catering: 6200, Photo: 3400, Style: 2100 });
  const totalInputRef = useRef<HTMLInputElement>(null);
  const currency = currencies.find((item) => item.code === currencyCode) ?? currencies[0];
  const budget = Number(budgetInput) || 0;
  const spent = Object.values(expenses).reduce((total, amount) => total + amount, 0);
  const percent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const remaining = budget - spent;
  const formatMoney = (amount: number) => new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code, maximumFractionDigits: 0 }).format(amount);
  const updateBudget = (value: string) => setBudgetInput(value.replace(/\D/g, ''));
  const adjustBudget = (amount: number) => setBudgetInput(String(Math.max(0, budget + amount)));
  const updateExpense = (name: string, value: string) => setExpenses((current) => ({ ...current, [name]: Number(value.replace(/\D/g, '')) || 0 }));

  return <div className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
    <section className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-white via-white to-[#fff8f4] p-5 shadow-[0_20px_50px_rgba(87,55,62,.1)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Wedding budget calculator</p><h3 className="mt-2 text-2xl font-black tracking-[-.045em] text-foreground sm:text-3xl">Plan freely. Spend confidently.</h3><p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-text-secondary">Add your target, adjust the categories, and see your remaining budget instantly.</p></div><label className="rounded-xl border border-primary/15 bg-white px-3 py-2 shadow-sm"><span className="block text-[9px] font-black uppercase tracking-[.14em] text-text-secondary">Currency</span><select aria-label="Currency" value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value as typeof currencies[number]['code'])} className="mt-1 max-w-40 bg-transparent text-sm font-black text-primary outline-none"><option value="USD">USD · $</option><option value="PHP">PHP · ₱</option><option value="JPY">JPY · ¥</option><option value="EUR">EUR · €</option><option value="GBP">GBP · £</option><option value="AUD">AUD · A$</option></select></label></div>
      <div className="mt-6 rounded-[1.5rem] border border-primary/15 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-4"><label className="block min-w-0"><span className="text-xs font-black uppercase tracking-[.18em] text-primary">Total wedding budget</span><span className="mt-2 flex items-baseline gap-1"><span className="text-2xl font-black text-primary">{currency.symbol}</span><input ref={totalInputRef} id="budget-calculator-total" aria-label="Total wedding budget" inputMode="numeric" pattern="[0-9]*" value={budgetInput} onFocus={() => { if (budgetInput === '0') setBudgetInput(''); }} onBlur={() => { if (!budgetInput) setBudgetInput('0'); }} onChange={(event) => updateBudget(event.target.value)} className="min-w-0 w-full max-w-64 bg-transparent text-4xl font-black tracking-[-.055em] text-foreground outline-none placeholder:text-primary/35 sm:text-5xl" /></span></label><CircleDollarSign className="h-11 w-11 shrink-0 text-primary/35" /></div><div className="mt-5 flex flex-wrap gap-2"><span className="mr-1 self-center text-[10px] font-black uppercase tracking-[.14em] text-text-secondary">Quick add</span>{[1000, 5000, 10000].map((amount) => <button type="button" key={amount} onClick={() => adjustBudget(amount)} className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-black text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white">+ {formatMoney(amount)}</button>)}</div></div>
      <div className="mt-5 rounded-2xl bg-neutral p-4"><div className="flex items-center justify-between gap-4"><span className="text-sm font-black text-foreground">Your plan is {percent}% allocated</span><span className={`rounded-full px-3 py-1.5 text-xs font-black ${remaining < 0 ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'}`}>{budget === 0 ? 'Set a budget to begin' : `${formatMoney(Math.abs(remaining))} ${remaining < 0 ? 'over' : 'left'}`}</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full transition-[width] duration-300 ${remaining < 0 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${percent}%` }} /></div><div className="mt-3 flex flex-wrap justify-between gap-2 text-xs font-bold text-text-secondary"><span>{formatMoney(spent)} allocated</span><span>{budget > 0 ? `${formatMoney(budget)} total` : 'Enter your target above'}</span></div></div>
      <div className="mt-6 space-y-3"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[.18em] text-text-secondary">Your categories</p><button type="button" onClick={() => setExpenses({ Venue: 0, Catering: 0, Photo: 0, Style: 0 })} className="text-xs font-black text-primary hover:text-primary-hover">Clear amounts</button></div>{Object.entries(expenses).map(([name, amount], index) => <label key={name} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-transparent bg-neutral px-4 py-3 transition focus-within:border-primary/30 focus-within:bg-white"><span className="flex items-center gap-2 text-sm font-bold text-foreground"><span className={`h-2.5 w-2.5 rounded-full ${['bg-primary', 'bg-secondary', 'bg-accent', 'bg-[#8eb8a3]'][index]}`} />{name}</span><span className="flex items-center gap-1 text-sm font-black"><span className="text-text-secondary">{currency.symbol}</span><input aria-label={`${name} budget`} inputMode="numeric" pattern="[0-9]*" value={amount || ''} placeholder="0" onChange={(event) => updateExpense(name, event.target.value)} className="w-24 bg-transparent text-right font-black text-foreground outline-none placeholder:text-text-secondary/50" /></span></label>)}</div>
    </section>
    <aside className="relative overflow-hidden rounded-[1.75rem] bg-primary p-6 text-white shadow-xl shadow-primary/25 sm:p-7"><div aria-hidden="true" className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[18px] border-white/10" /><div className="relative"><p className="text-xs font-black uppercase tracking-[.2em] text-white/65">At a glance</p><p aria-live="polite" className="mt-4 text-5xl font-black tracking-[-.07em]">{percent}%</p><p className="mt-1 text-sm font-bold text-white/75">of your budget is planned</p><div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-sm font-bold">{budget === 0 ? 'Start with a number that feels right for you.' : remaining >= 0 ? 'You are planning with room to breathe.' : 'You are over your goal—time to rebalance.'}</p><p className="mt-2 text-sm leading-6 text-white/70">Every quote, deposit, and final payment stays in one calm workspace.</p></div><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">{Object.keys(expenses).length}</p><p className="text-[10px] font-black uppercase tracking-wider text-white/60">categories</p></div><div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">{formatMoney(Math.max(remaining, 0))}</p><p className="text-[10px] font-black uppercase tracking-wider text-white/60">to assign</p></div></div><button type="button" onClick={() => totalInputRef.current?.focus()} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-[#fff8f4]">Try free calculator <ArrowRight className="h-4 w-4" /></button></div></aside>
  </div>;
}

function ChecklistDemo() {
  const tasks = ['Confirm your venue tour', 'Choose your wedding website style', 'Shortlist photographers', 'Send save-the-dates'];
  const [checked, setChecked] = useState([false, true, false, false]);
  const complete = checked.filter(Boolean).length;
  return <div className="rounded-[1.5rem] border border-primary/10 bg-white p-5 shadow-[0_20px_50px_rgba(87,55,62,.09)] sm:p-7">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Your next 30 days</p><h3 className="mt-2 text-2xl font-black tracking-[-.04em] text-foreground">A little progress goes a long way.</h3></div><span aria-live="polite" className="rounded-full bg-primary/10 px-3 py-2 text-xs font-black text-primary">{complete}/{tasks.length} complete</span></div>
    <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-neutral"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${complete / tasks.length * 100}%` }} /></div>
    <div className="mt-7 grid gap-3 lg:grid-cols-2">{tasks.map((task, index) => <button type="button" key={task} onClick={() => setChecked((current) => current.map((item, itemIndex) => itemIndex === index ? !item : item))} className={`flex min-h-20 items-center gap-3 rounded-2xl border p-4 text-left transition ${checked[index] ? 'border-primary/15 bg-primary/5' : 'border-border bg-white hover:border-primary/30'}`}><span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${checked[index] ? 'border-primary bg-primary text-white' : 'border-border text-transparent'}`}><Check className="h-4 w-4" /></span><span><span className={`block text-sm font-bold ${checked[index] ? 'text-text-secondary line-through' : 'text-foreground'}`}>{task}</span><span className="mt-1 block text-xs font-semibold text-text-secondary">{index < 2 ? 'This week' : 'Next month'}</span></span></button>)}</div>
    <div className="mt-6 grid gap-3 rounded-2xl bg-[#fff8f4] p-4 sm:grid-cols-3"><p className="text-sm font-bold text-foreground"><span className="block text-xs uppercase tracking-wider text-primary">10 months</span>to your day</p><p className="text-sm font-bold text-foreground"><span className="block text-xs uppercase tracking-wider text-primary">12 tasks</span>coming up</p><p className="text-sm font-bold text-foreground"><span className="block text-xs uppercase tracking-wider text-primary">Shared</span>with your partner</p></div>
  </div>;
}

function RsvpDemo() {
  const [status, setStatus] = useState<'Accepted' | 'Pending' | 'Declined'>('Accepted');
  const count = status === 'Accepted' ? 86 : status === 'Pending' ? 24 : 8;
  const states: Array<{ state: typeof status; count: number }> = [{ state: 'Accepted', count: 86 }, { state: 'Pending', count: 24 }, { state: 'Declined', count: 8 }];
  return <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
    <div className="rounded-[1.5rem] bg-primary p-6 text-white shadow-xl shadow-primary/20 sm:p-7"><p className="text-xs font-black uppercase tracking-[.2em] text-white/60">Guest response</p><p aria-live="polite" className="mt-3 text-4xl font-black">{count}</p><p className="text-sm font-bold text-white/70">guests marked {status.toLowerCase()}</p><div className="mt-7 space-y-2">{states.map(({ state, count: total }) => <button type="button" key={state} onClick={() => setStatus(state)} aria-pressed={status === state} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${status === state ? 'bg-white text-primary shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}><span>{state}</span><span>{total}</span></button>)}</div></div>
    <div className="rounded-[1.5rem] border border-primary/10 bg-white p-5 shadow-[0_20px_50px_rgba(87,55,62,.09)] sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Live RSVP list</p><h3 className="mt-2 text-2xl font-black tracking-[-.04em] text-foreground">Simple for guests. Clear for you.</h3></div><MailCheck className="h-9 w-9 text-primary/45" /></div><div className="mt-7 rounded-2xl bg-neutral p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-secondary/30 text-sm font-black text-foreground">M</span><span><strong className="block text-sm">Mia Santos</strong><span className="text-xs font-semibold text-text-secondary">2 guests · Chicken</span></span></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${status === 'Accepted' ? 'bg-green-100 text-green-700' : status === 'Pending' ? 'bg-accent/20 text-[#896716]' : 'bg-red-100 text-red-700'}`}>{status}</span></div></div><div className="mt-4 grid grid-cols-3 gap-3 text-center">{[['Meals', '74'], ['Plus-ones', '39'], ['Notes', '12']].map(([label, total]) => <div key={label} className="rounded-2xl border border-border p-3"><p className="text-lg font-black text-foreground">{total}</p><p className="text-[10px] font-black uppercase tracking-wide text-text-secondary">{label}</p></div>)}</div></div>
  </div>;
}

function SeatingDemo() {
  const [tables, setTables] = useState({ Garden: ['Mia', 'Carlo'], Sunset: ['Sofia', 'Daniel'] });
  const [dragged, setDragged] = useState<string | null>(null);
  const moveGuest = (guest: string, target: keyof typeof tables) => setTables((current) => { const next = { Garden: current.Garden.filter((name) => name !== guest), Sunset: current.Sunset.filter((name) => name !== guest) }; next[target] = [...next[target], guest]; return next; });
  return <div className="rounded-[1.5rem] border border-primary/10 bg-white p-5 shadow-[0_20px_50px_rgba(87,55,62,.09)] sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Reception layout</p><h3 className="mt-2 text-2xl font-black tracking-[-.04em] text-foreground">Drag a guest to move their seat.</h3></div><span className="rounded-full bg-primary/10 px-3 py-2 text-xs font-black text-primary">4 of 120 assigned</span></div><div className="mt-8 grid gap-5 md:grid-cols-2">{(Object.keys(tables) as Array<keyof typeof tables>).map((table) => <div key={table} onDragOver={(event) => event.preventDefault()} onDrop={() => dragged && moveGuest(dragged, table)} className="min-h-56 rounded-[2rem] border-2 border-dashed border-primary/20 bg-[#fffaf7] p-5 text-center transition hover:border-primary/50"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-8 border-secondary/40 bg-white text-sm font-black text-foreground shadow-lg">{table}</div><p className="mt-3 text-xs font-black uppercase tracking-[.15em] text-primary">{tables[table].length} seats filled</p><div className="mt-4 grid grid-cols-2 gap-2">{tables[table].map((guest) => <button type="button" draggable onDragStart={(event: DragEvent<HTMLButtonElement>) => { event.dataTransfer.effectAllowed = 'move'; setDragged(guest); }} onClick={() => moveGuest(guest, table === 'Garden' ? 'Sunset' : 'Garden')} key={guest} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-foreground shadow-sm transition hover:-translate-y-0.5 hover:text-primary" title={`Move ${guest} to the other table`}>{guest}</button>)}</div></div>)}</div><p className="mt-5 text-center text-xs font-semibold text-text-secondary">Drag a guest card between tables, or tap a name to move it.</p></div>;
}

function WebsiteDemo() {
  const [theme, setTheme] = useState<'Blush' | 'Classic' | 'Midnight'>('Blush');
  const colors = { Blush: 'from-[#f7a9ba] via-[#fce1e6] to-[#fff8f4]', Classic: 'from-[#e6d5ba] via-[#fff9ee] to-[#f6eee4]', Midnight: 'from-[#41333a] via-[#755961] to-[#d99fa9]' };
  return <div className="rounded-[1.5rem] border border-primary/10 bg-white p-5 shadow-[0_20px_50px_rgba(87,55,62,.09)] sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Live site preview</p><h3 className="mt-2 text-2xl font-black tracking-[-.04em] text-foreground">Choose a feeling. Make it yours.</h3></div><div className="flex gap-2">{(['Blush', 'Classic', 'Midnight'] as const).map((item) => <button type="button" key={item} onClick={() => setTheme(item)} aria-pressed={theme === item} className={`rounded-full px-3 py-2 text-xs font-black transition ${theme === item ? 'bg-primary text-white' : 'bg-neutral text-text-secondary hover:text-primary'}`}>{item}</button>)}</div></div><div data-theme-preview={theme} className={`mt-7 overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${colors[theme]} p-4 shadow-inner transition-colors duration-300 sm:p-6`}><div className="mx-auto max-w-lg rounded-[1.2rem] border border-white/60 bg-white/75 p-5 text-center shadow-xl backdrop-blur-sm"><p className="font-serif text-3xl font-black text-foreground">Mia <span className="text-primary">&</span> Carlo</p><p className="mt-2 text-[10px] font-black uppercase tracking-[.24em] text-primary">November 16, 2027 · Manila</p><div className="mt-5 flex justify-center gap-4 text-xs font-bold text-text-secondary"><span>Our story</span><span>Details</span><span>RSVP</span></div><div className="mt-6 rounded-2xl bg-white/70 p-4"><p className="text-sm font-black text-foreground">We can&apos;t wait to celebrate with you.</p><button type="button" className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-black text-white">RSVP now</button></div></div></div><div className="mt-4 grid grid-cols-3 gap-3">{['Story', 'Gallery', 'Timeline'].map((item) => <div key={item} className="rounded-2xl bg-neutral p-3 text-center text-xs font-black text-text-secondary">{item}<Check className="mx-auto mt-1 h-4 w-4 text-primary" /></div>)}</div></div>;
}

function ProductDemo({ feature }: { feature: FeatureKey }) {
  if (feature === 'budget') return <BudgetDemo />;
  if (feature === 'checklist') return <ChecklistDemo />;
  if (feature === 'rsvp') return <RsvpDemo />;
  if (feature === 'seating') return <SeatingDemo />;
  return <WebsiteDemo />;
}

function ScreenshotGallery({ feature }: { feature: FeatureKey }) {
  const content = featureContent[feature];
  return <section className="overflow-hidden bg-white px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">A closer look</p><h2 className="mt-4 [font-family:var(--font-montserrat)] text-[clamp(2.25rem,4.5vw,3.75rem)] font-black leading-[.98] tracking-[-.055em] text-foreground">Designed to feel <span className="text-primary">clear at a glance.</span></h2><p className="mt-5 text-[15px] leading-7 text-text-secondary sm:text-lg sm:leading-8">A thoughtful, mobile-ready view keeps your {content.shortName.toLowerCase()} useful when you are planning at home, with a vendor, or on the move.</p><div className="mt-7 flex flex-wrap gap-2">{['Responsive by default', 'Made for collaboration', 'One connected workspace'].map((label) => <span key={label} className="rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-black text-primary">{label}</span>)}</div></div><div className="relative mx-auto w-full max-w-2xl"><div className="absolute -inset-6 -z-0 rounded-[3rem] bg-gradient-to-br from-primary/15 via-secondary/25 to-accent/20 blur-2xl" /><div className="relative z-10 overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-3 shadow-[0_28px_72px_rgba(87,55,62,.14)] sm:p-5"><Image src={screenshotUrls[feature]} alt={`QuickWeds ${content.shortName} product screenshot`} width={1200} height={850} sizes="(min-width: 1024px) 55vw, 100vw" className="h-auto w-full rounded-[1.25rem] object-cover" /></div></div></div></section>;
}

function FeatureGrid({ feature }: { feature: FeatureKey }) {
  const content = featureContent[feature];
  return <section id="features" className="bg-neutral px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Made for modern couples" title={<>Everything you need to make <span className="text-primary">planning feel lighter.</span></>} body={`QuickWeds gives your ${content.keyword} a thoughtful place beside the rest of your wedding plans.`} /><div className="mt-12 grid gap-5 md:grid-cols-3">{content.features.map((item) => { const Icon = iconMap[item.icon]; return <article key={item.title} className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_16px_45px_rgba(87,55,62,.07)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_22px_50px_rgba(87,55,62,.12)]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span><h3 className="mt-6 text-xl font-black tracking-[-.035em] text-foreground">{item.title}</h3><p className="mt-3 text-sm font-semibold leading-6 text-text-secondary">{item.body}</p></article>; })}</div></div></section>;
}

export default function FeatureLandingPage({ feature }: { feature: FeatureKey }) {
  const content = featureContent[feature];
  const related = featureKeys.filter((key) => key !== feature).map((key) => featureContent[key]);
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${siteUrl}${content.path}#webpage`, url: `${siteUrl}${content.path}`, name: content.title, description: content.description, inLanguage: 'en' },
      { '@type': 'SoftwareApplication', name: `QuickWeds ${content.shortName}`, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web, iOS, Android', url: `${siteUrl}${content.path}`, description: content.description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'QuickWeds', item: siteUrl }, { '@type': 'ListItem', position: 2, name: content.shortName, item: `${siteUrl}${content.path}` }] },
      { '@type': 'FAQPage', mainEntity: content.faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    ],
  }), [content]);

  return <div className="min-h-screen overflow-x-clip bg-neutral text-foreground"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5"><div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-white/75 bg-[#fffaf7]/90 px-4 shadow-[0_10px_35px_rgba(87,55,62,.1)] backdrop-blur-xl sm:h-16 sm:px-6"><Link href="/" aria-label="QuickWeds home"><Image src="/logo.png" alt="QuickWeds" width={180} height={64} className="h-8 w-auto sm:h-9" priority /></Link><nav aria-label="Feature page" className="hidden items-center gap-5 lg:flex"><a href="#features" className="text-sm font-bold text-text-secondary transition hover:text-primary">Features</a><a href="#demo" className="text-sm font-bold text-text-secondary transition hover:text-primary">Try it</a><a href="#faq" className="text-sm font-bold text-text-secondary transition hover:text-primary">FAQ</a></nav><Cta>Start free</Cta></div></header>
    <main>
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_85%_14%,rgba(255,255,255,.9),transparent_24%),linear-gradient(145deg,#f7a9ba_0%,#f8c8d2_45%,#fde9ed_100%)] px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40"><div className="pointer-events-none absolute -left-20 top-28 h-72 w-72 rounded-full bg-white/35 blur-3xl" /><div className="pointer-events-none absolute right-0 top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" /><div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.92fr_1.08fr]"><div className="max-w-2xl text-center lg:text-left"><p className="inline-flex rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[10px] font-black uppercase tracking-[.22em] text-primary shadow-sm backdrop-blur-sm">{content.eyebrow}</p><h1 className="mt-6 [font-family:var(--font-montserrat)] text-[clamp(3rem,6.5vw,5.25rem)] font-black leading-[.93] tracking-[-.06em] text-white drop-shadow-[0_3px_14px_rgba(122,90,97,.2)]">{content.headline} <span className="text-primary">{content.highlight}</span></h1><p className="mx-auto mt-6 max-w-xl text-[15px] font-semibold leading-7 text-white/90 sm:text-lg sm:leading-8 lg:mx-0">{content.subheadline}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"><Cta /><a href="#demo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/75 bg-white/30 px-5 py-3 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/45">Watch demo <ArrowRight className="h-4 w-4" /></a></div><p className="mt-5 text-xs font-bold text-white/70">Free to start · No credit card required</p></div><FeatureHeroVisual feature={feature} title={content.shortName} /></div></section>
      <section aria-label="QuickWeds social proof" className="border-y border-primary/10 bg-white px-4 py-6 sm:px-6"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-text-secondary">One calm place for every wedding detail</p>{['Websites', 'RSVPs', 'Guests', 'Planning'].map((item) => <span key={item} className="flex items-center gap-1.5 text-sm font-black text-primary"><Sparkles className="h-4 w-4" />{item}</span>)}</div></section>
      <FeatureGrid feature={feature} />
      <section id="demo" className="bg-white px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><SectionHeading eyebrow={content.demoLabel} title={content.demoTitle} body={content.demoDescription} /><div className="mt-12"><ProductDemo feature={feature} /></div></div></section>
      <ScreenshotGallery feature={feature} />
      <section className="bg-[#fff8f4] px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Built into the full plan</p><h2 className="mt-4 [font-family:var(--font-montserrat)] text-[clamp(2.25rem,4.5vw,3.8rem)] font-black leading-[.98] tracking-[-.05em] text-foreground">One beautiful tool should not live on an island.</h2><p className="mt-5 text-[15px] leading-7 text-text-secondary sm:text-lg sm:leading-8">Your {content.shortName.toLowerCase()} works alongside the details that make a wedding feel seamless—from your first save-the-date to the final thank-you.</p><ul className="mt-7 space-y-3">{content.benefits.map((benefit) => <li key={benefit} className="flex gap-3 text-sm font-bold leading-6 text-foreground"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-white"><Check className="h-3.5 w-3.5" /></span>{benefit}</li>)}</ul></div><ProductSnapshot feature={feature} compact /></div></section>
      <section className="bg-neutral px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><SectionHeading eyebrow="How it works" title={<>A simpler path from <span className="text-primary">idea to “I do.”</span></>} body="Start in a few minutes, then let the details come together at your pace." /><ol className="mt-12 grid gap-5 md:grid-cols-3">{content.steps.map((step, index) => <li key={step.title} className="rounded-[1.75rem] border border-border bg-white p-6"><span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-black text-white">0{index + 1}</span><h3 className="mt-5 text-xl font-black tracking-[-.035em] text-foreground">{step.title}</h3><p className="mt-3 text-sm font-semibold leading-6 text-text-secondary">{step.body}</p></li>)}</ol></div></section>
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><SectionHeading eyebrow="Loved by couples" title={<>Less scrambling. More <span className="text-primary">looking forward.</span></>} body="Planning can be a lot. The right system makes space for the part you actually want to remember." /><div className="mt-12 grid gap-5 md:grid-cols-3">{[['Mia & Carlo', '“Everything finally lived in one place—and it actually felt like us.”'], ['Sofia & Daniel', '“We stopped tracking details across chats, notes, and spreadsheets.”'], ['Ari & James', '“It made the guest experience feel thoughtful before the day even arrived.”']].map(([name, quote]) => <figure key={name} className="rounded-[1.75rem] border border-border bg-[#fffaf7] p-6"><div className="flex gap-1 text-accent">{[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div><blockquote className="mt-5 text-[15px] font-bold leading-7 text-foreground">{quote}</blockquote><figcaption className="mt-6 text-xs font-black uppercase tracking-[.14em] text-primary">{name}</figcaption></figure>)}</div></div></section>
      <section id="faq" className="bg-[#fff8f4] px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-4xl"><SectionHeading eyebrow="Questions, answered" title={<>Everything you want to know about <span className="text-primary">QuickWeds.</span></>} body="Clear tools, no confusing setup, and plenty of room to make your plans your own." /><div className="mt-12 space-y-3">{content.faq.map((item) => <details key={item.question} className="group rounded-2xl border border-primary/10 bg-white px-5 py-1 shadow-sm"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-black text-foreground"><span>{item.question}</span><ChevronDown className="h-5 w-5 shrink-0 text-primary transition group-open:rotate-180" /></summary><p className="pb-5 text-sm font-semibold leading-7 text-text-secondary">{item.answer}</p></details>)}</div></div></section>
      <section className="bg-neutral px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><SectionHeading eyebrow="Complete your wedding planning" title={<>Everything works better <span className="text-primary">together.</span></>} body="Explore the rest of the QuickWeds planning suite, then come back to the tool that moves your next decision forward." /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <Link key={item.key} href={item.path} className="group rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"><p className="text-sm font-black text-foreground">{item.shortName}</p><p className="mt-2 text-xs font-semibold leading-5 text-text-secondary">Explore the QuickWeds {item.shortName.toLowerCase()}.</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-black text-primary">Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></Link>)}</div></div></section>
      <section className="relative isolate overflow-hidden bg-primary px-4 py-20 text-center sm:px-6 sm:py-28"><div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,.16),transparent_25%),radial-gradient(circle_at_85%_80%,rgba(245,215,148,.28),transparent_23%)]" /><div className="relative mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.22em] text-white/65">Your wedding, beautifully organized</p><h2 className="mt-5 [font-family:var(--font-montserrat)] text-[clamp(2.5rem,5vw,4.25rem)] font-black leading-[.95] tracking-[-.055em] text-white">Start planning with more calm and more joy.</h2><p className="mx-auto mt-5 max-w-xl text-[15px] font-semibold leading-7 text-white/80 sm:text-lg">Create your free QuickWeds account and bring every meaningful detail into one beautiful place.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Cta>Start planning free</Cta><Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/45 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20">Explore QuickWeds</Link></div></div></section>
    </main>
    <footer className="bg-[#3f3033] px-4 py-10 text-white sm:px-6"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left"><Link href="/"><Image src="/logo.png" alt="QuickWeds" width={170} height={60} className="h-8 w-auto brightness-0 invert" /></Link><p className="text-xs font-semibold text-white/60">A calmer way to plan a beautiful wedding.</p><div className="flex gap-4 text-xs font-bold text-white/70"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link><Link href="/support" className="hover:text-white">Support</Link></div></div></footer>
  </div>;
}

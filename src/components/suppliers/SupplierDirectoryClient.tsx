'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import SupplierCard from '@/components/suppliers/SupplierCard';
import {
    PHILIPPINE_SUPPLIER_LOCATIONS,
    SUPPLIER_CATEGORIES,
    type SupplierProfile,
} from '@/lib/suppliers';

export default function SupplierDirectoryClient({ suppliers }: { suppliers: SupplierProfile[] }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [location, setLocation] = useState('All');
    const [featuredOnly, setFeaturedOnly] = useState(false);

    const filteredSuppliers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return suppliers.filter((supplier) => {
            const matchesQuery = !normalizedQuery || [
                supplier.business_name,
                supplier.category,
                supplier.city,
                supplier.province,
                supplier.summary,
                supplier.description,
                ...(supplier.service_areas || []),
            ].some((value) => (value || '').toLowerCase().includes(normalizedQuery));

            const matchesCategory = category === 'All' || supplier.category === category;
            const matchesLocation = location === 'All'
                || supplier.province === location
                || supplier.city === location
                || (supplier.service_areas || []).includes(location);
            const matchesFeatured = !featuredOnly || supplier.is_featured;

            return matchesQuery && matchesCategory && matchesLocation && matchesFeatured;
        });
    }, [category, featuredOnly, location, query, suppliers]);

    return (
        <div className="min-h-screen bg-neutral text-foreground">
            <header className="border-b border-border/70 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <Link href="/" className="inline-flex items-center">
                        <img src="/logo.png" alt="QuickWeds" className="h-10 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/supplier/signup" className="hidden rounded-xl border border-primary/20 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5 sm:inline-flex">
                            List Your Business
                        </Link>
                        <Link href="/builder" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover">
                            Create Site
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(209,108,120,0.16),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(214,184,124,0.18),transparent_26%)]" />
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div className="text-center lg:text-left">
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-primary shadow-sm">
                                <Sparkles className="h-4 w-4" />
                                Philippines Supplier Directory
                            </span>
                            <h1 className="mt-6 font-serif text-[2.65rem] font-bold leading-[1.03] text-foreground sm:text-6xl">
                                Find trusted <span className="italic text-primary">wedding suppliers</span> for your day.
                            </h1>
                            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg lg:mx-0">
                                Browse venues, photographers, coordinators, caterers, stylists, and more. Save favorites into your QuickWeds Planner when you are ready to book.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                                <Link href="/supplier/signup" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover">
                                    List Your Business
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/dashboard" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary/5">
                                    Open Planner
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-2xl shadow-primary/10 backdrop-blur">
                            <div className="grid grid-cols-2 gap-3">
                                {SUPPLIER_CATEGORIES.slice(0, 6).map((item) => (
                                    <div key={item} className="rounded-2xl bg-neutral p-4 text-center">
                                        <p className="font-serif text-lg font-bold text-foreground">{item}</p>
                                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Directory</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-16 sm:px-6 sm:pb-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="sticky top-0 z-20 -mx-4 border-y border-border bg-white/95 px-4 py-4 backdrop-blur-xl sm:top-0 sm:mx-0 sm:rounded-[1.5rem] sm:border sm:px-5 sm:shadow-lg sm:shadow-primary/5">
                            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
                                <label className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
                                    <input
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Search supplier name, city, service..."
                                        className="min-h-[46px] w-full rounded-xl border border-border bg-neutral px-4 py-3 pl-11 text-sm outline-none transition focus:border-primary focus:bg-white"
                                    />
                                </label>
                                <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-[46px] rounded-xl border border-border bg-neutral px-4 py-3 text-sm font-bold outline-none focus:border-primary">
                                    <option value="All">All categories</option>
                                    {SUPPLIER_CATEGORIES.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                                <select value={location} onChange={(event) => setLocation(event.target.value)} className="min-h-[46px] rounded-xl border border-border bg-neutral px-4 py-3 text-sm font-bold outline-none focus:border-primary">
                                    <option value="All">All locations</option>
                                    {PHILIPPINE_SUPPLIER_LOCATIONS.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setFeaturedOnly((current) => !current)}
                                    className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${featuredOnly ? 'border-primary bg-primary text-white' : 'border-border bg-neutral text-text-secondary hover:border-primary/30 hover:text-primary'}`}
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Featured
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between gap-4">
                            <p className="text-sm font-bold text-text-secondary">
                                {filteredSuppliers.length} supplier{filteredSuppliers.length === 1 ? '' : 's'} found
                            </p>
                            <Link href="/supplier/signup" className="text-sm font-black uppercase tracking-[0.16em] text-primary">
                                Join directory
                            </Link>
                        </div>

                        {filteredSuppliers.length === 0 ? (
                            <div className="mt-8 rounded-[2rem] border border-border bg-white p-8 text-center shadow-sm">
                                <Sparkles className="mx-auto h-10 w-10 text-primary/40" />
                                <h2 className="mt-4 font-serif text-3xl font-bold text-foreground">No approved suppliers yet</h2>
                                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary">
                                    The directory is ready for curated supplier profiles. Suppliers can submit a free listing for approval.
                                </p>
                                <Link href="/supplier/signup" className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20">
                                    Create Supplier Profile
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredSuppliers.map((supplier) => (
                                    <SupplierCard key={supplier.id} supplier={supplier} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

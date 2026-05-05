'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getClientAccountProfile, getRoleAwareRedirect } from '@/lib/account';
import {
    PHILIPPINE_SUPPLIER_LOCATIONS,
    SUPPLIER_CATEGORIES,
    SUPPLIER_PRICE_BANDS,
    supplierStatusLabel,
    type SupplierProfile,
} from '@/lib/suppliers';

type SupplierFormState = {
    id?: string;
    business_name: string;
    category: string;
    city: string;
    province: string;
    service_areas: string;
    summary: string;
    description: string;
    price_band: string;
    phone: string;
    email: string;
    whatsapp: string;
    website_url: string;
    instagram_url: string;
    facebook_url: string;
    cover_image_url: string;
    gallery_images: string;
    status?: SupplierProfile['status'];
    slug?: string;
};

const emptyForm: SupplierFormState = {
    business_name: '',
    category: 'Photography',
    city: '',
    province: 'Metro Manila',
    service_areas: '',
    summary: '',
    description: '',
    price_band: 'Custom quote',
    phone: '',
    email: '',
    whatsapp: '',
    website_url: '',
    instagram_url: '',
    facebook_url: '',
    cover_image_url: '',
    gallery_images: '',
};

function profileToForm(profile?: SupplierProfile | null): SupplierFormState {
    if (!profile) return emptyForm;
    return {
        id: profile.id,
        business_name: profile.business_name || '',
        category: profile.category || 'Photography',
        city: profile.city || '',
        province: profile.province || 'Metro Manila',
        service_areas: (profile.service_areas || []).join(', '),
        summary: profile.summary || '',
        description: profile.description || '',
        price_band: profile.price_band || 'Custom quote',
        phone: profile.phone || '',
        email: profile.email || '',
        whatsapp: profile.whatsapp || '',
        website_url: profile.website_url || '',
        instagram_url: profile.instagram_url || '',
        facebook_url: profile.facebook_url || '',
        cover_image_url: profile.cover_image_url || '',
        gallery_images: (profile.gallery_images || []).join('\n'),
        status: profile.status,
        slug: profile.slug,
    };
}

export default function SupplierProfileDashboard() {
    const { user, isAdmin, adminChecked, loading: authLoading } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState<SupplierFormState>(emptyForm);
    const [reviewQueue, setReviewQueue] = useState<SupplierProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<'draft' | 'submit' | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const statusLabel = useMemo(() => supplierStatusLabel(form.status), [form.status]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?next=/supplier/dashboard');
            return;
        }

        if (!user) return;
        if (!adminChecked) return;

        const loadProfile = async () => {
            setLoading(true);
            setError('');
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) {
                setError('Please sign in again to manage your supplier profile.');
                setLoading(false);
                return;
            }

            if (!isAdmin) {
                try {
                    const accountProfile = await getClientAccountProfile(token);
                    if (accountProfile?.account_type !== 'supplier') {
                        router.replace(getRoleAwareRedirect(accountProfile?.account_type, '/supplier/dashboard'));
                        return;
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Unable to load account profile.');
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch('/api/suppliers/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Unable to load supplier profile.');
                setLoading(false);
                return;
            }

            setForm(profileToForm(data.profile));
            setReviewQueue(data.reviewQueue || []);
            setLoading(false);
        };

        void loadProfile();
    }, [adminChecked, authLoading, isAdmin, router, user]);

    const updateField = (field: keyof SupplierFormState, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const saveProfile = async (intent: 'draft' | 'submit') => {
        setSaving(intent);
        setMessage('');
        setError('');

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
            setError('Please sign in again to save your profile.');
            setSaving(null);
            return;
        }

        const response = await fetch('/api/suppliers/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ intent, profile: form }),
        });
        const data = await response.json();

        if (!response.ok) {
            setError(data.error || 'Unable to save supplier profile.');
            setSaving(null);
            return;
        }

        setForm(profileToForm(data.profile));
        setMessage(intent === 'submit' ? 'Profile submitted for admin approval.' : 'Draft saved.');
        setSaving(null);
    };

    const moderateSupplier = async (supplierId: string, action: 'approve' | 'reject' | 'deactivate' | 'feature' | 'unfeature') => {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const response = await fetch('/api/suppliers/moderate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ supplierId, action }),
        });
        const data = await response.json();

        if (response.ok && data.profile) {
            setReviewQueue((current) => current.map((item) => item.id === supplierId ? data.profile : item));
        } else {
            alert(data.error || 'Unable to update supplier.');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-neutral flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral text-foreground">
            <header className="border-b border-border/70 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <Link href="/" className="inline-flex items-center">
                        <img src="/logo.png" alt="QuickWeds" className="h-10 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/suppliers" className="rounded-xl border border-primary/20 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5">
                            View Directory
                        </Link>
                        {form.slug && form.status === 'approved' && (
                            <Link href={`/suppliers/${form.slug}`} className="hidden rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover sm:inline-flex">
                                Public Profile
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
                <section className="rounded-[2rem] border border-border bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Supplier Profile</p>
                            <h1 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-5xl">Create your listing</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                                Build a free supplier profile for the QuickWeds directory. Profiles are reviewed before becoming public.
                            </p>
                        </div>
                        <span className="inline-flex w-fit rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                            {statusLabel}
                        </span>
                    </div>

                    {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
                    {message && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}

                    <form className="space-y-8" onSubmit={(event) => event.preventDefault()}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Business Name">
                                <input required value={form.business_name} onChange={(event) => updateField('business_name', event.target.value)} className="supplier-input" placeholder="e.g. Luna Weddings Studio" />
                            </Field>
                            <Field label="Category">
                                <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className="supplier-input">
                                    {SUPPLIER_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                            </Field>
                            <Field label="City">
                                <input required value={form.city} onChange={(event) => updateField('city', event.target.value)} className="supplier-input" placeholder="e.g. Makati" />
                            </Field>
                            <Field label="Province / Region">
                                <select value={form.province} onChange={(event) => updateField('province', event.target.value)} className="supplier-input">
                                    {PHILIPPINE_SUPPLIER_LOCATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                            </Field>
                            <Field label="Service Areas">
                                <input value={form.service_areas} onChange={(event) => updateField('service_areas', event.target.value)} className="supplier-input" placeholder="Metro Manila, Tagaytay, Batangas" />
                            </Field>
                            <Field label="Price Band">
                                <select value={form.price_band} onChange={(event) => updateField('price_band', event.target.value)} className="supplier-input">
                                    {SUPPLIER_PRICE_BANDS.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                            </Field>
                        </div>

                        <Field label="Short Summary">
                            <input value={form.summary} onChange={(event) => updateField('summary', event.target.value)} className="supplier-input" maxLength={180} placeholder="One-line promise couples will see on cards" />
                        </Field>

                        <Field label="Profile Description">
                            <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} className="supplier-input min-h-40 resize-y" placeholder="Tell couples what you offer, your style, and why they should contact you." />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Phone">
                                <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="supplier-input" placeholder="+63..." />
                            </Field>
                            <Field label="WhatsApp">
                                <input value={form.whatsapp} onChange={(event) => updateField('whatsapp', event.target.value)} className="supplier-input" placeholder="+63..." />
                            </Field>
                            <Field label="Email">
                                <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className="supplier-input" placeholder="hello@example.com" />
                            </Field>
                            <Field label="Website">
                                <input value={form.website_url} onChange={(event) => updateField('website_url', event.target.value)} className="supplier-input" placeholder="https://..." />
                            </Field>
                            <Field label="Instagram">
                                <input value={form.instagram_url} onChange={(event) => updateField('instagram_url', event.target.value)} className="supplier-input" placeholder="https://instagram.com/..." />
                            </Field>
                            <Field label="Facebook">
                                <input value={form.facebook_url} onChange={(event) => updateField('facebook_url', event.target.value)} className="supplier-input" placeholder="https://facebook.com/..." />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Cover Image URL">
                                <input value={form.cover_image_url} onChange={(event) => updateField('cover_image_url', event.target.value)} className="supplier-input" placeholder="https://..." />
                            </Field>
                            <Field label="Gallery Image URLs">
                                <textarea value={form.gallery_images} onChange={(event) => updateField('gallery_images', event.target.value)} className="supplier-input min-h-28 resize-y" placeholder="Paste one image URL per line" />
                            </Field>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
                            <button type="button" onClick={() => saveProfile('draft')} disabled={Boolean(saving)} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary/5 disabled:opacity-60">
                                {saving === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Save Draft
                            </button>
                            <button type="button" onClick={() => saveProfile('submit')} disabled={Boolean(saving)} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60">
                                {saving === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Submit for Approval
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="space-y-5">
                    <div className="rounded-[2rem] border border-border bg-white p-5 shadow-sm">
                        <h2 className="font-serif text-2xl font-bold text-foreground">Approval flow</h2>
                        <div className="mt-5 space-y-3 text-sm leading-6 text-text-secondary">
                            <p>1. Save a draft while you prepare your profile.</p>
                            <p>2. Submit when your details and contact links are ready.</p>
                            <p>3. QuickWeds admin reviews and approves the listing.</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="rounded-[2rem] border border-primary/20 bg-white p-5 shadow-xl shadow-primary/10">
                            <div className="mb-4 flex items-center gap-2 text-primary">
                                <ShieldCheck className="h-5 w-5" />
                                <h2 className="font-serif text-2xl font-bold">Admin Review</h2>
                            </div>
                            <div className="space-y-3">
                                {reviewQueue.length === 0 ? (
                                    <p className="text-sm text-text-secondary">No supplier profiles to review.</p>
                                ) : reviewQueue.map((supplier) => (
                                    <div key={supplier.id} className="rounded-2xl border border-border bg-neutral p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-foreground">{supplier.business_name}</p>
                                                <p className="text-xs text-text-secondary">{supplier.category} - {supplier.city}, {supplier.province}</p>
                                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">{supplierStatusLabel(supplier.status)}</p>
                                            </div>
                                            {supplier.slug && supplier.status === 'approved' && supplier.is_active && (
                                                <Link href={`/suppliers/${supplier.slug}`} className="text-xs font-bold text-primary">
                                                    Public
                                                </Link>
                                            )}
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <AdminButton onClick={() => moderateSupplier(supplier.id, 'approve')}>Approve</AdminButton>
                                            <AdminButton onClick={() => moderateSupplier(supplier.id, 'reject')}>Reject</AdminButton>
                                            <AdminButton onClick={() => moderateSupplier(supplier.id, supplier.is_featured ? 'unfeature' : 'feature')}>
                                                {supplier.is_featured ? 'Unfeature' : 'Feature'}
                                            </AdminButton>
                                            <AdminButton onClick={() => moderateSupplier(supplier.id, 'deactivate')}>Hide</AdminButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="space-y-2">
            <span className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{label}</span>
            {children}
        </label>
    );
}

function AdminButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="min-h-[38px] rounded-xl border border-primary/20 bg-white px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">
            {children}
        </button>
    );
}

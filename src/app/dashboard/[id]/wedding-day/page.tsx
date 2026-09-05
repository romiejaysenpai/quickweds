'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    Mail,
    Plus,
    QrCode,
    RefreshCw,
    Save,
    Trash2,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';
import LoadingState from '@/components/ui/LoadingState';
import DashboardShell from '@/components/dashboard/DashboardShell';

type WeddingDaySettings = {
    is_enabled: boolean;
    check_in_enabled: boolean;
    seat_finder_enabled: boolean;
    photo_upload_enabled: boolean;
    timeline_enabled: boolean;
    guestbook_enabled: boolean;
    emergency_contacts: EmergencyContact[];
    coordinator_notes: string | null;
};

type WeddingDayBooleanKey =
    | 'check_in_enabled'
    | 'seat_finder_enabled'
    | 'photo_upload_enabled'
    | 'timeline_enabled'
    | 'guestbook_enabled';

type EmergencyContact = {
    name: string;
    role: string;
    phone: string;
};

type Counters = {
    confirmed: number;
    declined: number;
    pending: number;
    totalGuests: number;
    totalRsvps: number;
    checkedInGuests: number;
    photoUploadCount: number;
    vipCount?: number;
};

type WeddingSummary = {
    bride_name?: string | null;
    groom_name?: string | null;
};

const DEFAULT_SETTINGS: WeddingDaySettings = {
    is_enabled: false,
    check_in_enabled: true,
    seat_finder_enabled: true,
    photo_upload_enabled: true,
    timeline_enabled: true,
    guestbook_enabled: true,
    emergency_contacts: [],
    coordinator_notes: '',
};

const EMPTY_COUNTERS: Counters = {
    confirmed: 0,
    declined: 0,
    pending: 0,
    totalGuests: 0,
    totalRsvps: 0,
    checkedInGuests: 0,
    photoUploadCount: 0,
    vipCount: 0,
};

async function getToken() {
    const { data } = await getCachedSession();
    return data.session?.access_token || '';
}

export default function WeddingDayModePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const weddingId = params?.id || '';
    const [wedding, setWedding] = useState<WeddingSummary | null>(null);
    const [settings, setSettings] = useState<WeddingDaySettings>(DEFAULT_SETTINGS);
    const [counters, setCounters] = useState<Counters>(EMPTY_COUNTERS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingReminder, setSendingReminder] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const checkInPercent = counters.totalRsvps > 0
        ? Math.round((counters.checkedInGuests / counters.totalRsvps) * 100)
        : 0;

    const coupleName = useMemo(() => {
        if (!wedding) return 'Wedding Day';
        return [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || 'Wedding Day';
    }, [wedding]);
    const openedFrom = searchParams?.get('from');
    const backHref = openedFrom === 'planner' ? `/dashboard/${weddingId}/planner` : `/dashboard/${weddingId}`;
    const backLabel = openedFrom === 'planner' ? 'Wedding Planner' : 'Dashboard';

    const loadData = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const [settingsResponse, countersResponse] = await Promise.all([
                fetch(`/api/wedding-day/settings?weddingId=${encodeURIComponent(weddingId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                }),
                fetch(`/api/dashboard/counters?weddingId=${encodeURIComponent(weddingId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                }),
            ]);

            const settingsData = await settingsResponse.json().catch(() => ({}));
            const countersData = await countersResponse.json().catch(() => ({}));

            if (!settingsResponse.ok) throw new Error(settingsData.error || 'Unable to load wedding day settings.');
            if (!countersResponse.ok) throw new Error(countersData.error || 'Unable to load counters.');

            setWedding(settingsData.wedding || null);
            setSettings({ ...DEFAULT_SETTINGS, ...(settingsData.settings || {}) });
            setCounters({ ...EMPTY_COUNTERS, ...(countersData.counters || {}) });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load wedding day mode.');
        } finally {
            setLoading(false);
        }
    }, [router, weddingId]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user && weddingId) void loadData();
    }, [authLoading, user, weddingId, router, loadData]);

    async function saveSettings(nextSettings = settings) {
        const token = await getToken();
        if (!token) return router.push('/login');

        setSaving(true);
        setError('');
        setMessage('');
        try {
            const response = await fetch('/api/wedding-day/settings', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId, ...nextSettings }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to save settings.');
            setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
            setMessage('Wedding day settings saved.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save settings.');
        } finally {
            setSaving(false);
        }
    }

    async function toggleWeddingDayMode() {
        const next = { ...settings, is_enabled: !settings.is_enabled };
        setSettings(next);
        await saveSettings(next);
    }

    async function updateEventToggle(key: WeddingDayBooleanKey, checked: boolean) {
        const next = { ...settings, [key]: checked };
        setSettings(next);
        await saveSettings(next);
    }

    async function sendPhotoReminder() {
        const token = await getToken();
        if (!token) return router.push('/login');

        setSendingReminder(true);
        setError('');
        setMessage('');
        try {
            const response = await fetch('/api/wedding-day/send-photo-reminder', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to send reminders.');
            setMessage(`Photo reminder complete: ${data.sent || 0} sent, ${data.skipped || 0} skipped, ${data.failed || 0} failed.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to send reminders.');
        } finally {
            setSendingReminder(false);
        }
    }

    function updateContact(index: number, values: Partial<EmergencyContact>) {
        setSettings((current) => ({
            ...current,
            emergency_contacts: current.emergency_contacts.map((contact, contactIndex) => (
                contactIndex === index ? { ...contact, ...values } : contact
            )),
        }));
    }

    function addContact() {
        setSettings((current) => ({
            ...current,
            emergency_contacts: [...current.emergency_contacts, { name: '', role: '', phone: '' }],
        }));
    }

    function removeContact(index: number) {
        setSettings((current) => ({
            ...current,
            emergency_contacts: current.emergency_contacts.filter((_, contactIndex) => contactIndex !== index),
        }));
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        void saveSettings();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FFF8F9] px-4">
                <LoadingState
                    label="Loading wedding day mode…"
                    description="Preparing your event-day tools."
                    className="max-w-lg"
                />
            </main>
        );
    }

    return (
        <DashboardShell weddingId={weddingId} weddingTitle={coupleName}>
            <main className="min-h-screen bg-[#FFF8F9] px-4 py-6 text-foreground flex-1">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/dashboard/${weddingId}`} className="inline-flex min-h-[40px] w-fit items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                            <ArrowLeft className="h-4 w-4" /> Dashboard
                        </Link>
                        <button type="button" onClick={() => void loadData()} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                            <RefreshCw className="h-4 w-4" /> Refresh
                        </button>
                    </div>

                    <section className="rounded-3xl border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Wedding Day Mode</p>
                                <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{coupleName}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Keep check-in, guest links, photo uploads, and coordinator notes ready for event staff.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => void toggleWeddingDayMode()}
                                disabled={saving}
                                className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black uppercase tracking-widest text-white disabled:opacity-60 ${settings.is_enabled ? 'bg-emerald-600' : 'bg-primary'}`}
                            >
                                {saving ? <LoadingState variant="inline" label="Updating wedding day mode…" /> : <CheckCircle2 className="h-4 w-4" />}
                                {settings.is_enabled ? 'Mode On' : 'Turn On'}
                            </button>
                        </div>

                        {(message || error) && (
                            <div className={`mt-5 rounded-2xl border p-4 text-sm font-semibold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                {error || message}
                            </div>
                        )}
                    </section>

                    <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Metric label="Confirmed" value={counters.confirmed} />
                        <Metric label="Check-ins" value={counters.checkedInGuests} />
                        <Metric label="Declined" value={counters.declined} />
                        <Metric label="Photos" value={counters.photoUploadCount} />
                    </section>

                    <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <ActionCard href={`/dashboard/${weddingId}/check-in`} icon={CheckCircle2} label="Check-In" description="Search guests and mark arrivals" />
                        <ActionCard href={`/dashboard/${weddingId}/qr-kit?from=wedding-day`} icon={QrCode} label="QR Kit" description="Print and download event links" />
                        <ActionCard href={`/dashboard/${weddingId}/photo-uploads`} icon={Camera} label="Photo Wall" description="Moderate guest uploads" />
                        <ActionCard href={`/dashboard/${weddingId}/thank-you?from=wedding-day`} icon={Mail} label="Thank You" description="Draft guest thank you notes" />
                    </section>

                    <form onSubmit={(e) => { e.preventDefault(); void saveSettings(); }} className="mt-6 grid gap-5 lg:grid-cols-2">
                        <section className="rounded-2xl border border-border bg-white p-5 shadow-lg shadow-primary/5 sm:p-6">
                            <div className="border-b border-border/70 pb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Guest Access</p>
                                <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground">Event Controls</h2>
                                <p className="mt-2 text-sm leading-6 text-text-secondary">Choose which wedding-day tools are active for staff and guests.</p>
                            </div>
                            <div className="mt-5 space-y-3">
                                <Toggle label="Staff Check-In" description="Allow coordinators to mark guest arrivals." checked={settings.check_in_enabled} disabled={saving} onChange={(checked) => void updateEventToggle('check_in_enabled', checked)} />
                                <Toggle label="Seat Finder" description="Let guests look up their table from the public link." checked={settings.seat_finder_enabled} disabled={saving} onChange={(checked) => void updateEventToggle('seat_finder_enabled', checked)} />
                                <Toggle label="Photo Uploads" description="Keep the guest photo portal available." checked={settings.photo_upload_enabled} disabled={saving} onChange={(checked) => void updateEventToggle('photo_upload_enabled', checked)} />
                                <Toggle label="Timeline" description="Show the program timeline on the guest site." checked={settings.timeline_enabled} disabled={saving} onChange={(checked) => void updateEventToggle('timeline_enabled', checked)} />
                                <Toggle label="Guestbook" description="Keep guest messages available after the event." checked={settings.guestbook_enabled} disabled={saving} onChange={(checked) => void updateEventToggle('guestbook_enabled', checked)} />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-white p-5 shadow-lg shadow-primary/5 sm:p-6">
                            <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Staff Reference</p>
                                    <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground">Emergency Contacts</h2>
                                    <p className="mt-2 text-sm leading-6 text-text-secondary">Keep key people easy to find during the event.</p>
                                </div>
                                <button type="button" onClick={addContact} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary hover:text-white" title="Add contact">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mt-5 space-y-3">
                                {settings.emergency_contacts.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-border bg-neutral/30 p-6 text-center">
                                        <p className="text-sm font-bold text-foreground">No contacts yet</p>
                                        <p className="mt-1 text-xs leading-5 text-text-secondary">Add planner, venue, family, or vendor contacts for quick reference.</p>
                                    </div>
                                )}
                                {settings.emergency_contacts.map((contact, index) => (
                                    <div key={index} className="rounded-2xl border border-border bg-neutral/25 p-3.5">
                                        <div className="grid gap-2.5 sm:grid-cols-[1fr,1fr,auto]">
                                            <input value={contact.name} onChange={(event) => updateContact(index, { name: event.target.value })} placeholder="Name" className="min-h-[44px] rounded-xl border border-border bg-white px-3.5 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                                            <input value={contact.role} onChange={(event) => updateContact(index, { role: event.target.value })} placeholder="Role" className="min-h-[44px] rounded-xl border border-border bg-white px-3.5 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                                            <button type="button" onClick={() => removeContact(index)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-500 transition hover:bg-rose-50" title="Remove">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <input value={contact.phone} onChange={(event) => updateContact(index, { phone: event.target.value })} placeholder="Phone or radio channel" className="mt-2.5 min-h-[44px] w-full rounded-xl border border-border bg-white px-3.5 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-white p-5 shadow-lg shadow-primary/5 sm:p-6 lg:col-span-2">
                            <div className="border-b border-border/70 pb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Run Of Show</p>
                                <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground">Coordinator Notes</h2>
                                <p className="mt-2 text-sm leading-6 text-text-secondary">Add short operational notes for the people managing the day.</p>
                            </div>
                            <textarea
                                value={settings.coordinator_notes || ''}
                                onChange={(event) => setSettings((current) => ({ ...current, coordinator_notes: event.target.value }))}
                                placeholder="Vendor arrival notes, family contacts, transportation reminders..."
                                className="mt-5 min-h-[150px] w-full resize-y rounded-2xl border border-border bg-neutral/20 p-4 text-sm font-medium leading-7 text-foreground outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                            />
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <button type="submit" disabled={saving} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60">
                                    {saving ? <LoadingState variant="inline" label="Saving wedding day settings…" /> : <Save className="h-4 w-4" />}
                                    Save Settings
                                </button>
                                <button type="button" onClick={() => void sendPhotoReminder()} disabled={sendingReminder} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-60">
                                    {sendingReminder ? <LoadingState variant="inline" label="Sending photo reminder…" /> : <Mail className="h-4 w-4" />}
                                    Send Photo Reminder
                                </button>
                            </div>
                        </section>
                    </form>
                </div>
            </main>
        </DashboardShell>
    );
}

function Metric({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-2xl border border-border bg-neutral/40 p-4 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary">{label}</p>
            <p className="mt-2 font-serif text-3xl font-bold text-primary">{value}</p>
        </div>
    );
}

function ActionCard({ href, icon: Icon, label, description }: { href: string; icon: LucideIcon; label: string; description: string }) {
    return (
        <Link
            href={href}
            aria-label={`Open ${label}`}
            className="group flex min-h-[164px] cursor-pointer flex-col rounded-2xl border-2 border-primary/25 bg-white p-4 shadow-lg shadow-primary/10 transition-all hover:-translate-y-1 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/15 focus:outline-none focus:ring-4 focus:ring-primary/20 active:translate-y-0 sm:min-h-[176px]"
        >
            <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                </span>
                <span className="inline-flex min-h-[30px] items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary transition group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
            </div>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-foreground">{label}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">{description}</p>
            <span className="mt-auto pt-4 text-[10px] font-black uppercase tracking-[0.16em] text-primary/70 transition group-hover:text-primary">
                Tap to open
            </span>
        </Link>
    );
}

function Toggle({
    label,
    description,
    checked,
    disabled = false,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`flex min-h-[76px] w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-wait disabled:opacity-70 ${checked ? 'border-primary/25 bg-primary/5 hover:border-primary/35' : 'border-border bg-neutral/25 hover:border-primary/20 hover:bg-primary/5'}`}
        >
            <div className="min-w-0">
                <p className="text-sm font-black leading-5 text-foreground">{label}</p>
                <p className="mt-0.5 text-xs font-medium leading-5 text-text-secondary">{description}</p>
            </div>
            <span className={`grid h-9 w-[76px] shrink-0 grid-cols-2 rounded-xl border bg-white p-0.5 text-[9px] font-black uppercase transition ${checked ? 'border-primary/40 text-primary' : 'border-border text-text-secondary'}`}>
                <span className={`flex items-center justify-center rounded-lg transition ${!checked ? 'bg-neutral text-foreground shadow-sm' : ''}`}>Off</span>
                <span className={`flex items-center justify-center rounded-lg transition ${checked ? 'bg-primary text-white shadow-sm' : ''}`}>On</span>
            </span>
        </button>
    );
}

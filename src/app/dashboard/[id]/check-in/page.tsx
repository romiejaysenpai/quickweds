'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, CheckCircle2, Loader2, RefreshCw, Search, Undo2, UserCheck, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';
import GuestQrScanner from '@/components/dashboard/GuestQrScanner';
import type { GuestQrScanResult } from '@/components/dashboard/GuestQrScanner';

type CheckInGuest = {
    id: string;
    guest_name: string;
    guest_email?: string | null;
    table_assignment?: string | null;
    guest_code?: string | null;
    checked_in_at?: string | null;
    partySize?: number;
};

async function getToken() {
    const { data } = await getCachedSession();
    return data.session?.access_token || '';
}

export default function CheckInDashboardPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const weddingId = params?.id || '';
    const [guests, setGuests] = useState<CheckInGuest[]>([]);
    const [lookup, setLookup] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [scannerOpen, setScannerOpen] = useState(false);
    const lastScanRef = useRef('');

    const checkedInCount = guests.filter((guest) => guest.checked_in_at).length;
    const remainingCount = Math.max(guests.length - checkedInCount, 0);
    const filteredGuests = useMemo(() => {
        const query = lookup.trim().toLowerCase();
        const source = query
            ? guests.filter((guest) => [
                guest.guest_name,
                guest.guest_email,
                guest.guest_code,
                guest.table_assignment,
            ].some((value) => String(value || '').toLowerCase().includes(query)))
            : guests;

        return source.slice(0, 120);
    }, [guests, lookup]);

    const loadGuests = useCallback(async () => {
        const token = await getToken();
        if (!token) return router.push('/login');

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/seating/check-in?weddingId=${encodeURIComponent(weddingId)}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to load guests.');
            setGuests(data.guests || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load guests.');
        } finally {
            setLoading(false);
        }
    }, [router, weddingId]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user && weddingId) void loadGuests();
    }, [authLoading, user, weddingId, router, loadGuests]);

    const closeScanner = useCallback(() => {
        setScannerOpen(false);
        lastScanRef.current = '';
    }, []);

    const updateCheckIn = useCallback(async (payload: { rsvpId?: string; lookup?: string; undo?: boolean }): Promise<GuestQrScanResult> => {
        const token = await getToken();
        if (!token) {
            router.push('/login');
            return { ok: false, state: 'auth_required', message: 'Please sign in again.' };
        }

        setSaving(true);
        setError('');
        setStatus('');
        try {
            const response = await fetch('/api/seating/check-in', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId, source: payload.lookup ? 'qr_or_search' : 'staff_list', ...payload }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                const message = data.error || 'Unable to update check-in.';
                throw Object.assign(new Error(message), { state: data.state });
            }

            const guestName = data.guest?.guest_name || 'Guest';
            const message = data.state === 'already_checked_in'
                ? `${guestName} was already checked in.`
                : data.state === 'check_in_undone'
                    ? `${guestName} check-in was undone.`
                    : `${guestName} is checked in.`;
            setStatus(message);

            if (payload.lookup) setLookup('');
            await loadGuests();
            return { ok: true, state: data.state, message };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to update check-in.';
            const state = typeof err === 'object' && err && 'state' in err ? String((err as { state?: unknown }).state || '') : 'check_in_error';
            setError(message);
            return { ok: false, state, message };
        } finally {
            setSaving(false);
        }
    }, [loadGuests, router, weddingId]);

    const handleScannerScan = useCallback(async (rawValue: string): Promise<GuestQrScanResult> => {
        const value = rawValue.trim();
        if (!value || value === lastScanRef.current) {
            return { ok: false, state: 'duplicate_scan_ignored', message: 'This QR was already scanned. Try another code.' };
        }
        lastScanRef.current = value;
        setLookup(value);
        const result = await updateCheckIn({ lookup: value });
        if (!result.ok) lastScanRef.current = '';
        return result;
    }, [updateCheckIn]);

    async function submitLookup(event: FormEvent) {
        event.preventDefault();
        if (!lookup.trim() || saving) return;
        await updateCheckIn({ lookup: lookup.trim() });
    }

    return (
        <main className="min-h-screen bg-[#FFF8F9] px-4 py-6 text-foreground">
            <div className="mx-auto max-w-6xl">
                <div className="sticky top-0 z-20 -mx-4 border-b border-primary/10 bg-[#FFF8F9]/95 px-4 py-3 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/dashboard/${weddingId}/wedding-day`} className="inline-flex min-h-[40px] w-fit items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                            <ArrowLeft className="h-4 w-4" /> Wedding Day
                        </Link>
                        <button type="button" onClick={() => void loadGuests()} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                            <RefreshCw className="h-4 w-4" /> Refresh
                        </button>
                    </div>
                </div>

                <section className="mt-5 rounded-3xl border border-border bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Staff Check-In</p>
                            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Wedding Day Check-In</h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">Scan or paste a QR link, enter a guest code, or search by name, email, phone, or table.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Metric label="Total" value={guests.length} />
                            <Metric label="In" value={checkedInCount} />
                            <Metric label="Left" value={remainingCount} />
                        </div>
                    </div>

                    <form onSubmit={submitLookup} className="mt-6 grid gap-3 lg:grid-cols-[auto,1fr,auto]">
                        <button
                            type="button"
                            onClick={() => {
                                setScannerOpen(true);
                            }}
                            disabled={saving}
                            className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-5 text-sm font-black text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                        >
                            <Camera className="h-4 w-4" />
                            Scan Camera
                        </button>
                        <input
                            value={lookup}
                            onChange={(event) => setLookup(event.target.value)}
                            placeholder="Paste QR link, guest code, or search name"
                            className="min-h-[54px] flex-1 rounded-2xl border border-border bg-white px-4 text-base font-bold outline-none focus:border-primary"
                        />
                        <button disabled={saving || !lookup.trim()} className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Check In
                        </button>
                    </form>

                    {scannerOpen && (
                        <GuestQrScanner onClose={closeScanner} onScan={handleScannerScan} busy={saving} />
                    )}

                    {(error || status) && (
                        <div className={`mt-4 rounded-2xl border p-4 text-sm font-semibold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                            {error || status}
                        </div>
                    )}
                </section>

                <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-white shadow-lg shadow-primary/5">
                    <div className="border-b border-border bg-neutral/30 p-4">
                        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
                            <Users className="h-5 w-5 text-primary" /> Guest List
                        </h2>
                    </div>
                    {loading ? (
                        <div className="flex min-h-[260px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredGuests.length === 0 ? (
                        <div className="p-10 text-center">
                            <UserCheck className="mx-auto h-10 w-10 text-text-secondary/40" />
                            <p className="mt-3 text-sm font-bold text-text-secondary">No guests found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredGuests.map((guest) => (
                                <div key={guest.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-serif text-lg font-bold">{guest.guest_name}</p>
                                            {guest.checked_in_at && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">Checked In</span>}
                                        </div>
                                        <p className="mt-1 text-xs text-text-secondary">
                                            {[guest.table_assignment || 'No table', guest.guest_code, `Party of ${guest.partySize || 1}`].filter(Boolean).join(' - ')}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => void updateCheckIn({ rsvpId: guest.id, undo: Boolean(guest.checked_in_at) })}
                                        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-50 ${guest.checked_in_at ? 'border border-border bg-white text-text-secondary' : 'bg-emerald-600 text-white'}`}
                                    >
                                        {guest.checked_in_at ? <Undo2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {guest.checked_in_at ? 'Undo' : 'Check In'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="min-w-[86px] rounded-2xl border border-border bg-neutral/40 px-4 py-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{label}</p>
            <p className="mt-1 font-serif text-2xl font-bold text-primary">{value}</p>
        </div>
    );
}

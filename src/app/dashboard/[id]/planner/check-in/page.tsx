'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Camera, CheckCircle2, Loader2, Search, Undo2 } from 'lucide-react';
import { getCachedSession } from '@/lib/session-cache';
import GuestQrScanner from '@/components/dashboard/GuestQrScanner';

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

export default function PlannerCheckInPage() {
    const params = useParams<{ id: string }>();
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
    const filteredGuests = useMemo(() => {
        const query = lookup.trim().toLowerCase();
        if (!query) return guests.slice(0, 80);
        return guests.filter((guest) => [
            guest.guest_name,
            guest.guest_email,
            guest.guest_code,
            guest.table_assignment,
        ].some((value) => String(value || '').toLowerCase().includes(query))).slice(0, 80);
    }, [guests, lookup]);

    const loadGuests = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            setError('Please sign in again.');
            setLoading(false);
            return;
        }
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
    }, [weddingId]);

    useEffect(() => {
        if (weddingId) void loadGuests();
    }, [weddingId, loadGuests]);

    const updateCheckIn = useCallback(async (payload: { rsvpId?: string; lookup?: string; undo?: boolean }) => {
        const token = await getToken();
        if (!token) return alert('Please sign in again.');
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
                body: JSON.stringify({ weddingId, source: payload.lookup ? 'qr_or_search' : 'staff_search', ...payload }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to update check-in.');
            const guestName = data.guest?.guest_name || 'Guest';
            if (data.state === 'already_checked_in') setStatus(`${guestName} was already checked in.`);
            else if (data.state === 'check_in_undone') setStatus(`${guestName} check-in was undone.`);
            else setStatus(`${guestName} is checked in.`);
            await loadGuests();
            if (payload.lookup) setLookup('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to update check-in.';
            setError(message);
            alert(message);
        } finally {
            setSaving(false);
        }
    }, [loadGuests, weddingId]);

    const closeScanner = useCallback(() => {
        setScannerOpen(false);
        lastScanRef.current = '';
    }, []);

    const handleScannerScan = useCallback((rawValue: string) => {
        const value = rawValue.trim();
        if (!value || value === lastScanRef.current) return;
        lastScanRef.current = value;
        setLookup(value);
        setScannerOpen(false);
        void updateCheckIn({ lookup: value });
    }, [updateCheckIn]);

    async function submitLookup(event: FormEvent) {
        event.preventDefault();
        if (!lookup.trim() || saving) return;
        await updateCheckIn({ lookup: lookup.trim() });
    }

    return (
        <main className="min-h-screen bg-[#FFF8F9] px-4 py-6 text-foreground">
            <div className="mx-auto max-w-5xl">
                <Link href={`/dashboard/${weddingId}/planner?tab=seating`} className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                    <ArrowLeft className="h-4 w-4" /> Seating Planner
                </Link>

                <div className="mt-5 rounded-3xl border border-border bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Guest Check-In</p>
                            <h1 className="mt-2 font-serif text-3xl font-bold">Wedding Day Check-In</h1>
                            <p className="mt-2 text-sm text-text-secondary">Search by guest code, pasted seat link, token, or guest name.</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-neutral/40 px-5 py-3 text-center">
                            <p className="font-serif text-2xl font-bold text-primary">{checkedInCount}/{guests.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Checked In</p>
                        </div>
                    </div>

                    <form onSubmit={submitLookup} className="mt-6 grid gap-3 lg:grid-cols-[auto,1fr,auto]">
                        <button
                            type="button"
                            onClick={() => setScannerOpen(true)}
                            disabled={saving}
                            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-5 text-sm font-black text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                        >
                            <Camera className="h-4 w-4" />
                            Scan Camera
                        </button>
                        <input value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="Scan/paste QR link, guest code, or search name" className="min-h-[48px] flex-1 rounded-2xl border border-border bg-white px-4 text-sm font-bold outline-none focus:border-primary" />
                        <button disabled={saving || !lookup.trim()} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Check In
                        </button>
                    </form>

                    {scannerOpen && <GuestQrScanner onClose={closeScanner} onScan={handleScannerScan} busy={saving} />}

                    {(error || status) && (
                        <div className={`mt-4 rounded-2xl border p-4 text-sm font-semibold ${error ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                            {error || status}
                        </div>
                    )}

                    <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border">
                        {loading ? (
                            <div className="flex min-h-[220px] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredGuests.length === 0 ? (
                            <div className="p-8 text-center text-sm italic text-text-secondary">No guests found.</div>
                        ) : filteredGuests.map((guest) => (
                            <div key={guest.id} className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <p className="font-serif text-lg font-bold">{guest.guest_name}</p>
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
                </div>
            </div>
        </main>
    );
}

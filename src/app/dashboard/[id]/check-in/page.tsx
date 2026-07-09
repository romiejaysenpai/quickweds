'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, CheckCircle2, Loader2, QrCode, RefreshCw, Search, Undo2, UserCheck, Users, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';

type CheckInGuest = {
    id: string;
    guest_name: string;
    guest_email?: string | null;
    table_assignment?: string | null;
    guest_code?: string | null;
    checked_in_at?: string | null;
    partySize?: number;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
    detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
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
    const [scannerStarting, setScannerStarting] = useState(false);
    const [scannerError, setScannerError] = useState('');
    const [scannerStatus, setScannerStatus] = useState('');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanTimerRef = useRef<number | null>(null);
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

    const stopScanner = useCallback(() => {
        if (scanTimerRef.current) {
            window.clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setScannerOpen(false);
        setScannerStarting(false);
        setScannerStatus('');
        lastScanRef.current = '';
    }, []);

    useEffect(() => stopScanner, [stopScanner]);

    const updateCheckIn = useCallback(async (payload: { rsvpId?: string; lookup?: string; undo?: boolean }) => {
        const token = await getToken();
        if (!token) return router.push('/login');

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
            if (!response.ok) throw new Error(data.error || 'Unable to update check-in.');

            const guestName = data.guest?.guest_name || 'Guest';
            if (data.state === 'already_checked_in') setStatus(`${guestName} was already checked in.`);
            else if (data.state === 'check_in_undone') setStatus(`${guestName} check-in was undone.`);
            else setStatus(`${guestName} is checked in.`);

            if (payload.lookup) setLookup('');
            await loadGuests();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to update check-in.');
        } finally {
            setSaving(false);
        }
    }, [loadGuests, router, weddingId]);

    useEffect(() => {
        if (!scannerOpen) return;

        let cancelled = false;

        async function startCameraScanner() {
            setScannerStarting(true);
            setScannerError('');
            setScannerStatus('Point the camera at the guest QR code.');

            const BarcodeDetector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
            if (!BarcodeDetector) {
                setScannerError('Camera QR scanning is not supported in this browser. Use Chrome, Edge, or paste the QR link into the field.');
                setScannerStarting(false);
                return;
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                setScannerError('Camera access is not available on this device. Paste the QR link or guest code instead.');
                setScannerStarting(false);
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                    audio: false,
                });

                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                const video = videoRef.current;
                if (!video) throw new Error('Camera preview is not ready.');

                video.srcObject = stream;
                await video.play();

                const detector = new BarcodeDetector({ formats: ['qr_code'] });
                scanTimerRef.current = window.setInterval(() => {
                    if (!videoRef.current || saving) return;

                    void detector.detect(videoRef.current).then((codes) => {
                        const rawValue = String(codes[0]?.rawValue || '').trim();
                        if (!rawValue || rawValue === lastScanRef.current) return;

                        lastScanRef.current = rawValue;
                        setLookup(rawValue);
                        setScannerStatus('QR detected. Checking in guest...');
                        stopScanner();
                        void updateCheckIn({ lookup: rawValue });
                    }).catch(() => {
                        setScannerStatus('Keep the QR code inside the frame.');
                    });
                }, 650);
            } catch (err) {
                setScannerError(err instanceof Error ? err.message : 'Unable to open the camera. Check browser camera permissions.');
            } finally {
                setScannerStarting(false);
            }
        }

        void startCameraScanner();

        return () => {
            cancelled = true;
            if (scanTimerRef.current) {
                window.clearInterval(scanTimerRef.current);
                scanTimerRef.current = null;
            }
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, [scannerOpen, saving, stopScanner, updateCheckIn]);

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
                                setScannerError('');
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
                        <div className="mt-4 overflow-hidden rounded-3xl border border-primary/20 bg-foreground text-white shadow-xl shadow-primary/10">
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <QrCode className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-black">Guest QR Scanner</p>
                                </div>
                                <button type="button" onClick={stopScanner} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" title="Close scanner">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="relative aspect-[4/3] bg-black sm:aspect-video">
                                <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="h-48 w-48 rounded-3xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
                                </div>
                                {scannerStarting && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                                        <div className="text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                            <p className="mt-3 text-sm font-bold">Opening camera...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-3">
                                {scannerError ? (
                                    <p className="text-sm font-semibold leading-6 text-rose-200">{scannerError}</p>
                                ) : (
                                    <p className="text-sm font-semibold leading-6 text-white/75">{scannerStatus || 'Point the camera at the QR code from the guest seat-link email.'}</p>
                                )}
                            </div>
                        </div>
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

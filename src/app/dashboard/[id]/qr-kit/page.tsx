'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, QrCode, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';
import { getWeddingPublicUrl } from '@/lib/wedding-slugs';
import QrCodeActions from '@/components/dashboard/QrCodeActions';
import LoadingState from '@/components/ui/LoadingState';
import DashboardShell from '@/components/dashboard/DashboardShell';

type QrType = {
    id: string;
    label: string;
    description: string;
    path: string;
    protected?: boolean;
};

type WeddingSummary = {
    id?: string | null;
    public_slug?: string | null;
    custom_domain?: string | null;
};

const QR_TYPES: QrType[] = [
    { id: 'website', label: 'Wedding Website', description: 'Main guest website.', path: '' },
    { id: 'rsvp', label: 'RSVP', description: 'Jump guests to RSVP.', path: '#rsvp' },
    { id: 'checkin', label: 'Staff Check-In', description: 'Protected coordinator check-in.', path: '', protected: true },
    { id: 'seat_finder', label: 'Seat Finder', description: 'Guest table lookup.', path: '/seat-finder' },
    { id: 'photo_upload', label: 'Photo Upload', description: 'Guest photo portal.', path: '/photos' },
    { id: 'timeline', label: 'Timeline', description: 'Wedding program section.', path: '#timeline' },
    { id: 'thank_you', label: 'Thank You', description: 'Post-wedding note section.', path: '#thank-you' },
];

async function getToken() {
    const { data } = await getCachedSession();
    return data.session?.access_token || '';
}

export default function QrKitPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const weddingId = params?.id || '';
    const [wedding, setWedding] = useState<WeddingSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qrStatus, setQrStatus] = useState('');
    const openedFrom = searchParams?.get('from');
    const backHref = openedFrom === 'planner'
        ? `/dashboard/${weddingId}/planner`
        : openedFrom === 'dashboard'
            ? `/dashboard/${weddingId}`
            : `/dashboard/${weddingId}/wedding-day`;
    const backLabel = openedFrom === 'planner'
        ? 'Wedding Planner'
        : openedFrom === 'dashboard'
            ? 'Dashboard'
            : 'Wedding Day';

    const loadWedding = useCallback(async () => {
        const token = await getToken();
        if (!token) return router.push('/login');

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/planner/load?weddingId=${encodeURIComponent(weddingId)}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to load wedding.');
            setWedding(data.wedding || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load QR kit.');
        } finally {
            setLoading(false);
        }
    }, [router, weddingId]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user && weddingId) void loadWedding();
    }, [authLoading, user, weddingId, router, loadWedding]);

    const qrCards = useMemo(() => {
        if (!wedding || typeof window === 'undefined') return [];
        const publicUrl = getWeddingPublicUrl(window.location.origin, wedding).replace(/\/+$/, '');
        const staffCheckInUrl = `${window.location.origin}/dashboard/${weddingId}/check-in`;
        return QR_TYPES.map((type) => ({
            ...type,
            url: type.protected ? staffCheckInUrl : `${publicUrl}${type.path}`,
        }));
    }, [wedding, weddingId]);

    function printPage() {
        window.print();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FFF8F9] px-4">
                <LoadingState
                    label="Loading QR kit…"
                    description="Preparing QR codes for your wedding day."
                    className="max-w-lg"
                />
            </main>
        );
    }

    return (
        <DashboardShell weddingId={weddingId} weddingSlug={wedding?.public_slug}>
            <main className="min-h-screen bg-[#FFF8F9] px-3 sm:px-6 py-6 text-foreground flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            <span>/</span>
                            <Link href={`/dashboard/${weddingId}`} className="hover:text-primary transition-colors truncate max-w-[150px] md:max-w-[220px]">Workspace</Link>
                            <span>/</span>
                            <span className="text-foreground">QR Kit</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href={backHref} className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-2xs">
                                <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
                            </Link>
                            <button type="button" onClick={() => void loadWedding()} className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-2xs">
                                <RefreshCw className="h-3.5 w-3.5" /> Refresh
                            </button>
                            <button type="button" onClick={printPage} className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
                                <Printer className="h-3.5 w-3.5" /> Print Kit
                            </button>
                        </div>
                    </div>

                    <section className="rounded-3xl border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">QR Kit & Printable Assets</p>
                        <h1 className="mt-1.5 font-serif text-3xl font-bold sm:text-4xl">Event QR Codes</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Download individual high-res PNGs or print this page for wedding signage, table stands, and check-in cards.</p>
                        {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
                        {qrStatus && <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm font-semibold text-primary print:hidden">{qrStatus}</div>}
                    </section>

                    <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {qrCards.map((card) => (
                            <article key={card.id} className="break-inside-avoid rounded-3xl border border-border bg-white p-5 shadow-lg shadow-primary/5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{card.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-text-secondary">{card.description}</p>
                                    </div>
                                    <QrCode className="h-5 w-5 text-primary" />
                                </div>
                                <QrCodeActions
                                    value={card.url}
                                    openUrl={card.url}
                                    title={card.label}
                                    description={card.description}
                                    fileName={`${card.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.png`}
                                    previewSize={164}
                                    showUrl
                                    compact
                                    className="mt-4 print:[&_button]:hidden"
                                    qrClassName="flex justify-center rounded-2xl border border-border bg-white p-4"
                                    actionsClassName="mt-3 grid grid-cols-2 gap-2 print:hidden"
                                    onStatus={setQrStatus}
                                />
                            </article>
                        ))}
                    </section>
                </div>
            </main>
        </DashboardShell>
    );
}

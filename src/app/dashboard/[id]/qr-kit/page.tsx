'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Copy, Download, ExternalLink, Loader2, Printer, QrCode, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { copyToClipboard } from '@/lib/client-clipboard';
import { openExternalUrl } from '@/lib/native-actions';
import { getCachedSession } from '@/lib/session-cache';
import { getWeddingPublicUrl } from '@/lib/wedding-slugs';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), { ssr: false });
const QRCodeCanvas = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeCanvas), { ssr: false });

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
    const [copiedId, setCopiedId] = useState('');
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

    async function copyUrl(id: string, url: string) {
        await copyToClipboard(url);
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(''), 1800);
    }

    function downloadQr(id: string, label: string) {
        const canvas = document.getElementById(`qr-canvas-${id}`) as HTMLCanvasElement | null;
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.png`;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function printPage() {
        window.print();
    }

    async function openQrUrl(url: string) {
        await openExternalUrl(url);
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FFF8F9] px-4">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    <p className="mt-3 text-sm font-bold text-text-secondary">Loading QR kit...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFF8F9] px-4 py-6 text-foreground">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
                    <Link href={backHref} className="inline-flex min-h-[40px] w-fit items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                        <ArrowLeft className="h-4 w-4" /> {backLabel}
                    </Link>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button type="button" onClick={() => void loadWedding()} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                            <RefreshCw className="h-4 w-4" /> Refresh
                        </button>
                        <button type="button" onClick={printPage} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white">
                            <Printer className="h-4 w-4" /> Print
                        </button>
                    </div>
                </div>

                <section className="rounded-3xl border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">QR Kit</p>
                    <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Event QR Codes</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Download individual PNGs or print this page for signage. Staff check-in stays behind login.</p>
                    {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
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
                            <div className="mt-4 flex justify-center rounded-2xl border border-border bg-white p-4">
                                <QRCodeSVG value={card.url} size={164} />
                                <QRCodeCanvas id={`qr-canvas-${card.id}`} value={card.url} size={900} includeMargin className="hidden" />
                            </div>
                            <p className="mt-3 break-all rounded-xl border border-border bg-neutral/40 p-3 text-xs font-semibold text-text-secondary">{card.url}</p>
                            <div className="mt-3 grid grid-cols-3 gap-2 print:hidden">
                                <button type="button" onClick={() => void copyUrl(card.id, card.url)} className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-border bg-white text-text-secondary hover:text-primary" title="Copy link">
                                    {copiedId === card.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                                <button type="button" onClick={() => downloadQr(card.id, card.label)} className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-border bg-white text-text-secondary hover:text-primary" title="Download PNG">
                                    <Download className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => void openQrUrl(card.url)} className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-2 text-xs font-black text-text-secondary transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary" title={`Open ${card.label} URL`}>
                                    <ExternalLink className="h-4 w-4" />
                                    <span className="hidden sm:inline">Open</span>
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}

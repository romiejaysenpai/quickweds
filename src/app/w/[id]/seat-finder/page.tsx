'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, QrCode, Search, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type LookupResponse = {
    wedding: { name: string };
    guest: { name: string; partySize: number; guestCode: string };
    seat: { assigned: boolean; tableName?: string | null; seatLabel?: string | null };
};

export default function PublicSeatFinderPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const weddingId = params?.id || '';
    const token = searchParams?.get('token') || '';
    const returnTo = searchParams?.get('returnTo') || '';
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<LookupResponse | null>(null);
    const [finderUrl, setFinderUrl] = useState('');

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('returnTo');
        setFinderUrl(url.toString());
    }, []);

    const safeReturnTo = useMemo(() => {
        if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) return '';
        return returnTo;
    }, [returnTo]);

    function goBack() {
        if (safeReturnTo) {
            router.push(safeReturnTo);
            return;
        }
        if (window.history.length > 1) {
            router.back();
            return;
        }
        router.push(`/w/${weddingId}`);
    }

    async function findSeat(event: FormEvent) {
        event.preventDefault();
        if (!query.trim() || loading) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const response = await fetch('/api/seating/public-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weddingId, token, query: query.trim() }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to find your seat.');
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to find your seat.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#FFF8F9] px-4 py-8 text-foreground">
            <div className="mx-auto max-w-xl rounded-3xl border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-10">
                <button type="button" onClick={goBack} className="mb-6 inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">QuickWeds Seat Finder</p>
                <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">Find Your Seat</h1>
                <p className="mt-2 text-sm leading-6 text-text-secondary">Enter the guest code from your email. Some weddings may also allow exact email, phone, or name lookup.</p>

                {token && finderUrl && (
                    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                        <QRCodeSVG value={finderUrl} size={92} className="shrink-0 rounded-xl bg-white p-2" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-primary">
                                <QrCode className="h-4 w-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.16em]">Venue QR</p>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-text-secondary">This is the same public finder QR. It is useful for reception staff or printing, but guests can ignore it after scanning.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={findSeat} className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Guest code"
                        className="min-h-[48px] flex-1 rounded-2xl border border-border bg-white px-4 text-sm font-bold outline-none focus:border-primary"
                    />
                    <button disabled={loading || !query.trim()} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Find
                    </button>
                </form>

                {error && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-8">
                        <p className="text-sm font-bold text-text-secondary">{result.wedding.name}</p>
                        <h2 className="mt-1 font-serif text-2xl font-bold">Welcome, {result.guest.name}</h2>
                        <div className="mt-5 rounded-3xl border border-primary/15 bg-primary/5 p-6 text-center">
                            {result.seat.assigned ? (
                                <>
                                    <MapPin className="mx-auto h-10 w-10 text-primary" />
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Your Table</p>
                                    <p className="mt-2 font-serif text-4xl font-bold">{result.seat.tableName}</p>
                                    {result.seat.seatLabel && <p className="mt-3 text-sm font-bold text-text-secondary">{result.seat.seatLabel}</p>}
                                </>
                            ) : (
                                <>
                                    <Search className="mx-auto h-10 w-10 text-primary" />
                                    <p className="mt-4 font-serif text-2xl font-bold">Seat not assigned yet</p>
                                    <p className="mt-2 text-sm text-text-secondary">Please ask reception when you arrive.</p>
                                </>
                            )}
                        </div>
                        <div className="mt-5 rounded-2xl border border-border bg-neutral/40 p-4">
                            <Users className="h-5 w-5 text-primary" />
                            <p className="mt-2 text-xs font-bold text-text-secondary">Party Size</p>
                            <p className="font-serif text-2xl font-bold">{result.guest.partySize}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 text-center">
                <Link href="/" className="text-xs font-bold text-primary">Powered by QuickWeds</Link>
            </div>
        </main>
    );
}

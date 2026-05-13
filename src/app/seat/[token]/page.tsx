'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, MapPin, Search, Users } from 'lucide-react';

type SeatResponse = {
    wedding: { name: string; weddingDate?: string | null };
    guest: { name: string; partySize: number; guestCode: string; checkedInAt?: string | null };
    seat: { assigned: boolean; tableName?: string | null; seatLabel?: string | null };
};

export default function GuestSeatPage() {
    const params = useParams<{ token: string }>();
    const token = params?.token;
    const [data, setData] = useState<SeatResponse | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const loadSeat = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/seating/guest-seat?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error || 'Unable to load your seat.');
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load your seat.');
            } finally {
                setLoading(false);
            }
        };
        void loadSeat();
    }, [token]);

    return (
        <main className="min-h-screen bg-[#FFF8F9] px-4 py-8 text-foreground">
            <div className="mx-auto max-w-xl rounded-3xl border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-10">
                {loading ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-4 text-sm font-bold text-text-secondary">Loading your seat...</p>
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <Search className="mx-auto h-12 w-12 text-primary/50" />
                        <h1 className="mt-4 font-serif text-2xl font-bold">Seat not found</h1>
                        <p className="mt-3 text-sm leading-6 text-text-secondary">{error}</p>
                        <p className="mt-4 text-xs text-text-secondary">Please ask the reception or wedding coordinator for help.</p>
                    </div>
                ) : data && (
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">QuickWeds Seat Finder</p>
                        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">{data.wedding.name}</h1>
                        <p className="mt-2 text-sm text-text-secondary">Welcome, {data.guest.name}</p>

                        <div className="mt-8 rounded-3xl border border-primary/15 bg-primary/5 p-6 text-center">
                            {data.seat.assigned ? (
                                <>
                                    <MapPin className="mx-auto h-10 w-10 text-primary" />
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Your Table</p>
                                    <p className="mt-2 font-serif text-4xl font-bold">{data.seat.tableName}</p>
                                    {data.seat.seatLabel && <p className="mt-3 text-sm font-bold text-text-secondary">{data.seat.seatLabel}</p>}
                                </>
                            ) : (
                                <>
                                    <Search className="mx-auto h-10 w-10 text-primary" />
                                    <p className="mt-4 font-serif text-2xl font-bold">Seat not assigned yet</p>
                                    <p className="mt-2 text-sm text-text-secondary">Please ask reception when you arrive.</p>
                                </>
                            )}
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-neutral/40 p-4">
                                <Users className="h-5 w-5 text-primary" />
                                <p className="mt-2 text-xs font-bold text-text-secondary">Party Size</p>
                                <p className="font-serif text-2xl font-bold">{data.guest.partySize}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-neutral/40 p-4">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <p className="mt-2 text-xs font-bold text-text-secondary">Guest Code</p>
                                <p className="font-serif text-2xl font-bold">{data.guest.guestCode}</p>
                            </div>
                        </div>

                        {data.guest.checkedInAt && (
                            <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
                                You are checked in.
                            </p>
                        )}

                        <p className="mt-8 text-center text-xs leading-6 text-text-secondary">
                            If anything looks incorrect, please ask the reception desk or wedding coordinator.
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-6 text-center">
                <Link href="/" className="text-xs font-bold text-primary">Powered by QuickWeds</Link>
            </div>
        </main>
    );
}

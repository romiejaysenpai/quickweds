'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, Heart, Loader2, XCircle } from 'lucide-react';

type ProposalResponse = 'accepted' | 'declined';

type Invitation = {
    name: string;
    role?: string | null;
    message?: string | null;
    status: 'draft' | 'sent' | 'accepted' | 'declined';
    weddings?: {
        bride_name?: string | null;
        groom_name?: string | null;
        wedding_date?: string | null;
        venue_name?: string | null;
    } | null;
};

export default function EntourageProposalResponsePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<ProposalResponse | null>(null);
    const [error, setError] = useState('');

    const coupleName = useMemo(() => {
        const wedding = invitation?.weddings;
        return [wedding?.bride_name || 'Bride', wedding?.groom_name || 'Groom'].join(' & ');
    }, [invitation]);

    useEffect(() => {
        let cancelled = false;
        async function loadProposal() {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/entourage/invitations/respond?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || 'Unable to load this proposal.');
                if (!cancelled) setInvitation(data.invitation || null);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load this proposal.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadProposal();
        return () => {
            cancelled = true;
        };
    }, [token]);

    async function respond(responseValue: ProposalResponse) {
        setSaving(responseValue);
        setError('');
        try {
            const response = await fetch('/api/entourage/invitations/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, response: responseValue }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to save your response.');
            setInvitation(data.invitation || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save your response.');
        } finally {
            setSaving(null);
        }
    }

    return (
        <main className="min-h-screen bg-neutral px-4 py-10 text-foreground sm:px-6">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
                <section className="w-full rounded-[2rem] border border-border bg-white p-6 text-center shadow-2xl shadow-primary/10 sm:p-10">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-bold text-text-secondary">Opening proposal...</p>
                        </div>
                    ) : error ? (
                        <div className="space-y-5 py-8">
                            <XCircle className="mx-auto h-12 w-12 text-red-500" />
                            <h1 className="font-serif text-3xl font-bold">We could not open this proposal.</h1>
                            <p className="text-sm leading-7 text-text-secondary">{error}</p>
                            <Link href="/" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">
                                Go to QuickWeds
                            </Link>
                        </div>
                    ) : invitation ? (
                        <div className="space-y-7">
                            <div>
                                <Heart className="mx-auto h-12 w-12 text-primary" />
                                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-primary">Wedding Entourage</p>
                                <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{coupleName}</h1>
                                <p className="mt-3 text-sm leading-7 text-text-secondary">
                                    {invitation.name}, you have been invited as {invitation.role || 'part of the wedding entourage'}.
                                </p>
                            </div>

                            {invitation.message && (
                                <blockquote className="rounded-2xl border border-primary/15 bg-primary/5 p-5 font-serif text-lg leading-8 text-foreground">
                                    {invitation.message}
                                </blockquote>
                            )}

                            <div className="rounded-2xl border border-border bg-neutral/60 p-4 text-sm leading-7 text-text-secondary">
                                {[invitation.weddings?.wedding_date, invitation.weddings?.venue_name].filter(Boolean).join(' - ') || 'Wedding details will be shared by the couple.'}
                            </div>

                            {invitation.status === 'accepted' || invitation.status === 'declined' ? (
                                <div className="rounded-2xl border border-border bg-neutral p-5">
                                    <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
                                    <p className="mt-3 text-sm font-bold text-foreground">
                                        Your response has been saved as {invitation.status === 'accepted' ? 'accepted' : 'declined'}.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        disabled={Boolean(saving)}
                                        onClick={() => void respond('accepted')}
                                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                                    >
                                        {saving === 'accepted' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        Accept
                                    </button>
                                    <button
                                        type="button"
                                        disabled={Boolean(saving)}
                                        onClick={() => void respond('declined')}
                                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-text-secondary disabled:opacity-50"
                                    >
                                        {saving === 'declined' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </section>
            </div>
        </main>
    );
}

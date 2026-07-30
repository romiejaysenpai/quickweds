'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, Heart, Loader2, XCircle, Shirt, UtensilsCrossed, Phone, MessageSquare } from 'lucide-react';
import { getEntourageCardTheme, getEntourageProposalTemplate } from '@/lib/entourage-proposal-templates';

type ProposalResponse = 'accepted' | 'declined';

type Invitation = {
    name: string;
    role?: string | null;
    message?: string | null;
    card_theme?: string | null;
    proposal_title?: string | null;
    template_key?: string | null;
    status: 'draft' | 'sent' | 'accepted' | 'declined';
    response_details?: {
        attireSize?: string;
        dietaryNotes?: string;
        phoneNumber?: string;
        personalNote?: string;
        respondedAt?: string;
    } | null;
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
    const [showAcceptForm, setShowAcceptForm] = useState(false);

    // Response details form state
    const [attireSize, setAttireSize] = useState('');
    const [dietaryNotes, setDietaryNotes] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [personalNote, setPersonalNote] = useState('');

    const coupleName = useMemo(() => {
        const wedding = invitation?.weddings;
        return [wedding?.bride_name || 'Bride', wedding?.groom_name || 'Groom'].join(' & ');
    }, [invitation]);

    const activeTheme = useMemo(() => {
        return getEntourageCardTheme(invitation?.card_theme);
    }, [invitation]);

    const proposalTitle = useMemo(() => {
        if (invitation?.proposal_title) return invitation.proposal_title;
        return getEntourageProposalTemplate(invitation?.template_key).defaultTitle;
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
            const detailsPayload = responseValue === 'accepted' ? {
                attireSize: attireSize.trim() || undefined,
                dietaryNotes: dietaryNotes.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
                personalNote: personalNote.trim() || undefined,
            } : undefined;

            const response = await fetch('/api/entourage/invitations/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, response: responseValue, details: detailsPayload }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to save your response.');
            setInvitation(data.invitation || null);
            setShowAcceptForm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save your response.');
        } finally {
            setSaving(null);
        }
    }

    return (
        <main className={`min-h-screen ${activeTheme.bgClass} px-4 py-10 text-foreground sm:px-6 transition-colors duration-300`}>
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
                <section className={`w-full rounded-[2rem] border ${activeTheme.borderClass} ${activeTheme.cardBg} p-6 text-center shadow-2xl transition-all sm:p-10`}>
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
                                <Heart className="mx-auto h-12 w-12 text-primary animate-pulse" />
                                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    Wedding Entourage Proposal
                                </p>
                                <h1 className={`mt-3 font-serif text-3xl font-bold sm:text-4xl ${activeTheme.textPrimary}`}>
                                    {coupleName}
                                </h1>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">
                                    {invitation.name}, you have been invited as <span className="font-bold text-foreground">{invitation.role || 'part of the wedding entourage'}</span>.
                                </p>
                            </div>

                            {/* Headline Title */}
                            <div className={`rounded-2xl border ${activeTheme.borderClass} ${activeTheme.bgClass} p-6`}>
                                <h2 className={`font-serif text-xl font-bold sm:text-2xl ${activeTheme.textPrimary}`}>
                                    "{proposalTitle}"
                                </h2>
                                {invitation.message && (
                                    <blockquote className={`mt-3 font-serif text-base leading-8 ${activeTheme.textSecondary}`}>
                                        {invitation.message}
                                    </blockquote>
                                )}
                            </div>

                            <div className="rounded-2xl border border-border bg-neutral/60 p-4 text-sm leading-7 text-text-secondary">
                                📅 {[invitation.weddings?.wedding_date, invitation.weddings?.venue_name].filter(Boolean).join(' - ') || 'Wedding details will be shared by the couple.'}
                            </div>

                            {invitation.status === 'accepted' || invitation.status === 'declined' ? (
                                <div className="rounded-2xl border border-border bg-neutral p-6 space-y-3">
                                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                                    <p className="text-base font-bold text-foreground">
                                        Your response has been saved as <span className={invitation.status === 'accepted' ? 'text-emerald-600 font-bold uppercase' : 'text-red-600 font-bold uppercase'}>{invitation.status}</span>.
                                    </p>

                                    {invitation.response_details && (
                                        <div className="mt-4 text-left space-y-2 rounded-xl border border-border bg-white p-4 text-xs text-text-secondary">
                                            <p className="font-bold uppercase tracking-wider text-[10px] text-text-secondary">Your Response Details:</p>
                                            {invitation.response_details.attireSize && (
                                                <p>👔 <strong>Attire Size:</strong> {invitation.response_details.attireSize}</p>
                                            )}
                                            {invitation.response_details.dietaryNotes && (
                                                <p>🥗 <strong>Dietary Notes:</strong> {invitation.response_details.dietaryNotes}</p>
                                            )}
                                            {invitation.response_details.phoneNumber && (
                                                <p>📱 <strong>Contact Phone:</strong> {invitation.response_details.phoneNumber}</p>
                                            )}
                                            {invitation.response_details.personalNote && (
                                                <p>💬 <strong>Note to Couple:</strong> {invitation.response_details.personalNote}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : showAcceptForm ? (
                                <div className="space-y-4 rounded-2xl border border-border bg-neutral/40 p-6 text-left animate-in fade-in duration-200">
                                    <h3 className="font-serif text-lg font-bold text-foreground">Accept Proposal & Details</h3>
                                    <p className="text-xs text-text-secondary">Provide details to help the couple prepare attire and arrangements:</p>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                                                <Shirt className="h-3.5 w-3.5 text-primary" /> Attire / Suit / Dress Size
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Medium, US 8, or Custom"
                                                value={attireSize}
                                                onChange={(e) => setAttireSize(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                                                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" /> Dietary Restrictions & Allergies
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Vegetarian, Peanut allergy, None"
                                                value={dietaryNotes}
                                                onChange={(e) => setDietaryNotes(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5 text-primary" /> Phone / WhatsApp Number
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="e.g. +1 555-0199"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                                                <MessageSquare className="h-3.5 w-3.5 text-primary" /> Note to Couple (Optional)
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder="Write a quick note or message back..."
                                                value={personalNote}
                                                onChange={(e) => setPersonalNote(e.target.value)}
                                                className="mt-1 w-full resize-none rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAcceptForm(false)}
                                            className="rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-neutral"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            disabled={Boolean(saving)}
                                            onClick={() => void respond('accepted')}
                                            className={`flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl ${activeTheme.accentClass} px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50`}
                                        >
                                            {saving === 'accepted' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                            Confirm Acceptance
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        disabled={Boolean(saving)}
                                        onClick={() => setShowAcceptForm(true)}
                                        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl ${activeTheme.accentClass} px-5 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Accept Proposal
                                    </button>
                                    <button
                                        type="button"
                                        disabled={Boolean(saving)}
                                        onClick={() => void respond('declined')}
                                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-text-secondary hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors"
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

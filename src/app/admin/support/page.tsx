'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Bot, Clipboard, Loader2, MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { copyToClipboard } from '@/lib/client-clipboard';

type Investigation = {
    id: string;
    summary: string;
    issue_type: string;
    risk_level: string;
    action_needed: string;
    status: string;
    report_text: string;
    created_at: string;
};

type SupportTicket = {
    id: string;
    user_id?: string | null;
    user_email?: string | null;
    subject: string;
    message: string;
    category: string;
    affected_feature?: string | null;
    error_code?: string | null;
    browser?: string | null;
    device?: string | null;
    page_url?: string | null;
    status: string;
    priority: string;
    resolution_note?: string | null;
    resolved_at?: string | null;
    resolution_email_sent_at?: string | null;
    created_at: string;
    latestInvestigation?: Investigation | null;
};

const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'needs_human_review', label: 'Needs Review' },
    { value: 'waiting_on_user', label: 'Waiting' },
    { value: 'resolved', label: 'Resolved' },
];

function riskClass(risk?: string) {
    if (risk === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
    if (risk === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (risk === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || '';
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [investigating, setInvestigating] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [resolutionNote, setResolutionNote] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const selectedTicket = useMemo(
        () => tickets.find((ticket) => ticket.id === selectedId) || tickets[0],
        [selectedId, tickets],
    );

    const loadTickets = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const token = await getAccessToken();
            const response = await fetch(`/api/admin/support-agent/tickets?status=${encodeURIComponent(status)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Unable to load tickets');

            setTickets(data.tickets || []);
            setSelectedId((current) => {
                if (current && data.tickets?.some((ticket: SupportTicket) => ticket.id === current)) return current;
                return data.tickets?.[0]?.id || '';
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load tickets');
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        void loadTickets();
    }, [loadTickets]);

    async function investigate(ticketId: string) {
        setInvestigating(true);
        setError('');

        try {
            const token = await getAccessToken();
            const response = await fetch('/api/admin/support-agent/investigate', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticketId }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Unable to investigate ticket');

            await loadTickets();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to investigate ticket');
        } finally {
            setInvestigating(false);
        }
    }

    async function copyReport() {
        const report = selectedTicket?.latestInvestigation?.report_text;
        if (!report) return;

        await copyToClipboard(report);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    }

    async function resolveAndNotify(ticketId: string) {
        setResolving(true);
        setError('');

        try {
            const token = await getAccessToken();
            const response = await fetch('/api/admin/support-agent/resolve', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticketId, resolutionNote }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Unable to resolve and notify user');

            await loadTickets();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to resolve and notify user');
        } finally {
            setResolving(false);
        }
    }

    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Safe Support Agent
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">Support Investigations</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                            Review support tickets, generate safe investigation reports, and prepare PR or SQL change requests for human approval.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadTickets}
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">
                            <ArrowLeft className="h-4 w-4" />
                            Admin
                        </Link>
                    </div>
                </div>

                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    <div className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            This agent creates reports only. It does not deploy, run SQL repairs, change payments, change roles, disable RLS, or merge code. Reporter emails are sent only after an admin marks a ticket resolved.
                        </p>
                    </div>
                </div>

                {error ? (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
                    <aside className="rounded-2xl border border-border bg-white shadow-sm">
                        <div className="border-b border-border p-4">
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-text-secondary">Status</label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="w-full rounded-xl border border-border bg-neutral/30 px-3 py-2 text-sm outline-none focus:border-primary"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="max-h-[720px] overflow-y-auto">
                            {loading ? (
                                <div className="flex h-48 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="p-6 text-sm text-text-secondary">No support tickets found.</div>
                            ) : (
                                tickets.map((ticket) => (
                                    <button
                                        key={ticket.id}
                                        onClick={() => {
                                            setSelectedId(ticket.id);
                                            setResolutionNote(ticket.resolution_note || '');
                                        }}
                                        className={`block w-full border-b border-border p-4 text-left transition hover:bg-primary/5 ${selectedTicket?.id === ticket.id ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="rounded-full bg-neutral px-2 py-1 text-[10px] font-black uppercase tracking-wider text-text-secondary">
                                                {ticket.category}
                                            </span>
                                            <span className="text-[11px] font-semibold text-text-secondary">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h2 className="line-clamp-2 text-sm font-bold text-foreground">{ticket.subject}</h2>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{ticket.message}</p>
                                        {ticket.latestInvestigation ? (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${riskClass(ticket.latestInvestigation.risk_level)}`}>
                                                    {ticket.latestInvestigation.risk_level}
                                                </span>
                                                <span className="rounded-full border border-border px-2 py-1 text-[10px] font-black uppercase text-text-secondary">
                                                    {ticket.latestInvestigation.issue_type}
                                                </span>
                                            </div>
                                        ) : null}
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    <main className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                        {!selectedTicket ? (
                            <div className="flex min-h-[420px] items-center justify-center text-sm text-text-secondary">
                                Select a support ticket.
                            </div>
                        ) : (
                            <div>
                                <div className="mb-5 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-primary">{selectedTicket.id}</p>
                                        <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">{selectedTicket.subject}</h2>
                                        <p className="mt-2 text-sm text-text-secondary">
                                            {selectedTicket.affected_feature || 'Feature not provided'} · {selectedTicket.status}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button
                                            onClick={() => investigate(selectedTicket.id)}
                                            disabled={investigating}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-70"
                                        >
                                            {investigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                                            Run Safe Investigation
                                        </button>
                                        <button
                                            onClick={() => resolveAndNotify(selectedTicket.id)}
                                            disabled={resolving || !selectedTicket.user_email || selectedTicket.status === 'resolved'}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                                            title={!selectedTicket.user_email ? 'Reporter email is required' : selectedTicket.status === 'resolved' ? 'Ticket is already resolved' : 'Mark resolved and email the reporter'}
                                        >
                                            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                                            Resolve & Email User
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <section className="rounded-xl border border-border bg-neutral/20 p-4">
                                        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-text-secondary">Ticket Details</h3>
                                        <dl className="space-y-2 text-sm">
                                            <div><dt className="font-bold text-foreground">User</dt><dd className="break-all text-text-secondary">{selectedTicket.user_id || 'Not provided'}</dd></div>
                                            <div><dt className="font-bold text-foreground">Email</dt><dd className="break-all text-text-secondary">{selectedTicket.user_email ? 'Present' : 'Not provided'}</dd></div>
                                            <div><dt className="font-bold text-foreground">Error Code</dt><dd className="break-all text-text-secondary">{selectedTicket.error_code || 'Not provided'}</dd></div>
                                            <div><dt className="font-bold text-foreground">Browser</dt><dd className="break-all text-text-secondary">{selectedTicket.browser || 'Not provided'}</dd></div>
                                            <div><dt className="font-bold text-foreground">Device</dt><dd className="break-all text-text-secondary">{selectedTicket.device || 'Not provided'}</dd></div>
                                            <div><dt className="font-bold text-foreground">Resolution Email</dt><dd className="break-all text-text-secondary">{selectedTicket.resolution_email_sent_at ? new Date(selectedTicket.resolution_email_sent_at).toLocaleString() : 'Not sent'}</dd></div>
                                        </dl>
                                    </section>

                                    <section className="rounded-xl border border-border bg-neutral/20 p-4">
                                        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-text-secondary">User Message</h3>
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{selectedTicket.message}</p>
                                    </section>
                                </div>

                                <section className="mt-4 rounded-xl border border-border bg-neutral/20 p-4">
                                    <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-text-secondary">Resolution Email Note</h3>
                                    <textarea
                                        value={resolutionNote}
                                        onChange={(event) => setResolutionNote(event.target.value)}
                                        maxLength={1200}
                                        disabled={selectedTicket.status === 'resolved'}
                                        className="min-h-28 w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary disabled:bg-neutral/40 disabled:text-text-secondary"
                                        placeholder="Optional note included in the fixed-issue email. Example: We released a fix for the RSVP form and verified submissions are working again."
                                    />
                                    <p className="mt-2 text-xs text-text-secondary">
                                        The email asks the reporter to check again and contact support if the error still appears.
                                    </p>
                                </section>

                                <section className="mt-4 rounded-xl border border-border bg-neutral/20 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-text-secondary">Latest Investigation Report</h3>
                                        {selectedTicket.latestInvestigation?.report_text ? (
                                            <button
                                                onClick={copyReport}
                                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5"
                                            >
                                                <Clipboard className="h-3.5 w-3.5" />
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        ) : null}
                                    </div>

                                    {selectedTicket.latestInvestigation ? (
                                        <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-lg bg-white p-4 text-xs leading-6 text-foreground">
                                            {selectedTicket.latestInvestigation.report_text}
                                        </pre>
                                    ) : (
                                        <p className="text-sm text-text-secondary">
                                            No investigation yet. Run the safe investigation to create a report for human review.
                                        </p>
                                    )}
                                </section>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

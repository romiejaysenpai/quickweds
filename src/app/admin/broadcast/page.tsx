'use client';

import { useState } from 'react';
import { Loader2, Send, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { getCachedSession } from '@/lib/session-cache';

const DEFAULT_TITLE = 'New QuickWeds update: invitation background music';
const DEFAULT_MESSAGE = 'You can now upload a wedding song for your invitation page. Guests can tap to open the invitation, hear the music, and keep listening while they scroll through your wedding details.\n\nPlease send app feedback, questions, or error reports through the QuickWeds support form so we can keep improving the experience.';

export default function AdminBroadcastPage() {
    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [message, setMessage] = useState(DEFAULT_MESSAGE);
    const [link, setLink] = useState('/support');
    const [sendEmail, setSendEmail] = useState(true);
    const [skipInApp, setSkipInApp] = useState(false);
    const [recipients, setRecipients] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    async function runBroadcast(dryRun: boolean) {
        setLoading(true);
        setResult(null);

        try {
            const { data } = await getCachedSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Please sign in as admin first.');

            const response = await fetch('/api/admin/broadcast-updates', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dryRun,
                    sendEmail,
                    skipInApp,
                    title,
                    message,
                    link,
                    recipients: recipients
                        .split(/[\s,;]+/)
                        .map((value) => value.trim())
                        .filter(Boolean),
                }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || 'Broadcast failed.');
            setResult(payload);
        } catch (error) {
            setResult({ error: error instanceof Error ? error.message : 'Broadcast failed.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-5 shadow-xl sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Admin Broadcast
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">Notify users about updates</h1>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            Send an in-app notification to all QuickWeds accounts. Email is optional and should be used carefully.
                        </p>
                    </div>
                    <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">
                        Dashboard
                    </Link>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Title</span>
                        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary" />
                    </label>

                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Message</span>
                        <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm leading-6 outline-none focus:border-primary" />
                    </label>

                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Link</span>
                        <input value={link} onChange={(event) => setLink(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary" />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-border bg-neutral/40 p-4">
                        <input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} className="h-5 w-5 rounded border-border text-primary" />
                        <span className="text-sm font-semibold text-foreground">Also send email through Resend</span>
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-border bg-neutral/40 p-4">
                        <input type="checkbox" checked={skipInApp} onChange={(event) => setSkipInApp(event.target.checked)} className="h-5 w-5 rounded border-border text-primary" />
                        <span className="text-sm font-semibold text-foreground">Skip in-app notifications</span>
                    </label>

                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Specific email recipients</span>
                        <textarea
                            value={recipients}
                            onChange={(event) => setRecipients(event.target.value)}
                            rows={5}
                            placeholder="Optional. Paste failed email addresses here, separated by commas or new lines."
                            className="mt-2 w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm leading-6 outline-none focus:border-primary"
                        />
                        <span className="mt-1 block text-xs text-text-secondary">
                            If this is filled, email sends only to these addresses. Use with “Skip in-app notifications” to resend failed emails without duplicate app alerts.
                        </span>
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={() => void runBroadcast(true)} disabled={loading} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-bold text-primary disabled:opacity-50">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Dry Run
                        </button>
                        <button type="button" onClick={() => void runBroadcast(false)} disabled={loading} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Send Broadcast
                        </button>
                    </div>
                </div>

                {result && (
                    <pre className="mt-6 max-h-80 overflow-auto rounded-2xl bg-foreground p-4 text-xs leading-5 text-white no-scrollbar">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}

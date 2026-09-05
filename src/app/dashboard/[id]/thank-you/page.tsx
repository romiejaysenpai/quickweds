'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Image as ImageIcon,
    Mail,
    Palette,
    Send,
    Sparkles,
    Type,
} from 'lucide-react';
import { getCachedSession } from '@/lib/session-cache';
import { getThankYouNoteHtml } from '@/lib/email-templates';
import LoadingState from '@/components/ui/LoadingState';
import DashboardShell from '@/components/dashboard/DashboardShell';
import {
    THANK_YOU_COLOR_OPTIONS,
    THANK_YOU_DEFAULT_MESSAGE,
    THANK_YOU_FONT_OPTIONS,
    THANK_YOU_TEMPLATES,
    buildThankYouSubject,
    getDefaultCoupleSignature,
    getThankYouTemplate,
    normalizeThankYouStyle,
} from '@/lib/thank-you-email';

type Recipient = {
    id: string;
    guest_name: string;
    guest_email: string;
};

type LoadState = {
    wedding: {
        id: string;
        bride_name?: string | null;
        groom_name?: string | null;
        wedding_date?: string | null;
        hero_image?: string | null;
    } | null;
    hasPlannerPro: boolean;
    emailsUsed: number;
    logSchemaAvailable: boolean;
    recipients: Recipient[];
    unsentRecipients: Recipient[];
    alreadySentCount: number;
};

type SendResult = {
    sent?: number;
    failed?: number;
    skippedDuplicate?: number;
    emailErrors?: string[];
    recipientEmail?: string;
};

const EMPTY_LOAD_STATE: LoadState = {
    wedding: null,
    hasPlannerPro: false,
    emailsUsed: 0,
    logSchemaAvailable: true,
    recipients: [],
    unsentRecipients: [],
    alreadySentCount: 0,
};

export default function ThankYouBuilderPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const weddingId = params?.id || '';
    const [data, setData] = useState<LoadState>(EMPTY_LOAD_STATE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sendResult, setSendResult] = useState<SendResult | null>(null);
    const [submitting, setSubmitting] = useState<'test' | 'send' | null>(null);
    const [templateId, setTemplateId] = useState(THANK_YOU_TEMPLATES[0].id);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState(THANK_YOU_DEFAULT_MESSAGE);
    const [coupleSignature, setCoupleSignature] = useState('');
    const [accentColor, setAccentColor] = useState(THANK_YOU_TEMPLATES[0].defaultStyle.accentColor);
    const [fontFamily, setFontFamily] = useState(THANK_YOU_TEMPLATES[0].defaultStyle.fontFamily);
    const [photoUrl, setPhotoUrl] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
    const previewIframeRef = useRef<HTMLIFrameElement>(null);
    const [previewHeight, setPreviewHeight] = useState(520);
    const openedFrom = searchParams?.get('from');
    const backHref = openedFrom === 'planner' ? `/dashboard/${weddingId}/planner` : `/dashboard/${weddingId}`;
    const backLabel = openedFrom === 'planner' ? 'Wedding Planner' : 'Dashboard';

    const selectedTemplate = getThankYouTemplate(templateId);
    const style = normalizeThankYouStyle(templateId, { accentColor, fontFamily });
    const wedding = data.wedding;

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError('');
            try {
                const { data: sessionData } = await getCachedSession();
                const token = sessionData.session?.access_token;
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await fetch(`/api/weddings/thank-you/load?weddingId=${encodeURIComponent(weddingId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error || 'Unable to load thank-you builder.');
                if (cancelled) return;

                const nextData = { ...EMPTY_LOAD_STATE, ...result };
                const signature = getDefaultCoupleSignature(nextData.wedding?.bride_name, nextData.wedding?.groom_name);
                setData(nextData);
                setSubject(buildThankYouSubject(nextData.wedding?.bride_name, nextData.wedding?.groom_name));
                setCoupleSignature(signature);
                setMessage(THANK_YOU_DEFAULT_MESSAGE.replace('[Couple Names]', signature));
                setTestEmail(sessionData.session?.user?.email || '');
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load thank-you builder.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (weddingId) void load();
        return () => {
            cancelled = true;
        };
    }, [router, weddingId]);

    useEffect(() => {
        const template = getThankYouTemplate(templateId);
        setAccentColor(template.defaultStyle.accentColor);
        setFontFamily(template.defaultStyle.fontFamily);
    }, [templateId]);

    useEffect(() => {
        const textarea = messageTextareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [message]);

    const previewHtml = useMemo(() => getThankYouNoteHtml({
        recipientName: data.unsentRecipients[0]?.guest_name || 'Guest',
        brideName: wedding?.bride_name || '',
        groomName: wedding?.groom_name || '',
        weddingDate: wedding?.wedding_date || '',
        templateId,
        message,
        coupleSignature,
        style,
        photoUrl,
    }), [coupleSignature, data.unsentRecipients, message, photoUrl, style, templateId, wedding]);

    const resizePreviewIframe = useCallback(() => {
        const iframe = previewIframeRef.current;
        const doc = iframe?.contentDocument;
        if (!doc?.body || !doc.documentElement) return;

        doc.documentElement.style.overflow = 'hidden';
        doc.body.style.overflow = 'hidden';
        const nextHeight = Math.max(
            360,
            doc.body.scrollHeight,
            doc.documentElement.scrollHeight
        );
        setPreviewHeight(nextHeight);
    }, []);

    useEffect(() => {
        const frame = window.requestAnimationFrame(resizePreviewIframe);
        const timeout = window.setTimeout(resizePreviewIframe, 80);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
        };
    }, [previewHtml, resizePreviewIframe]);

    async function postAction(action: 'test' | 'send') {
        setSubmitting(action);
        setError('');
        setSuccess('');
        setSendResult(null);

        try {
            const { data: sessionData } = await getCachedSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error('Please sign in again before sending.');

            const response = await fetch(`/api/weddings/thank-you/${action}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    weddingId,
                    templateId,
                    subject,
                    message,
                    coupleSignature,
                    style,
                    photoUrl,
                    testEmail,
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Unable to send thank-you email.');

            setSendResult(result);
            setSuccess(action === 'test'
                ? `Test email sent to ${result.recipientEmail || testEmail}.`
                : `Sent ${result.sent || 0} thank-you email${result.sent === 1 ? '' : 's'}.`);

            if (action === 'send') {
                const loadResponse = await fetch(`/api/weddings/thank-you/load?weddingId=${encodeURIComponent(weddingId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                const loadResult = await loadResponse.json().catch(() => ({}));
                if (loadResponse.ok) setData({ ...EMPTY_LOAD_STATE, ...loadResult });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to send thank-you email.');
        } finally {
            setSubmitting(null);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen overflow-x-hidden bg-[#FFF8F9] px-3 py-4 text-foreground sm:px-4 sm:py-6">
                <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center">
                    <LoadingState
                        label="Loading thank-you builder…"
                        description="Preparing your guest list and message details."
                        className="max-w-md"
                    />
                </div>
            </main>
        );
    }

    return (
        <DashboardShell weddingId={weddingId}>
            <main className="min-h-screen overflow-x-hidden bg-[#FFF8F9] px-3 py-4 text-foreground sm:px-5 sm:py-6 flex-1">
                <div className="mx-auto w-full max-w-7xl min-w-0">
                    <div className="mb-4">
                        <Link href={backHref} className="inline-flex min-h-[40px] max-w-full items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                            <ArrowLeft className="h-4 w-4" /> {backLabel}
                        </Link>
                    </div>

                <section className="mb-4 overflow-hidden rounded-lg border border-primary/15 bg-white p-3 shadow-xl shadow-primary/10 sm:p-5 lg:p-6">
                    <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 break-words">
                            <p className="flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary sm:text-[11px] sm:tracking-[0.18em]">
                                <Mail className="h-4 w-4" /> Thank You Email
                            </p>
                            <h1 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">Card Builder</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                                {data.unsentRecipients.length} ready to send, {data.alreadySentCount} already sent.
                            </p>
                        </div>
                        <div className="grid w-full min-w-0 grid-cols-3 gap-1.5 text-center sm:gap-2 md:w-auto md:min-w-[300px]">
                            <Metric label="Confirmed" value={data.recipients.length} />
                            <Metric label="Unsent" value={data.unsentRecipients.length} />
                            <Metric label="Used" value={data.emailsUsed} />
                        </div>
                    </div>
                </section>

                {error && <StatusBanner tone="error" message={error} />}
                {success && <StatusBanner tone="success" message={success} />}
                {!data.logSchemaAvailable && (
                    <StatusBanner tone="error" message="Thank-you email logs are not installed yet. Apply the supplied SQL before sending." />
                )}

                <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
                    <section className="min-w-0 space-y-4">
                        <Panel title="Template" icon={<Sparkles className="h-4 w-4" />}>
                            <div className="grid min-w-0 gap-2 sm:grid-cols-2 sm:gap-3">
                                {THANK_YOU_TEMPLATES.map((template) => {
                                    const selected = template.id === templateId;
                                    return (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => setTemplateId(template.id)}
                                            className={`min-h-[104px] min-w-0 overflow-hidden rounded-lg border p-3 text-left transition sm:min-h-[116px] sm:p-4 ${selected ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-white hover:border-primary/30'} ${template.previewClassName}`}
                                        >
                                            <span className="block truncate text-[10px] font-black uppercase tracking-[0.12em] text-primary sm:tracking-[0.16em]">{template.eyebrow}</span>
                                            <span className="mt-2 block break-words font-serif text-base font-bold leading-tight text-foreground sm:text-lg">{template.name}</span>
                                            <span className="mt-1 block break-words text-xs leading-5 text-text-secondary">{template.description}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Panel>

                        <Panel title="Message" icon={<Mail className="h-4 w-4" />}>
                            <div className="space-y-3">
                                <FieldLabel label="Subject" />
                                <input
                                    value={subject}
                                    onChange={(event) => setSubject(event.target.value)}
                                    className="w-full min-w-0 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    maxLength={160}
                                />

                                <FieldLabel label="Message" />
                                <textarea
                                    ref={messageTextareaRef}
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    className="min-h-[190px] w-full min-w-0 resize-none overflow-hidden rounded-lg border border-border bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 sm:min-h-[220px]"
                                    maxLength={3000}
                                />

                                <FieldLabel label="Signature" />
                                <input
                                    value={coupleSignature}
                                    onChange={(event) => setCoupleSignature(event.target.value)}
                                    className="w-full min-w-0 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    maxLength={200}
                                />
                            </div>
                        </Panel>

                        <Panel title="Style" icon={<Palette className="h-4 w-4" />}>
                            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                                <div className="min-w-0">
                                    <FieldLabel label="Color" />
                                    <div className="flex flex-wrap gap-2">
                                        {THANK_YOU_COLOR_OPTIONS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setAccentColor(color)}
                                                aria-label={`Use color ${color}`}
                                                className={`h-10 w-10 rounded-full border-2 transition ${accentColor === color ? 'border-foreground ring-4 ring-primary/15' : 'border-white shadow-md shadow-primary/10'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <FieldLabel label="Font" />
                                    <div className="relative">
                                        <Type className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                                        <select
                                            value={fontFamily}
                                            onChange={(event) => setFontFamily(event.target.value)}
                                            className="w-full min-w-0 appearance-none rounded-lg border border-border bg-white py-3 pl-10 pr-4 text-sm font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        >
                                            {THANK_YOU_FONT_OPTIONS.map((font) => (
                                                <option key={font.value} value={font.value}>{font.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {selectedTemplate.supportsPhoto && (
                                <div className="mt-4 min-w-0">
                                    <FieldLabel label="Photo URL" />
                                    <div className="relative">
                                        <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                                        <input
                                            value={photoUrl}
                                            onChange={(event) => setPhotoUrl(event.target.value)}
                                            placeholder={wedding?.hero_image || 'https://...'}
                                            className="w-full min-w-0 rounded-lg border border-border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            )}
                        </Panel>

                        <Panel title="Send" icon={<Send className="h-4 w-4" />}>
                            <div className="space-y-3">
                                <FieldLabel label="Test email" />
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(event) => setTestEmail(event.target.value)}
                                    className="w-full min-w-0 rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                <div className="grid min-w-0 gap-2 sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={() => void postAction('test')}
                                        disabled={Boolean(submitting) || !data.logSchemaAvailable}
                                        className="inline-flex min-h-[48px] min-w-0 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-white px-4 text-sm font-black text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                                    >
                                        {submitting === 'test' ? <LoadingState variant="inline" label="Sending test email…" /> : <Mail className="h-4 w-4" />}
                                        Send Test
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void postAction('send')}
                                        disabled={Boolean(submitting) || !data.logSchemaAvailable || data.unsentRecipients.length === 0}
                                        className="inline-flex min-h-[48px] min-w-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                                    >
                                        {submitting === 'send' ? <LoadingState variant="inline" label="Sending thank-you emails…" /> : <Send className="h-4 w-4" />}
                                        Send to Guests
                                    </button>
                                </div>
                                {sendResult?.emailErrors?.length ? (
                                    <div className="min-w-0 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                        {sendResult.emailErrors.slice(0, 3).map((item) => <p key={item} className="break-words">{item}</p>)}
                                    </div>
                                ) : null}
                            </div>
                        </Panel>
                    </section>

                    <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
                        <Panel title="Preview" icon={<Sparkles className="h-4 w-4" />}>
                            <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-neutral/30 p-1.5 sm:p-2">
                                <iframe
                                    key={previewHtml}
                                    ref={previewIframeRef}
                                    title="Thank-you email preview"
                                    srcDoc={previewHtml}
                                    scrolling="no"
                                    onLoad={resizePreviewIframe}
                                    className="w-full rounded-md border-0 bg-white"
                                    style={{ height: previewHeight }}
                                />
                            </div>
                        </Panel>

                        <Panel title="Recipients" icon={<CheckCircle2 className="h-4 w-4" />}>
                            {data.unsentRecipients.length === 0 ? (
                                <div className="min-w-0 rounded-lg border border-dashed border-border bg-neutral/30 p-4 text-center sm:p-5">
                                    <p className="break-words font-serif text-lg font-bold leading-tight text-foreground">
                                        {data.recipients.length === 0 ? 'No confirmed guest emails' : 'All thank-you emails sent'}
                                    </p>
                                    <p className="mt-2 break-words text-sm leading-6 text-text-secondary">
                                        {data.recipients.length === 0 ? 'Confirmed guests with valid email addresses will appear here.' : 'Duplicate sends are blocked by the thank-you email log.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-[280px] min-w-0 overflow-y-auto rounded-lg border border-border">
                                    {data.unsentRecipients.slice(0, 12).map((guest) => (
                                        <div key={guest.id} className="flex min-w-0 items-center justify-between gap-3 border-b border-border/70 bg-white px-3 py-3 last:border-b-0 sm:px-4">
                                            <div className="min-w-0 overflow-hidden">
                                                <p className="truncate text-sm font-bold text-foreground">{guest.guest_name}</p>
                                                <p className="truncate text-xs text-text-secondary">{guest.guest_email}</p>
                                            </div>
                                            <CheckCircle2 className="h-4 w-4 flex-none text-emerald-600" />
                                        </div>
                                    ))}
                                    {data.unsentRecipients.length > 12 && (
                                        <div className="bg-neutral/40 px-4 py-3 text-center text-xs font-bold text-text-secondary">
                                            +{data.unsentRecipients.length - 12} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </Panel>
                    </aside>
                </div>
            </div>
        </main>
        </DashboardShell>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="min-w-0 rounded-lg border border-border bg-neutral/30 px-2 py-2.5 sm:px-3 sm:py-3">
            <p className="truncate font-mono text-lg font-black leading-none text-primary sm:text-xl">{value}</p>
            <p className="mt-1 truncate text-[8px] font-black uppercase tracking-[0.08em] text-text-secondary sm:text-[9px] sm:tracking-[0.14em]">{label}</p>
        </div>
    );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-white p-3 shadow-lg shadow-primary/5 sm:p-5">
            <div className="mb-4 flex min-w-0 items-center gap-2 border-b border-border/70 pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
                <h2 className="min-w-0 truncate font-serif text-lg font-bold text-foreground">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function FieldLabel({ label }: { label: string }) {
    return <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">{label}</label>;
}

function StatusBanner({ tone, message }: { tone: 'error' | 'success'; message: string }) {
    const isError = tone === 'error';
    return (
        <div className={`mb-4 flex min-w-0 items-start gap-3 rounded-lg border p-3 text-sm sm:p-4 ${isError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            {isError ? <AlertCircle className="mt-0.5 h-4 w-4 flex-none" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />}
            <p className="min-w-0 break-words leading-6">{message}</p>
        </div>
    );
}

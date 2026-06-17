'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Mail, Loader2, QrCode, Share2, TrendingUp, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { getWeddingAnalyticsSummary } from '@/lib/wedding-features';
import UpgradeButton from '@/components/UpgradeButton';
import { FREE_PLAN_LIMITS } from '@/lib/planner-limits';
import { getCachedSession } from '@/lib/session-cache';

interface AnalyticsPanelProps {
    weddingId: string;
    rsvpCount: number;
    pendingGuestCount: number;
    hasPlannerPro?: boolean;
    guestEmailsUsed?: number;
}

const COLORS = ['#D16C78', '#CBB26A', '#5B8A72', '#4B6B8A'];

export default function AnalyticsPanel({ weddingId, rsvpCount, pendingGuestCount, hasPlannerPro = false, guestEmailsUsed = 0 }: AnalyticsPanelProps) {
    const [loading, setLoading] = useState(true);
    const [sendingReminder, setSendingReminder] = useState(false);
    const [summary, setSummary] = useState({
        totalVisits: 0,
        uniqueVisitors: 0,
        qrScans: 0,
        rsvpConversionRate: 0,
        shareActions: 0,
        remindersSent: 0,
        reminderRecipients: 0,
        reminderResponses: 0,
        sourceBreakdown: [] as Array<{ name: string; value: number }>,
    });

    const loadSummary = useCallback(async () => {
        setLoading(true);
        const next = await getWeddingAnalyticsSummary(weddingId, rsvpCount);
        setSummary(next);
        setLoading(false);
    }, [weddingId, rsvpCount]);

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);

    const stats = useMemo(() => ([
        { label: 'Visits', value: summary.totalVisits, icon: Activity },
        { label: 'Unique Guests', value: summary.uniqueVisitors, icon: Users },
        { label: 'QR Visits', value: summary.qrScans, icon: QrCode },
        { label: 'RSVP Conversion', value: `${summary.rsvpConversionRate}%`, icon: TrendingUp },
    ]), [summary]);

    const sendReminder = async () => {
        setSendingReminder(true);
        try {
            const { data: sessionData } = await getCachedSession();
            const res = await fetch('/api/weddings/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
                },
                body: JSON.stringify({
                    weddingId,
                    targetStatus: 'pending',
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send reminders');
            }

            await loadSummary();
            alert(`Reminder run completed. ${data.successCount}/${data.recipientCount} emails sent.`);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to send reminders');
        } finally {
            setSendingReminder(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow flex items-center justify-center min-h-[240px]">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-white p-4 soft-shadow sm:rounded-3xl sm:p-6 md:p-8">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-foreground sm:text-xl">
                        <BarChart3 className="h-5 w-5 flex-shrink-0 text-primary" /> Wedding Analytics
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">Traffic, QR performance, RSVP conversion, and reminder follow-through.</p>
                </div>
                <button
                    onClick={sendReminder}
                    disabled={sendingReminder || pendingGuestCount === 0 || (!hasPlannerPro && guestEmailsUsed >= FREE_PLAN_LIMITS.userTriggeredEmails)}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 text-xs font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-50 sm:w-auto sm:text-sm"
                >
                    {sendingReminder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Send RSVP Reminder
                </button>
            </div>

            {!hasPlannerPro && (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold text-text-secondary">
                        Guest emails used: <span className="font-black text-foreground">{guestEmailsUsed} / {FREE_PLAN_LIMITS.userTriggeredEmails}</span>. Upgrade for unlimited reminders, exports, and deeper analytics.
                    </p>
                    <UpgradeButton weddingId={weddingId} variant="outlined" className="justify-center text-sm" />
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex min-h-[118px] min-w-0 flex-col items-center justify-between rounded-2xl border border-border bg-neutral/50 p-3 text-center dark:bg-neutral/40 sm:p-4">
                        <stat.icon className="mb-2 h-4 w-4 flex-shrink-0 text-primary" />
                        <div className="min-w-0">
                            <p className="truncate text-xl font-black leading-none text-foreground sm:text-2xl">{stat.value}</p>
                            <p className="mt-2 min-h-[28px] max-w-full text-[9px] font-black uppercase leading-tight tracking-[0.08em] text-text-secondary/60 [overflow-wrap:anywhere]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {hasPlannerPro ? <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="min-w-0 rounded-2xl border border-border bg-neutral/40 p-4 dark:bg-neutral/30">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-text-secondary/60 mb-3">Visit Sources</h4>
                    {summary.sourceBreakdown.length > 0 ? (
                        <div className="h-44 min-h-[1px] w-full min-w-[1px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                                <BarChart data={summary.sourceBreakdown}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'currentColor' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {summary.sourceBreakdown.map((entry, index) => (
                                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">Traffic data will appear after your wedding page starts receiving visits.</p>
                    )}
                </div>

                <div className="min-w-0 space-y-3 rounded-2xl border border-border bg-neutral/40 p-4 dark:bg-neutral/30">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-text-secondary/60">Reminder Performance</h4>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Reminder runs</span>
                        <span className="font-bold text-foreground">{summary.remindersSent}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Reminder recipients</span>
                        <span className="font-bold text-foreground">{summary.reminderRecipients}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Responses after latest reminder</span>
                        <span className="font-bold text-primary">{summary.reminderResponses}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Share actions logged</span>
                        <span className="font-bold text-foreground inline-flex items-center gap-1"><Share2 className="w-3 h-3" /> {summary.shareActions}</span>
                    </div>
                </div>
            </div> : (
                <div className="mt-4 rounded-2xl border border-border bg-neutral/40 p-4 text-sm font-semibold text-text-secondary">
                    Planner Lite shows basic counts. Planner Pro unlocks reminder performance, traffic sources, exports, and campaign follow-through.
                </div>
            )}
        </div>
    );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Mail, Loader2, QrCode, Share2, TrendingUp, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { getWeddingAnalyticsSummary } from '@/lib/wedding-features';

interface AnalyticsPanelProps {
    weddingId: string;
    rsvpCount: number;
    pendingGuestCount: number;
}

const COLORS = ['#D16C78', '#CBB26A', '#5B8A72', '#4B6B8A'];

export default function AnalyticsPanel({ weddingId, rsvpCount, pendingGuestCount }: AnalyticsPanelProps) {
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
            const res = await fetch('/api/weddings/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" /> Wedding Analytics
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">Traffic, QR performance, RSVP conversion, and reminder follow-through.</p>
                </div>
                <button
                    onClick={sendReminder}
                    disabled={sendingReminder || pendingGuestCount === 0}
                    className="px-4 py-3 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-hover transition-all disabled:opacity-50 min-h-[44px] inline-flex items-center gap-2"
                >
                    {sendingReminder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Send RSVP Reminder
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="p-3 sm:p-4 rounded-2xl bg-neutral/50 border border-border">
                        <stat.icon className="w-4 h-4 text-primary mb-2" />
                        <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-widest font-black text-text-secondary/60">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral/40 border border-border">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-text-secondary/60 mb-3">Visit Sources</h4>
                    {summary.sourceBreakdown.length > 0 ? (
                        <div className="h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.sourceBreakdown}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <Tooltip />
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

                <div className="p-4 rounded-2xl bg-neutral/40 border border-border space-y-3">
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
            </div>
        </div>
    );
}

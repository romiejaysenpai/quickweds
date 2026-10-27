'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    Crown, 
    Mail, 
    Globe, 
    CheckCircle2, 
    ArrowRight, 
    Calendar, 
    CheckSquare, 
    Wallet, 
    Store, 
    Users, 
    FileSpreadsheet, 
    Camera,
    Info,
    ExternalLink
} from 'lucide-react';
import type { AccountProfile, AccountUsageSummary, WeddingUsageSummary } from '@/lib/account';
import { FREE_PLAN_LIMITS } from '@/lib/planner-limits';
import UpgradeModal from '@/components/UpgradeModal';

interface AccountPlanCreditsProps {
    profile: AccountProfile | null;
    usageSummary: AccountUsageSummary | null;
    userEmail?: string | null;
    isAdmin?: boolean;
    onRefresh?: () => void;
}

export default function AccountPlanCredits({
    profile,
    usageSummary,
    isAdmin = false,
}: AccountPlanCreditsProps) {
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [selectedWeddingForUpgrade, setSelectedWeddingForUpgrade] = useState<string | undefined>();

    const isAccountPro = Boolean(usageSummary?.is_account_pro || profile?.is_pro || profile?.payment_status === 'paid' || isAdmin);
    const weddings = usageSummary?.weddings || [];
    const activeWeddingsCount = usageSummary?.active_weddings_count ?? weddings.length;
    const websitesLimit = isAccountPro ? 'Unlimited' : '3';

    // Total emails across all owned weddings
    const totalEmailsUsed = weddings.reduce((sum, w) => sum + (w.user_triggered_emails_used || 0), 0);
    const primaryWedding = weddings[0] as WeddingUsageSummary | undefined;
    const primaryHasPro = isAccountPro || Boolean(primaryWedding?.has_pro);
    
    // For free users, display remaining credits on their primary wedding or first active wedding
    const displayEmailUsage = primaryWedding ? primaryWedding.user_triggered_emails_used : totalEmailsUsed;
    const emailLimit = FREE_PLAN_LIMITS.userTriggeredEmails;
    const emailRemaining = primaryHasPro ? 'Unlimited' : Math.max(0, emailLimit - displayEmailUsage);
    const emailUsagePercent = primaryHasPro ? 100 : Math.min(100, Math.round((displayEmailUsage / emailLimit) * 100));

    const handleOpenUpgrade = (weddingId?: string) => {
        setSelectedWeddingForUpgrade(weddingId);
        setUpgradeModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Plan Status Banner */}
            <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-all ${
                isAccountPro || primaryHasPro
                    ? 'border-amber-300/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-primary/10 shadow-lg shadow-amber-500/5'
                    : 'border-primary/20 bg-gradient-to-br from-primary/5 via-neutral/50 to-white shadow-sm'
            }`}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider bg-white shadow-sm border border-border">
                            {isAccountPro ? (
                                <>
                                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-amber-700">Account Pro Active</span>
                                </>
                            ) : primaryHasPro ? (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-primary">Planner Pro Active</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    <span className="text-text-secondary">Free Planner Lite</span>
                                </>
                            )}
                        </div>

                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                            {isAccountPro ? 'All-Access Account Pro' : primaryHasPro ? 'Planner Pro Unlocked' : 'QuickWeds Free Plan'}
                        </h2>

                        <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
                            {isAccountPro || primaryHasPro
                                ? '✨ Lifetime access to all premium tools, unlimited guest emails, seating chart, reminders, and CSV exports. No recurring subscriptions or monthly fees.'
                                : 'You are currently on the Free Plan. Upgrade once for ₱850 to unlock unlimited guest emails, complete planner tools, Google Calendar sync, and exports.'}
                        </p>
                    </div>

                    {!(isAccountPro || primaryHasPro) && (
                        <div className="shrink-0 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenUpgrade(primaryWedding?.id)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white text-sm font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all"
                            >
                                <Sparkles className="w-4 h-4" />
                                Upgrade to Pro for ₱850
                            </button>
                            <p className="text-[11px] font-bold text-text-secondary/70 text-center">
                                Pay once • No hidden fees
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Email Credits Card */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            Email Credits
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            primaryHasPro ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary'
                        }`}>
                            {primaryHasPro ? 'Unlimited' : `${emailRemaining} left`}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="font-serif text-3xl font-bold text-foreground">
                            {primaryHasPro ? 'Unlimited' : `${displayEmailUsage} / ${emailLimit}`}
                        </span>
                        <span className="text-xs font-semibold text-text-secondary">
                            {primaryHasPro ? 'emails sent' : 'credits used'}
                        </span>
                    </div>

                    {/* Progress bar */}
                    {!primaryHasPro ? (
                        <div className="space-y-1.5">
                            <div className="h-2 w-full rounded-full bg-neutral overflow-hidden border border-border/50">
                                <div 
                                    className={`h-full transition-all duration-500 rounded-full ${
                                        emailUsagePercent > 85 ? 'bg-red-500' : emailUsagePercent > 60 ? 'bg-amber-500' : 'bg-primary'
                                    }`}
                                    style={{ width: `${emailUsagePercent}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-text-secondary">
                                Used for RSVP confirmations, reminders, seat links & updates.
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-green-700 font-medium flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Send unlimited emails and reminders anytime.
                        </p>
                    )}
                </div>

                {/* Wedding Websites Quota Card */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            Wedding Sites
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral text-text-secondary">
                            Active
                        </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="font-serif text-3xl font-bold text-foreground">
                            {activeWeddingsCount} <span className="text-xl font-normal text-text-secondary">/ {websitesLimit}</span>
                        </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                        {isAccountPro 
                            ? 'Create unlimited wedding websites across your account.' 
                            : 'Free plan includes up to 3 wedding websites. Upgrade to Account Pro for unlimited.'}
                    </p>
                </div>

                {/* Account Pro Status / One-Time Pricing */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-3 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" />
                            Pricing & Currency
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            PHP (₱)
                        </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="font-serif text-3xl font-bold text-primary">₱850</span>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">/ one-time</span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                        Pricing in Philippine Pesos. Single checkout with Stripe, no recurring subscription charges.
                    </p>
                </div>
            </div>

            {/* Weddings Breakdown (if user has weddings) */}
            {weddings.length > 0 && (
                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">Your Weddings & Credit Breakdown</h3>
                            <p className="text-xs text-text-secondary">Individual email and tool usage per wedding workspace</p>
                        </div>
                        <Link 
                            href="/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                            Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid gap-3">
                        {weddings.map((w) => {
                            const weddingHasPro = isAccountPro || Boolean(w.has_pro);
                            return (
                                <div 
                                    key={w.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral/40 border border-border/80 hover:border-primary/30 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm text-foreground">{w.wedding_name}</h4>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                weddingHasPro 
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                    : 'bg-white border border-border text-text-secondary'
                                            }`}>
                                                {weddingHasPro ? 'Pro' : 'Free Lite'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5 text-primary/70" />
                                                <strong>{w.user_triggered_emails_used}</strong> / {weddingHasPro ? 'Unlimited' : '50'} emails
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-primary/70" />
                                                <strong>{w.guest_email_count}</strong> guests with email
                                            </span>
                                            <span>•</span>
                                            <span>
                                                <strong>{w.planner_usage?.tasks || 0}</strong> tasks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        {!weddingHasPro && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenUpgrade(w.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-hover transition-colors"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Upgrade ₱850
                                            </button>
                                        )}
                                        <Link
                                            href={`/dashboard/${w.id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
                                        >
                                            Workspace <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Feature Access Comparison Table */}
            <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h3 className="font-serif text-lg font-bold text-foreground">Free Lite vs Planner Pro Feature Access</h3>
                        <p className="text-xs text-text-secondary">Compare what is included in Free vs Pro</p>
                    </div>
                </div>

                <div className="grid gap-2 text-xs sm:text-sm">
                    {[
                        { label: 'Guest Emails & Automated Reminders', free: '50 sends', pro: 'Unlimited', icon: Mail },
                        { label: 'Wedding Website Builder & Themes', free: 'Full access (up to 3 sites)', pro: 'Unlimited websites', icon: Globe },
                        { label: 'Checklist & Task Planner', free: 'Up to 25 tasks', pro: 'Unlimited tasks', icon: CheckSquare },
                        { label: 'Wedding Budget Tracker', free: 'Up to 10 budget items', pro: 'Unlimited budget items', icon: Wallet },
                        { label: 'Saved Suppliers & Vendors', free: 'Up to 5 vendors', pro: 'Unlimited vendors', icon: Store },
                        { label: 'Seating Chart Builder & Tables', free: 'Up to 3 tables', pro: 'Unlimited tables & floorplans', icon: Users },
                        { label: 'Google Calendar Two-Way Sync', free: 'Locked', pro: 'Full synchronization', icon: Calendar },
                        { label: 'CSV Guest List Export', free: 'Locked', pro: 'One-click spreadsheet download', icon: FileSpreadsheet },
                        { label: 'Guest Disposable Camera Photo Portal', free: '12 uploads', pro: 'Unlimited photo sharing & moderation', icon: Camera },
                    ].map((row) => (
                        <div 
                            key={row.label}
                            className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 rounded-xl border border-transparent hover:border-border hover:bg-neutral/30 transition-all gap-1.5 sm:gap-4"
                        >
                            <span className="flex items-center gap-2.5 font-medium text-foreground">
                                <row.icon className="w-4 h-4 text-primary shrink-0" />
                                {row.label}
                            </span>
                            <div className="flex items-center gap-4 text-xs font-semibold sm:text-right">
                                <span className="text-text-secondary">Free: {row.free}</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Pro: {row.pro}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {!(isAccountPro || primaryHasPro) && (
                    <div className="pt-2 text-center">
                        <button
                            type="button"
                            onClick={() => handleOpenUpgrade(primaryWedding?.id)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Unlock Planner Pro for ₱850
                        </button>
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                weddingId={selectedWeddingForUpgrade}
                scope={selectedWeddingForUpgrade ? 'wedding' : 'account'}
            />
        </div>
    );
}

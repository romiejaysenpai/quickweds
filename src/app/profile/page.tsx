'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    User, 
    Settings, 
    Loader2, 
    Crown, 
    Sparkles, 
    Mail, 
    Calendar,
    LogOut,
    CheckCircle2,
    Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';
import { getClientAccountSummary, type AccountProfile, type AccountUsageSummary } from '@/lib/account';
import AccountPlanCredits from '@/components/profile/AccountPlanCredits';

export default function ProfilePage() {
    const { user, loading: authLoading, logout, isAdmin } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<AccountProfile | null>(null);
    const [usageSummary, setUsageSummary] = useState<AccountUsageSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const { data: sessionData } = await getCachedSession();
            const token = sessionData.session?.access_token;
            if (!token) {
                router.replace('/login?next=/profile');
                return;
            }

            const data = await getClientAccountSummary(token);
            setProfile(data.profile);
            setUsageSummary(data.usageSummary);
        } catch (err) {
            console.error('Failed to load profile summary:', err);
            setError(err instanceof Error ? err.message : 'Unable to load profile data.');
        } finally {
            setLoading(false);
        }
    }, [user, router]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login?next=/profile');
            return;
        }

        if (user) {
            void loadData();
        }
    }, [user, authLoading, router, loadData]);

    if (authLoading || (loading && !profile)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-semibold text-text-secondary">Loading your profile & credits...</p>
                </div>
            </div>
        );
    }

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const isPro = Boolean(usageSummary?.is_account_pro || profile?.is_pro || profile?.payment_status === 'paid' || isAdmin);

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 pb-24">
            <div className="max-w-4xl mx-auto pt-4 sm:pt-8 space-y-6">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link 
                        href="/dashboard" 
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <Link
                        href="/settings"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-text-secondary hover:text-primary transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Account Settings
                    </Link>
                </div>

                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary via-primary/95 to-rose-600 p-6 sm:p-8 text-white shadow-xl shadow-primary/20">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-serif text-2xl sm:text-3xl font-bold shadow-inner border border-white/30 shrink-0">
                                {initials || <User className="w-8 h-8" />}
                            </div>

                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                                        {displayName}
                                    </h1>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm border border-white/20">
                                        {isPro ? (
                                            <>
                                                <Crown className="w-3 h-3 text-amber-300" />
                                                Pro Member
                                            </>
                                        ) : (
                                            'Free Member'
                                        )}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-white/80 font-medium">{email}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                href="/settings"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold backdrop-blur-sm border border-white/20 transition-all shadow-sm"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Edit Settings
                            </Link>
                            <button
                                type="button"
                                onClick={() => logout()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs sm:text-sm font-bold backdrop-blur-sm border border-white/15 transition-all"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Plan Status & Credits Component */}
                <AccountPlanCredits
                    profile={profile}
                    usageSummary={usageSummary}
                    userEmail={user?.email}
                    isAdmin={isAdmin}
                    onRefresh={loadData}
                />
            </div>
        </div>
    );
}

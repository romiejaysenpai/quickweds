'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface UpgradeButtonProps {
    weddingId?: string;
    plan?: 'planner_pro' | 'premium' | 'elite';
    variant?: 'primary' | 'outlined';
    className?: string;
}

export default function UpgradeButton({ weddingId: propWeddingId, plan = 'planner_pro', variant = 'primary', className = '' }: UpgradeButtonProps) {
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [weddingId, setWeddingId] = useState<string | null>(propWeddingId || null);
    const [fetchingWedding, setFetchingWedding] = useState(!propWeddingId && Boolean(user));

    useEffect(() => {
        if (propWeddingId) {
            setWeddingId(propWeddingId);
            return;
        }

        if (!user) return;

        const fetchFirstWedding = async () => {
            setFetchingWedding(true);
            const { data } = await supabase
                .from('weddings')
                .select('id')
                .eq('user_id', user.id)
                .is('deleted_at', null)
                .limit(1);

            if (data && data.length > 0) {
                setWeddingId(data[0].id);
            }
            setFetchingWedding(false);
        };

        void fetchFirstWedding();
    }, [user, propWeddingId]);

    if (isAdmin) return null;

    const handleUpgrade = async () => {
        if (!weddingId || loading) return;

        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weddingId, plan }),
            });
            const data = await response.json();

            if (!response.ok || !data.url) {
                throw new Error(data.error || 'Unable to start checkout.');
            }

            window.location.href = data.url;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to start checkout.';
            alert(message);
            setLoading(false);
        }
    };

    const baseStyles = variant === 'primary'
        ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40'
        : 'bg-neutral text-primary border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5';

    if (fetchingWedding) {
        return (
            <button disabled className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 opacity-50 cursor-not-allowed ${baseStyles} ${className}`}>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
            </button>
        );
    }

    if (!weddingId) {
        return (
            <Link
                href="/builder"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${baseStyles} ${className}`}
            >
                <Sparkles className="w-5 h-5" />
                Create Wedding to Upgrade
            </Link>
        );
    }

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${baseStyles} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <Sparkles className="w-5 h-5" />
                    Unlock Planner Pro
                </>
            )}
        </button>
    );
}

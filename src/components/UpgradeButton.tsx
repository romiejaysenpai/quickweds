'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UpgradeButtonProps {
    weddingId: string;
    plan?: 'planner_pro' | 'premium' | 'elite';
    variant?: 'primary' | 'outlined';
    className?: string;
}

export default function UpgradeButton({ weddingId, plan = 'planner_pro', variant = 'primary', className = '' }: UpgradeButtonProps) {
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(false);

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

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading || !weddingId}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${baseStyles} ${className} ${loading || !weddingId ? 'opacity-50 cursor-not-allowed' : ''}`}
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

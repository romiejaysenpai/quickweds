'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface UpgradeButtonProps {
    weddingId: string;
    plan?: 'premium' | 'elite';
    variant?: 'primary' | 'outlined';
    className?: string;
}

export default function UpgradeButton({ weddingId, plan = 'premium', variant = 'primary', className = '' }: UpgradeButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weddingId, plan }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            alert('Failed to start upgrade process. Please try again.');
            setLoading(false);
        }
    };

    const baseStyles = variant === 'primary'
        ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40'
        : 'bg-neutral text-primary border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5';

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
                    Upgrade to Premium
                </>
            )}
        </button>
    );
}

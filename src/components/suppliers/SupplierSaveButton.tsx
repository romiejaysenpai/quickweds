'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Loader2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UpgradeButton from '@/components/UpgradeButton';
import { getCachedSession } from '@/lib/session-cache';

type SaveState = 'idle' | 'saving' | 'saved' | 'needs_wedding' | 'needs_pro' | 'error';

export default function SupplierSaveButton({
    supplierId,
    weddingId,
    className = '',
}: {
    supplierId: string;
    weddingId?: string;
    className?: string;
}) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [state, setState] = useState<SaveState>('idle');
    const [message, setMessage] = useState('');
    const [upgradeWeddingId, setUpgradeWeddingId] = useState<string | null>(null);
    const [plannerWeddingId, setPlannerWeddingId] = useState<string | null>(weddingId || null);

    if (!user) {
        return (
            <Link href={`/login?next=${encodeURIComponent(pathname || '/suppliers')}`} className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover ${className}`}>
                Sign in to Save
            </Link>
        );
    }

    if (state === 'needs_wedding') {
        return (
            <Link href="/builder" className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover ${className}`}>
                Create Wedding First
            </Link>
        );
    }

    if (state === 'needs_pro' && upgradeWeddingId) {
        return <UpgradeButton weddingId={upgradeWeddingId} className={className} />;
    }

    if (state === 'saved') {
        return (
            <Link href={plannerWeddingId ? `/dashboard/${plannerWeddingId}/planner?tab=vendors` : '/dashboard'} className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 ${className}`}>
                <CheckCircle2 className="h-4 w-4" />
                View Suppliers/Vendors
            </Link>
        );
    }

    const saveSupplier = async () => {
        setState('saving');
        setMessage('');

        const { data: sessionData } = await getCachedSession();
        const token = sessionData.session?.access_token;

        if (!token) {
            setState('error');
            setMessage('Please sign in again to save this supplier.');
            return;
        }

        const response = await fetch('/api/suppliers/save-to-planner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ supplierId, weddingId }),
        });
        const data = await response.json();

        if (response.ok) {
            setPlannerWeddingId(data.weddingId || weddingId || null);
            setState('saved');
            setMessage(data.alreadySaved ? 'This supplier is already in your Suppliers/Vendors list.' : 'Supplier added to your Suppliers/Vendors list.');
            return;
        }

        if (data.code === 'needs_wedding') {
            setState('needs_wedding');
            setMessage(data.error);
            return;
        }

        if (data.code === 'planner_pro_required') {
            setUpgradeWeddingId(data.weddingId);
            setState('needs_pro');
            setMessage(data.error);
            return;
        }

        setState('error');
        setMessage(data.error || 'Unable to save supplier.');
    };

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={saveSupplier}
                disabled={state === 'saving'}
                className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            >
                {state === 'saving' ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Plus className="h-4 w-4" />
                        Add to Suppliers/Vendors
                    </>
                )}
            </button>
            {message && (
                <p className={`text-xs font-semibold ${state === 'error' ? 'text-red-600' : 'text-text-secondary'}`}>
                    <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
                    {message}
                </p>
            )}
        </div>
    );
}

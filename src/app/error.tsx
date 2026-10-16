'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Root app error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
            <div className="max-w-xl w-full rounded-[2rem] border border-primary/10 bg-white p-8 text-center shadow-xl shadow-primary/5 sm:p-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">Something went wrong</h1>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                    An unexpected issue occurred while rendering this page. You can retry loading or return to safety.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover active:scale-95"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary/30 hover:bg-neutral"
                    >
                        <Home className="h-4 w-4" />
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

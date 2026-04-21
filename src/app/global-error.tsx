'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global app error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body className="min-h-screen bg-[#f8f6f2] text-neutral-900">
                <div className="flex min-h-screen items-center justify-center px-6">
                    <div className="max-w-xl rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-2xl">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-serif">Something went wrong.</h1>
                        <p className="mt-4 text-sm leading-6 text-neutral-600">
                            An unexpected error interrupted the app. You can retry from here or jump back to the homepage.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Retry
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                            >
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}

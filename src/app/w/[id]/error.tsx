'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HeartCrack, RefreshCw } from 'lucide-react';

export default function WeddingPageError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Wedding page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fff8f4] px-6">
            <div className="max-w-lg w-full rounded-[2rem] border border-black/5 bg-white/90 p-10 text-center shadow-xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                    <HeartCrack className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-serif text-neutral-900">We couldn&apos;t open this invitation.</h1>
                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    The page hit an unexpected problem while loading. You can try again, or head back to the homepage.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

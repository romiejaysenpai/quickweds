'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { PWA_AUTO_RECOVERY_KEY } from '@/lib/pwa-recovery';

async function reloadWithFreshAssets() {
    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration('/');
            await registration?.update();
        }

        if ('caches' in window) {
            const cacheKeys = await window.caches.keys();
            await Promise.all(
                cacheKeys
                    .filter((key) => key.startsWith('quickweds-pwa-'))
                    .map((key) => window.caches.delete(key)),
            );
        }
    } catch {
        // Reloading still gives the browser a chance to recover without PWA cleanup.
    } finally {
        window.location.reload();
    }
}

export default function GlobalError({
    error,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [isAutoRecovering, setIsAutoRecovering] = useState(true);

    useEffect(() => {
        console.error('Global app error:', error);
        Sentry.captureException(error);

        try {
            const alreadyAttempted = window.sessionStorage.getItem(PWA_AUTO_RECOVERY_KEY) === '1';
            if (!alreadyAttempted) {
                window.sessionStorage.setItem(PWA_AUTO_RECOVERY_KEY, '1');
                void reloadWithFreshAssets();
                return;
            }
        } catch {
            // Without session storage, show the manual recovery screen to avoid a loop.
        }

        const revealTimer = window.setTimeout(() => setIsAutoRecovering(false), 0);
        return () => window.clearTimeout(revealTimer);
    }, [error]);

    if (isAutoRecovering) {
        return (
            <html lang="en">
                <body className="min-h-screen bg-[#fff8f4] text-neutral-900">
                    <main className="flex min-h-screen items-center justify-center px-6">
                        <div className="text-center" role="status" aria-live="polite">
                            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#d16c78]" />
                            <p className="mt-4 text-sm font-semibold">Refreshing QuickWeds…</p>
                        </div>
                    </main>
                </body>
            </html>
        );
    }

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
                                onClick={() => void reloadWithFreshAssets()}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reload app
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

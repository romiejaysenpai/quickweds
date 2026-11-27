'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import RSVPForm from '@/components/RSVPForm';
import { normalizeExternalWebsiteUrl } from '@/lib/url-safety';

declare global {
    interface Window {
        __quickwedsRsvpFragment?: string;
    }
}

type VerifiedWedding = NonNullable<React.ComponentProps<typeof RSVPForm>['wedding']> & {
    bride_name?: string | null;
    groom_name?: string | null;
    external_website_url?: string | null;
};

type Verified = {
    wedding: VerifiedWedding;
    guest: NonNullable<React.ComponentProps<typeof RSVPForm>['verifiedGuest']>;
    weddingId: string;
    token: string;
};

export default function ManageRsvp() {
    const [verified, setVerified] = useState<Verified | null>(null);
    const [error, setError] = useState('');
    const fragmentRef = useRef('');

    useEffect(() => {
        const fragment = fragmentRef.current || window.__quickwedsRsvpFragment || window.location.hash;
        fragmentRef.current = fragment;
        delete window.__quickwedsRsvpFragment;
        if (window.location.hash) {
            window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
        }
        const params = new URLSearchParams(fragment.replace(/^#/, ''));
        const weddingId = params.get('weddingId') || '';
        const rsvpId = params.get('rsvpId') || '';
        const token = params.get('token') || '';
        let active = true;
        Promise.resolve()
            .then(() => {
                if (!weddingId || !rsvpId || !token) {
                    throw new Error(
                        'Open the private RSVP link from your email. If it has expired, request a new link from the wedding invitation.'
                    );
                }
                return fetch('/api/public/rsvp/access', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'verify', weddingId, rsvpId, token }),
                });
            })
            .then(async (response) => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || 'Unable to verify this link.');
                return data;
            })
            .then((data) => {
                if (active) setVerified({ ...data, weddingId, token });
            })
            .catch((reason) => {
                if (active) setError(reason instanceof Error ? reason.message : 'Unable to verify this link.');
            });
        return () => {
            active = false;
        };
    }, []);

    const externalWebsite = verified?.wedding?.external_website_url
        ? normalizeExternalWebsiteUrl(verified.wedding.external_website_url)
        : null;
    const coupleLabel = verified?.wedding
        ? [verified.wedding.bride_name, verified.wedding.groom_name].filter(Boolean).join(' & ')
        : '';

    return (
        <main className="min-h-screen bg-[#FFF8F4] px-4 py-8 text-[#3A2A2D] sm:px-6 sm:py-14">
            <div className="mx-auto max-w-2xl min-w-0">
                {externalWebsite && (
                    <a
                        href={externalWebsite}
                        rel="noreferrer"
                        className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4 shrink-0" /> Back to our wedding website
                    </a>
                )}

                <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-white p-5 shadow-xl shadow-primary/10 sm:p-10">
                    <header className="mb-6 border-b border-border/80 pb-6 text-center">
                        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Heart className="h-5 w-5" strokeWidth={1.5} />
                        </span>
                        {coupleLabel && (
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{coupleLabel}</p>
                        )}
                        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                            Manage your RSVP
                        </h1>
                    </header>

                    {error ? (
                        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                            {error}
                        </p>
                    ) : verified ? (
                        <RSVPForm
                            weddingId={verified.weddingId}
                            wedding={{ ...verified.wedding, template: verified.wedding.template || 'romantic', background_style: 'cream' }}
                            verifiedGuest={verified.guest}
                            accessToken={verified.token}
                        />
                    ) : (
                        <p role="status" className="flex min-h-40 items-center justify-center gap-2.5 text-sm font-semibold text-text-secondary">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Verifying your private invitation…
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}

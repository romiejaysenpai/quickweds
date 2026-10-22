'use client';
import { useEffect, useRef, useState } from 'react';
import RSVPForm from '@/components/RSVPForm';

declare global { interface Window { __quickwedsRsvpFragment?: string } }
type Verified = { wedding: React.ComponentProps<typeof RSVPForm>['wedding']; guest: NonNullable<React.ComponentProps<typeof RSVPForm>['verifiedGuest']>; weddingId: string; token: string };
export default function ManageRsvp() {
    const [verified, setVerified] = useState<Verified | null>(null);
    const [error, setError] = useState('');
    const fragmentRef = useRef('');
    useEffect(() => {
        const fragment = fragmentRef.current || window.__quickwedsRsvpFragment || window.location.hash;
        fragmentRef.current = fragment;
        delete window.__quickwedsRsvpFragment;
        if (window.location.hash) window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
        const params = new URLSearchParams(fragment.replace(/^#/, ''));
        const weddingId = params.get('weddingId') || '';
        const rsvpId = params.get('rsvpId') || '';
        const token = params.get('token') || '';
        let active = true;
        Promise.resolve().then(() => {
            if (!weddingId || !rsvpId || !token) throw new Error('Open the private RSVP link from your email. If it has expired, request a new link from the wedding invitation.');
            return fetch('/api/public/rsvp/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', weddingId, rsvpId, token }) });
        })
            .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to verify this link.'); return data; })
            .then((data) => { if (active) setVerified({ ...data, weddingId, token }); })
            .catch((reason) => { if (active) setError(reason.message); });
        return () => { active = false; };
    }, []);
    return <main className="mx-auto max-w-2xl px-5 py-12"><h1 className="mb-6 text-3xl font-serif">Manage your RSVP</h1>{error ? <p role="alert">{error}</p> : verified ? <RSVPForm weddingId={verified.weddingId} wedding={verified.wedding} verifiedGuest={verified.guest} accessToken={verified.token} /> : <p role="status">Verifying your private invitation…</p>}</main>;
}

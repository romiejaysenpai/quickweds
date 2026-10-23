'use client';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getCachedSession } from '@/lib/session-cache';
import { FREE_PLAN_LIMITS } from '@/lib/planner-limits';
type Workspace = { id: string; bride_name?: string; groom_name?: string };
function PlannerGateway() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const search = useSearchParams();
    const guests = search?.get('goal') === 'guests';
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);
    const [names, setNames] = useState({ brideName: '', groomName: '' });
    const [requestId] = useState(() => crypto.randomUUID());
    const destination = (id: string) => guests ? `/dashboard/${id}?tab=guests` : `/dashboard/${id}/planner`;
    useEffect(() => {
        if (loading) return;
        if (!user) { router.replace(`/login?next=${encodeURIComponent('/planner' + (guests ? '?goal=guests' : ''))}`); return; }
        let active = true;
        (async () => {
            const { data: sessionData } = await getCachedSession();
            const [own, shared] = await Promise.all([
                supabase.from('weddings').select('id,bride_name,groom_name').eq('user_id', user.id).is('deleted_at', null).order('created_at', { ascending: false }),
                fetch('/api/collaborators/shared', { headers: { Authorization: `Bearer ${sessionData.session?.access_token}` } }).then(async r => { if (!r.ok) throw new Error('Unable to load shared weddings.'); return r.json(); }),
            ]);
            if (own.error) throw own.error;
            const all = new Map<string, Workspace>();
            for (const w of own.data || []) all.set(w.id, w);
            for (const invite of shared.sharedWeddings || []) if (invite.status === 'accepted' && invite.wedding) all.set(invite.wedding.id, invite.wedding);
            if (active) setWorkspaces([...all.values()]);
        })().catch(() => { if (active) setError('Unable to load workspaces. Please refresh to try again.'); }).finally(() => { if (active) setReady(true); });
        return () => { active = false; };
    }, [user, loading, router, guests]);
    async function create(event: React.FormEvent) {
        event.preventDefault(); if (busy) return; setBusy(true); setError('');
        try {
            const { data: sessionData } = await getCachedSession();
            const response = await fetch('/api/planner/workspace', { method: 'POST', headers: { Authorization: `Bearer ${sessionData.session?.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...names, requestId }) });
            const result = await response.json(); if (!response.ok || !result.id) throw new Error(result.error || 'Unable to start your workspace.');
            router.push(destination(result.id));
        } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to start your workspace.'); setBusy(false); }
    }
    return <main className="mx-auto max-w-2xl px-5 py-12"><Link href="/dashboard" className="text-primary">Back to dashboard</Link><h1 className="mt-6 text-3xl font-serif">{guests ? 'Your guest list' : 'Your wedding planner'}</h1><p className="mt-3 text-text-secondary">Planner Lite includes {FREE_PLAN_LIMITS.checklistTasks} tasks, {FREE_PLAN_LIMITS.budgetItems} budget items, {FREE_PLAN_LIMITS.vendors} suppliers and {FREE_PLAN_LIMITS.seatingTables} tables. Start planning before building your public invitation.</p>{error && <p role="alert" className="my-4 text-red-700">{error}</p>}{!ready ? <p role="status" className="mt-6">Loading your workspaces…</p> : <><ul className="my-6 space-y-3">{workspaces.map(w => <li key={w.id}><Link className="block rounded-xl border border-border p-4 hover:border-primary" href={destination(w.id)}>{[w.bride_name, w.groom_name].filter(Boolean).join(' & ') || 'Open wedding workspace'}</Link></li>)}</ul><form onSubmit={create} className="space-y-4 rounded-2xl border border-border bg-white p-6"><h2 className="text-xl font-serif">Start a private workspace</h2><p className="text-sm text-text-secondary">Your names are enough to begin. Publish your invitation later from the website builder.</p><label className="block">First partner’s name<input required maxLength={100} value={names.brideName} onChange={e => setNames({ ...names, brideName: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block">Second partner’s name<input required maxLength={100} value={names.groomName} onChange={e => setNames({ ...names, groomName: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><button disabled={busy} className="min-h-12 rounded-xl bg-primary px-5 py-3 text-white disabled:opacity-50">{busy ? 'Starting…' : 'Start planning'}</button></form></>}</main>;
}
export default function PlannerGatewayPage() { return <Suspense fallback={<p role="status">Loading planner…</p>}><PlannerGateway /></Suspense>; }

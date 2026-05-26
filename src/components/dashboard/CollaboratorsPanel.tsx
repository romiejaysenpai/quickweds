'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, UserPlus, X } from 'lucide-react';
import {
    acceptWeddingInvite,
    listWeddingCollaborators,
    removeWeddingCollaborator,
    type CollaboratorRole,
    type CollaboratorStatus,
    type WeddingCollaborator,
} from '@/lib/wedding-features';
import UpgradeButton from '@/components/UpgradeButton';
import { FREE_PLAN_LIMITS } from '@/lib/planner-limits';
import { getCachedSession } from '@/lib/session-cache';

interface CollaboratorsPanelProps {
    weddingId: string;
    currentUserId?: string;
    currentUserEmail?: string | null;
    canManage: boolean;
    hasPlannerPro?: boolean;
}

const ROLE_COPY: Record<CollaboratorRole, string> = {
    partner: 'Partner',
    coordinator: 'Coordinator',
};

const STATUS_COPY: Record<CollaboratorStatus, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
};

export default function CollaboratorsPanel({
    weddingId,
    currentUserId,
    currentUserEmail,
    canManage,
    hasPlannerPro = false,
}: CollaboratorsPanelProps) {
    const [loading, setLoading] = useState(true);
    const [collaborators, setCollaborators] = useState<WeddingCollaborator[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<CollaboratorRole>('partner');
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const loadCollaborators = useCallback(async () => {
        setLoading(true);
        const rows = await listWeddingCollaborators(weddingId);
        setCollaborators(rows);
        setLoading(false);
    }, [weddingId]);

    useEffect(() => {
        void loadCollaborators();
    }, [loadCollaborators]);

    const submitInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId || !inviteEmail.trim()) return;

        setSubmitting(true);
        setNotice(null);
        try {
            if (!hasPlannerPro && (inviteRole !== 'partner' || collaborators.length >= FREE_PLAN_LIMITS.collaborators)) {
                throw new Error('Free workspaces include 1 partner collaborator. Upgrade to Planner Pro for coordinators and more helpers.');
            }

            const invitedAddress = inviteEmail.trim().toLowerCase();
            const { data } = await getCachedSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Please login again and retry.');

            const response = await fetch('/api/collaborators/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    weddingId,
                    email: invitedAddress,
                    role: inviteRole,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to invite collaborator');

            setInviteEmail('');
            const emailError = typeof result.emailError === 'string' ? result.emailError : '';
            setNotice({
                type: 'success',
                message: result.emailSent
                    ? `Invite added and email sent to ${invitedAddress}. They can sign in with that email and accept it from their dashboard.`
                    : `Invite added for ${invitedAddress}, but the email could not be sent.${emailError ? ` Email service said: ${emailError}` : ' Check Resend configuration.'} They can still sign in with that email and accept it from their dashboard.`,
            });
            await loadCollaborators();
        } catch (error) {
            setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Failed to invite collaborator' });
        } finally {
            setSubmitting(false);
        }
    };

    const acceptInvite = async (collaboratorId: string) => {
        try {
            await acceptWeddingInvite(collaboratorId);
            await loadCollaborators();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to accept invite');
        }
    };

    const removeInvite = async (collaboratorId: string) => {
        try {
            await removeWeddingCollaborator(collaboratorId);
            await loadCollaborators();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to remove collaborator');
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-white p-4 soft-shadow sm:rounded-3xl sm:p-6 md:p-8">
            <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-foreground sm:text-xl">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary" /> Collaboration Access
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary">Invite a partner or coordinator to work inside this wedding workspace.</p>
            </div>

            {canManage && (
                <div className="mt-5 space-y-3">
                    {!hasPlannerPro && (
                        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-semibold text-text-secondary">
                                Free includes {FREE_PLAN_LIMITS.collaborators} partner collaborator. Planner Pro unlocks coordinators and more helpers.
                            </p>
                            <UpgradeButton weddingId={weddingId} variant="outlined" className="justify-center text-sm" />
                        </div>
                    )}
                    <form onSubmit={submitInvite} className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[minmax(320px,1fr)_160px_124px] 2xl:grid-cols-1">
                        <input
                            type="email"
                            placeholder="partner@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="h-12 min-w-0 rounded-xl border border-border bg-neutral px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-neutral/40"
                        />
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                            className="h-12 min-w-0 rounded-xl border border-border bg-neutral px-4 text-sm font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-neutral/40"
                        >
                            <option value="partner">Partner</option>
                            <option value="coordinator">Coordinator</option>
                        </select>
                        <button
                            type="submit"
                            disabled={submitting || !inviteEmail.trim() || (!hasPlannerPro && (inviteRole !== 'partner' || collaborators.length >= FREE_PLAN_LIMITS.collaborators))}
                            className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Invite
                        </button>
                    </form>
                    {notice && (
                        <p className={`rounded-xl border px-4 py-3 text-xs font-bold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
                            {notice.message}
                        </p>
                    )}
                </div>
            )}

            {loading ? (
                <div className="mt-5 flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
            ) : collaborators.length === 0 ? (
                <p className="mt-5 text-sm text-text-secondary">No collaborators added yet.</p>
            ) : (
                <div className="mt-5 space-y-3">
                    {collaborators.map((collaborator) => {
                        const isOwnInvite = collaborator.email.toLowerCase() === (currentUserEmail || '').toLowerCase();

                        return (
                            <div key={collaborator.id} className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-border bg-neutral/40 p-4 dark:bg-neutral/30 md:grid-cols-[minmax(0,1fr)_auto]">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-foreground" title={collaborator.email}>{collaborator.email}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary/60">
                                        {ROLE_COPY[collaborator.role]} · {STATUS_COPY[collaborator.status]}
                                    </p>
                                </div>
                                <div className="flex min-w-0 items-center justify-start gap-2 md:justify-end">
                                    {collaborator.status === 'pending' && isOwnInvite && (
                                        <button
                                            onClick={() => acceptInvite(collaborator.id)}
                                            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-white transition-all hover:bg-primary-hover"
                                        >
                                            Accept Invite
                                        </button>
                                    )}
                                    {(canManage || isOwnInvite) && (
                                        <button
                                            onClick={() => removeInvite(collaborator.id)}
                                            className="h-11 w-11 rounded-xl border border-border text-text-secondary hover:text-red-500 hover:border-red-200 transition-all inline-flex items-center justify-center"
                                            title="Remove collaborator"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

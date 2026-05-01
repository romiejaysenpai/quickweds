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
import { supabase } from '@/lib/supabase';

interface CollaboratorsPanelProps {
    weddingId: string;
    currentUserId?: string;
    currentUserEmail?: string | null;
    canManage: boolean;
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
            const { data } = await supabase.auth.getSession();
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
                    email: inviteEmail,
                    role: inviteRole,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to invite collaborator');

            setInviteEmail('');
            setNotice({
                type: 'success',
                message: result.emailSent
                    ? 'Invite added and email sent.'
                    : 'Invite added, but the email could not be sent. Check Resend configuration.',
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
        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow space-y-5">
            <div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Collaboration Access
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary">Invite a partner or coordinator to work inside this wedding workspace.</p>
            </div>

            {canManage && (
                <div className="space-y-3">
                    <form onSubmit={submitInvite} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
                        <input
                            type="email"
                            placeholder="partner@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-border bg-neutral dark:bg-neutral/40 text-sm outline-none focus:border-primary min-h-[44px]"
                        />
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                            className="px-4 py-3 rounded-xl border border-border bg-neutral dark:bg-neutral/40 text-sm outline-none focus:border-primary min-h-[44px]"
                        >
                            <option value="partner">Partner</option>
                            <option value="coordinator">Coordinator</option>
                        </select>
                        <button
                            type="submit"
                            disabled={submitting || !inviteEmail.trim()}
                            className="px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-all disabled:opacity-50 min-h-[44px] inline-flex items-center justify-center gap-2"
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
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
            ) : collaborators.length === 0 ? (
                <p className="text-sm text-text-secondary">No collaborators added yet.</p>
            ) : (
                <div className="space-y-3">
                    {collaborators.map((collaborator) => {
                        const isOwnInvite = collaborator.email.toLowerCase() === (currentUserEmail || '').toLowerCase();

                        return (
                            <div key={collaborator.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral/40 dark:bg-neutral/30 border border-border">
                                <div>
                                    <p className="font-bold text-foreground text-sm">{collaborator.email}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary/60">
                                        {ROLE_COPY[collaborator.role]} · {STATUS_COPY[collaborator.status]}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {collaborator.status === 'pending' && isOwnInvite && (
                                        <button
                                            onClick={() => acceptInvite(collaborator.id)}
                                            className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all min-h-[44px]"
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

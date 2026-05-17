import 'server-only';

import type { User } from '@supabase/supabase-js';
import { isKnownAdminEmail } from '@/lib/admin';

export type WeddingAccessRole = 'owner' | 'partner' | 'coordinator' | 'admin' | null;

type WeddingAccessOptions = {
    select?: string;
    collaboratorRoles?: Array<'partner' | 'coordinator'>;
};

export async function getWeddingAccess(
    db: any,
    user: Pick<User, 'id' | 'email'>,
    weddingId: string,
    options: WeddingAccessOptions = {}
) {
    const collaboratorRoles = options.collaboratorRoles || ['partner', 'coordinator'];
    const select = options.select || 'id, user_id';

    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select(select)
        .eq('id', weddingId)
        .maybeSingle();

    if (weddingError) throw weddingError;
    if (!wedding) {
        return { wedding: null, role: null as WeddingAccessRole, canManage: false };
    }

    if (isKnownAdminEmail(user.email)) {
        return { wedding, role: 'admin' as WeddingAccessRole, canManage: true };
    }

    if (wedding.user_id === user.id) {
        return { wedding, role: 'owner' as WeddingAccessRole, canManage: true };
    }

    const userEmail = user.email?.trim().toLowerCase();
    if (!userEmail || collaboratorRoles.length === 0) {
        return { wedding, role: null as WeddingAccessRole, canManage: false };
    }

    const { data: collaborator, error: collaboratorError } = await db
        .from('wedding_collaborators')
        .select('id, role, status')
        .eq('wedding_id', weddingId)
        .eq('email', userEmail)
        .eq('status', 'accepted')
        .in('role', collaboratorRoles)
        .maybeSingle();

    if (collaboratorError) throw collaboratorError;

    return {
        wedding,
        role: collaborator?.role || null,
        canManage: Boolean(collaborator),
    };
}

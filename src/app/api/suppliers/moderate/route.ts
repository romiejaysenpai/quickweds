import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    getSupplierOwnerEmail,
    sendSupplierApprovedEmail,
    sendSupplierRejectedEmail,
} from '@/lib/supplier-notifications';
import type { SupplierProfile } from '@/lib/suppliers';

const ACTIONS = ['approve', 'reject', 'deactivate', 'feature', 'unfeature'] as const;

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });
    if (!isKnownAdminEmail(user.email)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const supplierId = String(body.supplierId || '');
        const action = String(body.action || '') as typeof ACTIONS[number];

        if (!supplierId || !ACTIONS.includes(action)) {
            return NextResponse.json({ error: 'Invalid supplier moderation request' }, { status: 400 });
        }

        const update =
            action === 'approve'
                ? { status: 'approved', is_active: true }
                : action === 'reject'
                    ? { status: 'rejected', is_active: false }
                    : action === 'deactivate'
                        ? { status: 'inactive', is_active: false }
                        : action === 'feature'
                            ? { is_featured: true }
                            : { is_featured: false };

        const db = getSupabaseAdminClient() as any;
        const { data, error: updateError } = await db
            .from('supplier_profiles')
            .update({ ...update, updated_at: new Date().toISOString() })
            .eq('id', supplierId)
            .select()
            .single();

        if (updateError) throw updateError;
        if (action === 'approve' || action === 'reject') {
            const profile = data as SupplierProfile;
            const ownerEmail = await getSupplierOwnerEmail(db, profile);

            if (action === 'approve') {
                await sendSupplierApprovedEmail(profile, ownerEmail);
            } else {
                await sendSupplierRejectedEmail(profile, ownerEmail);
            }
        }
        return NextResponse.json({ profile: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to moderate supplier';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

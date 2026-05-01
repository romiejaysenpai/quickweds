import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { SupplierProfile } from '@/lib/suppliers';

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error, code: 'auth_required' }, { status: 401 });

    try {
        const body = await req.json();
        const supplierId = String(body.supplierId || '');
        const requestedWeddingId = body.weddingId ? String(body.weddingId) : '';

        if (!supplierId) {
            return NextResponse.json({ error: 'Supplier is required', code: 'missing_supplier' }, { status: 400 });
        }

        const db = getSupabaseAdminClient() as any;
        const { data: supplier, error: supplierError } = await db
            .from('supplier_profiles')
            .select('*')
            .eq('id', supplierId)
            .eq('status', 'approved')
            .eq('is_active', true)
            .maybeSingle();

        if (supplierError) throw supplierError;
        if (!supplier) {
            return NextResponse.json({ error: 'Supplier is not available', code: 'supplier_unavailable' }, { status: 404 });
        }

        let weddingQuery = db
            .from('weddings')
            .select('id, user_id, is_premium, bride_name, groom_name')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (requestedWeddingId) {
            weddingQuery = weddingQuery.eq('id', requestedWeddingId);
        } else {
            weddingQuery = weddingQuery.eq('user_id', user.id).limit(1);
        }

        const { data: weddings, error: weddingError } = await weddingQuery;
        if (weddingError) throw weddingError;

        const wedding = Array.isArray(weddings) ? weddings[0] : weddings;
        if (!wedding) {
            return NextResponse.json(
                { error: 'Create a wedding site before saving suppliers.', code: 'needs_wedding' },
                { status: 409 }
            );
        }

        const isAdmin = isKnownAdminEmail(user.email);
        let canManage = isAdmin || wedding.user_id === user.id;

        if (!canManage && user.email) {
            const { data: collaborator } = await db
                .from('wedding_collaborators')
                .select('status, role')
                .eq('wedding_id', wedding.id)
                .eq('email', user.email.toLowerCase())
                .maybeSingle();

            canManage = collaborator?.status === 'accepted';
        }

        if (!canManage) {
            return NextResponse.json({ error: 'You cannot manage this wedding.', code: 'access_denied' }, { status: 403 });
        }

        if (!isAdmin && !wedding.is_premium) {
            return NextResponse.json(
                {
                    error: 'Planner Pro is required to save suppliers.',
                    code: 'planner_pro_required',
                    weddingId: wedding.id,
                },
                { status: 402 }
            );
        }

        const profile = supplier as SupplierProfile;
        const vendorPayload = {
            role: profile.category,
            name: profile.business_name,
            email: profile.email,
            phone: profile.phone || profile.whatsapp,
            notes: `Saved from QuickWeds Supplier Directory: /suppliers/${profile.slug}`,
            amount: 0,
            payment_status: 'not paid',
            payment_method: 'other',
        };

        const { data: existing, error: existingError } = await db
            .from('planner_vendors')
            .select('id')
            .eq('wedding_id', wedding.id)
            .eq('directory_supplier_id', supplierId)
            .maybeSingle();

        if (existingError) throw existingError;
        if (existing) {
            const { error: updateError } = await db
                .from('planner_vendors')
                .update(vendorPayload)
                .eq('id', existing.id);

            if (updateError) throw updateError;
            return NextResponse.json({ vendorId: existing.id, weddingId: wedding.id, alreadySaved: true });
        }

        const { data: vendor, error: insertError } = await db
            .from('planner_vendors')
            .insert({
                wedding_id: wedding.id,
                directory_supplier_id: supplierId,
                ...vendorPayload,
            })
            .select('id')
            .single();

        if (insertError) throw insertError;
        return NextResponse.json({ vendorId: vendor.id, weddingId: wedding.id, alreadySaved: false });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save supplier to planner';
        return NextResponse.json({ error: message, code: 'save_failed' }, { status: 500 });
    }
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    buildSupplierSlug,
    normalizeSupplierProfileInput,
    type SupplierProfile,
    type SupplierProfileStatus,
} from '@/lib/suppliers';

async function getUniqueSupplierSlug(db: any, baseSlug: string, existingId?: string) {
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        let query = db.from('supplier_profiles').select('id').eq('slug', slug);
        if (existingId) query = query.neq('id', existingId);

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) return slug;

        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
}

export async function GET(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    try {
        const db = getSupabaseAdminClient() as any;
        const isAdmin = isKnownAdminEmail(user.email);

        const { data: profile, error: profileError } = await db
            .from('supplier_profiles')
            .select('*')
            .eq('owner_user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (profileError) throw profileError;

        let reviewQueue: SupplierProfile[] = [];
        if (isAdmin) {
            const { data, error: queueError } = await db
                .from('supplier_profiles')
                .select('*')
                .in('status', ['pending_review', 'approved', 'rejected', 'inactive'])
                .order('status', { ascending: false })
                .order('updated_at', { ascending: false });

            if (queueError) throw queueError;
            reviewQueue = (data || []) as SupplierProfile[];
        }

        return NextResponse.json({ profile, reviewQueue, isAdmin });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load supplier profile';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    try {
        const body = await req.json();
        const intent = body.intent === 'submit' ? 'submit' : 'draft';
        const input = normalizeSupplierProfileInput(body.profile || body);

        if (!input.business_name || !input.category || !input.city || !input.province) {
            return NextResponse.json(
                { error: 'Business name, category, city, and province are required.' },
                { status: 400 }
            );
        }

        const db = getSupabaseAdminClient() as any;
        const requestedId = body.profile?.id || body.id;

        let existing: SupplierProfile | null = null;
        if (requestedId) {
            const { data, error: existingError } = await db
                .from('supplier_profiles')
                .select('*')
                .eq('id', requestedId)
                .eq('owner_user_id', user.id)
                .maybeSingle();

            if (existingError) throw existingError;
            existing = data as SupplierProfile | null;
        }

        if (!existing) {
            const { data, error: ownError } = await db
                .from('supplier_profiles')
                .select('*')
                .eq('owner_user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();

            if (ownError) throw ownError;
            existing = data as SupplierProfile | null;
        }

        const baseSlug = buildSupplierSlug(input);
        const slug = await getUniqueSupplierSlug(db, baseSlug, existing?.id);
        const status: SupplierProfileStatus = intent === 'submit' ? 'pending_review' : 'draft';
        const updatePayload = {
            ...input,
            owner_user_id: user.id,
            slug,
            status,
            is_active: status !== 'draft',
            updated_at: new Date().toISOString(),
        };

        if (existing?.id) {
            const { data, error: updateError } = await db
                .from('supplier_profiles')
                .update(updatePayload)
                .eq('id', existing.id)
                .eq('owner_user_id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;
            return NextResponse.json({ profile: data });
        }

        const { data, error: insertError } = await db
            .from('supplier_profiles')
            .insert(updatePayload)
            .select()
            .single();

        if (insertError) throw insertError;
        return NextResponse.json({ profile: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save supplier profile';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

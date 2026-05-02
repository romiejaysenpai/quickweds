import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>;

async function getRequestUser(req: Request, supabase: SupabaseAdminClient) {
    const authHeader = req.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!accessToken) {
        return { user: null, error: 'Missing bearer token' };
    }

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) {
        return { user: null, error: 'Unauthorized' };
    }

    return { user: data.user, error: null };
}

export async function GET(req: Request) {
    let supabase: SupabaseAdminClient;
    try {
        supabase = getSupabaseAdminClient();
    } catch {
        return NextResponse.json({ error: 'Server configuration error', sharedWeddings: [] }, { status: 500 });
    }

    const { user, error } = await getRequestUser(req, supabase);
    if (!user) {
        return NextResponse.json({ error, sharedWeddings: [] }, { status: 401 });
    }

    const email = user.email?.trim().toLowerCase();
    if (!email) {
        return NextResponse.json({ sharedWeddings: [] });
    }

    try {
        const { data: invites, error: inviteError } = await (supabase as any)
            .from('wedding_collaborators')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false });

        if (inviteError) {
            return NextResponse.json({ error: inviteError.message, sharedWeddings: [] }, { status: 500 });
        }

        if (!invites?.length) {
            return NextResponse.json({ sharedWeddings: [] });
        }

        const weddingIds = Array.from(new Set(invites.map((invite: any) => invite.wedding_id).filter(Boolean)));
        const { data: weddings, error: weddingError } = await (supabase as any)
            .from('weddings')
            .select('id, bride_name, groom_name, wedding_date, venue_name, hero_image, template, is_premium, deleted_at')
            .in('id', weddingIds);

        if (weddingError) {
            return NextResponse.json({ error: weddingError.message, sharedWeddings: [] }, { status: 500 });
        }

        const weddingById = new Map(
            (weddings || [])
                .filter((wedding: any) => !wedding.deleted_at)
                .map((wedding: any) => [wedding.id, wedding])
        );

        const sharedWeddings = invites
            .map((invite: any) => ({
                ...invite,
                wedding: weddingById.get(invite.wedding_id) || null,
            }))
            .filter((invite: any) => invite.wedding);

        return NextResponse.json({ sharedWeddings });
    } catch (err) {
        return NextResponse.json({
            error: err instanceof Error ? err.message : 'Unable to load shared weddings',
            sharedWeddings: [],
        }, { status: 500 });
    }
}

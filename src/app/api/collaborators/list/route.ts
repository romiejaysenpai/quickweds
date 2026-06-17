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
        return NextResponse.json({ error: 'Server configuration error', collaborators: [] }, { status: 500 });
    }

    const { user, error } = await getRequestUser(req, supabase);
    if (!user) {
        return NextResponse.json({ error, collaborators: [] }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get('weddingId')?.trim();

    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required', collaborators: [] }, { status: 400 });
    }

    try {
        const { data: wedding, error: weddingError } = await (supabase as any)
            .from('weddings')
            .select('id, user_id')
            .eq('id', weddingId)
            .maybeSingle();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: weddingError?.message || 'Wedding not found', collaborators: [] }, { status: 404 });
        }

        const userEmail = user.email?.toLowerCase() || '';
        const { data: currentCollaborator, error: accessError } = await (supabase as any)
            .from('wedding_collaborators')
            .select('id, status')
            .eq('wedding_id', weddingId)
            .eq('email', userEmail)
            .maybeSingle();

        if (accessError) {
            return NextResponse.json({ error: accessError.message, collaborators: [] }, { status: 500 });
        }

        const canView = wedding.user_id === user.id || currentCollaborator?.status === 'accepted';
        if (!canView) {
            return NextResponse.json({ error: 'Access denied', collaborators: [] }, { status: 403 });
        }

        const { data, error: collaboratorError } = await (supabase as any)
            .from('wedding_collaborators')
            .select('id, email, role, status, created_at')
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: true });

        if (collaboratorError) {
            return NextResponse.json({ error: collaboratorError.message, collaborators: [] }, { status: 500 });
        }

        return NextResponse.json({ collaborators: data || [] });
    } catch (err) {
        return NextResponse.json({
            error: err instanceof Error ? err.message : 'Unable to load collaborators',
            collaborators: [],
        }, { status: 500 });
    }
}

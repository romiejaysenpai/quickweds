import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>;

const acceptSchema = z.object({
    collaboratorId: z.string().uuid(),
});

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

export async function POST(req: Request) {
    let supabase: SupabaseAdminClient;
    try {
        supabase = getSupabaseAdminClient();
    } catch {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { user, error } = await getRequestUser(req, supabase);
    if (!user) {
        return NextResponse.json({ error }, { status: 401 });
    }

    const parsed = acceptSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid collaborator invite' }, { status: 400 });
    }

    const email = user.email?.trim().toLowerCase();
    if (!email) {
        return NextResponse.json({ error: 'Your account needs an email address to accept this invite' }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await (supabase as any)
        .from('wedding_collaborators')
        .select('*')
        .eq('id', parsed.data.collaboratorId)
        .maybeSingle();

    if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    if (!invite) {
        return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (String(invite.email || '').toLowerCase() !== email) {
        return NextResponse.json({ error: 'This invite belongs to a different email address' }, { status: 403 });
    }

    const { data: collaborator, error: updateError } = await (supabase as any)
        .from('wedding_collaborators')
        .update({ status: 'accepted' })
        .eq('id', parsed.data.collaboratorId)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ collaborator });
}

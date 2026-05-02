import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendEmail, getCollaboratorInviteHtml } from '@/lib/email';
import { sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limiter';

type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>;
type WeddingInviteContext = {
    id: string;
    user_id: string;
    bride_name: string | null;
    groom_name: string | null;
    wedding_date: string | null;
    venue_name: string | null;
};

type CollaboratorInvitePayload = {
    wedding_id: string;
    email: string;
    role: 'partner' | 'coordinator';
    status: 'pending';
    invited_by_user_id?: string;
};

const inviteSchema = z.object({
    weddingId: z.string().min(4).max(32).regex(/^[a-zA-Z0-9]+$/, 'Invalid wedding ID'),
    email: z.string().trim().email(),
    role: z.enum(['partner', 'coordinator']),
});

function getAppUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://quickweds.site';
    return appUrl.replace(/\/+$/, '');
}

function isMissingInvitedByColumn(error: unknown) {
    return error instanceof Error
        ? error.message.includes('invited_by_user_id')
        : typeof (error as { message?: unknown })?.message === 'string'
            && (error as { message: string }).message.includes('invited_by_user_id');
}

async function saveCollaboratorInvite(
    supabase: SupabaseAdminClient,
    payload: CollaboratorInvitePayload,
) {
    const save = async (includeInviter: boolean) => {
        const writePayload = includeInviter
            ? payload
            : (({ invited_by_user_id: _invitedByUserId, ...rest }) => rest)(payload);

        const { data: existing, error: lookupError } = await (supabase as any)
            .from('wedding_collaborators')
            .select('id')
            .eq('wedding_id', payload.wedding_id)
            .eq('email', payload.email)
            .limit(1)
            .maybeSingle();

        if (lookupError) {
            return { data: null, error: lookupError };
        }

        if (existing?.id) {
            return (supabase as any)
                .from('wedding_collaborators')
                .update(writePayload)
                .eq('id', existing.id)
                .select()
                .single();
        }

        return (supabase as any)
            .from('wedding_collaborators')
            .insert(writePayload)
            .select()
            .single();
    };

    const result = await save(true);
    if (result.error && isMissingInvitedByColumn(result.error)) {
        return save(false);
    }

    return result;
}

export async function POST(req: Request) {
    let supabase: SupabaseAdminClient;
    try {
        supabase = getSupabaseAdminClient();
    } catch {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!accessToken) {
        return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    const user = authData?.user;
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = inviteSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid invite details' }, { status: 400 });
        }

        const weddingId = sanitizeWeddingId(parsed.data.weddingId);
        const inviteEmail = sanitizeEmail(parsed.data.email);
        const role = parsed.data.role;

        if (!weddingId || !inviteEmail) {
            return NextResponse.json({ error: 'Invalid invite details' }, { status: 400 });
        }

        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('id, user_id, bride_name, groom_name, wedding_date, venue_name')
            .eq('id', weddingId)
            .is('deleted_at', null)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }

        const weddingContext = wedding as WeddingInviteContext;

        if (weddingContext.user_id !== user.id) {
            const { data: collaborator } = await supabase
                .from('wedding_collaborators')
                .select('id')
                .eq('wedding_id', weddingId)
                .eq('email', user.email?.toLowerCase() || '')
                .eq('role', 'partner')
                .eq('status', 'accepted')
                .maybeSingle();

            if (!collaborator) {
                return NextResponse.json({ error: 'Only the owner or accepted partner can invite collaborators' }, { status: 403 });
            }
        }

        const { data: invite, error: inviteError } = await saveCollaboratorInvite(supabase, {
            wedding_id: weddingId,
            email: inviteEmail,
            role,
            status: 'pending',
            invited_by_user_id: user.id,
        });

        if (inviteError) {
            return NextResponse.json({ error: inviteError.message }, { status: 500 });
        }

        const roleLabel = role === 'partner' ? 'Partner' : 'Coordinator';
        const dashboardUrl = `${getAppUrl()}/dashboard`;
        const brideName = sanitizeInput(weddingContext.bride_name || 'Bride', { maxLength: 100 });
        const groomName = sanitizeInput(weddingContext.groom_name || 'Groom', { maxLength: 100 });
        const emailResult = await sendEmail({
            to: inviteEmail,
            subject: `You're invited to collaborate on ${brideName} & ${groomName}'s wedding`,
            html: getCollaboratorInviteHtml({
                inviteeEmail: inviteEmail,
                inviterEmail: user.email || undefined,
                role: roleLabel,
                brideName,
                groomName,
                weddingDate: sanitizeInput(weddingContext.wedding_date || '', { maxLength: 50 }),
                venueName: sanitizeInput(weddingContext.venue_name || '', { maxLength: 160 }),
                dashboardUrl,
            }),
        });

        return NextResponse.json({
            collaborator: invite,
            emailSent: emailResult.success,
            emailError: emailResult.success ? null : emailResult.error,
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to invite collaborator' }, { status: 500 });
    }
}

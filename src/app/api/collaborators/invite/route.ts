import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendEmail, getCollaboratorInviteHtml } from '@/lib/email';
import { sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limiter';
import { FREE_PLAN_LIMITS, hasPlannerProAccess } from '@/lib/planner-limits';
import { isKnownAdminEmail } from '@/lib/admin';

type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>;
type WeddingInviteContext = {
    id: string;
    user_id: string;
    bride_name: string | null;
    groom_name: string | null;
    wedding_date: string | null;
    venue_name: string | null;
    is_premium?: boolean | null;
    payment_status?: string | null;
};

const inviteSchema = z.object({
    requestId: z.uuid(),
    weddingId: z.string().min(4).max(64).refine(value=>Boolean(sanitizeWeddingId(value)), 'Invalid wedding ID'),
    email: z.string().trim().email(),
    role: z.enum(['partner', 'coordinator']),
});

function getAppUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://quickweds.site';
    return appUrl.replace(/\/+$/, '');
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
            .select('id, user_id, bride_name, groom_name, wedding_date, venue_name, is_premium, payment_status')
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

        const { data: ownerProfile } = await supabase
            .from('user_app_profiles')
            .select('is_pro, payment_status')
            .eq('user_id', weddingContext.user_id)
            .maybeSingle();
        const hasPlannerPro = hasPlannerProAccess({
            isAdmin: isKnownAdminEmail(user.email),
            wedding: weddingContext,
            accountProfile: ownerProfile,
        });

        if (!hasPlannerPro) {
            if (role !== 'partner') {
                return NextResponse.json({
                    error: 'Free workspaces include 1 partner collaborator. Coordinators are part of Planner Pro.',
                    code: 'planner_pro_required',
                }, { status: 402 });
            }

        }
        const {data:invite,error:inviteError}=await (supabase as any).rpc('quickweds_prepare_collaborator',{p_wedding:weddingId,p_email:inviteEmail,p_role:role,p_user:user.id,p_limit:hasPlannerPro?null:FREE_PLAN_LIMITS.collaborators});
        if(inviteError)throw inviteError;
        if(invite.status==='accepted')return NextResponse.json({collaborator:invite,emailSent:false,emailError:'This person already accepted the invitation.'});

        const roleLabel = role === 'partner' ? 'Partner' : 'Coordinator';
        const dashboardUrl = `${getAppUrl()}/dashboard`;
        const brideName = sanitizeInput(weddingContext.bride_name || 'Bride', { maxLength: 100 });
        const groomName = sanitizeInput(weddingContext.groom_name || 'Groom', { maxLength: 100 });
        const emailResult = await sendEmail({
            to: inviteEmail,
            tracking:{key:`collaborator:${weddingId}:${invite.id}:${role}:${parsed.data.requestId}`,weddingId,recoverable:true,guard:{table:'wedding_collaborators',id:invite.id,emailField:'email'}},
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

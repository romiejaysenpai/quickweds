import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { z } from 'zod';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { sendEmail } from '@/lib/email';
import { createRateLimitMiddleware, getClientIP, sanitizeInput } from '@/lib/rate-limit';
import { getEntourageProposalTemplate } from '@/lib/entourage-proposal-templates';

export const dynamic = 'force-dynamic';

const sendSchema = z.object({
    weddingId: z.string().min(1).max(64),
    memberKey: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(254),
    role: z.string().trim().max(120).optional().default('Wedding Entourage'),
    message: z.string().trim().max(2000).optional().default(''),
    templateKey: z.enum(['heartfelt', 'elegant', 'simple']).optional().default('heartfelt'),
});

function getAppUrl() {
    return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://quickweds.site').replace(/\/+$/, '');
}

function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export async function POST(req: NextRequest) {
    const limited = await createRateLimitMiddleware('ENTOURAGE_INVITE').check(getClientIP(req));
    if (limited.limited) return limited.response;

    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const parsed = sendSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid entourage proposal.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const access = await getWeddingAccess(db, user, parsed.data.weddingId, {
            select: 'id, user_id, bride_name, groom_name, wedding_date, venue_name',
            collaboratorRoles: ['partner'],
        });

        if (!access.canManage || !access.wedding) {
            return NextResponse.json({ error: 'Only the owner or accepted partner can send entourage proposals.' }, { status: 403 });
        }

        const wedding = access.wedding as any;
        const template = getEntourageProposalTemplate(parsed.data.templateKey);
        const token = randomBytes(32).toString('base64url');
        const tokenHash = hashToken(token);
        const appUrl = getAppUrl();
        const acceptUrl = `${appUrl}/entourage/respond/${token}?response=accept`;
        const declineUrl = `${appUrl}/entourage/respond/${token}?response=decline`;
        const now = new Date().toISOString();

        const invitePayload = {
            wedding_id: parsed.data.weddingId,
            member_key: sanitizeInput(parsed.data.memberKey, { maxLength: 120 }),
            name: sanitizeInput(parsed.data.name, { maxLength: 160 }),
            email: parsed.data.email.trim().toLowerCase(),
            role: sanitizeInput(parsed.data.role || 'Wedding Entourage', { maxLength: 120 }),
            message: sanitizeInput(parsed.data.message || template.defaultMessage, { maxLength: 2000, allowNewlines: true }),
            template_key: template.key,
            status: 'sent',
            token_hash: tokenHash,
            sent_at: now,
            responded_at: null,
            created_by_user_id: user.id,
            updated_at: now,
        };

        const { data: invitation, error: saveError } = await db
            .from('entourage_invitations')
            .upsert(invitePayload, { onConflict: 'wedding_id,member_key' })
            .select('id, wedding_id, member_key, name, email, role, message, template_key, status, sent_at, responded_at, created_at, updated_at')
            .single();

        if (saveError) throw saveError;

        const emailResult = await sendEmail({
            to: invitePayload.email,
            subject: 'Will you be part of our wedding entourage?',
            template: {
                id: template.alias,
                variables: {
                    INVITEE_NAME: invitePayload.name,
                    MEMBER_ROLE: invitePayload.role || 'Wedding Entourage',
                    BRIDE_NAME: sanitizeInput(wedding.bride_name || 'Bride', { maxLength: 100 }),
                    GROOM_NAME: sanitizeInput(wedding.groom_name || 'Groom', { maxLength: 100 }),
                    WEDDING_DATE: sanitizeInput(wedding.wedding_date || 'To be announced', { maxLength: 80 }),
                    VENUE_NAME: sanitizeInput(wedding.venue_name || 'To be announced', { maxLength: 160 }),
                    PERSONAL_MESSAGE: invitePayload.message || template.defaultMessage,
                    ACCEPT_URL: acceptUrl,
                    DECLINE_URL: declineUrl,
                    APP_NAME: 'QuickWeds',
                },
            },
        });

        if (!emailResult.success) {
            await db
                .from('entourage_invitations')
                .update({ status: 'draft', updated_at: new Date().toISOString() })
                .eq('id', invitation.id);

            return NextResponse.json({
                error: emailResult.error || 'Unable to send proposal email.',
                invitation: { ...invitation, status: 'draft' },
            }, { status: 502 });
        }

        return NextResponse.json({ invitation, emailSent: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to send entourage proposal.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


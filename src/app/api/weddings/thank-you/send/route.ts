import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getThankYouNoteHtml } from '@/lib/email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    getAccountEmailUsage,
    getEmailLimitMessage,
    getUserPlanTier,
    logPlannerEmailEvent,
    PLAN_LIMITS,
} from '@/lib/planner-limits';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const weddingId = sanitizeWeddingId(typeof body?.weddingId === 'string' ? body.weddingId : '');
        const authHeader = req.headers.get('authorization') || '';
        const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

        if (!weddingId || !accessToken) {
            return NextResponse.json({ error: 'weddingId and authorization token are required' }, { status: 400 });
        }

        const rateLimit = createRateLimitMiddleware('THANK_YOU_EMAIL');
        const limited = rateLimit.check(`${getClientIP(req)}:${weddingId}`);
        if (limited.limited) return limited.response;

        const db = getSupabaseAdminClient() as any;
        const { data: authUser, error: authError } = await db.auth.getUser(accessToken);
        if (authError || !authUser.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, bride_name, groom_name, wedding_date, user_id, is_premium, payment_status, plan_type')
            .eq('id', weddingId)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }
        if (wedding.user_id !== authUser.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: notes, error: notesError } = await db
            .from('thank_you_notes')
            .select('*')
            .eq('wedding_id', weddingId)
            .eq('status', 'draft');

        if (notesError) {
            return NextResponse.json({ error: notesError.message }, { status: 500 });
        }

        if (!notes?.length) {
            return NextResponse.json({ sentCount: 0, failedCount: 0 });
        }

        const { data: ownerProfile } = await db
            .from('user_app_profiles')
            .select('is_pro, plan_type, payment_status')
            .eq('user_id', wedding.user_id)
            .maybeSingle();
        const tier = getUserPlanTier({ wedding, accountProfile: ownerProfile });
        const emailsUsed = await getAccountEmailUsage(db, wedding.user_id);
        const emailLimit = PLAN_LIMITS[tier].emails;

        if (emailsUsed + notes.length > emailLimit) {
            return NextResponse.json({
                error: getEmailLimitMessage(notes.length, emailsUsed, tier),
                code: 'email_limit_reached',
                used: emailsUsed,
                limit: emailLimit,
                requested: notes.length,
            }, { status: 402 });
        }

        const settled = await Promise.all(notes.map(async (note: any) => {
            const html = getThankYouNoteHtml({
                recipientName: note.recipient_name,
                brideName: wedding.bride_name,
                groomName: wedding.groom_name,
                weddingDate: wedding.wedding_date,
                personalizedMessage: note.personalized_message || undefined,
            });
            const result = await sendEmail({
                to: note.recipient_email,
                subject: `Thank you from ${wedding.bride_name} & ${wedding.groom_name}`,
                html,
            });

            const nextStatus = result.success ? 'sent' : 'failed';
            await db
                .from('thank_you_notes')
                .update({
                    status: nextStatus,
                    generated_html: html,
                    sent_at: result.success ? new Date().toISOString() : null,
                })
                .eq('id', note.id);

            return result.success;
        }));

        const sentCount = settled.filter(Boolean).length;
        const failedCount = settled.length - sentCount;
        await logPlannerEmailEvent(db, {
            weddingId,
            eventType: 'thank_you',
            recipientCount: notes.length,
            successCount: sentCount,
            userId: authUser.user.id,
        });

        return NextResponse.json({ sentCount, failedCount }, { headers: limited.headers });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send thank-you notes' }, { status: 500 });
    }
}

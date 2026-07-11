import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendEmail, getThankYouNoteHtml } from '@/lib/email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    FREE_PLAN_LIMITS,
    getEmailLimitMessage,
    getUserTriggeredEmailUsage,
    hasPlannerProAccess,
    logPlannerEmailEvent,
} from '@/lib/planner-limits';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limiter';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const weddingId = sanitizeWeddingId(typeof body?.weddingId === 'string' ? body.weddingId : '');
        const noteId = typeof body?.noteId === 'string' ? body.noteId.trim() : '';
        const dryRun = body?.dryRun === true || req.nextUrl.searchParams.get('dryRun') === '1';
        const authHeader = req.headers.get('authorization') || '';
        const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

        if (!weddingId || !accessToken) {
            return NextResponse.json({ error: 'weddingId and authorization token are required' }, { status: 400 });
        }
        if (noteId && !UUID_PATTERN.test(noteId)) {
            return NextResponse.json({ error: 'noteId must be a valid UUID' }, { status: 400 });
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
            .select('id, bride_name, groom_name, wedding_date, user_id, is_premium, payment_status')
            .eq('id', weddingId)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }
        if (wedding.user_id !== authUser.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let notesQuery = db
            .from('thank_you_notes')
            .select('*')
            .eq('wedding_id', weddingId)
            .eq('status', 'draft');
        if (noteId) notesQuery = notesQuery.eq('id', noteId);

        const { data: notes, error: notesError } = await notesQuery;

        if (notesError) {
            return NextResponse.json({ error: notesError.message }, { status: 500 });
        }

        if (!notes?.length) {
            return NextResponse.json({ sentCount: 0, failedCount: 0 });
        }

        const { data: ownerProfile } = await db
            .from('user_app_profiles')
            .select('is_pro, payment_status')
            .eq('user_id', wedding.user_id)
            .maybeSingle();
        const hasPlannerPro = hasPlannerProAccess({ wedding, accountProfile: ownerProfile });
        const emailsUsed = await getUserTriggeredEmailUsage(db, weddingId);

        if (!hasPlannerPro && emailsUsed + notes.length > FREE_PLAN_LIMITS.userTriggeredEmails) {
            return NextResponse.json({
                error: getEmailLimitMessage(notes.length, emailsUsed),
                code: 'email_limit_reached',
                used: emailsUsed,
                limit: FREE_PLAN_LIMITS.userTriggeredEmails,
                requested: notes.length,
            }, { status: 402 });
        }

        if (dryRun) {
            return NextResponse.json({
                dryRun: true,
                sentCount: 0,
                failedCount: 0,
                wouldSendCount: notes.length,
                emailsUsed,
                hasPlannerPro,
            }, { headers: limited.headers });
        }

        const noteIds = notes.map((note: any) => note.id);
        const { data: claimedNotes, error: claimError } = await db
            .from('thank_you_notes')
            .update({ status: 'sending' })
            .eq('wedding_id', weddingId)
            .eq('status', 'draft')
            .in('id', noteIds)
            .select('*');

        if (claimError) {
            return NextResponse.json({ error: claimError.message }, { status: 500, headers: limited.headers });
        }
        if (!claimedNotes?.length) {
            return NextResponse.json(
                { error: 'The selected note is already being processed. Refresh to see its status.' },
                { status: 409, headers: limited.headers }
            );
        }

        const settled = await Promise.all(claimedNotes.map(async (note: any) => {
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
            const { error: statusError } = await db
                .from('thank_you_notes')
                .update({
                    status: nextStatus,
                    generated_html: html,
                    sent_at: result.success ? new Date().toISOString() : null,
                })
                .eq('id', note.id)
                .eq('wedding_id', weddingId);

            if (statusError) {
                console.error('Thank-you delivery status update failed:', statusError.message);
            }

            return {
                sent: result.success,
                statusUpdated: !statusError,
            };
        }));

        const sentCount = settled.filter((result) => result.sent).length;
        const failedCount = settled.length - sentCount;
        const statusUpdateFailedCount = settled.filter((result) => !result.statusUpdated).length;
        await logPlannerEmailEvent(db, {
            weddingId,
            eventType: 'thank_you',
            recipientCount: claimedNotes.length,
            successCount: sentCount,
            userId: authUser.user.id,
        });

        return NextResponse.json({ sentCount, failedCount, statusUpdateFailedCount }, { headers: limited.headers });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send thank-you notes' }, { status: 500 });
    }
}

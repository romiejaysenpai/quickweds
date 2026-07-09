import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getThankYouNoteHtml } from '@/lib/email-templates';
import {
    FREE_PLAN_LIMITS,
    getEmailLimitMessage,
    getUserTriggeredEmailUsage,
    logPlannerEmailEvent,
} from '@/lib/planner-limits';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limit';
import {
    filterUnsentThankYouRecipients,
    getConfirmedThankYouRecipients,
    getSentThankYouLogState,
    getThankYouAccessContext,
    insertThankYouEmailLog,
    normalizeThankYouPayload,
    sanitizeThankYouWeddingId,
} from '@/lib/thank-you-server';

export const dynamic = 'force-dynamic';

function isUniqueViolation(error: unknown) {
    const record = error as { code?: string; message?: string };
    return record?.code === '23505' || String(record?.message || '').toLowerCase().includes('duplicate key');
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeThankYouWeddingId(body.weddingId);
    const dryRun = body.dryRun === true || req.nextUrl.searchParams.get('dryRun') === '1';
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    const rateLimit = createRateLimitMiddleware('THANK_YOU_EMAIL');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}:send`);
    if (limited.limited) return limited.response;

    try {
        const context = await getThankYouAccessContext(req, weddingId);
        if ('response' in context) return context.response;
        const { db, wedding, user, hasPlannerPro } = context;

        const [recipients, sentLogs, emailsUsed] = await Promise.all([
            getConfirmedThankYouRecipients(db, weddingId),
            getSentThankYouLogState(db, weddingId),
            getUserTriggeredEmailUsage(db, weddingId),
        ]);

        if (!sentLogs.schemaAvailable) {
            return NextResponse.json({
                error: 'Thank-you email logging is not installed yet. Apply the thank_you_email_logs SQL before sending.',
                code: 'thank_you_logs_missing',
            }, { status: 500 });
        }

        const payload = normalizeThankYouPayload(body, wedding);
        const targets = filterUnsentThankYouRecipients(recipients, sentLogs);
        const skippedDuplicate = recipients.length - targets.length;

        if (!hasPlannerPro && emailsUsed + targets.length > FREE_PLAN_LIMITS.userTriggeredEmails) {
            return NextResponse.json({
                error: getEmailLimitMessage(targets.length, emailsUsed),
                code: 'email_limit_reached',
                used: emailsUsed,
                limit: FREE_PLAN_LIMITS.userTriggeredEmails,
                requested: targets.length,
            }, { status: 402 });
        }

        if (dryRun) {
            return NextResponse.json({
                dryRun: true,
                eligible: recipients.length,
                wouldSendCount: targets.length,
                skippedDuplicate,
                emailsUsed,
                hasPlannerPro,
            }, { headers: limited.headers });
        }

        let sent = 0;
        let failed = 0;
        let duplicateRaces = 0;
        const emailErrors: string[] = [];

        for (const guest of targets) {
            const html = getThankYouNoteHtml({
                recipientName: guest.guest_name,
                brideName: wedding.bride_name,
                groomName: wedding.groom_name,
                weddingDate: wedding.wedding_date,
                templateId: payload.templateId,
                message: payload.message,
                coupleSignature: payload.coupleSignature,
                style: payload.style,
                photoUrl: payload.photoUrl,
            });

            const result = await sendEmail({
                to: guest.guest_email,
                subject: payload.subject,
                html,
            });

            try {
                await insertThankYouEmailLog(db, {
                    weddingId,
                    rsvpId: guest.id,
                    recipientEmail: guest.guest_email,
                    recipientName: guest.guest_name,
                    payload,
                    status: result.success ? 'sent' : 'failed',
                    providerMessageId: result.success ? result.id : null,
                    errorMessage: result.success ? null : result.error || 'Email failed',
                    userId: user.id,
                });
            } catch (logError) {
                if (isUniqueViolation(logError)) {
                    duplicateRaces += 1;
                    continue;
                }
                throw logError;
            }

            if (result.success) {
                sent += 1;
            } else {
                failed += 1;
                emailErrors.push(`${guest.guest_email}: ${result.error || 'Email failed'}`);
            }

            await sleep(250);
        }

        await logPlannerEmailEvent(db, {
            weddingId,
            eventType: 'thank_you',
            recipientCount: targets.length,
            successCount: sent,
            userId: user.id,
        });

        return NextResponse.json({
            success: failed === 0,
            eligible: recipients.length,
            sent,
            failed,
            skippedDuplicate: skippedDuplicate + duplicateRaces,
            emailErrors,
        }, { headers: limited.headers });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send thank-you emails.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

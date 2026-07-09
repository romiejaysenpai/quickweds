import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getThankYouNoteHtml } from '@/lib/email-templates';
import { createRateLimitMiddleware, getClientIP, sanitizeEmail } from '@/lib/rate-limit';
import {
    getSentThankYouLogState,
    getThankYouAccessContext,
    insertThankYouEmailLog,
    normalizeThankYouPayload,
    sanitizeThankYouWeddingId,
} from '@/lib/thank-you-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeThankYouWeddingId(body.weddingId);
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    const rateLimit = createRateLimitMiddleware('THANK_YOU_EMAIL');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}:test`);
    if (limited.limited) return limited.response;

    try {
        const context = await getThankYouAccessContext(req, weddingId);
        if ('response' in context) return context.response;
        const { db, wedding, user } = context;
        const logs = await getSentThankYouLogState(db, weddingId);
        if (!logs.schemaAvailable) {
            return NextResponse.json({
                error: 'Thank-you email logging is not installed yet. Apply the thank_you_email_logs SQL before sending.',
                code: 'thank_you_logs_missing',
            }, { status: 500 });
        }

        const payload = normalizeThankYouPayload(body, wedding);
        const recipientEmail = sanitizeEmail(body.testEmail || user.email || '');
        if (!recipientEmail) return NextResponse.json({ error: 'A valid test email is required.' }, { status: 400 });

        const html = getThankYouNoteHtml({
            recipientName: 'Test Guest',
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
            to: recipientEmail,
            subject: `[Test] ${payload.subject}`,
            html,
        });

        await insertThankYouEmailLog(db, {
            weddingId,
            recipientEmail,
            recipientName: 'Test Guest',
            payload,
            status: result.success ? 'test' : 'failed',
            providerMessageId: result.success ? result.id : null,
            errorMessage: result.success ? null : result.error || 'Email failed',
            userId: user.id,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Test email failed.' }, { status: 502, headers: limited.headers });
        }

        return NextResponse.json({ success: true, recipientEmail }, { headers: limited.headers });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to send test email.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

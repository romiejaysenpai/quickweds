import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserTriggeredEmailUsage } from '@/lib/planner-limits';
import {
    filterUnsentThankYouRecipients,
    getConfirmedThankYouRecipients,
    getSentThankYouLogState,
    getThankYouAccessContext,
    sanitizeThankYouWeddingId,
} from '@/lib/thank-you-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const weddingId = sanitizeThankYouWeddingId(searchParams.get('weddingId'));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getThankYouAccessContext(req, weddingId);
        if ('response' in context) return context.response;
        const { db, wedding, hasPlannerPro } = context;

        const [recipients, sentLogs, emailsUsed] = await Promise.all([
            getConfirmedThankYouRecipients(db, weddingId),
            getSentThankYouLogState(db, weddingId),
            getUserTriggeredEmailUsage(db, weddingId),
        ]);
        const unsentRecipients = filterUnsentThankYouRecipients(recipients, sentLogs);

        return NextResponse.json({
            wedding,
            hasPlannerPro,
            emailsUsed,
            logSchemaAvailable: sentLogs.schemaAvailable,
            recipients,
            unsentRecipients,
            alreadySentCount: recipients.length - unsentRecipients.length,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load thank-you builder.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

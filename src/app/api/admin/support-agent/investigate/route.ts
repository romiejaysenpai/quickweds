import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { runSupportInvestigation } from '@/lib/support-agent';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });
    if (!isKnownAdminEmail(user.email)) {
        return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const ticketId = String(body.ticketId || '').trim();

        if (!ticketId) {
            return NextResponse.json({ error: 'Missing ticketId.' }, { status: 400 });
        }

        const investigation = await runSupportInvestigation(ticketId, user.email || user.id);

        return NextResponse.json({
            success: true,
            investigation,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to investigate ticket.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

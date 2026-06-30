import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { SUPPORT_AGENT_OPERATING_PLAN } from '@/lib/support-agent';

export const dynamic = 'force-dynamic';

async function requireAdmin(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) {
        return { user: null, response: NextResponse.json({ error }, { status: 401 }) };
    }
    if (!isKnownAdminEmail(user.email)) {
        return { user: null, response: NextResponse.json({ error: 'Admin access required.' }, { status: 403 }) };
    }
    return { user, response: null };
}

export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth.response) return auth.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

        let query = db
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: tickets, error } = await query;
        if (error) throw error;

        const ticketIds = (tickets || []).map((ticket: any) => ticket.id);
        let investigations: any[] = [];

        if (ticketIds.length > 0) {
            const { data, error: investigationError } = await db
                .from('support_investigations')
                .select('id, ticket_id, summary, issue_type, risk_level, action_needed, status, report_text, created_at')
                .in('ticket_id', ticketIds)
                .order('created_at', { ascending: false });

            if (investigationError) throw investigationError;
            investigations = data || [];
        }

        const latestInvestigationByTicket = new Map<string, any>();
        for (const investigation of investigations) {
            if (!latestInvestigationByTicket.has(investigation.ticket_id)) {
                latestInvestigationByTicket.set(investigation.ticket_id, investigation);
            }
        }

        return NextResponse.json({
            success: true,
            operatingPlan: SUPPORT_AGENT_OPERATING_PLAN,
            tickets: (tickets || []).map((ticket: any) => ({
                ...ticket,
                latestInvestigation: latestInvestigationByTicket.get(ticket.id) || null,
            })),
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load support tickets.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


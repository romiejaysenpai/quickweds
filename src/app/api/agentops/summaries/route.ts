import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isAgentAuthorized } from '@/lib/agentops';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!isAgentAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { agent, workflow, executionId, ranAt, note } = body;

        if (!agent) {
            return NextResponse.json(
                { error: 'Missing required field: agent' },
                { status: 400 }
            );
        }

        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('agentops_summaries')
            .insert({
                agent,
                workflow: workflow || null,
                execution_id: executionId || null,
                ran_at: ranAt || new Date().toISOString(),
                note: note || null,
            })
            .select('id')
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, id: data.id });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to write summary';
        console.error('[agentops/summaries] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

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
        const { agent, action, taskId, result } = body;

        if (!agent || !action) {
            return NextResponse.json(
                { error: 'Missing required fields: agent, action' },
                { status: 400 }
            );
        }

        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('agentops_runs')
            .insert({
                agent,
                action,
                task_id: taskId || null,
                result: result || {},
            })
            .select('id')
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, id: data.id });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to log agent run';
        console.error('[agentops/runs] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

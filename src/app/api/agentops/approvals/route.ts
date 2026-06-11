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
        const { task, reason } = body;

        if (!task || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields: task, reason' },
                { status: 400 }
            );
        }

        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('agentops_approvals')
            .insert({
                agent: task.agent || 'lifecycle_marketing_agent',
                task_data: task,
                reason,
                status: 'pending',
            })
            .select('id')
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, id: data.id });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to queue approval';
        console.error('[agentops/approvals] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

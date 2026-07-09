import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizeWeddingId } from '@/lib/rate-limit';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeQueryList(query: any, label: string) {
    const result = await query;
    if (result.error) {
        console.warn(`Coordinator report query skipped for ${label}:`, result.error.message || result.error);
        return [];
    }
    return result.data || [];
}

export async function GET(req: NextRequest) {
    const weddingId = sanitizeWeddingId(req.nextUrl.searchParams.get('weddingId') || '');
    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });
    }

    try {
        const { user, error: authError } = await getRequestUser(req);
        if (!user) {
            return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = getSupabaseAdminClient() as any;
        const access = await getWeddingAccess(db, user, weddingId, {
            select: 'id, user_id, bride_name, groom_name, wedding_date, wedding_time, venue_name, venue_address, currency',
            collaboratorRoles: ['partner', 'coordinator'],
        });

        if (!access.wedding) {
            return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        }
        if (!access.canManage) {
            return NextResponse.json({ error: 'You do not have permission to view this report.' }, { status: 403 });
        }

        const resolvedWeddingId = access.wedding.id;

        // Fetch settings, guests, seating tables/assignments, vendors, budget items, timeline events in parallel
        const [
            settingsResult,
            rsvps,
            seatingTables,
            seatingAssignments,
            vendors,
            budgets,
            events
        ] = await Promise.all([
            db.from('wedding_day_settings').select('*').eq('wedding_id', resolvedWeddingId).maybeSingle(),
            safeQueryList(db.from('rsvps').select('*').eq('wedding_id', resolvedWeddingId).order('guest_name', { ascending: true }), 'rsvps'),
            safeQueryList(db.from('seating_tables').select('*').eq('wedding_id', resolvedWeddingId).order('table_name', { ascending: true }), 'seating_tables'),
            safeQueryList(db.from('seating_assignments').select('*').eq('wedding_id', resolvedWeddingId), 'seating_assignments'),
            safeQueryList(db.from('planner_vendors').select('*').eq('wedding_id', resolvedWeddingId).order('name', { ascending: true }), 'vendors'),
            safeQueryList(db.from('planner_budgets').select('*').eq('wedding_id', resolvedWeddingId).order('item_name', { ascending: true }), 'budgets'),
            safeQueryList(db.from('planner_events').select('*').eq('wedding_id', resolvedWeddingId).order('starts_at', { ascending: true }), 'events'),
        ]);

        const settings = settingsResult.error ? null : (settingsResult.data || { emergency_contacts: [], coordinator_notes: '' });

        return NextResponse.json({
            wedding: access.wedding,
            settings,
            rsvps,
            seatingTables,
            seatingAssignments,
            vendors,
            budgets,
            events,
            accessRole: access.role
        }, { headers: { 'Cache-Control': 'no-store' } });

    } catch (err) {
        console.error('Error loading coordinator report data:', err);
        const message = err instanceof Error ? err.message : 'Unable to load coordinator report data.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

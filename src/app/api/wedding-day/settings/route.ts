import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizeWeddingId } from '@/lib/rate-limit';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

const SETTING_COLUMNS = 'id, wedding_id, is_enabled, check_in_enabled, seat_finder_enabled, photo_upload_enabled, timeline_enabled, guestbook_enabled, emergency_contacts, coordinator_notes, created_at, updated_at';
const DEFAULT_SETTINGS = {
    id: null,
    is_enabled: false,
    check_in_enabled: true,
    seat_finder_enabled: true,
    photo_upload_enabled: true,
    timeline_enabled: true,
    guestbook_enabled: true,
    emergency_contacts: [],
    coordinator_notes: '',
    created_at: null,
    updated_at: null,
};

const BOOLEAN_KEYS = [
    'is_enabled',
    'check_in_enabled',
    'seat_finder_enabled',
    'photo_upload_enabled',
    'timeline_enabled',
    'guestbook_enabled',
] as const;

function normalizeEmergencyContacts(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 10).map((item) => {
        const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
        return {
            name: String(record.name || '').trim().slice(0, 80),
            role: String(record.role || '').trim().slice(0, 80),
            phone: String(record.phone || '').trim().slice(0, 40),
        };
    }).filter((item) => item.name || item.role || item.phone);
}

function isMissingSettingsTable(error: unknown) {
    const details = error && typeof error === 'object' ? error as { code?: string; message?: string } : {};
    const message = details.message || '';
    return details.code === '42P01'
        || details.code === 'PGRST205'
        || message.includes('wedding_day_settings')
        || message.includes('relation') && message.includes('does not exist');
}

function buildDefaultSettings(weddingId: string) {
    return { ...DEFAULT_SETTINGS, wedding_id: weddingId };
}

async function getContext(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, weddingId, {
        select: 'id, user_id, bride_name, groom_name',
        collaboratorRoles: ['partner', 'coordinator'],
    });

    if (!access.wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (!access.canManage) return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

    return { db, wedding: access.wedding };
}

async function getOrCreateSettings(db: any, weddingId: string) {
    const existing = await db
        .from('wedding_day_settings')
        .select(SETTING_COLUMNS)
        .eq('wedding_id', weddingId)
        .maybeSingle();

    if (existing.error) {
        if (isMissingSettingsTable(existing.error)) return buildDefaultSettings(weddingId);
        throw existing.error;
    }
    if (existing.data) return existing.data;

    const created = await db
        .from('wedding_day_settings')
        .insert({ wedding_id: weddingId })
        .select(SETTING_COLUMNS)
        .single();

    if (created.error) {
        if (isMissingSettingsTable(created.error)) return buildDefaultSettings(weddingId);
        throw created.error;
    }
    return created.data;
}

export async function GET(req: NextRequest) {
    const weddingId = sanitizeWeddingId(req.nextUrl.searchParams.get('weddingId') || '');
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getContext(req, weddingId);
        if ('response' in context) return context.response;

        const settings = await getOrCreateSettings(context.db, weddingId);
        return NextResponse.json({ settings, wedding: context.wedding }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load wedding day settings.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getContext(req, weddingId);
        if ('response' in context) return context.response;

        const update: Record<string, unknown> = {
            wedding_id: weddingId,
            updated_at: new Date().toISOString(),
        };

        for (const key of BOOLEAN_KEYS) {
            if (typeof body[key] === 'boolean') update[key] = body[key];
        }

        if ('coordinator_notes' in body) {
            update.coordinator_notes = String(body.coordinator_notes || '').slice(0, 4000);
        }

        if ('emergency_contacts' in body) {
            update.emergency_contacts = normalizeEmergencyContacts(body.emergency_contacts);
        }

        const { data, error } = await context.db
            .from('wedding_day_settings')
            .upsert(update, { onConflict: 'wedding_id' })
            .select(SETTING_COLUMNS)
            .single();

        if (error) {
            if (isMissingSettingsTable(error)) {
                return NextResponse.json({
                    settings: { ...buildDefaultSettings(weddingId), ...update },
                    warning: 'Wedding day settings table is not available. Run supabase-premium-features.sql to persist these settings.',
                });
            }
            throw error;
        }
        return NextResponse.json({ settings: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save wedding day settings.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

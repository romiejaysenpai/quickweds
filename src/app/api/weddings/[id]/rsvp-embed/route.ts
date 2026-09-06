import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { invalidateWeddingPublicCache } from '@/lib/public-wedding';
import { RSVP_EMBED_PLATFORM_VALUES } from '@/lib/rsvp-embed';

const PLATFORM_VALUES = new Set<string>(RSVP_EMBED_PLATFORM_VALUES);
const RSVP_EMBED_COLUMNS = ['website_mode', 'external_website_url', 'external_platform', 'rsvp_embed_enabled'] as const;

function isMissingRsvpEmbedSchema(error: unknown) {
    const details = error as { code?: string; message?: string; details?: string; hint?: string };
    const text = `${details?.message || ''} ${details?.details || ''} ${details?.hint || ''}`.toLowerCase();
    const missingColumn = RSVP_EMBED_COLUMNS.some((column) => text.includes(column));

    return missingColumn && (
        details?.code === '42703' ||
        details?.code === 'PGRST204' ||
        text.includes('column') ||
        text.includes('schema cache')
    );
}

function schemaUnavailableResponse() {
    return NextResponse.json(
        { error: 'RSVP embed settings are temporarily unavailable while the database update completes.' },
        { status: 503 }
    );
}

function normalizeExternalUrl(value: unknown) {
    const input = typeof value === 'string' ? value.trim() : '';
    if (!input) return null;
    if (input.length > 2048) throw new Error('Website URL is too long.');

    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Website URL must begin with http:// or https://.');
    }
    return url.toString().replace(/\/$/, '');
}

async function resolveAccess(req: NextRequest, id: string, forUpdate = false) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error }, { status: 401 }) };

    const db: SupabaseClient = getSupabaseAdminClient();
    const access = await getWeddingAccess(db, user, id, {
        select: 'id, user_id, public_slug, bride_name, groom_name, website_mode, external_website_url, external_platform, rsvp_embed_enabled, deleted_at',
        collaboratorRoles: forUpdate ? ['partner'] : ['partner', 'coordinator'],
    });

    if (!access.wedding || access.wedding.deleted_at) {
        return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    }
    if (!access.canManage) {
        return { response: NextResponse.json({ error: 'You do not have access to this wedding.' }, { status: 403 }) };
    }

    return { db, access, user };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const resolved = await resolveAccess(req, id);
        if ('response' in resolved) return resolved.response;

        return NextResponse.json({
            wedding: {
                id: resolved.access.wedding.id,
                public_slug: resolved.access.wedding.public_slug,
                bride_name: resolved.access.wedding.bride_name,
                groom_name: resolved.access.wedding.groom_name,
                website_mode: resolved.access.wedding.website_mode,
                external_website_url: resolved.access.wedding.external_website_url,
                external_platform: resolved.access.wedding.external_platform,
                rsvp_embed_enabled: resolved.access.wedding.rsvp_embed_enabled,
            },
            canEdit: resolved.access.role !== 'coordinator',
        });
    } catch (error) {
        if (isMissingRsvpEmbedSchema(error)) {
            console.error('RSVP embed settings GET blocked by missing database columns.');
            return schemaUnavailableResponse();
        }
        const message = error instanceof Error ? error.message : 'Unable to load RSVP embed settings.';
        console.error('RSVP embed settings GET failed:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const resolved = await resolveAccess(req, id, true);
        if ('response' in resolved) return resolved.response;

        const body = await req.json().catch(() => ({}));
        const externalPlatform = typeof body.external_platform === 'string' ? body.external_platform.trim().toLowerCase() : '';

        if (externalPlatform && !PLATFORM_VALUES.has(externalPlatform)) {
            return NextResponse.json({ error: 'Choose a supported website platform.' }, { status: 400 });
        }
        if (typeof body.rsvp_embed_enabled !== 'boolean') {
            return NextResponse.json({ error: 'Embed status must be enabled or disabled.' }, { status: 400 });
        }
        if (body.rsvp_embed_enabled && !externalPlatform) {
            return NextResponse.json({ error: 'Choose your website platform before activating the RSVP form.' }, { status: 400 });
        }

        let externalWebsiteUrl: string | null;
        try {
            externalWebsiteUrl = normalizeExternalUrl(body.external_website_url);
        } catch (error) {
            return NextResponse.json({ error: error instanceof Error ? error.message : 'Enter a valid website URL.' }, { status: 400 });
        }

        const { data, error } = await resolved.db
            .from('weddings')
            .update({
                website_mode: 'external',
                external_website_url: externalWebsiteUrl,
                external_platform: externalPlatform || null,
                rsvp_embed_enabled: body.rsvp_embed_enabled,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('id, public_slug, bride_name, groom_name, website_mode, external_website_url, external_platform, rsvp_embed_enabled')
            .single();

        if (error) throw error;
        await invalidateWeddingPublicCache(id, data.public_slug);

        return NextResponse.json({ wedding: data, canEdit: true });
    } catch (error) {
        if (isMissingRsvpEmbedSchema(error)) {
            console.error('RSVP embed settings PATCH blocked by missing database columns.');
            return schemaUnavailableResponse();
        }
        const message = error instanceof Error ? error.message : 'Unable to save RSVP embed settings.';
        console.error('RSVP embed settings PATCH failed:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

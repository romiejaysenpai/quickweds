import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRequest } from '@/lib/api-rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { externalWebsiteConnectionSchema, normalizeExternalWebsiteUrl } from '@/lib/external-website';

export const dynamic = 'force-dynamic';
const columns = 'id,user_id,bride_name,groom_name,wedding_date,wedding_time,venue_name,rsvp_deadline,motif_color,hero_image,external_website_url,rsvp_page_enabled,planner_only';
const headers = { 'Cache-Control': 'private, no-store' };

async function accessFor(db: any, user: Parameters<typeof getWeddingAccess>[1], id: string) {
    const access = await getWeddingAccess(db, user, id, { select: columns });
    return { ...access, canManage: ['owner', 'partner', 'admin'].includes(access.role || '') };
}
function payload(wedding: Record<string, unknown>, canManage: boolean) {
    const { user_id: _owner, ...safe } = wedding;
    return { wedding: safe, canManage };
}
function failure(error: unknown) {
    console.error('External website connection failed:', error);
    const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
    const missing = ['42703', 'PGRST204', 'PGRST205'].includes(String(code));
    return NextResponse.json({ error: missing ? 'Website connections are being set up. Please try again shortly.' : 'Unable to save or load your website connection. Please try again.' }, { status: 503, headers });
}
export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedRequest(req, 'AUTHENTICATED_DEFAULT');
    if (auth.response) return auth.response;
    const id = req.nextUrl.searchParams.get('weddingId');
    if (!id || id.length > 100) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400, headers });
    try {
        const db = getSupabaseAdminClient() as any;
        const access = await accessFor(db, auth.user, id);
        if (!access.wedding || !access.role) return NextResponse.json({ error: 'Wedding not found or access denied.' }, { status: 403, headers });
        return NextResponse.json(payload(access.wedding, access.canManage), { headers });
    } catch (error) { return failure(error); }
}
export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedRequest(req, 'AUTHENTICATED_DEFAULT');
    if (auth.response) return auth.response;
    const parsed = externalWebsiteConnectionSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Check your connection details.' }, { status: 400, headers });
    try {
        const db = getSupabaseAdminClient() as any;
        const input = parsed.data;
        const access = await accessFor(db, auth.user, input.weddingId);
        if (!access.wedding || !access.canManage) return NextResponse.json({ error: 'Only the couple or a partner can change this connection.' }, { status: 403, headers });
        if (!access.wedding.planner_only) return NextResponse.json({ error: 'This wedding already has a QuickWeds website. Start a private workspace to connect an external website.' }, { status: 409, headers });
        const { data, error } = await db.from('weddings').update({
            external_website_url: input.externalWebsiteUrl ? normalizeExternalWebsiteUrl(input.externalWebsiteUrl) : null,
            rsvp_page_enabled: input.rsvpPageEnabled,
            bride_name: input.brideName, groom_name: input.groomName,
            wedding_date: input.weddingDate || null, wedding_time: input.weddingTime || null,
            venue_name: input.venueName, rsvp_deadline: input.rsvpDeadline || null, motif_color: input.motifColor,
            ...(input.heroImage !== undefined
                ? { hero_image: input.heroImage ? normalizeExternalWebsiteUrl(input.heroImage) : null }
                : {}),
        }).eq('id', access.wedding.id).is('deleted_at', null).select(columns).single();
        if (error) throw error;
        return NextResponse.json(payload(data, true), { headers });
    } catch (error) { return failure(error); }
}

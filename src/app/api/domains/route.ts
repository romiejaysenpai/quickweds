import { NextResponse } from 'next/server';
import { z } from 'zod';
import { domainSchema, validateRequest } from '@/lib/validations';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

const weddingIdSchema = z.string().uuid('Invalid wedding ID format');

type AccessCheckResult =
    | { ok: true; customDomain: string | null; isPremium: boolean }
    | { ok: false; status: number; error: string };

async function verifyWeddingAccess(req: Request, weddingId: string): Promise<AccessCheckResult> {
    let supabase: any;
    try {
        supabase = getSupabaseAdminClient();
    } catch {
        return { ok: false, status: 500, error: 'Server configuration error' };
    }
    const authHeader = req.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!accessToken) {
        return { ok: false, status: 401, error: 'Missing bearer token' };
    }

    const { data, error: authError } = await supabase.auth.getUser(accessToken);
    const user = data?.user;
    if (authError || !user) {
        return { ok: false, status: 401, error: 'Unauthorized' };
    }

    const { data: wedding, error: weddingError } = await supabase
        .from('weddings')
        .select('id, user_id, custom_domain, is_premium')
        .eq('id', weddingId)
        .is('deleted_at', null)
        .single();

    if (weddingError || !wedding) {
        return { ok: false, status: 404, error: 'Wedding not found' };
    }

    if (wedding.user_id === user.id) {
        return { ok: true, customDomain: wedding.custom_domain || null, isPremium: Boolean(wedding.is_premium) };
    }

    const userEmail = user.email?.toLowerCase();
    if (!userEmail) {
        return { ok: false, status: 403, error: 'Forbidden' };
    }

    const { data: collaborator, error: collaboratorError } = await supabase
        .from('wedding_collaborators')
        .select('id')
        .eq('wedding_id', weddingId)
        .eq('email', userEmail)
        .eq('status', 'accepted')
        .eq('role', 'partner')
        .maybeSingle();

    if (collaboratorError || !collaborator) {
        return { ok: false, status: 403, error: 'Forbidden' };
    }

    return { ok: true, customDomain: wedding.custom_domain || null, isPremium: Boolean(wedding.is_premium) };
}

function parseWeddingId(value: string | null) {
    const parsed = weddingIdSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = validateRequest(domainSchema, body);
        const weddingId = parseWeddingId(typeof body?.weddingId === 'string' ? body.weddingId : null);

        if (!validation.success) {
            return NextResponse.json({ error: validation.errors }, { status: 400 });
        }

        if (!weddingId) {
            return NextResponse.json({ error: 'Valid weddingId is required' }, { status: 400 });
        }

        const access = await verifyWeddingAccess(req, weddingId);
        if (!access.ok) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }

        if (!access.isPremium) {
            return NextResponse.json(
                { error: 'Planner Pro is required to connect a custom domain.' },
                { status: 402 }
            );
        }

        const { domain } = validation.data;

        if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
            return NextResponse.json({ error: 'Vercel API keys are not configured in environment.' }, { status: 500 });
        }

        const response = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: domain }),
        });

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to add domain to Vercel' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const domain = searchParams.get('domain');
        const weddingId = parseWeddingId(searchParams.get('weddingId'));

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        if (!weddingId) {
            return NextResponse.json({ error: 'Valid weddingId is required' }, { status: 400 });
        }

        const access = await verifyWeddingAccess(req, weddingId);
        if (!access.ok) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }

        const validation = domainSchema.safeParse({ domain });
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        if (access.customDomain && access.customDomain !== domain) {
            return NextResponse.json({ error: 'Domain does not belong to this wedding' }, { status: 403 });
        }

        if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
            return NextResponse.json({ error: 'Vercel API keys not configured.' }, { status: 500 });
        }

        const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/config`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch domain verification status' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const weddingId = parseWeddingId(searchParams.get('weddingId'));

    if (!domain) {
        return NextResponse.json({ error: 'Domain query param is required' }, { status: 400 });
    }

    if (!weddingId) {
        return NextResponse.json({ error: 'Valid weddingId is required' }, { status: 400 });
    }

    const access = await verifyWeddingAccess(req, weddingId);
    if (!access.ok) {
        return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const validation = domainSchema.safeParse({ domain });
    if (!validation.success) {
        return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    if (access.customDomain && access.customDomain !== domain) {
        return NextResponse.json({ error: 'Domain does not belong to this wedding' }, { status: 403 });
    }

    if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
        return NextResponse.json({ error: 'Vercel API keys not configured.' }, { status: 500 });
    }

    try {
        const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to delete custom domain from Vercel.' }, { status: 500 });
    }
}

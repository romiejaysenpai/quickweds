import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { domainSchema, validateRequest } from '@/lib/validations';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/api-auth';
import { getWeddingAccess } from '@/lib/wedding-access';
import { isKnownAdminEmail } from '@/lib/admin';
import { hasPlannerProAccess } from '@/lib/planner-limits';

type AccessCheckResult =
    | { ok: true; customDomain: string | null; isPremium: boolean; userId: string }
    | { ok: false; status: number; error: string };

async function verifyWeddingAccess(req: NextRequest, weddingId: string): Promise<AccessCheckResult> {
    const { user, error: authError } = await getRequestUser(req);
    if (!user) {
        return { ok: false, status: 401, error: authError || 'Unauthorized' };
    }

    let supabase: any;
    try {
        supabase = getSupabaseAdminClient();
    } catch {
        return { ok: false, status: 500, error: 'Server configuration error' };
    }

    const access = await getWeddingAccess(supabase, user, weddingId, {
        select: 'id, user_id, custom_domain, is_premium, payment_status',
        collaboratorRoles: ['partner'],
    });

    if (!access.wedding) {
        return { ok: false, status: 404, error: 'Wedding not found' };
    }
    if (!access.canManage) {
        return { ok: false, status: 403, error: 'Forbidden' };
    }

    const { data: ownerProfile } = await supabase
        .from('user_app_profiles')
        .select('is_pro, payment_status')
        .eq('user_id', access.wedding.user_id)
        .maybeSingle();

    const isPremium = hasPlannerProAccess({
        isAdmin: isKnownAdminEmail(user.email),
        wedding: access.wedding,
        accountProfile: ownerProfile,
    });

    return {
        ok: true,
        customDomain: access.wedding.custom_domain ? String(access.wedding.custom_domain).trim().toLowerCase() : null,
        isPremium,
        userId: user.id,
    };
}

function parseWeddingId(value: string | null) {
    return sanitizeWeddingId(value || '') || null;
}

async function checkDomainRateLimit(req: NextRequest, weddingId: string) {
    const rateLimit = createRateLimitMiddleware('DOMAIN_MANAGEMENT');
    return rateLimit.check(`${getClientIP(req)}:${weddingId}`);
}

function isReservedPlatformDomain(domain: string) {
    const normalized = domain.trim().toLowerCase();
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site').split(':')[0].toLowerCase();
    return (
        normalized === rootDomain ||
        normalized === `www.${rootDomain}` ||
        normalized.endsWith(`.${rootDomain}`) ||
        normalized === 'quickweds.site' ||
        normalized.endsWith('.quickweds.site') ||
        normalized.endsWith('.vercel.app') ||
        normalized.endsWith('.vercel.pub') ||
        normalized === 'localhost' ||
        normalized.endsWith('.localhost')
    );
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const validation = validateRequest(domainSchema, body);
        const weddingId = parseWeddingId(typeof body?.weddingId === 'string' ? body.weddingId : null);

        if (!validation.success) {
            return NextResponse.json({ error: validation.errors }, { status: 400 });
        }

        if (!weddingId) {
            return NextResponse.json({ error: 'Valid weddingId is required' }, { status: 400 });
        }

        const limited = await checkDomainRateLimit(req, weddingId);
        if (limited.limited) return limited.response;

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

        const domain = validation.data.domain.trim().toLowerCase();

        if (isReservedPlatformDomain(domain)) {
            return NextResponse.json(
                { error: 'Platform domains cannot be connected as custom domains.' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdminClient() as any;
        const { data: existingWedding, error: existingError } = await supabase
            .from('weddings')
            .select('id')
            .eq('custom_domain', domain)
            .neq('id', weddingId)
            .is('deleted_at', null)
            .maybeSingle();

        if (existingError) {
            return NextResponse.json({ error: 'Failed to verify domain availability' }, { status: 500 });
        }

        if (existingWedding) {
            return NextResponse.json(
                { error: 'This domain is already connected to another wedding.' },
                { status: 409 }
            );
        }

        if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
            return NextResponse.json({ error: 'Vercel API keys are not configured in environment.' }, { status: 500 });
        }

        // Clean up any previous domain attached to this wedding so it isn't orphaned in Vercel
        if (access.customDomain && access.customDomain !== domain) {
            await fetch(
                `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${encodeURIComponent(access.customDomain)}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
                }
            ).catch(() => {});
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

        const { error: persistError } = await supabase
            .from('weddings')
            .update({ custom_domain: domain })
            .eq('id', weddingId);

        if (persistError) {
            // Best-effort rollback on Vercel
            await fetch(
                `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
                }
            ).catch(() => {});
            return NextResponse.json({ error: 'Failed to save custom domain to wedding record.' }, { status: 500 });
        }

        return NextResponse.json(data, { headers: limited.headers });
    } catch {
        return NextResponse.json({ error: 'Failed to add domain to Vercel' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const rawDomain = searchParams.get('domain');
        const weddingId = parseWeddingId(searchParams.get('weddingId'));

        if (!rawDomain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        if (!weddingId) {
            return NextResponse.json({ error: 'Valid weddingId is required' }, { status: 400 });
        }

        const limited = await checkDomainRateLimit(req, weddingId);
        if (limited.limited) return limited.response;

        const access = await verifyWeddingAccess(req, weddingId);
        if (!access.ok) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }

        if (!access.isPremium) {
            return NextResponse.json(
                { error: 'Planner Pro is required to manage a custom domain.' },
                { status: 403 }
            );
        }

        const domain = rawDomain.trim().toLowerCase();
        const validation = domainSchema.safeParse({ domain });
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        if (!access.customDomain || access.customDomain !== domain) {
            return NextResponse.json({ error: 'Domain does not belong to this wedding' }, { status: 403 });
        }

        if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
            return NextResponse.json({ error: 'Vercel API keys not configured.' }, { status: 500 });
        }

        const response = await fetch(
            `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}/config`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { headers: limited.headers });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch domain verification status' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawDomain = searchParams.get('domain');
    const weddingId = parseWeddingId(searchParams.get('weddingId'));

    if (!rawDomain) {
        return NextResponse.json({ error: 'Domain query param is required' }, { status: 400 });
    }

    if (!weddingId) {
        return NextResponse.json({ error: 'Valid weddingId is required' }, { status: 400 });
    }

    const limited = await checkDomainRateLimit(req, weddingId);
    if (limited.limited) return limited.response;

    const access = await verifyWeddingAccess(req, weddingId);
    if (!access.ok) {
        return NextResponse.json({ error: access.error }, { status: access.status });
    }

    if (!access.isPremium) {
        return NextResponse.json(
            { error: 'Planner Pro is required to manage a custom domain.' },
            { status: 403 }
        );
    }

    const domain = rawDomain.trim().toLowerCase();
    const validation = domainSchema.safeParse({ domain });
    if (!validation.success) {
        return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    if (!access.customDomain || access.customDomain !== domain) {
        return NextResponse.json({ error: 'Domain does not belong to this wedding' }, { status: 403 });
    }

    if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
        return NextResponse.json({ error: 'Vercel API keys not configured.' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                },
            }
        );

        const data = await response.json();
        if (data?.error && response.status !== 404) {
            return NextResponse.json(
                { error: data.error.message || 'Failed to delete custom domain from Vercel.' },
                { status: response.status }
            );
        }

        const supabase = getSupabaseAdminClient() as any;
        const { error: clearError } = await supabase
            .from('weddings')
            .update({ custom_domain: null })
            .eq('id', weddingId);

        if (clearError) {
            return NextResponse.json(
                { error: 'Domain removed from host, but failed to clear wedding record.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { headers: limited.headers });
    } catch {
        return NextResponse.json({ error: 'Failed to delete custom domain from Vercel.' }, { status: 500 });
    }
}

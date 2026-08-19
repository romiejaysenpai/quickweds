import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isAccountType, type AccountProfile } from '@/lib/account';

function getAccountAdminClientOrNull() {
    try {
        return getSupabaseAdminClient() as any;
    } catch {
        return null;
    }
}

function getAccountUserClient(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const authorization = req.headers.get('authorization') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase public configuration');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        global: {
            headers: { Authorization: authorization },
        },
    }) as any;
}

async function getExistingProfile(db: any, userId: string) {
    const { data, error } = await db
        .from('user_app_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw error;
    return data as AccountProfile | null;
}

async function ensureAccountProfile(db: any, userId: string) {
    const existing = await getExistingProfile(db, userId);
    if (existing) return existing;

    const { data, error } = await db
        .from('user_app_profiles')
        .insert({
            user_id: userId,
            onboarding_completed: false,
        })
        .select()
        .single();

    if (error) throw error;
    return data as AccountProfile;
}

async function addWeddingRouting(db: any, profile: AccountProfile, userId: string, email?: string | null) {
    const { data: owned, error: ownedError } = await db
        .from('weddings')
        .select('id, created_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(1);
    if (ownedError) throw ownedError;

    let weddingId = owned?.[0]?.id as string | undefined;
    if (!weddingId && email) {
        const { data: shared, error: sharedError } = await db
            .from('wedding_collaborators')
            .select('wedding_id')
            .eq('email', email.trim().toLowerCase())
            .eq('status', 'accepted')
            .limit(1);
        if (sharedError) throw sharedError;
        weddingId = shared?.[0]?.wedding_id as string | undefined;
    }

    return {
        ...profile,
        has_weddings: Boolean(weddingId),
        dashboard_path: weddingId ? `/dashboard/${weddingId}` : null,
    } satisfies AccountProfile;
}

export async function GET(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    try {
        const db = getAccountAdminClientOrNull() || getAccountUserClient(req);
        const profile = await addWeddingRouting(db, await ensureAccountProfile(db, user.id), user.id, user.email);

        return NextResponse.json({ profile });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load account profile';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    try {
        const body = await req.json();
        const accountType = body.account_type;
        const hasAccountType = Object.prototype.hasOwnProperty.call(body, 'account_type');
        const hasOnboardingCompleted = Object.prototype.hasOwnProperty.call(body, 'onboarding_completed');

        const allowedSurveyKeys = [
            'wedding_date',
            'wedding_date_status',
            'wedding_country',
            'wedding_city',
            'planning_stage',
            'primary_needs',
            'estimated_guest_count',
            'user_role',
            'acquisition_source',
            'onboarding_completed_at',
            'onboarding_draft',
        ] as const;

        const surveyUpdates: Record<string, any> = {};
        for (const key of allowedSurveyKeys) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                surveyUpdates[key] = body[key];
            }
        }

        const hasSurveyUpdates = Object.keys(surveyUpdates).length > 0;

        if (!hasAccountType && !hasOnboardingCompleted && !hasSurveyUpdates) {
            return NextResponse.json({ error: 'No profile updates were provided.' }, { status: 400 });
        }

        if (hasAccountType && !isAccountType(accountType)) {
            return NextResponse.json({ error: 'Choose either couple or supplier.' }, { status: 400 });
        }

        if (hasOnboardingCompleted && typeof body.onboarding_completed !== 'boolean') {
            return NextResponse.json({ error: 'Onboarding completion must be true or false.' }, { status: 400 });
        }

        const db = getAccountAdminClientOrNull() || getAccountUserClient(req);
        const existing = await getExistingProfile(db, user.id);

        if (hasAccountType && existing?.account_type && existing.account_type !== accountType) {
            return NextResponse.json(
                { error: 'This account already has an account type.' },
                { status: 409 }
            );
        }

        if (hasOnboardingCompleted && body.onboarding_completed && (existing?.account_type === 'supplier' || accountType === 'supplier')) {
            return NextResponse.json(
                { error: 'Supplier onboarding is not available in this flow.' },
                { status: 400 }
            );
        }

        const payload = {
            user_id: user.id,
            updated_at: new Date().toISOString(),
            ...(hasAccountType ? { account_type: accountType } : {}),
            ...(hasOnboardingCompleted ? { onboarding_completed: body.onboarding_completed } : {}),
            ...surveyUpdates,
        } as Partial<AccountProfile> & { user_id: string; updated_at: string };

        const { data, error: upsertError } = await db
            .from('user_app_profiles')
            .upsert(payload, { onConflict: 'user_id' })
            .select()
            .single();

        if (upsertError) throw upsertError;

        return NextResponse.json({ profile: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save account profile';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isAccountType, hasAccountPro, type AccountProfile } from '@/lib/account';
import { getPlannerUsage, hasPlannerProAccess, FREE_PLAN_LIMITS } from '@/lib/planner-limits';

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
        .upsert(
            {
                user_id: userId,
                onboarding_completed: false,
            },
            { onConflict: 'user_id', ignoreDuplicates: true }
        )
        .select()
        .maybeSingle();

    if (error && error.code !== '23505') throw error;
    if (data) return data as AccountProfile;

    const refetched = await getExistingProfile(db, userId);
    if (!refetched) throw new Error('Unable to initialize account profile');
    return refetched;
}

async function addWeddingRouting(
    db: any,
    profile: AccountProfile,
    userId: string,
    email?: string | null,
    preloadedOwnedWeddingId?: string
) {
    let weddingId = preloadedOwnedWeddingId;
    if (weddingId === undefined) {
        const { data: owned, error: ownedError } = await db
            .from('weddings')
            .select('id, created_at')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: true })
            .limit(1);
        if (ownedError) throw ownedError;
        weddingId = owned?.[0]?.id as string | undefined;
    }

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
        const includeUsage = req.nextUrl.searchParams.get('includeUsage') !== 'false';
        const db = getAccountAdminClientOrNull() || getAccountUserClient(req);

        if (!includeUsage) {
            const baseProfile = await ensureAccountProfile(db, user.id);
            const profile = await addWeddingRouting(db, baseProfile, user.id, user.email);
            return NextResponse.json({ profile });
        }

        const [baseProfile, ownedWeddingsRes] = await Promise.all([
            ensureAccountProfile(db, user.id),
            db
                .from('weddings')
                .select('id, bride_name, groom_name, is_premium, payment_status, created_at')
                .eq('user_id', user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: true }),
        ]);

        if (ownedWeddingsRes.error) throw ownedWeddingsRes.error;

        const weddingsList = ownedWeddingsRes.data || [];
        const firstOwnedId = weddingsList[0]?.id as string | undefined;
        const profile = await addWeddingRouting(
            db,
            baseProfile,
            user.id,
            user.email,
            firstOwnedId || ''
        );

        const isAccPro = hasAccountPro(profile);

        const weddingSummaries = await Promise.all(
            weddingsList.map(async (w: any) => {
                const usage = await getPlannerUsage(db, w.id);
                const hasPro = isAccPro || hasPlannerProAccess({ wedding: w, accountProfile: profile });
                const emailLimit = hasPro ? 'unlimited' : FREE_PLAN_LIMITS.userTriggeredEmails;
                const emailsRemaining = hasPro
                    ? 'unlimited'
                    : Math.max(0, FREE_PLAN_LIMITS.userTriggeredEmails - usage.userTriggeredEmailsUsed);
                const displayName =
                    w.bride_name && w.groom_name
                        ? `${w.bride_name} & ${w.groom_name}`
                        : w.bride_name || w.groom_name || 'My Wedding';

                return {
                    id: w.id,
                    wedding_name: displayName,
                    is_premium: Boolean(w.is_premium),
                    payment_status: w.payment_status || null,
                    has_pro: hasPro,
                    guest_email_count: usage.guestEmailCount,
                    user_triggered_emails_used: usage.userTriggeredEmailsUsed,
                    user_triggered_emails_remaining: emailsRemaining,
                    user_triggered_emails_limit: emailLimit,
                    planner_usage: usage,
                };
            })
        );

        const usageSummary = {
            is_account_pro: isAccPro,
            active_weddings_count: weddingsList.length,
            active_weddings_limit: isAccPro ? 'unlimited' : 3,
            weddings: weddingSummaries,
        };

        return NextResponse.json({ profile, usageSummary });
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

        if (!hasAccountType && !hasOnboardingCompleted) {
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
            let hasWeddings = false;
            if (!existing.onboarding_completed) {
                const { count } = await db
                    .from('weddings')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .is('deleted_at', null);
                hasWeddings = (count ?? 0) > 0;
            }

            if (existing.onboarding_completed || hasWeddings) {
                return NextResponse.json(
                    { error: 'This account already has an account type.' },
                    { status: 409 }
                );
            }
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

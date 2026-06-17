import { getMarketingNurtureEmail, getMarketingNurtureStepCount, sendEmail } from '@/lib/email';

const DAY_MS = 24 * 60 * 60 * 1000;
const NEXT_STEP_DELAYS_IN_DAYS = [0, 2, 3, 4, 5, 7];
const FAILED_RETRY_DELAY_MS = 60 * 60 * 1000;

type AuthUser = {
    id: string;
    email?: string | null;
    created_at?: string | null;
    user_metadata?: Record<string, unknown> | null;
};

type UserProfile = {
    user_id: string;
    account_type?: string | null;
    is_pro?: boolean | null;
    payment_status?: string | null;
};

type Subscriber = {
    user_id: string;
    email: string;
    unsubscribe_token: string;
    sequence_step: number;
    status: 'active' | 'completed' | 'converted' | 'unsubscribed' | 'bounced';
};

export type MarketingNurtureRunOptions = {
    dryRun?: boolean;
    limit?: number;
};

export type MarketingNurtureRunResult = {
    success: true;
    dryRun: boolean;
    enrolled: number;
    due: number;
    sent: number;
    completed: number;
    converted: number;
    errors: string[];
};

function getAppUrl() {
    return (process.env.NEXT_PUBLIC_APP_URL || 'https://www.quickweds.site').replace(/\/+$/, '');
}

function getRunLimit(input?: number) {
    const envLimit = Number(process.env.MARKETING_NURTURE_SEND_LIMIT || 200);
    const requested = Number(input || envLimit);
    if (!Number.isFinite(requested) || requested <= 0) return 200;
    return Math.min(Math.floor(requested), 200);
}

function isValidEmail(email: unknown) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isProProfile(profile?: UserProfile | null) {
    return Boolean(profile?.is_pro) || profile?.payment_status === 'paid';
}

function getUserName(user?: AuthUser | null) {
    const metadata = user?.user_metadata || {};
    const name = metadata.full_name || metadata.name || metadata.first_name;
    if (typeof name === 'string' && name.trim()) return name.trim().split(/\s+/)[0];
    const emailName = user?.email?.split('@')[0]?.replace(/[._-]+/g, ' ');
    return emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'there';
}

function getNextSendAt(step: number) {
    const delayDays = NEXT_STEP_DELAYS_IN_DAYS[step] ?? NEXT_STEP_DELAYS_IN_DAYS[NEXT_STEP_DELAYS_IN_DAYS.length - 1];
    return new Date(Date.now() + delayDays * DAY_MS).toISOString();
}

function getFailedRetryAt() {
    return new Date(Date.now() + FAILED_RETRY_DELAY_MS).toISOString();
}

async function listAllAuthUsers(db: any) {
    const users: AuthUser[] = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage });
        if (error) throw error;

        const batch = data?.users || [];
        users.push(...batch);
        if (batch.length < perPage) return users;
        page += 1;
    }
}

async function getProfilesByUserId(db: any, userIds: string[]) {
    const profiles = new Map<string, UserProfile>();
    if (userIds.length === 0) return profiles;

    for (let index = 0; index < userIds.length; index += 500) {
        const chunk = userIds.slice(index, index + 500);
        const { data, error } = await db
            .from('user_app_profiles')
            .select('user_id, account_type, is_pro, payment_status')
            .in('user_id', chunk);

        if (error) throw error;
        for (const profile of data || []) profiles.set(profile.user_id, profile);
    }

    return profiles;
}

async function enrollEligibleUsers(db: any, users: AuthUser[], profiles: Map<string, UserProfile>, dryRun: boolean) {
    const rows = users
        .filter((user) => user.id && isValidEmail(user.email))
        .filter((user) => {
            const profile = profiles.get(user.id);
            return !isProProfile(profile) && profile?.account_type !== 'supplier';
        })
        .map((user) => ({
            user_id: user.id,
            email: String(user.email).trim().toLowerCase(),
            status: 'active',
            sequence_step: 0,
            next_send_at: new Date().toISOString(),
            unsubscribe_token: crypto.randomUUID(),
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));

    if (dryRun || rows.length === 0) return rows.length;

    let enrolled = 0;
    for (let index = 0; index < rows.length; index += 500) {
        const chunk = rows.slice(index, index + 500);
        const { data, error } = await db
            .from('marketing_nurture_subscribers')
            .upsert(chunk, { onConflict: 'user_id', ignoreDuplicates: true })
            .select('user_id');

        if (error) throw error;
        enrolled += data?.length || 0;
    }

    return enrolled;
}

async function getDueSubscribers(db: any, limit: number) {
    const { data, error } = await db
        .from('marketing_nurture_subscribers')
        .select('user_id, email, unsubscribe_token, sequence_step, status')
        .eq('status', 'active')
        .lte('next_send_at', new Date().toISOString())
        .order('next_send_at', { ascending: true })
        .limit(limit);

    if (error) throw error;
    return (data || []) as Subscriber[];
}

async function markConvertedProfiles(db: any, dueSubscribers: Subscriber[], profiles: Map<string, UserProfile>, dryRun: boolean) {
    const converted = dueSubscribers
        .filter((subscriber) => isProProfile(profiles.get(subscriber.user_id)))
        .map((subscriber) => subscriber.user_id);

    if (!dryRun && converted.length > 0) {
        const { error } = await db
            .from('marketing_nurture_subscribers')
            .update({
                status: 'converted',
                converted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .in('user_id', converted);

        if (error) throw error;
    }

    return new Set(converted);
}

export async function runMarketingNurture(db: any, options: MarketingNurtureRunOptions = {}): Promise<MarketingNurtureRunResult> {
    const dryRun = Boolean(options.dryRun);
    const limit = getRunLimit(options.limit);
    const appUrl = getAppUrl();
    const stepCount = getMarketingNurtureStepCount();

    const users = await listAllAuthUsers(db);
    const authUserById = new Map(users.map((user) => [user.id, user]));
    const authProfiles = await getProfilesByUserId(db, users.map((user) => user.id));
    const enrolled = await enrollEligibleUsers(db, users, authProfiles, dryRun);
    const dueSubscribers = await getDueSubscribers(db, limit);
    const dueProfiles = await getProfilesByUserId(db, dueSubscribers.map((subscriber) => subscriber.user_id));
    const convertedUsers = await markConvertedProfiles(db, dueSubscribers, dueProfiles, dryRun);

    let sent = 0;
    let completed = 0;
    const errors: string[] = [];

    for (const subscriber of dueSubscribers) {
        if (convertedUsers.has(subscriber.user_id)) continue;

        if (subscriber.sequence_step >= stepCount) {
            completed += 1;
            if (!dryRun) {
                await db
                    .from('marketing_nurture_subscribers')
                    .update({ status: 'completed', updated_at: new Date().toISOString() })
                    .eq('user_id', subscriber.user_id);
            }
            continue;
        }

        const user = authUserById.get(subscriber.user_id);
        const unsubscribeUrl = `${appUrl}/api/marketing/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
        const email = getMarketingNurtureEmail({
            userName: getUserName(user),
            appUrl,
            unsubscribeUrl,
            step: subscriber.sequence_step,
        });

        if (dryRun) {
            sent += 1;
            continue;
        }

        const result = await sendEmail({
            to: subscriber.email,
            subject: email.subject,
            html: email.html,
        });

        const now = new Date().toISOString();
        await db.from('marketing_nurture_events').insert({
            user_id: subscriber.user_id,
            email: subscriber.email,
            sequence_step: subscriber.sequence_step,
            subject: email.subject,
            status: result.success ? 'sent' : 'failed',
            provider_message_id: result.success ? result.id || null : null,
            error_message: result.success ? null : result.error || 'Email send failed',
            created_at: now,
        });

        if (result.success) {
            sent += 1;
            const nextStep = subscriber.sequence_step + 1;
            const hasMore = nextStep < stepCount;
            const { error } = await db
                .from('marketing_nurture_subscribers')
                .update({
                    sequence_step: nextStep,
                    last_sent_at: now,
                    next_send_at: hasMore ? getNextSendAt(nextStep) : null,
                    status: hasMore ? 'active' : 'completed',
                    completed_at: hasMore ? null : now,
                    updated_at: now,
                })
                .eq('user_id', subscriber.user_id);

            if (error) throw error;
        } else {
            await db
                .from('marketing_nurture_subscribers')
                .update({
                    next_send_at: getFailedRetryAt(),
                    updated_at: now,
                })
                .eq('user_id', subscriber.user_id);
            errors.push(`${subscriber.email}: ${result.error || 'send failed'}`);
        }
    }

    return {
        success: true,
        dryRun,
        enrolled,
        due: dueSubscribers.length,
        sent,
        completed,
        converted: convertedUsers.size,
        errors: errors.slice(0, 25),
    };
}

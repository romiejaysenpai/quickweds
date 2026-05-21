export type AccountType = 'couple' | 'supplier';

export type AccountProfile = {
    user_id: string;
    account_type: AccountType | null;
    onboarding_completed: boolean;
    is_pro?: boolean | null;
    plan_type?: string | null;
    payment_status?: string | null;
    payment_amount?: number | null;
    stripe_payment_intent_id?: string | null;
    stripe_checkout_session_id?: string | null;
    pro_unlocked_at?: string | null;
    created_at?: string;
    updated_at?: string;
};

export const ACCOUNT_ONBOARDING_PATH = '/onboarding/account-type';

export function isAccountType(value: unknown): value is AccountType {
    return value === 'couple' || value === 'supplier';
}

export function getSafeAppPath(value: string | null | undefined, fallback = '/dashboard') {
    if (!value) return fallback;
    return value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export function getDefaultRoleRedirect(accountType?: AccountType | null) {
    if (accountType === 'supplier') return '/supplier/dashboard';
    if (accountType === 'couple') return '/dashboard';
    return ACCOUNT_ONBOARDING_PATH;
}

export function hasAccountPro(profile?: Pick<AccountProfile, 'is_pro' | 'payment_status' | 'plan_type'> | null) {
    const planType = String(profile?.plan_type || '').toLowerCase();
    return ['pro', 'unlimited', 'custom', 'enterprise', 'admin'].includes(planType)
        || Boolean(profile?.is_pro)
        || profile?.payment_status === 'paid';
}

export function hasSupplierIntent(path?: string | null) {
    const safePath = getSafeAppPath(path, '');
    return safePath === '/supplier' || safePath.startsWith('/supplier/');
}

export function isPathAllowedForAccountType(path: string, accountType: AccountType) {
    const safePath = getSafeAppPath(path, getDefaultRoleRedirect(accountType));

    if (safePath.startsWith(ACCOUNT_ONBOARDING_PATH)) return true;
    if (safePath.startsWith('/suppliers')) return true;

    if (accountType === 'supplier') {
        return safePath.startsWith('/supplier');
    }

    return !safePath.startsWith('/supplier');
}

export function getRoleAwareRedirect(accountType?: AccountType | null, requestedPath?: string | null) {
    if (!accountType) {
        const safeNext = getSafeAppPath(requestedPath, '');
        return safeNext ? `${ACCOUNT_ONBOARDING_PATH}?next=${encodeURIComponent(safeNext)}` : ACCOUNT_ONBOARDING_PATH;
    }

    const defaultPath = getDefaultRoleRedirect(accountType);
    const safeNext = getSafeAppPath(requestedPath, defaultPath);

    return isPathAllowedForAccountType(safeNext, accountType) ? safeNext : defaultPath;
}

export async function getClientAccountProfile(token: string) {
    const response = await fetch('/api/account/profile', {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!response.ok) {
        const message = data.error || 'Unable to load account profile';
        if (response.status === 401 || String(message).toLowerCase().includes('auth session missing')) {
            throw new Error('Please sign in again to continue.');
        }
        throw new Error(message);
    }

    return data.profile as AccountProfile | null;
}

export async function setClientAccountType(token: string, accountType: AccountType) {
    const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ account_type: accountType }),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Unable to save account type');
    }

    return data.profile as AccountProfile;
}

export async function getClientAccountProfileForIntent(token: string, requestedPath?: string | null) {
    const profile = await getClientAccountProfile(token);

    if (!profile?.account_type && hasSupplierIntent(requestedPath)) {
        return setClientAccountType(token, 'supplier');
    }

    return profile;
}

export async function getClientAdminStatus(token: string) {
    const response = await fetch('/api/auth/check-admin', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return false;

    const data = await response.json().catch(() => ({}));
    return Boolean(data?.isAdmin);
}

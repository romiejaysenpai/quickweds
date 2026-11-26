import 'server-only';

export function getAdminEmails(): string[] {
    const raw = [
        process.env.ADMIN_EMAIL,
        ...(process.env.ADMIN_EMAILS || '').split(','),
    ];

    return Array.from(
        new Set(
            raw
                .filter(Boolean)
                .map((email) => email!.trim().toLowerCase())
                .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        )
    );
}

export function isKnownAdminEmail(email?: string | null) {
    if (!email) return false;
    return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getPrimaryAdminEmail() {
    return getAdminEmails()[0] || '';
}

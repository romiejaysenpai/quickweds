import 'server-only';

const KNOWN_ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL,
    ...(process.env.ADMIN_EMAILS || '').split(','),
]
    .filter(Boolean)
    .map((email) => email!.trim().toLowerCase());

export function isKnownAdminEmail(email?: string | null) {
    if (!email) return false;
    return KNOWN_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function getPrimaryAdminEmail() {
    return KNOWN_ADMIN_EMAILS[0] || '';
}

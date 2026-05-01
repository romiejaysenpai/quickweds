const KNOWN_ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    'romiejaybacasmas@gmail.com',
    'romiejaysenpai@gmail.com',
]
    .filter(Boolean)
    .map((email) => email!.trim().toLowerCase());

export function isKnownAdminEmail(email?: string | null) {
    if (!email) return false;
    return KNOWN_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Shared RSVP deadline logic used by the public wedding page, the public RSVP API,
 * and the dashboard so they all agree on when RSVPs close.
 *
 * Deadlines are usually stored as date-only strings (YYYY-MM-DD). `new Date('2026-10-06')`
 * parses as UTC midnight, which closed RSVPs at the *start* of the deadline day (and the
 * evening before for guests west of UTC). We instead treat a date-only deadline as
 * "open through the end of that calendar day everywhere on earth" (end of day in UTC-12).
 */
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getRsvpDeadlineCutoff(deadline: unknown): Date | null {
    if (typeof deadline !== 'string') return null;
    const value = deadline.trim();
    if (!value) return null;

    const dateOnly = DATE_ONLY.exec(value.slice(0, 10));
    if (dateOnly && value.length <= 10) {
        const [, y, m, d] = dateOnly;
        // Start of the following day in UTC-12 == next day 12:00 UTC.
        return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d) + 1, 12, 0, 0));
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isRsvpDeadlineExpired(deadline: unknown, now: Date = new Date()): boolean {
    const cutoff = getRsvpDeadlineCutoff(deadline);
    if (!cutoff) return false;
    return now >= cutoff;
}

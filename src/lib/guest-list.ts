import type { RSVP } from '@/types/wedding';

export const GUEST_GROUP_OPTIONS = [
    { value: 'bride_family', label: "Bride's Family" },
    { value: 'groom_family', label: "Groom's Family" },
    { value: 'bride_friends', label: "Bride's Friends" },
    { value: 'groom_friends', label: "Groom's Friends" },
    { value: 'mutual', label: 'Mutual Friends' },
    { value: 'coworkers', label: 'Coworkers' },
    { value: 'vip', label: 'VIP' },
    { value: 'vendors', label: 'Vendors' },
] as const;

export type GuestGroup = (typeof GUEST_GROUP_OPTIONS)[number]['value'];

export const PLUS_ONE_STATUS_OPTIONS = [
    { value: 'not_invited', label: 'Not Invited' },
    { value: 'invited', label: 'Invited' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'declined', label: 'Declined' },
] as const;

export type PlusOneRsvpStatus = (typeof PLUS_ONE_STATUS_OPTIONS)[number]['value'];

export type EnhancedRSVP = RSVP & {
    rsvp_status?: string | null;
    manual_entry?: boolean | null;
    guest_group?: GuestGroup | null;
    table_assignment?: string | null;
    invitation_sent?: boolean | null;
    invitation_sent_at?: string | null;
    plus_one_allowed?: boolean | null;
    plus_one_name?: string | null;
    plus_one_email?: string | null;
    plus_one_rsvp_status?: PlusOneRsvpStatus | null;
};

export type ImportedGuestRow = {
    guest_name: string;
    guest_email: string | null;
    rsvp_status: 'pending' | 'confirmed' | 'declined';
    attendance: 'Yes' | 'No' | null;
    num_guests: number;
    guest_group: GuestGroup | null;
    table_assignment: string | null;
    invitation_sent: boolean;
    invitation_sent_at: string | null;
    plus_one_allowed: boolean;
    plus_one_name: string | null;
    plus_one_email: string | null;
    plus_one_rsvp_status: PlusOneRsvpStatus;
    manual_entry: boolean;
};

const headerAliases: Record<string, string[]> = {
    guest_name: ['guest name', 'name', 'full name', 'guest'],
    guest_email: ['guest email', 'email', 'email address'],
    rsvp_status: ['status', 'rsvp status', 'attendance status', 'response'],
    attendance: ['attendance', 'will attend'],
    num_guests: ['guests', 'party size', 'number of guests', 'guest count'],
    guest_group: ['group', 'guest group', 'side'],
    table_assignment: ['table', 'table assignment', 'table name', 'seat table'],
    invitation_sent: ['invitation sent', 'invite sent', 'sent'],
    invitation_sent_at: ['invitation sent at', 'sent at', 'invite sent at'],
    plus_one_allowed: ['plus one allowed', 'plus one', '+1 allowed'],
    plus_one_name: ['plus one name', '+1 name', 'guest companion'],
    plus_one_email: ['plus one email', '+1 email'],
    plus_one_rsvp_status: ['plus one status', '+1 status', 'companion status'],
};

export function getGuestGroupLabel(group?: string | null) {
    if (!group) return 'Ungrouped';
    return GUEST_GROUP_OPTIONS.find((option) => option.value === group)?.label || group;
}

export function getPlusOneStatusLabel(status?: string | null) {
    if (!status) return 'Not Invited';
    return PLUS_ONE_STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
}

export function normalizeGuestGroup(value: string | null | undefined): GuestGroup | null {
    if (!value) return null;
    const normalized = value.trim().toLowerCase().replace(/[\s'-]+/g, '_');
    if (GUEST_GROUP_OPTIONS.some((option) => option.value === normalized)) {
        return normalized as GuestGroup;
    }
    return null;
}

export function normalizePlusOneStatus(value: string | null | undefined): PlusOneRsvpStatus {
    if (!value) return 'not_invited';
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (PLUS_ONE_STATUS_OPTIONS.some((option) => option.value === normalized)) {
        return normalized as PlusOneRsvpStatus;
    }
    return 'not_invited';
}

export function normalizeRsvpStatus(value: string | null | undefined): 'pending' | 'confirmed' | 'declined' {
    const normalized = value?.trim().toLowerCase() || '';
    if (['yes', 'confirmed', 'attending', 'going'].includes(normalized)) return 'confirmed';
    if (['no', 'declined', 'not attending', 'cannot attend'].includes(normalized)) return 'declined';
    return 'pending';
}

export function statusToAttendance(status: 'pending' | 'confirmed' | 'declined'): 'Yes' | 'No' | null {
    if (status === 'confirmed') return 'Yes';
    if (status === 'declined') return 'No';
    return null;
}

export function parseBoolean(value: string | null | undefined) {
    const normalized = value?.trim().toLowerCase() || '';
    return ['true', 'yes', '1', 'sent', 'y'].includes(normalized);
}

export function parseInteger(value: string | null | undefined, fallback = 1) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function escapeCsvCell(value: unknown) {
    const stringValue = value == null ? '' : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
}

export function parseCsv(text: string) {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i += 1;
            }
            currentRow.push(currentCell.trim());
            if (currentRow.some((cell) => cell.length > 0)) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
            continue;
        }

        currentCell += char;
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
            rows.push(currentRow);
        }
    }

    return rows;
}

export function inferGuestImportMapping(headers: string[]) {
    const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
    const mapping: Record<string, string> = {};

    Object.entries(headerAliases).forEach(([field, aliases]) => {
        const matchIndex = normalizedHeaders.findIndex((header) => aliases.includes(header));
        if (matchIndex >= 0) {
            mapping[field] = headers[matchIndex];
        }
    });

    return mapping;
}

export function buildImportedGuestRows(headers: string[], rows: string[][], mapping: Record<string, string>) {
    const indexMap = new Map(headers.map((header, index) => [header, index]));

    return rows
        .map((row) => {
            const read = (field: string) => {
                const header = mapping[field];
                if (!header) return '';
                const index = indexMap.get(header);
                return typeof index === 'number' ? row[index] || '' : '';
            };

            const guest_name = read('guest_name').trim();
            if (!guest_name) return null;

            const explicitAttendance = read('attendance').trim();
            const status = normalizeRsvpStatus(read('rsvp_status') || explicitAttendance);
            const invitationSent = parseBoolean(read('invitation_sent'));
            const invitationSentAtRaw = read('invitation_sent_at').trim();
            const numGuests = parseInteger(read('num_guests'), 1);
            const plusOneName = read('plus_one_name').trim();
            const plusOneEmail = read('plus_one_email').trim();
            const plusOneAllowed = parseBoolean(read('plus_one_allowed')) || Boolean(plusOneName || plusOneEmail || numGuests > 1);

            return {
                guest_name,
                guest_email: read('guest_email').trim() || null,
                rsvp_status: status,
                attendance: explicitAttendance
                    ? explicitAttendance.toLowerCase() === 'yes'
                        ? 'Yes'
                        : explicitAttendance.toLowerCase() === 'no'
                            ? 'No'
                            : statusToAttendance(status)
                    : statusToAttendance(status),
                num_guests: numGuests,
                guest_group: normalizeGuestGroup(read('guest_group')),
                table_assignment: read('table_assignment').trim() || null,
                invitation_sent: invitationSent,
                invitation_sent_at: invitationSent
                    ? invitationSentAtRaw || new Date().toISOString()
                    : null,
                plus_one_allowed: plusOneAllowed,
                plus_one_name: plusOneName || null,
                plus_one_email: plusOneEmail || null,
                plus_one_rsvp_status: normalizePlusOneStatus(read('plus_one_rsvp_status')),
                manual_entry: true,
            } satisfies ImportedGuestRow;
        })
        .filter((row): row is NonNullable<typeof row> => row !== null) as ImportedGuestRow[];
}

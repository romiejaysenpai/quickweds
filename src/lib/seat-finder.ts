import { randomBytes } from 'crypto';

export type SeatFinderRsvp = {
    id: string;
    wedding_id: string;
    guest_name: string;
    guest_email?: string | null;
    phone?: string | null;
    rsvp_status?: string | null;
    attendance?: string | null;
    num_guests?: number | null;
    table_assignment?: string | null;
    plus_one_allowed?: boolean | null;
    plus_one_name?: string | null;
    plus_one_rsvp_status?: string | null;
    seat_lookup_token?: string | null;
    guest_code?: string | null;
    seat_link_sent_at?: string | null;
    seat_link_last_sent_at?: string | null;
    seat_assignment_version?: number | null;
    checked_in_at?: string | null;
};

export function getAppBaseUrl(requestUrl?: string) {
    const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (configured) return configured.replace(/\/+$/, '');
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '');
    if (requestUrl) {
        const url = new URL(requestUrl);
        return `${url.protocol}//${url.host}`;
    }
    return 'http://localhost:3000';
}

export function makeSeatLookupToken() {
    return randomBytes(24).toString('base64url');
}

export function makeGuestCode(name?: string | null) {
    const prefix = String(name || 'GUEST')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randomPart = Array.from(randomBytes(6))
        .map((byte) => alphabet[byte % alphabet.length])
        .join('');
    return `${prefix}-${randomPart}`;
}

export function isAttendingGuest(guest: Pick<SeatFinderRsvp, 'rsvp_status' | 'attendance'>) {
    return guest.rsvp_status === 'confirmed' || guest.rsvp_status === 'confirmed_manual' || guest.attendance === 'Yes';
}

export function getSeatFinderPartySize(guest?: Pick<SeatFinderRsvp, 'num_guests' | 'plus_one_allowed' | 'plus_one_name' | 'plus_one_rsvp_status'> | null) {
    const explicitCount = Number(guest?.num_guests || 0);
    if (Number.isFinite(explicitCount) && explicitCount > 1) return Math.floor(explicitCount);
    const plusOneCounts = Boolean(guest?.plus_one_allowed && guest?.plus_one_name) && guest?.plus_one_rsvp_status !== 'declined';
    return plusOneCounts ? 2 : 1;
}

export function escapeHtml(value: unknown) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getSeatFinderErrorText(error: unknown) {
    if (!error) return '';
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
        const value = error as Record<string, unknown>;
        return [value.message, value.details, value.hint, value.code]
            .filter(Boolean)
            .map((item) => String(item))
            .join(' ');
    }
    return String(error);
}

export function isSeatFinderSchemaError(error: unknown) {
    const code = typeof error === 'object' && error ? String((error as Record<string, unknown>).code || '') : '';
    const text = getSeatFinderErrorText(error).toLowerCase();
    return (
        ['42703', '42P01', 'PGRST200', 'PGRST204', 'PGRST205'].includes(code) ||
        text.includes('schema cache') ||
        text.includes('could not find') ||
        text.includes('does not exist') ||
        text.includes('column')
    );
}

export function getSeatFinderApiError(error: unknown, fallback: string) {
    if (isSeatFinderSchemaError(error)) {
        return 'QR Seat Finder database setup is missing. Run supabase-seat-finder.sql in Supabase SQL Editor for the same project, then run notify pgrst, reload schema or wait a minute and refresh.';
    }
    return getSeatFinderErrorText(error) || fallback;
}

export function getSeatFinderErrorPayload(error: unknown, fallback: string) {
    const message = getSeatFinderApiError(error, fallback);
    const raw = getSeatFinderErrorText(error);
    return {
        error: message,
        details: raw && raw !== message ? raw : undefined,
    };
}

export function getSeatEmailHtml({
    guestName,
    weddingName,
    tableName,
    seatLabel,
    guestCode,
    seatUrl,
}: {
    guestName: string;
    weddingName: string;
    tableName: string;
    seatLabel?: string | null;
    guestCode: string;
    seatUrl: string;
}) {
    const qrUrl = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(seatUrl)}`;
    const safeWeddingName = escapeHtml(weddingName);
    const safeTableName = escapeHtml(tableName);
    const safeSeatLabel = seatLabel ? escapeHtml(seatLabel) : '';

    return `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; color: #3A2A2D;">
            <p style="margin: 0 0 8px; color: #D16C78; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px;">QuickWeds Seat Finder</p>
            <h1 style="margin: 0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 30px; line-height: 1.15; letter-spacing: -0.3px;">Your seat is ready</h1>
            <p style="font-size: 16px; line-height: 1.7; color: #7A5A61;">Hi ${escapeHtml(guestName)}, here is your seating information for ${safeWeddingName}.</p>
            <div style="border: 1px solid #F1D6DA; border-radius: 18px; padding: 20px; background: #FFF8F9; margin: 24px 0;">
                <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #9B6670; font-weight: 800;">Table</p>
                <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 30px; line-height: 1.2;">${safeTableName}</p>
                ${safeSeatLabel ? `<p style="margin: 8px 0 0; color: #7A5A61;">${safeSeatLabel}</p>` : ''}
            </div>
            <p style="text-align: center; margin: 28px 0 12px;">
                <img src="${qrUrl}" alt="Seat finder QR code" width="220" height="220" style="display: inline-block; border: 1px solid #eee; border-radius: 16px;" />
            </p>
            <p style="margin: 16px 0; text-align: center; color: #7A5A61; font-size: 14px; line-height: 1.7;">Backup guest code: <strong>${escapeHtml(guestCode)}</strong></p>
            <p style="margin: 28px 0; text-align: center;">
                <a href="${seatUrl}" style="display: inline-block; background: #D16C78; color: #fff; padding: 14px 20px; border-radius: 12px; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.02em;">View My Seat</a>
            </p>
            <div style="border-top: 1px solid #F1D6DA; margin-top: 24px; padding-top: 18px;">
                <p style="margin: 0 0 10px; font-size: 13px; line-height: 1.6; color: #7A5A61; font-weight: 700;">How to use this at the event</p>
                <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.6; color: #9b7b82;">1. Save this email or take a screenshot of the QR code before arriving.</p>
                <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.6; color: #9b7b82;">2. Show the QR code to reception or check-in staff so they can scan it and mark your party as arrived.</p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9b7b82;">3. If the QR will not scan, staff can type your backup guest code: <strong>${escapeHtml(guestCode)}</strong>.</p>
            </div>
        </div>
    `;
}

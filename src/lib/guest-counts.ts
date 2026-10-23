export type GuestAttendance = { attendance?: string | null; rsvp_status?: string | null; num_guests?: number | null; plus_one_allowed?: boolean | null; plus_one_name?: string | null; plus_one_rsvp_status?: string | null };
export function isGuestAttending(guest?: GuestAttendance | null) {
    if (!guest || guest.attendance === 'No') return false;
    return guest.attendance === 'Yes' || guest.rsvp_status === 'confirmed' || guest.rsvp_status === 'confirmed_manual';
}
export function guestPartySize(guest?: GuestAttendance | null) {
    if (!guest) return 0;
    if (guest.attendance === 'No' || (guest.rsvp_status === 'declined' && guest.attendance !== 'Yes')) return 0;
    const count = Number(guest.num_guests || 0);
    if (Number.isFinite(count) && count > 1) return Math.floor(count);
    return guest.plus_one_allowed && guest.plus_one_name && guest.plus_one_rsvp_status !== 'declined' ? 2 : 1;
}

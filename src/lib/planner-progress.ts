import {
  guestPartySize,
  isGuestAttending,
  type GuestAttendance,
} from "./guest-counts";

type CateringGuest = GuestAttendance & {
  id: string;
  guest_name?: string;
  meal_preference?: string;
  dietary_details?: string;
  children_count?: number;
  event_responses?: Array<{ eventId: string; attendance: string }>;
};
/** A meal preference describes one RSVP party; it is not a per-person meal order. */
export function summarizeCatering(guests: CateringGuest[], eventId?: string) {
  const attendees = guests.filter(
    (guest) =>
      isGuestAttending(guest) &&
      (!eventId ||
        guest.event_responses?.some(
          (event) => event.eventId === eventId && event.attendance === "Yes",
        )),
  );
  return {
    parties: attendees.length,
    people: attendees.reduce(
      (total, guest) => total + guestPartySize(guest),
      0,
    ),
    children: attendees.reduce(
      (total, guest) =>
        total +
        Math.min(
          guestPartySize(guest),
          Math.max(0, Number(guest.children_count) || 0),
        ),
      0,
    ),
    rows: attendees.map((guest) => ({
      name: guest.guest_name || "Guest",
      people: guestPartySize(guest),
      children: Math.min(
        guestPartySize(guest),
        Math.max(0, Number(guest.children_count) || 0),
      ),
      preference: guest.meal_preference || "Not specified",
      dietary: guest.dietary_details || "",
    })),
    unresolved: guests.filter((guest) =>
      eventId
        ? guest.attendance !== "No" && guest.rsvp_status !== "declined" && !guest.event_responses?.some(
            (event) => event.eventId === eventId && ["Yes", "No"].includes(event.attendance),
          )
        : !isGuestAttending(guest) &&
          guest.attendance !== "No" &&
          guest.rsvp_status !== "declined",
    ).length,
  };
}
export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return (
    '"' +
    (/^[\s]*[=+\-@\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""') +
    '"'
  );
}

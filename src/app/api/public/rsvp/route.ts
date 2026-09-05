import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { rsvpSubmissionSchema } from "@/lib/validations";
import {
  createRateLimitMiddleware,
  getClientIP,
  sanitizeInput,
} from "@/lib/rate-limit";
import { sendRsvpNotifications } from "@/lib/rsvp-notifications";
import { invalidateDashboardCounters } from "@/lib/dashboard-counters";
import { makeGuestCode, makeSeatLookupToken } from "@/lib/seat-finder";
import { isRsvpClosed } from "@/lib/event-time";

export async function POST(req: NextRequest) {
  const parsed = rsvpSubmissionSchema.safeParse(
    await req.json().catch(() => ({})),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues.map((issue) => issue.message).join(", ") },
      { status: 400 },
    );
  const input = parsed.data;
  const limit = await createRateLimitMiddleware("RSVP_SUBMIT").check(
    `${getClientIP(req)}:${input.weddingId}`,
  );
  if (limit.limited) return limit.response;
  const db = getSupabaseAdminClient() as any;
  let claim = "";
  let saved = false;
  try {
    const { data: wedding, error } = await db
      .from("weddings")
      .select("*")
      .eq("id", input.weddingId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!wedding?.is_published)
      return NextResponse.json(
        { error: "Invitation unavailable." },
        { status: 404 },
      );
    if (isRsvpClosed(wedding.rsvp_deadline, wedding.event_timezone || "UTC"))
      return NextResponse.json(
        {
          error: `Responses are closed. Please contact ${wedding.contact_person || "the couple"} to request a change.`,
        },
        { status: 409 },
      );
    const clean = (value: string, maxLength = 1000) =>
      sanitizeInput(value, { maxLength, allowNewlines: true });
    const attendance = input.attendance;
    const attendees =
      attendance === "No"
        ? []
        : input.attendees.map((person) => ({
            name: clean(person.name, 200),
            kind: person.kind,
            meal: clean(person.meal || "", 200),
            dietary: clean(person.dietary || "", 500),
          }));
    const eventIds = new Set(
      (Array.isArray(wedding.rsvp_events) ? wedding.rsvp_events : []).map(
        (event: { id: string }) => event.id,
      ),
    );
    const record: Record<string, any> = {
      response_version: input.responseVersion,
      wedding_id: wedding.id,
      guest_name: clean(input.guestName, 200),
      guest_email: input.guestEmail?.trim().toLowerCase() || null,
      attendance,
      num_guests: attendance === "No" ? 1 : input.numGuests,
      rsvp_status:
        attendance === "Yes"
          ? "confirmed"
          : attendance === "No"
            ? "declined"
            : "pending",
      meal_preference:
        attendance === "No"
          ? ""
          : clean(
              attendees
                .map((person) => person.meal)
                .filter(Boolean)
                .join(", ") ||
                input.mealPreference ||
                "",
              200,
            ),
      dietary_details:
        attendance === "No"
          ? ""
          : clean(
              attendees
                .map((person) =>
                  person.dietary ? `${person.name}: ${person.dietary}` : "",
                )
                .filter(Boolean)
                .join("\n") || input.dietaryDetails,
            ),
      message: clean(input.message, 2000),
      song_request: clean(input.songRequest, 500),
      plus_one_names:
        attendance === "No"
          ? ""
          : clean(
              attendees
                .slice(1)
                .map((person) => person.name)
                .join(", ") || input.plusOneNames,
            ),
      plus_one_name:
        attendance === "No"
          ? ""
          : clean(
              attendees[1]?.name || input.plusOneNames.split(",")[0] || "",
              200,
            ),
      plus_one_rsvp_status: attendance === "Yes" ? "confirmed" : "declined",
      children_count: attendance === "No" ? 0 : input.childrenCount,
      household_name: clean(input.householdName, 200),
      household_members:
        attendance === "No"
          ? []
          : attendees.length
            ? attendees.slice(1).map((person) => person.name)
            : input.householdMembers.map((name) => clean(name, 200)),
      attendees,
      event_responses: input.eventResponses
        .filter((event) => eventIds.has(event.eventId))
        .map((event) => ({
          ...event,
          attendance: attendance === "No" ? "No" : event.attendance,
        })),
    };
    let guest: any;
    if (input.invitationToken) {
      const result = await db.rpc("qw_respond_to_invitation", {
        p_wedding: wedding.id,
        p_token: input.invitationToken,
        p_data: record,
      });
      if (result.error)
        return NextResponse.json(
          {
            error:
              "Unable to update this invitation. Check the party allowance or ask the couple for help.",
          },
          { status: 409 },
        );
      guest = result.data;
    } else {
      claim = createHash("sha256")
        .update(
          `${record.guest_name.toLowerCase()}\0${record.guest_email || ""}`,
        )
        .digest("hex");
      const claimed = await db
        .from("public_rsvp_submission_keys")
        .insert({ wedding_id: wedding.id, submission_key: claim });
      if (claimed.error) {
        claim = "";
        if (claimed.error.code === "23505")
          return NextResponse.json(
            {
              error:
                "A response with these details is already saved. Use your guest pass to edit it, or ask the couple for your personal invitation.",
              code: "duplicate_rsvp",
            },
            { status: 409 },
          );
        throw claimed.error;
      }
      const inserted = await db
        .from("rsvps")
        .insert({
          ...record,
          response_version: 0,
          seat_lookup_token: makeSeatLookupToken(),
          guest_code: makeGuestCode(record.guest_name),
          responded_at: new Date().toISOString(),
          invited_party_size: 50,
        })
        .select("*")
        .single();
      if (inserted.error) throw inserted.error;
      guest = inserted.data;
      saved = true;
      await db
        .from("public_rsvp_submission_keys")
        .update({ rsvp_id: guest.id })
        .eq("wedding_id", wedding.id)
        .eq("submission_key", claim);
    }
    saved = true;
    await db
      .from("product_events")
      .insert({ wedding_id: wedding.id, event: "rsvp_saved" });
    await invalidateDashboardCounters(wedding.id).catch(() => undefined);
    const notifications = await sendRsvpNotifications(db, {
      weddingId: wedding.id,
      wedding,
      guestName: guest.guest_name,
      guestEmail: guest.guest_email || "",
      attendance,
      numGuests: guest.num_guests,
      message: record.message,
      dietaryDetails: record.dietary_details,
      songRequest: record.song_request,
      plusOneNames: record.plus_one_names,
      childrenCount: record.children_count,
      guestCode: guest.guest_code,
      seatLookupToken: guest.seat_lookup_token,
    }).catch(() => ({ success: false, results: [] }));
    return NextResponse.json(
      {
        success: true,
        rsvpId: guest.id,
        guestPass: `/guest/${guest.seat_lookup_token}`,
        notifications,
      },
      { headers: limit.headers },
    );
  } catch (error) {
    if (claim && !saved)
      await db
        .from("public_rsvp_submission_keys")
        .delete()
        .eq("wedding_id", input.weddingId)
        .eq("submission_key", claim);
    console.error("RSVP save failed", error);
    return NextResponse.json(
      { error: "Unable to save your response. Please try again." },
      { status: 500 },
    );
  }
}

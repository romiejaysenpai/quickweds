import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createRateLimitMiddleware, getClientIP } from "@/lib/rate-limit";
export async function GET(req: NextRequest) {
  const limited = await createRateLimitMiddleware("SEAT_LOOKUP").check(
    `${getClientIP(req)}:pass`,
  );
  if (limited.limited) return limited.response;
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!/^[\w-]{20,200}$/.test(token))
    return NextResponse.json(
      { error: "Invitation unavailable." },
      { status: 404 },
    );
  const db = getSupabaseAdminClient() as any;
  const result = await db
    .from("rsvps")
    .select(
      "id,wedding_id,guest_name,guest_email,attendance,num_guests,guest_code,invited_party_size,household_members,attendees,event_responses,response_version,meal_preference,dietary_details,message,song_request,children_count,household_name",
    )
    .eq("seat_lookup_token", token)
    .maybeSingle();
  if (result.error || !result.data)
    return NextResponse.json(
      { error: "Invitation unavailable." },
      { status: 404 },
    );
  const wedding = await db
    .from("weddings")
    .select(
      "id,bride_name,groom_name,wedding_date,wedding_time,event_timezone,venue_name,venue_address,maps_link,contact_person,rsvp_deadline,rsvp_events,photo_album_link,is_thank_you_mode,template,motif_color",
    )
    .eq("id", result.data.wedding_id)
    .eq("is_published", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (wedding.error || !wedding.data)
    return NextResponse.json(
      { error: "Invitation unavailable." },
      { status: 404 },
    );
  return NextResponse.json(
    { guest: result.data, wedding: wedding.data },
    {
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}

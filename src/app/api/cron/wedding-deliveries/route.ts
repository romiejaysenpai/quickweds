import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { isRsvpClosed } from "@/lib/event-time";
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(req.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (
    !secret ||
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getSupabaseAdminClient() as any;
  const { data: jobs, error } = await db.rpc("qw_claim_deliveries", {
    p_limit: 25,
  });
  if (error)
    return NextResponse.json(
      { error: "Delivery queue unavailable." },
      { status: 503 },
    );
  let accepted = 0,
    failed = 0;
  for (const job of jobs || []) {
    try {
      const wedding = await db
        .from("weddings")
        .select(
          "is_published,deleted_at,completed_at,rsvp_deadline,event_timezone",
        )
        .eq("id", job.wedding_id)
        .maybeSingle();
      if (wedding.error) throw wedding.error;
      let cancel =
        !wedding.data || wedding.data.deleted_at || wedding.data.completed_at;
      if (job.payload.itemId && !cancel) {
        const item = await db
          .from("wedding_operations")
          .select("status")
          .eq("id", job.payload.itemId)
          .eq("wedding_id", job.wedding_id)
          .maybeSingle();
        if (item.error) throw item.error;
        cancel = !item.data || item.data.status !== "pending";
      }
      if (job.kind === "rsvp" && !cancel) {
        const guest = await db
          .from("rsvps")
          .select("rsvp_status,guest_email")
          .eq("id", job.payload.guestId)
          .eq("wedding_id", job.wedding_id)
          .maybeSingle();
        if (guest.error) throw guest.error;
        cancel =
          !wedding.data.is_published ||
          !guest.data ||
          guest.data.rsvp_status !== "pending" ||
          guest.data.guest_email !== job.recipient ||
          isRsvpClosed(wedding.data.rsvp_deadline, wedding.data.event_timezone);
      }
      if (cancel) {
        await db
          .from("wedding_deliveries")
          .update({ status: "cancelled" })
          .eq("id", job.id);
        continue;
      }
      const result = await sendEmail({
        to: job.recipient,
        subject: job.payload.subject,
        html: job.payload.html,
        idempotencyKey: `delivery/${job.id}`,
      });
      if (!result.success) throw new Error(result.error);
      const saved = await db
        .from("wedding_deliveries")
        .update({
          status: "accepted",
          provider_id: result.id,
          last_error: null,
        })
        .eq("id", job.id);
      if (saved.error) throw saved.error;
      accepted++;
    } catch (error) {
      failed++;
      await db
        .from("wedding_deliveries")
        .update({
          status: "failed",
          last_error:
            error instanceof Error ? error.message : "Delivery failed",
          due_at: new Date(
            Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts),
          ).toISOString(),
        })
        .eq("id", job.id);
    }
  }
  return NextResponse.json({ accepted, failed });
}

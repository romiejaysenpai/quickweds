import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedRequest } from "@/lib/api-rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getWeddingAccess } from "@/lib/wedding-access";
import {
  recoverPhotoReservation,
  privatizeLegacyPhoto,
} from "@/lib/photo-recovery";
import { invalidateDashboardCounters } from "@/lib/dashboard-counters";
export const dynamic = "force-dynamic";
const input = z.object({
  weddingId: z.string().min(1).max(100),
  action: z.enum(["recover", "privatize"]),
  afterId: z.uuid().optional(),
});
export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
async function handle(req: NextRequest) {
  const auth = await getAuthenticatedRequest(req, "AUTHENTICATED_DEFAULT");
  if (auth.response) return auth.response;
  const body =
    req.method === "GET"
      ? { weddingId: req.nextUrl.searchParams.get("weddingId") }
      : await req.json().catch(() => ({}));
  const weddingId = String(body.weddingId || "");
  if (!weddingId || weddingId.length > 100)
    return NextResponse.json(
      { error: "Wedding ID required." },
      { status: 400 },
    );
  try {
    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, auth.user, weddingId);
    if (!access.canManage)
      return NextResponse.json(
        { error: "Wedding photo access required." },
        { status: 403 },
      );
    const reservations = () =>
      db
        .from("photo_upload_reservations")
        .select("*")
        .eq("wedding_id", weddingId)
        .eq("state", "reserved")
        .lte("lease_until", new Date().toISOString())
        .order("id", { ascending: true });
    const legacy = () =>
      db
        .from("wedding_photos")
        .select("*")
        .eq("wedding_id", weddingId)
        .like("cloudinary_public_id", `guest-uploads/${weddingId}/%`)
        .or("storage_bucket.eq.quickweds,legacy_public_path.not.is.null")
        .order("id", { ascending: true });
    if (req.method === "GET") {
      const [pending, older] = await Promise.all([
        reservations().limit(100),
        legacy().limit(100),
      ]);
      if (pending.error) throw pending.error;
      if (older.error) throw older.error;
      return NextResponse.json(
        {
          interruptedUploads: pending.data.length,
          olderPublicPhotos: older.data.length,
          countsCappedAt: 100,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const parsed = input.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid photo recovery request." },
        { status: 400 },
      );
    let batch = parsed.data.action === "recover" ? reservations() : legacy();
    if (parsed.data.afterId) batch = batch.gt("id", parsed.data.afterId);
    const { data, error } = await batch.limit(5);
    if (error) throw error;
    const results = [];
    for (const row of data) {
      try {
        results.push({
          id: row.id,
          ...(await (parsed.data.action === "recover"
            ? recoverPhotoReservation(db, weddingId, row.id)
            : privatizeLegacyPhoto(db, weddingId, row))),
        });
      } catch (error) {
        results.push({
          id: row.id,
          state: "needs_review",
          error:
            error instanceof Error ? error.message : "Photo recovery failed.",
        });
      }
    }
    await invalidateDashboardCounters(weddingId);
    return NextResponse.json({
      results,
      processed: results.length,
      batchLimit: 5,
      nextCursor: data.length === 5 ? data.at(-1).id : null,
    });
  } catch (error) {
    console.error(
      "Photo recovery failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to recover photos.",
      },
      { status: 500 },
    );
  }
}

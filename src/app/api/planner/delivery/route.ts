import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedRequest } from "@/lib/api-rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getWeddingAccess } from "@/lib/wedding-access";
import { retryStoredEmail, verifyStoredEmailReceipt } from "@/lib/email";
export const dynamic = "force-dynamic";
const input = z.object({
  weddingId: z.string().min(1).max(100),
  action: z.enum(["retry", "reconcile"]),
  jobId: z.uuid().optional(),
  providerId: z.uuid().optional(),
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
    const access = await getWeddingAccess(db, auth.user, weddingId, {
      collaboratorRoles: ["partner"],
    });
    if (!access.canManage)
      return NextResponse.json(
        { error: "Only the couple can manage email recovery." },
        { status: 403 },
      );
    if (req.method === "GET") {
      const { data, error } = await db
        .from("email_delivery_jobs")
        .select(
          "id,state,attempts,created_at,updated_at,provider_id,first_dispatch_at,payload",
        )
        .eq("wedding_id", weddingId)
        .eq("recoverable", true)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return NextResponse.json(
        {
          jobs: (data || []).map(({ payload, ...job }: any) => ({
            ...job,
            subject: String(payload?.subject || "Wedding email"),
          })),
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const parsed = input.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid recovery request." },
        { status: 400 },
      );
    const request = parsed.data;
    let query = db
      .from("email_delivery_jobs")
      .select("*")
      .eq("wedding_id", weddingId)
      .eq("recoverable", true);
    query = request.jobId
      ? query.eq("id", request.jobId)
      : query.in("state", ["queued", "retryable", "processing"]);
    if (!request.jobId && request.afterId)
      query = query.gt("id", request.afterId);
    const { data: jobs, error } = await query
      .order("id", { ascending: true })
      .limit(5);
    if (error) throw error;
    if (request.action === "reconcile") {
      if (!request.jobId || !request.providerId || jobs.length !== 1)
        return NextResponse.json(
          { error: "Select an email and enter its provider receipt ID." },
          { status: 400 },
        );
      const provider = await verifyStoredEmailReceipt(
        jobs[0],
        request.providerId,
      );
      const { data, error: saveError } = await db.rpc(
        "quickweds_reconcile_email",
        { p_id: request.jobId, p_wedding: weddingId, p_provider: provider },
      );
      if (saveError || data !== true)
        throw new Error(
          "This email is still processing or has changed. Retry after it finishes.",
        );
      return NextResponse.json({ success: true });
    }
    const results = [];
    for (const job of jobs) {
      try {
        results.push({ id: job.id, ...(await retryStoredEmail(job)) });
      } catch (error) {
        results.push({
          id: job.id,
          success: false,
          error: error instanceof Error ? error.message : "Recovery failed.",
        });
      }
    }
    return NextResponse.json({
      results,
      processed: results.length,
      batchLimit: 5,
      nextCursor: jobs.length === 5 ? jobs.at(-1).id : null,
    });
  } catch (error) {
    console.error(
      "Email recovery failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Email recovery failed.",
      },
      { status: 500 },
    );
  }
}

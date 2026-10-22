import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRequest } from "@/lib/api-rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getWeddingAccess } from "@/lib/wedding-access";
import { z } from "zod";
export const dynamic = "force-dynamic";
const milestone = z
  .object({
    type: z.literal("milestone"),
    id: z.uuid(),
    title: z.string().trim().min(1).max(200),
    amount: z.coerce
      .number()
      .positive()
      .max(999999999)
      .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001),
    due_date: z.iso.date(),
    planner_vendor_id: z.uuid().nullable(),
    planner_budget_id: z.uuid().nullable(),
  })
  .refine(
    (row) => Boolean(row.planner_vendor_id) !== Boolean(row.planner_budget_id),
  );
const gift = z.object({
  type: z.literal("gift"),
  id: z.uuid(),
  from_name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  rsvp_id: z.uuid().nullable(),
});
export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
export async function DELETE(req: NextRequest) {return handle(req);}
export async function PATCH(req: NextRequest) {
  return handle(req);
}
async function handle(req: NextRequest) {
  const auth = await getAuthenticatedRequest(req, "AUTHENTICATED_DEFAULT");
  if (auth.response) return auth.response;
  const body = req.method === "GET" ? {} : await req.json().catch(() => ({}));
  const weddingId = String(
    req.nextUrl.searchParams.get("weddingId") || body.weddingId || "",
  );
  if (!weddingId || weddingId.length > 100)
    return NextResponse.json(
      { error: "Wedding ID required." },
      { status: 400 },
    );
  try {
    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, auth.user, weddingId, {
      select:
        "id,user_id,currency,total_budget,wedding_date,rsvp_events,planner_only",
    });
    if (!access.wedding || !access.canManage)
      return NextResponse.json(
        { error: "Planner access required." },
        { status: 403 },
      );
    if (req.method === "GET") {
      const tables = [
        "planner_payment_milestones",
        "planner_gifts",
        "planner_activity",
        "rsvps",
        "seating_assignments",
        "planner_tasks",
        "planner_budgets",
        "planner_vendors",
        "planner_food_drinks",
      ];
      const results = await Promise.all(
        tables.map((table) =>
          db
            .from(table)
            .select(
              table === "rsvps"
                ? "id,guest_name,attendance,rsvp_status,num_guests,plus_one_allowed,plus_one_name,plus_one_rsvp_status,meal_preference,dietary_details,children_count,event_responses"
                : "*",
            )
            .eq("wedding_id", weddingId)
            .order(table === "planner_activity" ? "created_at" : "id", {
              ascending: table !== "planner_activity",
            })
            .limit(table === "planner_activity" ? 100 : 5001),
        ),
      );
      const data: Record<string, unknown> = { wedding: access.wedding };
      for (let i = 0; i < tables.length; i++) {
        if (results[i].error) throw results[i].error;
        if (results[i].data?.length > 5000)
          throw new Error(
            "This planner is too large for the overview. Use the individual planning tools.",
          );
        data[tables[i]] = results[i].data || [];
      }
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    if (access.role === "coordinator")
      return NextResponse.json(
        { error: "Only the couple can update payments or gifts." },
        { status: 403 },
      );
    if (req.method === "POST") {
      const parsed = z.union([milestone, gift]).safeParse(body);
      if (!parsed.success)
        return NextResponse.json(
          { error: "Check the name, date, linked item, and amount." },
          { status: 400 },
        );
      const { type, ...values } = parsed.data;
      const table =
        type === "gift" ? "planner_gifts" : "planner_payment_milestones";
      // Client UUID makes a retried create idempotent without overwriting an existing item.
      const { data: existing, error: existingError } = await db
        .from(table)
        .select("id,wedding_id")
        .eq("id", values.id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        if (existing.wedding_id !== weddingId)
          return NextResponse.json(
            { error: "Invalid request." },
            { status: 409 },
          );
        return NextResponse.json({ success: true, id: existing.id });
      }
      const { error } = await db
        .from(table)
        .insert({ ...values, wedding_id: weddingId });
      if (error) throw error;
      return NextResponse.json({ success: true, id: values.id });
    }
    if(req.method==='DELETE'){
      const parsed=z.object({id:z.uuid(),type:z.enum(['gift','milestone'])}).safeParse(body);
      if(!parsed.success)return NextResponse.json({error:'Invalid removal request.'},{status:400});
      const {data,error}=await db.from(parsed.data.type==='gift'?'planner_gifts':'planner_payment_milestones').delete().eq('id',parsed.data.id).eq('wedding_id',weddingId).select('id').maybeSingle();
      if(error)throw error;if(!data)return NextResponse.json({error:'Item not found.'},{status:404});return NextResponse.json({success:true});
    }
    const parsed = z
      .object({
        id: z.uuid(),
        type: z.enum(["gift", "milestone"]),
        complete: z.boolean(),
      })
      .safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    const { id, type, complete } = parsed.data;
    const { data, error } = await db
      .from(type === "gift" ? "planner_gifts" : "planner_payment_milestones")
      .update({
        [type === "gift" ? "thank_you_completed_at" : "paid_at"]: complete
          ? new Date().toISOString()
          : null,
      })
      .eq("id", id)
      .eq("wedding_id", weddingId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Planner progress failed:", error);
    return NextResponse.json(
      { error: "Unable to load or save planner progress. Please retry." },
      { status: 500 },
    );
  }
}

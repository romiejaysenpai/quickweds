import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/api-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getWeddingAccess } from "@/lib/wedding-access";
const schema = z.object({
  event: z.enum([
    "draft_saved",
    "wedding_published",
    "signup_completed",
    "upgrade_verified",
    "closeout_completed",
    "referral_shared",
  ]),
  weddingId: z.string().max(200).optional(),
});
export async function POST(req: NextRequest) {
  const { user } = await getRequestUser(req);
  if (!user) return new NextResponse(null, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const db = getSupabaseAdminClient() as any;
  if (
    parsed.data.weddingId &&
    !(await getWeddingAccess(db, user, parsed.data.weddingId)).canManage
  )
    return new NextResponse(null, { status: 403 });
  await db
    .from("product_events")
    .insert({
      user_id: user.id,
      wedding_id: parsed.data.weddingId || null,
      event: parsed.data.event,
    });
  return new NextResponse(null, { status: 204 });
}

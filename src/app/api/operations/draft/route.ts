import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/api-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
export async function GET(req: NextRequest) {
  const { user } = await getRequestUser(req);
  if (!user)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const db = getSupabaseAdminClient() as any;
  const { data, error } = await db
    .from("wedding_drafts")
    .select("data,updated_at")
    .eq("user_id", user.id)
    .eq("draft_key", req.nextUrl.searchParams.get("key") || "new")
    .maybeSingle();
  return NextResponse.json(
    error ? { error: "Draft unavailable." } : { draft: data },
    { status: error ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
export async function PUT(req: NextRequest) {
  const { user } = await getRequestUser(req);
  if (!user)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.key !== "string" ||
    body.key.length > 200 ||
    !body.data ||
    JSON.stringify(body.data).length > 300000
  )
    return NextResponse.json(
      { error: "Draft is too large or invalid." },
      { status: 400 },
    );
  const db = getSupabaseAdminClient() as any;
  const { error } = await db
    .from("wedding_drafts")
    .upsert({
      user_id: user.id,
      draft_key: body.key,
      data: body.data,
      updated_at: new Date().toISOString(),
    });
  if (!error)
    await db
      .from("product_events")
      .insert({ user_id: user.id, event: "draft_saved" });
  return NextResponse.json(
    error ? { error: "Draft could not be saved." } : { saved: true },
    { status: error ? 503 : 200 },
  );
}
export async function DELETE(req: NextRequest) {
  const { user } = await getRequestUser(req);
  if (!user)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const key = req.nextUrl.searchParams.get("key") || "new";
  if (key.length > 200)
    return NextResponse.json({ error: "Invalid draft." }, { status: 400 });
  const db = getSupabaseAdminClient() as any;
  const { error } = await db
    .from("wedding_drafts")
    .delete()
    .eq("user_id", user.id)
    .eq("draft_key", key);
  return NextResponse.json(
    error ? { error: "Draft could not be cleared." } : { cleared: true },
    { status: error ? 503 : 200 },
  );
}

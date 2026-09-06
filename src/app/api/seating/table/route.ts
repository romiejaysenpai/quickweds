import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/api-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getWeddingAccess } from "@/lib/wedding-access";

const updateSchema = z.object({
  weddingId: z.string().min(1),
  tableId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  shape: z.string().trim().min(1).max(40),
  capacity: z.number().int().min(1).max(500),
});
const deleteSchema = z.object({
  weddingId: z.string().min(1),
  tableId: z.string().uuid(),
});

async function access(req: NextRequest, weddingId: string) {
  const { user } = await getRequestUser(req);
  if (!user) return null;
  const db = getSupabaseAdminClient() as any;
  const wedding = await getWeddingAccess(db, user, weddingId);
  return wedding.canManage ? db : null;
}

export async function PATCH(req: NextRequest) {
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the table name, shape and capacity." },
      { status: 400 },
    );
  const db = await access(req, parsed.data.weddingId);
  if (!db)
    return NextResponse.json(
      { error: "Wedding access required." },
      { status: 403 },
    );
  const { data, error } = await db.rpc("qw_update_seating_table", {
    p_wedding: parsed.data.weddingId,
    p_table: parsed.data.tableId,
    p_name: parsed.data.name,
    p_shape: parsed.data.shape,
    p_capacity: parsed.data.capacity,
  });
  return NextResponse.json(error ? { error: error.message } : { table: data }, {
    status: error ? 409 : 200,
  });
}

export async function DELETE(req: NextRequest) {
  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid table." }, { status: 400 });
  const db = await access(req, parsed.data.weddingId);
  if (!db)
    return NextResponse.json(
      { error: "Wedding access required." },
      { status: 403 },
    );
  const { error } = await db.rpc("qw_delete_seating_table", {
    p_wedding: parsed.data.weddingId,
    p_table: parsed.data.tableId,
  });
  return NextResponse.json(
    error ? { error: error.message } : { deleted: true },
    { status: error ? 409 : 200 },
  );
}

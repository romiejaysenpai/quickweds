import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRequest } from "@/lib/api-rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getWeddingAccess } from "@/lib/wedding-access";
import { createPhotoZip } from "@/lib/photo-zip";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedRequest(req, "AUTHENTICATED_DEFAULT");
  if (auth.response) return auth.response;
  const body = z
    .object({
      weddingId: z.string().min(1).max(100),
      photoIds: z.array(z.uuid()).min(1).max(20),
    })
    .safeParse(await req.json().catch(() => null));
  if (!body.success)
    return NextResponse.json(
      { error: "Choose between 1 and 20 photos." },
      { status: 400 },
    );
  try {
    const db = getSupabaseAdminClient() as any;
    const { weddingId, photoIds } = body.data;
    const access = await getWeddingAccess(db, auth.user, weddingId);
    if (!access.canManage)
      return NextResponse.json(
        { error: "Planner access required." },
        { status: 403 },
      );
    const { data, error } = await db
      .from("wedding_photos")
      .select("id,storage_bucket,cloudinary_public_id")
      .eq("wedding_id", weddingId)
      .in("id", photoIds);
    if (error) throw error;
    if (data.length !== new Set(photoIds).size)
      return NextResponse.json(
        { error: "One or more photos are no longer available." },
        { status: 404 },
      );
    const files: Array<{ name: string; bytes: Uint8Array }> = [];
    let total = 0;
    for (const photo of data) {
      if (
        !["quickweds", "quickweds-guest-photos"].includes(
          photo.storage_bucket,
        ) ||
        !photo.cloudinary_public_id?.startsWith(`guest-uploads/${weddingId}/`)
      )
        return NextResponse.json(
          {
            error:
              "This batch includes an older external photo. Download that photo individually.",
          },
          { status: 409 },
        );
      const { data: blob, error: downloadError } = await db.storage
        .from(photo.storage_bucket)
        .download(photo.cloudinary_public_id);
      if (downloadError || !blob)
        throw downloadError || new Error("Photo missing");
      if (
        blob.size > 10 * 1024 * 1024 ||
        (total += blob.size) > 50 * 1024 * 1024
      )
        return NextResponse.json(
          {
            error:
              "Choose a smaller batch. ZIP downloads are limited to 50 MB.",
          },
          { status: 413 },
        );
      const ext = String(photo.cloudinary_public_id)
        .split(".")
        .pop()
        ?.toLowerCase();
      files.push({
        name: `photo-${photo.id}.${["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "") ? ext : "jpg"}`,
        bytes: new Uint8Array(await blob.arrayBuffer()),
      });
    }
    return new NextResponse(new Uint8Array(createPhotoZip(files)), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="quickweds-photos.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Photo export failed:", error);
    return NextResponse.json(
      { error: "Unable to create photo ZIP. Retry a smaller batch." },
      { status: 500 },
    );
  }
}

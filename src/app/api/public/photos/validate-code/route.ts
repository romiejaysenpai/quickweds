import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  createRateLimitMiddleware,
  getClientIP,
  sanitizeInput,
} from "@/lib/rate-limit";
import { resolvePublicWeddingByIdentifier } from "@/lib/public-wedding-lookup";
import { getPhotoPortalSettings } from "@/lib/photo-portal";
import {
  photoCookieName,
  readPhotoPrincipal,
  createPhotoPrincipal,
  photoCodeLimit,
} from "@/lib/photo-upload-access";
import { verifyRsvpAccessToken } from "@/lib/rsvp-access";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const identifier = String(body.weddingId || "");
  const code = sanitizeInput(String(body.code || ""), {
    maxLength: 32,
  }).toUpperCase();
  if (!identifier || !code)
    return NextResponse.json(
      { error: "Wedding and sharing code are required." },
      { status: 400 },
    );
  const limited = await createRateLimitMiddleware("PHOTO_UPLOAD").check(
    `${getClientIP(req)}:${identifier}:photo-code`,
  );
  if (limited.limited) return limited.response;
  try {
    const db = getSupabaseAdminClient() as any;
    const { wedding, error } = await resolvePublicWeddingByIdentifier(
      db,
      identifier,
      "id",
    );
    if (error) throw error;
    if (!wedding)
      return NextResponse.json(
        { error: "Wedding not found." },
        { status: 404 },
      );
    const { data: sharing, error: codeError } = await db
      .from("photo_sharing_codes")
      .select("id,max_uploads,current_uploads,expires_at")
      .eq("wedding_id", wedding.id)
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();
    if (codeError) throw codeError;
    if (
      !sharing ||
      (sharing.expires_at &&
        !(new Date(sharing.expires_at).getTime() > Date.now()))
    )
      return NextResponse.json(
        { error: "Invalid or expired sharing code." },
        { status: 403 },
      );
    const settings = await getPhotoPortalSettings(db, wedding.id);
    const guestLimit = Math.max(1, settings.photo_limit_per_guest || 3);
    const name = photoCookieName(wedding.id, sharing.id);
    let principal = readPhotoPrincipal(
      req.cookies.get(name)?.value || "",
      wedding.id,
      sharing.id,
    )?.principal;
    if (body.rsvpId || body.rsvpToken) {
      const { data: guest, error: guestError } = await db
        .from("rsvps")
        .select("id,guest_email")
        .eq("id", body.rsvpId)
        .eq("wedding_id", wedding.id)
        .maybeSingle();
      if (guestError) throw guestError;
      if (
        !guest ||
        !verifyRsvpAccessToken(
          body.rsvpToken,
          wedding.id,
          guest.id,
          guest.guest_email || "",
        )
      )
        return NextResponse.json(
          { error: "Invalid invitation verification." },
          { status: 403 },
        );
      principal = `guest:${guest.id}`;
    }
    const session = createPhotoPrincipal(wedding.id, sharing.id, principal);
    const { data: usage, error: usageError } = await db
      .from("photo_guest_usage")
      .select("used")
      .eq("wedding_id", wedding.id)
      .eq("principal", session.claims.principal)
      .maybeSingle();
    if (usageError) throw usageError;
    const used = Number(usage?.used || 0);
    const codeRemaining = Math.max(
      0,
      photoCodeLimit(sharing.max_uploads) -
        Number(sharing.current_uploads || 0),
    );
    const response = NextResponse.json(
      {
        success: true,
        remainingUploads: Math.max(
          0,
          Math.min(guestLimit - used, codeRemaining),
        ),
        maxUploads: guestLimit,
        currentUploads: used,
        codeRemaining,
        quotaScope: session.claims.principal.startsWith("guest:")
          ? "invitation"
          : "browser",
      },
      { headers: { ...limited.headers, "Cache-Control": "no-store" } },
    );
    response.cookies.set(name, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 86400,
    });
    return response;
  } catch (error) {
    console.error("Photo sharing code validation failed:", error);
    return NextResponse.json(
      { error: "Unable to validate this sharing code." },
      { status: 503 },
    );
  }
}

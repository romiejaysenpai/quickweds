import "server-only";
import { createHash } from "crypto";
import { isWeddingPhotoPath } from "./photo-path";
/** Lease and fencing make a late original request unable to complete a reclaimed upload. */
export async function recoverPhotoReservation(
  db: any,
  weddingId: string,
  id: string,
) {
  const { data: claim, error } = await db.rpc(
    "quickweds_claim_photo_recovery",
    { p_id: id, p_wedding: weddingId },
  );
  if (error) throw error;
  if (!claim) return { state: "busy" };
  if (!isWeddingPhotoPath(claim.object_path, weddingId))
    throw new Error("Invalid photo recovery path.");
  const { data: file, error: downloadError } = await db.storage
    .from("quickweds-guest-photos")
    .download(claim.object_path);
  if (downloadError) {
    const status = String(
      downloadError.statusCode || downloadError.status || "",
    );
    if (status !== "404")
      throw new Error(
        "Photo storage is unavailable. The reservation remains held.",
      );
    const { error: releaseError } = await db.rpc("quickweds_release_photo", {
      p_id: id,
      p_claim: claim.claim_token,
    });
    if (releaseError) throw releaseError;
    return { state: "released" };
  }
  if (!file || file.size > 10 * 1024 * 1024 || !claim.photo_data)
    throw new Error(
      "Photo needs support review. The reservation remains held.",
    );
  if (
    createHash("sha256")
      .update(Buffer.from(await file.arrayBuffer()))
      .digest("hex") !== claim.content_hash
  )
    throw new Error("Stored photo does not match the upload.");
  const { data: photoId, error: completeError } = await db.rpc(
    "quickweds_complete_photo",
    { p_id: id, p_data: claim.photo_data, p_claim: claim.claim_token },
  );
  if (completeError) throw completeError;
  return { state: "complete", photoId };
}

/** Copy, verify, change the row, then remove the old public object. Never delete first. */
export async function privatizeLegacyPhoto(
  db: any,
  weddingId: string,
  photo: any,
) {
  const path = photo.legacy_public_path || photo.cloudinary_public_id;
  if (
    !isWeddingPhotoPath(path, weddingId) ||
    path !== photo.cloudinary_public_id ||
    !["quickweds", "quickweds-guest-photos"].includes(photo.storage_bucket)
  )
    throw new Error("This external photo must be handled individually.");
  if (photo.storage_bucket === "quickweds") {
    const { data: file, error } = await db.storage
      .from("quickweds")
      .download(path);
    if (error || !file) throw new Error("Unable to read the original photo.");
    if (file.size > 10 * 1024 * 1024)
      throw new Error("This photo exceeds the safe migration size.");
    const source = Buffer.from(await file.arrayBuffer());
    const digest = createHash("sha256").update(source).digest("hex");
    const { error: uploadError } = await db.storage
      .from("quickweds-guest-photos")
      .upload(path, source, {
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
    const { data: copy, error: copyError } = await db.storage
      .from("quickweds-guest-photos")
      .download(path);
    if (
      copyError ||
      !copy ||
      createHash("sha256")
        .update(Buffer.from(await copy.arrayBuffer()))
        .digest("hex") !== digest
    )
      throw new Error(
        uploadError
          ? "Unable to safely copy this photo."
          : "Unable to verify the private copy.",
      );
    const { data: changed, error: saveError } = await db
      .from("wedding_photos")
      .update({
        storage_bucket: "quickweds-guest-photos",
        legacy_public_path: path,
        legacy_public_hash: digest,
      })
      .eq("id", photo.id)
      .eq("wedding_id", weddingId)
      .eq("storage_bucket", "quickweds")
      .eq("cloudinary_public_id", path)
      .select("id")
      .maybeSingle();
    if (saveError || !changed)
      throw new Error(
        "Photo metadata changed; the original public object has been preserved.",
      );
  }
  const { data: verifiedCopy, error: verifyError } = await db.storage
    .from("quickweds-guest-photos")
    .download(path);
  if (verifyError || !verifiedCopy)
    throw new Error(
      "Private copy is unavailable; the public original was preserved.",
    );
  if (
    photo.legacy_public_hash &&
    createHash("sha256")
      .update(Buffer.from(await verifiedCopy.arrayBuffer()))
      .digest("hex") !== photo.legacy_public_hash
  )
    throw new Error("Private copy failed verification.");
  const { count, error: countError } = await db
    .from("wedding_photos")
    .select("id", { count: "exact", head: true })
    .eq("storage_bucket", "quickweds")
    .eq("cloudinary_public_id", path);
  if (countError) throw countError;
  if (count) return { state: "copied", publicCleanupPending: true };
  const { error: deleteError } = await db.storage
    .from("quickweds")
    .remove([path]);
  if (deleteError)
    throw new Error(
      "Private copy saved. Retry to finish removing the old public object.",
    );
  const { error: clearError } = await db
    .from("wedding_photos")
    .update({ legacy_public_path: null, legacy_public_hash: null })
    .eq("id", photo.id)
    .eq("wedding_id", weddingId)
    .eq("storage_bucket", "quickweds-guest-photos")
    .eq("legacy_public_path", path);
  if (clearError) throw clearError;
  return { state: "private" };
}

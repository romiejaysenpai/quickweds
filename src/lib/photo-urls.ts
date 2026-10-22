import "server-only";
import { isWeddingPhotoPath } from "./photo-path";

/** Call only after applying the caller's ownership or public gallery visibility checks. */
export async function hydratePhotoUrls<
  T extends {
    storage_bucket?: string;
    cloudinary_public_id?: string;
    cloudinary_url?: string;
  },
>(db: any, photos: T[], weddingId: string): Promise<T[]> {
  const privatePhotos = photos.filter(
    (photo) => photo.storage_bucket === "quickweds-guest-photos",
  );
  if (!privatePhotos.length) return photos;
  const paths = privatePhotos.map((photo) => photo.cloudinary_public_id || "");
  if (paths.some((path) => !isWeddingPhotoPath(path, weddingId)))
    throw new Error("Invalid private photo path.");
  const { data, error } = await db.storage
    .from("quickweds-guest-photos")
    .createSignedUrls(paths, 300);
  if (error) throw error;
  const urls = new Map<string, string>();
  for (const item of data || []) {
    if (item.error || !item.signedUrl)
      throw new Error("Unable to open private photos.");
    urls.set(item.path, item.signedUrl);
  }
  return photos.map((photo) => {
    if (photo.storage_bucket !== "quickweds-guest-photos") return photo;
    const url = urls.get(photo.cloudinary_public_id || "");
    if (!url) throw new Error("Unable to open private photo.");
    return { ...photo, cloudinary_url: url };
  });
}

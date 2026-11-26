import "server-only";
import { isWeddingPhotoPath } from "./photo-path";

const SIGNED_URL_BATCH_SIZE = 100;

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

  const validPaths: string[] = [];
  for (const photo of privatePhotos) {
    const path = photo.cloudinary_public_id || "";
    if (!isWeddingPhotoPath(path, weddingId)) {
      console.warn("Skipping invalid private photo path for wedding:", weddingId);
      continue;
    }
    validPaths.push(path);
  }

  const urls = new Map<string, string>();
  for (let i = 0; i < validPaths.length; i += SIGNED_URL_BATCH_SIZE) {
    const chunk = validPaths.slice(i, i + SIGNED_URL_BATCH_SIZE);
    const { data, error } = await db.storage
      .from("quickweds-guest-photos")
      .createSignedUrls(chunk, 300);
    if (error) throw error;
    for (const item of data || []) {
      if (item.error || !item.signedUrl) {
        console.warn("Skipping unreadable private photo:", item.path, item.error);
        continue;
      }
      urls.set(item.path, item.signedUrl);
    }
  }

  return photos
    .map((photo) => {
      if (photo.storage_bucket !== "quickweds-guest-photos") return photo;
      const url = urls.get(photo.cloudinary_public_id || "");
      if (!url) return null;
      return { ...photo, cloudinary_url: url };
    })
    .filter((photo): photo is T => photo !== null);
}

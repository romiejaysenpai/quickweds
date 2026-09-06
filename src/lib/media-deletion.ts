import 'server-only';

import { v2 as cloudinary } from 'cloudinary';
import { MEDIA_BUCKET } from '@/lib/media-upload';

type PersistedPhoto = {
  cloudinary_public_id?: string | null;
  cloudinary_url?: string | null;
};

function safeStoragePath(value: string | null | undefined) {
  const path = String(value || '').trim().replace(/^\/+/, '');
  if (!path || path.includes('..') || path.includes('\\') || path.startsWith(`${MEDIA_BUCKET}/`)) return null;
  return path;
}

function storagePathFromUrl(value: string | null | undefined) {
  try {
    const url = new URL(String(value || ''));
    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index < 0) return null;
    return safeStoragePath(decodeURIComponent(url.pathname.slice(index + marker.length)));
  } catch {
    return null;
  }
}

function collectUrlValues(value: unknown): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return collectUrlValues(JSON.parse(trimmed));
      } catch {
        return [];
      }
    }
    return [trimmed];
  }
  if (Array.isArray(value)) return value.flatMap(collectUrlValues);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(collectUrlValues);
  return [];
}

/** Deletes only QuickWeds-managed Storage objects referenced by a wedding. */
export async function deleteManagedWeddingAssets(db: any, wedding: Record<string, unknown>) {
  const assetColumns = [
    'hero_image',
    'couple_photo',
    'teaser_video',
    'background_music_url',
    'gift_qr_image',
    'invitation_image',
    'gallery_images',
    'reception_venue_photos',
  ];
  const paths = new Set<string>();
  for (const column of assetColumns) {
    for (const value of collectUrlValues(wedding[column])) {
      const path = storagePathFromUrl(value);
      if (path) paths.add(path);
    }
  }

  for (const pathsChunk of Array.from(paths).reduce<string[][]>((chunks, path, index) => {
    const chunkIndex = Math.floor(index / 100);
    (chunks[chunkIndex] ||= []).push(path);
    return chunks;
  }, [])) {
    const { error } = await db.storage.from(MEDIA_BUCKET).remove(pathsChunk);
    if (error) throw error;
  }
}

/** Remove a photo from the provider before removing its database record. */
export async function deleteWeddingPhotoObject(db: any, photo: PersistedPhoto) {
  const publicId = String(photo.cloudinary_public_id || '').trim();
  const storagePath = storagePathFromUrl(photo.cloudinary_url)
    || (publicId.startsWith('guest-uploads/') ? safeStoragePath(publicId) : null);
  if (storagePath) {
    const { error } = await db.storage.from(MEDIA_BUCKET).remove([storagePath]);
    if (error) throw error;
    return;
  }

  const cloudinaryPublicId = publicId;
  if (!cloudinaryPublicId) {
    throw new Error('Photo storage location is missing; refusing to claim permanent deletion.');
  }
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('Photo storage is unavailable; retry permanent deletion later.');
  }

  const result = await cloudinary.uploader.destroy(cloudinaryPublicId, { invalidate: true, resource_type: 'image' });
  if (!['ok', 'not found'].includes(String(result.result || '').toLowerCase())) {
    throw new Error('Photo provider did not confirm deletion.');
  }
}

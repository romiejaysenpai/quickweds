/** Exact wedding ownership, safe segments, and no URL-decoding ambiguity. */
export function isWeddingPhotoPath(
  path: unknown,
  weddingId: string,
): path is string {
  if (
    typeof path !== "string" ||
    !weddingId ||
    !/^[a-zA-Z0-9-]+$/.test(weddingId) ||
    !path.startsWith(`guest-uploads/${weddingId}/`)
  )
    return false;
  return path
    .split("/")
    .every(
      (segment) =>
        Boolean(segment) &&
        segment !== "." &&
        segment !== ".." &&
        /^[a-zA-Z0-9_.-]+$/.test(segment),
    );
}

import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
type PhotoPrincipal = {
  weddingId: string;
  codeId: string;
  principal: string;
  expires: number;
};
const lifetime = 30 * 86400;
function key() {
  const secret =
    process.env.PHOTO_UPLOAD_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE;
  if (!secret) throw new Error("Photo access is unavailable");
  return createHmac("sha256", secret)
    .update("quickweds:photo-upload:v1")
    .digest();
}
export function photoCookieName(weddingId: string, codeId: string) {
  return (
    "qw_photo_" +
    createHash("sha256")
      .update(`${weddingId}:${codeId}`)
      .digest("hex")
      .slice(0, 20)
  );
}
export function createPhotoPrincipal(
  weddingId: string,
  codeId: string,
  principal = `browser:${randomUUID()}`,
) {
  const claims: PhotoPrincipal = {
    weddingId,
    codeId,
    principal,
    expires: Math.floor(Date.now() / 1000) + lifetime,
  };
  const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return {
    claims,
    token:
      body + "." + createHmac("sha256", key()).update(body).digest("base64url"),
  };
}
export function readPhotoPrincipal(
  token: string,
  weddingId: string,
  codeId: string,
): PhotoPrincipal | null {
  if (!token || token.length > 2048 || !/^[\w-]+\.[\w-]{43}$/.test(token))
    return null;
  try {
    const [body, signature] = token.split(".");
    const actual = Buffer.from(signature, "base64url");
    const expected = createHmac("sha256", key()).update(body).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return null;
    const claims = JSON.parse(
      Buffer.from(body, "base64url").toString(),
    ) as PhotoPrincipal;
    return claims.weddingId === weddingId &&
      claims.codeId === codeId &&
      typeof claims.principal === "string" &&
      /^(browser|guest):[\w-]{1,100}$/.test(claims.principal) &&
      Number.isInteger(claims.expires) &&
      claims.expires > Date.now() / 1000 &&
      claims.expires <= Date.now() / 1000 + lifetime
      ? claims
      : null;
  } catch {
    return null;
  }
}
export function photoCodeLimit(value: unknown) {
  if (value == null) return 1000;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10000)
    throw new Error("Invalid photo sharing limit");
  return n;
}

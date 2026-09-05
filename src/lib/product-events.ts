export async function trackProductEvent(
  event:
    | "draft_saved"
    | "wedding_published"
    | "signup_completed"
    | "upgrade_verified"
    | "closeout_completed"
    | "referral_shared",
  token: string,
  weddingId?: string,
) {
  try {
    await fetch("/api/product-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event, weddingId }),
    });
  } catch {
    /* Analytics never blocks a completed user action. */
  }
}

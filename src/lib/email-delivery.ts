import "server-only";
import { createHash } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserTriggeredEmailUsage } from "@/lib/planner-limits";
export type EmailTracking = {
  key: string;
  weddingId?: string;
  quotaLimit?: number | null;
  recoverable?: boolean;
  guard?: {
    table: "rsvps" | "wedding_collaborators" | "entourage_invitations";
    id: string;
    emailField: "guest_email" | "email";
    tokenHash?: string;
  };
};
export type DeliveryClaim = {
  id: string;
  state: string;
  claim_token?: string;
  payload: Record<string, unknown>;
  provider_id?: string;
  semantic_key?: string;
  wedding_id?: string;
  delivery_guard?: EmailTracking["guard"];
  recoverable?: boolean;
  quota_limit?: number | null;
  first_dispatch_at?: string;
  created_at?: string;
};
export class EmailMigrationMissingError extends Error {
  readonly code = "EMAIL_MIGRATION_MISSING";
  constructor() {
    super(
      "Reliable email delivery is unavailable. Please retry after the email migration is installed.",
    );
    this.name = "EmailMigrationMissingError";
  }
}

function isMissingEmailRpcError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: unknown; message?: unknown; details?: unknown };
  const code = String(record.code || "");
  const text = `${record.message || ""} ${record.details || ""}`.toLowerCase();
  return (
    code === "PGRST202" ||
    code === "42883" ||
    text.includes("could not find the function") ||
    (text.includes("quickweds_claim_email") && text.includes("does not exist"))
  );
}

export async function claimEmailDelivery(
  tracking: EmailTracking,
  payload: Record<string, unknown>,
) {
  const db = getSupabaseAdminClient() as any;
  const baseline =
    tracking.weddingId && tracking.quotaLimit != null
      ? await getUserTriggeredEmailUsage(db, tracking.weddingId)
      : 0;
  const { data, error } = await db.rpc("quickweds_claim_email", {
    p_key: createHash("sha256").update(tracking.key).digest("hex"),
    p_payload: payload,
    p_wedding: tracking.weddingId || null,
    p_limit: tracking.quotaLimit ?? null,
    p_baseline: baseline,
    p_guard: tracking.guard || null,
    p_recoverable: tracking.recoverable === true,
  });
  if (error) {
    if (isMissingEmailRpcError(error)) throw new EmailMigrationMissingError();
    throw new Error(
      "Reliable email delivery is unavailable. Please retry after the email migration is installed.",
    );
  }
  return data as DeliveryClaim;
}
export async function finishEmailDelivery(
  job: DeliveryClaim,
  state: "accepted" | "retryable" | "failed",
  provider?: string,
  message?: string,
) {
  const { data, error } = await (getSupabaseAdminClient() as any).rpc(
    "quickweds_finish_email",
    {
      p_id: job.id,
      p_claim: job.claim_token,
      p_state: state,
      p_provider: provider || null,
      p_error: message || null,
    },
  );
  if (error || data !== true)
    throw new Error(
      "Email outcome needs reconciliation. Retry this same operation; do not start another send.",
    );
}

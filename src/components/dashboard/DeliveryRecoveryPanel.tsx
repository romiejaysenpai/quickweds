"use client";
import { useCallback, useEffect, useState } from "react";
import { getCachedSession } from "@/lib/session-cache";
import { useAuth } from "@/context/AuthContext";
type Job = {
  id: string;
  state: string;
  attempts: number;
  created_at: string;
  subject: string;
};
export default function DeliveryRecoveryPanel({
  weddingId,
}: {
  weddingId: string;
}) {
  const { isAdmin } = useAuth();
  const [cursor, setCursor] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [selected, setSelected] = useState("");
  const request = useCallback(
    async (body?: Record<string, unknown>) => {
      const token = (await getCachedSession()).data.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      const response = await fetch(
        `/api/planner/delivery?weddingId=${encodeURIComponent(weddingId)}`,
        {
          method: body ? "POST" : "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify({ ...body, weddingId }) : undefined,
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to load delivery status.");
      return result;
    },
    [weddingId],
  );
  const reload = useCallback(async () => {
    const data = await request();
    setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    setLoaded(true);
  }, [request]);
  useEffect(() => {
    let active = true;
    request()
      .then((data) => {
        if (active) {
          setJobs(Array.isArray(data.jobs) ? data.jobs : []);
          setLoaded(true);
        }
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [request]);
  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const result = await request(body);
      if (body.action === "retry" && !body.jobId)
        setCursor(result.nextCursor || null);
      await reload();
      const failures = result.results?.filter(
        (item: { success: boolean }) => !item.success,
      );
      if (failures?.length)
        setError(
          failures.map((item: { error: string }) => item.error).join(" "),
        );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Recovery failed.");
    } finally {
      setBusy(false);
    }
  }
  const labels: Record<string, string> = {
    queued: "Waiting to send",
    processing: "Processing",
    retryable: "Can retry",
    accepted: "Accepted by email provider",
    failed: "Could not send",
    unknown: "Needs support review",
  };
  return (
    <section
      id="delivery-recovery"
      className="rounded-2xl border border-border bg-white p-4 sm:p-6 space-y-4"
    >
      <h2 className="text-xl font-serif">Email delivery recovery</h2>
      <p className="text-sm">
        Continue queued emails or retry interrupted deliveries, up to five at a
        time. The original recipients and message are preserved. Provider
        acceptance does not guarantee delivery to an inbox.
      </p>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {!loaded && !error && <p role="status">Loading delivery status…</p>}
      <div className="flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={() => act({ action: "retry", afterId: cursor || undefined })}
          className="rounded-lg bg-primary px-4 py-3 text-white disabled:opacity-50"
        >
          {busy ? "Working…" : "Continue queued deliveries"}
        </button>
        <button
          disabled={busy}
          className="underline min-h-[44px]"
          onClick={() => reload().catch((reason) => setError(reason.message))}
        >
          Refresh status
        </button>
      </div>
      {loaded && !jobs.length && <p>No recoverable email operations yet.</p>}
      <ul className="space-y-3">
        {jobs.slice(0, 20).map((job) => (
          <li
            key={job.id}
            className="border-b border-border pb-3 text-sm break-words"
          >
            <strong>{job.subject || "Wedding email"}</strong>
            <p>
              {labels[job.state] || job.state} ·{" "}
              {new Date(job.created_at).toLocaleString()}
            </p>
            {["queued", "retryable", "processing"].includes(job.state) && (
              <button
                disabled={busy}
                className="underline min-h-[44px]"
                onClick={() => act({ action: "retry", jobId: job.id })}
              >
                Retry this delivery
              </button>
            )}
            {["unknown", "failed"].includes(job.state) && (
              <p className="text-xs">
                Contact support before starting another send. Reference:{" "}
                {job.id}
              </p>
            )}
          </li>
        ))}
      </ul>
      {isAdmin && (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void act({
              action: "reconcile",
              jobId: selected,
              providerId: receipt,
            });
          }}
        >
          <h3 className="font-bold">Support: verify a provider receipt</h3>
          <label className="block">
            Email operation
            <select
              required
              className="w-full rounded-lg border p-3"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">Choose an operation</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.subject} · {job.id}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Provider receipt ID
            <input
              required
              className="w-full rounded-lg border p-3"
              value={receipt}
              onChange={(event) => setReceipt(event.target.value)}
            />
          </label>
          <button disabled={busy} className="underline min-h-[44px]">
            Verify and reconcile acceptance
          </button>
        </form>
      )}
    </section>
  );
}

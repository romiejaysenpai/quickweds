"use client";
import { useCallback, useEffect, useState } from "react";
import { getCachedSession } from "@/lib/session-cache";
export default function PhotoRecoveryPanel({
  weddingId,
  onRecovered,
}: {
  weddingId: string;
  onRecovered?: () => void;
}) {
  const [cursors, setCursors] = useState<Record<string, string | undefined>>(
    {},
  );
  const [summary, setSummary] = useState<{
    interruptedUploads: number;
    olderPublicPhotos: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useCallback(
    async (action?: string, afterId?: string) => {
      const token = (await getCachedSession()).data.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      const response = await fetch(
        `/api/photos/recover?weddingId=${encodeURIComponent(weddingId)}`,
        {
          method: action ? "POST" : "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: action
            ? JSON.stringify({ action, weddingId, afterId })
            : undefined,
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to load photo recovery.");
      return data;
    },
    [weddingId],
  );
  useEffect(() => {
    let active = true;
    request()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [request]);
  async function recover(action: string) {
    if (
      action === "privatize" &&
      !window.confirm(
        "Move up to five older guest photos into private storage? Their old public links will stop working after cache expiry. Existing downloaded copies cannot be revoked.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const data = await request(action, cursors[action]);
      setCursors((previous) => ({
        ...previous,
        [action]: data.nextCursor || undefined,
      }));
      setSummary(await request());
      onRecovered?.();
      const problems = data.results.filter(
        (row: { state: string }) => row.state === "needs_review",
      );
      if (problems.length)
        setError(problems.map((row: { error: string }) => row.error).join(" "));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to recover photos.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="my-4 rounded-xl border border-border bg-white p-4 space-y-3">
      <h2 className="font-serif text-xl">Photo recovery and privacy</h2>
      <p className="text-sm">
        Check interrupted uploads after their five-minute processing window.
        Verified images are restored; confirmed missing uploads return their
        reserved quota.
      </p>
      {summary && (
        <p className="text-sm">
          {summary.interruptedUploads} interrupted uploads ·{" "}
          {summary.olderPublicPhotos} older public photos (counts up to 100).
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={() => recover("recover")}
          className="min-h-[44px] rounded-lg border px-4"
        >
          Recover up to 5 uploads
        </button>
        <button
          disabled={busy}
          onClick={() => recover("privatize")}
          className="min-h-[44px] rounded-lg border px-4"
        >
          Move up to 5 older photos to private storage
        </button>
      </div>
    </section>
  );
}

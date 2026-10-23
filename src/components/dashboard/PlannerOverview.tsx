"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import DeliveryRecoveryPanel from "./DeliveryRecoveryPanel";
import { normalizeCurrencyCode } from "@/lib/currency";
import { getCachedSession } from "@/lib/session-cache";
import { guestPartySize, isGuestAttending } from "@/lib/guest-counts";
import { summarizeCatering, csvCell } from "@/lib/planner-progress";
import {
  calculatePlannerBudget,
  calculateInstallmentPaid,
} from "@/lib/planner-budget";

type Row = Record<string, any>;
type Progress = {
  wedding: Row;
  planner_payment_milestones: Row[];
  planner_gifts: Row[];
  planner_activity: Row[];
  rsvps: Row[];
  seating_assignments: Row[];
  planner_tasks: Row[];
  planner_budgets: Row[];
  planner_vendors: Row[];
  planner_food_drinks: Row[];
};
function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function PlannerOverview({ weddingId }: { weddingId: string }) {
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [event, setEvent] = useState("");
  const [kind, setKind] = useState<"gift" | "milestone">("milestone");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [linked, setLinked] = useState("");
  const attempt = useRef<{ fingerprint: string; id: string } | null>(null);
  const request = useCallback(
    async (method = "GET", body?: Row) => {
      const session = await getCachedSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      const response = await fetch(
        `/api/planner/progress?weddingId=${encodeURIComponent(weddingId)}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify({ ...body, weddingId }) : undefined,
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to load planner.");
      return result;
    },
    [weddingId],
  );
  const reload = useCallback(async () => {
    const result = await request();
    setData(result);
  }, [request]);
  useEffect(() => {
    let active = true;
    request()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [request]);
  async function save(body: Row, method = "POST") {
    setBusy(true);
    setError("");
    try {
      await request(method, body);
      if (method === "POST") {
        attempt.current = null;
        setName("");
        setDetail("");
        setAmount("");
        setDate("");
      }
      try {
        await reload();
      } catch {
        setError(
          "Your change was saved. Refresh the overview to see it; do not submit it again.",
        );
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-2xl font-serif">Planning overview</h2>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button
              className="mt-4 underline"
              onClick={() => {
                setError("");
                reload().catch((reason) => setError(reason.message));
              }}
            >
              Retry
            </button>
          </>
        ) : (
          <p role="status">Loading your planning progress…</p>
        )}
      </section>
    );
  const attending = data.rsvps.filter(isGuestAttending);
  const seated = new Set(data.seating_assignments.map((row) => row.rsvp_id));
  const unseated = attending
    .filter((row) => !seated.has(row.id))
    .reduce((sum, row) => sum + guestPartySize(row), 0);
  const incomplete = data.planner_tasks.filter(
    (row) => !["completed", "done"].includes(row.status),
  );
  const overdue = incomplete.filter(
    (row) => row.due_date && new Date(row.due_date).getTime() < Date.now(),
  );
  const catering = summarizeCatering(
    data.rsvps as Parameters<typeof summarizeCatering>[0],
    event || undefined,
  );
  const totals = calculatePlannerBudget(
    data.planner_budgets,
    data.planner_vendors,
    data.planner_food_drinks,
  );
  const installmentPaid = calculateInstallmentPaid(
    data.planner_budgets as Parameters<typeof calculateInstallmentPaid>[0],
    data.planner_vendors as Parameters<typeof calculateInstallmentPaid>[1],
    data.planner_payment_milestones,
  );
  const outstanding = Math.max(
    0,
    totals.committed - totals.paid - installmentPaid,
  );
  const pendingPayments = data.planner_payment_milestones
    .filter((row) => !row.paid_at)
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)));
  const money = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: normalizeCurrencyCode(data.wedding.currency),
    }).format(value);
  const box = "rounded-2xl border border-border bg-white p-4 sm:p-6 space-y-4";
  const input = "w-full rounded-lg border border-border p-3 min-h-[44px]";
  return (
    <div className="space-y-5">
      <DeliveryRecoveryPanel weddingId={weddingId} />
      <section className={box}>
        <h1 className="text-2xl font-serif">Planning overview</h1>
        <p className="text-sm text-text-secondary">
          Review the details that still need your attention. Payment and
          thank-you completion are records you manage manually.
        </p>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            [`${incomplete.length} open tasks`, `${overdue.length} overdue`],
            [`${unseated} people unseated`, "Confirmed guests only"],
            [money(outstanding), "Outstanding recorded costs"],
            [
              String(
                data.planner_gifts.filter((row) => !row.thank_you_completed_at)
                  .length,
              ),
              "Gifts awaiting thanks",
            ],
          ].map(([label, caption]) => (
            <div key={caption} className="rounded-xl bg-neutral p-3">
              <strong className="block break-words">{label}</strong>
              <span className="text-xs">{caption}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm underline">
          <Link href={`/dashboard/${weddingId}/wedding-day/coordinator-report`}>
            Open coordinator handoff
          </Link>
          <Link href={`/dashboard/${weddingId}`}>
            Review invitation and guests
          </Link>
          <button
            disabled={busy}
            onClick={() => {
              setBusy(true);
              request()
                .then((fresh) =>
                  download(
                    `quickweds-${weddingId}-planning-archive.json`,
                    JSON.stringify(
                      { exportedAt: new Date().toISOString(), ...fresh },
                      null,
                      2,
                    ),
                    "application/json",
                  ),
                )
                .catch((reason) => setError(reason.message))
                .finally(() => setBusy(false));
            }}
          >
            Download private planning archive
          </button>
        </div>
        <p className="text-xs text-text-secondary">
          The archive contains personal planning and guest information. Store it
          securely. Photos and older activity are separate.
        </p>
      </section>
      <section className={box}>
        <h2 className="text-xl font-serif">Caterer summary</h2>
        <label className="block">
          Attendance for
          <select
            className={input}
            value={event}
            onChange={(e) => setEvent(e.target.value)}
          >
            <option value="">Wedding overall</option>
            {(data.wedding.rsvp_events || []).map((item: Row) => (
              <option key={item.id} value={item.id}>
                {item.name || item.title || item.id}
              </option>
            ))}
          </select>
        </label>
        <p>
          {catering.people} people across {catering.parties} parties ·{" "}
          {catering.children} children · {catering.unresolved} unresolved
          responses
        </p>
        <p className="text-sm text-text-secondary">
          Preferences are recorded per RSVP party. Confirm individual meal
          quantities and allergies directly with guests.
        </p>
        <button
          className="underline min-h-[44px]"
          onClick={() =>
            download(
              "caterer-summary.csv",
              [
                [
                  "Guest / party",
                  "People",
                  "Children",
                  "Party meal preference",
                  "Dietary notes",
                ],
                ...catering.rows.map((row) => [
                  row.name,
                  row.people,
                  row.children,
                  row.preference,
                  row.dietary,
                ]),
              ]
                .map((row) => row.map(csvCell).join(","))
                .join("\r\n"),
              "text/csv;charset=utf-8",
            )
          }
        >
          Download caterer CSV
        </button>
      </section>
      <section className={box}>
        <h2 className="text-xl font-serif">Deposits and installments</h2>
        <p className="text-sm">
          Link installments to an existing supplier or budget item. They divide
          a recorded cost and do not add another expense.
        </p>
        {pendingPayments.length === 0 && (
          <p>No upcoming payment dates recorded.</p>
        )}
        <ul className="space-y-3">
          {data.planner_payment_milestones.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3"
            >
              <span>
                {row.title} · {money(Number(row.amount))} · {row.due_date}
                {row.paid_at ? " · Paid" : ""}
              </span>
              <button
                disabled={busy}
                className="underline min-h-[44px]"
                onClick={() =>
                  save(
                    { id: row.id, type: "milestone", complete: !row.paid_at },
                    "PATCH",
                  )
                }
              >
                {row.paid_at ? "Mark unpaid" : "Mark paid"}
              </button>
              <button
                disabled={busy}
                className="min-h-[44px] underline text-red-700"
                onClick={() => {
                  if (window.confirm("Remove this installment record?"))
                    void save({ id: row.id, type: "milestone" }, "DELETE");
                }}
              >
                Remove installment
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className={box}>
        <h2 className="text-xl font-serif">Gifts and thank-you completion</h2>
        {data.planner_gifts.length === 0 && <p>No gifts recorded yet.</p>}
        <ul className="space-y-3">
          {data.planner_gifts.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3"
            >
              <span className="break-words">
                {row.from_name} · {row.description}
                {row.thank_you_completed_at ? " · Thanked" : ""}
              </span>
              <button
                disabled={busy}
                className="underline min-h-[44px]"
                onClick={() =>
                  save(
                    {
                      id: row.id,
                      type: "gift",
                      complete: !row.thank_you_completed_at,
                    },
                    "PATCH",
                  )
                }
              >
                {row.thank_you_completed_at
                  ? "Mark not thanked"
                  : "Mark thanked"}
              </button>
              <button
                disabled={busy}
                className="min-h-[44px] underline text-red-700"
                onClick={() => {
                  if (window.confirm("Remove this gift record?"))
                    void save({ id: row.id, type: "gift" }, "DELETE");
                }}
              >
                Remove gift
              </button>
            </li>
          ))}
        </ul>
        <Link
          className="inline-block underline min-h-[44px]"
          href={`/dashboard/${weddingId}/planner?tab=thanks`}
        >
          Compose thank-you notes
        </Link>
      </section>
      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          const values =
            kind === "gift"
              ? {
                  type: kind,
                  from_name: name,
                  description: detail,
                  rsvp_id: linked || null,
                }
              : {
                  type: kind,
                  title: name,
                  amount,
                  due_date: date,
                  planner_vendor_id: linked.startsWith("vendor:")
                    ? linked.slice(7)
                    : null,
                  planner_budget_id: linked.startsWith("budget:")
                    ? linked.slice(7)
                    : null,
                };
          const fingerprint = JSON.stringify(values);
          if (attempt.current?.fingerprint !== fingerprint)
            attempt.current = { fingerprint, id: crypto.randomUUID() };
          void save({ ...values, id: attempt.current.id });
        }}
      >
        <h2 className="text-xl font-serif">Add a record</h2>
        <label className="block">
          Record type
          <select
            className={input}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as "gift" | "milestone");
              setLinked("");
            }}
          >
            <option value="milestone">Payment installment</option>
            <option value="gift">Gift received</option>
          </select>
        </label>
        <label className="block">
          {kind === "gift" ? "From" : "Payment name"}
          <input
            required
            maxLength={200}
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block">
          {kind === "gift" ? "Guest (optional)" : "Existing cost item"}
          <select
            className={input}
            required={kind === "milestone"}
            value={linked}
            onChange={(e) => setLinked(e.target.value)}
          >
            <option value="">Choose an item</option>
            {kind === "gift" ? (
              data.rsvps.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.guest_name}
                </option>
              ))
            ) : (
              <>
                {data.planner_vendors.map((row) => (
                  <option key={row.id} value={`vendor:${row.id}`}>
                    Supplier: {row.name}
                  </option>
                ))}
                {data.planner_budgets.map((row) => (
                  <option key={row.id} value={`budget:${row.id}`}>
                    Budget: {row.item_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
        {kind === "gift" ? (
          <label className="block">
            Gift details
            <textarea
              required
              maxLength={1000}
              className={input}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </label>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <label>
              Amount ({data.wedding.currency || "USD"})
              <input
                type="number"
                min="0.01"
                max="999999999"
                step="0.01"
                required
                className={input}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              Due date
              <input
                type="date"
                required
                className={input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
        )}
        <button
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-3 text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save record"}
        </button>
      </form>
      <section className={box}>
        <h2 className="text-xl font-serif">Recent planning activity</h2>
        <p className="text-sm text-text-secondary">
          Latest 100 changes since activity tracking was enabled. Server actions
          are shown without an individual identity.
        </p>
        <ul className="space-y-2">
          {data.planner_activity.map((row) => (
            <li key={row.id} className="text-sm break-words">
              {new Date(row.created_at).toLocaleString()} ·{" "}
              {String(row.entity_type).replaceAll("_", " ")} ·{" "}
              {row.action.toLowerCase()} ·{" "}
              {row.actor_id ? "Signed-in planner" : "Server action"}
            </li>
          ))}
        </ul>
        {!data.planner_activity.length && <p>No activity recorded yet.</p>}
      </section>
    </div>
  );
}

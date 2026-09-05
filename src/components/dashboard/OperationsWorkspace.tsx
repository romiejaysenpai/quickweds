"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { vendorBalance } from "@/lib/expense-summary";
import { trackProductEvent } from "@/lib/product-events";

export default function OperationsWorkspace({
  weddingId,
}: {
  weddingId?: string;
}) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState<Array<{ name: string; url: string }>>([]);
  const [kind, setKind] = useState("task");
  const [tab, setTab] = useState("today");
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentKey, setPaymentKey] = useState("");
  const [notifyOwner, setNotifyOwner] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const headers = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token || ""}`,
    };
  }, []);
  const load = useCallback(async () => {
    const response = await fetch(
      weddingId
        ? `/api/operations?weddingId=${encodeURIComponent(weddingId)}`
        : "/api/operations/portfolio",
      { headers: await headers(), cache: "no-store" },
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setData(result);
  }, [weddingId, headers]);
  useEffect(() => {
    void load().catch((error) => setError(error.message));
  }, [load]);
  useEffect(() => {
    const interval = setInterval(
      () => void load().catch(() => undefined),
      30000,
    );
    return () => clearInterval(interval);
  }, [load]);
  async function act(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/operations", {
        method: "POST",
        headers: await headers(),
        body: JSON.stringify({ weddingId, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.links) setLinks(result.links);
      if (result.link)
        setLinks([
          {
            name: String(payload.title || "Private briefing"),
            url: location.origin + result.link,
          },
        ]);
      if (result.preview) {
        setPreview(result.preview);
        setSelectedDates(result.preview.map((item: any) => item.id));
      }
      setNotice(
        result.queued != null
          ? `${result.queued} reminders queued. Track their outcomes below.`
          : result.preview
            ? "Review the proposed dates below."
            : "Saved.",
      );
      await load();
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const button =
    "min-h-12 rounded-xl border border-primary/25 px-4 py-3 font-bold text-primary disabled:opacity-50";
  const field = "min-h-12 w-full rounded-xl border p-3 text-base bg-white";
  if (!data)
    return (
      <div className="p-6" role="status">
        {error || "Loading wedding work…"}{" "}
        <button
          className={button}
          onClick={() => void load().catch((e) => setError(e.message))}
        >
          Retry
        </button>
      </div>
    );
  if (!weddingId)
    return (
      <section className="rounded-3xl bg-white p-5 sm:p-8 space-y-5">
        <div className="flex justify-between gap-4">
          <h1 className="text-2xl font-serif">
            Needs attention across your weddings
          </h1>
          <button
            className={button}
            onClick={() => void load().catch((e) => setError(e.message))}
          >
            Refresh
          </button>
        </div>
        <p>
          Owned and accepted shared weddings. Open an item to work in that
          wedding.
        </p>
        {!data.weddings.length && (
          <p>Create a wedding or accept a collaborator invitation to begin.</p>
        )}
        {data.weddings.map((w: any) => (
          <Link
            className="inline-flex min-h-12 items-center rounded-xl border px-4 mr-3"
            key={w.id}
            href={`/dashboard/${w.id}/operations`}
          >
            {w.bride_name} &amp; {w.groom_name} · {w.wedding_date}
          </Link>
        ))}
        <div className="divide-y">
          {data.attention.map((item: any) => {
            const wedding = data.weddings.find(
              (w: any) => w.id === item.wedding_id,
            );
            return (
              <Link
                key={`${item.kind}-${item.id}`}
                href={`/dashboard/${item.wedding_id}/operations`}
                className="block py-4"
              >
                <strong>{item.label}</strong>
                <p>
                  {wedding?.bride_name} &amp; {wedding?.groom_name}
                  {item.due_at
                    ? ` · ${new Date(item.due_at).toLocaleString()}`
                    : ""}
                </p>
              </Link>
            );
          })}
        </div>
        {!data.attention.length && data.weddings.length > 0 && (
          <p>
            No outstanding items found. Keep your tasks and guest list current.
          </p>
        )}
      </section>
    );
  const confirmed = data.guests.filter(
    (guest: any) => guest.rsvp_status === "confirmed",
  );
  const people = confirmed.reduce(
    (sum: number, g: any) => sum + Math.max(1, Number(g.num_guests) || 1),
    0,
  );
  function downloadHandover() {
    // A standalone printable document stays usable without network or account access.
    const escape = (value: unknown) =>
      String(value ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c]!,
      );
    const rows = data.guests
      .map((guest: any) => {
        const assignment = data.assignments.find(
          (a: any) => a.rsvp_id === guest.id,
        );
        const table = data.tables.find(
          (t: any) => t.id === assignment?.table_id,
        );
        return `<tr><td>${escape(guest.guest_name)}</td><td>${escape(guest.num_guests)}</td><td>${escape(guest.rsvp_status)}</td><td>${escape(table?.table_name || guest.table_assignment || "Ask reception")}</td><td>□</td></tr>`;
      })
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Wedding handover</title><style>body{font:16px system-ui;margin:32px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aaa;padding:10px;text-align:left}</style></head><body><h1>${escape(data.wedding.bride_name)} &amp; ${escape(data.wedding.groom_name)}</h1><p>Downloaded ${escape(new Date().toLocaleString())}. Re-download after changes. Keep this guest list private; delete after handover.</p><p>${escape(data.wedding.wedding_date)} ${escape(data.wedding.wedding_time)} ${escape(data.wedding.event_timezone)}</p><p>${escape(data.wedding.venue_name)} · ${escape(data.wedding.venue_address)}</p><p>Help: ${escape(data.wedding.contact_person)}</p><table><tr><th>Guest</th><th>Party</th><th>RSVP</th><th>Table</th><th>Arrived</th></tr>${rows}</table><h2>Vendor contacts</h2>${data.vendors.map((v: any) => `<p>${escape(v.name)} · ${escape(v.phone)} · ${escape(v.email)}</p>`).join("")}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-handover-${weddingId}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadCloseoutArchive() {
    const archive = {
      exportedAt: new Date().toISOString(),
      wedding: data.wedding,
      guests: data.guests,
      tables: data.tables,
      assignments: data.assignments,
      vendors: data.vendors,
      budgets: data.budgets,
      operations: data.items,
      deliveries: data.deliveries,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(archive, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `quickweds-archive-${weddingId}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function shareQuickWeds() {
    const referral = `${location.origin}/?ref=wedding_complete`;
    const nativeShare = typeof navigator.share === "function";
    if (nativeShare) {
      await navigator.share({
        title: "Plan your wedding with QuickWeds",
        text: "QuickWeds kept our wedding plans, guests and wedding-day details together.",
        url: referral,
      });
    } else {
      await navigator.clipboard.writeText(referral);
    }
    const { data: session } = await supabase.auth.getSession();
    if (session.session)
      void trackProductEvent(
        "referral_shared",
        session.session.access_token,
        weddingId,
      );
    setNotice(
      nativeShare ? "Shared. Thank you." : "Referral link copied. Thank you.",
    );
  }
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 space-y-3">
        <Link href="/coordinator" className="text-primary">
          All weddings
        </Link>
        <h1 className="font-serif text-3xl">
          {data.wedding.bride_name} &amp; {data.wedding.groom_name}
        </h1>
        <p>
          {data.wedding.wedding_date} · {data.wedding.event_timezone} · Updated{" "}
          {new Date(data.generatedAt).toLocaleTimeString()}
        </p>
        <p>
          {people} confirmed people · {confirmed.length} confirmed households ·{" "}
          {data.guests.filter((g: any) => g.rsvp_status === "pending").length}{" "}
          awaiting response
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className={button} href={`/dashboard/${weddingId}/planner`}>
            Planner
          </Link>
          <Link className={button} href={`/dashboard/${weddingId}/check-in`}>
            Check-in
          </Link>
          <Link className={button} href={`/dashboard/${weddingId}/thank-you`}>
            Review thank-yous
          </Link>
          <button className={button} onClick={downloadHandover}>
            Download offline handover
          </button>
          <button
            className={button}
            onClick={() => void load().catch((e) => setError(e.message))}
          >
            Refresh
          </button>
        </div>
      </header>
      <nav
        aria-label="Wedding operations"
        className="flex gap-2 overflow-x-auto"
      >
        {[
          ["today", "Today"],
          ["invitations", "Invitations"],
          ["payments", "Payments"],
          ["planning", "Planning"],
          ["settings", "Settings"],
          ["closeout", "Closeout"],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            className={button}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <p role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="p-4 bg-emerald-50 rounded-xl">
          {notice}
        </p>
      )}
      <section
        hidden={tab !== "today"}
        className="rounded-3xl bg-white p-6 space-y-4"
      >
        <h2 className="text-xl font-bold">Next actions</h2>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const key = paymentKey || crypto.randomUUID();
            setPaymentKey(key);
            if (
              await act({
                action: "create",
                kind,
                title,
                ownerEmail: owner,
                dueAt: due ? new Date(due).toISOString() : null,
                data: {
                  notes,
                  vendorId,
                  amount: Number(amount),
                  requestId: key,
                  notifyOwner,
                },
              })
            ) {
              setTitle("");
              setNotes("");
              setPaymentKey("");
            }
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label>
            Type
            <select
              className={field}
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="task">Task</option>
              <option value="vendor_brief">Vendor briefing</option>
              <option value="payment">Record vendor payment</option>
              <option value="incident">Wedding-day issue</option>
              <option value="helper">Temporary check-in helper</option>
              <option value="closeout">Closeout item</option>
            </select>
          </label>
          <label>
            Title
            <input
              className={field}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to happen?"
            />
          </label>
          {kind === "payment" ? (
            <>
              <label>
                Vendor
                <select
                  required
                  className={field}
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                >
                  <option value="">Choose vendor</option>
                  {data.vendors.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Amount actually paid
                <input
                  className={field}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Responsible email
                <input
                  type="email"
                  className={field}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </label>
              <label>
                {kind === "helper"
                  ? "Access expires (your local time)"
                  : "Due / arrival (your local time)"}
                <input
                  required={kind === "helper"}
                  type="datetime-local"
                  className={field}
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </label>
            </>
          )}
          <label className="sm:col-span-2">
            Instructions
            <textarea
              className={field}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Location, arrival details, deliverables and contact person"
            />
          </label>
          {kind !== "payment" && (
            <label className="sm:col-span-2 flex gap-3 items-center min-h-12">
              <input
                type="checkbox"
                checked={notifyOwner}
                onChange={(e) => setNotifyOwner(e.target.checked)}
              />
              Email the responsible person (tasks at their due time; briefings
              now)
            </label>
          )}
          <button
            disabled={busy || (notifyOwner && !owner && kind !== "payment")}
            className={button}
          >
            Save{" "}
            {kind === "payment"
              ? "payment"
              : notifyOwner
                ? "and approve email"
                : "action"}
          </button>
        </form>
        {data.items
          .filter((item: any) => item.kind !== "audit")
          .map((item: any) => (
            <div
              key={item.id}
              className="border-t py-3 flex flex-wrap justify-between gap-3"
            >
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.kind.replace("_", " ")} · {item.status} ·{" "}
                  {item.owner_email || "Unassigned"}
                  {item.due_at
                    ? ` · ${new Date(item.due_at).toLocaleString()}`
                    : ""}
                </p>
                <p>{item.data.notes}</p>
              </div>
              {item.status === "pending" && (
                <button
                  disabled={busy}
                  className={button}
                  onClick={() =>
                    void act({
                      action: "update",
                      id: item.id,
                      version: item.version,
                      status: item.kind === "helper" ? "cancelled" : "done",
                    })
                  }
                >
                  {item.kind === "helper" ? "Revoke access" : "Mark done"}
                </button>
              )}
            </div>
          ))}
      </section>
      <section
        hidden={tab !== "invitations"}
        className="rounded-3xl bg-white p-6 space-y-4"
      >
        <h2 className="text-xl font-bold">Invitations and reminders</h2>
        <p>
          Generate private response links for imported households. Review the
          named recipient before sharing. Generating links sends no messages.
        </p>
        <button
          disabled={busy}
          className={button}
          onClick={() => void act({ action: "invitations" })}
        >
          Generate household invitation links
        </button>
        {links.map((link) => (
          <div key={link.url} className="rounded-xl border p-3 break-all">
            <strong>{link.name}</strong>
            <p>{link.url}</p>
            <button
              className={button}
              onClick={() =>
                void navigator.clipboard
                  .writeText(link.url)
                  .then(() => setNotice("Private link copied."))
                  .catch(() => setError("Select and copy the link above."))
              }
            >
              Copy private link
            </button>
          </div>
        ))}
        <label className="block">
          Reminder send time (your local time)
          <input
            className={field}
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </label>
        <button
          disabled={busy || !due}
          className={button}
          onClick={() =>
            void act({ action: "schedule", dueAt: new Date(due).toISOString() })
          }
        >
          Approve RSVP reminder for pending households
        </button>
        <p>
          Only guests with personal links and email addresses are included.
          Replies and closed weddings are rechecked before sending.
        </p>
        {data.deliveries.map((d: any) => (
          <div key={d.id}>
            {d.recipient} · {d.status} · {new Date(d.due_at).toLocaleString()}
            {d.last_error ? ` · ${d.last_error}` : ""}
            {["queued", "failed"].includes(d.status) && (
              <button
                disabled={busy}
                className={button}
                onClick={() =>
                  void act({ action: "cancel_delivery", id: d.id })
                }
              >
                Cancel send
              </button>
            )}
          </div>
        ))}
      </section>
      <section
        hidden={tab !== "payments"}
        className="rounded-3xl bg-white p-6 space-y-4"
      >
        <h2 className="text-xl font-bold">Payment facts</h2>
        <p>
          Unrecorded payments are unknown. Link a budget item to its vendor to
          avoid counting the same expense twice. When starting a payment
          history, record all previously paid amounts first.
        </p>
        {data.vendors.map((vendor: any) => {
          const balance = vendorBalance(vendor);
          return (
            <p key={vendor.id}>
              {vendor.name}: contract {vendor.amount || 0} · paid{" "}
              {balance.paid ?? "unrecorded"} · outstanding{" "}
              {balance.balance ?? "unknown"}
            </p>
          );
        })}
        {(data.budgets || []).map((budget: any) => (
          <label key={budget.id} className="block">
            {budget.item_name}
            <select
              className={field}
              value={budget.planner_vendor_id || ""}
              disabled={busy}
              onChange={(e) =>
                void act({
                  action: "link_expense",
                  data: {
                    budgetId: budget.id,
                    vendorId: e.target.value || null,
                  },
                })
              }
            >
              <option value="">Independent expense</option>
              {data.vendors.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </section>
      <section
        hidden={tab !== "planning"}
        className="rounded-3xl bg-white p-6 space-y-4"
      >
        <h2 className="text-xl font-bold">Reusable planning</h2>
        <button
          disabled={busy}
          className={button}
          onClick={() =>
            void act({
              action: "playbook_save",
              title: `${data.wedding.bride_name} & ${data.wedding.groom_name} checklist`,
            })
          }
        >
          Save planner checklist as playbook
        </button>
        <button
          disabled={busy}
          className={button}
          onClick={() => void act({ action: "playbook_apply" })}
        >
          Apply my latest playbook
        </button>
        <p>
          Only task titles and relative dates are reused. Guest details,
          payments and previous messages are excluded.
        </p>
        <label className="block">
          Preview a new wedding date
          <input
            className={field}
            type="date"
            value={proposedDate}
            onChange={(e) => {
              setProposedDate(e.target.value);
              if (e.target.value)
                void act({ action: "rebase", data: { date: e.target.value } });
            }}
          />
        </label>
        {preview.map((item) => (
          <label className="flex items-center min-h-12 gap-3" key={item.id}>
            <input
              type="checkbox"
              checked={selectedDates.includes(item.id)}
              onChange={(e) =>
                setSelectedDates((ids) =>
                  e.target.checked
                    ? [...ids, item.id]
                    : ids.filter((id) => id !== item.id),
                )
              }
            />
            {item.title}: {new Date(item.due_at).toLocaleDateString()} →{" "}
            {new Date(item.proposed).toLocaleDateString()}
          </label>
        ))}
        {proposedDate && (
          <>
            <p>
              Uncheck fixed contractual dates. Applying changes cancels queued
              reminders so you can approve the revised schedule.
            </p>
            <button
              disabled={busy}
              className={button}
              onClick={() =>
                void act({
                  action: "rebase_apply",
                  data: {
                    date: proposedDate,
                    expectedDate: data.wedding.wedding_date,
                    ids: selectedDates,
                  },
                })
              }
            >
              Apply wedding date and selected task changes
            </button>
          </>
        )}
      </section>
      <section
        hidden={tab !== "settings"}
        className="rounded-3xl bg-white p-6 space-y-4"
      >
        <h2 className="text-xl font-bold">Timezone and external RSVP</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const values = new FormData(e.currentTarget);
            void act({
              action: "settings",
              data: {
                timeZone: values.get("zone"),
                embedOrigins: String(values.get("origins") || "")
                  .split(/[\n,]/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            });
          }}
        >
          <label>
            Wedding timezone
            <input
              className={field}
              name="zone"
              defaultValue={data.wedding.event_timezone}
              placeholder="Asia/Manila"
            />
          </label>
          <label className="block">
            Websites allowed to embed RSVP (HTTPS origins, one per line)
            <textarea
              className={field}
              name="origins"
              defaultValue={(
                data.wedding.operations_settings?.embedOrigins || []
              ).join("\n")}
              placeholder="https://ourwedding.example"
            />
          </label>
          <button disabled={busy} className={button}>
            Save settings
          </button>
        </form>
        <label className="block">
          Embed code
          <textarea
            readOnly
            className={field}
            value={`<iframe src="${typeof location === "undefined" ? "" : location.origin}/embed/${weddingId}" title="Wedding RSVP" style="width:100%;min-height:700px;border:0"></iframe>`}
          />
        </label>
        <a
          className={button}
          href={`/embed/${weddingId}`}
          target="_blank"
          rel="noreferrer"
        >
          Test RSVP widget
        </a>
        <p>
          Publish your invitation first. For event-specific answers, guests can
          open the full invitation from the widget.
        </p>
      </section>
      <section
        hidden={tab !== "closeout"}
        className="rounded-3xl bg-white p-6 space-y-4"
      >
        <h2 className="text-xl font-bold">Finish and hand over</h2>
        <p>
          Review the live checks below. Completing the wedding turns on memories
          mode, stops queued RSVP reminders and revokes temporary helpers. Guest
          links remain available.
        </p>
        <ul className="space-y-2">
          <li>
            {data.deliveries.some(
              (delivery: any) => delivery.status === "failed",
            )
              ? "Needs review"
              : "Clear"}
            : failed messages
          </li>
          <li>
            {data.vendors.some(
              (vendor: any) =>
                vendorBalance(vendor).balance === null ||
                Number(vendorBalance(vendor).balance) > 0,
            )
              ? "Needs review"
              : "Clear"}
            : vendor payment records
          </li>
          <li>
            {data.thankYouUnsent?.length || 0} guests still need a reviewed
            thank-you
          </li>
        </ul>
        {data.thankYouUnsent?.length > 0 && (
          <div className="rounded-xl border p-4">
            <p>
              {data.thankYouUnsent
                .slice(0, 8)
                .map((guest: any) => guest.name)
                .join(", ")}
              {data.thankYouUnsent.length > 8 ? " and more" : ""}
            </p>
            <Link className={button} href={`/dashboard/${weddingId}/thank-you`}>
              Review thank-you queue
            </Link>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button className={button} onClick={downloadCloseoutArchive}>
            Download private archive
          </button>
          {data.wedding.photo_album_link && (
            <a
              className={button}
              href={data.wedding.photo_album_link}
              rel="noreferrer"
            >
              Review wedding album
            </a>
          )}
        </div>
        {data.wedding.completed_at ? (
          <div className="space-y-3">
            <p role="status">
              Completed {new Date(data.wedding.completed_at).toLocaleString()}.
              This wedding is archived from the active coordinator portfolio.
            </p>
            <button
              className={button}
              onClick={() =>
                void shareQuickWeds().catch(() =>
                  setError("Unable to share right now."),
                )
              }
            >
              Recommend QuickWeds
            </button>
          </div>
        ) : (
          <button
            disabled={busy}
            className={button}
            onClick={() => {
              if (
                window.confirm(
                  "Confirm the wedding has finished and revoke temporary helper access?",
                )
              )
                void act({ action: "complete", data: { archive: true } });
            }}
          >
            Complete wedding and archive from portfolio
          </button>
        )}
      </section>
    </div>
  );
}

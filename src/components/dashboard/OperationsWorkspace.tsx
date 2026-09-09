"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  Users,
  LayoutGrid,
  Heart,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  ClipboardList,
  Sparkles,
  Search,
  X,
  Mail,
  Settings,
  Download,
  UserCheck,
  HeartHandshake,
  Copy,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { vendorBalance } from "@/lib/expense-summary";
import { trackProductEvent } from "@/lib/product-events";

function getAttentionKindMeta(kind: string) {
  switch (kind) {
    case "delivery":
      return {
        label: "Email Failure",
        badgeClass: "bg-error-bg text-error-text border-error-text/30",
        icon: AlertCircle,
        iconClass: "text-error-text bg-error-bg border border-error-text/20",
        borderClass: "border-error-text/40 hover:border-error-text/70",
      };
    case "checklist":
      return {
        label: "Checklist Due",
        badgeClass: "bg-neutral text-text-secondary border-border",
        icon: Clock,
        iconClass: "text-accent bg-neutral border border-border",
        borderClass: "border-border hover:border-accent/60",
      };
    case "guests":
      return {
        label: "RSVP Pending",
        badgeClass: "bg-neutral text-text-secondary border-border",
        icon: Users,
        iconClass: "text-primary bg-neutral border border-border",
        borderClass: "border-border hover:border-primary/40",
      };
    case "seating":
      return {
        label: "Seating Needed",
        badgeClass: "bg-neutral text-text-secondary border-border",
        icon: LayoutGrid,
        iconClass: "text-accent bg-neutral border border-border",
        borderClass: "border-border hover:border-accent/60",
      };
    case "incident":
      return {
        label: "Day-of Incident",
        badgeClass: "bg-error-bg text-error-text border-error-text/30",
        icon: AlertTriangle,
        iconClass: "text-error-text bg-error-bg border border-error-text/20",
        borderClass: "border-error-text/40 hover:border-error-text/70",
      };
    case "payment":
      return {
        label: "Vendor Payment",
        badgeClass: "bg-success-bg text-foreground border-border",
        icon: DollarSign,
        iconClass: "text-accent bg-success-bg border border-border",
        borderClass: "border-border hover:border-accent/60",
      };
    default:
      return {
        label: "Action Item",
        badgeClass: "bg-neutral text-text-secondary border-border",
        icon: ClipboardList,
        iconClass: "text-primary bg-neutral border border-border",
        borderClass: "border-border hover:border-primary/40",
      };
  }
}

function formatDueAt(dueAt: string) {
  try {
    const d = new Date(dueAt);
    if (isNaN(d.getTime())) return dueAt;
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} · ${timeStr}`;
  } catch {
    return dueAt;
  }
}

export default function OperationsWorkspace({
  weddingId,
}: {
  weddingId?: string;
}) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
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
  const [weddingSearch, setWeddingSearch] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError("");
    try {
      await load();
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to refresh.");
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    void load()
      .then(() => setLastRefreshedAt(new Date()))
      .catch((error) => setError(error.message));
  }, [load]);

  useEffect(() => {
    const interval = setInterval(
      () =>
        void load()
          .then(() => setLastRefreshedAt(new Date()))
          .catch(() => undefined),
      30000,
    );
    return () => clearInterval(interval);
  }, [load]);

  async function act(payload: Record<string, unknown>) {
    // Optimistic update for task completion / status updates so the UI responds in 0ms
    if (payload.action === "update" && payload.id) {
      const targetId = String(payload.id);
      const nextStatus = String(payload.status || "done");
      setData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: (prev.items || []).map((it: any) =>
            it.id === targetId ? { ...it, status: nextStatus } : it
          ),
          attention: (prev.attention || []).filter((at: any) => at.id !== targetId),
        };
      });
    } else {
      setBusy(true);
    }
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
      await load().catch(() => {});
      return false;
    } finally {
      setBusy(false);
    }
  }

  const button =
    "inline-flex items-center justify-center min-h-11 rounded-xl border border-border bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-primary shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const field =
    "min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-text-secondary/50 focus:border-primary focus:outline-hidden transition";

  if (!data) {
    if (error) {
      const isAuthError = error.toLowerCase().includes("sign in");
      return (
        <div className="rounded-3xl border border-border/80 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-serif text-xl font-black text-foreground sm:text-2xl">
            {isAuthError ? "Sign In Required" : "Unable to load wedding work"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            {isAuthError
              ? "Please sign in to your QuickWeds account to view your coordinator operations and attention items."
              : error}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isAuthError ? (
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
              >
                Sign In to QuickWeds
              </Link>
            ) : (
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
                onClick={() => {
                  setError("");
                  void handleRefresh();
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Retry Loading
              </button>
            )}
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-text-secondary transition hover:bg-neutral active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-28 rounded-full bg-neutral animate-pulse border border-border/50" />
          <div className="h-10 w-24 rounded-xl bg-neutral animate-pulse border border-border/50" />
        </div>

        <div className="space-y-2">
          <div className="h-7 w-3/4 max-w-sm rounded-lg bg-neutral animate-pulse border border-border/50" />
          <div className="h-4 w-1/2 max-w-xs rounded bg-neutral/80 animate-pulse" />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-neutral animate-pulse border border-border/40" />
          ))}
        </div>

        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-44 shrink-0 rounded-xl bg-neutral animate-pulse border border-border/40" />
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <div className="h-4 w-32 rounded bg-neutral animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-border/60 bg-neutral/40 p-4 animate-pulse" />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-text-secondary">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          <span>Loading operations across your weddings…</span>
        </div>
      </div>
    );
  }

  if (!weddingId) {
    const attentionCount = data.attention?.length || 0;
    const weddingsCount = data.weddings?.length || 0;
    const deliveryFailures = (data.attention || []).filter(
      (a: any) => a.kind === "delivery"
    ).length;
    const filteredWeddings = (data.weddings || []).filter((w: any) => {
      if (!weddingSearch.trim()) return true;
      const q = weddingSearch.toLowerCase();
      const couple = `${w.bride_name || ""} ${w.groom_name || ""}`.toLowerCase();
      const date = (w.wedding_date || "").toLowerCase();
      return couple.includes(q) || date.includes(q);
    });

    return (
      <section className="rounded-3xl border border-border/80 bg-white p-4 shadow-sm sm:p-8 space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-text-secondary transition hover:bg-neutral hover:text-primary active:scale-95 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            {lastRefreshedAt && (
              <span className="hidden text-[11px] font-medium text-text-secondary/70 sm:inline-block">
                Updated {lastRefreshedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
            <button
              type="button"
              disabled={isRefreshing || busy}
              onClick={handleRefresh}
              aria-label="Refresh attention items"
              className="inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs sm:text-sm font-bold text-primary shadow-xs transition active:scale-95 hover:bg-neutral hover:border-primary/40 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 shrink-0 transition-transform ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Header Title Section */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-neutral px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-text-secondary shadow-2xs">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="text-foreground">Coordinator Hub</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Needs attention across weddings
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Owned and shared weddings requiring review, guest follow-ups, or wedding-day actions.
          </p>
        </div>

        {/* Global Error/Notice banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-error-text/30 bg-error-bg p-3.5 text-xs sm:text-sm text-error-text"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-error-text mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-xs font-bold text-error-text hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {notice && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-2xl border border-border bg-success-bg p-3.5 text-xs sm:text-sm text-foreground"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent mt-0.5" />
            <div className="flex-1 font-medium">{notice}</div>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Phone-Optimized Micro Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl border border-border bg-neutral/50 p-2.5 sm:p-3.5 text-center transition">
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-primary mb-1 sm:h-8 sm:w-8">
              <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-text-secondary">
              Urgent Items
            </p>
            <p className="font-serif text-lg sm:text-2xl font-black text-foreground">
              {attentionCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-neutral/50 p-2.5 sm:p-3.5 text-center transition">
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-primary mb-1 sm:h-8 sm:w-8">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-text-secondary">
              Weddings
            </p>
            <p className="font-serif text-lg sm:text-2xl font-black text-foreground">
              {weddingsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-neutral/50 p-2.5 sm:p-3.5 text-center transition">
            <div
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg mb-1 sm:h-8 sm:w-8 border ${
                deliveryFailures > 0
                  ? "bg-error-bg text-error-text border-error-text/30"
                  : attentionCount > 0
                  ? "bg-neutral text-accent border-border"
                  : "bg-success-bg text-foreground border-border"
              }`}
            >
              {deliveryFailures > 0 ? (
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : attentionCount > 0 ? (
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-text-secondary">
              Status
            </p>
            <p className="font-serif text-xs sm:text-sm font-black text-foreground truncate mt-1">
              {deliveryFailures > 0
                ? "Failed Emails"
                : attentionCount > 0
                ? "Needs Review"
                : "All Clear"}
            </p>
          </div>
        </div>

        {/* Active Weddings Section (Phone-optimized with search & touch cards) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-text-secondary">
                Active Weddings ({weddingsCount})
              </h2>
              <p className="text-[11px] text-text-secondary/70">
                Select to open operations workspace
              </p>
            </div>
            {weddingSearch && (
              <span className="text-[11px] font-medium text-text-secondary">
                {filteredWeddings.length} matching
              </span>
            )}
          </div>

          {/* Search bar for quick filtering when there are multiple weddings */}
          {weddingsCount > 3 && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary/60" />
              <input
                type="text"
                placeholder="Search by couple name or date…"
                value={weddingSearch}
                onChange={(e) => setWeddingSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-neutral/40 py-2 pl-9 pr-8 text-xs sm:text-sm text-foreground placeholder:text-text-secondary/50 focus:border-primary focus:bg-white focus:outline-hidden transition"
              />
              {weddingSearch && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setWeddingSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary/60 hover:text-foreground p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {!weddingsCount ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-neutral/30 p-6 text-center">
              <p className="text-xs sm:text-sm text-text-secondary">
                Create a wedding or accept a collaborator invitation to begin.
              </p>
              <Link
                href="/dashboard"
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : filteredWeddings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-neutral/30 p-4 text-center text-xs text-text-secondary">
              No weddings match &ldquo;{weddingSearch}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 max-h-[340px] overflow-y-auto pr-0.5">
              {filteredWeddings.map((w: any) => (
                <Link
                  key={w.id}
                  href={`/dashboard/${w.id}/operations`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 sm:p-3.5 shadow-2xs transition-all active:scale-[0.98] hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-neutral text-primary">
                      <Heart className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {w.bride_name} &amp; {w.groom_name}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-text-secondary mt-0.5">
                        <Calendar className="h-3 w-3 shrink-0 text-accent" />
                        <span>{w.wedding_date || "Date unassigned"}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary/50 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Attention Items List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Items Requiring Action ({attentionCount})
            </h2>
            {attentionCount > 0 && (
              <span className="inline-flex items-center rounded-full border border-border bg-neutral px-2.5 py-0.5 text-[10px] font-bold text-text-secondary">
                Action required
              </span>
            )}
          </div>

          {attentionCount === 0 && weddingsCount > 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-neutral/40 p-8 text-center sm:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-serif text-lg font-bold text-foreground">
                All caught up! 🎉
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
                No outstanding issues, failed emails, or overdue checklist tasks across your weddings.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.attention.map((item: any) => {
                const wedding = data.weddings.find(
                  (w: any) => w.id === item.wedding_id
                );
                const meta = getAttentionKindMeta(item.kind);
                const Icon = meta.icon;
                const isOverdue =
                  item.due_at && new Date(item.due_at).getTime() < Date.now();

                return (
                  <Link
                    key={`${item.kind}-${item.id}`}
                    href={`/dashboard/${item.wedding_id}/operations`}
                    className={`group block rounded-2xl border bg-white p-3.5 sm:p-4 shadow-2xs transition-all active:scale-[0.99] active:bg-neutral/40 hover:shadow-xs ${meta.borderClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span
                            className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex rounded-md border border-error-text/30 bg-error-bg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-error-text">
                              Overdue
                            </span>
                          )}
                          {item.due_at && !isOverdue && (
                            <span className="text-xs text-text-secondary">
                              {formatDueAt(item.due_at)}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1.5 text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors break-words">
                          {item.label}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-secondary">
                          {wedding && (
                            <span className="font-semibold text-foreground/90">
                              {wedding.bride_name} &amp; {wedding.groom_name}
                            </span>
                          )}
                          {wedding?.wedding_date && (
                            <>
                              <span className="text-border">·</span>
                              <span>{wedding.wedding_date}</span>
                            </>
                          )}
                          {item.owner_email && (
                            <>
                              <span className="text-border">·</span>
                              <span className="truncate max-w-[140px] sm:max-w-none">
                                {item.owner_email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 self-center pl-1 text-text-secondary/50 transition group-hover:translate-x-1 group-hover:text-primary">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

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
    <div className="space-y-4 sm:space-y-6">
      <header className="rounded-3xl border border-border bg-white p-4 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/coordinator"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-neutral/50 px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/40 transition active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Weddings</span>
          </Link>
          <span className="text-[11px] font-medium text-text-secondary">
            Updated {new Date(data.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>

        <div>
          <h1 className="font-serif text-xl sm:text-3xl font-black text-foreground">
            {data.wedding.bride_name} &amp; {data.wedding.groom_name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              {data.wedding.wedding_date || "Date unassigned"}
            </span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-text-secondary/70" />
              {data.wedding.event_timezone || "Timezone unset"}
            </span>
          </div>
        </div>

        {/* Micro-metrics cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl border border-border bg-neutral/40 p-2.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-text-secondary">
              Confirmed
            </p>
            <p className="font-serif text-base sm:text-xl font-black text-foreground mt-0.5">
              {people}
            </p>
            <p className="text-[10px] text-text-secondary/70">guests</p>
          </div>
          <div className="rounded-2xl border border-border bg-neutral/40 p-2.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-text-secondary">
              Households
            </p>
            <p className="font-serif text-base sm:text-xl font-black text-foreground mt-0.5">
              {confirmed.length}
            </p>
            <p className="text-[10px] text-text-secondary/70">attending</p>
          </div>
          <div className="rounded-2xl border border-border bg-neutral/40 p-2.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-text-secondary">
              Awaiting
            </p>
            <p className="font-serif text-base sm:text-xl font-black text-foreground mt-0.5">
              {data.guests.filter((g: any) => g.rsvp_status === "pending").length}
            </p>
            <p className="text-[10px] text-text-secondary/70">responses</p>
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5 pt-1 border-t border-border/60">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs sm:text-sm font-bold text-foreground shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95 text-center"
            href={`/dashboard/${weddingId}/planner`}
          >
            <ClipboardList className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>Planner</span>
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs sm:text-sm font-bold text-foreground shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95 text-center"
            href={`/dashboard/${weddingId}/check-in`}
          >
            <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Check-in</span>
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs sm:text-sm font-bold text-foreground shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95 text-center"
            href={`/dashboard/${weddingId}/thank-you`}
          >
            <HeartHandshake className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>Thank-yous</span>
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs sm:text-sm font-bold text-foreground shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95 text-center"
            onClick={downloadHandover}
          >
            <Download className="h-3.5 w-3.5 text-text-secondary shrink-0" />
            <span>Offline Handover</span>
          </button>
          <button
            type="button"
            className="col-span-2 sm:col-span-1 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-primary shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95"
            disabled={isRefreshing || busy}
            onClick={handleRefresh}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* Navigation tabs: 3x2 grid on phone, 6-col on desktop so ALL tabs are visible in one screen with zero scrolling */}
      <nav
        aria-label="Wedding operations tabs"
        className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 rounded-2xl border border-border bg-white p-1.5 shadow-2xs"
      >
        {[
          { key: "today", label: "Today", icon: Sparkles },
          { key: "invitations", label: "Invitations", icon: Mail },
          { key: "payments", label: "Payments", icon: DollarSign },
          { key: "planning", label: "Planning", icon: Calendar },
          { key: "settings", label: "Settings", icon: Settings },
          { key: "closeout", label: "Closeout", icon: CheckCircle2 },
        ].map(({ key, label, icon: TabIcon }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setTab(key)}
              className={`flex w-full min-h-10 sm:min-h-11 items-center justify-center gap-1 sm:gap-1.5 rounded-xl px-1.5 py-2 text-[11px] sm:text-xs md:text-sm font-bold transition-all active:scale-95 ${
                isActive
                  ? "bg-primary text-white shadow-xs border border-primary"
                  : "bg-transparent text-text-secondary hover:bg-neutral hover:text-foreground border border-transparent"
              }`}
            >
              <TabIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-text-secondary"}`} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {error && (
        <div role="alert" className="rounded-2xl border border-error-text/30 bg-error-bg p-3.5 sm:p-4 text-xs sm:text-sm font-semibold text-error-text flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-error-text" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-2xl border border-border bg-neutral p-3.5 sm:p-4 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>{notice}</span>
        </div>
      )}

      {/* TODAY TAB */}
      <section
        hidden={tab !== "today"}
        className="rounded-3xl border border-border bg-white p-4 sm:p-6 space-y-5 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Next actions</h2>
          <span className="text-xs text-text-secondary">
            {data.items.filter((item: any) => item.kind !== "audit").length} items
          </span>
        </div>

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
          className="rounded-2xl border border-border bg-neutral/20 p-3.5 sm:p-4 grid gap-3 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Add New Operation Item
            </p>
          </div>
          <label className="block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Type</span>
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
          <label className="block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Title</span>
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
              <label className="block">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Vendor</span>
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
              <label className="block">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Amount actually paid</span>
                <input
                  className={field}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Responsible email</span>
                <input
                  type="email"
                  className={field}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="coordinator@example.com"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
                  {kind === "helper"
                    ? "Access expires (your local time)"
                    : "Due / arrival (your local time)"}
                </span>
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
          <label className="sm:col-span-2 block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Instructions</span>
            <textarea
              className={`${field} min-h-[72px]`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Location, arrival details, deliverables and contact person"
            />
          </label>
          {kind !== "payment" && (
            <label className="sm:col-span-2 flex items-center gap-2.5 rounded-xl border border-border bg-white p-3 text-xs sm:text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={notifyOwner}
                onChange={(e) => setNotifyOwner(e.target.checked)}
              />
              <span>
                Email the responsible person (tasks at their due time; briefings now)
              </span>
            </label>
          )}
          <div className="sm:col-span-2 flex justify-end">
            <button
              disabled={busy || (notifyOwner && !owner && kind !== "payment")}
              className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            >
              Save{" "}
              {kind === "payment"
                ? "Payment"
                : notifyOwner
                  ? "and Approve Email"
                  : "Action"}
            </button>
          </div>
        </form>

        <div className="space-y-2.5">
          {data.items
            .filter((item: any) => item.kind !== "audit")
            .map((item: any) => {
              const meta = getAttentionKindMeta(item.kind);
              const ItemIcon = meta.icon;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-white p-3.5 sm:p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold border ${meta.badgeClass}`}>
                          <ItemIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                          item.status === "done"
                            ? "bg-neutral text-text-secondary border-border"
                            : item.status === "cancelled"
                            ? "bg-neutral text-text-secondary/60 border-border"
                            : "bg-neutral text-primary border-primary/30"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground break-words">
                        {item.title}
                      </h3>
                    </div>

                    {item.status === "pending" && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void act({
                            action: "update",
                            id: item.id,
                            version: item.version,
                            status: item.kind === "helper" ? "cancelled" : "done",
                          })
                        }
                        className="shrink-0 inline-flex min-h-9 items-center justify-center rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95 disabled:opacity-50"
                      >
                        {item.kind === "helper" ? "Revoke Access" : "Mark Done"}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                    {item.owner_email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3 text-accent shrink-0" />
                        <span className="truncate max-w-[180px] sm:max-w-none">{item.owner_email}</span>
                      </span>
                    )}
                    {item.due_at && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-text-secondary/70 shrink-0" />
                        <span>{formatDueAt(item.due_at)}</span>
                      </span>
                    )}
                  </div>

                  {item.data?.notes && (
                    <div className="rounded-xl border border-border/60 bg-neutral/30 p-2.5 text-xs text-text-secondary leading-relaxed">
                      {item.data.notes}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      {/* INVITATIONS TAB */}
      <section
        hidden={tab !== "invitations"}
        className="rounded-3xl border border-border bg-white p-4 sm:p-6 space-y-5 shadow-xs"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Invitations and reminders</h2>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
            Generate private response links for imported households. Review the
            named recipient before sharing. Generating links sends no messages.
          </p>
        </div>

        <div>
          <button
            disabled={busy}
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            onClick={() => void act({ action: "invitations" })}
          >
            <Mail className="h-4 w-4" />
            <span>Generate household invitation links</span>
          </button>
        </div>

        {links.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Generated Links ({links.length})
            </p>
            <div className="grid gap-2 sm:gap-2.5 max-h-[300px] overflow-y-auto pr-0.5">
              {links.map((link) => (
                <div
                  key={link.url}
                  className="rounded-2xl border border-border bg-neutral/30 p-3 sm:p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {link.name}
                    </strong>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-primary shadow-2xs hover:bg-neutral transition active:scale-95"
                      onClick={() => {
                        void navigator.clipboard
                          .writeText(link.url)
                          .then(() => {
                            setCopiedLink(link.url);
                            setNotice(`Link copied for ${link.name}`);
                            setTimeout(() => setCopiedLink(null), 2500);
                          })
                          .catch(() => setError("Select and copy the link manually."));
                      }}
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedLink === link.url ? "Copied!" : "Copy link"}</span>
                    </button>
                  </div>
                  <div className="rounded-xl border border-border bg-white px-2.5 py-1.5 font-mono text-[11px] text-text-secondary break-all select-all">
                    {link.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reminder scheduler card */}
        <div className="rounded-2xl border border-border bg-neutral/20 p-3.5 sm:p-4 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
              Reminder send time (your local time)
            </span>
            <input
              className={field}
              type="datetime-local"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </label>
          <button
            disabled={busy || !due}
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            onClick={() =>
              void act({ action: "schedule", dueAt: new Date(due).toISOString() })
            }
          >
            <Clock className="h-4 w-4" />
            <span>Approve RSVP reminder for pending households</span>
          </button>
          <p className="text-xs text-text-secondary leading-relaxed">
            Only guests with personal links and email addresses are included.
            Replies and closed weddings are rechecked before sending.
          </p>
        </div>

        {/* Deliveries list */}
        {data.deliveries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Delivery Queue ({data.deliveries.length})
            </p>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
              {data.deliveries.map((d: any) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-border bg-white p-3 shadow-2xs text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">{d.recipient}</span>
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                        d.status === "failed"
                          ? "bg-error-bg text-error-text border-error-text/30"
                          : d.status === "sent"
                          ? "bg-neutral text-text-secondary border-border"
                          : "bg-neutral text-accent border-border"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-text-secondary text-[11px]">
                      Due: {new Date(d.due_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      {d.last_error ? ` · Error: ${d.last_error}` : ""}
                    </p>
                  </div>
                  {["queued", "failed"].includes(d.status) && (
                    <button
                      disabled={busy}
                      className="inline-flex min-h-8 items-center justify-center rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-error-text hover:bg-error-bg transition active:scale-95 disabled:opacity-50"
                      onClick={() =>
                        void act({ action: "cancel_delivery", id: d.id })
                      }
                    >
                      Cancel send
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* PAYMENTS TAB */}
      <section
        hidden={tab !== "payments"}
        className="rounded-3xl border border-border bg-white p-4 sm:p-6 space-y-5 shadow-xs"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Payment facts</h2>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
            Unrecorded payments are unknown. Link a budget item to its vendor to
            avoid counting the same expense twice. When starting a payment
            history, record all previously paid amounts first.
          </p>
        </div>

        {/* Vendors overview cards */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Vendor Balances ({data.vendors.length})
          </p>
          {data.vendors.length === 0 ? (
            <p className="text-xs text-text-secondary">No vendors added to this wedding yet.</p>
          ) : (
            <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-2">
              {data.vendors.map((vendor: any) => {
                const balance = vendorBalance(vendor);
                const hasOutstanding = balance.balance !== null && Number(balance.balance) > 0;
                return (
                  <div
                    key={vendor.id}
                    className="rounded-2xl border border-border bg-neutral/30 p-3 sm:p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{vendor.name}</span>
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                        hasOutstanding
                          ? "bg-neutral text-primary border-primary/30"
                          : "bg-neutral text-text-secondary border-border"
                      }`}>
                        {hasOutstanding ? "Balance Due" : "Settled / Unknown"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="rounded-xl border border-border bg-white p-1.5">
                        <p className="text-[10px] uppercase font-bold text-text-secondary">Contract</p>
                        <p className="font-serif font-bold text-foreground mt-0.5">{vendor.amount || 0}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-white p-1.5">
                        <p className="text-[10px] uppercase font-bold text-text-secondary">Paid</p>
                        <p className="font-serif font-bold text-foreground mt-0.5">{balance.paid ?? "—"}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-white p-1.5">
                        <p className="text-[10px] uppercase font-bold text-text-secondary">Outstanding</p>
                        <p className="font-serif font-bold text-foreground mt-0.5">{balance.balance ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget links */}
        {(data.budgets || []).length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/60">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Link Budget Items to Vendors
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {(data.budgets || []).map((budget: any) => (
                <label key={budget.id} className="block rounded-2xl border border-border bg-neutral/20 p-3 space-y-1.5">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {budget.item_name}
                  </span>
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
            </div>
          </div>
        )}
      </section>

      {/* PLANNING TAB */}
      <section
        hidden={tab !== "planning"}
        className="rounded-3xl border border-border bg-white p-4 sm:p-6 space-y-5 shadow-xs"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Reusable planning</h2>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
            Only task titles and relative dates are reused. Guest details,
            payments and previous messages are excluded.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            onClick={() =>
              void act({
                action: "playbook_save",
                title: `${data.wedding.bride_name} & ${data.wedding.groom_name} checklist`,
              })
            }
          >
            <ClipboardList className="h-4 w-4" />
            <span>Save planner checklist as playbook</span>
          </button>
          <button
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95 disabled:opacity-50"
            onClick={() => void act({ action: "playbook_apply" })}
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Apply my latest playbook</span>
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-neutral/20 p-3.5 sm:p-4 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
              Preview a new wedding date
            </span>
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

          {preview.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Proposed Task Due Dates ({preview.length})
              </p>
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-0.5">
                {preview.map((item) => (
                  <label
                    className="flex items-center gap-3 rounded-xl border border-border bg-white p-2.5 text-xs text-foreground cursor-pointer hover:bg-neutral/50 transition"
                    key={item.id}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0"
                      checked={selectedDates.includes(item.id)}
                      onChange={(e) =>
                        setSelectedDates((ids) =>
                          e.target.checked
                            ? [...ids, item.id]
                            : ids.filter((id) => id !== item.id),
                        )
                      }
                    />
                    <div className="min-w-0">
                      <p className="font-bold truncate">{item.title}</p>
                      <p className="text-[11px] text-text-secondary">
                        {new Date(item.due_at).toLocaleDateString()} →{" "}
                        <span className="font-semibold text-primary">{new Date(item.proposed).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {proposedDate && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="text-xs text-text-secondary leading-relaxed">
                Uncheck fixed contractual dates. Applying changes cancels queued
                reminders so you can approve the revised schedule.
              </p>
              <button
                disabled={busy}
                className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
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
                <Calendar className="h-4 w-4" />
                <span>Apply wedding date and selected task changes</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SETTINGS TAB */}
      <section
        hidden={tab !== "settings"}
        className="rounded-3xl border border-border bg-white p-4 sm:p-6 space-y-5 shadow-xs"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Timezone and external RSVP</h2>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
            Configure the wedding time zone and specify websites authorized to embed the live RSVP widget.
          </p>
        </div>

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
          <label className="block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
              Wedding timezone
            </span>
            <input
              className={field}
              name="zone"
              defaultValue={data.wedding.event_timezone}
              placeholder="Asia/Manila"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
              Websites allowed to embed RSVP (HTTPS origins, one per line)
            </span>
            <textarea
              className={`${field} min-h-[80px] font-mono text-xs`}
              name="origins"
              defaultValue={(
                data.wedding.operations_settings?.embedOrigins || []
              ).join("\n")}
              placeholder="https://ourwedding.example"
            />
          </label>
          <button
            disabled={busy}
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
          >
            <Settings className="h-4 w-4" />
            <span>Save settings</span>
          </button>
        </form>

        <div className="space-y-3 pt-3 border-t border-border/60">
          <label className="block">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
              Embed code
            </span>
            <textarea
              readOnly
              className={`${field} font-mono text-xs text-text-secondary min-h-[70px] select-all`}
              value={`<iframe src="${typeof location === "undefined" ? "" : location.origin}/embed/${weddingId}" title="Wedding RSVP" style="width:100%;min-height:700px;border:0"></iframe>`}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-primary shadow-2xs hover:bg-neutral transition active:scale-95"
              onClick={() => {
                const code = `<iframe src="${typeof location === "undefined" ? "" : location.origin}/embed/${weddingId}" title="Wedding RSVP" style="width:100%;min-height:700px;border:0"></iframe>`;
                void navigator.clipboard.writeText(code).then(() => setNotice("Embed code copied."));
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy embed snippet</span>
            </button>
            <a
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-text-secondary shadow-2xs hover:bg-neutral hover:text-foreground transition active:scale-95"
              href={`/embed/${weddingId}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Test RSVP widget</span>
            </a>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Publish your invitation first. For event-specific answers, guests can
            open the full invitation from the widget.
          </p>
        </div>
      </section>

      {/* CLOSEOUT TAB */}
      <section
        hidden={tab !== "closeout"}
        className="rounded-3xl border border-border bg-white p-4 sm:p-6 space-y-5 shadow-xs"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Finish and hand over</h2>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
            Review the live checks below. Completing the wedding turns on memories
            mode, stops queued RSVP reminders and revokes temporary helpers. Guest
            links remain available.
          </p>
        </div>

        <div className="grid gap-2 sm:gap-2.5">
          {(() => {
            const hasFailed = data.deliveries.some((d: any) => d.status === "failed");
            return (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-neutral/30 p-3 sm:p-3.5">
                <span className="text-xs sm:text-sm font-semibold text-foreground">Failed delivery messages</span>
                <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                  hasFailed
                    ? "bg-error-bg text-error-text border-error-text/30"
                    : "bg-neutral text-text-secondary border-border"
                }`}>
                  {hasFailed ? "Needs review" : "Clear"}
                </span>
              </div>
            );
          })()}

          {(() => {
            const hasOutstanding = data.vendors.some(
              (v: any) =>
                vendorBalance(v).balance === null ||
                Number(vendorBalance(v).balance) > 0,
            );
            return (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-neutral/30 p-3 sm:p-3.5">
                <span className="text-xs sm:text-sm font-semibold text-foreground">Vendor payment records</span>
                <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                  hasOutstanding
                    ? "bg-neutral text-primary border-primary/30"
                    : "bg-neutral text-text-secondary border-border"
                }`}>
                  {hasOutstanding ? "Needs review" : "Clear"}
                </span>
              </div>
            );
          })()}

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-neutral/30 p-3 sm:p-3.5">
            <span className="text-xs sm:text-sm font-semibold text-foreground">Thank-you note queue</span>
            <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
              (data.thankYouUnsent?.length || 0) > 0
                ? "bg-neutral text-accent border-border"
                : "bg-neutral text-text-secondary border-border"
            }`}>
              {data.thankYouUnsent?.length || 0} unsent
            </span>
          </div>
        </div>

        {data.thankYouUnsent?.length > 0 && (
          <div className="rounded-2xl border border-border bg-neutral/20 p-3.5 space-y-2">
            <p className="text-xs text-text-secondary leading-relaxed">
              <span className="font-bold text-foreground">Pending thank-yous:</span>{" "}
              {data.thankYouUnsent
                .slice(0, 8)
                .map((guest: any) => guest.name)
                .join(", ")}
              {data.thankYouUnsent.length > 8 ? " and more" : ""}
            </p>
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs hover:bg-neutral transition active:scale-95"
              href={`/dashboard/${weddingId}/thank-you`}
            >
              <HeartHandshake className="h-3.5 w-3.5 text-accent" />
              <span>Review thank-you queue</span>
            </Link>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-border/60">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95"
            onClick={downloadCloseoutArchive}
          >
            <Download className="h-4 w-4 text-text-secondary" />
            <span>Download private archive</span>
          </button>
          {data.wedding.photo_album_link && (
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-2xs transition hover:bg-neutral hover:border-primary/40 active:scale-95"
              href={data.wedding.photo_album_link}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4 text-text-secondary" />
              <span>Review wedding album</span>
            </a>
          )}
        </div>

        {data.wedding.completed_at ? (
          <div className="rounded-2xl border border-border bg-neutral/40 p-4 space-y-3">
            <p role="status" className="text-xs sm:text-sm font-semibold text-foreground">
              Completed {new Date(data.wedding.completed_at).toLocaleString()}.
              This wedding is archived from the active coordinator portfolio.
            </p>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95"
              onClick={() =>
                void shareQuickWeds().catch(() =>
                  setError("Unable to share right now."),
                )
              }
            >
              <Heart className="h-4 w-4" />
              <span>Recommend QuickWeds</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            onClick={() => {
              if (
                window.confirm(
                  "Confirm the wedding has finished and revoke temporary helper access?",
                )
              )
                void act({ action: "complete", data: { archive: true } });
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Complete wedding and archive from portfolio</span>
          </button>
        )}
      </section>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RSVPForm from "@/components/RSVPForm";
import SmartCalendar from "@/components/wedding/SmartCalendar";
function safeExternalUrl(value: unknown) {
  try {
    const url = new URL(String(value));
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}
export default function GuestPass() {
  const token = useParams<{ token: string }>()?.token || "";
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`/api/public/guest-pass?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (active) {
          setData(result);
          setEditing(!result.guest.attendance);
        }
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [token]);
  return (
    <main className="min-h-screen bg-neutral px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {!data ? (
          <p role="status">{error || "Loading your invitation…"}</p>
        ) : (
          <>
            <header className="rounded-3xl bg-white p-6 space-y-3">
              <h1 className="font-serif text-3xl">
                {data.wedding.bride_name} &amp; {data.wedding.groom_name}
              </h1>
              <p>
                Your invitation, {data.guest.guest_name}. Save this private link
                to return.
              </p>
              <p>
                {data.wedding.wedding_date} · {data.wedding.wedding_time} (
                {data.wedding.event_timezone || "UTC"})
              </p>
              <p>
                {data.wedding.venue_name} · {data.wedding.venue_address}
              </p>
              {data.wedding.wedding_date && (
                <SmartCalendar
                  wedding={data.wedding}
                  motifColor={data.wedding.motif_color || "#D16C78"}
                />
              )}
              <nav className="grid gap-3 sm:grid-cols-2">
                <button
                  className="min-h-12 rounded-xl bg-primary text-white"
                  onClick={() => setEditing((value) => !value)}
                >
                  {editing ? "Hide response form" : "View or change RSVP"}
                </button>
                {safeExternalUrl(data.wedding.maps_link) && (
                  <a
                    className="min-h-12 p-3 rounded-xl border"
                    href={safeExternalUrl(data.wedding.maps_link)}
                    rel="noreferrer"
                  >
                    Directions
                  </a>
                )}
                {data.guest.attendance === "Yes" && (
                  <Link
                    className="min-h-12 p-3 rounded-xl border"
                    href={`/seat/${token}`}
                  >
                    Find my seat
                  </Link>
                )}
                <Link
                  className="min-h-12 p-3 rounded-xl border"
                  href={`/w/${data.wedding.id}/photos?guest=${encodeURIComponent(token)}`}
                >
                  Share photos
                </Link>
                {safeExternalUrl(data.wedding.photo_album_link) && (
                  <a
                    className="min-h-12 p-3 rounded-xl border"
                    href={safeExternalUrl(data.wedding.photo_album_link)}
                    rel="noreferrer"
                  >
                    Wedding album
                  </a>
                )}
              </nav>
              <p>
                Guest code: <strong>{data.guest.guest_code}</strong>
              </p>
              <p>
                Need help?{" "}
                {data.wedding.contact_person ||
                  "Please contact the couple or reception."}
              </p>
            </header>
            {editing && (
              <RSVPForm
                weddingId={data.wedding.id}
                wedding={data.wedding}
                invitationToken={token}
                initialGuest={data.guest}
                onResponseSaved={(attendance) =>
                  setData((current: any) => ({
                    ...current,
                    guest: { ...current.guest, attendance },
                  }))
                }
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

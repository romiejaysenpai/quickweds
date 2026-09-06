"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
export function useWeddingDraft(
  userId: string | null,
  key: string,
  ready: boolean,
  data: Record<string, unknown>,
  restore: (data: any) => void,
) {
  const [status, setStatus] = useState("");
  const [available, setAvailable] = useState<any>(null);
  const loaded = useRef("");
  const last = useRef("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!userId || !ready || loaded.current === `${userId}/${key}`) return;
    loaded.current = `${userId}/${key}`;
    setHydrated(false);
    let active = true;
    void (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const response = await fetch(
          `/api/operations/draft?key=${encodeURIComponent(key)}`,
          {
            headers: {
              Authorization: `Bearer ${session.session?.access_token}`,
            },
            cache: "no-store",
          },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (active) {
          if (result.draft) setAvailable(result.draft.data);
          setHydrated(true);
        }
      } catch {
        if (active)
          setStatus(
            "Draft storage unavailable. Keep this page open until you save.",
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, key, ready]);
  useEffect(() => {
    if (!hydrated || !userId || available) return;
    const serialized = JSON.stringify(data);
    if (serialized === last.current) return;
    setStatus("Saving draft…");
    const timer = setTimeout(
      () =>
        void (async () => {
          try {
            const { data: session } = await supabase.auth.getSession();
            const response = await fetch("/api/operations/draft", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.session?.access_token}`,
              },
              body: JSON.stringify({ key, data }),
            });
            if (!response.ok) throw new Error();
            last.current = serialized;
            setStatus(
              "Details saved as a private draft. Selected new files still need to be uploaded when you save the wedding.",
            );
          } catch {
            setStatus("Draft not saved. Please retry before leaving.");
          }
        })(),
      1500,
    );
    return () => clearTimeout(timer);
  }, [data, key, userId, hydrated, available]);
  const clear = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      await fetch(`/api/operations/draft?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.session?.access_token}` },
      });
      last.current = JSON.stringify(data);
      setStatus("");
      setAvailable(null);
    } catch {
      /* The saved wedding remains authoritative if cleanup is temporarily unavailable. */
    }
  };
  return {
    status,
    available,
    restore: () => {
      if (available) restore(available);
      setAvailable(null);
    },
    discard: () => setAvailable(null),
    clear,
  };
}

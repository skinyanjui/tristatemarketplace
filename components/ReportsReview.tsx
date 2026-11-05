"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

type Rep = { id: string; listing_id: string; reason: string; details: string; created_at: string; tm_listings: { title: string; status: string } | null };

const LABEL: Record<string, string> = { scam: "Scam or fraud", prohibited: "Prohibited item", wrong_category: "Wrong category", duplicate: "Duplicate", other: "Something else" };

/** Shown only to moderators. Non-admins get no rows back from the database, so it renders nothing. */
export function ReportsReview({ uid }: { uid: string }) {
  const [admin, setAdmin] = useState(false);
  const [rows, setRows] = useState<Rep[]>([]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    (async () => {
      const sb = supabaseBrowser();
      const a = await sb.from("tm_admins").select("user_id").eq("user_id", uid).maybeSingle();
      if (!a.data || !live) return;
      const r = await sb.from("tm_reports").select("id,listing_id,reason,details,created_at,tm_listings(title,status)").order("created_at", { ascending: false }).limit(100);
      if (!live) return;
      setAdmin(true);
      setRows((r.data as unknown as Rep[]) ?? []);
    })();
    return () => { live = false; };
  }, [uid, tick]);

  async function act(r: Rep, what: "remove" | "dismiss") {
    const sb = supabaseBrowser();
    if (what === "remove") await sb.from("tm_listings").update({ status: "removed" }).eq("id", r.listing_id);
    await sb.from("tm_reports").delete().eq("id", r.id);
    setTick((t) => t + 1);
  }

  if (!admin) return null;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 className="h3">Reports to review ({rows.length})</h2>
      {rows.length === 0 && <div className="notice">No open reports.</div>}
      {rows.map((r) => (
        <div key={r.id} className="notice" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ flex: 1, minWidth: 200 }}>
            <Link href={`/listing/${r.listing_id}`}><strong>{r.tm_listings?.title ?? r.listing_id}</strong></Link><br />
            {LABEL[r.reason] ?? r.reason} · {new Date(r.created_at).toLocaleDateString()}{r.details ? ` · ${r.details}` : ""}
          </span>
          <button className="btn" onClick={() => act(r, "remove")}>Remove listing</button>
          <button className="btn" onClick={() => act(r, "dismiss")}>Dismiss</button>
        </div>
      ))}
    </section>
  );
}

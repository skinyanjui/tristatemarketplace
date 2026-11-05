"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./AuthGate";
import { toast } from "./Toaster";
import { supabaseBrowser } from "@/lib/supabase/client";
import { money } from "@/lib/ads";

type Row = { id: string; product: string; business_name: string; headline: string | null; days: number; price_cents: number; status: string; admin_note: string | null; created_at: string; ends_at: string | null };
const NAME: Record<string, string> = { featured: "Featured listing", sponsored: "Sponsored listing", ad: "Ad card" };
const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function label(r: Row) {
  if (r.status === "live" && r.ends_at && new Date(r.ends_at) < new Date()) return { text: `Ended ${fmt(r.ends_at)}`, tone: "tag" };
  switch (r.status) {
    case "pending": return { text: "In review", tone: "tag" };
    case "approved": return { text: "Approved, waiting for payment", tone: "tag tag-warn" };
    case "live": return { text: `Live until ${fmt(r.ends_at ?? r.created_at)}`, tone: "tag tag-ok" };
    case "declined": return { text: "Not approved", tone: "tag tag-bad" };
    default: return { text: "Cancelled", tone: "tag" };
  }
}

/** The member's own ad requests, with status and a way to cancel before they go live. */
export function MyAdRequests() {
  const session = useSession();
  const [rows, setRows] = useState<Row[] | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabaseBrowser().from("tm_ad_requests").select("id,product,business_name,headline,days,price_cents,status,admin_note,created_at,ends_at").order("created_at", { ascending: false }).limit(20);
    setRows((data ?? []) as Row[]);
  }, []);
  useEffect(() => {
    if (!session) return;
    const t = setTimeout(load, 0);
    window.addEventListener("tm-ad-requests", load);
    return () => { clearTimeout(t); window.removeEventListener("tm-ad-requests", load); };
  }, [session, load]);
  if (!session || !rows || rows.length === 0) return null;

  async function cancel(id: string) {
    const { error } = await supabaseBrowser().rpc("tm_cancel_ad", { req_id: id });
    if (error) { toast(error.message); return; }
    toast("Request cancelled.");
    load();
  }
  return (
    <section aria-labelledby="myreq-h" className="myreq">
      <h2 id="myreq-h" className="h3">Your requests</h2>
      <ul className="reqlist">
        {rows.map((r) => {
          const l = label(r);
          return (
            <li key={r.id}>
              <div className="reqmain"><strong>{NAME[r.product]}</strong><span className="muted"> · {r.headline ?? r.business_name} · {r.days} days · {money(r.price_cents)}</span>
                {r.admin_note && <div className="muted">Note from us: {r.admin_note}</div>}</div>
              <span className={l.tone}>{l.text}</span>
              {(r.status === "pending" || r.status === "approved") && <button type="button" className="btn btn-ghost" onClick={() => cancel(r.id)}>Cancel</button>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

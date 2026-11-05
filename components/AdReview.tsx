"use client";

import { useEffect, useState } from "react";
import { AdCard } from "./AdCard";
import { toast } from "./Toaster";
import { supabaseBrowser } from "@/lib/supabase/client";
import { AD_SLOTS, money } from "@/lib/ads";

type Row = { id: string; product: string; listing_id: string | null; business_name: string; contact: string; headline: string | null; detail: string | null; cta: string | null; url: string | null; image_url: string | null; days: number; price_cents: number; status: string; created_at: string };
const NAME: Record<string, string> = { featured: "Featured listing", sponsored: "Sponsored listing", ad: "Ad card" };

/** Admins only: review ad requests, approve or decline, and mark payment received. */
export function AdReview({ uid }: { uid: string }) {
  const [admin, setAdmin] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(0);
  const [note, setNote] = useState<Record<string, string>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      const sb = supabaseBrowser();
      const a = await sb.from("tm_admins").select("user_id").eq("user_id", uid).maybeSingle();
      if (!a.data || !live) return;
      const [r, n] = await Promise.all([
        sb.from("tm_ad_requests").select("id,product,listing_id,business_name,contact,headline,detail,cta,url,image_url,days,price_cents,status,created_at").in("status", ["pending", "approved"]).order("created_at").limit(50),
        sb.from("tm_ads").select("id", { count: "exact", head: true }),
      ]);
      if (!live) return;
      setAdmin(true);
      setRows((r.data as Row[]) ?? []);
      setRunning(n.count ?? 0);
    })();
    return () => { live = false; };
  }, [uid, tick]);

  async function decide(r: Row, approve: boolean) {
    const { data, error } = await supabaseBrowser().rpc("tm_decide_ad", { req_id: r.id, approve, note: note[r.id] || null });
    if (error) { toast(error.message); return; }
    toast(!approve ? "Request declined" : data === "live" ? `${r.business_name} is live` : "Approved. Waiting for payment.");
    setTick((t) => t + 1);
  }
  async function paid(r: Row) {
    const { error } = await supabaseBrowser().rpc("tm_mark_ad_paid", { req_id: r.id });
    if (error) { toast(error.message); return; }
    toast(`${r.business_name} is live`);
    setTick((t) => t + 1);
  }

  if (!admin) return null;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 className="h3">Ad requests ({rows.length})</h2>
      <p className="muted" style={{ margin: 0 }}>{running} of {AD_SLOTS} ad card slots in use.</p>
      {rows.length === 0 && <div className="notice">No ad requests waiting.</div>}
      {rows.map((r) => (
        <div key={r.id} className="notice" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div><strong>{NAME[r.product]}</strong> · {r.business_name} · {r.days} days · {money(r.price_cents)} · {new Date(r.created_at).toLocaleDateString()}</div>
          <div>Contact: {r.contact}</div>
          {r.listing_id && <div><a href={`/listing/${r.listing_id}`} target="_blank" rel="noopener noreferrer">View the listing</a></div>}
          {r.product === "ad" && (
            <div className="adpreview-card"><AdCard ad={{ id: r.id, advertiser: r.business_name, headline: r.headline ?? "", detail: r.detail ?? "", cta: r.cta ?? "Learn more", href: r.url ?? "#", image: r.image_url ?? undefined }} /></div>
          )}
          {r.product === "ad" && r.url && <div className="muted">Opens: <a href={r.url} target="_blank" rel="noopener noreferrer">{r.url}</a></div>}
          {r.status === "pending" ? (
            <>
              <input className="input" aria-label="Note to the member (optional)" placeholder="Note to the member (optional)" maxLength={300} value={note[r.id] ?? ""} onChange={(e) => setNote({ ...note, [r.id]: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => decide(r, true)}>Approve</button>
                <button className="btn btn-danger" onClick={() => decide(r, false)}>Decline</button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}><button className="btn" onClick={() => paid(r)}>Payment received, go live</button></div>
          )}
        </div>
      ))}
    </section>
  );
}

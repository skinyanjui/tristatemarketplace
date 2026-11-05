"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "./Toaster";
import { supabaseBrowser } from "@/lib/supabase/client";

type Row = { id: string; user_id: string; display_name: string; contact: string; details: string; created_at: string };

/** Admins only: approve or decline verification requests. Non-admins see nothing. */
export function VerificationReview({ uid }: { uid: string }) {
  const [admin, setAdmin] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      const sb = supabaseBrowser();
      const a = await sb.from("tm_admins").select("user_id").eq("user_id", uid).maybeSingle();
      if (!a.data || !live) return;
      const r = await sb.from("tm_verification_requests").select("id,user_id,display_name,contact,details,created_at").eq("status", "pending").order("created_at").limit(50);
      if (!live) return;
      setAdmin(true);
      setRows((r.data as Row[]) ?? []);
    })();
    return () => { live = false; };
  }, [uid, tick]);

  async function decide(r: Row, approve: boolean) {
    const { error } = await supabaseBrowser().rpc("tm_decide_verification", { req_id: r.id, approve, note: note[r.id] || null });
    if (error) { toast(error.message); return; }
    toast(approve ? `${r.display_name} is now verified` : "Request declined");
    setTick((t) => t + 1);
  }

  if (!admin) return null;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 className="h3">Verification requests ({rows.length})</h2>
      {rows.length === 0 && <div className="notice">No requests waiting.</div>}
      {rows.map((r) => (
        <div key={r.id} className="notice" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div><strong>{r.display_name}</strong> · <Link href={`/seller/${r.user_id}`}>profile and listings</Link> · {new Date(r.created_at).toLocaleDateString()}</div>
          <div>Contact: {r.contact}</div>
          {r.details && <div className="muted">{r.details}</div>}
          <input className="input" aria-label="Note to the member (optional)" placeholder="Note to the member (optional)" maxLength={300} value={note[r.id] ?? ""} onChange={(e) => setNote({ ...note, [r.id]: e.target.value })} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => decide(r, true)}>Approve</button>
            <button className="btn btn-danger" onClick={() => decide(r, false)}>Decline</button>
          </div>
        </div>
      ))}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "./AuthGate";
import { supabaseBrowser } from "@/lib/supabase/client";
import { categoryOf } from "@/lib/categories";

type Mine = { id: string; title: string; kind: string; price: string; status: string };

function Mine({ uid }: { uid: string }) {
  const [rows, setRows] = useState<Mine[] | null>(null);
  const [err, setErr] = useState("");
  const load = () =>
    supabaseBrowser().from("tm_listings").select("id,title,kind,price,status").eq("seller_id", uid).order("created_at", { ascending: false })
      .then(({ data, error }) => (error ? setErr(error.message) : setRows(data as Mine[])));
  useEffect(() => { load(); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(id: string, status: string) {
    await supabaseBrowser().from("tm_listings").update({ status }).eq("id", id);
    load();
  }
  async function remove(id: string) {
    await supabaseBrowser().from("tm_listings").delete().eq("id", id);
    load();
  }

  if (err) return <div className="notice" role="alert">{err}</div>;
  if (!rows) return <div className="notice">Loading…</div>;
  if (!rows.length) return <div className="notice">You have no listings yet. <Link href="/post">Post one</Link>.</div>;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r) => (
        <li key={r.id} className="notice" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ flex: 1, minWidth: 180 }}>
            <Link href={`/listing/${r.id}`}><strong>{r.title}</strong></Link><br />
            {categoryOf(r.kind).label} · {r.price || "No price"} · {r.status}
          </span>
          <button className="btn" onClick={() => setStatus(r.id, r.status === "active" ? "sold" : "active")}>{r.status === "active" ? "Mark sold" : "Relist"}</button>
          <button className="btn" onClick={() => remove(r.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export function AccountPanel() {
  return (
    <AuthGate note="Sign in with your email to post listings and manage them. No password needed.">
      {(s) => (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ flex: 1 }}>Signed in as <strong>{s.user.email}</strong></span>
            <button className="btn" onClick={() => supabaseBrowser().auth.signOut()}>Sign out</button>
          </div>
          <h2 style={{ margin: 0, fontSize: 17 }}>Your listings</h2>
          <Mine uid={s.user.id} />
        </section>
      )}
    </AuthGate>
  );
}

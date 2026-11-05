"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "./AuthGate";
import { ReportsReview } from "./ReportsReview";
import { supabaseBrowser } from "@/lib/supabase/client";
import { categoryOf } from "@/lib/categories";

type Mine = { id: string; title: string; kind: string; price: string; status: string; featured_until: string | null; expires_at: string; photos: string[] | null };

const daysLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

function Mine({ uid }: { uid: string }) {
  const [rows, setRows] = useState<Mine[] | null>(null);
  const [err, setErr] = useState("");
  const load = () =>
    supabaseBrowser().from("tm_listings").select("id,title,kind,price,status,featured_until,expires_at,photos").eq("seller_id", uid).order("created_at", { ascending: false })
      .then(({ data, error }) => (error ? setErr(error.message) : setRows(data as Mine[])));
  useEffect(() => { load(); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(id: string, status: string) {
    const { error } = await supabaseBrowser().from("tm_listings").update({ status }).eq("id", id);
    setNote(error ? "That did not go through. Please try again." : status === "sold" ? "Marked as sold. Nice work!" : "Your listing is back on the site.");
    load();
  }
  const [note, setNote] = useState("");
  async function feature(id: string) {
    setNote("");
    const { data } = await supabaseBrowser().auth.getSession();
    const res = await fetch("/api/feature", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` }, body: JSON.stringify({ listingId: id }) });
    const out = (await res.json()) as { mode?: string; url?: string; error?: string };
    if (out.url) { window.location.assign(out.url); return; }
    if (out.error) { setNote(out.error); return; }
    setNote("Done! Your listing is featured for 7 days. (Sample mode, no charge.)");
    load();
  }
  async function renew(id: string) {
    const { error } = await supabaseBrowser().rpc("tm_renew", { listing_id: id });
    setNote(error ? error.message : "Renewed for 60 more days.");
    load();
  }
  const [confirming, setConfirming] = useState<string | null>(null);
  async function remove(id: string) {
    if (confirming !== id) { setConfirming(id); return; }
    setConfirming(null);
    const sb = supabaseBrowser();
    const row = rows?.find((r) => r.id === id);
    const { error } = await sb.from("tm_listings").delete().eq("id", id);
    if (error) { setNote("Could not delete that listing. Please try again."); return; }
    // Clean up this member's uploaded photos so storage does not fill with orphans.
    const marker = "/tm-listing-photos/";
    const own = (row?.photos ?? []).filter((u) => u.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1]));
    if (own.length) await sb.storage.from("tm-listing-photos").remove(own);
    setNote("Listing deleted.");
    load();
  }

  if (err) return <div className="notice" role="alert">{err}</div>;
  if (!rows) return <div className="notice">Loading…</div>;
  if (!rows.length) return <div className="notice">Nothing posted yet. Ready to sell something? <Link href="/post">Post one</Link>.</div>;
  return (
    <>
    {note && <div className="notice" role="status">{note}</div>}
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r) => (
        <li key={r.id} className="notice" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ flex: 1, minWidth: 180 }}>
            <Link href={`/listing/${r.id}`}><strong>{r.title}</strong></Link><br />
            {categoryOf(r.kind).label} · {r.price || "No price"} · {r.status}
            {r.status !== "removed" && (new Date(r.expires_at) < new Date() ? " · Expired, hidden from the site" : daysLeft(r.expires_at) <= 14 ? ` · Expires in ${daysLeft(r.expires_at)} days` : "")}
            {r.featured_until && new Date(r.featured_until) > new Date() && ` · Featured until ${new Date(r.featured_until).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </span>
          {r.status !== "removed" && (new Date(r.expires_at) < new Date() || daysLeft(r.expires_at) <= 14) && <button className="btn" onClick={() => renew(r.id)}>Renew</button>}
          {r.status === "removed" && <span className="muted">Removed by moderators</span>}
          {r.status === "active" && <button className="btn" onClick={() => feature(r.id)}>{r.featured_until && new Date(r.featured_until) > new Date() ? "Extend" : "Feature"}</button>}
          {r.status !== "removed" && <button className="btn" onClick={() => setStatus(r.id, r.status === "active" ? "sold" : "active")}>{r.status === "active" ? "Mark sold" : "Relist"}</button>}
          <button className="btn" onClick={() => remove(r.id)} onBlur={() => setConfirming(null)}>{confirming === r.id ? "Tap again to delete" : "Delete"}</button>
        </li>
      ))}
    </ul>
    </>
  );
}

type Msg = { id: string; listing_id: string; sender_email: string; body: string; created_at: string; seller_id: string };

function Inbox({ uid }: { uid: string }) {
  const [rows, setRows] = useState<Msg[] | null>(null);
  useEffect(() => {
    supabaseBrowser().from("tm_messages").select("id,listing_id,seller_id,sender_email,body,created_at").eq("seller_id", uid).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setRows((data as Msg[]) ?? []));
  }, [uid]);
  if (!rows) return null;
  if (!rows.length) return <div className="notice">No messages yet. When a buyer reaches out, you will see it here.</div>;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((m) => (
        <li key={m.id} className="notice">
          <strong>{m.sender_email}</strong> · <Link href={`/listing/${m.listing_id}`}>listing</Link> · {new Date(m.created_at).toLocaleDateString()}
          <p style={{ margin: "6px 0 0", color: "var(--label)" }}>{m.body}</p>
          <a href={`mailto:${m.sender_email}`}>Reply by email</a>
        </li>
      ))}
    </ul>
  );
}

export function AccountPanel() {
  return (
    <AuthGate title="Sign in to your account" note="Post and manage your listings. We will email you a link, so there is no password to remember.">
      {(s) => (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ flex: 1 }}>Signed in as <strong>{s.user.email}</strong></span>
            <button className="btn" onClick={() => supabaseBrowser().auth.signOut()}>Sign out</button>
          </div>
          <h2 style={{ margin: 0, fontSize: 17 }}>Your listings</h2>
          <Mine uid={s.user.id} />
          <h2 style={{ margin: 0, fontSize: 17 }}>Messages</h2>
          <Inbox uid={s.user.id} />
          <ReportsReview uid={s.user.id} />
        </section>
      )}
    </AuthGate>
  );
}

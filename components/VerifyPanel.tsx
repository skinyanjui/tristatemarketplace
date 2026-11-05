"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Notice } from "./Notice";
import { toast } from "./Toaster";
import { VerifiedBadge } from "./VerifiedBadge";
import { supabaseBrowser } from "@/lib/supabase/client";

type Req = { id: string; status: "pending" | "approved" | "declined"; decision_note: string | null; display_name: string };

/** Members ask to be verified here, and see where their request stands. */
export function VerifyPanel({ uid }: { uid: string }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [req, setReq] = useState<Req | null>(null);
  const [form, setForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      const sb = supabaseBrowser();
      const [p, r] = await Promise.all([
        sb.from("tm_profiles").select("verified").eq("user_id", uid).maybeSingle(),
        sb.from("tm_verification_requests").select("id,status,decision_note,display_name").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (!live) return;
      setVerified(!!p.data?.verified);
      setReq((r.data as Req | null) ?? null);
    })();
    return () => { live = false; };
  }, [uid, tick]);

  if (verified === null) return null;
  if (verified) return (
    <div className="notice notice-ok" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <VerifiedBadge />
      <span style={{ flex: 1, minWidth: 160 }}>Your profile is verified. Buyers see the badge on your profile page.</span>
      <Link href={`/seller/${uid}`} className="btn btn-ghost">View my profile</Link>
    </div>
  );
  if (req?.status === "pending") return <Notice tone="info"><strong>We are reviewing your request.</strong> It usually takes a day or two. We may contact you using the details you gave.</Notice>;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setErr("");
    const { error } = await supabaseBrowser().from("tm_verification_requests").insert({
      display_name: String(fd.get("name") ?? "").trim(), contact: String(fd.get("contact") ?? "").trim(), details: String(fd.get("details") ?? "").trim(),
    });
    setBusy(false);
    if (error) { setErr(error.code === "23505" ? "You already have a request waiting." : error.code === "23514" ? "Please check the name (2 to 60 characters) and contact details." : "That did not go through. Please try again."); return; }
    toast("Request sent. We will be in touch");
    setForm(false); setTick((t) => t + 1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {req?.status === "declined" && <Notice tone="warn"><strong>Your last request was not approved.</strong> {req.decision_note ? `“${req.decision_note}” ` : ""}You can send a new one with more detail.</Notice>}
      {!form ? (
        <div className="notice" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ flex: 1, minWidth: 200 }}>Get a Verified badge on your profile so buyers know who they are dealing with.</span>
          <button className="btn" onClick={() => setForm(true)}>Request verification</button>
        </div>
      ) : (
        <form className="notice" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label htmlFor="v-name">Name to show on your profile</label>
            <input id="v-name" name="name" className="input" required minLength={2} maxLength={60} placeholder="You or your business" autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="v-contact">Phone or website we can check</label>
            <input id="v-contact" name="contact" className="input" required minLength={4} maxLength={200} placeholder="(812) 555-0123 or yourbusiness.com" />
            <small className="hint">Only the Tristate Market team sees this.</small>
          </div>
          <div className="field">
            <label htmlFor="v-details">Anything else? (optional)</label>
            <textarea id="v-details" name="details" className="input" rows={3} maxLength={1000} placeholder="What you sell, how long you have been selling, links to your page" />
          </div>
          <label className="consent"><input type="checkbox" required /><span>I agree that Tristate Market may contact me to confirm these details.</span></label>
          {err && <Notice tone="bad">{err}</Notice>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" disabled={busy}>{busy ? <><span className="spinner" />Sending…</> : "Send request"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const REASONS: [string, string][] = [["scam", "Scam or fraud"], ["prohibited", "Prohibited item"], ["wrong_category", "Wrong category"], ["duplicate", "Duplicate"], ["other", "Something else"]];

export function ReportListing({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");

  if (state === "sent") return <div className="notice" role="status">Thanks for looking out for the community. We will review this listing.</div>;
  if (!open) return <button type="button" className="linkbtn rep" aria-label="Report this listing" onClick={() => setOpen(true)}>Report</button>;
  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending"); setErr("");
        const fd = new FormData(e.currentTarget);
        const { error } = await supabaseBrowser().from("tm_reports").insert({ listing_id: listingId, reason: fd.get("reason"), details: String(fd.get("details") ?? "").slice(0, 1000) });
        if (error) { setErr(error.message.includes("plenty") || error.message.includes("duplicate") ? "Thanks, we already have your report on this one." : "Hmm, that did not go through. Please try again."); setState("idle"); } else setState("sent");
      }}
    >
      <div className="field">
        <label htmlFor="reason">Reason</label>
        <select id="reason" name="reason" className="input">{REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </div>
      <div className="field">
        <label htmlFor="details">Details (optional)</label>
        <textarea id="details" name="details" className="input" rows={3} maxLength={1000} />
      </div>
      {err && <div className="notice" role="alert">{err}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send report"}</button>
        <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

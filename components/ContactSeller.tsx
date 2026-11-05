"use client";

import { useState } from "react";
import { AuthGate } from "./AuthGate";
import { supabaseBrowser } from "@/lib/supabase/client";

export function ContactSeller({ listingId, sellerId, label, sold }: { listingId: string; sellerId: string | null; label: string; sold?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");

  if (sold) return <div className="notice">This item has been sold.</div>;
  if (!sellerId) return <div className="notice">This is a sample listing, so there is no seller to contact.</div>;
  if (!open) return <button className="btn btn-lg" onClick={() => setOpen(true)}>{label}</button>;
  if (state === "sent") return <div className="notice" role="status">Sent. The seller will see your message in their account and can reply to your email.</div>;

  return (
    <AuthGate next={`/listing/${listingId}`} note="Sign in with your email so the seller can reply. No password needed.">
      {(s) => (
        <form
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setState("sending"); setErr("");
            const body = String(new FormData(e.currentTarget).get("body") ?? "").trim();
            const { error } = await supabaseBrowser().from("tm_messages").insert({ listing_id: listingId, seller_id: sellerId, sender_email: s.user.email, body });
            if (error) { setErr(error.message); setState("idle"); } else setState("sent");
          }}
        >
          <div className="field">
            <label htmlFor="body">Message to seller</label>
            <textarea id="body" name="body" className="input" rows={4} required minLength={2} maxLength={2000} placeholder="Hi, is this still available?" />
          </div>
          {err && <div className="notice" role="alert">{err}</div>}
          <button className="btn btn-lg" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
        </form>
      )}
    </AuthGate>
  );
}

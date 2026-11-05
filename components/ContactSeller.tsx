"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGate } from "./AuthGate";
import { Icon } from "./Icon";
import { mapsUrl, type Action } from "@/lib/categories";
import { supabaseBrowser } from "@/lib/supabase/client";

export function ContactSeller({ listingId, sellerId, action, catId, place, sold }: { listingId: string; sellerId: string | null; action: Action; catId: string; place?: string; sold?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");

  const more = <Link href={`/?cat=${catId}`} className="btn btn-lg btn-ghost">See similar listings</Link>;
  if (sold) return <div className="next"><div className="notice">This one has been sold, but there is more where it came from.</div>{more}</div>;
  if (!sellerId) return <div className="next"><div className="notice">This is a sample listing, so there is nobody to message. Real listings from your neighbors are a tap away.</div>{more}</div>;
  if (state === "sent") return (
    <div className="next">
      <div className="notice" role="status">Message sent! The seller will see it in their account and can reply to your email.</div>
      <Link href="/" className="btn btn-lg">Keep browsing</Link>
      <Link href="/account#saved" className="btn btn-lg btn-ghost">View my saved items</Link>
    </div>
  );
  if (!open) return (
    <div className="next">
      <button className="btn btn-lg" onClick={() => setOpen(true)}><Icon name={action.map ? "msg" : action.icon} size={18} color="#fff" />{action.map ? "Message seller" : action.label}</button>
      {action.map && place && <a className="btn btn-lg btn-ghost" href={mapsUrl(place)} target="_blank" rel="noopener noreferrer"><Icon name="nav" size={18} />Get directions</a>}
    </div>
  );

  return (
    <AuthGate next={`/listing/${listingId}`} note="Sign in with your email so the seller can reply. No password to remember!">
      {(s) => s.user.id === sellerId ? (
        <div className="next"><div className="notice">This is your own listing, so there is nobody to message.</div><Link href="/account" className="btn btn-lg">Manage my listings</Link></div>
      ) : (
        <form
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setState("sending"); setErr("");
            const body = String(new FormData(e.currentTarget).get("body") ?? "").trim();
            const { error } = await supabaseBrowser().from("tm_messages").insert({ listing_id: listingId, seller_id: sellerId, sender_email: s.user.email, body });
            if (error) { setErr(error.code === "42501" ? "This listing is no longer taking messages. It may have sold or expired." : error.message); setState("idle"); } else setState("sent");
          }}
        >
          <div className="field">
            <label htmlFor="body">Message to seller</label>
            <textarea id="body" name="body" className="input" rows={4} required minLength={2} maxLength={2000} defaultValue={action.ask} />
          </div>
          {err && <div className="notice" role="alert">{err}</div>}
          <button className="btn btn-lg" disabled={state === "sending"}>{state === "sending" ? "Sending…" : <><Icon name="msg" size={18} color="#fff" />Send message</>}</button>
          <button type="button" className="btn btn-lg btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        </form>
      )}
    </AuthGate>
  );
}

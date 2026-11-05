"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignIn, useSession } from "./AuthGate";
import { Icon } from "./Icon";
import { Notice } from "./Notice";
import { toast } from "./Toaster";
import { mapsUrl, type Action } from "@/lib/categories";
import { supabaseBrowser } from "@/lib/supabase/client";

/** One-tap first messages, so a buyer can send in two taps. */
function quickFor(action: Action): string[] {
  if (action.icon === "cal") return ["Is a tour possible this week?", "Is the price negotiable?", "Is it still available?"];
  if (action.label === "Apply") return ["Is the job still open?", "What are the hours?", "Do I need experience?"];
  if (action.label === "RSVP") return ["Is there parking?", "Is it kid friendly?", "Do I need a ticket?"];
  if (action.label === "Claim this") return ["Is it still available?", "Can I pick it up today?", "What time works?"];
  if (action.label === "Request a quote") return ["Can you give me a rough price?", "When could you start?", "Are you insured?"];
  return ["Is this still available?", "Can I see it today?", "What is your lowest price?"];
}

export function ContactSeller({ listingId, sellerId, action, catId, place, sold }: { listingId: string; sellerId: string | null; action: Action; catId: string; place?: string; sold?: boolean }) {
  const session = useSession();
  const draftKey = `tm-draft-${listingId}`;
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(action.ask);
  const [needSignIn, setNeedSignIn] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");

  // Back from the sign-in link: reopen the message exactly as they left it.
  useEffect(() => {
    if (!session) return;
    const t = setTimeout(() => {
      try {
        const d = localStorage.getItem(draftKey);
        if (d) { setBody(d); setOpen(true); setResumed(true); }
      } catch { /* storage blocked: nothing to restore */ }
    }, 0);
    return () => clearTimeout(t);
  }, [session, draftKey]);

  const more = <Link href={`/?cat=${catId}`} className="btn btn-lg btn-ghost">See similar listings</Link>;
  if (sold) return <div className="next"><Notice tone="info">This one has been sold, but there is more where it came from.</Notice>{more}</div>;
  if (!sellerId) return <div className="next"><Notice tone="info">This is a sample listing, so there is nobody to message. Real listings from your neighbors are a tap away.</Notice>{more}</div>;
  if (state === "sent") return (
    <div className="next">
      <Notice tone="ok"><strong>Message sent.</strong> The seller will see it in their account and can reply to your email.</Notice>
      <Link href="/" className="btn btn-lg">Keep browsing</Link>
      <Link href="/saved" className="btn btn-lg btn-ghost">View my saved items</Link>
    </div>
  );
  if (session && session.user.id === sellerId) return <div className="next"><Notice tone="info">This is your own listing, so there is nobody to message.</Notice><Link href="/account" className="btn btn-lg">Manage my listings</Link></div>;
  if (!open) return (
    <div className="next cta">
      <button className="btn btn-lg" onClick={() => setOpen(true)}><Icon name={action.map ? "msg" : action.icon} size={18} color="#fff" />{action.map ? "Message seller" : action.label}</button>
      {action.map && place && <a className="btn btn-lg btn-ghost" href={mapsUrl(place)} target="_blank" rel="noopener noreferrer"><Icon name="nav" size={18} />Get directions</a>}
    </div>
  );

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!session) {
      // Not signed in yet: keep what they wrote, then ask for the email. The message waits for them.
      try { localStorage.setItem(draftKey, text); } catch { /* ignore */ }
      setNeedSignIn(true);
      return;
    }
    setState("sending"); setErr("");
    const { error } = await supabaseBrowser().from("tm_messages").insert({ listing_id: listingId, seller_id: sellerId, sender_email: session.user.email, body: text });
    if (error) { setErr(error.code === "42501" ? "This listing is no longer taking messages. It may have sold or expired." : error.message); setState("idle"); return; }
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    setState("sent"); toast("Message sent");
  }

  if (needSignIn && !session) return (
    <div className="next">
      <Notice tone="ok"><strong>Your message is saved:</strong> “{body.length > 90 ? `${body.slice(0, 90)}…` : body}”</Notice>
      <SignIn next={`/listing/${listingId}`} title="One last step" note="Sign in so the seller can reply to you. Your message will be waiting for you to send." />
      <button type="button" className="btn btn-lg btn-ghost" onClick={() => setNeedSignIn(false)}>Edit my message</button>
    </div>
  );

  return (
    <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {resumed && <Notice tone="ok">Welcome back! Your message is ready. Tap Send when you are happy with it.</Notice>}
      <Notice tone="warn"><strong>Stay safe.</strong> Meet in a public place and see it before you pay. Never send deposits, gift cards or wire transfers. <Link href="/safety" target="_blank">Safety tips</Link></Notice>
      <div className="field">
        <label htmlFor="body">Message to seller</label>
        <div className="quick" role="group" aria-label="Quick messages">
          {quickFor(action).map((q) => <button key={q} type="button" className="chip" aria-pressed={body === q} onClick={() => setBody(q)}>{q}</button>)}
        </div>
        <textarea id="body" name="body" className="input" rows={4} required minLength={2} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      {err && <Notice tone="bad">{err}</Notice>}
      <button className="btn btn-lg" disabled={state === "sending"}>{state === "sending" ? <><span className="spinner" />Sending…</> : <><Icon name="msg" size={18} color="#fff" />{session ? "Send message" : "Continue"}</>}</button>
      <button type="button" className="btn btn-lg btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";

export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export function SignIn({ next = "/account", note, title = "Sign in" }: { next?: string; note?: string; title?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}${next}` },
    });
    if (error) { setState("error"); setMsg(error.message); } else setState("sent");
  }

  if (state === "sent") return <div className="notice" role="status" style={{ maxWidth: 420 }}>Check your inbox! We sent a sign-in link to {email}. Wrong address or nothing arrived? <button type="button" className="linkbtn" onClick={() => setState("idle")}>Try again</button>. <Link href="/">Back to listings</Link></div>;
  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 420 }}>
      <h2 style={{ margin: 0, fontSize: "var(--fs-h2)", fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h2>
      {note && <p style={{ margin: 0, color: "var(--label2)" }}>{note}</p>}
      <p className="muted" style={{ margin: 0 }}>Free. We email you a one-time link, so there is no password.</p>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      {state === "error" && <div className="notice" role="alert">{msg}</div>}
      <button className="btn btn-lg" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Email me a sign-in link"}</button>
    </form>
  );
}

export function AuthGate({ children, next, note, title }: { children: (s: Session) => ReactNode; next?: string; note?: string; title?: string }) {
  const session = useSession();
  if (session === undefined) return <div className="notice">Loading…</div>;
  if (!session) return <SignIn next={next} note={note} title={title} />;
  return <>{children(session)}</>;
}

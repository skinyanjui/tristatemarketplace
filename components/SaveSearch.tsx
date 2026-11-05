"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "./AuthGate";
import { supabaseBrowser } from "@/lib/supabase/client";
import { toast } from "./Toaster";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { Icon } from "./Icon";

const KEEP = ["q", "cat", "min", "max", "near", "within", "wanted", "verified", "town", "sort"];

/** Saves the current search and filters so the member can re-run them from the Saved page. */
export function SaveSearch() {
  const params = useSearchParams();
  const session = useSession();
  const [busy, setBusy] = useState(false);
  const sp = new URLSearchParams();
  for (const k of KEEP) { const v = params.get(k); if (v) sp.set(k, v); }
  const query = sp.toString();
  if (!query) return null; // nothing to save on the unfiltered front page

  const parts = [
    params.get("q") && `“${params.get("q")}”`,
    params.get("wanted") === "1" && "Wanted",
    params.get("cat") && CATEGORY_BY_ID[params.get("cat")!]?.label,
    params.get("town")?.split(",")[0],
    params.get("verified") === "1" && "Verified sellers",
  ].filter(Boolean) as string[];
  const label = (parts.join(" · ") || "My search").slice(0, 120);

  async function save() {
    if (!session) { toast("Sign in to save searches.", { href: `/account`, cta: "Sign in" }); return; }
    setBusy(true);
    const { error } = await supabaseBrowser().from("tm_saved_searches").insert({ label, query });
    setBusy(false);
    if (!error) toast("Search saved.", { href: "/saved", cta: "View" });
    else if (error.code === "23505") toast("You already saved this search.", { href: "/saved", cta: "View" });
    else toast("Could not save. You can keep up to 20 searches.");
  }
  return <button type="button" className="chip" onClick={save} disabled={busy}><Icon name="heart" size={14} /> Save search</button>;
}

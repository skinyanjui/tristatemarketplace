"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "./AuthGate";
import { supabaseBrowser } from "@/lib/supabase/client";
import { toast } from "./Toaster";
import { Icon } from "./Icon";

type Row = { id: string; label: string; query: string };

/** The member's saved searches, each one tap to run again. */
export function SavedSearches() {
  const session = useSession();
  const [rows, setRows] = useState<Row[] | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabaseBrowser().from("tm_saved_searches").select("id,label,query").order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  }, []);
  useEffect(() => { if (session) { const t = setTimeout(load, 0); return () => clearTimeout(t); } }, [session, load]);
  async function remove(id: string) {
    const { error } = await supabaseBrowser().from("tm_saved_searches").delete().eq("id", id);
    if (error) { toast("Could not remove that search."); return; }
    setRows((r) => (r ?? []).filter((x) => x.id !== id));
    toast("Search removed.");
  }
  return (
    <section aria-labelledby="ss-h" className="savedsearches">
      <h2 id="ss-h">Saved searches</h2>
      {!session ? (
        <p className="muted">Sign in to keep your searches. Use “Save search” on the listings page after you set filters. <Link href="/account">Sign in</Link></p>
      ) : rows === null ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No saved searches yet. Set a search or filters on the <Link href="/">listings page</Link> and tap “Save search”.</p>
      ) : (
        <ul className="sslist">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/?${r.query}`} className="ssrun"><Icon name="search" size={16} /><span>{r.label}</span><Icon name="chev" size={14} /></Link>
              <button type="button" className="btn btn-ghost" onClick={() => remove(r.id)} aria-label={`Remove saved search: ${r.label}`}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { cacheLife } from "next/cache";
import { CATEGORIES, FEATURED_IDS } from "./categories";
import { supabaseServer } from "./supabase/client";

/** Category ids ordered by how many active listings they have (ties keep the default order). Cached for a few minutes. */
export async function popularCategoryIds(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  const { data } = await supabaseServer().from("tm_listings").select("kind").eq("status", "active").limit(5000);
  const counts = new Map<string, number>();
  for (const r of (data ?? []) as { kind: string }[]) counts.set(r.kind, (counts.get(r.kind) ?? 0) + 1);
  const base = [...FEATURED_IDS, ...CATEGORIES.map((c) => c.id).filter((id) => !FEATURED_IDS.includes(id))];
  return base.map((id, i) => ({ id, i, n: counts.get(id) ?? 0 })).sort((a, b) => b.n - a.n || a.i - b.i).map((x) => x.id);
}

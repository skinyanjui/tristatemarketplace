import { SEED } from "./seed";
import type { Listing } from "./types";

// Data access lives behind these two functions so the page code does not care
// where listings come from. They read the seed data until Supabase is connected.
export async function getListings(opts: { q?: string; cat?: string } = {}): Promise<Listing[]> {
  const needle = (opts.q ?? "").trim().toLowerCase();
  return SEED.filter((l) => {
    if (opts.cat && opts.cat !== "all" && l.kind !== opts.cat) return false;
    if (!needle) return true;
    return `${l.title} ${l.place} ${l.kind}`.toLowerCase().includes(needle);
  });
}

export async function getListing(id: string): Promise<Listing | null> {
  return SEED.find((l) => l.id === id) ?? null;
}

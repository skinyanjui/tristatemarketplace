import { TOWN_BY_ID } from "./places";
import { supabaseServer } from "./supabase/client";
import type { Listing } from "./types";

type Row = {
  id: string; kind: string; title: string; place: string; price: string; condition: string;
  description: string; details: [string, string][] | null; photos: string[] | null;
  seller_id: string | null; seller_name: string; seller_meta: string; created_at: string; status: string; event_date: string | null; featured_until?: string | null;
};

const COLUMNS = "id,seller_id,kind,title,place,price,condition,description,details,photos,seller_name,seller_meta,created_at,status,event_date,featured_until";

function posted(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

export function fromRow(r: Row): Listing {
  const photos = r.photos ?? [];
  return {
    id: r.id, kind: r.kind, title: r.title, place: r.place, price: r.price, condition: r.condition,
    description: r.description, details: r.details ?? [],
    seller: { name: r.seller_name || "Neighbor", meta: r.seller_meta },
    posted: posted(r.created_at), photoCount: photos.length, photos, sellerId: r.seller_id, sold: r.status === "sold", eventDate: r.event_date ?? undefined, featured: !!r.featured_until && new Date(r.featured_until) > new Date(), featuredUntil: r.featured_until ?? undefined,
  };
}

export type Sort = "new" | "old" | "soon" | "low" | "high" | "az" | "za";
export const PAGE_SIZE = 48;

export type Opts = { q?: string; cat?: string; min?: number; max?: number; sort?: Sort; page?: number; near?: string; within?: number };

/** One page of listings. Sold listings stay visible but sort after active ones. */
export async function getListings(opts: Opts = {}): Promise<{ items: Listing[]; total: number; page: number; pages: number }> {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const sb = supabaseServer();
  const town = opts.near ? TOWN_BY_ID[opts.near] : undefined;
  let nearIds: string[] | null = null;
  if (town && opts.within) {
    const { data, error: nearErr } = await sb.rpc("tm_near", { c_lat: town.lat, c_lng: town.lng, miles: opts.within });
    if (nearErr) throw new Error(`Could not measure distance: ${nearErr.message}`);
    nearIds = (data as string[]).length ? (data as string[]) : ["-"];
  }
  const q = (opts.q ?? "").trim().replace(/[%,()*]/g, " ");
  const today = new Date().toISOString().slice(0, 10);
  // Same filters for the featured strip and the main list.
  const base = (count: boolean) => {
    let query = sb.from("tm_listings").select(COLUMNS, count ? { count: "exact" } : undefined).in("status", ["active", "sold"]);
    if (nearIds) query = query.in("id", nearIds);
    if (opts.cat && opts.cat !== "all") query = query.eq("kind", opts.cat);
    if (q) query = query.or(`title.ilike.%${q}%,place.ilike.%${q}%,kind.ilike.%${q}%,description.ilike.%${q}%`);
    // Events and sales drop off the site once their date has passed.
    query = query.or(`event_date.is.null,event_date.gte.${today}`);
    if (opts.min !== undefined) query = query.gte("price_value", opts.min);
    if (opts.max !== undefined) query = query.lte("price_value", opts.max);
    return query;
  };

  // Paid "Featured" listings are pinned to the top of page 1.
  const { data: fData, error: fErr } = await base(false).eq("status", "active").gt("featured_until", new Date().toISOString())
    .order("featured_until", { ascending: false }).limit(8);
  if (fErr) throw new Error(`Could not load listings: ${fErr.message}`);
  const featured = ((fData ?? []) as unknown as Row[]).map(fromRow).map((l) => ({ ...l, featured: true }));

  let query = base(true);
  if (featured.length) query = query.not("id", "in", `(${featured.map((f) => f.id).join(",")})`);
  query = query.order("status", { ascending: true });
  if (opts.sort === "low" || opts.sort === "high") query = query.order("price_value", { ascending: opts.sort === "low", nullsFirst: false });
  if (opts.sort === "soon") query = query.order("event_date", { ascending: true, nullsFirst: false });
  if (opts.sort === "az" || opts.sort === "za") query = query.order("title", { ascending: opts.sort === "az" });
  query = query.order("created_at", { ascending: opts.sort === "old" }).range(from, from + PAGE_SIZE - 1);
  const { data, error, count } = await query;
  if (error) throw new Error(`Could not load listings: ${error.message}`);
  const total = (count ?? 0) + featured.length;
  const items = (data as unknown as Row[]).map(fromRow);
  return { items: page === 1 ? [...featured, ...items] : items, total, page, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)) };
}

export async function getAllListings(): Promise<Listing[]> {
  const { data, error } = await supabaseServer().from("tm_listings").select(COLUMNS).in("status", ["active", "sold"]).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(`Could not load listings: ${error.message}`);
  return (data as Row[]).map(fromRow);
}

export async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabaseServer().from("tm_listings").select(COLUMNS).eq("id", id).in("status", ["active", "sold"]).maybeSingle();
  if (error) throw new Error(`Could not load listing: ${error.message}`);
  return data ? fromRow(data as Row) : null;
}

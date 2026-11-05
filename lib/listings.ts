import { supabaseServer } from "./supabase/client";
import type { Listing } from "./types";

type Row = {
  id: string; kind: string; title: string; place: string; price: string; condition: string;
  description: string; details: [string, string][] | null; photos: string[] | null;
  seller_id: string | null; seller_name: string; seller_meta: string; created_at: string; status: string;
};

const COLUMNS = "id,seller_id,kind,title,place,price,condition,description,details,photos,seller_name,seller_meta,created_at,status";

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
    posted: posted(r.created_at), photoCount: photos.length, photos, sellerId: r.seller_id, sold: r.status === "sold",
  };
}

export type Sort = "new" | "low" | "high";
export const PAGE_SIZE = 48;

export type Opts = { q?: string; cat?: string; min?: number; max?: number; sort?: Sort; page?: number };

/** One page of listings. Sold listings stay visible but sort after active ones. */
export async function getListings(opts: Opts = {}): Promise<{ items: Listing[]; total: number; page: number; pages: number }> {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  let query = supabaseServer().from("tm_listings").select(COLUMNS, { count: "exact" }).in("status", ["active", "sold"]);
  if (opts.cat && opts.cat !== "all") query = query.eq("kind", opts.cat);
  const q = (opts.q ?? "").trim().replace(/[%,()*]/g, " ");
  if (q) query = query.or(`title.ilike.%${q}%,place.ilike.%${q}%,kind.ilike.%${q}%,description.ilike.%${q}%`);
  if (opts.min !== undefined) query = query.gte("price_value", opts.min);
  if (opts.max !== undefined) query = query.lte("price_value", opts.max);
  query = query.order("status", { ascending: true });
  if (opts.sort === "low" || opts.sort === "high") query = query.order("price_value", { ascending: opts.sort === "low", nullsFirst: false });
  query = query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const { data, error, count } = await query;
  if (error) throw new Error(`Could not load listings: ${error.message}`);
  const total = count ?? 0;
  return { items: (data as Row[]).map(fromRow), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Up to 500 active listings, for the sitemap and for matching saved listings in Account. */
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

import { supabaseServer } from "./supabase/client";
import type { Listing } from "./types";

type Row = {
  id: string; kind: string; title: string; place: string; price: string; condition: string;
  description: string; details: [string, string][] | null; photos: string[] | null;
  seller_id: string | null; seller_name: string; seller_meta: string; created_at: string;
};

const COLUMNS = "id,seller_id,kind,title,place,price,condition,description,details,photos,seller_name,seller_meta,created_at";

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
    posted: posted(r.created_at), photoCount: photos.length, photos, sellerId: r.seller_id,
  };
}

/** First number in a display price ("$18,500", "$2 – $600"); "Free" is 0; no number means unknown. */
export function priceValue(price: string): number | null {
  if (/free/i.test(price)) return 0;
  const m = price.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export type Sort = "new" | "low" | "high";

export async function getListings(opts: { q?: string; cat?: string; min?: number; max?: number; sort?: Sort } = {}): Promise<Listing[]> {
  let query = supabaseServer().from("tm_listings").select(COLUMNS).eq("status", "active").order("created_at", { ascending: false }).limit(200);
  if (opts.cat && opts.cat !== "all") query = query.eq("kind", opts.cat);
  const q = (opts.q ?? "").trim().replace(/[%,()*]/g, " ");
  if (q) query = query.or(`title.ilike.%${q}%,place.ilike.%${q}%,kind.ilike.%${q}%,description.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load listings: ${error.message}`);
  let out = (data as Row[]).map(fromRow);
  const { min, max, sort } = opts;
  if (min !== undefined || max !== undefined) {
    out = out.filter((l) => {
      const v = priceValue(l.price);
      return v !== null && (min === undefined || v >= min) && (max === undefined || v <= max);
    });
  }
  if (sort === "low" || sort === "high") {
    const key = (l: Listing) => priceValue(l.price) ?? (sort === "low" ? Infinity : -Infinity);
    out.sort((a, b) => (sort === "low" ? key(a) - key(b) : key(b) - key(a)));
  }
  return out;
}

export async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabaseServer().from("tm_listings").select(COLUMNS).eq("id", id).eq("status", "active").maybeSingle();
  if (error) throw new Error(`Could not load listing: ${error.message}`);
  return data ? fromRow(data as Row) : null;
}

import { supabaseServer } from "./supabase/client";
import type { Listing } from "./types";

type Row = {
  id: string; kind: string; title: string; place: string; price: string; condition: string;
  description: string; details: [string, string][] | null; photos: string[] | null;
  seller_name: string; seller_meta: string; created_at: string;
};

const COLUMNS = "id,kind,title,place,price,condition,description,details,photos,seller_name,seller_meta,created_at";

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
    posted: posted(r.created_at), photoCount: photos.length, photos,
  };
}

export async function getListings(opts: { q?: string; cat?: string } = {}): Promise<Listing[]> {
  let query = supabaseServer().from("tm_listings").select(COLUMNS).eq("status", "active").order("created_at", { ascending: false }).limit(200);
  if (opts.cat && opts.cat !== "all") query = query.eq("kind", opts.cat);
  const q = (opts.q ?? "").trim().replace(/[%,()*]/g, " ");
  if (q) query = query.or(`title.ilike.%${q}%,place.ilike.%${q}%,kind.ilike.%${q}%,description.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load listings: ${error.message}`);
  return (data as Row[]).map(fromRow);
}

export async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabaseServer().from("tm_listings").select(COLUMNS).eq("id", id).eq("status", "active").maybeSingle();
  if (error) throw new Error(`Could not load listing: ${error.message}`);
  return data ? fromRow(data as Row) : null;
}

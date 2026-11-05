import zipcodes from "zipcodes";
import { TOWN_BY_ID } from "./places";

export type ZipHit = { zip: string; city: string; state: string; lat: number; lng: number };
type Entry = { zip: string; city: string; state: string; latitude: number; longitude: number };

// Every US ZIP code (about 44,000), indexed once per server instance.
let index: { all: ZipHit[]; byCity: Map<string, ZipHit> } | undefined;
const PRIORITY = new Set(["IN", "KY", "IL"]);

function build() {
  if (index) return index;
  const all = (Object.values(zipcodes.codes) as Entry[])
    .filter((e) => e.latitude && e.longitude)
    .map((e) => ({ zip: e.zip, city: e.city, state: e.state, lat: e.latitude, lng: e.longitude }))
    .sort((a, b) => a.zip.localeCompare(b.zip));
  const byCity = new Map<string, ZipHit>();
  for (const h of all) { const k = `${h.city.toLowerCase()}|${h.state}`; if (!byCity.has(k)) byCity.set(k, h); }
  index = { all, byCity };
  return index;
}

export function zipInfo(zip: string): ZipHit | null {
  if (!/^\d{5}$/.test(zip)) return null;
  const e = zipcodes.lookup(zip) as Entry | undefined;
  return e ? { zip: e.zip, city: e.city, state: e.state, lat: e.latitude, lng: e.longitude } : null;
}

const STATES = new Set(Object.keys(zipcodes.states.abbr));
/** ZIP codes (by prefix) or cities (by "City" or "City, ST"). Tristate states come first when names tie. */
export function searchPlaces(raw: string, limit = 8): ZipHit[] {
  const q = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return [];
  const { all, byCity } = build();
  if (/^\d{1,5}$/.test(q)) return q.length === 5 ? [zipInfo(q)].filter(Boolean) as ZipHit[] : all.filter((h) => h.zip.startsWith(q)).slice(0, limit);
  let name = q, st = "";
  const m = q.match(/^(.*?)[,\s]+([a-z]{2})$/);
  if (m && STATES.has(m[2].toUpperCase())) { name = m[1].replace(/,$/, "").trim(); st = m[2].toUpperCase(); }
  const out: ZipHit[] = [];
  for (const [k, h] of byCity) {
    if (st && h.state !== st) continue;
    if (k.startsWith(name)) out.push(h);
  }
  return out
    .sort((a, b) => Number(PRIORITY.has(b.state)) - Number(PRIORITY.has(a.state)) || a.city.localeCompare(b.city) || a.state.localeCompare(b.state))
    .slice(0, limit);
}

/** The point "closest" and "within" are measured from: one of our towns (by id) or any 5-digit ZIP code. */
export function resolveNear(id: string): { id: string; name: string; lat: number; lng: number } | null {
  const t = TOWN_BY_ID[id];
  if (t) return t;
  const z = zipInfo(id);
  return z ? { id: z.zip, name: `${z.city}, ${z.state} ${z.zip}`, lat: z.lat, lng: z.lng } : null;
}

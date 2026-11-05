import { CONDITION_LABEL } from "./condition-labels";
import { milesLabel } from "./keyfact";
import type { Listing } from "./types";

export type Glance = { label: string; value: string; /** Detail label this fact came from, so the Details list can skip it. */ from?: string };

/** Detail labels worth showing first, per category. */
const KEYS: Record<string, string[]> = {
  car: ["Year", "Mileage", "Transmission", "Drive"],
  moto: ["Year", "Mileage", "Engine", "Title"],
  boat: ["Year", "Length", "Engine", "Hours"],
  farm: ["Year", "Hours", "Drive", "Brand"],
  trailer: ["Length", "Type", "Axles", "Year"],
  home: ["Bedrooms", "Bathrooms", "Living area", "Lot"],
  land: ["Acres", "Zoning", "Road access"],
  livestock: ["Breed", "Age", "Quantity"],
  pets: ["Breed", "Age"],
  sale: ["Date", "Hours", "Parking"],
  event: ["Date", "Time", "Admission", "Doors"],
  furniture: ["Material", "Width", "Finish"],
  appliance: ["Brand", "Capacity", "Finish"],
  tools: ["Brand", "Voltage", "Batteries"],
  garden: ["Brand", "Deck"],
  electronics: ["Brand", "Size", "Resolution"],
  sports: ["Brand", "Size", "Frame"],
  clothing: ["Sizes", "Pieces", "Brand"],
  kids: ["Brand", "Ages", "Includes"],
  antiques: ["Era", "Size", "Material"],
  music: ["Brand", "Includes"],
  services: ["Rate", "Available"],
  jobs: ["Pay", "Hours"],
  free: ["Pickup", "Quantity"],
};
const CONDITION_SHORT: Record<string, string> = { event: "Ages", livestock: "Health" };
const FALLBACK = ["Year", "Brand", "Size", "Type", "Date"];
const SHORT: Record<string, string> = { "Living area": "Size", Bedrooms: "Beds", Bathrooms: "Baths", Transmission: "Trans." };
/** Details whose bare-number value reads better with a unit. */
const UNIT: Record<string, string> = { Mileage: " mi", Hours: " hrs", Acres: " acres" };

/** Shorter spellings so four tiles fit a phone: no weekday on dates, "8am–3pm", no "Used -" prefix. */
function compact(v: string): string {
  return v.replace(/^Used\s*-\s*/i, "").replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,\s*/i, "").replace(/\s*(AM|PM)\b/g, (_, m: string) => m.toLowerCase())
    .replace(/\s+[–-]\s+/g, "–").trim();
}

/** Up to four compact facts for the top of a listing: the category's key details, condition, and distance. */
export function glance(l: Listing, miles?: number): Glance[] {
  const det = new Map(l.details.map(([k, v]) => [k, v]));
  const dist = milesLabel(miles);
  const max = dist ? 3 : 4;
  const out: Glance[] = [];
  for (const k of KEYS[l.kind] ?? FALLBACK) {
    const v = det.get(k);
    if (!v) continue;
    out.push({ label: SHORT[k] ?? k, value: compact(UNIT[k] && !/[a-z]/i.test(v) ? `${v}${UNIT[k]}` : v), from: k });
  }
  if (l.condition && !/^(not applicable|n\/a)$/i.test(l.condition)) {
    out.splice(Math.min(2, out.length), 0, { label: CONDITION_SHORT[l.kind] ?? CONDITION_LABEL[l.kind] ?? "Condition", value: compact(l.condition), from: "__condition" });
  }
  const items = out.slice(0, max);
  if (dist) items.push({ label: "Away", value: dist });
  return items;
}

"use client";
import { useEffect, useId, useRef, useState } from "react";
import { townFor } from "@/lib/places";

export type Picked = { label: string; place: string; lat: number; lng: number; near: string };
type Hit = { zip: string; city: string; state: string; lat: number; lng: number };
const label = (h: Hit) => `${h.city}, ${h.state} ${h.zip}`;

/** A text box that takes any US ZIP code, "City, ST", or one of our towns, and reports where that is. */
export function PlaceInput({ id, name, defaultValue = "", placeholder, required, onPick, className = "input" }: {
  id?: string; name?: string; defaultValue?: string; placeholder?: string; required?: boolean; className?: string;
  onPick: (p: Picked | null, text: string) => void;
}) {
  const list = useId();
  const [hits, setHits] = useState<Hit[]>([]);
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function resolve(text: string, found: Hit[]) {
    const t = text.trim();
    const town = townFor(t);
    if (town) return onPick({ label: town.name, place: town.name, lat: town.lat, lng: town.lng, near: town.id }, text);
    const h = found.find((x) => label(x).toLowerCase() === t.toLowerCase()) ?? (/^\d{5}$/.test(t) ? found.find((x) => x.zip === t) : undefined)
      ?? (found.length === 1 && /,\s*[a-z]{2}$/i.test(t) && found[0].city.toLowerCase() === t.replace(/,\s*[a-z]{2}$/i, "").toLowerCase() ? found[0] : undefined);
    onPick(h ? { label: label(h), place: `${h.city}, ${h.state}`, lat: h.lat, lng: h.lng, near: h.zip } : null, text);
  }

  function change(text: string) {
    resolve(text, hits);
    clearTimeout(timer.current);
    const t = text.trim();
    if (t.length < 2 || townFor(t)) return;
    const mine = ++seq.current;
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/zip?q=${encodeURIComponent(t)}`);
        const j = (await r.json()) as { results: Hit[] };
        if (mine !== seq.current) return;
        setHits(j.results); resolve(text, j.results);
      } catch { /* suggestions are optional */ }
    }, 150);
  }

  return (
    <>
      <input id={id} name={name} className={className} defaultValue={defaultValue} placeholder={placeholder} required={required} maxLength={80}
        list={list} autoComplete="off" inputMode="text" onChange={(e) => change(e.target.value)} />
      <datalist id={list}>{hits.map((h) => <option key={h.zip} value={label(h)} />)}</datalist>
    </>
  );
}

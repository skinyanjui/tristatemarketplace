"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SortMenu } from "./SortMenu";
import { RADII, TOWNS, TOWN_BY_ID } from "@/lib/places";

const SORTS = [
  { value: "new", label: "Newest first" },
  { value: "soon", label: "Happening soonest" },
  { value: "old", label: "Oldest first" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "az", label: "Title: A to Z" },
  { value: "za", label: "Title: Z to A" },
];

/** Price range and sort, kept in the URL. Active filters show as removable tokens. */
export function Filters({ origin, defaultSort }: { origin: string; defaultSort: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const pop = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!pop.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const near = params.get("near") ?? "";
  const within = params.get("within") ?? "";
  const [distOpen, setDistOpen] = useState(false);
  const dist = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!distOpen) return;
    const away = (e: MouseEvent) => { if (!dist.current?.contains(e.target as Node)) setDistOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [distOpen]);
  const q = params.get("q");
  const fallback = defaultSort;
  const rawSort = params.get("sort");
  const sort = rawSort ?? fallback;

  function set(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === "sort" && v === fallback)) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    const qs = sp.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const tokens: { label: string; clear: Record<string, string> }[] = [];
  if (min) tokens.push({ label: `From $${Number(min).toLocaleString()}`, clear: { min: "" } });
  if (max) tokens.push({ label: `Up to $${Number(max).toLocaleString()}`, clear: { max: "" } });

  if (within && TOWN_BY_ID[near]) tokens.push({ label: `Within ${within} mi of ${TOWN_BY_ID[near].name.split(",")[0]}`, clear: { near: "", within: "" } });
  else if (TOWN_BY_ID[near]) tokens.push({ label: `From ${TOWN_BY_ID[near].name.split(",")[0]}`, clear: { near: "" } });

  return (
    <>
      <div className="filters" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div className="sortmenu" ref={pop} onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
          <button type="button" className="chip" aria-pressed={open} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>Price range</button>
          {open && (
            <form
              className="sortmenu-pop pricepop"
              aria-label="Price range"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                set({ min: String(fd.get("min") ?? ""), max: String(fd.get("max") ?? "") });
                setOpen(false);
              }}
            >
              <div className="field">
                <label htmlFor="min">Min $</label>
                <input id="min" name="min" className="input" inputMode="numeric" pattern="[0-9]*" defaultValue={min} placeholder="0" autoFocus />
              </div>
              <div className="field">
                <label htmlFor="max">Max $</label>
                <input id="max" name="max" className="input" inputMode="numeric" pattern="[0-9]*" defaultValue={max} placeholder="Any" />
              </div>
              <small className="hint">Leave a box empty for no limit.</small>
              <button className="btn">Apply</button>
            </form>
          )}
        </div>
        <div className="sortmenu" ref={dist} onKeyDown={(e) => { if (e.key === "Escape") setDistOpen(false); }}>
          <button type="button" className="chip" aria-expanded={distOpen} aria-haspopup="dialog" onClick={() => setDistOpen((o) => !o)}>Distance</button>
          {distOpen && (
            <form
              className="sortmenu-pop pricepop"
              aria-label="Distance"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                set({ near: String(fd.get("near") ?? ""), within: String(fd.get("within") ?? "") });
                setDistOpen(false);
              }}
            >
              <div className="field">
                <label htmlFor="within">How far?</label>
                <select id="within" name="within" className="input" defaultValue={within}>
                  <option value="">Any distance</option>
                  {RADII.map((r) => <option key={r} value={r}>{r} miles</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="near">From</label>
                <select id="near" name="near" className="input" defaultValue={near || origin}>
                  {TOWNS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <small className="hint">Closest listings to your town show first.</small>
              <button className="btn">Apply</button>
            </form>
          )}
        </div>
        <SortMenu label="Sort by" options={[...(q ? [{ value: "best", label: "Best match" }] : []), { value: "near", label: "Closest first" }, ...SORTS]} value={sort} onChange={(v) => set({ sort: v })} />
        {tokens.map((t) => (
          <button key={t.label} type="button" className="chip" onClick={() => set(t.clear)} aria-label={`Clear: ${t.label}`}>{t.label} ✕</button>
        ))}
      </div>
    </>
  );
}

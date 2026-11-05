"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SortMenu } from "./SortMenu";
import { useAnchoredPop } from "./useAnchoredPop";
import { RADII, TOWN_BY_ID } from "@/lib/places";
import { PlaceInput, type Picked } from "./PlaceInput";

const SORTS = [
  { value: "new", label: "Newest first" },
  { value: "soon", label: "Happening soonest" },
  { value: "verified", label: "Verified sellers first" },
  { value: "old", label: "Oldest first" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "az", label: "Title: A to Z" },
  { value: "za", label: "Title: Z to A" },
];

/** Price range and sort, kept in the URL. Active filters show as removable tokens. */
export function Filters({ origin, originLabel, defaultSort }: { origin: string; originLabel: string; defaultSort: string }) {
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
  const [picked, setPicked] = useState<Picked | null>(null);
  const nearName = (id: string) => (TOWN_BY_ID[id]?.name ?? (/^\d{5}$/.test(id) ? (id === origin ? originLabel : `ZIP ${id}`) : "")).split(",")[0];
  const pricePos = useAnchoredPop(open, () => setOpen(false));
  const distPos = useAnchoredPop(distOpen, () => setDistOpen(false));
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

  const byValue = Object.fromEntries(SORTS.map((o) => [o.value, o]));
  const primarySorts = [...(q ? ["best"] : []), ...(fallback === "soon" ? ["soon"] : []), "near", "new", "low", "high"];
  const sortOptions = [
    ...(q ? [{ value: "best", label: "Best match" }] : []),
    ...(fallback === "soon" ? [byValue.soon] : []),
    { value: "near", label: "Closest first" }, byValue.new, byValue.low, byValue.high,
    ...(fallback === "soon" ? [] : [byValue.soon]), byValue.verified, byValue.old, byValue.az, byValue.za,
  ];

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

  const verified = params.get("verified") === "1";
  const town = params.get("town") ?? "";
  const tokens: { label: string; clear: Record<string, string> }[] = [];
  if (min) tokens.push({ label: `From $${Number(min).toLocaleString()}`, clear: { min: "" } });
  if (max) tokens.push({ label: `Up to $${Number(max).toLocaleString()}`, clear: { max: "" } });

  if (town) tokens.push({ label: town.split(",")[0], clear: { town: "" } });
  if (within && nearName(near)) tokens.push({ label: `Within ${within} mi of ${nearName(near)}`, clear: { near: "", within: "" } });
  else if (nearName(near)) tokens.push({ label: `From ${nearName(near)}`, clear: { near: "" } });

  return (
    <>
      <div className="filters" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div className="sortmenu" ref={pop} onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
          <button type="button" className="chip" aria-pressed={open} aria-expanded={open} aria-haspopup="dialog" onClick={(e) => { pricePos.place(e.currentTarget); setOpen((o) => !o); }}>Price range</button>
          {open && (
            <form
              className="sortmenu-pop pricepop"
              style={pricePos.style}
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
          <button type="button" className="chip" aria-expanded={distOpen} aria-haspopup="dialog" onClick={(e) => { distPos.place(e.currentTarget); setDistOpen((o) => !o); }}>Distance</button>
          {distOpen && (
            <form
              className="sortmenu-pop pricepop"
              style={distPos.style}
              aria-label="Distance"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                set({ near: picked?.near ?? (near || origin), within: String(fd.get("within") ?? "") });
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
                <PlaceInput id="near" defaultValue={/^\d{5}$/.test(near) ? near : (TOWN_BY_ID[near || origin]?.name ?? originLabel)} placeholder="ZIP code or town" onPick={(p) => setPicked(p)} />
              </div>
              <small className="hint">Any US ZIP code works. Closest listings show first.</small>
              <button className="btn">Apply</button>
            </form>
          )}
        </div>
        <span className="vswitch">
          <span id="vsw-l">Verified</span>
          <button type="button" role="switch" aria-checked={verified} aria-labelledby="vsw-l" className="switch" onClick={() => set({ verified: verified ? "" : "1" })}><i /></button>
        </span>
        <SortMenu label="Sort by" options={sortOptions} primary={primarySorts} value={sort} onChange={(v) => set({ sort: v })} />
        {tokens.map((t) => (
          <button key={t.label} type="button" className="chip" onClick={() => set(t.clear)} aria-label={`Clear: ${t.label}`}>{t.label} ✕</button>
        ))}
      </div>
    </>
  );
}

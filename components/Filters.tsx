"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SortMenu } from "./SortMenu";

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
export function Filters() {
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
  const cat = params.get("cat");
  const fallback = cat === "event" || cat === "sale" ? "soon" : "new";
  const sort = params.get("sort") ?? fallback;

  function set(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === "sort" && v === fallback)) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const tokens: { label: string; clear: Record<string, string> }[] = [];
  if (min) tokens.push({ label: `From $${Number(min).toLocaleString()}`, clear: { min: "" } });
  if (max) tokens.push({ label: `Up to $${Number(max).toLocaleString()}`, clear: { max: "" } });

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
              <button className="btn">Apply</button>
            </form>
          )}
        </div>
        <SortMenu label="Sort by" options={SORTS} value={sort} onChange={(v) => set({ sort: v })} />
        {tokens.map((t) => (
          <button key={t.label} type="button" className="chip" onClick={() => set(t.clear)} aria-label={`Clear: ${t.label}`}>{t.label} ✕</button>
        ))}
      </div>
    </>
  );
}

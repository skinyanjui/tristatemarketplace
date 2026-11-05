"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** Price range and sort, kept in the URL. Active filters show as removable tokens. */
export function Filters() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const sort = params.get("sort") ?? "new";

  function set(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === "sort" && v === "new")) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const tokens: { label: string; clear: Record<string, string> }[] = [];
  if (min) tokens.push({ label: `From $${Number(min).toLocaleString()}`, clear: { min: "" } });
  if (max) tokens.push({ label: `Up to $${Number(max).toLocaleString()}`, clear: { max: "" } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="chip" aria-pressed={open} aria-expanded={open} onClick={() => setOpen((o) => !o)}>Price</button>
        <label className="sr-only" htmlFor="sort">Sort by</label>
        <select id="sort" className="input" style={{ width: "auto" }} value={sort} onChange={(e) => set({ sort: e.target.value })}>
          <option value="new">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
        {tokens.map((t) => (
          <button key={t.label} type="button" className="chip" onClick={() => set(t.clear)} aria-label={`Remove filter: ${t.label}`}>{t.label} ✕</button>
        ))}
      </div>
      {open && (
        <form
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            set({ min: String(fd.get("min") ?? ""), max: String(fd.get("max") ?? "") });
            setOpen(false);
          }}
        >
          <div className="field" style={{ flex: "0 1 140px" }}>
            <label htmlFor="min">Min $</label>
            <input id="min" name="min" className="input" inputMode="numeric" pattern="[0-9]*" defaultValue={min} placeholder="0" />
          </div>
          <div className="field" style={{ flex: "0 1 140px" }}>
            <label htmlFor="max">Max $</label>
            <input id="max" name="max" className="input" inputMode="numeric" pattern="[0-9]*" defaultValue={max} placeholder="Any" />
          </div>
          <button className="btn">Apply</button>
        </form>
      )}
    </div>
  );
}

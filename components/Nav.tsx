"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_BY_ID, FEATURED_IDS, GROUPS, categoriesInGroup } from "@/lib/categories";
import { Icon } from "./Icon";

const CHIP_COUNT = FEATURED_IDS.length;

function MoreCategories({ cat, onPick }: { cat: string; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  function toggle() {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: Math.max(12, Math.min(r.left, window.innerWidth - 332)) });
    }
    setOpen(!open);
  }

  useEffect(() => {
    if (!open) return;
    pop.current?.querySelector<HTMLButtonElement>("[aria-pressed='true']")?.focus();
    if (!pop.current?.contains(document.activeElement)) pop.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); }
    }
    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    }
    function onResize() { setOpen(false); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      <button ref={btn} type="button" className="chip chip-more" aria-haspopup="dialog" aria-expanded={open} aria-controls="catmore" onClick={toggle}>
        More
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && pos && typeof document !== "undefined" && createPortal(
        <>
          <div className="catmore-scrim" aria-hidden="true" />
          <div ref={pop} id="catmore" className="catmore" role="dialog" aria-label="All categories" style={{ top: pos.top, left: pos.left }}>
            <div className="catmore-head">
              <strong>All categories</strong>
              <button type="button" className="catmore-x" aria-label="Close" onClick={() => { setOpen(false); btn.current?.focus(); }}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            {GROUPS.map((g) => (
              <section key={g.id} aria-labelledby={`cg-${g.id}`}>
                <h3 id={`cg-${g.id}`} className="catgroup">{g.label}</h3>
                <div className="catlist">
                  {categoriesInGroup(g.id).map((c) => (
                    <button key={c.id} type="button" className="catitem" aria-pressed={cat === c.id} onClick={() => { setOpen(false); onPick(c.id); }}>
                      <span className="dot" style={{ background: c.color }} />{c.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

export function Nav({ popular = FEATURED_IDS }: { popular?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cat = params.get("cat") ?? "all";
  const onHome = pathname === "/";
  const wanted = params.get("wanted") === "1";
  const topIds = popular.slice(0, CHIP_COUNT);
  const FEATURED = topIds.map((id) => CATEGORY_BY_ID[id]).filter(Boolean);
  const extra = cat !== "all" && !topIds.includes(cat) ? CATEGORY_BY_ID[cat] : undefined;

  const chipsEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = chipsEl.current;
    const on = box?.querySelector<HTMLElement>(".chip[aria-pressed='true']");
    if (!box || !on) return;
    if (on.offsetLeft < box.scrollLeft || on.offsetLeft + on.offsetWidth > box.scrollLeft + box.clientWidth) box.scrollTo({ left: on.offsetLeft < 160 ? 0 : on.offsetLeft - 8, behavior: "smooth" });
  }, [cat, onHome]);

  function go(next: { q?: string; cat?: string; wanted?: boolean }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.cat !== undefined) {
      if (next.cat !== "all") sp.set("cat", next.cat);
      else sp.delete("cat");
    }
    if (next.wanted !== undefined) {
      if (next.wanted) sp.set("wanted", "1");
      else sp.delete("wanted");
    }
    sp.delete("page");
    const qs = sp.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  function onSearch(value: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => go({ q: value.trim() }), 200);
  }

  return (
    <header className="nav-wrap">
      <div className="nav">
        <Link href="/" className="brand" aria-label="Tristate Market home">
          <span className="brand-mark"><Icon name="pin" size={16} color="#fff" /></span>
          <span className="brand-text">Tristate Market</span>
        </Link>
        <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
          <Icon name="search" />
          <input type="search" aria-label="Search listings" placeholder="Search Tristate Market" defaultValue={params.get("q") ?? ""} onChange={(e) => onSearch(e.target.value)} />
        </form>
        <div className="nav-actions">
          <Link href="/saved" className="nav-link">Saved</Link>
          <Link href="/account" className="nav-link">Account</Link>
          <Link href="/post" className="btn"><Icon name="plus" size={16} color="#fff" />Post a listing</Link>
        </div>
      </div>
      {onHome && (
        <div className="chiprow">
          <div ref={chipsEl} className="chips" role="group" aria-label="Filter by category">
            <button type="button" className="chip" aria-pressed={cat === "all" && !wanted} onClick={() => go({ cat: "all", wanted: false })}>All</button>
            <button type="button" className="chip" aria-pressed={wanted} onClick={() => go({ wanted: !wanted })}>Wanted</button>
            {extra && (
              <button type="button" className="chip" aria-pressed="true" onClick={() => go({ cat: extra.id })}>{extra.label}</button>
            )}
            {FEATURED.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => go({ cat: c.id })}>{c.label}</button>
            ))}
            <MoreCategories cat={cat} onPick={(id) => go({ cat: id })} />
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { CATEGORIES } from "@/lib/categories";
import { Icon } from "./Icon";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cat = params.get("cat") ?? "all";
  const onHome = pathname === "/";

  function go(next: { q?: string; cat?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.cat !== undefined) {
      if (next.cat !== "all") sp.set("cat", next.cat);
      else sp.delete("cat");
    }
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
          <Link href="/account" className="nav-link">Sign in</Link>
          <Link href="/post" className="btn"><Icon name="plus" size={16} color="#fff" />Post a listing</Link>
        </div>
      </div>
      {onHome && (
        <div className="chiprow">
          <div className="chips" role="group" aria-label="Filter by category">
            <button type="button" className="chip" aria-pressed={cat === "all"} onClick={() => go({ cat: "all" })}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => go({ cat: c.id })}>{c.label}</button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

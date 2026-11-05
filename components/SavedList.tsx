"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Notice } from "./Notice";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./ListingCard";

function read() {
  try {
    return localStorage.getItem("tm-saved") ?? "[]";
  } catch {
    return "[]";
  }
}
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export function SavedList({ all }: { all: Listing[] }) {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const ids = new Set(JSON.parse(raw) as string[]);
  const saved = all.filter((l) => ids.has(l.id));
  if (!saved.length) return <div className="notice">Nothing saved yet. Tap the heart on anything you like and it will wait for you here. <Link href="/">Browse listings</Link>.</div>;
  const gone = ids.size - saved.length;
  return (
    <>
      {gone > 0 && <Notice tone="info" className="mb">{gone} saved {gone === 1 ? "listing is" : "listings are"} no longer available (sold, expired or removed).</Notice>}
      <div className="grid">
        {saved.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </>
  );
}

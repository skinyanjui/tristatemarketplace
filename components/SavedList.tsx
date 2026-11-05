"use client";

import { useSyncExternalStore } from "react";
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
  if (!saved.length) return <div className="notice">Nothing saved yet. Tap the heart on a listing to keep it here.</div>;
  return (
    <div className="grid">
      {saved.map((l) => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}

"use client";

import { useEffect, useState, type CSSProperties } from "react";

/** Where to put a popup under its button. Fixed, so a scrolling or clipping parent row cannot cut it off. */
export function placeUnder(el: Element): CSSProperties {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const base: CSSProperties = { position: "fixed", top: r.bottom + 8, zIndex: 60, maxWidth: vw - 16 };
  return r.left + r.width / 2 > vw / 2
    ? { ...base, left: "auto", right: Math.max(8, vw - r.right) }
    : { ...base, right: "auto", left: Math.min(Math.max(8, r.left), Math.max(8, vw - 312)) };
}

/** Anchored popup helper: call place(button) when opening; it closes on resize or page scroll so it never floats away from its button. */
export function useAnchoredPop(open: boolean, close: () => void) {
  const [style, setStyle] = useState<CSSProperties>();
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => { window.removeEventListener("resize", close); window.removeEventListener("scroll", close, true); };
  }, [open, close]);
  return { style, place: (el: Element) => setStyle(placeUnder(el)) };
}

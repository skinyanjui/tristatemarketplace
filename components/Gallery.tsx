"use client";

import { useState, type ReactNode } from "react";
/* eslint-disable @next/next/no-img-element */

/** Hero image with arrows, swipe and thumbnails. Falls back to a single image when there is one. */
export function Gallery({ photos, fallback, title, children }: { photos: string[]; fallback: string; title: string; children?: ReactNode }) {
  const imgs = photos.length ? photos : [fallback];
  const [i, setI] = useState(0);
  const [x0, setX0] = useState<number | null>(null);
  const go = (n: number) => setI((n + imgs.length) % imgs.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        className="hero"
        onTouchStart={(e) => setX0(e.touches[0].clientX)}
        onTouchEnd={(e) => { if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); } setX0(null); }}
      >
        <img src={imgs[i]} alt={imgs.length > 1 ? `${title}, photo ${i + 1} of ${imgs.length}` : title} draggable={false} />
        {children}
        {imgs.length > 1 && (
          <>
            <button type="button" className="gal-btn" style={{ left: 8 }} onClick={() => go(i - 1)} aria-label="Previous photo">‹</button>
            <button type="button" className="gal-btn" style={{ right: 8 }} onClick={() => go(i + 1)} aria-label="Next photo">›</button>
            <span className="gal-count" aria-hidden="true">{i + 1} / {imgs.length}</span>
          </>
        )}
      </div>
      {imgs.length > 1 && (
        <div className="gal-thumbs" role="group" aria-label="Photos">
          {imgs.map((src, n) => (
            <button key={src} type="button" onClick={() => setI(n)} aria-label={`Show photo ${n + 1}`} aria-current={n === i}>
              <img src={src} alt="" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

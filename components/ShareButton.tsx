"use client";

import { useState } from "react";

/** Native share sheet where the device has one, otherwise copies the link. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* cancelled or blocked: nothing to do */ }
  }
  return (
    <button type="button" className="btn btn-ghost" onClick={share} aria-live="polite">
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

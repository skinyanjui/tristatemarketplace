"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { toast } from "./Toaster";

/** Native share sheet where the device has one, otherwise copies the link. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch { /* cancelled or blocked: nothing to do */ }
  }
  return (
    <button type="button" className="btn btn-ghost share" onClick={share} aria-live="polite" aria-label="Share this listing">
      {copied ? <><Icon name="check" size={16} />Link copied</> : <><Icon name="share" size={16} /><span className="share-label">Share</span></>}
    </button>
  );
}

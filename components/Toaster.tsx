"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type T = { text: string; href?: string; cta?: string };

/** Fire from anywhere: toast("Saved", { href: "/saved", cta: "View" }). */
export function toast(text: string, action?: { href: string; cta: string }) {
  window.dispatchEvent(new CustomEvent("tm-toast", { detail: { text, ...action } }));
}

export function Toaster() {
  const [t, setT] = useState<T | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setT((e as CustomEvent<T>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 3200);
    };
    window.addEventListener("tm-toast", on);
    return () => { window.removeEventListener("tm-toast", on); clearTimeout(timer); };
  }, []);
  if (!t) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{t.text}</span>
      {t.href && <Link href={t.href}>{t.cta}</Link>}
    </div>
  );
}

"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

const PREFIX = "tm-tip-";
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function dismissed(id: string): boolean {
  try { return localStorage.getItem(PREFIX + id) === "1"; } catch { return false; }
}
export function dismissTip(id: string) {
  try { localStorage.setItem(PREFIX + id, "1"); } catch { /* ignore */ }
  emit();
}
export function resetTips() {
  try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
  emit();
}

/** A single contextual tip shown next to the thing it explains. Stays gone once dismissed. */
export function Tip({ id, children, doneWhen }: { id: string; children: ReactNode; doneWhen?: boolean }) {
  const gone = useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => dismissed(id), () => true);
  if (gone) return null;
  return (
    <div className="tip" role="note">
      <span style={{ flex: 1 }}>{children}</span>
      <button type="button" className="tip-x" onClick={() => dismissTip(id)} aria-label="Dismiss tip">{doneWhen ? "Got it" : "Dismiss"}</button>
    </div>
  );
}

/** Saving a listing is the lesson for the browse tip, so the tip retires itself on first save. */
export function SaveTip() {
  const [seen] = useState(() => { try { return (JSON.parse(localStorage.getItem("tm-saved") ?? "[]") as string[]).length > 0; } catch { return false; } });
  if (seen) return null;
  return <Tip id="save"><strong>Try it:</strong> tap the heart on any card to save it. Saved listings are collected in Account.</Tip>;
}

export function ReplayTips() {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn" onClick={() => { resetTips(); try { localStorage.removeItem("tm-saved-tip"); } catch {} setDone(true); }}>
      {done ? "Tips will show again" : "Show tips again"}
    </button>
  );
}

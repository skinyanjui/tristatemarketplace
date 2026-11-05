"use client";

import { useSyncExternalStore } from "react";

const KEY = "tm-saved";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function SaveButton({ id, title }: { id: string; title: string }) {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const saved = (JSON.parse(raw) as string[]).includes(id);

  function toggle() {
    const ids = new Set(JSON.parse(read()) as string[]);
    if (ids.has(id)) ids.delete(id);
    else ids.add(id);
    try {
      localStorage.setItem(KEY, JSON.stringify([...ids]));
    } catch {
      /* private mode: ignore */
    }
    listeners.forEach((l) => l());
  }

  return (
    <button type="button" className="save" onClick={toggle} aria-pressed={saved} aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}>
      <span>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill={saved ? "#e5484d" : "none"} stroke={saved ? "#e5484d" : "var(--label)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </span>
    </button>
  );
}

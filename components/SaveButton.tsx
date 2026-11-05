"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./Icon";

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
        <Icon name="heart" size={16} color={saved ? "#e5484d" : "var(--label)"} fill={saved ? "#e5484d" : "none"} />
      </span>
    </button>
  );
}

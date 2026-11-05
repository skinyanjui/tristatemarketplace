"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SortOption = { value: string; label: string; hint?: string };

/** Button + radio menu. Arrow keys move, Enter/Space picks, Escape and outside click close. */
export function SortMenu({ options, value, onChange, label = "Sort" }: {
  options: SortOption[]; value: string; onChange: (v: string) => void; label?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    root.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  function key(e: React.KeyboardEvent) {
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") { setOpen(false); root.current?.querySelector<HTMLElement>("button")?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
  }

  return (
    <div className="sortmenu" ref={root} onKeyDown={key}>
      <button type="button" className="chip" aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {label}:
        <span className="sortmenu-val">
          {/* Every label is stacked invisibly so the button keeps one width whatever is picked. */}
          {options.map((o) => <strong key={o.value} aria-hidden={o.value !== current.value} className={o.value === current.value ? "" : "ghost"}>{o.label}</strong>)}
        </span>
        <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div id={id} role="menu" aria-label={label} className="sortmenu-pop">
          {options.map((o) => (
            <button key={o.value} type="button" role="menuitemradio" aria-checked={o.value === value} className="sortmenu-item"
              onClick={() => { onChange(o.value); setOpen(false); }}>
              <span>{o.label}{o.hint && <small>{o.hint}</small>}</span>
              {o.value === value && <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

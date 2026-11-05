"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useAnchoredPop } from "./useAnchoredPop";

export type SortOption = { value: string; label: string; hint?: string };

/** Button + radio menu. Arrow keys move, Enter/Space picks, Escape and outside click close. */
export function SortMenu({ options, value, onChange, label = "Sort", primary }: {
  options: SortOption[]; value: string; onChange: (v: string) => void; label?: string;
  /** Values shown up front; the rest sit under "More ways to sort". Omit to show everything. */
  primary?: string[];
}) {
  const [open, setOpen] = useState(false);
  const pos = useAnchoredPop(open, () => setOpen(false));
  const main = primary ? options.filter((o) => primary.includes(o.value)) : options;
  const more = primary ? options.filter((o) => !primary.includes(o.value)) : [];
  const [moreOpen, setMoreOpen] = useState(false);
  const moreId = useId();
  const showMore = moreOpen || more.some((o) => o.value === value);
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
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"],[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") { setOpen(false); root.current?.querySelector<HTMLElement>("button")?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
  }

  const item = (o: SortOption) => (
    <button key={o.value} type="button" role="menuitemradio" aria-checked={o.value === value} className="sortmenu-item"
      onClick={() => { onChange(o.value); setOpen(false); }}>
      <span>{o.label}{o.hint && <small>{o.hint}</small>}</span>
      {o.value === value && <Icon name="check" size={16} />}
    </button>
  );

  return (
    <div className="sortmenu" ref={root} onKeyDown={key}>
      <button type="button" className="chip" aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={(e) => { pos.place(e.currentTarget); setMoreOpen(false); setOpen((o) => !o); }}>
        <span className="sortmenu-label">{label}:</span>
        <span className="sortmenu-val">
          {/* Every label is stacked invisibly so the button keeps one width whatever is picked. */}
          {options.map((o) => <strong key={o.value} aria-hidden={o.value !== current.value} className={o.value === current.value ? "" : "ghost"}>{o.label}</strong>)}
        </span>
        <Icon name="chev" size={14} />
      </button>
      {open && (
        <div id={id} role="menu" aria-label={label} className="sortmenu-pop" style={pos.style}>
          {main.map(item)}
          {more.length > 0 && (
            <>
              <button type="button" role="menuitem" className="sortmenu-more" aria-expanded={showMore} aria-controls={moreId}
                onClick={() => setMoreOpen(!showMore)}>
                <span>More ways to sort</span>
                <Icon name="chev" size={16} />
              </button>
              {showMore && <div id={moreId} role="group" aria-label="More ways to sort" className="sortmenu-extra">{more.map(item)}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

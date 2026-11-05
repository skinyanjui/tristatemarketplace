import type { ReactNode } from "react";

export function Prose({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <main className="form prose">
      <h1>{title}</h1>
      {updated && <p className="muted">Last updated {updated}</p>}
      {children}
    </main>
  );
}

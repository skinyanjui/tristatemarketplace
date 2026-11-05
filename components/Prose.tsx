import Link from "next/link";
import type { ReactNode } from "react";

export function Prose({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <main className="form prose">
      <h1>{title}</h1>
      {updated && <p className="muted">Last updated {updated}</p>}
      {children}
      <p><Link href="/">Back to listings</Link> · <Link href="/safety">Safety tips</Link> · <Link href="/post">Post a listing</Link></p>
    </main>
  );
}

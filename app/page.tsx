import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Filters } from "@/components/Filters";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { TOWN_BY_ID } from "@/lib/places";
import { getListings, type Sort } from "@/lib/listings";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const cat = typeof sp.cat === "string" ? sp.cat : "all";
  const num = (k: string) => { const v = sp[k]; const n = typeof v === "string" && v !== "" ? Number(v) : NaN; return Number.isFinite(n) && n >= 0 ? n : undefined; };
  const sort: Sort = (["best", "old", "soon", "low", "high", "az", "za"] as const).find((x) => x === sp.sort) ?? (q ? "best" : cat === "event" || cat === "sale" ? "soon" : "new");
  const near = typeof sp.near === "string" && TOWN_BY_ID[sp.near] ? sp.near : undefined;
  const within = num("within");
  const pageNum = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;
  const { items: listings, total, page, pages } = await getListings({ q, cat, min: num("min"), max: num("max"), sort, page: pageNum, near, within });
  const hrefFor = (n: number) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "page") u.set(k, v); if (n > 1) u.set("page", String(n)); const qs = u.toString(); return qs ? `/?${qs}` : "/"; };
  if (page > 1 && listings.length === 0) redirect(hrefFor(Math.max(1, pages)));
  const catLabel = cat !== "all" ? CATEGORY_BY_ID[cat]?.label : null;

  return (
    <main className="wrap">
      <h1 className="sr-only">Tristate Market listings</h1>
      <div className="toolbar">
        <div className="count" aria-live="polite">
          {total} {total === 1 ? "listing" : "listings"}
          {catLabel ? ` in ${catLabel}` : ""}
          {near && within ? ` within ${within} miles of ${TOWN_BY_ID[near].name.split(",")[0]}` : ""}
          {q ? ` matching "${q}"` : ""}
        </div>
        <Suspense fallback={<div style={{ height: 36 }} />}>
          <Filters />
        </Suspense>
      </div>
      {listings.length > 0 ? (
        <div className="grid">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <strong>{q ? `No matches for “${q}”` : "Nothing here yet"}</strong>
          <span>{q ? "Check the spelling, try a simpler word, or clear a filter. New things get posted every day!" : "Try a different category or price range. New things get posted every day!"}</span>
          <div className="next-row">
            <Link href="/" className="btn">Clear search and filters</Link>
            <Link href="/post" className="btn btn-ghost">Post a listing</Link>
          </div>
        </div>
      )}
      {pages > 1 && (
        <nav className="pager" aria-label="Pages">
          {page > 1 ? <Link href={hrefFor(page - 1)} className="btn btn-ghost" rel="prev">Previous</Link> : <span />}
          <span className="count">Page {page} of {pages}</span>
          {page < pages ? <Link href={hrefFor(page + 1)} className="btn btn-ghost" rel="next">Next</Link> : <span />}
        </nav>
      )}
    </main>
  );
}

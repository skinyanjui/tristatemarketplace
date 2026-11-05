import { Suspense } from "react";
import { Filters } from "@/components/Filters";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { getListings, type Sort } from "@/lib/listings";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const cat = typeof sp.cat === "string" ? sp.cat : "all";
  const num = (k: string) => { const v = sp[k]; const n = typeof v === "string" && v !== "" ? Number(v) : NaN; return Number.isFinite(n) && n >= 0 ? n : undefined; };
  const sort: Sort = sp.sort === "low" || sp.sort === "high" ? sp.sort : "new";
  const listings = await getListings({ q, cat, min: num("min"), max: num("max"), sort });
  const catLabel = cat !== "all" ? CATEGORY_BY_ID[cat]?.label : null;

  return (
    <main className="wrap">
      <div className="count" aria-live="polite">
        {listings.length} {listings.length === 1 ? "listing" : "listings"}
        {catLabel ? ` in ${catLabel}` : ""}
        {q ? ` matching "${q}"` : ""}
      </div>
      <Suspense fallback={<div style={{ height: 44 }} />}>
        <Filters />
      </Suspense>
      {listings.length > 0 ? (
        <div className="grid">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <strong>No listings match</strong>
          <span>Try a different word or category.</span>
        </div>
      )}
    </main>
  );
}

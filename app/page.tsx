import { ListingCard } from "@/components/ListingCard";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { getListings } from "@/lib/listings";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const cat = typeof sp.cat === "string" ? sp.cat : "all";
  const listings = await getListings({ q, cat });
  const catLabel = cat !== "all" ? CATEGORY_BY_ID[cat]?.label : null;

  return (
    <main className="wrap">
      <div className="count" aria-live="polite">
        {listings.length} {listings.length === 1 ? "listing" : "listings"}
        {catLabel ? ` in ${catLabel}` : ""}
        {q ? ` matching "${q}"` : ""}
      </div>
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

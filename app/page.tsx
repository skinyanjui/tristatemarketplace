import { Fragment } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Filters } from "@/components/Filters";
import { ListingCard } from "@/components/ListingCard";
import { AdCard, type Ad } from "@/components/AdCard";

// Shown only when no paid ad is running, so the slot always promotes something honest.
const HOUSE_AD: Ad = { id: "house-ad", advertiser: "Tristate Market", headline: "Put your business in front of local buyers", detail: "Reach shoppers in your town", cta: "Learn more", href: "/advertise", image: "/ads/advertise.svg" };
import { CATEGORY_BY_ID } from "@/lib/categories";
import { DEFAULT_TOWN, TOWN_BY_ID, nearestTown } from "@/lib/places";
import { getListings, getTownCounts, type Sort } from "@/lib/listings";
import { getLiveAds, pickAd } from "@/lib/ads";
import { resolveNear } from "@/lib/zips";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  // A 5-digit ZIP code in the search box means "listings near that ZIP": send them to the same URL as the Distance filter.
  if (/^\d{5}$/.test(q.trim()) && resolveNear(q.trim()) && !sp.near) {
    const u = new URLSearchParams(); for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "q" && k !== "page") u.set(k, v);
    u.set("near", q.trim()); if (!u.has("within")) u.set("within", "25");
    redirect(`/?${u.toString()}`);
  }
  const cat = typeof sp.cat === "string" ? sp.cat : "all";
  const num = (k: string) => { const v = sp[k]; const n = typeof v === "string" && v !== "" ? Number(v) : NaN; return Number.isFinite(n) && n >= 0 ? n : undefined; };
  const chosen = typeof sp.near === "string" && resolveNear(sp.near) ? sp.near : undefined;
  const within = num("within");
  // Where "closest" is measured from: the town they picked, else the town nearest to where they are
  // (from the request's location headers), else Evansville. Anyone more than 150 miles away gets Evansville.
  let origin = chosen ?? DEFAULT_TOWN;
  if (!chosen) {
    const h = await headers();
    const lat = Number(h.get("x-vercel-ip-latitude")), lng = Number(h.get("x-vercel-ip-longitude"));
    if (h.get("x-vercel-ip-latitude") && Number.isFinite(lat) && Number.isFinite(lng)) {
      const n = nearestTown(lat, lng);
      if (n.miles <= 150) origin = n.town.id;
    }
  }
  const originFull = resolveNear(origin)?.name ?? TOWN_BY_ID[DEFAULT_TOWN].name;
  const originName = originFull.split(",")[0];
  const defaultSort: Sort = cat === "event" || cat === "sale" ? "soon" : "near";
  const sort: Sort = (["new", "best", "near", "old", "soon", "verified", "low", "high", "az", "za"] as const).find((x) => x === sp.sort) ?? defaultSort;
  const near = origin;
  const pageNum = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;
  const wanted = sp.wanted === "1";
  const verified = sp.verified === "1";
  const town = typeof sp.town === "string" ? sp.town.slice(0, 80) : "";
  const [{ items: listings, total, page, pages }, townData, liveAds] = await Promise.all([
    getListings({ q, cat, min: num("min"), max: num("max"), sort, page: pageNum, near, within, wanted, verified, town: town || undefined }),
    getTownCounts({ cat, wanted }),
    getLiveAds(),
  ]);
  const ad = pickAd(liveAds) ?? HOUSE_AD;
  const towns = townData.towns;
  const townHref = (t: string) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "page" && k !== "town") u.set(k, v); if (t) u.set("town", t); const qs = u.toString(); return qs ? `/?${qs}` : "/"; };
  const hrefFor = (n: number) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "page") u.set(k, v); if (n > 1) u.set("page", String(n)); const qs = u.toString(); return qs ? `/?${qs}` : "/"; };
  if (page > 1 && listings.length === 0) redirect(hrefFor(Math.max(1, pages)));
  const catLabel = cat !== "all" ? CATEGORY_BY_ID[cat]?.label : null;

  return (
    <main className="wrap home">
      <h1 className="sr-only">Tristate Market listings</h1>
      <div className="toolbar">
        <div className="count" aria-live="polite">
          {total} {total === 1 ? "listing" : "listings"}
          {catLabel ? ` in ${catLabel}` : ""}
          {within ? ` within ${within} miles of ${originName}` : ""}
          {q ? ` matching "${q}"` : ""}
        </div>
        {(towns.length > 1 || town) && (
          <nav className="towns" aria-label="Browse by town">
            <Link href={townHref("")} className={`chip${town ? "" : " on"}`} aria-current={town ? undefined : "true"}>All towns<small>{town ? townData.all : total}</small></Link>
            {towns.map((t) => (
              <Link key={t.place} href={townHref(t.place)} className={`chip${town === t.place ? " on" : ""}`} aria-current={town === t.place ? "true" : undefined}>{t.place.split(",")[0]}<small>{t.count}</small></Link>
            ))}
          </nav>
        )}
        <Suspense fallback={<div style={{ height: 36 }} />}>
          <Filters origin={origin} originLabel={originFull} defaultSort={defaultSort} />
        </Suspense>
      </div>
      {listings.length > 0 ? (
        <div className="grid">
          {listings.map((l, i) => (
            <Fragment key={l.id}>
              <ListingCard listing={l} />
              {page === 1 && i === 5 && <AdCard ad={ad} />}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="empty">
          <strong>{q ? `No matches for “${q}”` : "Nothing here yet"}</strong>
          <span>{within ? `Nothing within ${within} miles of ${originName}. Try a bigger distance or choose Any distance.` : q ? "Check the spelling, try a simpler word, or clear a filter. New things get posted every day!" : "Try a different category or price range. New things get posted every day!"}</span>
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

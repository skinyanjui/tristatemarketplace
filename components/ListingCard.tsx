import Link from "next/link";
import { categoryOf, mapsUrl, WANTED_ACTION } from "@/lib/categories";
import type { Listing } from "@/lib/types";
import { Icon } from "./Icon";
import { ListingImage } from "./ListingArt";
import { keyFact, milesLabel } from "@/lib/keyfact";
import { SaveButton } from "./SaveButton";

/** "Sat, Nov 7" from a YYYY-MM-DD date, ignoring the viewer's time zone. */
export function niceDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export function ListingCard({ listing }: { listing: Listing }) {
  const cat = categoryOf(listing.kind);
  const href = `/listing/${listing.id}`;
  // One status pill on the photo, by usefulness to the buyer: Sold, then the date of an event or sale, then Featured.
  // "Sponsored" is a disclosure, not a status, so it never takes that slot; it sits in the footer row instead.
  const top = listing.sold ? "sold" : listing.eventDate ? "date" : listing.wanted ? "wanted" : listing.featured ? "featured" : null;
  const action = listing.wanted ? WANTED_ACTION : cat.action;
  const dateInRow = !!listing.eventDate && top !== "date";
  return (
    <article className={`card${listing.sold ? " sold" : ""}${listing.featured ? " featured" : ""}${listing.sponsored ? " sponsored" : ""}`}>
      <div className="card-photo">
        <ListingImage listing={listing} />
        <Link href={href} className="card-link" aria-label={listing.title} />
        {top === "sold" && <span className="pill pill-top pill-sold">Sold</span>}
        {top === "wanted" && <span className="pill pill-top pill-wanted">Wanted</span>}
        {top === "featured" && <span className="pill pill-top pill-featured">Featured</span>}
        {top === "date" && listing.eventDate && <span className="pill pill-top pill-date">{niceDate(listing.eventDate)}</span>}
        <SaveButton id={listing.id} title={listing.title} />
        <span className="pill pill-kind" style={{ background: cat.color }}>{cat.label}</span>
        {listing.verified && <span className="pill pill-verified" aria-label="Verified seller" title="Verified seller"><Icon name="check" size={12} color="#fff" /></span>}
        {listing.photoCount > 1 && <span className={`pill pill-count${listing.verified ? " up" : ""}`} aria-label={`${listing.photoCount} photos`}><Icon name="photo" size={11} />{listing.photoCount}</span>}
      </div>
      <div className="card-body">
        <Link href={href} className="card-link" aria-hidden="true" tabIndex={-1} />
        <h2 className="ctitle">{listing.title}</h2>
        <p className="cfact">
          {dateInRow && listing.eventDate && <b>{niceDate(listing.eventDate)} · </b>}
          {[keyFact(listing), listing.place ? listing.place.split(",")[0] : "Location not set"].filter(Boolean).join(" · ")}
          {milesLabel(listing.miles) && ` · ${milesLabel(listing.miles)}`}
        </p>
        <div className="card-row">
          <span className="price">{listing.price.replace(/\s*–\s*/g, "–").replace(/\s*\/\s*/g, "/")}</span>
          {listing.sold ? (
            <Link href={`/?cat=${cat.id}`} className="act act-quiet" aria-label={`See more ${cat.label}`}><span>See similar</span></Link>
          ) : action.map && listing.place ? (
            <a href={mapsUrl(listing.place)} target="_blank" rel="noopener noreferrer" className="act" aria-label={`${action.label}: ${listing.title} (opens Maps)`}>
              <span><Icon name={action.icon} size={16} color="#fff" /><i className="lg">{action.short}</i><i className="sm">{action.tiny ?? action.short}</i></span>
            </a>
          ) : (
            <Link href={`${href}#contact`} className="act" aria-label={`${action.label}: ${listing.title}`}>
              <span><Icon name={action.icon} size={16} color="#fff" /><i className="lg">{action.short}</i><i className="sm">{action.tiny ?? action.short}</i></span>
            </Link>
          )}
        </div>
        {listing.sponsored && <div className="tagrow"><span className="tag-sponsored">Sponsored</span></div>}
      </div>
    </article>
  );
}

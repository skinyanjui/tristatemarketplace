import Link from "next/link";
import { categoryOf, mapsUrl } from "@/lib/categories";
import type { Listing } from "@/lib/types";
import { Icon } from "./Icon";
import { ListingImage } from "./ListingArt";
import { SaveButton } from "./SaveButton";

/** "Sat, Nov 7" from a YYYY-MM-DD date, ignoring the viewer's time zone. */
export function niceDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export function ListingCard({ listing }: { listing: Listing }) {
  const cat = categoryOf(listing.kind);
  const href = `/listing/${listing.id}`;
  // One status pill on the photo, by importance: Sold, Featured, then the date of an event or sale.
  const top = listing.sold ? "sold" : listing.featured ? "featured" : listing.eventDate ? "date" : null;
  const dateInRow = !!listing.eventDate && top !== "date";
  return (
    <article className={`card${listing.sold ? " sold" : ""}${listing.featured ? " featured" : ""}`}>
      <div className="card-photo">
        <ListingImage listing={listing} />
        <Link href={href} className="card-link" aria-label={listing.title} />
        {top === "sold" && <span className="pill pill-top pill-sold">Sold</span>}
        {top === "featured" && <span className="pill pill-top pill-featured">Featured</span>}
        {top === "date" && listing.eventDate && <span className="pill pill-top pill-date">{niceDate(listing.eventDate)}</span>}
        <SaveButton id={listing.id} title={listing.title} />
        <span className="pill pill-kind" style={{ background: cat.color }}>{cat.label}</span>
        {listing.photoCount > 1 && <span className="pill pill-count" aria-label={`${listing.photoCount} photos`}><Icon name="photo" size={11} />{listing.photoCount}</span>}
      </div>
      <div className="card-body">
        <Link href={href} className="card-link" aria-hidden="true" tabIndex={-1} />
        <h2 className="ctitle">{listing.title}</h2>
        <div className="card-row">
          <span className="price">{listing.price.replace(/\s*–\s*/g, "–").replace(/\s*\/\s*/g, "/")}</span>
          {listing.sold ? (
            <Link href={`/?cat=${cat.id}`} className="act act-quiet" aria-label={`See more ${cat.label}`}><span>See similar</span></Link>
          ) : cat.action.map && listing.place ? (
            <a href={mapsUrl(listing.place)} target="_blank" rel="noopener noreferrer" className="act" aria-label={`${cat.action.label}: ${listing.title} (opens Maps)`}>
              <span><Icon name={cat.action.icon} size={16} color="#fff" /><i className="lg">{cat.action.short}</i><i className="sm">{cat.action.tiny ?? cat.action.short}</i></span>
            </a>
          ) : (
            <Link href={`${href}#contact`} className="act" aria-label={`${cat.action.label}: ${listing.title}`}>
              <span><Icon name={cat.action.icon} size={16} color="#fff" /><i className="lg">{cat.action.short}</i><i className="sm">{cat.action.tiny ?? cat.action.short}</i></span>
            </Link>
          )}
        </div>
        <div className="place">
          <Icon name="pin" size={13} />
          <span>{dateInRow && listing.eventDate && <b>{niceDate(listing.eventDate)}</b>}{dateInRow && " · "}{listing.place || "Location not set"}</span>
        </div>
      </div>
    </article>
  );
}

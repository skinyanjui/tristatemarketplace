import Link from "next/link";
import { categoryOf } from "@/lib/categories";
import type { Listing } from "@/lib/types";
import { Icon } from "./Icon";
import { ListingImage } from "./ListingArt";
import { SaveButton } from "./SaveButton";

export function ListingCard({ listing }: { listing: Listing }) {
  const cat = categoryOf(listing.kind);
  const href = `/listing/${listing.id}`;
  return (
    <article className={`card${listing.sold ? " sold" : ""}`}>
      <div className="card-photo">
        <ListingImage listing={listing} />
        <Link href={href} className="card-link" aria-label={listing.title} />
        {listing.sold ? <span className="pill pill-sold">Sold</span> : listing.condition && <span className="pill pill-condition">{listing.condition.replace(/^Used - /, "")}</span>}
        <SaveButton id={listing.id} title={listing.title} />
        <span className="pill pill-kind" style={{ background: cat.color }}>{cat.label}</span>
      </div>
      <div className="card-body">
        <Link href={href} className="card-link" aria-hidden="true" tabIndex={-1} />
        <h2 className="ctitle">{listing.title}</h2>
        <div className="card-row">
          <span className="price">{listing.price.replace(/\s*–\s*/g, "–").replace(/\s*\/\s*/g, "/")}</span>
          <Link href={`${href}#contact`} className="act" aria-label={`${cat.action.label}: ${listing.title}`}>
            <span><Icon name={cat.action.icon} size={18} color="#fff" /></span>
          </Link>
        </div>
        <div className="place">
          <Icon name="pin" size={13} />
          <span>{listing.place || "Location not set"}</span>
        </div>
      </div>
    </article>
  );
}

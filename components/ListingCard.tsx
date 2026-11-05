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
    <article className="card">
      <div className="card-photo">
        <ListingImage listing={listing} />
        <Link href={href} className="card-link" aria-label={listing.title} />
        {listing.condition && <span className="pill pill-condition">{listing.condition}</span>}
        <SaveButton id={listing.id} title={listing.title} />
        <span className="pill pill-kind" style={{ background: cat.color }}>{cat.label}</span>
      </div>
      <div className="card-body">
        <div className="card-row">
          <Link href={href} className="price">{listing.price}</Link>
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

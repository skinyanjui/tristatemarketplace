import { art, mix } from "@/lib/art";
import { categoryOf } from "@/lib/categories";
import type { Listing } from "@/lib/types";
/* eslint-disable @next/next/no-img-element */

export function artFor(l: Listing): string {
  const c = categoryOf(l.kind);
  const variant = /f-150|truck|pickup/i.test(l.title) ? "truck" : /goat/i.test(l.title) ? "goat" : "";
  return art(l.kind, mix(c.color, 0.82), c.color, variant);
}

/** Uploaded photo when there is one, otherwise the category illustration. */
export function ListingImage({ listing }: { listing: Listing }) {
  const src = listing.photos?.[0] ?? artFor(listing);
  return <img src={src} alt="" draggable={false} />;
}

import type { MetadataRoute } from "next";
import { getAllListings } from "@/lib/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://tristatemarketplace.vercel.app";
  const listings = await getAllListings();
  return [{ url: base }, ...listings.map((l) => ({ url: `${base}/listing/${l.id}` }))];
}

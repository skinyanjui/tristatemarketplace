import type { MetadataRoute } from "next";
import { getListings } from "@/lib/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://tristatemarketplace.vercel.app";
  const listings = await getListings();
  return [{ url: base }, ...listings.map((l) => ({ url: `${base}/listing/${l.id}` }))];
}

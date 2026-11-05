import type { Ad } from "@/components/AdCard";
import { supabaseServer } from "./supabase/client";

export const AD_SLOTS = 3;
export type AdProduct = { id: "featured" | "sponsored" | "ad"; name: string; blurb: string; price_cents: number; needs_listing: boolean };

/** What each length costs: 30 days is billed as 4 weeks. */
export const DAY_OPTIONS = [{ days: 7, weeks: 1, label: "7 days" }, { days: 14, weeks: 2, label: "14 days" }, { days: 30, weeks: 4, label: "30 days (4 weeks)" }] as const;
export const money = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;
export const CTA_OPTIONS = ["Learn more", "Call now", "Get a quote", "Shop now", "Book now", "Visit us"] as const;

export async function getAdProducts(): Promise<AdProduct[]> {
  const { data } = await supabaseServer().from("tm_ad_products").select("id,name,blurb,price_cents,needs_listing").eq("active", true).order("sort");
  return (data ?? []) as AdProduct[];
}

type AdRow = { id: string; business_name: string; headline: string; detail: string; cta: string; url: string; image_url: string | null; ends_at: string };
/** Ads running right now (the database only returns live ones). */
export async function getLiveAds(): Promise<(Ad & { endsAt: string })[]> {
  const { data } = await supabaseServer().from("tm_ads").select("id,business_name,headline,detail,cta,url,image_url,ends_at").order("starts_at");
  return ((data ?? []) as AdRow[]).map((a) => ({ id: a.id, advertiser: a.business_name, headline: a.headline, detail: a.detail, cta: a.cta, href: a.url, image: a.image_url ?? undefined, endsAt: a.ends_at }));
}

export async function billingOn(): Promise<boolean> {
  const { data } = await supabaseServer().from("tm_settings").select("value").eq("key", "ads_billing").maybeSingle();
  return data?.value === "on";
}

/** One live ad per page view; with several running they take turns by the hour. */
export function pickAd<T>(ads: T[], now = Date.now()): T | undefined {
  return ads.length ? ads[Math.floor(now / 3_600_000) % ads.length] : undefined;
}

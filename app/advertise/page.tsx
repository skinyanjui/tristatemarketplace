import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdCard, type Ad } from "@/components/AdCard";
import { AdvertiseForm } from "@/components/AdvertiseForm";
import { Icon } from "@/components/Icon";
import { ListingCard } from "@/components/ListingCard";
import { MyAdRequests } from "@/components/MyAdRequests";
import { AD_SLOTS, billingOn, getAdProducts, getLiveAds, money } from "@/lib/ads";
import { getListings } from "@/lib/listings";
import type { Listing } from "@/lib/types";

const HOUSE_AD: Ad = { id: "demo", advertiser: "Your business", headline: "Your headline goes here", detail: "", cta: "Learn more", href: "#", image: "/ads/advertise.svg" };

export const metadata: Metadata = {
  title: "Advertise on Tristate Market",
  description: "Feature a listing, sponsor it, or run an ad card in front of Evansville tristate shoppers. Simple weekly pricing, reviewed within one business day.",
};

const SHORT: Record<string, { line: string; where: string }> = {
  featured: { line: "Pinned to the top.", where: "Top of page 1" },
  sponsored: { line: "Stands out in the feed.", where: "Slots 3 and 8 of page 1" },
  ad: { line: "A full card for your business.", where: "After the 6th listing, page 1" },
};
const STEPS = [
  { t: "Request", d: "2 minutes" },
  { t: "Review", d: "Within 1 business day" },
  { t: "Live", d: "Starts when approved" },
  { t: "Ends itself", d: "7, 14 or 30 days" },
];
const OK = ["Local businesses", "Services and events", "Real offers and prices", "Your own photos"];
const NOT = ["Illegal or adult", "Weapons, tobacco, gambling", "Guarantees and before/after claims", "Pages asking for bank or ID details"];

export default async function Advertise() {
  await connection();
  const [products, live, billing, feed] = await Promise.all([getAdProducts(), getLiveAds(), billingOn(), getListings({ sort: "new" })]);
  // Real listings with photos, shown the way each placement would look. Previews are not clickable.
  const withPhotos = feed.items.filter((l) => !l.sold && !l.eventDate && !l.wanted && (l.photos?.length ?? 0) > 0);
  const samples: Record<string, Listing> = {};
  if (withPhotos[0]) samples.featured = { ...withPhotos[0], id: "demo-featured", featured: true, sponsored: false };
  if (withPhotos[1]) samples.sponsored = { ...withPhotos[1], id: "demo-sponsored", sponsored: true, featured: false };
  const open = Math.max(0, AD_SLOTS - live.length);
  const nextFree = live.length >= AD_SLOTS ? live.map((a) => a.endsAt).sort()[0] : null;

  return (
    <main className="form adv">
      <header className="adv-hero">
        <h1>Advertise on Tristate Market</h1>
        <p className="lead">Reach shoppers across the Evansville tristate.</p>
        <a href="#request" className="btn btn-lg">Request an ad</a>
      </header>

      <section aria-labelledby="products-h">
        <h2 id="products-h">Pick a placement</h2>
        <div className="adv-products">
          {products.map((p) => {
            const demo = samples[p.id];
            return (
              <article key={p.id} className="adv-card">
                <div className="adv-demo" aria-hidden="true">
                  {p.id === "ad" ? <AdCard ad={HOUSE_AD} /> : demo ? <ListingCard listing={demo} /> : null}
                </div>
                <h3>{p.name}</h3>
                <div className="adv-price"><strong>{money(p.price_cents)}</strong><span className="muted"> / week</span></div>
                <p>{SHORT[p.id]?.line}</p>
                <p className="adv-where"><Icon name="pin" size={13} />{SHORT[p.id]?.where}</p>
                {p.id === "ad" && <p className="adv-cap">{open > 0 ? `${open} of ${AD_SLOTS} slots open` : `Full${nextFree ? ` until ${new Date(nextFree).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}`}</p>}
              </article>
            );
          })}
        </div>
        <p className="muted">{billing ? "Pay after approval." : "Free while we launch. Prices apply once billing starts, and we will tell you first."} Lengths: 7, 14 or 30 days (30 billed as 4 weeks).</p>
      </section>

      <section aria-labelledby="how-h">
        <h2 id="how-h">How it works</h2>
        <ol className="adv-flow">
          {STEPS.map((s) => <li key={s.t}><strong>{s.t}</strong><span>{s.d}</span></li>)}
        </ol>
      </section>

      <section aria-labelledby="rules-h">
        <h2 id="rules-h">Always labeled</h2>
        <ul className="adv-legend">
          <li><span className="pill pill-featured" style={{ position: "static" }}>Featured</span>Top of the page</li>
          <li><span className="pill pill-tiny" style={{ position: "static" }}>Sponsored</span>Blue border, in the feed</li>
          <li><span className="pill pill-tiny pill-ad-label" style={{ position: "static" }}>Ad</span>Your picture and link</li>
        </ul>
        <p className="muted">Never more than 2 sponsored listings and 1 ad on a page, and {AD_SLOTS} ads running at once. Event dates always stay visible.</p>
      </section>

      <section id="standards" aria-labelledby="std-h">
        <h2 id="std-h">Ad standards</h2>
        <div className="adv-std">
          <div><h3 className="std-ok"><Icon name="ok" size={16} />Welcome</h3><ul>{OK.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3 className="std-no"><Icon name="x" size={16} />Not allowed</h3><ul>{NOT.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <p className="muted">Declined? We say why, and you can fix it and resend. Promoted listings follow the <Link href="/terms">Terms</Link>.</p>
      </section>

      <section aria-labelledby="terms-h">
        <h2 id="terms-h">The fine print, short</h2>
        <ul className="adv-facts">
          <li><Icon name="ok" size={16} />Cancel free before it goes live</li>
          <li><Icon name="ok" size={16} />Removed for breaking the rules? No charge for unused days</li>
          <li><Icon name="ok" size={16} />No tracking. Ads link only where you choose</li>
        </ul>
      </section>

      <section id="request" aria-labelledby="req-h">
        <h2 id="req-h">Request an ad</h2>
        <Suspense fallback={<div className="notice" aria-busy="true">Loading…</div>}>
          <AdvertiseForm products={products} billing={billing} />
          <MyAdRequests />
        </Suspense>
      </section>

      <p><Link href="/">Back to listings</Link> · <Link href="/safety">Safety tips</Link> · <Link href="/post">Post a listing</Link></p>
    </main>
  );
}

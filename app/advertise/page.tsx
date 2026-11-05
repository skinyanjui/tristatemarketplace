import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdvertiseForm } from "@/components/AdvertiseForm";
import { MyAdRequests } from "@/components/MyAdRequests";
import { AD_SLOTS, billingOn, getAdProducts, getLiveAds, money } from "@/lib/ads";

export const metadata: Metadata = {
  title: "Advertise on Tristate Market",
  description: "Feature a listing, sponsor it, or run an ad card in front of Evansville tristate shoppers. Simple weekly pricing, reviewed within one business day.",
};

const WHERE: Record<string, { who: string; where: string; provide: string }> = {
  featured: { who: "Anyone with an active listing", where: "Top of the first page, with a Featured tag", provide: "One of your active listings" },
  sponsored: { who: "Anyone with an active listing", where: "Mixed into the feed (positions 3 and 8 of the first page) with a blue border and a Sponsored tag", provide: "One of your active listings" },
  ad: { who: "Local businesses and organizations", where: "A full-card ad after the 6th listing on the first page, labeled Ad", provide: "Headline, button, link and an optional picture" },
};

const STEPS = [
  { t: "Send a request", d: "Pick what to run and for how long, then add your listing or ad. It takes about two minutes." },
  { t: "We review it", d: "Every request is checked against the ad standards within 1 business day. You get an email either way." },
  { t: "Approve and pay", d: "Once approved you pay the weekly price. While launch billing is off, approved ads simply go live." },
  { t: "It goes live", d: "Your placement starts the moment it is live and is always labeled, so buyers know what is paid." },
  { t: "It ends on its own", d: "No renewals you forgot about. When the days are up it stops, and you can send a new request to run again." },
];

export default async function Advertise() {
  await connection();
  const [products, live, billing] = await Promise.all([getAdProducts(), getLiveAds(), billingOn()]);
  const open = Math.max(0, AD_SLOTS - live.length);
  const nextFree = live.length >= AD_SLOTS ? live.map((a) => a.endsAt).sort()[0] : null;

  return (
    <main className="form adv">
      <header className="adv-hero">
        <h1>Advertise on Tristate Market</h1>
        <p className="lead">Put your listing or your business in front of people already shopping in Evansville, Henderson, Owensboro, Newburgh and the towns around them.</p>
        <a href="#request" className="btn btn-lg">Request an ad</a>
      </header>

      <section aria-labelledby="products-h">
        <h2 id="products-h">Pick a placement</h2>
        <div className="adv-products">
          {products.map((p) => (
            <article key={p.id} className="adv-card">
              <h3>{p.name}</h3>
              <div className="adv-price"><strong>{money(p.price_cents)}</strong><span className="muted"> per week</span></div>
              <p>{p.blurb}</p>
              <dl>
                <div><dt>Who it is for</dt><dd>{WHERE[p.id]?.who}</dd></div>
                <div><dt>Where it shows</dt><dd>{WHERE[p.id]?.where}</dd></div>
                <div><dt>You provide</dt><dd>{WHERE[p.id]?.provide}</dd></div>
              </dl>
              {p.id === "ad" && <p className="adv-cap">{open > 0 ? `${open} of ${AD_SLOTS} ad slots open now.` : `All ${AD_SLOTS} ad slots are taken${nextFree ? `. The next one opens ${new Date(nextFree).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.` : "."}`}</p>}
            </article>
          ))}
        </div>
        <p className="muted">Lengths: 7 days, 14 days (2 weeks) or 30 days (billed as 4 weeks). {billing ? "You pay after we approve your request." : "Launch period: approved ads run free while we test. Prices apply once billing starts, and we will tell you before that happens."}</p>
      </section>

      <section aria-labelledby="how-h">
        <h2 id="how-h">How it works</h2>
        <ol className="adv-steps">
          {STEPS.map((s) => <li key={s.t}><strong>{s.t}</strong><span>{s.d}</span></li>)}
        </ol>
      </section>

      <section aria-labelledby="rules-h">
        <h2 id="rules-h">How placements are shown</h2>
        <ul className="adv-list">
          <li><strong>Always labeled.</strong> Featured listings carry a Featured tag, sponsored listings a Sponsored tag and a blue border, ads an Ad tag. Paid placements never pose as ordinary listings.</li>
          <li><strong>Sponsored and ads are different.</strong> A sponsored listing is a real listing you posted. An ad card is a picture and link to your own site.</li>
          <li><strong>No crowding.</strong> At most 2 sponsored listings and 1 ad card appear on a page, and at most {AD_SLOTS} ads run at once. When several ads run they take turns by the hour.</li>
          <li><strong>Dates stay visible.</strong> An event or sale keeps its date on the photo, even when it is sponsored.</li>
          <li><strong>Fair to buyers.</strong> Search and sort stay honest. Sorting by closest or newest still puts real matches first.</li>
        </ul>
      </section>

      <section id="standards" aria-labelledby="std-h">
        <h2 id="std-h">Ad standards</h2>
        <p>We approve ads that are honest, local and safe for a neighborhood marketplace. We decline, or remove without notice, ads that:</p>
        <ul className="adv-list">
          <li>sell or promote anything illegal, adult, weapons, tobacco or vaping, or gambling;</li>
          <li>make health, income or “guaranteed results” claims, or use before and after pictures;</li>
          <li>send people to a page that is not about what the ad says, or that asks for bank or ID details;</li>
          <li>use someone else’s name, logo or photos without the right to;</li>
          <li>are not from a real person or business that serves the tristate.</li>
        </ul>
        <p>Listings you promote must also follow the <Link href="/terms">Terms</Link>. If we decline a request we say why, and you can fix it and send it again.</p>
      </section>

      <section aria-labelledby="terms-h">
        <h2 id="terms-h">Money and changes</h2>
        <ul className="adv-list">
          <li><strong>Cancel for free</strong> any time before your request goes live.</li>
          <li><strong>Once live</strong> an ad runs for the days you picked. If we have to remove it for breaking the standards, you are not charged for the days it did not run.</li>
          <li><strong>One request at a time</strong> per placement and listing, and up to 3 requests waiting for review per person.</li>
          <li><strong>We do not track you or sell your information.</strong> Ads link to the page you chose and nothing else.</li>
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

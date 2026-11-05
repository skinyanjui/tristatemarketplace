import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Advertise on Tristate Market" };

export default function Advertise() {
  return (
    <Prose title="Advertise on Tristate Market">
      <p>Reach shoppers in Evansville, Henderson, Owensboro, Newburgh and the rest of the tristate. Every ad is shown to people already looking in your town.</p>
      <h2>Ways to be seen</h2>
      <p><strong>Featured listing.</strong> Pin one of your listings to the top of the first page.</p>
      <p><strong>Sponsored listing.</strong> Your listing appears in the feed with a blue border and a “Sponsored” label, so buyers know it is paid.</p>
      <p><strong>Ad card.</strong> A card the same size as a listing, with your photo, headline and button, shown between listings.</p>
      <h2>How it works today</h2>
      <p>Paid placements are being switched on now. Post your listing first, then you can feature it from your Account page once payments open. Ads always carry an “Ad” or “Sponsored” label.</p>
      <p><Link href="/post" className="btn">Post a listing</Link></p>
    </Prose>
  );
}

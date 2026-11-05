import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Safety tips" };

export default function Safety() {
  return (
    <Prose title="Safety tips">
      <h2>Meeting up</h2>
      <p>Meet in a public place in daylight. Police stations and many sheriff offices in the tristate offer safe exchange spots. Bring a friend for large purchases and tell someone where you are going.</p>
      <h2>Paying</h2>
      <p>Pay in person, after you have seen the item. Never wire money, send gift cards or pay a deposit to someone you have not met. Be careful with checks and overpayment offers.</p>
      <h2>Vehicles, land and animals</h2>
      <p>Verify the title and VIN, deed and survey, or health papers before paying. Meet at the seller&apos;s verified address or a bank.</p>
      <h2>Spot a problem?</h2>
      <p>Use the Report button on the listing. Our messages go through the site, so keep conversations here until you trust the other person.</p>
    </Prose>
  );
}

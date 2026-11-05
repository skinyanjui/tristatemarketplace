import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Terms of use" };

export default function Terms() {
  return (
    <Prose title="Terms of use" updated="November 5, 2026">
      <p>By using Tristate Market you agree to these terms. They are a plain-language starting point, not a substitute for advice from a lawyer.</p>
      <h2>What we are</h2>
      <p>Tristate Market is a platform where members post classified listings. We do not own, inspect or sell the items, and we are not a party to any sale, hire or agreement between members.</p>
      <h2>Your account and posts</h2>
      <p>You are responsible for what you post. Post only things you have the right to sell, with honest descriptions and photos you own or may use. You grant us permission to display your listing on the site.</p>
      <h2>Not allowed</h2>
      <p>Illegal items, stolen goods, weapons sales that break the law, counterfeit goods, scams, adult content, anything misleading, and harassment. We may remove listings or accounts at our discretion.</p>
      <h2>Transactions</h2>
      <p>Deals are between buyer and seller. Inspect before you pay. To the extent the law allows, we are not liable for losses from transactions or for member content.</p>
      <h2>Changes and contact</h2>
      <p>We may update these terms and will change the date above when we do. Questions: use the Report button or contact the site owner.</p>
    </Prose>
  );
}

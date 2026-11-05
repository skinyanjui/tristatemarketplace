import type { Metadata } from "next";
import { SavedList } from "@/components/SavedList";
import { ReplayTips } from "@/components/Tip";
import { AccountPanel } from "@/components/AccountPanel";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Account" };

export default async function Account() {
  const all = await getListings();
  return (
    <main className="form" style={{ maxWidth: 1120 }}>
      <h1>Account</h1>
      <AccountPanel />
      <section id="saved" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 17 }}>Saved</h2>
        <SavedList all={all} />
      </section>
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 17 }}>Help</h2>
        <ReplayTips />
      </section>
    </main>
  );
}

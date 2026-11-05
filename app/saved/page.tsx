import type { Metadata } from "next";
import { SavedSearches } from "@/components/SavedSearches";
import { SavedList } from "@/components/SavedList";
import { getAllListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Saved" };

export default async function Saved() {
  const all = await getAllListings();
  return (
    <main className="form" style={{ maxWidth: 1120 }}>
      <h1>Saved</h1>
      <p className="muted" style={{ margin: 0 }}>Saved on this device. No account needed.</p>
      <SavedSearches />
      <h2 style={{ marginTop: 24 }}>Saved listings</h2>
      <SavedList all={all} />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ListingCard } from "@/components/ListingCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { fromRow } from "@/lib/listings";
import { supabaseServer } from "@/lib/supabase/client";

const COLUMNS = "id,seller_id,kind,title,place,price,condition,description,details,photos,seller_name,seller_meta,created_at,status,event_date,featured_until,sponsored_until";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(id: string) {
  if (!UUID.test(id)) return null;
  await connection(); // listings depend on today's date
  const sb = supabaseServer();
  const [{ data: profile }, { data: rows }] = await Promise.all([
    sb.from("tm_profiles").select("display_name,verified,created_at").eq("user_id", id).maybeSingle(),
    sb.from("tm_listings").select(COLUMNS).eq("seller_id", id).in("status", ["active", "sold"]).order("created_at", { ascending: false }).limit(60),
  ]);
  const listings = ((rows ?? []) as unknown as Parameters<typeof fromRow>[0][]).map(fromRow);
  if (!profile && listings.length === 0) return null;
  const name: string = profile?.display_name ?? listings[0]?.seller.name ?? "Neighbor";
  const since = profile?.created_at ?? (rows as { created_at: string }[] | null)?.at(-1)?.created_at;
  return { name, verified: !!profile?.verified, since, listings };
}

export async function generateMetadata({ params }: PageProps<"/seller/[id]">): Promise<Metadata> {
  const { id } = await params;
  const s = await load(id);
  return { title: s ? `${s.name}${s.verified ? " (Verified)" : ""}` : "Seller not found" };
}

export default async function SellerPage({ params }: PageProps<"/seller/[id]">) {
  const { id } = await params;
  const s = await load(id);
  if (!s) notFound();
  const initials = s.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const active = s.listings.filter((l) => !l.sold);
  const since = s.since ? new Date(s.since).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;
  return (
    <main className="wrap">
      <Link href="/" className="back">All listings</Link>
      <header className="profile">
        <span className="avatar avatar-lg" aria-hidden="true">{initials}</span>
        <div className="profile-text">
          <h1>{s.name}</h1>
          <div className="profile-meta">
            {s.verified && <VerifiedBadge />}
            {since && <span className="muted">Selling since {since}</span>}
            <span className="muted">{active.length} {active.length === 1 ? "listing" : "listings"} for sale</span>
            {s.listings.length - active.length > 0 && <span className="muted">{s.listings.length - active.length} sold</span>}
          </div>
          {s.verified && <p className="muted profile-note">Verified by Tristate Market.</p>}
        </div>
      </header>
      {s.listings.length > 0 ? (
        <div className="grid">{s.listings.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
      ) : (
        <div className="empty"><strong>Nothing for sale right now</strong><span>Check back soon.</span></div>
      )}
    </main>
  );
}

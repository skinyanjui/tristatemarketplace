import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactSeller } from "@/components/ContactSeller";
import { Icon } from "@/components/Icon";
import { CONDITION_LABEL } from "@/lib/condition-labels";
import { ShareButton } from "@/components/ShareButton";
import { ReportListing } from "@/components/ReportListing";
import { Gallery } from "@/components/Gallery";
import { artFor } from "@/components/ListingArt";
import { SaveButton } from "@/components/SaveButton";
import { categoryOf } from "@/lib/categories";
import { getListing } from "@/lib/listings";

export async function generateMetadata({ params }: PageProps<"/listing/[id]">): Promise<Metadata> {
  const { id } = await params;
  const l = await getListing(id);
  return l ? { title: l.title, description: `${l.price} · ${l.place}. ${l.description}` } : { title: "Listing not found" };
}

export default async function ListingPage({ params }: PageProps<"/listing/[id]">) {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) notFound();
  const cat = categoryOf(l.kind);
  const initials = l.seller.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <main className="dwrap">
      <Link href="/" className="back"><Icon name="back" size={18} />All listings</Link>
      <div className="dgrid">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <Gallery photos={l.photos ?? []} fallback={artFor(l)} title={l.title}>
            <SaveButton id={l.id} title={l.title} />
          </Gallery>
          <div className="section">
            <div className="metarow">
              <span className="pill" style={{ position: "static", background: cat.color, color: "#fff" }}>{cat.label}</span>
              {l.sold && <span className="pill" style={{ position: "static", background: "var(--label)", color: "var(--surface)" }}>Sold</span>}
              <span className="muted metaplace"><Icon name="pin" size={14} /><span>{l.place} · {l.posted}</span></span>
              <ShareButton title={l.title} />
            </div>
            <h1 className="dtitle">{l.title}</h1>
            <div className="mprice">
              <span className="dprice">{l.price}</span>
              {!l.sold && <a href="#contact" className="btn"><Icon name={cat.action.icon} size={16} color="#fff" />{cat.action.short}</a>}
            </div>
          </div>
          <section className="section">
            <h2>Description</h2>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{l.description}</p>
          </section>
          <section className="section">
            <h2>Details</h2>
            <dl className="facts">
              {l.condition && <div><dt>{CONDITION_LABEL[l.kind] ?? "Condition"}</dt><dd>{l.condition}</dd></div>}
              {l.details.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </section>
          <nav className="keep" aria-label="Keep browsing">
            <Link href={`/?cat=${cat.id}`}><Icon name="tag" size={20} /><span>More in {cat.label}</span></Link>
            <Link href="/"><Icon name="grid" size={20} /><span>All listings</span></Link>
            <Link href="/post"><Icon name="plus" size={20} /><span>Post your own</span></Link>
          </nav>
        </div>
        <aside className="panel" id="contact">
          <div className="dprice">{l.price}</div>
          <ContactSeller listingId={l.id} sellerId={l.sellerId ?? null} action={cat.action} catId={cat.id} place={l.place} sold={l.sold} />
          <div className="seller">
            <span className="avatar" aria-hidden="true">{initials}</span>
            <div className="sellername"><strong>{l.seller.name}</strong><span className="muted"> · {l.seller.meta}</span></div>
          </div>
          <ReportListing listingId={l.id} />
        </aside>
      </div>
    </main>
  );
}

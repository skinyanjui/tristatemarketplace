"use client";
/* eslint-disable @next/next/no-img-element -- local blob previews cannot use next/image */

import { localToday } from "@/lib/dates";
import { PlaceInput, type Picked } from "@/components/PlaceInput";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Notice } from "@/components/Notice";
import { toast } from "@/components/Toaster";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { supabaseBrowser } from "@/lib/supabase/client";
import { GROUPS, categoriesInGroup, categoryOf } from "@/lib/categories";

const FIELDS: Record<string, { price: string; priceHint: string; cond: string; conds: string[] }> = {
  car: { price: "Price", priceHint: "e.g. 18,500", cond: "Condition", conds: ["Used - Excellent", "Used - Good", "Used - Fair", "For parts"] },
  home: { price: "Asking price", priceHint: "e.g. 289,000", cond: "Condition", conds: ["Move-in ready", "Needs updating", "Fixer-upper"] },
  land: { price: "Asking price", priceHint: "e.g. 85,000", cond: "Status", conds: ["Vacant", "Improved"] },
  livestock: { price: "Price per head", priceHint: "e.g. 1,800", cond: "Papers and health", conds: ["Registered", "Vaccinated", "Not registered"] },
  sale: { price: "Price range", priceHint: "e.g. 1 – 250", cond: "Condition", conds: ["Used - Good", "Used - Fair", "Like new", "New"] },
  event: { price: "Admission", priceHint: "Free, or e.g. 10", cond: "Age limit", conds: ["All ages", "18+", "21+"] },
  jobs: { price: "Pay", priceHint: "e.g. 16 – 19 per hour", cond: "Type", conds: ["Full time", "Part time", "Seasonal", "Contract"] },
  services: { price: "Starting price", priceHint: "e.g. 45", cond: "Credentials", conds: ["Insured", "Licensed", "Not licensed"] },
  free: { price: "Price", priceHint: "Free", cond: "Pickup", conds: ["Porch pickup", "Come inside", "Must haul away"] },
  pets: { price: "Price each", priceHint: "e.g. 600", cond: "Health", conds: ["Vaccinated", "Not vaccinated", "Registered"] },
};
const DEFAULT = { price: "Price", priceHint: "e.g. 120", cond: "Condition", conds: ["Like new", "Used - Good", "Used - Fair", "New"] };

function PostForm({ uid, email }: { uid: string; email: string }) {
  const router = useRouter();
  const files = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cat, setCat] = useState("sale");
  const [wanted, setWanted] = useState(false);
  const [picked, setPicked] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [titleLen, setTitleLen] = useState(0);
  const [descLen, setDescLen] = useState(0);
  // Warn before leaving with a half-written listing (closing the tab, reload, back button).
  const dirty = useRef(false);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const [known, setKnown] = useState(true);
  const pickedPlace = useRef<Picked | null>(null);
  const f = FIELDS[cat] ?? DEFAULT;

  return (
    <form
      className="form"
      onChange={() => { dirty.current = true; }}
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        const paths: string[] = [];
        try {
          const sb = supabaseBrowser();
          const photos: string[] = [];
          const chosen = Array.from(files.current?.files ?? []);
          if (chosen.length > 8) throw new Error("Please pick up to 8 photos.");
          if (String(fd.get("title") ?? "").trim().length < 3) throw new Error("Give your listing a title of at least 3 characters.");
          for (const file of chosen) {
            if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) throw new Error(`${file.name} is not a supported photo. Please use JPG, PNG, WebP or HEIC.`);
            if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is a bit too big (8 MB max).`);
            const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
            const path = `${uid}/${crypto.randomUUID()}.${ext}`;
            const up = await sb.storage.from("tm-listing-photos").upload(path, file, { contentType: file.type });
            if (up.error) throw up.error;
            paths.push(path);
            photos.push(sb.storage.from("tm-listing-photos").getPublicUrl(path).data.publicUrl);
          }
          const raw = String(fd.get("price") ?? "").trim();
          const price = raw && /^[\d.,\s–-]+$/.test(raw) ? "$" + raw : raw;
          const { data, error: err } = await sb.from("tm_listings").insert({
            seller_id: uid, seller_name: email.split("@")[0], seller_meta: wanted ? "Private buyer" : "Private seller", wanted, kind: cat,
            title: String(fd.get("title")).trim(), place: pickedPlace.current?.place ?? String(fd.get("place")).trim(), price,
            condition: String(fd.get("cond") ?? ""), lat: pickedPlace.current?.lat ?? null, lng: pickedPlace.current?.lng ?? null, event_date: (cat === "event" || cat === "sale") ? String(fd.get("date") || "") || null : null, description: String(fd.get("desc") ?? "").trim(), photos,
          }).select("id").single();
          if (err) throw err;
          dirty.current = false;
          toast("Your listing is live!");
          router.push(`/listing/${data.id}`);
        } catch (err) {
          // Do not leave uploaded photos behind when the post did not go through.
          if (paths.length) await supabaseBrowser().storage.from("tm-listing-photos").remove(paths);
          const m = (err as { message?: string } | null)?.message ?? "";
          setError(m.includes("price_text_check") ? "Price should be a number, like 120, or the word Free." : m.includes("photos_check") ? "One of those photos could not be used. Please try uploading again." : m || "Oops, something went wrong. Please try again.");
          setBusy(false);
        }
      }}
    >
      <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <legend className="h3" style={{ padding: 0, marginBottom: 12 }}>What kind of post?</legend>
        <div className="tiles">
          <button type="button" className="tile" aria-pressed={!wanted} onClick={() => setWanted(false)}>I’m selling or offering</button>
          <button type="button" className="tile" aria-pressed={wanted} onClick={() => setWanted(true)}>I’m looking to buy</button>
        </div>
        {wanted && <small className="hint">Sellers will see “Wanted” on your post and can reply with “I have this”. Use the price box for your budget.</small>}
      </fieldset>
      <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <legend className="h3" style={{ padding: 0, marginBottom: 12 }}>{wanted ? "What are you looking for?" : "What are you posting?"}</legend>
        {GROUPS.map((g) => (
          <div key={g.id} className="tilegroup" role="group" aria-labelledby={`tg-${g.id}`}>
            <div id={`tg-${g.id}`} className="catgroup">{g.label}</div>
            <div className="tiles">
              {categoriesInGroup(g.id).map((c) => (
                <button key={c.id} type="button" className="tile" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
                  <span className="dot" style={{ background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <section className="field">
        <span className="lbl h3">Photos</span>
        <label className="notice" style={{ cursor: "pointer", textAlign: "center", padding: 28 }}>
          <input ref={files} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="sr-only" onChange={(e) => { const fl = Array.from(e.target.files ?? []); setPicked(fl.length); setPreviews(fl.slice(0, 8).map((f) => URL.createObjectURL(f))); }} />
          {picked ? `${picked} photo${picked > 1 ? "s" : ""} selected. The first one is shown on your card.` : "Add photos (up to 8). The first one is shown on your card."}
        </label>
        <small className="hint">JPG, PNG, WebP or HEIC. Up to 8 photos, 8 MB each. Listings with a clear first photo get noticed.</small>
        {previews.length > 0 && (
          <ul className="thumbs" aria-label="Selected photos">
            {previews.map((u, i) => (
              <li key={u}><img src={u} alt={`Photo ${i + 1}`} />{i === 0 && <span className="pill">Cover</span>}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" maxLength={140} onChange={(e) => setTitleLen(e.target.value.length)} className="input" required placeholder={`${categoryOf(cat).label}: what it is and the key detail`} aria-describedby="title-hint" />
          <small id="title-hint" className={`hint${titleLen > 125 ? " hint-warn" : ""}`}>Lead with what it is, then the key detail. {titleLen}/140</small>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="price">{wanted ? "Your budget" : f.price}</label>
            <input id="price" name="price" maxLength={40} className="input" inputMode="decimal" placeholder={f.priceHint} aria-describedby="price-hint" />
            <small id="price-hint" className="hint">Numbers only, or write Free.</small>
          </div>
          <div className="field" style={{ flex: "0 1 auto" }}>
            <label htmlFor="cond">{f.cond}</label>
            <select id="cond" name="cond" className="input">
              {f.conds.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
        {(cat === "event" || cat === "sale") && (
          <div className="field" style={{ flex: "0 1 auto" }}>
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" className="input" required min={localToday()} />
          </div>
        )}
        <div className="field">
          <label htmlFor="place">Location</label>
          <PlaceInput id="place" name="place" required placeholder="ZIP code or town, like 47711 or Newburgh, IN" onPick={(p, text) => { pickedPlace.current = p; setKnown(!text || !!p); }} />
          {!known && <small className="muted">Pick a suggestion or enter a 5-digit ZIP code so buyers can find this by distance.</small>}
        </div>
        </div>
        <div className="field">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" name="desc" maxLength={4000} onChange={(e) => setDescLen(e.target.value.length)} className="input" rows={5} placeholder="Tell buyers what makes this worth a look" aria-describedby="desc-hint" />
          <small id="desc-hint" className={`hint${descLen > 3600 ? " hint-warn" : ""}`}>Condition, size, what is included, and when buyers can reach you. {descLen}/4000</small>
        </div>
      </section>

      <label className="consent">
        <input type="checkbox" name="confirm" required />
        <span>I own this or have the right to sell it, it is legal to sell, and I agree to the <Link href="/terms" target="_blank">Terms</Link>. Never include bank details or ID numbers.</span>
      </label>
      {error && <Notice tone="bad">{error}</Notice>}
      <button type="submit" className="btn btn-lg" disabled={busy}>{busy ? <><span className="spinner" />Posting…</> : "Post listing"}</button>
    </form>
  );
}

export default function PostPage() {
  return (
    <main className="form">
      <h1>Post a listing</h1>
      <p className="muted lead">Free to post. Your listing stays up for 60 days, and you can renew it in one tap.</p>
      <AuthGate next="/post" title="Sign in to post a listing" note="So you can manage, renew and mark it sold later.">
        {(s) => <PostForm uid={s.user.id} email={s.user.email ?? "neighbor"} />}
      </AuthGate>
    </main>
  );
}

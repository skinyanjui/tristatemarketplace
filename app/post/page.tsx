"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CATEGORIES, categoryOf } from "@/lib/categories";

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
  const [picked, setPicked] = useState(0);
  const f = FIELDS[cat] ?? DEFAULT;

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        try {
          const sb = supabaseBrowser();
          const photos: string[] = [];
          for (const file of Array.from(files.current?.files ?? []).slice(0, 8)) {
            if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is a bit too big (8 MB max).`);
            const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
            const path = `${uid}/${crypto.randomUUID()}.${ext}`;
            const up = await sb.storage.from("tm-listing-photos").upload(path, file, { contentType: file.type });
            if (up.error) throw up.error;
            photos.push(sb.storage.from("tm-listing-photos").getPublicUrl(path).data.publicUrl);
          }
          const raw = String(fd.get("price") ?? "").trim();
          const price = raw && /^[\d.,\s–-]+$/.test(raw) ? "$" + raw : raw;
          const { data, error: err } = await sb.from("tm_listings").insert({
            seller_id: uid, seller_name: email.split("@")[0], kind: cat,
            title: String(fd.get("title")).trim(), place: String(fd.get("place")).trim(), price,
            condition: String(fd.get("cond") ?? ""), description: String(fd.get("desc") ?? "").trim(), photos,
          }).select("id").single();
          if (err) throw err;
          router.push(`/listing/${data.id}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Oops, something went wrong. Please try again.");
          setBusy(false);
        }
      }}
    >
      <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <legend style={{ padding: 0, marginBottom: 12, fontSize: 17, fontWeight: 600 }}>What are you posting?</legend>
        <div className="tiles">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" className="tile" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
              <span className="dot" style={{ background: c.color }} />
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <section className="field">
        <span className="lbl" style={{ fontSize: 17, fontWeight: 600 }}>Photos</span>
        <label className="notice" style={{ cursor: "pointer", textAlign: "center", padding: 28 }}>
          <input ref={files} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setPicked(e.target.files?.length ?? 0)} />
          {picked ? `${picked} photo${picked > 1 ? "s" : ""} selected. The first one is shown on your card.` : "Add photos (up to 8). The first one is shown on your card."}
        </label>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" className="input" required placeholder={`${categoryOf(cat).label}: what it is and the key detail`} />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="price">{f.price}</label>
            <input id="price" name="price" className="input" inputMode="decimal" placeholder={f.priceHint} />
          </div>
          <div className="field" style={{ flex: "0 1 auto" }}>
            <label htmlFor="cond">{f.cond}</label>
            <select id="cond" name="cond" className="input">
              {f.conds.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="place">Location</label>
          <input id="place" name="place" className="input" required placeholder="City, state or ZIP" />
        </div>
        <div className="field">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" name="desc" className="input" rows={5} placeholder="Tell buyers what makes this worth a look" />
        </div>
      </section>

      {error && <div className="notice" role="alert">{error}</div>}
      <button type="submit" className="btn btn-lg" disabled={busy}>{busy ? "Posting…" : "Post listing"}</button>
    </form>
  );
}

export default function PostPage() {
  return (
    <main className="form">
      <h1>Post a listing</h1>
      <AuthGate next="/post" title="Sign in to post a listing" note="We will email you a link, so there is no password to remember.">
        {(s) => <PostForm uid={s.user.id} email={s.user.email ?? "neighbor"} />}
      </AuthGate>
    </main>
  );
}

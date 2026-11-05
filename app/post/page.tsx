"use client";

import { useState } from "react";
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

export default function PostPage() {
  const [cat, setCat] = useState("sale");
  const [sent, setSent] = useState(false);
  const f = FIELDS[cat] ?? DEFAULT;

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <h1>Post a listing</h1>

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
          <input type="file" accept="image/*" multiple className="sr-only" />
          Add photos. The first one is shown on your card.
        </label>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" className="input" required placeholder={`${categoryOf(cat).label}: what it is and the key detail`} />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="price">{f.price}</label>
            <input id="price" className="input" inputMode="decimal" placeholder={f.priceHint} />
          </div>
          <div className="field" style={{ flex: "0 1 auto" }}>
            <label htmlFor="cond">{f.cond}</label>
            <select id="cond" className="input">
              {f.conds.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="place">Location</label>
          <input id="place" className="input" required placeholder="City, state or ZIP" />
        </div>
        <div className="field">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" className="input" rows={5} placeholder="Tell buyers what makes this worth a look" />
        </div>
      </section>

      {sent && (
        <div className="notice" role="status">
          Saved as a draft on this device. Publishing turns on once sign-in and the database are connected.
        </div>
      )}
      <button type="submit" className="btn btn-lg">Post listing</button>
    </form>
  );
}

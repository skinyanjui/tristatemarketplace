"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthGate } from "./AuthGate";
import { AdCard } from "./AdCard";
import { Notice } from "./Notice";
import { toast } from "./Toaster";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CTA_OPTIONS, DAY_OPTIONS, money, type AdProduct } from "@/lib/ads";

type Mine = { id: string; title: string };

function Form({ uid, email, products, billing }: { uid: string; email: string; products: AdProduct[]; billing: boolean }) {
  const file = useRef<HTMLInputElement>(null);
  const [productId, setProductId] = useState<AdProduct["id"]>(products[0]?.id ?? "featured");
  const [days, setDays] = useState<number>(7);
  const [listings, setListings] = useState<Mine[] | null>(null);
  const [listingId, setListingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ business: "", contact: email, headline: "", detail: "", cta: "Learn more", url: "" });
  const [preview, setPreview] = useState<string>("");
  const product = products.find((p) => p.id === productId) ?? products[0];
  const weeks = DAY_OPTIONS.find((d) => d.days === days)?.weeks ?? 1;
  const total = (product?.price_cents ?? 0) * weeks;

  useEffect(() => {
    let live = true;
    supabaseBrowser().from("tm_listings").select("id,title").eq("seller_id", uid).eq("status", "active").eq("is_demo", false).order("created_at", { ascending: false })
      .then(({ data }) => { if (live) { setListings((data ?? []) as Mine[]); setListingId((data?.[0] as Mine | undefined)?.id ?? ""); } });
    return () => { live = false; };
  }, [uid]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (!product) return null;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const sb = supabaseBrowser();
    let uploaded = "";
    try {
      let image_url: string | null = null;
      const img = file.current?.files?.[0];
      if (product.id === "ad") {
        if (!/^https?:\/\/\S+\.\S+/.test(f.url.trim())) throw new Error("Add the full web address your ad should open, starting with https://");
        if (img) {
          if (!/^image\/(jpeg|png|webp)$/.test(img.type)) throw new Error("Please use a JPG, PNG or WebP picture.");
          if (img.size > 8 * 1024 * 1024) throw new Error("That picture is a bit too big (8 MB max).");
          const ext = (img.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
          uploaded = `${uid}/ad-${crypto.randomUUID()}.${ext}`;
          const up = await sb.storage.from("tm-listing-photos").upload(uploaded, img, { contentType: img.type });
          if (up.error) throw up.error;
          image_url = sb.storage.from("tm-listing-photos").getPublicUrl(uploaded).data.publicUrl;
        }
      } else if (!listingId) {
        throw new Error("Pick one of your active listings first.");
      }
      const { error: err } = await sb.from("tm_ad_requests").insert({
        product: product.id, days, business_name: f.business.trim(), contact: f.contact.trim(),
        ...(product.id === "ad"
          ? { headline: f.headline.trim(), detail: f.detail.trim() || null, cta: f.cta, url: f.url.trim(), image_url }
          : { listing_id: listingId }),
      });
      if (err) throw err;
      setSent(true);
      toast("Request sent. We review within 1 business day.");
      window.dispatchEvent(new Event("tm-ad-requests"));
    } catch (ex) {
      if (uploaded) await sb.storage.from("tm-listing-photos").remove([uploaded]);
      const m = ex instanceof Error ? ex.message : (ex as { message?: string })?.message ?? "";
      setError(/tm_ad_requests_open_idx|duplicate key/.test(m) ? "You already have an open request for this. You can cancel it below and send a new one." : m || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="form-card">
        <Notice tone="ok"><strong>Request sent.</strong> We review every request within 1 business day, then email you at {email}. You can follow it, or cancel it, in “Your requests” below.</Notice>
        <button type="button" className="btn btn-ghost" onClick={() => { setSent(false); setF({ ...f, headline: "", detail: "", url: "" }); setPreview(""); }}>Send another request</button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <fieldset className="adfs">
        <legend className="h3">1. What do you want to run?</legend>
        <div className="tiles" role="radiogroup" aria-label="Ad type">
          {products.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={productId === p.id} className="tile" onClick={() => setProductId(p.id)}>
              {p.name}<small>{money(p.price_cents)} / week</small>
            </button>
          ))}
        </div>
        <small className="hint">{product.blurb}</small>
      </fieldset>

      <fieldset className="adfs">
        <legend className="h3">2. How long?</legend>
        <div className="field">
          <label htmlFor="ad-days" className="sr-only">Length</label>
          <select id="ad-days" className="input" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {DAY_OPTIONS.map((d) => <option key={d.days} value={d.days}>{d.label} · {money(product.price_cents * d.weeks)}</option>)}
          </select>
          <small className="hint">{billing ? "You pay after we approve the request. It goes live when payment arrives." : "Launch period: approved ads run free while we test. The price shown applies once billing starts."} It starts the moment it goes live and ends on its own.</small>
        </div>
      </fieldset>

      {product.needs_listing ? (
        <fieldset className="adfs">
          <legend className="h3">3. Which listing?</legend>
          {listings === null ? <p className="muted">Loading your listings…</p> : listings.length === 0 ? (
            <Notice tone="warn">You need an active listing first. <Link href="/post">Post a listing</Link>, then come back.</Notice>
          ) : (
            <div className="field">
              <label htmlFor="ad-listing" className="sr-only">Listing</label>
              <select id="ad-listing" className="input" value={listingId} onChange={(e) => setListingId(e.target.value)}>
                {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
              <small className="hint">Only your own active listings can be promoted. Sold or removed listings are not eligible.</small>
            </div>
          )}
        </fieldset>
      ) : (
        <fieldset className="adfs">
          <legend className="h3">3. Your ad</legend>
          <div className="adbuild">
            <div className="adfields">
              <div className="field"><label htmlFor="ad-h">Headline</label><input id="ad-h" className="input" required maxLength={60} value={f.headline} onChange={set("headline")} placeholder="What you offer, in a few words" /><small className="hint">{f.headline.length}/60</small></div>
              <div className="field"><label htmlFor="ad-d">Short line</label><input id="ad-d" className="input" maxLength={50} value={f.detail} onChange={set("detail")} placeholder="Optional, such as a service area" /><small className="hint">{f.detail.length}/50</small></div>
              <div className="field"><label htmlFor="ad-c">Button</label><select id="ad-c" className="input" value={f.cta} onChange={set("cta")}>{CTA_OPTIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="field"><label htmlFor="ad-u">Where the button goes</label><input id="ad-u" className="input" type="url" inputMode="url" required value={f.url} onChange={set("url")} placeholder="https://yourbusiness.com" /><small className="hint">Your website, booking page or Facebook page.</small></div>
              <div className="field">
                <span className="lbl">Picture</span>
                <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="input" aria-label="Ad picture" onChange={(e) => { const x = e.target.files?.[0]; setPreview(x ? URL.createObjectURL(x) : ""); }} />
                <small className="hint">Optional. A tall picture works best, JPG, PNG or WebP, 8 MB max. No text-heavy images.</small>
              </div>
            </div>
            <div className="adpreview" aria-label="Preview of your ad">
              <span className="muted">Preview</span>
              <div className="adpreview-card"><AdCard ad={{ id: "preview", advertiser: f.business || "Your business", headline: f.headline || "Your headline appears here", detail: f.detail, cta: f.cta, href: "#", image: preview || undefined }} /></div>
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="adfs">
        <legend className="h3">4. Who are you?</legend>
        <div className="row">
          <div className="field"><label htmlFor="ad-b">Business or name</label><input id="ad-b" className="input" required minLength={2} maxLength={80} value={f.business} onChange={set("business")} /></div>
          <div className="field"><label htmlFor="ad-ct">Phone or email for questions</label><input id="ad-ct" className="input" required minLength={5} maxLength={120} value={f.contact} onChange={set("contact")} /></div>
        </div>
      </fieldset>

      <div className="summary"><span>Total</span><strong>{money(total)}</strong><small className="muted">{billing ? "due after approval" : "free during launch"}</small></div>
      <label className="consent">
        <input type="checkbox" required />
        <span>My ad follows the <a href="#standards">ad standards</a> and the <Link href="/terms" target="_blank">Terms</Link>, and I have the right to use everything in it.</span>
      </label>
      {error && <Notice tone="bad">{error}</Notice>}
      <button type="submit" className="btn btn-lg" disabled={busy || (product.needs_listing && !listingId)}>{busy ? <><span className="spinner" />Sending…</> : "Send request"}</button>
    </form>
  );
}

export function AdvertiseForm({ products, billing }: { products: AdProduct[]; billing: boolean }) {
  return (
    <AuthGate next="/advertise" title="Sign in to request an ad" note="We use your email to send the decision and keep your requests in one place.">
      {(s) => <Form uid={s.user.id} email={s.user.email ?? ""} products={products} billing={billing} />}
    </AuthGate>
  );
}

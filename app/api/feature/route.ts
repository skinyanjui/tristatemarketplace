import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/client";

const DAYS = 7;
const PRICE_CENTS = Number(process.env.FEATURE_PRICE_CENTS ?? 500);

/**
 * Feature one of your listings for 7 days.
 * With STRIPE_SECRET_KEY set it starts a Stripe Checkout and returns its URL.
 * Without it (sample mode) it features the listing for free through tm_feature_demo.
 */
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { listingId } = (await req.json().catch(() => ({}))) as { listingId?: string };
  if (!token || !listingId) return Response.json({ error: "Sign in and pick a listing first." }, { status: 400 });

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: u } = await sb.auth.getUser(token);
  if (!u.user) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { data: row } = await sb.from("tm_listings").select("id,title,status").eq("id", listingId).eq("seller_id", u.user.id).maybeSingle();
  if (!row || row.status !== "active") return Response.json({ error: "Only your active listings can be featured." }, { status: 404 });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    const { data, error } = await sb.rpc("tm_feature_demo", { listing_id: listingId, days: DAYS });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ mode: "demo", until: data });
  }

  const origin = new URL(req.url).origin;
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/account?featured=ok`,
    cancel_url: `${origin}/account`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": `Featured listing, ${DAYS} days`,
    "line_items[0][price_data][product_data][description]": row.title,
    "metadata[listing_id]": listingId,
    "metadata[days]": String(DAYS),
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const session = (await res.json()) as { url?: string; error?: { message: string } };
  if (!res.ok || !session.url) return Response.json({ error: session.error?.message ?? "Could not start checkout." }, { status: 502 });
  return Response.json({ mode: "stripe", url: session.url });
}

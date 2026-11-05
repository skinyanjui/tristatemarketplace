import { createHmac, timingSafeEqual } from "node:crypto";
import { SUPABASE_URL } from "@/lib/supabase/client";

/** Stripe calls this after a payment. Needs STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !service) return new Response("Payments are not set up", { status: 501 });

  const body = await req.text();
  const parts = Object.fromEntries((req.headers.get("stripe-signature") ?? "").split(",").map((p) => p.split("=") as [string, string]));
  const expected = createHmac("sha256", secret).update(`${parts.t}.${body}`).digest("hex");
  const given = Buffer.from(parts.v1 ?? "", "hex");
  const ok = given.length === 32 && timingSafeEqual(given, Buffer.from(expected, "hex")) && Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;
  if (!ok) return new Response("Bad signature", { status: 400 });

  const event = JSON.parse(body) as { type: string; data: { object: { payment_status?: string; metadata?: { listing_id?: string; days?: string } } } };
  const s = event.data.object;
  if (event.type === "checkout.session.completed" && s.payment_status === "paid" && s.metadata?.listing_id) {
    const id = s.metadata.listing_id;
    const days = Number(s.metadata.days ?? 7);
    const h = { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json" };
    const cur = (await (await fetch(`${SUPABASE_URL}/rest/v1/tm_listings?id=eq.${encodeURIComponent(id)}&select=featured_until`, { headers: h })).json()) as { featured_until: string | null }[];
    const start = Math.max(Date.now(), cur[0]?.featured_until ? new Date(cur[0].featured_until).getTime() : 0);
    await fetch(`${SUPABASE_URL}/rest/v1/tm_listings?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH", headers: h, body: JSON.stringify({ featured_until: new Date(start + days * 86_400_000).toISOString() }),
    });
  }
  return new Response("ok");
}

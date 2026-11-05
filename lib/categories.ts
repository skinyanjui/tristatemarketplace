export type Icon = "nav" | "check" | "phone" | "cal" | "msg";

export type Category = {
  id: string;
  label: string;
  /** Solid chip color (white text on top). */
  color: string;
  action: { label: string; icon: Icon };
};

const call = { label: "Call seller", icon: "phone" as Icon };
const msg = { label: "Message seller", icon: "msg" as Icon };

export const CATEGORIES: Category[] = [
  { id: "car", label: "Cars", color: "#1b4f9c", action: call },
  { id: "home", label: "Real estate", color: "#14602b", action: { label: "Request a tour", icon: "cal" } },
  { id: "land", label: "Land", color: "#625310", action: { label: "Request info", icon: "msg" } },
  { id: "livestock", label: "Livestock", color: "#a1262b", action: call },
  { id: "sale", label: "Garage sales", color: "#8f4a0a", action: { label: "Get directions", icon: "nav" } },
  { id: "event", label: "Events", color: "#5a32a3", action: { label: "RSVP", icon: "check" } },
  { id: "moto", label: "Motorcycles", color: "#1b4f9c", action: call },
  { id: "boat", label: "Boats and RVs", color: "#1b4f9c", action: call },
  { id: "trailer", label: "Trailers", color: "#1b4f9c", action: call },
  { id: "farm", label: "Farm gear", color: "#1b4f9c", action: call },
  { id: "furniture", label: "Furniture", color: "#0d5c63", action: msg },
  { id: "appliance", label: "Appliances", color: "#0d5c63", action: msg },
  { id: "tools", label: "Tools", color: "#0d5c63", action: msg },
  { id: "garden", label: "Lawn and garden", color: "#0d5c63", action: msg },
  { id: "electronics", label: "Electronics", color: "#0d5c63", action: msg },
  { id: "sports", label: "Sports", color: "#9b2263", action: msg },
  { id: "clothing", label: "Clothing", color: "#9b2263", action: msg },
  { id: "kids", label: "Kids and baby", color: "#9b2263", action: msg },
  { id: "antiques", label: "Antiques", color: "#9b2263", action: msg },
  { id: "music", label: "Music gear", color: "#9b2263", action: msg },
  { id: "pets", label: "Pets", color: "#a1262b", action: call },
  { id: "services", label: "Services", color: "#35505f", action: { label: "Request a quote", icon: "msg" } },
  { id: "jobs", label: "Jobs", color: "#35505f", action: { label: "Apply", icon: "check" } },
  { id: "free", label: "Free stuff", color: "#7a5b00", action: { label: "Claim this", icon: "check" } },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export function categoryOf(id: string): Category {
  return CATEGORY_BY_ID[id] ?? CATEGORY_BY_ID.sale;
}

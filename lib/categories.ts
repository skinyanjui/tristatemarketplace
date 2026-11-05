export type Icon = "nav" | "check" | "cal" | "msg";

export type Category = {
  id: string;
  label: string;
  /** Solid chip color (white text on top). */
  color: string;
  action: Action;
};

/** What the main button says and does. Everything opens the message form except directions, which opens a map. */
export type Action = { label: string; short: string; tiny?: string; icon: Icon; ask: string; map?: boolean };
const call: Action = { label: "Message seller", short: "Message", icon: "msg", ask: "Hi, is this still available? When could I take a look?" };
const msg: Action = { label: "Message seller", short: "Message", icon: "msg", ask: "Hi, is this still available?" };

export const CATEGORIES: Category[] = [
  { id: "car", label: "Cars", color: "#1b4f9c", action: call },
  { id: "home", label: "Real estate", color: "#14602b", action: { label: "Request a tour", short: "Tour", icon: "cal", ask: "Hi, I would like to see this home. What days work for a tour?" } },
  { id: "land", label: "Land", color: "#625310", action: { label: "Request info", short: "Info", icon: "msg", ask: "Hi, could you send me more details about this property?" } },
  { id: "livestock", label: "Livestock", color: "#a1262b", action: call },
  { id: "sale", label: "Garage sales", color: "#8f4a0a", action: { label: "Get directions", short: "Directions", tiny: "Map", icon: "nav", ask: "Hi, are you still having the sale?", map: true } },
  { id: "event", label: "Events", color: "#5a32a3", action: { label: "RSVP", short: "RSVP", icon: "check", ask: "Hi, I plan to come. Is there anything I should bring?" } },
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
  { id: "services", label: "Services", color: "#35505f", action: { label: "Request a quote", short: "Quote", icon: "msg", ask: "Hi, could I get a quote for this job?" } },
  { id: "jobs", label: "Jobs", color: "#35505f", action: { label: "Apply", short: "Apply", icon: "check", ask: "Hi, I would like to apply. Here is a little about me:" } },
  { id: "free", label: "Free stuff", color: "#7a5b00", action: { label: "Claim this", short: "Claim", icon: "check", ask: "Hi, I would like this. When can I pick it up?" } },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export function categoryOf(id: string): Category {
  return CATEGORY_BY_ID[id] ?? CATEGORY_BY_ID.sale;
}

/** Google Maps directions to a town or address. */
export const mapsUrl = (place: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`;

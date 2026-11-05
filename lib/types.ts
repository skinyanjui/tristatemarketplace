export type Listing = {
  id: string;
  kind: string;
  title: string;
  place: string;
  /** Display price, for example "$18,500", "$2 – $600" or "Free". */
  price: string;
  condition: string;
  description: string;
  details: [string, string][];
  seller: { name: string; meta: string };
  posted: string;
  photoCount: number;
  /** Optional uploaded photo URLs. When empty the card shows an illustration. */
  photos?: string[];
  /** Set when a real member posted it; sample listings have no seller to message. */
  sellerId?: string | null;
  /** Marked sold by the seller. Still shown, but dimmed, and not contactable. */
  sold?: boolean;
  /** ISO date (YYYY-MM-DD) for events and garage sales. */
  eventDate?: string;
  /** Miles from the visitor's town (or the one they chose), when known. */
  miles?: number;
  featured?: boolean;
  featuredUntil?: string;
};

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
};

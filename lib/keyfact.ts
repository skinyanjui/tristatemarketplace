import type { Listing } from "./types";

const pick = (l: Listing, k: string) => l.details.find(([d]) => d === k)?.[1];
const join = (...p: (string | undefined)[]) => p.filter(Boolean).join(" · ");

/** The one short line that helps a buyer rule a listing in or out without opening it. */
const BY_KIND: Record<string, (l: Listing) => string> = {
  car: (l) => join(pick(l, "Year"), pick(l, "Mileage") && `${pick(l, "Mileage")} mi`),
  moto: (l) => join(pick(l, "Year"), pick(l, "Mileage") && `${pick(l, "Mileage")} mi`),
  boat: (l) => join(pick(l, "Year"), pick(l, "Length")),
  farm: (l) => join(pick(l, "Year"), pick(l, "Hours") && `${pick(l, "Hours")} hrs`),
  trailer: (l) => join(pick(l, "Length"), pick(l, "Type")),
  home: (l) => join(pick(l, "Bedrooms") && `${pick(l, "Bedrooms")} bd`, pick(l, "Bathrooms") && `${pick(l, "Bathrooms")} ba`, pick(l, "Living area")?.replace(" sq ft", " sf")),
  land: (l) => join(pick(l, "Acres") && `${pick(l, "Acres")} acres`, pick(l, "Zoning")),
  livestock: (l) => join(pick(l, "Breed"), pick(l, "Age")),
  pets: (l) => join(pick(l, "Breed"), pick(l, "Age")),
  sale: (l) => pick(l, "Hours") ?? "",
  event: (l) => join(pick(l, "Time") ?? (pick(l, "Doors") && `Doors ${pick(l, "Doors")}`), pick(l, "Admission")),
  furniture: (l) => join(pick(l, "Material"), pick(l, "Width")),
  appliance: (l) => join(pick(l, "Brand"), pick(l, "Capacity")),
  tools: (l) => join(pick(l, "Brand"), pick(l, "Voltage")),
  garden: (l) => join(pick(l, "Brand"), pick(l, "Deck")),
  electronics: (l) => join(pick(l, "Brand"), pick(l, "Size")),
  sports: (l) => join(pick(l, "Brand"), pick(l, "Frame")),
  clothing: (l) => join(pick(l, "Sizes"), pick(l, "Pieces") && `${pick(l, "Pieces")} pieces`),
  kids: (l) => join(pick(l, "Brand"), pick(l, "Includes")),
  antiques: (l) => join(pick(l, "Era"), pick(l, "Size")),
  music: (l) => join(pick(l, "Brand"), pick(l, "Includes")),
  services: (l) => pick(l, "Rate") ?? "",
  jobs: (l) => join(l.condition, pick(l, "Hours")),
  free: (l) => pick(l, "Pickup") ?? "",
};

/** Key facts for the card, falling back to the listing's condition when the details are not there. */
export function keyFact(l: Listing): string {
  return BY_KIND[l.kind]?.(l) || l.condition || "";
}

/** "3 mi" under 100 miles, "<1 mi" when very close. */
export function milesLabel(m?: number): string {
  if (m === undefined || !Number.isFinite(m)) return "";
  return m < 1 ? "<1 mi" : `${Math.round(m)} mi`;
}

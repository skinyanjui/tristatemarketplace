/** Tristate towns we can measure distance from. Coordinates are town centers (approximate). */
export type Town = { id: string; name: string; lat: number; lng: number };

const RAW: [string, string, number, number][] = [
  ["Evansville, IN", "evansville", 37.9748, -87.5558], ["Newburgh, IN", "newburgh", 37.9445, -87.4056],
  ["Henderson, KY", "henderson", 37.8362, -87.59], ["Boonville, IN", "boonville", 38.0492, -87.2739],
  ["Mount Vernon, IN", "mount-vernon", 37.9323, -87.895], ["Princeton, IN", "princeton", 38.3553, -87.5681],
  ["Mount Carmel, IL", "mount-carmel", 38.4109, -87.7614], ["Owensboro, KY", "owensboro", 37.7742, -87.1133],
  ["Jasper, IN", "jasper", 38.3911, -86.9311], ["Vincennes, IN", "vincennes", 38.6773, -87.5286],
  ["Rockport, IN", "rockport", 37.8825, -87.0483], ["Chandler, IN", "chandler", 38.0453, -87.3689],
  ["Haubstadt, IN", "haubstadt", 38.2086, -87.575], ["Poseyville, IN", "poseyville", 38.17, -87.787],
  ["Morganfield, KY", "morganfield", 37.6834, -87.9162], ["Madisonville, KY", "madisonville", 37.3281, -87.4999],
  ["Carmi, IL", "carmi", 38.09, -88.167], ["Grayville, IL", "grayville", 38.257, -87.995],
  ["Tell City, IN", "tell-city", 37.9514, -86.7678], ["Cannelton, IN", "cannelton", 37.9112, -86.7444],
  ["Elberfeld, IN", "elberfeld", 38.1553, -87.4469], ["Dale, IN", "dale", 38.17, -86.99],
  ["Sturgis, KY", "sturgis", 37.547, -87.993], ["Uniontown, KY", "uniontown", 37.7742, -87.933],
  ["Cynthiana, IN", "cynthiana", 38.1792, -87.7656], ["Darmstadt, IN", "darmstadt", 38.054, -87.48],
];

export const TOWNS: Town[] = RAW.map(([name, id, lat, lng]) => ({ id, name, lat, lng }));
export const TOWN_BY_ID: Record<string, Town> = Object.fromEntries(TOWNS.map((t) => [t.id, t]));
export const DEFAULT_TOWN = "evansville";
export const RADII = [5, 10, 25, 50, 100];

/** Coordinates for a typed "City, ST" location, or null when we do not know the town. */
export function townFor(place: string): Town | null {
  const p = place.trim().toLowerCase().replace(/\s+/g, " ");
  return TOWNS.find((t) => t.name.toLowerCase() === p) ?? null;
}

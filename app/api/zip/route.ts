import { searchPlaces } from "@/lib/zips";

/** ZIP code and city lookup for the location boxes. GET /api/zip?q=477 or ?q=Evansville, IN */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const results = q.length > 60 ? [] : searchPlaces(q, 8);
  return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}

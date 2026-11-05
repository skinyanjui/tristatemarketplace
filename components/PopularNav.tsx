import { popularCategoryIds } from "@/lib/popular";
import { Nav } from "./Nav";

/** The top bar, with its category chips ordered by popularity. */
export async function PopularNav() {
  return <Nav popular={await popularCategoryIds()} />;
}

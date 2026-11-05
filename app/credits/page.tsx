import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import credits from "@/lib/photo-credits.json";

export const metadata: Metadata = { title: "Photo credits" };

const LINKS: Record<string, string> = {
  "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
  "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
};

export default function Credits() {
  return (
    <Prose title="Photo credits">
      <p>Some sample listings use freely licensed photos from Wikimedia Commons. Thank you to these photographers.</p>
      <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        {credits.map((c) => (
          <li key={c.file}>
            <a href={c.url}>{c.title}</a> by {c.artist},{" "}
            {LINKS[c.license] ? <a href={LINKS[c.license]}>{c.license}</a> : c.license}
          </li>
        ))}
      </ul>
    </Prose>
  );
}

import fs from "fs";
import path from "path";
import { marked } from "marked";

// Local probate guide shown below the attorney list on a city page.
// Source: src/content/city/<city-slug>.md (no H1; the page supplies its own).
export function getCityGuideHtml(citySlug: string): string | null {
  const file = path.join(process.cwd(), "src/content/city", `${citySlug}.md`);
  if (!fs.existsSync(file)) return null;
  return marked(fs.readFileSync(file, "utf8")) as string;
}

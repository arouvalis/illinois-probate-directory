import { MetadataRoute } from "next";
import contentDates from "../../data/content-dates.json";

// lastModified comes from data/content-dates.json, which only changes when a
// page's content actually changes. Regenerate before committing:
//   node scripts/update-content-dates.js
const BASE_URL = "https://www.illinoisprobatedirectory.com";

const RULES: Array<[string, MetadataRoute.Sitemap[number]["changeFrequency"], number]> = [
  ["/county/", "weekly", 0.8],
  ["/resources/", "monthly", 0.8],
  ["/city/", "monthly", 0.7],
  ["/blog/", "monthly", 0.7],
  ["/attorney/", "monthly", 0.6],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const dates = contentDates as Record<string, { hash: string; date: string }>;
  return Object.entries(dates).map(([route, { date }]) => {
    const rule = RULES.find(([prefix]) => route.startsWith(prefix));
    return {
      url: route === "/" ? BASE_URL : `${BASE_URL}${route}`,
      lastModified: new Date(date),
      changeFrequency: route === "/" ? "weekly" : rule ? rule[1] : "monthly",
      priority: route === "/" ? 1.0 : rule ? rule[2] : 0.7,
    };
  });
}

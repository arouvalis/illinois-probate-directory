import { MetadataRoute } from "next";
import { getAllAttorneys, COUNTY_SLUGS } from "@/lib/attorneys";

const BASE_URL = "https://www.illinoisprobatedirectory.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const attorneys = getAllAttorneys();
  const countyPaths = Object.keys(COUNTY_SLUGS);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/resources/how-probate-works-illinois`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/resources/selling-inherited-property-illinois`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const countyPages: MetadataRoute.Sitemap = countyPaths.map((slug) => ({
    url: `${BASE_URL}/county/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const attorneyPages: MetadataRoute.Sitemap = attorneys.map((a) => ({
    url: `${BASE_URL}/attorney/${a.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...countyPages, ...attorneyPages];
}

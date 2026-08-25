import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { getAllAttorneys, COUNTY_SLUGS } from "@/lib/attorneys";

const BASE_URL = "https://www.illinoisprobatedirectory.com";
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const attorneys = getAllAttorneys();
  const countyPaths = Object.keys(COUNTY_SLUGS);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/resources/how-probate-works-illinois`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/resources/selling-inherited-property-illinois`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const countyPages: MetadataRoute.Sitemap = countyPaths.map((slug) => ({
    url: `${BASE_URL}/county/${slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const attorneyPages: MetadataRoute.Sitemap = attorneys.map((a) => ({
    url: `${BASE_URL}/attorney/${a.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogDir = path.join(process.cwd(), "src/content/blog");
  const blogFiles = fs.existsSync(blogDir) ? fs.readdirSync(blogDir) : [];
  const blogPages: MetadataRoute.Sitemap = blogFiles.map((file) => {
    const filePath = path.join(blogDir, file);
    let modified = BUILD_DATE;
    try {
      modified = fs.statSync(filePath).mtime;
    } catch {
      // fall back to build date if the file stat fails
    }
    return {
      url: `${BASE_URL}/blog/${file.replace(".md", "")}`,
      lastModified: modified,
      changeFrequency: "monthly",
      priority: 0.7,
    };
  });

  return [...staticPages, ...countyPages, ...attorneyPages, ...blogPages];
}

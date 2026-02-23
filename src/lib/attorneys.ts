import attorneysData from "../../data/attorneys.json";

export interface Attorney {
  slug: string;
  name: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  rating: number | null;
  reviews: number | null;
  photo: string | null;
  working_hours: string | null;
  about: string | null;
  probate_verified: string | null;
  confidence_score: number | null;
  specializations_found: string | null;
  free_consultation: string | null;
  languages: string | null;
  source_county: string;
}

export const COUNTY_SLUGS: Record<string, string> = {
  "cook-county": "Cook",
  "lake-county": "Lake",
  "will-county": "Will",
  "kane-county": "Kane",
  "mchenry-county": "McHenry",
  "dupage-county": "DuPage",
};

export const COUNTY_NAMES = [
  "Cook",
  "Lake",
  "Will",
  "Kane",
  "McHenry",
  "DuPage",
];

export const COUNTY_SLUG_MAP: Record<string, string> = {
  Cook: "cook-county",
  Lake: "lake-county",
  Will: "will-county",
  Kane: "kane-county",
  McHenry: "mchenry-county",
  DuPage: "dupage-county",
};

export const attorneys = attorneysData as Attorney[];

export function getAllAttorneys(): Attorney[] {
  return attorneys;
}

export function getAttorneyBySlug(slug: string): Attorney | undefined {
  return attorneys.find((a) => a.slug === slug);
}

export function getAttorneysByCounty(county: string): Attorney[] {
  return attorneys.filter((a) => a.source_county === county);
}

export function getCountyDisplayName(countySlug: string): string {
  const name = COUNTY_SLUGS[countySlug];
  return name ? `${name} County` : countySlug;
}

export function getFeaturedAttorneys(county: string, limit = 6): Attorney[] {
  return attorneys
    .filter(
      (a) =>
        a.source_county === county &&
        a.probate_verified === "YES" &&
        a.rating !== null
    )
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

export function parseSpecializations(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Strip query strings (UTM params etc.) and fragments from a website URL.
 * Handles both standard query strings (?utm_source=...) and URL-encoded
 * query strings embedded in the path (%3Futm_source%3D...).
 */
export function cleanWebsite(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Decode the pathname to catch %3F-encoded query strings, then strip at ?
    const cleanPath = decodeURIComponent(u.pathname).split("?")[0].split("#")[0];
    return u.origin + cleanPath;
  } catch {
    const decoded = (() => { try { return decodeURIComponent(url); } catch { return url; } })();
    return decoded.split("?")[0].split("#")[0];
  }
}

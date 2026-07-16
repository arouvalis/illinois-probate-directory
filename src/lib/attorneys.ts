import attorneysData from "../../data/attorneys.json";

export interface Attorney {
  slug: string;
  name: string | null;
  phone: string | null;
  phone_direct: string | null;
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
  featured: boolean | null;
}

export const COUNTY_SLUGS: Record<string, string> = {
  cook: "Cook",
  lake: "Lake",
  will: "Will",
  kane: "Kane",
  mchenry: "McHenry",
  dupage: "DuPage",
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
  Cook: "cook",
  Lake: "lake",
  Will: "will",
  Kane: "kane",
  McHenry: "mchenry",
  DuPage: "dupage",
};

export const attorneys = attorneysData as Attorney[];

export function getAllAttorneys(): Attorney[] {
  return attorneys;
}

export function getAttorneyBySlug(slug: string): Attorney | undefined {
  return attorneys.find((a) => a.slug === slug);
}

export function getAttorneysByCity(city: string): Attorney[] {
  return attorneys.filter((a) => a.city?.toLowerCase() === city.toLowerCase());
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
/** Simple deterministic string hash — same slug always yields same variant picks,
 *  so the generated text is stable across rebuilds instead of changing every deploy. */
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(options: T[], seed: number, salt: number): T {
  return options[(seed + salt) % options.length];
}

export function generateAttorneyDescription(attorney: Attorney): string {
  const seed = hashSlug(attorney.slug);
  const specs = parseSpecializations(attorney.specializations_found);
  const city = attorney.city ?? "the area";
  const county = attorney.source_county ? `${attorney.source_county} County` : "Illinois";

  const sentences: string[] = [];

  const openers = [
    `${attorney.name} serves clients in ${city} and throughout ${county}.`,
    `Based in ${city}, ${attorney.name} handles legal matters for families across ${county}.`,
    `${attorney.name} is a law office located in ${city}, serving ${county} and nearby communities.`,
    `Clients in ${city} and the surrounding ${county} area turn to ${attorney.name} for legal guidance.`,
  ];
  sentences.push(pick(openers, seed, 0));

  if (specs.length > 0) {
    const specList = specs.length === 1
      ? specs[0]
      : specs.slice(0, -1).join(", ") + (specs.length > 2 ? "," : "") + " and " + specs[specs.length - 1];
    const specVariants = [
      `The firm focuses on ${specList}.`,
      `Practice areas include ${specList}.`,
      `Their work centers on ${specList}.`,
    ];
    sentences.push(pick(specVariants, seed, 1));
  }

  if (attorney.rating !== null && attorney.reviews !== null && attorney.reviews > 0) {
    const r = attorney.rating.toFixed(1);
    const reviewWord = attorney.reviews === 1 ? "review" : "reviews";
    const ratingVariants = [
      `Clients have rated the firm ${r} out of 5 based on ${attorney.reviews} ${reviewWord}.`,
      `The firm holds a ${r}-star average across ${attorney.reviews} client ${reviewWord}.`,
      `${attorney.reviews} client ${reviewWord} give the firm an average rating of ${r}.`,
    ];
    sentences.push(pick(ratingVariants, seed, 2));
  }

  const isVerified = attorney.probate_verified === "YES";
  const isFreeConsult = attorney.free_consultation === "YES";
  if (isVerified && isFreeConsult) {
    const both = [
      `This is a probate-verified firm that also offers a free initial consultation.`,
      `The firm is probate-verified and offers new clients a free consultation.`,
    ];
    sentences.push(pick(both, seed, 3));
  } else if (isVerified) {
    const verifiedOnly = [
      `This firm has been verified as handling probate matters.`,
      `The firm is probate-verified through our directory review process.`,
    ];
    sentences.push(pick(verifiedOnly, seed, 3));
  } else if (isFreeConsult) {
    const freeOnly = [
      `New clients can schedule a free initial consultation.`,
      `The firm offers a free consultation for new clients.`,
    ];
    sentences.push(pick(freeOnly, seed, 3));
  }

  return sentences.join(" ");
}
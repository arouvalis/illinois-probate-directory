import type { Metadata } from "next";
import { attorneys, type Attorney } from "./attorneys";

// Shared data for the city pages built with src/components/CityPage.tsx.
// Court addresses are the ones already published on the county pages.

export interface Court {
  county: string; // "Cook"
  countySlug: string; // "cook"
  building: string;
  street: string;
  cityLine: string;
  seat: string; // town the courthouse is in
}

export const COURTS: Record<string, Court> = {
  Cook: { county: "Cook", countySlug: "cook", building: "Richard J. Daley Center", street: "50 W Washington St", cityLine: "Chicago, IL 60602", seat: "Chicago" },
  DuPage: { county: "DuPage", countySlug: "dupage", building: "DuPage County Courthouse", street: "505 N County Farm Rd", cityLine: "Wheaton, IL 60187", seat: "Wheaton" },
  Kane: { county: "Kane", countySlug: "kane", building: "Kane County Courthouse", street: "100 S 3rd St", cityLine: "Geneva, IL 60134", seat: "Geneva" },
  Lake: { county: "Lake", countySlug: "lake", building: "Lake County Courthouse", street: "18 N County St", cityLine: "Waukegan, IL 60085", seat: "Waukegan" },
  McHenry: { county: "McHenry", countySlug: "mchenry", building: "McHenry County Courthouse", street: "2200 N Seminary Ave", cityLine: "Woodstock, IL 60098", seat: "Woodstock" },
  Will: { county: "Will", countySlug: "will", building: "Will County Courthouse", street: "100 W Jefferson St", cityLine: "Joliet, IL 60432", seat: "Joliet" },
};

export interface CityPageConfig {
  /** Folder name under /city, e.g. "cicero-probate-attorney". Also the guide file name in src/content/city. */
  slug: string;
  city: string;
  /** Counties whose court can handle an estate from this town; the first is the main one. */
  counties: string[];
  title: string;
  /** Meta title and description. "{N}" is replaced with the number of listings in the town. */
  description: string;
  /** Paragraph under the page heading. */
  intro: string;
  /** Neighboring towns whose listings are shown in a separate, labelled "nearby" section. */
  nearbyTowns?: string[];
  /** Other pages worth pointing to, e.g. a larger neighboring town with its own page. */
  seeAlso?: { title: string; href: string }[];
  /** Show the search box above the list (for long lists). */
  searchable?: boolean;
}

const inTown = (town: string) => (a: Attorney) => a.city?.toLowerCase() === town.toLowerCase();

export function getCityListings(config: CityPageConfig) {
  const local = attorneys.filter(inTown(config.city));
  const nearbyTowns = (config.nearbyTowns ?? []).filter((t) => attorneys.some(inTown(t)));
  const nearby = nearbyTowns.flatMap((t) => attorneys.filter(inTown(t)));
  return { local, nearby, nearbyTowns };
}

/** Title, description and canonical for a city page; "{N}" becomes the town's listing count. */
export function cityMetadata(config: CityPageConfig): Metadata {
  const fill = (text: string) => text.replace("{N}", String(attorneys.filter(inTown(config.city)).length));
  return {
    title: fill(config.title),
    description: fill(config.description),
    alternates: { canonical: `https://www.illinoisprobatedirectory.com/city/${config.slug}` },
  };
}

/** "A", "A and B", "A, B and C" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

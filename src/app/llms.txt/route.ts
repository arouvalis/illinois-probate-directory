// /llms.txt: a plain-text summary of the site for AI search tools.
// Generated at build time so listing counts and page lists always match the data.
import fs from "fs";
import path from "path";
import { COUNTY_SLUG_MAP, getAttorneysByCity, getCountyCount, getDirectoryStats } from "@/lib/attorneys";
import { COURTS } from "@/lib/cityPages";
import { CPS_BASE } from "@/lib/cps";
import { SMALL_ESTATE_SENTENCE, TIMELINE_SENTENCE } from "@/lib/probateFacts";
import { SITE } from "@/lib/schema";

export const dynamic = "force-static";

const COUNTIES = ["Cook", "DuPage", "Kane", "Lake", "McHenry", "Will"];

// "lake-in-the-hills-probate-attorney" -> "Lake in the Hills"
function cityName(slug: string): string {
  return slug
    .replace(/-probate-attorney$/, "")
    .split("-")
    .map((w) => (["in", "the"].includes(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export function GET() {
  const { total, verified, freeConsult } = getDirectoryStats();

  const countyLines = COUNTIES.map((c) => {
    const court = COURTS[c];
    return `- [${c} County probate attorneys](${SITE}/county/${COUNTY_SLUG_MAP[c]}): ${getCountyCount(c)} listings. ${c} County probate cases are filed at the ${court.building}, ${court.street}, ${court.cityLine}.`;
  }).join("\n");

  const cityLines = fs
    .readdirSync(path.join(process.cwd(), "src/app/city"))
    .filter((d) => d.endsWith("-probate-attorney"))
    .sort()
    .map((slug) => {
      const name = cityName(slug);
      const n = getAttorneysByCity(name).length;
      return `- [Probate attorneys in ${name}](${SITE}/city/${slug}): ${n} ${n === 1 ? "listing" : "listings"} in ${name}`;
    })
    .join("\n");

  const body = `# Illinois Probate Directory

> A free directory of ${total} probate attorney listings in six Chicago-area counties of Illinois (Cook, DuPage, Kane, Lake, McHenry and Will), with plain-language guides to how Illinois probate works. No registration is needed to search.

## What the site offers
- Attorney listings by county and by town, each with its own profile page (address, phone, office hours, Google rating and practice areas where known). ${verified} listings are marked probate-verified and ${freeConsult} offer a free consultation.
- Listings are shown in alphabetical order by default. The directory does not rank attorneys or publish "best of" lists.
- A visitor can message a specific attorney from that attorney's page, or ask for help finding one from the home page.
- Guides to the Illinois probate process, timelines, courts and selling an inherited house.
- The site is a directory, not a law firm, and does not give legal advice.

## Attorney listings by county
${countyLines}

## Attorney listings by town
${cityLines}

## Guides
- [How Probate Works in Illinois](${SITE}/resources/how-probate-works-illinois): the process from opening the estate to closing it
- [How Long Does Probate Take in Illinois? Timeline by County](${SITE}/resources/illinois-probate-timeline-by-county): each stage and the six-month claims period
- [Illinois Probate Courts by County](${SITE}/resources/illinois-probate-courts-by-county): courthouse addresses and filing details for the six counties
- [Selling an Inherited House in Illinois: The Legal Steps](${SITE}/resources/selling-inherited-property-illinois): who can sell, whether probate is needed first, and taxes
- [What Happens to a House During Illinois Probate](${SITE}/for-families): responsibility, vacancy, insurance and cleanout
- [Do I Need a Probate Attorney in Illinois?](${SITE}/blog/do-i-need-a-probate-attorney-in-illinois)
- [What Does a Probate Attorney Cost in Illinois?](${SITE}/blog/how-much-does-a-probate-attorney-cost-in-illinois)
- [Small Estate Affidavit in Illinois](${SITE}/blog/small-estate-affidavit-illinois)
- [What Goes Through Probate in Illinois, and What Doesn't](${SITE}/blog/what-assets-go-through-probate-in-illinois)
- [Lake County, IL Probate: Court, Steps and Timeline](${SITE}/blog/lake-county-il-probate)
- [All guides](${SITE}/blog)

## Key facts the site states
- ${TIMELINE_SENTENCE}
- ${SMALL_ESTATE_SENTENCE}
- An Illinois probate case is filed with the circuit court of the county where the person lived.

## Related site
- [Chicago Probate Specialist](${CPS_BASE}/): real estate brokers who help families sell an inherited house in the same six counties. The directory is run by Andy Rouvalis, a licensed Illinois real estate broker with Chicago Probate Specialist. For questions about selling the property, that is the site to use; for finding an attorney, use this directory.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

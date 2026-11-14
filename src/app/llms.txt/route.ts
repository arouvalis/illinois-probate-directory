// /llms.txt, generated so the listing count always matches the data.
import { getDirectoryStats } from "@/lib/attorneys";

const SITE = "https://www.illinoisprobatedirectory.com";

export const dynamic = "force-static";

export function GET() {
  const { total, verified } = getDirectoryStats();
  const body = `# Illinois Probate Directory

> A directory of ${total} probate attorney listings (${verified} probate-verified) across Cook, Lake, Will, Kane, McHenry, and DuPage counties, Illinois. Free to search, no registration required.

## Key pages
- [Home](${SITE}/): Full attorney search across all 6 counties
- [Cook County Attorneys](${SITE}/county/cook)
- [Lake County Attorneys](${SITE}/county/lake)
- [Will County Attorneys](${SITE}/county/will)
- [Kane County Attorneys](${SITE}/county/kane)
- [McHenry County Attorneys](${SITE}/county/mchenry)
- [DuPage County Attorneys](${SITE}/county/dupage)
- [How Probate Works in Illinois](${SITE}/resources/how-probate-works-illinois)
- [Illinois Probate Courts by County](${SITE}/resources/illinois-probate-courts-by-county)
- [Illinois Probate Timeline by County](${SITE}/resources/illinois-probate-timeline-by-county)
- [Selling Inherited Property in Illinois](${SITE}/resources/selling-inherited-property-illinois)
- [Blog](${SITE}/blog)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

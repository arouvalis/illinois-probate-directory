# IPD + CPS Optimization Brief

Nov 13, 2026 · Andy Rouvalis

## How to use this brief

This is the only plan for IPD and CPS. It replaces the ChatGPT audit, the September optimization plan, the AI-analysis prompt and earlier Claude suggestions. If an idea isn't here, it's parked.

1. Open Claude Code with both repos (IPD and CPS) available.
2. Run **one phase per session**. Each phase ends with a short report and a pull request Andy reviews before anything goes live.
3. Save working notes to `NOTES.md` at the end of each session so the next session can continue from them.
4. New idea from anywhere? Add it to Open decisions, don't start a side project.

## Business context

The goal is more qualified inherited-property opportunities, not more traffic.

- **Owner:** Andy Rouvalis, Illinois real estate broker with HomeSmart Connect, focused on probate and inherited-property sales.
- **IllinoisProbateDirectory.com (IPD):** Andy's solo project. A directory of 592 probate attorney listings across six counties: Cook, DuPage, Kane, Lake, McHenry and Will, plus county pages, attorney pages and probate resources.
- **ChicagoProbateSpecialist.com (CPS):** the probate real-estate service site. Andy's partner on CPS only is Lewis Kaplan, so CPS changes need Lewis's OK before they go live.
- **Quality lead:** a person or family with an inherited property they expect to deal with in the next 3–12 months.
- **Service area for CPS:** the same six counties IPD covers (Cook, DuPage, Kane, Lake, McHenry, Will). Prove the model here before expanding further.
- **Tech stack:** Next.js on Vercel, GitHub, Resend (form and outreach email), Google Search Console, GA4, Outscraper data, Claude Haiku for blog generation. CPS email runs on Zoho Mail; IPD has no inbox yet.

## Locked decisions

IPD finds the people; CPS converts the property. These roles are settled and every change must fit them.

| Site | Visitor's question | Main job | Main conversions |
| --- | --- | --- | --- |
| IPD | "I need help with probate. Where do I start?" | Organic acquisition: attorney search, county pages, probate info | Contact a specific attorney; ask to be matched with one; flag "estate includes real estate" |
| CPS | "I inherited property. What do I do with it?" | Convert property owners into real-estate conversations | Free consultation; free property valuation (CMA); call/text |

**How they connect:** IPD asks "Does the estate include real estate?" at natural points. A yes leads to CPS as a helpful next resource, never a sales pitch. CPS links back to IPD for families who still need an attorney. Google Business Profile sends visitors straight to CPS.

**Decisions already made**

- Keep the two sites separate. Don't merge them.
- IPD lead forms get four *optional* fields: property city or zip, probate stage, timeline, relationship to the estate.
- A lead that names a specific attorney goes to that attorney right away, with no extra questions first.
- "Help me find an attorney" is a separate path from "contact this attorney."
- Attorney outreach is by phone, because few attorney emails are on file.

**Do not**

- Turn IPD into a second CPS, or make its attorney pages read as ads for CPS.
- Force every IPD visitor into the real-estate funnel.
- Delete, redirect or merge existing articles before the query-to-page map (Phase 4) says to.
- Publish new articles that overlap existing ones before Phase 4.
- Rank attorneys publicly or build "best of" lists.
- Use long qualification forms.
- Invent testimonials, case studies, transaction results or analytics. Use only real, documented ones.
- Expand CPS beyond the six counties yet.
- Push CPS changes live without Lewis's OK.

## Data snapshot

IPD gets about 11× the search impressions of CPS, but CPS's queries are closer to the real-estate business. Google Search Console, June 16 – Sept 15, 2026:

| Site | Clicks | Impressions | CTR |
| --- | --- | --- | --- |
| IPD | 124 | 26,481 | ~0.47% |
| CPS | 18 | 2,445 | ~0.74% |

**Known leads to investigate first**

- CPS: "probate property sale chicago" shows 256 impressions at average position 1.0 with **zero clicks**.
- IPD: /resources/selling-inherited-property-illinois has 684 impressions, 1 click, average position ~51.
- IPD: the /blog page has 3,610 impressions, 1 click, position ~49.
- IPD already shows (mostly at positions 30–70, zero clicks) for queries like "sell inherited house chicago", "how to sell inherited property cook county" and "sell inherited house mchenry il".
- Most of IPD's actual clicks come from individual attorney pages ranking at positions 3–10.
- CPS has received zero leads from its own form; every lead to date came through IPD.

## Work plan

Eight phases, in order. Phase 0 changes nothing. It produces the findings every later phase relies on.

- [ ] **Phase 0 — Audit both sites (no changes)**
  - Read both codebases and the live sites. Check rendering, indexing, sitemaps, canonicals, schema, page speed, every form and CTA, and all links between IPD and CPS.
  - Explain the three underperformers in the Data snapshot and the position-1, zero-click CPS query. Flag factual inconsistencies too: the Kane County probate court is listed in St. Charles on one IPD page and Geneva on another.
  - **Done when:** a findings report labels every item as observed, inferred, or needs data from Andy, ranked by impact.
- [ ] **Phase 1 — IPD lead handling and forms**
  - Split the form into two paths: "contact this attorney" (sent to the attorney right away) and "help me find an attorney" (sent to Andy).
  - Add the four optional fields plus "Does the estate include real estate?"
  - Send each lead to the right place automatically, with clear confirmation messages.
  - Set up an internal attorney record: phone, email, referral preference, last verified, leads sent, outcomes.
  - **Done when:** a test lead on each path reaches the right person, and real-estate leads are flagged for Andy.
- [ ] **Phase 2 — IPD → CPS handoff**
  - Place a short, helpful "estate includes property?" block on county pages, relevant articles and the selling-inherited-property page. Keep attorney pages low-key.
  - Add tracked links between the two sites in both directions.
  - **Done when:** handoff clicks show up as their own event in GA4.
- [ ] **Phase 3 — CPS homepage and conversions** *(Lewis signs off)*
  - In the first screen: who you help, where, why a probate specialist instead of a regular Realtor, and the next step.
  - Two clear paths: "Free consultation" and "What's the property worth?" (valuation form with address).
  - A short "Is this you?" list: inherited a house, executor, out-of-state heir, sell as-is, don't know where to start.
  - Short, step-by-step consultation form: situation, property location, timeline, has an attorney yes/no.
  - Trust: licenses, HomeSmart, office address, the process, attorney coordination, and real case studies only.
  - **Done when:** both paths are live and tracked, and the homepage passes a mobile check.
- [ ] **Phase 4 — Query-to-page map and content cleanup**
  - Sort every meaningful query on both sites into intent groups: real-estate, probate + property, probate legal, attorney name, informational.
  - Assign each topic one owning page on one site. Then decide for overlapping articles: keep, strengthen, reposition, merge or redirect.
  - Fix titles and descriptions for the pages that get impressions but no clicks. Add one CPS inherited-property page per county (six total), each with real county details (court, timeline, local market) so none are near-duplicates.
  - **Done when:** the map is approved by Andy and the first fixes are shipped.
- [ ] **Phase 5 — Blog pipeline guardrails**
  - Feed the Phase 4 map into the IPD blog pipeline so it never creates a duplicate topic.
  - Add a review step that checks every probate-law statement against the Illinois Probate Act before publishing. Haiku keeps writing drafts.
  - **Done when:** a test run yields only new topics and flags any legal claim it can't verify.
- [ ] **Phase 6 — AI search visibility**
  - Make key pages easy for ChatGPT, Perplexity and Google AI Overviews to quote: direct answers near the top, FAQ blocks with schema, clear author and license details.
  - **Done when:** priority pages are updated and a list of test questions is saved for monthly checks.
- [ ] **Phase 7 — Measurement and weekly report**
  - One tracking sheet: lead → attorney → property opportunity → CPS → appointment → listing → closing.
  - Main number: qualified inherited-property opportunities per 1,000 relevant impressions.
  - A scheduled weekly Search Console review for both sites, sent as a short list of priorities.
  - **Done when:** the first weekly report arrives on its own.

**Later, not now:** attorney relationship tiers (A: known, B: received leads, C: not yet contacted) with pre-call briefs; Google Business Profile work for CPS; expansion beyond the six counties.

## What Andy provides, and open decisions

Phase 0 can start with only the two repos. The rest is needed by the phase shown.

| Item | Needed by |
| --- | --- |
| Access to the IPD and CPS repos in Claude Code | Phase 0 |
| Full GSC exports (queries and pages) for both sites, last 3 and 6 months | Phase 0 |
| GA4 access or exports, plus Clarity/Hotjar if installed | Phase 0 |
| Current attorney list with any known phone/email corrections | Phase 1 |
| Real case studies and specific testimonials (actual deals only) | Phase 3 |
| Lewis's review of CPS changes | Phase 3 |

**Open decisions**

- [ ] Where "help me find an attorney" leads go: Andy only, or a short list of Tier A attorneys.
- [ ] Whether to add a downloadable guide or email signup to CPS, or leave it for later.

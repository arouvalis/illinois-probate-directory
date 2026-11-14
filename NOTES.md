# NOTES — Phase 0 audit (IPD + CPS)

Session date: Nov 14, 2026. Nothing was changed in either codebase. No pull requests were opened.
The same file is saved in both repos.

## How to read this

Every finding carries one label:

- **Observed** — seen directly in the code, in a local production build of the code, or in your Search Console exports.
- **Inferred** — my explanation of an observed fact. Plausible, not proven.
- **Needs data** — cannot be settled without something from you.

**Live sites were not checked.** Both domains are blocked by this session's network policy (every request was refused before reaching the site). Everything below about rendering comes from the code and from local builds of both repos, which should match production but cannot show Vercel settings, redirects (www vs non-www), real response times, or what Google has actually indexed.

**Search Console data used:** the two zip exports in the repos. Both cover **Aug 11 – Nov 10, 2026** (web search, "last 3 months"). That is a different window from the brief's snapshot (Jun 16 – Sep 15), so numbers differ:

| Site | Clicks | Impressions | CTR | Brief's snapshot |
| --- | --- | --- | --- | --- |
| IPD | 174 | 28,841 | 0.60% | 124 / 26,481 |
| CPS | 11 | 2,667 | 0.41% | 18 / 2,445 |

The exports list queries and pages separately. They do not say which query led to which page, which limits how firmly the underperformers can be explained (see "Still needed").

---

## Findings, ranked by impact

### 1. IPD "Send This Attorney a Message" never reaches the attorney, but tells the visitor it did
- **Observed:** Every IPD form (attorney message, checklist, homepage match, for-families) sends one email to a single hard-coded address, Andy's Gmail (`src/lib/email.ts`). There is no attorney email in the data at all (`data/attorneys.json` has no email field).
- **Observed:** After submitting, the visitor sees: "**[Attorney name] has received your inquiry. Expect a response within 1–2 business days.**" (`AttorneyMessageForm.tsx`). That statement is not true today.
- **Observed:** The homepage form promises "We'll match you with qualified probate attorneys … shortly" and "Your info is never sold or shared", while its purpose is to pass the person to an attorney.
- **Observed:** The checklist form says "We'll email the Illinois Probate Checklist to [email] shortly." No code sends a checklist; it only notifies Andy.
- **Inferred:** This is the largest trust and liability risk on either site, and it is exactly what Phase 1 is meant to fix. Since most IPD clicks land on attorney pages, this is also where most leads start.
- **Needs data:** How leads have been forwarded by hand so far, and whether a checklist PDF exists and has been sent manually.

### 2. CPS has no analytics on its main pages
- **Observed:** The GA4 tag (`G-2M5SGHGTLN`) is loaded only inside the ad-funnel layout (`/probate-seller/*`, `/homer-glen-ad/*`). The homepage, all 14 blog posts, About, Process, Services and Contact load no analytics. Confirmed in the built HTML.
- **Observed:** The CPS form fires no conversion event anywhere. IPD does track `generate_lead` and `phone_click`.
- **Inferred:** "CPS has received zero leads from its own form" cannot currently be diagnosed, because nobody can see how many people viewed or started the form. Phase 2's "handoff clicks show up in GA4" cannot be met on the CPS side until this exists.

### 3. The only call-to-action on every CPS blog post is invisible
- **Observed:** The blog templates use colour classes (`bg-navy`, `text-navy`, `bg-gold`, `text-gold`) that do not exist in the CPS Tailwind config (only numbered shades such as `navy-900` are defined). In a local build, the closing box "Ready to Talk About Your Property? / Get a Free Consultation" renders as white text on a transparent background, with a white button label and no button colour. Measured in a browser: link colour `rgb(255,255,255)`, background transparent.
- **Observed:** That button links to `/#contact`, and no element with that id exists, so it lands at the top of the homepage.
- **Observed:** Blog posts account for 1,335 of CPS's 2,667 impressions and 4 of 11 clicks in the export.
- **Inferred:** A reader who finishes a CPS article sees no next step. This is a direct, cheap-to-fix cause of zero form leads.

### 4. The CPS lead form does not ask about the property
- **Observed:** `LeadCaptureForm` shows name, email and phone only. The heading says "Tell us about the property", and the code keeps a `message` value, but no message, address, timeline or situation field is shown.
- **Observed:** Submissions go only to Andy's Gmail. Lewis is not copied. The sender address is `noreply@illinoisprobatedirectory.com`, i.e. CPS mail is sent from the IPD domain.
- **Observed:** The CPS build fails outright when `RESEND_API_KEY` is missing, so production must have a key set.
- **Inferred:** The form probably works technically, but that is not proven. If the CPS key belongs to a Resend account where the IPD domain is not verified, every submission would fail with "Failed to send email."
- **Needs data:** One real test submission on the live CPS homepage and Contact page (I did not submit anything), and the Resend logs for CPS.

### 5. CPS testimonials and service claims need your confirmation
- **Observed:** The CPS homepage shows three five-star testimonials: "Matt S., Southwest Side", "Michael R., Oak Park", "Sarah J., Lincoln Park". There is no source, date or link for any of them.
- **Needs data:** Are these real, documented clients? The brief forbids invented testimonials. I have not judged them either way; this is yours to confirm. Until then they should be treated as unverified.
- **Observed:** Copy such as "Probate court coordination included", "Navigating probate court requirements is our specialty", and a testimonial saying "They handled all the probate paperwork" describes legal work, although the site also says it does not give legal advice.
- **Inferred:** For a real-estate broker this wording is a compliance risk and could put off the attorneys IPD depends on. Worth a look by Lewis and your managing broker.
- **Observed:** CPS says "Serving all of Chicagoland"; blog and CTA copy say "Chicago and Cook County". The brief sets the service area as six named counties. The six counties are not listed anywhere on the CPS homepage.

### 6. Links between the two sites are few, untracked, and one is a broken duplicate page
- **Observed — IPD → CPS (2 links in total):** one sidebar link on the Cook County page only ("Chicago Probate Real Estate Help"), and one link inside the blog post `chicago-probate-lawyer`. Neither has tracking parameters or a click event.
- **Observed:** Every "estate includes property?" prompt on IPD (homepage, attorney pages, county pages, articles, the selling-inherited-property guide, the inline prompt in the message form) leads to IPD's own `/for-families` page, not to CPS. `/for-families` names Andy and sends its form to Andy. So today IPD is quietly doing CPS's job itself.
- **Observed — CPS → IPD (4 links):** footer "Find a Probate Attorney", a homepage section, one blog post, and the canonical tag below. All point to the IPD homepage, untracked.
- **Observed:** CPS contains a byte-for-byte copy of IPD's `/resources/illinois-probate-timeline-by-county` page. Its canonical tag points to IPD, so Google is told to ignore it. Its six county links go to `/county/cook` etc., which return 404 on CPS (confirmed locally). It is not in the CPS sitemap or navigation.
- **Needs data (decision):** Phase 2 has to settle what `/for-families` becomes: a bridge to CPS, or a page that stays on IPD. The brief says a "yes" leads to CPS; the site currently does something else. I have not decided this.

### 7. The Data-snapshot underperformers, explained

**a. CPS "probate property sale chicago" — 266 impressions, position 1.9, zero clicks (export window)**
- **Observed:** It is the highest-impression CPS query and the only high-volume one near position 1. The next real-estate queries sit at positions 34–65. The export's "Search appearance" file is empty. Desktop makes up 1,981 of 2,667 CPS impressions at 0.25% CTR.
- **Observed:** The CPS homepage title is "Chicago Probate Specialist – Inherited Property Experts"; the page has no structured data, no business name/address markup, and no sitelinks-friendly markup.
- **Inferred, in order of likelihood:**
  1. The query reads like someone looking for probate properties **to buy** (listings), not a family selling one. A specialist's homepage does not answer that, so nobody clicks.
  2. Position 1 on a query this specific, with zero clicks across three months and across two different date windows, is typical of impressions that are not ordinary blue-link views: a Business Profile or local result showing the site link, or automated/rank-checking searches.
  3. A weak snippet. Less likely to explain a clean zero at position 1–2.
- **Needs data:** In Search Console, filter Performance to this exact query, then open the Pages, Countries, Devices and Dates tabs and export. That will show which URL appears, whether impressions come in bursts, and from where.

**b. IPD `/blog` — 3,634 impressions, 0 clicks, position 50**
- **Observed:** The blog index has no title or description of its own. It inherits the homepage's exact title and description and has no canonical tag. It is a bare list of 28 links whose text is generated from the file names ("Probate Attorney Schaumburg Illinois", "Cicero Probate Attorney" …), with no dates or summaries.
- **Observed:** Meanwhile the real homepage shows only 64 impressions (position 43) in three months.
- **Observed:** The top non-name IPD queries are "probate attorney [town]" terms at positions 30–75: cicero, hinsdale, rolling meadows, schaumburg, hoffman estates, joliet, naperville.
- **Inferred:** Google is treating `/blog` as a keyword-list page and showing it deep in results for dozens of "[town] probate attorney" searches where the matching article or city page should rank instead. It carries the homepage's title, so it also competes with the homepage. Impressions at position 50 are page five; zero clicks is expected there. This is an impression count that looks large and means little.
- **Needs data:** Query list filtered to the `/blog` page to confirm.

**c. IPD `/resources/selling-inherited-property-illinois` — now 1,209 impressions, 5 clicks, position 27.5**
- **Observed:** It has improved since the brief's snapshot (684 impressions, position 51). The git history shows five overlapping blog posts were merged into it with redirects on Sep 30.
- **Observed:** The page itself is in good shape: unique title and description, canonical, FAQ markup, ~24 KB of real content, dated September 2026.
- **Observed:** It has no author, no credentials, no Article markup, and no link to CPS. Its property CTA goes to `/for-families`.
- **Observed:** CPS has at least four pages aimed at the same searches: the homepage (H1 "Selling an Inherited Property in Chicago?"), `sell-inherited-house-chicago` (253 impr., pos. 18.7), `sell-inherited-property-chicago` (204 impr., pos. 32.9), `how-to-sell-a-house-in-probate-in-illinois` (167 impr., pos. 34.6).
- **Inferred:** Position 27 is mostly an authority problem on a young site against law firms and large publishers, made worse by the two sites splitting the topic. That is Phase 4's job (one owning page per topic); nothing should be merged before then.

**d. Real-estate queries on IPD at positions 30–70 with zero clicks**
- **Observed:** 76 real-estate-type queries, 745 impressions, 0 clicks in the IPD export. The same queries appear on CPS, also with 0 clicks:

| Query | IPD impr. / pos. | CPS impr. / pos. |
| --- | --- | --- |
| sell inherited house chicago | 43 / 26.8 | 118 / 52.3 |
| how to sell inherited property cook county | 49 / 19.4 | 43 / 13.2 |
| sell house in probate illinois | 43 / 40.0 | 41 / 53.3 |
| sell inherited house illinois | 54 / 20.2 | 14 / 11.4 |

- **Inferred:** Neither site is on page one for any of these, and they split the signal between them. No title rewrite fixes position 30+.

**e. Where IPD's clicks really come from**
- **Observed:** 152 of 174 clicks come from attorney profile pages; 23 of the 24 query-level clicks are searches for a specific attorney or firm name. Queries at positions 3–10 produced 17 clicks from 2,705 impressions; positions 20+ produced 1 click from 10,924 impressions.
- **Inferred:** IPD's visitors mostly arrive already knowing which attorney they want. That makes the attorney-page form (finding 1) the most important conversion point on either site.
- **Observed:** Several of the largest impression counts are noise: `/attorney/chicago-estate-lawyers-chicago` (1,592 impr., pos. 68, a firm whose name matches a generic search), and one 587-impression query that is a long chain of quoted name variants joined by "or" for a single attorney.
- **Inferred:** That 587-impression query is automated (a people-search or monitoring tool), not a person.

### 8. Factual inconsistencies

| Topic | What the sites say | Status |
| --- | --- | --- |
| **Kane County probate court** | **Geneva**, Kane County Courthouse, 100 S 3rd St: county page (3 places + FAQ markup), Aurora and Elgin city pages, Gilberts blog post. **St. Charles**, Kane County Judicial Center, 37W777 IL-38: `/resources/illinois-probate-courts-by-county`, and "Court located in St. Charles" on the timeline page (and on CPS's copy of it). | **Observed** conflict. A web check found several sources placing probate at the Geneva courthouse and the county listing the St. Charles Judicial Center as a separate building. **Inferred:** Geneva is correct for probate. I found no official court page stating it outright, so confirm with the Kane County Circuit Clerk before Phase 4 edits. |
| **Will County courthouse address** | "14 W Jefferson St, Joliet" on the county page, courts page and Joliet city page. | **Observed.** The Will County court's own locations page lists **100 W Jefferson St**. **Inferred:** all three IPD mentions are out of date. |
| **Small estate affidavit limit** | $150,000 (deaths on/after Aug 15, 2025) on the selling guide, courts page, Naperville guide. **$100,000** on `how-probate-works-illinois` (4 places incl. FAQ markup) and at least 6 blog posts, including the dedicated `small-estate-affidavit-illinois` post. | **Observed** conflict. Public Act 104-0346 raised it to $150,000 effective Aug 15, 2025, so the $100,000 pages are stale. |
| **How long probate takes** | County pages: "12 to 18 months" for a straightforward estate. Courts and timeline pages: "9–12 months". How-probate-works: "6 to 12 months". Blog: "6–9 months". | **Observed.** Four different answers to the same question, three of them in FAQ markup. **Needs data:** which figure you and an attorney are comfortable standing behind. |
| **Directory size** | Site and brief say **592** listings, 499 verified, 91 free consultations (hard-coded on IPD homepage, `llms.txt` "590+", CPS homepage "592 verified"). | **Observed:** `data/attorneys.json` holds **563** listings, **471** verified, **83** free consultation. Per county: Cook 236 (site says 240), Lake 69 (70), Kane 65 (65), McHenry 62 (70), Will 54 (59), DuPage 51 (55). CPS calls all 592 "verified". City counts in county copy are also off (Crystal Lake "30" vs 27, Joliet "26" vs 23). |
| **Listings outside the six counties** | 26 listings are tagged "Other Illinois" (Bloomington, O'Fallon, Edwardsville, Salem …). | **Observed.** They have no county page, and their markup says "Other Illinois County, Illinois". **Needs data:** keep or remove; the brief describes six counties only. |
| **Non-attorney listings** | "Will County Courthouse", "Lake County Bar Association", "Lake County Illinois Clerk of the Circuit Court" and a real-estate "transition specialist" have attorney profile pages. | **Observed.** The built page title reads "Will County Courthouse – Probate Attorney in Joliet, Illinois" with star-rating markup. The courthouse page drew 114 impressions. |
| **"Last updated" on IPD blog posts** | Taken from the file's modified time on the build machine. | **Observed** in code. **Inferred:** on Vercel every post shows the date of the latest deploy, not of the last edit. |
| **CPS reach** | "Serving all of Chicagoland" vs "Chicago and Cook County". | **Observed.** See finding 5. |

### 9. Indexing, sitemaps, canonicals, schema

**IPD**
- **Observed:** All pages are pre-built static HTML. Good for crawling.
- **Observed:** robots.txt allows everything and points to the sitemap. The sitemap has 614 URLs and matches the data exactly (563 attorneys, 28 posts + blog index, 10 city, 6 county, 4 resources, home, for-families). Modified dates come from a content-hash file, which is the right approach; 598 of 614 currently show September 2026.
- **Observed:** Canonical tags are present on every page type except `/blog`.
- **Observed:** Search Console shows 484 attorney URLs with impressions out of 563, so most are indexed. **Needs data:** the Pages (indexing) report for the true count and exclusion reasons.
- **Observed:** Structured data: Organization (site-wide), Attorney on profiles, FAQ on county, resource and some blog pages, CollectionPage on county pages. No breadcrumb, Article, author or website-search markup. No social-share (Open Graph) tags on either site.
- **Observed:** Attorney markup includes star ratings copied from Google Maps for hundreds of profiles. **Inferred:** Google's review-snippet rules do not allow ratings sourced from another site, so these will not earn stars and carry a small manual-action risk.
- **Observed:** Attorney meta descriptions are thin and sometimes wrong ("Will County Courthouse is a probate attorney in Joliet, Illinois."), often ending in stray spaces.
- **Observed:** No About, Contact, Privacy or Terms page on IPD, and no statement of who runs it except one sentence on `/for-families`. The forms collect personal data with no privacy policy. The footer omits the blog, two of four resource pages, city pages and for-families.
- **Observed:** Blog titles written about named individuals and firms (`michael-naughton-attorney`, `william-lee-attorney`, `meents-law-wilmington`), two posts for the same town (`probate-attorney-burr-ridge` and `-burr-ridge-illinois`), and one for a town outside the six counties (Nokomis). **Inferred:** AI-written articles about named attorneys are a reputational risk with the people you plan to phone. Under the brief nothing is removed before Phase 4; flagged for that map.
- **Observed:** The blog pipeline (`scripts/`) creates one post per Search Console query and only skips a topic when the exact file name already exists. That is how the near-duplicates arose. Relevant to Phase 5.

**CPS**
- **Observed:** No robots.txt exists (no robots file in the code; the build produces none). Crawlers get a 404, which is permitted, but the sitemap is not advertised.
- **Observed:** The sitemap lists 19 URLs. It omits `/blog`, `/homer-glen` and the timeline page, and stamps every URL with the time of the request, so "last modified" is always "now".
- **Observed:** Doubled site name in titles on the blog index, all 14 posts and `/homer-glen`: "… | Chicago Probate Specialist | Chicago Probate Specialist". Post titles run to roughly 125 characters.
- **Observed:** No blog post has its own meta description. All 14 fall back to the same site-wide sentence.
- **Observed:** No structured data anywhere on CPS: no business, agent, article or FAQ markup. No Search Console verification tag in the code (**needs data:** it may be verified by DNS).
- **Observed:** `/homer-glen` is an indexable page for a single property listing and `/homer-glen-ad` (an ad landing page) is not marked noindex, while its thank-you page is. **Needs data:** is that listing still active?
- **Inferred:** The doubled titles and missing descriptions help explain why CPS pages at positions 6–19 (`inherited-home-back-taxes-chicago` at 10.0, `heirs-disagree…` at 16.2, `sell-inherited-house-chicago` at 18.7) drew 0 clicks from 574 impressions.

### 10. Page-speed risks (from code and local builds; no live measurements)
- **Observed:** The IPD homepage HTML is **719 KB**. The full record of all 563 attorneys is embedded in the page to power the search box, although no attorney is shown until someone types.
- **Observed:** The Cook County page is **516 KB** with 277 links; each attorney is in the page twice (once displayed, once as search data). Kane is 179 KB.
- **Observed:** The homepage therefore contains no links to any attorney profile; profiles are reachable only through county and city pages.
- **Observed:** Each attorney page makes a server call on load (`/api/og-image`) that fetches the law firm's website to find an image, with a spinner while it waits (up to 6 seconds). That endpoint will fetch any address passed to it and has no restriction, which is a security and cost exposure.
- **Observed:** On a phone-sized screen the attorney-page message form starts about 1,350 px down (two screens), below the header card, description and contact details. On the CPS homepage the form starts about 900 px down, below the hero text.
- **Observed:** CPS ships about 20 MB of listing photos (up to 5.2 MB each) and a 1.7 MB portrait. They go through Next's image resizing where used, so the visitor impact is limited to the pages that use them.
- **Observed:** IPD runs Next.js 14.2.5; CPS runs 14.2.35. **Inferred:** IPD is behind on security patches.
- **Needs data:** PageSpeed Insights or Core Web Vitals for both sites; I could not run them.

### 11. Every form and CTA

**IPD**

| Form / CTA | Where | Required fields | Goes to | Notes (all observed) |
| --- | --- | --- | --- | --- |
| Send This Attorney a Message | every attorney page | name, email, **real estate? (required)** | Andy | False "attorney has received" confirmation (finding 1). Real-estate question is mandatory; the brief wants the named-attorney path to have no extra questions. A "Yes/Not sure" answer shows an amber prompt linking to `/for-families`. |
| Free Illinois Probate Checklist | every attorney page | name, email, real estate? | Andy | Nothing is delivered to the visitor. |
| Get Free Attorney Matches | homepage hero | name, email, county, real estate? | Andy | This is the existing "help me find an attorney" path. |
| Get Help With the Property Side | `/for-families` | name, email | Andy | Does not ask the real-estate question (implied). Only form with a "form started" event. |
| For-families banner + phone 872-240-2639 | homepage, every attorney page, every blog post, every city page | — | `/for-families` | A large amber block. On attorney pages this sits directly under the profile; the brief asks to "keep attorney pages low-key". |
| Phone links | site-wide | — | — | Tracked as `phone_click`. Attorney phone numbers and Andy's number fire the same event; they can be told apart only by the number. |
| `ContactForm.tsx` | not used anywhere | — | — | Dead code. |

- **Observed:** None of the four optional fields from the brief (property city/zip, probate stage, timeline, relationship) exists yet.
- **Observed:** No form on either site has spam protection, rate limiting or server-side validation beyond "name and email present". There is no auto-reply to the visitor on any form.
- **Observed:** Leads are not stored anywhere. If the email fails or is missed, the lead is gone. There is no attorney record of phone/email/preference/leads sent (a Phase 1 item).

**CPS**

| Form / CTA | Where | Goes to | Notes (all observed) |
| --- | --- | --- | --- |
| Lead form (name, email, phone) | homepage hero, Contact, About, Process, Services, `/homer-glen` | Andy only | No property or message field; no tracking (findings 2, 4). |
| Same form, redirect to thank-you | `/probate-seller/contact`, `/homer-glen-ad` | Andy only | These two funnels are the only pages with GA4. |
| "Get Free Consultation" buttons | homepage, etc. | `/contact` | Works. |
| Blog post CTA | all 14 posts | `/#contact` | Invisible and mis-targeted (finding 3). |
| Phone (872) 240-2639 | header button (desktop), inside the menu on mobile, footer | — | Not tracked. Same number as IPD's for-families line. No text/SMS option, though the brief lists "call/text". |
| Email info@chicagoprobatespecialist.com | footer, Contact | — | Not tracked. |

- **Observed:** There is no property-valuation (CMA) path on CPS at all. That is a Phase 3 item; noted so nobody assumes it exists.

---

## Questions where the sites and the brief pull in different directions

I have not decided any of these.

1. **Attorney ordering.** County and city pages sort listings by verification then Google rating, and say "Sorted by verification & rating". The brief says do not rank attorneys publicly. Is this sort acceptable, or should the order change (alphabetical, by town)?
2. **`/for-families`.** Keep it as IPD's own property page, or make it the bridge to CPS? (Finding 6.)
3. **CPS testimonials.** Real and documented, or to be removed? (Finding 5.)
4. **The 26 out-of-area listings and the four non-attorney listings.** Keep, fix or remove?
5. **The "592" figure.** The data says 563. Which is right — is there a newer list not in the repo?
6. **Mandatory real-estate question on the named-attorney form.** The brief says no extra questions on that path but also wants real-estate leads flagged. Optional question, or none?

---

## Top 5 fixes — Phase 1 (IPD lead handling and forms)

1. **Make the confirmation messages true.** The named-attorney form must either reach the attorney or say plainly what happens next. Same for the checklist promise and "never shared". (Finding 1.)
2. **Build the two separate paths** — "contact this attorney" and "help me find an attorney" — with their own routing, subject lines and confirmations. The homepage form is already the second path in practice.
3. **Create the internal attorney record** (phone, email, referral preference, last verified, leads sent, outcomes) and correct the data it sits on: remove or relabel the non-attorney listings, decide on the 26 out-of-area ones, and reconcile 563 vs 592.
4. **Store every lead and add basic protection.** Save leads somewhere durable, add spam protection and an auto-reply to the visitor, and flag "estate includes real estate = yes" for Andy.
5. **Add the four optional fields and settle the real-estate question** per path (optional on the named-attorney path, pending question 6), with a distinct GA4 event per path.

## Top 5 fixes — Phase 2 (IPD → CPS handoff)

1. **Put GA4 on every CPS page and track form submits, phone and email clicks.** Without it the handoff cannot be measured at the receiving end. (Finding 2. Needs Lewis's OK.)
2. **Repair the CPS landing experience the handoff will send people to:** the invisible blog CTA, the `/#contact` target, and a form that actually asks about the property. Otherwise IPD sends visitors into a dead end. (Findings 3, 4. Needs Lewis's OK.)
3. **Decide the role of `/for-families`, then place one short "estate includes property?" block** on county pages, relevant articles and the selling guide, with tracked links to CPS. Replace the large banner on attorney pages with something low-key.
4. **Track both directions as their own GA4 events** with consistent link tagging, and point CPS → IPD links at the relevant county page instead of only the homepage.
5. **Remove the cross-site confusion:** the duplicated timeline page on CPS with its six broken links, and the mismatched counts and court facts both sites repeat (Kane, Will, 592). The duplicate page is a redirect/removal, so confirm it against the brief's "no deletions before Phase 4" rule first — it is a copy, not an article, but that is your call.

---

## Still needed from Andy

**Search Console**
- Performance exports with **query and page together** for both sites, or at minimum: the query list filtered to IPD `/blog`, to IPD `/resources/selling-inherited-property-illinois`, and to the CPS homepage.
- For "probate property sale chicago" on CPS: the Pages, Countries, Devices and Dates tabs with that query filtered.
- A **6-month** export for both sites (the brief lists 3 and 6 months; only 3 months is in the repos), and one for the brief's exact window (Jun 16 – Sep 15) if you want the snapshot numbers reproduced.
- The **Pages (indexing) report** for both sites: indexed count and the "why pages aren't indexed" table.
- Confirmation of how CPS is verified in Search Console, and whether both sitemaps are submitted.

**Analytics**
- GA4 access or exports for IPD (`G-NKWRWZQDP9`): `generate_lead` by form name, `phone_click`, landing pages, last 3–6 months.
- GA4 for CPS (`G-2M5SGHGTLN`): expect it to cover only the two ad funnels.
- Clarity or Hotjar, if installed anywhere. Neither is in the code.

**Access and checks I could not do**
- Live-site access: allow `www.illinoisprobatedirectory.com` and `www.chicagoprobatespecialist.com` (and the non-www versions) in this environment's network settings, so the next session can check redirects, real page weight and what is actually deployed.
- One test submission on each live form, and the Resend logs for both projects (delivery failures, sending domain per project).
- Vercel environment-variable names for both projects (names only, no values).

**Facts and decisions**
- Answers to the six questions above.
- Source documentation for the three CPS testimonials.
- The current attorney list if it differs from `data/attorneys.json` (563), plus any known phone/email corrections.
- Whether the Homer Glen listing is still active.
- Confirmation of the Kane County probate location from the Circuit Clerk, and which "how long does probate take" figure to standardise on.
- Lewis's availability to review the CPS items in Phase 2 fixes 1, 2 and 5.

## Sources for the fact checks

- Kane County: https://www.illinoiscourts.gov/courts-directory/23/Kane-County-Courthouse/court/ · https://www.kanecountyil.gov/FDER/Pages/building-management.aspx · https://cic.countyofkane.org/Pages/Court-Forms.aspx
- Will County: https://willcountycourts.com/For-Citizens/Locations · https://www.circuitclerkofwillcounty.com/Public-Access/Court-Locations
- Small estate limit: https://www.ilga.gov/Legislation/PublicActs/View/104-0346 · https://www.faegredrinker.com/en/insights/publications/2025/9/illinois-amends-the-probate-act-with-key-changes-to-small-estate-affidavit

---

# NOTES — Phase 1 (IPD lead handling and forms)

Session date: Nov 14, 2026. IPD only. One pull request, not merged.

## What changed

**Lead routing** (`src/app/api/*`, `src/lib/leads.ts`, `src/lib/email.ts`)
- "Contact this attorney": if `data/attorney-records.json` has an email for the listing, the lead is emailed to the attorney with reply-to set to the visitor, and Andy gets a separate copy (`SENT TO ATTORNEY: ...`). If not, it goes to Andy with the subject `CALL THIS ATTORNEY: <name>, <phone>`.
- "Help me find an attorney" (homepage form) goes to Andy, subject `FIND ME AN ATTORNEY: ...`.
- Checklist form emails the checklist text (`src/lib/checklist.ts`) to the visitor, then notifies Andy.
- For-Families form goes to Andy and is always a property lead.
- `PROPERTY LEAD:` is prefixed to the subject when the visitor answers "Yes" to the real-estate question, and on every For-Families lead. "Not Sure" is shown in the body but not flagged. The flag is only ever on emails to Andy; an attorney never sees it (they do see the visitor's Yes/No answer in the message body).
- The confirmation a visitor sees is chosen from the server's answer, so it matches what happened.
- On the live site a missing `RESEND_API_KEY` is now an error shown to the visitor. Before, the form said "sent" and only logged.
- Added: hidden spam-trap field, server-side email check, length limits, 5-per-10-minutes limit per address (in memory, best effort).

**Forms**
- Real-estate question is optional everywhere. Four optional fields (property city or ZIP, stage of probate, timeline, relationship) sit behind an "Add details (optional)" toggle on all four forms.
- Dead `ContactForm.tsx` removed.

**Attorney record**: `data/attorney-records.json`, keyed by listing slug: email, phone_override, referral_preference, last_verified, leads_sent, outcomes, notes. Server-side only. Empty apart from an example. `leads_sent` and `outcomes` are filled in by hand: there is no database yet.

**Directory**
- Default order is alphabetical by name on county pages, city pages and homepage search. A "Sort by" control offers City and Google rating. The one listing marked Featured (Illinois Estate Law, a referral partner, not paid) is pinned first with its badge in every order.
- Removed 33 listings (563 → 530), archived in `data/removed-attorneys.json` with a reason, each old URL redirected:
  - 6 non-attorneys: Will County Courthouse, Lake County Bar Association, Lake County Illinois Clerk of the Circuit Court, Carl Guzzy Real Estate Transition and Estate Specialist, plus two the Phase 0 report missed: Cook County Probate Division and Will County Probation Department.
  - Probate Stoppers (Morton Grove): search results could not confirm it is a law firm.
  - 26 with offices outside the six counties (all the "Other Illinois" listings).
- All listing counts are calculated from the data: homepage, county cards, county page descriptions, city counts in county copy, `/llms.txt` (now generated).

## Phase 1 fact sources

Official pages could not be opened from this session (network policy), so these rest on search-engine results that quote the official pages. Worth one direct look by Andy.

| Fact | Now says | Source |
| --- | --- | --- |
| Will County courthouse | 100 W. Jefferson St., Joliet, IL 60432 | Will County Circuit Clerk, Court Locations: https://www.circuitclerkofwillcounty.com/Public-Access/Court-Locations · Illinois Courts directory: https://www.illinoiscourts.gov/courts-directory/110/Will-County-Courthouse/court/ |
| Small estate limit | $150,000 for deaths on or after Aug 15, 2025; $100,000 before; no real estate; Secretary of State-registered vehicles not counted | Public Act 104-0346: https://www.ilga.gov/Legislation/PublicActs/View/104-0346 · 755 ILCS 5/25-1: https://www.ilga.gov/Documents/legislation/ilcs/documents/075500050K25-1.htm |
| Timeline | "about 9 to 12 months" for a straightforward estate; six-month claims period is the minimum; contested or complex "12 to 24 months or longer" | 755 ILCS 5/18-3 (six-month claims period): https://www.ilga.gov/Documents/legislation/ilcs/documents/075500050K18-3.htm · ISBA guide ("at least nine months" for a straightforward estate): https://www.isba.org/public/guide/livingtrust · Illinois Legal Aid Online: https://www.illinoislegalaid.org/legal-information/probate |
| Kane County probate | Kane County Courthouse, 100 S. 3rd St., Geneva; Probate Administration, Room 112 | 16th Judicial Circuit contacts: https://www.illinois16thjudicialcircuit.org/pages/contacts.aspx · Court addresses: https://www.illinois16thjudicialcircuit.org/Pages/courtAddresses.aspx · Illinois Courts directory: https://www.illinoiscourts.gov/courts-directory/23/Kane-County-Courthouse/court/ |

The 9-to-12-month upper figure is the site's own estimate (it was already on the courts and timeline pages). No official source gives a typical upper bound. An attorney should confirm it.

## Open items for Andy

1. **Attorney emails.** None on file, so today every attorney lead takes the CALL THIS ATTORNEY path. Add emails to `data/attorney-records.json` as you collect them.
2. **Checked and kept as law firms** (from search results, Nov 14): The Probate Pro (Darren Findling Law Firm), My Estate Matters (attorney Cori Faye Brown), Earl Nelson Company Limited (attorney R. Gregory Earl).
3. Neighbouring-county firms stay removed (Andy's decision).
4. Lead tracking stays manual for now (Andy's decision).
5. **Lead storage.** Leads still live only in email. Storing them (and counting leads sent per attorney automatically) needs a database or sheet, which is a choice of service for Andy.
6. **Blog posts about removed firms** (`william-lee-attorney`, `estate-lawyer-nokomis-il`) are untouched, per the no-deletions-before-Phase-4 rule.
8. Homepage and For-Families confirmations promise a reply but no time limit. Only the attorney path promises "1 business day".

---

# NOTES — Phase 2 (IPD → CPS handoff, IPD side)

Session date: Nov 14, 2026. IPD only. One pull request, not merged. No form fields, lead routing or email changes.

## What changed

- **Menu:** the orange "Get Property Help" button is now a plain link, "Inherited Property", to `/for-families` (desktop and mobile).
- **`/for-families`:** rewritten as a short neutral explainer (who is responsible, vacancy, insurance, cleanout, selling and court approval), followed by a labeled section, "Real estate help: Chicago Probate Specialist", with a tracked link to CPS and the existing form. The page and the form both say requests go to Andy Rouvalis of Chicago Probate Specialist, a licensed Illinois real estate broker. Only the form's wording changed (heading, the line under it, the thank-you message).
- **One shared block**, "Does the estate include a house?" (`src/components/EstateHouseBlock.tsx`), links to `/for-families` and to CPS. It is on all 6 county pages, all 10 city pages, the selling guide and blog posts. It replaces the large amber "For Families" banner, which is deleted.
- **Attorney pages:** the banner is replaced by one small grey line linking to `/for-families`. No service list, no CPS link. The three blog posts about a named attorney or firm (`michael-naughton-attorney`, `william-lee-attorney`, `meents-law-wilmington`) get the same line instead of the block.
- **Homepage:** banner removed. The one line under the county search stays, reworded and in plain styling.
- **Older "we can help" wording removed** from the six county write-ups, three city guides and three blog posts, so each page has one property mention. The Cook County sidebar link to CPS and the inline CPS paragraph in `chicago-probate-lawyer` were removed for the same reason; the block on those pages links to CPS.

## Tracking

- GA4 (`G-NKWRWZQDP9`) loads from the site-wide layout. Checked in a production build: all 582 built pages contain the tag.
- Every CPS link is built by `cpsUrl()` in `src/lib/cps.ts`: `utm_source=illinoisprobatedirectory`, `utm_medium=referral`, `utm_campaign=ipd_handoff`, `utm_content=<placement>`. Placements: `county_cook` … `county_will`, `city_<town>`, `blog_<post-slug>`, `selling_guide`, `for_families`.
- GA4 events (sent by `src/components/HandoffClickTracker.tsx`, site-wide):
  - `cps_handoff_click` — any click on a link to CPS. Parameters: `placement`, `link_url`, `page_path`.
  - `inherited_property_click` — a click from a block or line to `/for-families`. Parameters: `placement`, `page_path`.
- Safety net: a CPS link added later without UTM tags (for example by the blog pipeline) gets them at click time with `utm_content=untagged_link`, and still fires the event.

## Open items for Andy

1. **GA4 setup (2 minutes, in GA4 Admin):** register `placement` as an event-scoped custom dimension, otherwise the event shows up but can't be broken down by page type. Optionally mark `cps_handoff_click` as a key event.
2. **The amber prompt inside the attorney message form** ("We can help with that too →", shown only after a visitor answers Yes or Not sure to the real-estate question) was left alone under the no-form-changes rule. It is a second property mention on attorney pages for those visitors. Say if it should be reworded or removed.
3. **"with HomeSmart Connect"** appears once on `/for-families`, taken from the brief, because Illinois broker advertising normally names the sponsoring brokerage. Confirm the exact brokerage name and whether your managing broker wants anything else shown (for example a license number).
4. **Explainer facts worth an attorney's glance:** independent administration generally allows a sale without prior court approval, supervised administration requires it; vacancy clauses in homeowner's policies "often 30 or 60 days". Both are written as general statements with "ask the attorney / ask the insurer".
5. **CPS side is still not measurable.** CPS has GA4 only on its ad funnels (Phase 0, finding 2), so arrivals from IPD will show as clicks in IPD's GA4 but not as sessions on CPS until CPS gets the tag. CPS → IPD tracked links are also still to do. Both need Lewis's OK.
6. The footer still has no link to `/for-families`; not in scope here.

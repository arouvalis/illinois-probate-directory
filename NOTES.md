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
- **One shared block**, "Does the estate include a house?" (`src/components/EstateHouseBlock.tsx`), links to `/for-families` and to CPS. It is on all 6 county pages, all 10 city pages, the selling guide and blog posts. On county and city pages it sits inside the attorney list, after the 9th listing (after the last one if a list or a search result has fewer than 9); the position is set by `INSERT_AFTER` in `src/components/AttorneyList.tsx`. It replaces the large amber "For Families" banner, which is deleted.
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

1. **GA4:** Andy is registering `placement` as an event-scoped custom dimension himself.
2. **Attorney message form prompt:** per Andy, the amber prompt is now a plain grey link, "Estate includes a house? See what to expect →", to `/for-families`. It still appears only after a Yes or Not sure answer. Wording and style only; it fires `inherited_property_click` with `placement=attorney_form`.
3. **HomeSmart Connect** confirmed correct by Andy.
4. **Explainer facts** (court approval of a sale; vacancy clauses "often 30 or 60 days"): Andy is having an attorney review them.
5. **CPS now has GA4 on every page** (Andy, CPS quick fixes), so arrivals from IPD are tracked there. Tracked CPS → IPD links were not checked from this repo.
6. The footer still has no link to `/for-families`; not in scope here.

---

# NOTES — Phase 4a (query-to-page map)

Session date: Nov 14, 2026. Both sites. **No code or content was changed.** This section is the only edit, and it is saved in both repos on branch `claude/jolly-allen-mkwgxz`. No pull request.

## What this is based on, and its limits

- The two Search Console exports in the repos (Aug 11 – Nov 10, 2026, web search): 1,000 IPD queries and 95 CPS queries, plus the page lists.
- **The query lists cover only part of the traffic.** IPD's listed queries add up to 14,554 of 28,841 impressions and 24 of 174 clicks. CPS's add up to 1,691 of 2,667 impressions and 1 of 11 clicks. Google hides the rest. The map below is built on the visible half.
- **The exports do not say which page showed for which query.** Where I name the page that currently ranks for a topic, that is inferred by comparing query totals with page totals. A query-and-page export would confirm it (see "Still needed").
- Live sites and most official sources are blocked from this session. County facts in section 5 are marked **confirmed** (already on the sites and checked in Phase 1, or found in search results quoting an official page) or **to verify**.
- Positions of 30 or worse are page three and beyond. A new title does not fix those; only a better or better-matched page does. I say which fixes are which.

---

## 1. Queries sorted by intent

Rules used, so the sort can be repeated:

- **Real-estate:** looking for a property professional or for probate properties (realtor, agent, specialist, expert, services, properties for sale, cash buyers).
- **Probate + property:** selling or dealing with an inherited or probate house (the how and the where), including "do I need probate to sell" and "probate real estate attorney".
- **Probate legal:** looking for an attorney by place or practice area, with no name.
- **Attorney name:** a named person or firm, including searches by phone number or address.
- **Informational:** how long, how much, court, clerk, case search, small estate, executor.

| Site | Group | Queries | Impressions | Clicks | Avg. position |
| --- | --- | --- | --- | --- | --- |
| IPD | Attorney name | 377 | 3,496 | 23 | 12.5 |
| IPD | Probate legal | 544 | 10,191 | 0 | 45.7 |
| IPD | Probate + property | 49 | 635 | 0 | 29.7 |
| IPD | Informational | 24 | 190 | 1 | 29.7 |
| IPD | Real-estate | 6 | 42 | 0 | 51.2 |
| CPS | Real-estate | 43 | 917 | 1 | 33.8 |
| CPS | Probate + property | 50 | 754 | 0 | 38.1 |
| CPS | Probate legal | 1 | 19 | 0 | 70.3 |
| CPS | Other (the single word "yes") | 1 | 1 | 0 | 3.0 |

What the sort shows:

1. **IPD's clicks are attorney-name searches and nothing else.** 23 of the 24 visible clicks. 2,687 of the 3,496 name impressions sit on page one.
2. **IPD's biggest group earns nothing.** "Probate attorney [place]" searches: 10,191 impressions, zero clicks, average position 46. This is where the content cleanup matters most.
3. **The two sites overlap almost only in "probate + property".** 32 queries appear on both sites (523 impressions on IPD, 802 on CPS), and 27 of them are "sell inherited / probate house" searches.
4. **CPS has no informational or legal footprint**, which is correct for its role.
5. **Noise to ignore:** about 450 IPD impressions are for places outside the six counties (Nokomis, Peoria, Clinton, Belleville, Ottawa, and towns in Texas, Florida and Canada). About 430 are legal searches IPD does not serve (family law and divorce in Tinley Park, disability, wrongful death). On CPS, 27 impressions are out-of-state "sell probate home [Texas/Florida town]". One 587-impression IPD query is an automated name search (Phase 0).

**Probate legal on IPD, by place** (the groups over 100 impressions):

| Place | Queries | Impressions | Avg. position | IPD listings in that town | Page that exists today |
| --- | --- | --- | --- | --- | --- |
| Chicago | 34 | 1,247 | 72 | 71 | blog post `chicago-probate-lawyer`, `/county/cook` |
| No place ("probate attorney", "probate lawyers") | 11 | 781 | 34 | — | homepage, plus 2 blog posts |
| Joliet | 17 | 697 | 36 | 21 | city page |
| Cicero | 3 | 564 | 39 | 1 | blog post |
| Naperville | 14 | 536 | 34 | 10 | city page |
| Hinsdale | 5 | 442 | 36 | 3 | blog post |
| DuPage County | 54 | 428 | 44 | 51 | county page, 1 blog post |
| "Near me" | 53 | 351 | 36 | — | homepage |
| Arlington Heights | 9 | 347 | 71 | 1 | blog post |
| Rolling Meadows | 4 | 323 | 35 | 2 | blog post |
| Downers Grove | 5 | 301 | 63 | 2 | none |
| South Barrington | 5 | 301 | 26 | 1 | `/city/barrington` nearby |
| Will County | 24 | 227 | 35 | 52 | county page |
| Cook County | 19 | 222 | 31 | 233 | county page |
| Tinley Park (mostly family law) | 17 | 196 | 73 | 9 | none |
| Lake County | 21 | 187 | 39 | 67 | county page, 1 blog post |
| Lake in the Hills | 18 | 187 | 27 | 3 | 2 blog posts |
| Hoffman Estates | 1 | 180 | 71 | 2 | none |
| Darien | 4 | 167 | 59 | 3 | none |
| Kane County | 15 | 163 | 24 | 65 | county page |
| Clarendon Hills | 6 | 159 | 51 | 0 | none |
| Schaumburg | 2 | 153 | 42 | 2 | blog post |
| La Grange | 17 | 143 | 50 | 2 | none |
| Lake Forest | 12 | 121 | 30 | 8 | none |
| Aurora | 2 | 112 | 34 | 12 | city page |
| Palatine | 7 | 112 | 28 | 3 | none |
| Western Springs | 2 | 109 | 68 | 1 | none |

**One finding from this table:** the town blog posts are not what Google shows. Hinsdale searches total 442 impressions, but the Hinsdale post has 1. Rolling Meadows searches total 323; the post has 4. The Schaumburg, Waukegan, Elgin and Arlington Heights posts do not appear in the page list at all. The `/blog` index page has 3,634 impressions at position 50. **Inferred:** the index page is collecting these searches in place of the posts, and several posts may not be indexed. The indexing report would settle it.

---

## 2. One owner per topic

### The dividing rules

1. **IPD owns "find an attorney" and "how probate works".** Every attorney-name, probate-legal and informational topic.
2. **CPS owns "sell or deal with the house" for any named place** (Chicago, a county, a town) and every search for an agent, realtor or specialist.
3. **IPD keeps exactly one property page with search ambitions:** the statewide legal-side guide, `/resources/selling-inherited-property-illinois`. It answers "can the executor sell, is probate needed, what documents" for Illinois as a whole and hands off to CPS. It is IPD's second-best page and already holds five merged posts, so moving it would throw that away.
4. **On IPD, "probate attorney [town]" belongs to a page with listings** (a city page, or the county page for small towns), never to a blog post. A person searching that wants a list of attorneys, and the blog posts are general essays.

### Topic map

| Topic (example queries) | Intent | Owner | Site | Pages that compete today |
| --- | --- | --- | --- | --- |
| A named attorney or firm | Name | that attorney's profile page | IPD | 3 blog posts about named attorneys (see section 3) |
| "probate attorney", "probate lawyers near me", "list of probate attorneys" | Legal | homepage | IPD | **`/blog` index (same title as the homepage)**, `blog/probate-lawyer`, `blog/list-of-probate-attorneys` |
| "probate attorney chicago", "chicago probate lawyer" | Legal | new `/city/chicago-probate-attorney` (71 listings) | IPD | `blog/chicago-probate-lawyer`, `/county/cook`, the profile of a firm named "Chicago Estate Lawyers" (1,592 impr., position 68) |
| "[county] probate attorney / estate planning attorney" ×6 | Legal | `/county/[county]` | IPD | `blog/dupage-county-wills-lawyer`, `blog/mchenry-county-lawyers-probate-estate` |
| "probate attorney [town]" where a city page exists (Joliet, Naperville, Aurora, Elgin, Palos Heights, Orland Park, Crystal Lake, Northbrook, Barrington, Libertyville) | Legal | `/city/[town]-probate-attorney` | IPD | **`blog/probate-attorney-elgin-illinois`**, **`blog/probate-attorney-palos-heights-illinois`**, `/blog` index |
| "probate attorney [town]" with a blog post only (Cicero, Hinsdale, Schaumburg, Rolling Meadows, Burr Ridge, Waukegan, Lake in the Hills) | Legal | a city page built from the post plus listings | IPD | **two Burr Ridge posts**, **two Lake in the Hills posts**, `/blog` index |
| South Barrington, Barrington Hills | Legal | `/city/barrington-probate-attorney` | IPD | none |
| Towns with no page (Downers Grove, Darien, Clarendon Hills, Western Springs, Westmont, Hoffman Estates, La Grange, Lake Forest, Palatine) | Legal | county page for now; candidates for city pages in Phase 5 | IPD | none |
| "how long does probate take in illinois" | Info | `/resources/illinois-probate-timeline-by-county` | IPD | `blog/how-long-does-probate-take-in-illinois`, `/resources/how-probate-works-illinois`, **CPS copy of the timeline page** |
| "how probate works", probate process | Info | `/resources/how-probate-works-illinois` | IPD | none |
| Probate courts, clerk, case search, filing fees | Info | `/resources/illinois-probate-courts-by-county` | IPD | county pages (fine: they link to it) |
| "lake county il probate" (the process in Lake County) | Info | `blog/lake-county-il-probate` (position 9.5) | IPD | `/county/lake` |
| Small estate affidavit | Info | `blog/small-estate-affidavit-illinois` | IPD | a section of how-probate-works |
| Cost of a probate attorney | Info | `blog/how-much-does-a-probate-attorney-cost-in-illinois` | IPD | none |
| "do I need a probate attorney" | Info | `blog/do-i-need-a-probate-attorney-in-illinois` | IPD | none |
| What assets go through probate | Info | `blog/what-assets-go-through-probate-in-illinois` | IPD | none |
| "sell inherited house illinois", "sell house in probate illinois", "do you need probate to sell a house illinois", "documents required for selling inherited property", "can heir property be sold", "probate real estate attorney illinois" | Probate + property | `/resources/selling-inherited-property-illinois` | IPD | **CPS `how-to-sell-a-house-in-probate-in-illinois`** (cross-site), IPD `/for-families` |
| What happens to the house before a sale (responsibility, vacancy, insurance) | Probate + property | `/for-families` (bridge page, not a search target) | IPD | the selling guide (low risk; keep the two distinct) |
| "sell inherited house chicago", "selling an inherited house in chicago", "sell a probate home chicago" | Probate + property | `blog/sell-inherited-house-chicago` | CPS | **CPS `sell-inherited-property-chicago`**, **CPS homepage** (its main heading is "Selling an Inherited Property in Chicago?"), IPD selling guide (cross-site) |
| "how to sell inherited house cook county", "sell inherited house [Cook suburb]" | Probate + property | new Cook County page | CPS | CPS Chicago posts, IPD selling guide (IPD shows at position 14–19 for these) |
| "sell inherited house mchenry il / crystal lake", DuPage, Kane, Lake, Will equivalents | Probate + property | new county page for each | CPS | IPD selling guide (IPD shows at position 19–33 for McHenry) |
| How long a probate house sale takes, step by step | Probate + property | `blog/illinois-probate-real-estate-timeline` | CPS | CPS `how-to-sell-a-house-in-probate-in-illinois`; IPD timeline page (different question, keep them distinct) |
| Heirs disagree about selling | Probate + property | `blog/heirs-disagree-selling-inherited-property-illinois` | CPS | a section of the IPD selling guide |
| Inherited house with a mortgage | Probate + property | `blog/inherited-property-with-mortgage-illinois` | CPS | none |
| Inherited house with back taxes | Probate + property | `blog/inherited-home-back-taxes-chicago` | CPS | none |
| Hoarder house | Probate + property | `blog/selling-hoarder-house-probate-chicago` | CPS | none |
| Inherited rental property | Probate + property | `blog/selling-rental-property-probate-illinois` | CPS | none |
| Inherited condo, 2027 Fannie Mae rule | Probate + property | `blog/fannie-mae-condo-reserve-rule-2027-chicago` | CPS | none |
| Evanston, Oak Park | Probate + property | the two town posts | CPS | none on CPS; "probate lawyer oak park" shows on both sites and belongs to IPD |
| "probate real estate agent", "probate realtor (near me)", "probate specialist", "chicago real estate probate expert" | Real-estate | homepage | CPS | **CPS `probate-real-estate-specialist-cook-county`**, About, Our Process, Services |
| "probate real estate services (illinois)" | Real-estate | `/probate-services` | CPS | homepage |
| "what does a probate real estate specialist do", "do I need one" | Real-estate | `blog/probate-real-estate-specialist-cook-county` (repositioned as the explainer) | CPS | homepage |
| "probate property sale chicago", "probate properties (for sale)", "homes in probate" | Real-estate (buyer) | homepage; **no page should chase this** | CPS | none. Buyer intent, zero clicks at position 1.9 (Phase 0). |

### Every competing case in one list

**Across the two sites**

1. **Selling an inherited house.** 27 shared queries. Largest: "sell inherited house chicago" (IPD 43 impr. at position 27, CPS 118 at 52), "how to sell inherited property cook county" (IPD 49 at 19, CPS 43 at 13), "sell house in probate illinois" (IPD 43 at 40, CPS 41 at 53), "sell inherited house illinois" (IPD 54 at 20, CPS 14 at 11). Fix: rule 2 and rule 3 above. The IPD guide stops naming Chicago and the counties as places it covers and links to the CPS local pages instead; CPS stops running a second statewide how-to.
2. **CPS still carries a copy of IPD's timeline page** at `/resources/illinois-probate-timeline-by-county`, with six dead county links. It tells Google to prefer IPD's version, so it earns nothing.
3. **The two timeline topics.** IPD answers "how long does probate take"; the CPS post answers "how long does selling the house take". The CPS title today reads as the first question.
4. **"probate lawyer oak park"** shows on both (IPD position 65, CPS 70). It is an attorney search: IPD's.
5. **"probate real estate services illinois"** shows on both (IPD position 62, CPS 7). CPS's.
6. **Heirs disagreeing.** CPS has the full article (244 impressions); the IPD guide has a section. Keep the section short and link to the CPS article.

**Inside IPD**

7. `/blog` index against the homepage, the city pages and its own posts (3,634 impressions, 0 clicks; the homepage has 64).
8. Two posts for Burr Ridge.
9. A city page and a blog post each for Elgin and for Palos Heights.
10. Two posts for Lake in the Hills (probate attorney, living trust attorney).
11. `blog/probate-lawyer` and `blog/list-of-probate-attorneys` against the homepage.
12. `blog/chicago-probate-lawyer` against `/county/cook`.
13. `blog/dupage-county-wills-lawyer` and `blog/mchenry-county-lawyers-probate-estate` against their county pages.
14. `blog/lake-county-il-probate` against `/county/lake` (solved by giving them different jobs, see below).
15. `blog/how-long-does-probate-take-in-illinois` against the timeline page, which already has "How Long Does Probate Take?" in its title.
16. Three posts about named attorneys against those attorneys' own profile pages.

**Inside CPS**

17. `sell-inherited-house-chicago` (253 impr., position 18.7) against `sell-inherited-property-chicago` (204 impr., position 32.9). Same steps, same audience.
18. The homepage against both of those (its main heading targets the same phrase).
19. `how-to-sell-a-house-in-probate-in-illinois` against `illinois-probate-real-estate-timeline`. Both are step-by-step sale walkthroughs.
20. `probate-real-estate-specialist-cook-county` against the homepage for "probate real estate specialist / agent".
21. About, Our Process and Services show identical numbers (27 impressions, position 10.59 each). **Inferred:** they appear together as sitelinks under the homepage for brand searches. Not a real conflict.

---

## 3. What to do with each article

Meanings: **Keep** = leave as is apart from title and description. **Strengthen** = same page and address, better content. **Reposition** = same page, aimed at a different question. **Merge** = move the useful parts into the owner page and redirect the old address. **Redirect** = no useful content to move; just point the address at the owner.

### IPD blog posts (28)

| Post | Impr. / position | Decision | Reason |
| --- | --- | --- | --- |
| `chicago-probate-lawyer` | 2 / 9 | **Reposition** into `/city/chicago-probate-attorney`, redirect the post | Chicago is the largest place group (1,247 impr.) and has 71 listings but no city page. At position 72 this is a long game. |
| `cicero-probate-attorney` | 84 / 23.7 | **Reposition** into a city page, redirect | 564 impressions of Cicero searches. Only 1 Cicero listing, so the city page should also show nearby attorneys (Berwyn, Oak Park, west-side Chicago), labelled as nearby. |
| `probate-attorney-hinsdale` | 1 / 3 | **Reposition** into a city page, redirect | 442 impr. of Hinsdale searches; the post gets none of them. 3 listings plus nearby. |
| `probate-attorney-schaumburg-illinois` | not shown | **Reposition** into a city page, redirect | 153 impr. of searches, post not showing at all. 2 listings plus nearby. |
| `probate-attorney-rolling-meadows-illinois` | 4 / 10 | **Reposition** into a city page, redirect | 323 impr. of searches. 2 listings plus nearby. |
| `probate-attorney-burr-ridge-illinois` | 20 / 8.2 | **Reposition** into one Burr Ridge city page, redirect | The better of the two (position 8). |
| `probate-attorney-burr-ridge` | not shown | **Merge** into the Burr Ridge city page | Duplicate town. |
| `probate-attorney-waukegan-illinois` | not shown | **Reposition** into a city page, redirect | Waukegan is the Lake County seat and court location; 3 listings. |
| `probate-attorney-lake-in-the-hills-il` | 3 / 35 | **Reposition** into one Lake in the Hills city page, redirect | 187 impr. of searches at position 27, the best-placed town group without a city page. |
| `living-trust-attorney-lake-in-the-hills` | 8 / 14 | **Merge** into the Lake in the Hills city page | Same town; trust searches are served by the same listings. |
| `probate-attorney-elgin-illinois` | not shown | **Merge** into `/city/elgin-probate-attorney` | City page already exists (14 listings). |
| `probate-attorney-palos-heights-illinois` | 11 / 9.4 | **Merge** into `/city/palos-heights-probate-attorney` | City page already exists (11 listings). The post ranks well, so move its local content across before redirecting. |
| `estate-law-arlington-heights-il` | not shown | **Redirect** to `/county/cook` | Searches are for estate planning, at position 71, with 1 listing. Not worth a page now. |
| `gilberts-wills-attorney` | 2 / 53 | **Redirect** to `/county/kane` | No listings in Gilberts. Already the target of two earlier redirects, so update those to point at the county page too. |
| `estate-lawyer-nokomis-il` | not shown | **Redirect** to the homepage | Outside the six counties. Phase 1 removed the out-of-area listings the same way. |
| `dupage-county-wills-lawyer` | 15 / 26.6 | **Merge** into `/county/dupage` | Competes with the county page. |
| `mchenry-county-lawyers-probate-estate` | 11 / 28.3 | **Merge** into `/county/mchenry` | Competes with the county page. |
| `lake-county-il-probate` | 55 / 9.5 | **Keep and strengthen** as the Lake County process guide | It ranks on page one. Give it a different job from the county page: how probate works in Lake County. It should link to `/county/lake` for attorneys, and the county page should link back. Do not redirect a page-one page into a page-three one. |
| `probate-lawyer` | 1 / 3 | **Redirect** to the homepage | Generic; the homepage is the directory. |
| `list-of-probate-attorneys` | 1 / 1 | **Redirect** to the homepage | Same. |
| `how-long-does-probate-take-in-illinois` | not shown | **Merge** into the timeline page | The timeline page owns this question (225 impr.). |
| `do-i-need-a-probate-attorney-in-illinois` | 4 / 25.8 | **Keep and strengthen** | Distinct question, natural lead-in to the directory. |
| `how-much-does-a-probate-attorney-cost-in-illinois` | 13 / 12.2 | **Keep and strengthen** | Distinct question, already near page one. |
| `small-estate-affidavit-illinois` | 10 / 38.3 | **Keep and strengthen** | Distinct, widely searched topic. Confirm the $150,000 figure reads cleanly throughout. |
| `what-assets-go-through-probate-in-illinois` | 23 / 13.9 | **Keep** | Distinct; already earned a click. |
| `michael-naughton-attorney` | 9 / 7.6 | **Redirect** to the attorney's profile | An AI-written essay about a named attorney is a risk with the people Andy plans to phone. Two listings carry the Naughton name (Manhattan and Crystal Lake); Andy to confirm which one the post means. |
| `meents-law-wilmington` | not shown | **Redirect** to `/attorney/meents-law-p-c-channahon` | Same reason. The profile exists. |
| `william-lee-attorney` | not shown | **Redirect** to the homepage | Same reason, and the firm's listing was removed in Phase 1 (outside the six counties). |

Result: the 28 posts become 5 articles (four kept as they are, plus the Lake County guide) and up to 8 new city pages (Chicago, Cicero, Hinsdale, Schaumburg, Rolling Meadows, Burr Ridge, Waukegan, Lake in the Hills). The other 15 are merged or redirected.

**A choice for Andy on the small towns.** City pages for towns with 1–3 listings only work if they also show nearby attorneys. If you would prefer not to build that, the alternative is to redirect Cicero, Hinsdale, Schaumburg and Rolling Meadows to their county pages. I recommend the city pages: these four towns account for 1,482 impressions and their searches sit at positions 35–42, closer to page one than most of IPD.

### IPD other pages

| Page | Impr. / clicks / position | Decision | Reason |
| --- | --- | --- | --- |
| `/blog` index | 3,634 / 0 / 50.4 | **Reposition** as a real guides hub | Give it its own title, description and canonical tag; list only the remaining articles with a one-line summary each. Today it carries the homepage's title and a list of keyword links. |
| Homepage | 64 / 1 / 43.0 | **Strengthen** | Should own "probate attorney / lawyers / near me" (1,100+ impr.). Link it to city and county pages in plain HTML; today it links to no attorney or city page. |
| `/resources/selling-inherited-property-illinois` | 1,209 / 5 / 27.5 | **Keep and strengthen**, narrow to statewide legal questions | Add author and credentials. Replace Chicago- and county-specific sections with links to the CPS local pages. |
| `/resources/illinois-probate-timeline-by-county` | 225 / 2 / 26.3 | **Keep and strengthen** | Takes in the blog post above. |
| `/resources/how-probate-works-illinois` | not shown | **Keep** | Owner of the process topic. Not showing in the export; check it is indexed. |
| `/resources/illinois-probate-courts-by-county` | not shown | **Keep** | Same check. Its description says "Updated June 2026". |
| `/for-families` | 17 / 0 / 28.4 | **Keep** as the bridge to CPS | Not a search target. |
| Six county pages | 4,673 / 10 / 24–35 | **Strengthen** | See titles in section 4. Each takes in any county blog post. |
| City pages for Elgin, Palos Heights | — | **Strengthen** | Each takes in a blog post. |

### CPS blog posts (14) and pages

| Page | Impr. / clicks / position | Decision | Reason |
| --- | --- | --- | --- |
| `sell-inherited-house-chicago` | 253 / 0 / 18.7 | **Keep and strengthen**; owner of the Chicago topic | The better-ranked of the two Chicago guides. |
| `sell-inherited-property-chicago` | 204 / 0 / 32.9 | **Merge** into `sell-inherited-house-chicago` | Same topic. Move across the unique parts (how the property was held, disclosure requirements) and redirect. |
| `how-to-sell-a-house-in-probate-in-illinois` | 167 / 1 / 34.6 | **Merge** into `illinois-probate-real-estate-timeline` | The statewide how-to belongs to the IPD guide. Its step-by-step content fits the CPS timeline post, which ranks better (16.5). |
| `illinois-probate-real-estate-timeline` | 69 / 1 / 16.5 | **Reposition** as "how long a probate house sale takes" | Takes in the how-to. Retitle so it does not read as "how long does probate take" (IPD's). |
| `heirs-disagree-selling-inherited-property-illinois` | 244 / 0 / 16.2 | **Keep and strengthen** | CPS's second-largest article and no competitor on either site. Needs a title and description that earn the click. |
| `inherited-property-with-mortgage-illinois` | 135 / 2 / 7.4 | **Keep** | CPS's best performer. Title and description only. |
| `inherited-home-back-taxes-chicago` | 77 / 0 / 10.0 | **Keep** | Revised recently with Chicago detail. Title and description only. |
| `selling-hoarder-house-probate-chicago` | 39 / 0 / 47.7 | **Keep** | Distinct topic, recently revised. |
| `selling-rental-property-probate-illinois` | not shown | **Keep** | Distinct topic. Check it is indexed. |
| `fannie-mae-condo-reserve-rule-2027-chicago` | 24 / 0 / 6.4 | **Keep** | Timely and distinct; position 6. |
| `sell-inherited-home-evanston` | 12 / 0 / 3.9 | **Keep and strengthen** | Position 3.9. Should become a child of the Cook County page. Thinnest of the town posts (799 words). |
| `probate-real-estate-agent-oak-park` | 46 / 0 / 37.1 | **Keep** | Recently revised with village detail. Child of the Cook County page. |
| `probate-real-estate-specialist-cook-county` | 53 / 0 / 44.9 | **Reposition** as the explainer "what a probate real estate specialist does, and when you need one" | Stops competing with the homepage for the hire-an-agent searches and with the new Cook County page for "cook county". |
| `selling-probate-home-what-attorneys-want-clients-to-know` | 12 / 0 / 15.6 | **Keep** | Distinct, and useful when talking to attorneys. |
| Homepage | 1,271 / 7 / 34.4 | **Strengthen**; owner of the agent, realtor and specialist searches | See title in section 4. The page title was deliberately left for Phase 4. |
| `/probate-services` | 27 / 0 / 10.6 | **Keep**; owner of "probate real estate services" | Title currently says "in Chicago" only. |
| `/blog` index | 276 / 0 / 52.7 | **Keep** | Fine after Phase 3 quick fixes. |
| `/resources/illinois-probate-timeline-by-county` | not shown | **Redirect** to the IPD page | It is a copy with dead links. Phase 0 left this for the map to decide. |
| `/homer-glen`, `/homer-glen-ad` | not shown | **Needs Andy** | Still open from Phase 0: is the listing active? If sold, remove both. |

All CPS changes need Lewis's OK.

---

## 4. Pages with impressions and almost no clicks: proposed titles and descriptions

Two groups. **Group A** pages already sit on or near page one (position 20 or better), so a better title and description can win clicks now. **Group B** pages sit at position 25 or worse; the new title helps Google match the page to the right search, but clicks will only follow when the position improves.

Titles are 60 characters or fewer before the site name. On CPS the site name adds 28 more, so for articles either drop it or accept that Google trims it. Counts in braces are filled in from the data, as the sites already do. Nothing below claims a ranking, a "best", or a result.

**Two site-wide causes sit behind most of the CPS rows:**

- No CPS blog post has its own description. All 14 show the same site-wide sentence.
- CPS post titles are the article heading plus the site name, about 100 characters, so Google cuts them off.

**And one behind the IPD blog rows:** the description is the first 155 characters of the article, which is usually a sentence about grief, not about the answer.

### Group A — can win clicks now

| Page | Impr. / clicks / position | Proposed title | Proposed description |
| --- | --- | --- | --- |
| CPS `blog/heirs-disagree-selling-inherited-property-illinois` | 244 / 0 / 16.2 | When Heirs Disagree on Selling an Inherited Illinois House | One heir wants to sell, another wants to keep the house. Who decides in Illinois, how a buyout or partition works, and who pays the bills meanwhile. |
| CPS `blog/sell-inherited-house-chicago` | 253 / 0 / 18.7 | Selling an Inherited House in Chicago: Steps and Costs | Who can sign, when probate is needed, Chicago transfer tax and water certification, and how to sell as-is or from out of state. From a local probate broker. |
| CPS `blog/inherited-home-back-taxes-chicago` | 77 / 0 / 10.0 | Inherited a Chicago House With Back Taxes? What to Do | How to find what is owed in Cook County, what a tax sale means, the redemption deadline, and how back taxes are usually paid off at closing. |
| CPS `blog/inherited-property-with-mortgage-illinois` | 135 / 2 / 7.4 | Inherited a House With a Mortgage in Illinois? Your Options | The mortgage does not disappear. Who makes payments during probate, when the lender can call the loan, reverse mortgages, and what happens at closing. |
| CPS `blog/illinois-probate-real-estate-timeline` | 69 / 1 / 16.5 | How Long Does a Probate House Sale Take in Illinois? | From opening the estate to closing day: each stage of selling a house in probate, how long it usually takes, and what causes delays. |
| CPS `blog/fannie-mae-condo-reserve-rule-2027-chicago` | 24 / 0 / 6.4 | Inherited a Chicago Condo? The 2027 Fannie Mae Reserve Rule | From January 4, 2027, lenders look harder at condo building reserves. What that means if you plan to sell an inherited condo, and what to request now. |
| CPS `blog/sell-inherited-home-evanston` | 12 / 0 / 3.9 | Selling an Inherited Home in Evanston, IL | Evanston's transfer tax, probate through Cook County, tenants in inherited two-flats, and how to price an estate home on the North Shore. |
| CPS `blog/selling-probate-home-what-attorneys-want-clients-to-know` | 12 / 0 / 15.6 | Selling a Probate Home: 7 Things Attorneys Want You to Know | When you can list, why price matters to an executor, title surprises, Cook County taxes, and how your agent and attorney should work together. |
| CPS `/probate-services` | 27 / 0 / 10.6 | Probate Real Estate Services in Six Illinois Counties | Probate property sales, executor support and as-is estate sales in Cook, DuPage, Kane, Lake, McHenry and Will counties. We work alongside your attorney. |
| CPS `/our-process` | 27 / 0 / 10.6 | How We Sell an Inherited Property, Step by Step | What happens after you call: a free consultation, a valuation, coordination with your attorney, as-is preparation, listing and closing. |
| CPS `/about` | 27 / 0 / 10.6 | About Andy Rouvalis and Lewis Kaplan | Licensed Illinois real estate brokers with HomeSmart Connect who work only on probate and inherited property in six Chicago-area counties. |
| IPD attorney profiles (template) — 19 profiles on page one with 0 clicks, 2,802 impr. in total | positions 5–12 | {Name}, {City}, IL: Phone, Reviews and Probate Practice | {Name} in {City}, Illinois: address, phone, office hours, Google rating and probate practice areas. {Free consultation offered.} Send a message from this page. |
| IPD `blog/lake-county-il-probate` | 55 / 0 / 9.5 | Lake County, IL Probate: Court, Steps and Timeline | Where to file in Waukegan, what the 19th Judicial Circuit expects, how long Lake County probate takes, and when a small estate affidavit is enough. |
| IPD Burr Ridge page (after the merge) | 20 / 0 / 8.2 | Probate Attorneys in Burr Ridge, IL | Burr Ridge straddles Cook and DuPage counties. See which court handles the estate and browse probate attorneys in and near Burr Ridge. |
| IPD `blog/how-much-does-a-probate-attorney-cost-in-illinois` | 13 / 0 / 12.2 | What Does a Probate Attorney Cost in Illinois? | Hourly, flat-fee and percentage billing explained, what Illinois courts consider reasonable, typical filing costs, and questions to ask before you hire. |
| IPD `blog/what-assets-go-through-probate-in-illinois` | 23 / 1 / 13.9 | What Goes Through Probate in Illinois, and What Doesn't | Houses, bank accounts, joint property, beneficiary accounts and trusts: which assets need probate in Illinois and which pass outside it. |

Note on the attorney template: people searching a name want to confirm they have found the right office. Today every profile is titled "{Name} – Probate Attorney in {City}, Illinois" and described as "{Name} is a probate attorney in…", even where the listing is a general-practice firm. The proposed version leads with what the page actually holds. The top earning profiles (Laird, Jelinek, Clark Hagerty) already get 3–7% click rates, so test this on the zero-click profiles first.

### Group B — fix the match now, clicks follow position

| Page | Impr. / clicks / position | Proposed title | Proposed description |
| --- | --- | --- | --- |
| IPD `/blog` | 3,634 / 0 / 50.4 | Illinois Probate Guides for Families and Executors | Plain-language guides to Illinois probate: timelines, costs, small estates, what goes through probate, and when you need an attorney. |
| IPD homepage | 64 / 1 / 43.0 | Find a Probate Attorney in Illinois: {N} Local Listings | Search {N} probate attorney listings in Cook, DuPage, Kane, Lake, McHenry and Will counties by town or name. Free to use, with guides to how probate works. |
| IPD `/county/cook` | 1,236 / 4 / 31.9 | Cook County Probate Attorneys: {N} Listings by Town | {N} probate attorney listings in Chicago and the Cook County suburbs, with phone numbers and ratings. Probate is filed at the Daley Center. |
| IPD `/county/dupage` | 914 / 1 / 34.9 | DuPage County Probate Attorneys: {N} Listings by Town | {N} probate attorney listings in Wheaton, Naperville, Oak Brook and nearby. Probate is filed at the DuPage County Courthouse in Wheaton. |
| IPD `/county/will` | 799 / 0 / 34.4 | Will County Probate Attorneys: {N} Listings by Town | {N} probate attorney listings in Joliet, Plainfield, Bolingbrook and nearby. Probate is filed at the Will County Courthouse in Joliet. |
| IPD `/county/mchenry` | 693 / 2 / 29.9 | McHenry County Probate Attorneys: {N} Listings by Town | {N} probate attorney listings in Crystal Lake, McHenry, Woodstock and nearby. Probate is filed at the courthouse in Woodstock. |
| IPD `/county/lake` | 530 / 3 / 31.5 | Lake County, IL Probate Attorneys: {N} Listings by Town | {N} probate attorney listings in Waukegan, Libertyville, Lake Forest and nearby. Probate is filed at the Lake County Courthouse in Waukegan. |
| IPD `/county/kane` | 501 / 0 / 23.7 | Kane County Probate Attorneys: {N} Listings by Town | {N} probate attorney listings in Geneva, St. Charles, Elgin, Aurora and nearby. Probate is filed at the Kane County Courthouse in Geneva. |
| IPD `/resources/selling-inherited-property-illinois` | 1,209 / 5 / 27.5 | Selling an Inherited House in Illinois: The Legal Steps | Can the executor sell? Is probate needed first? What documents does the title company want? The Illinois rules for selling an inherited house, in order. |
| IPD `/resources/illinois-probate-timeline-by-county` | 225 / 2 / 26.3 | How Long Does Probate Take in Illinois? Timeline by County | A straightforward Illinois estate takes about 9 to 12 months. See each stage, the six-month claims period, and notes for six Chicago-area counties. |
| IPD `/city/joliet-probate-attorney` | 138 / 0 / 23.2 | Joliet Probate Attorneys: {N} Local Listings | {N} probate attorney listings in Joliet, the Will County seat. Phone numbers, ratings, and how to file at the Will County Courthouse. |
| IPD `/city/naperville-probate-attorney` | 134 / 0 / 30.0 | Naperville Probate Attorneys: {N} Local Listings | {N} probate attorney listings in Naperville. The city spans DuPage and Will counties; see which courthouse handles the estate. |
| IPD Cicero city page (after repositioning) | 84 / 0 / 23.7 | Probate Attorneys Serving Cicero, IL | Probate attorneys in and near Cicero, with phone numbers and ratings. Cicero estates are filed with the Cook County court at the Daley Center. |
| CPS homepage | 1,271 / 7 / 34.4 | Probate Real Estate Agents in Chicago and Suburbs (full title, no site name added) | Probate real estate brokers for families and executors selling an inherited house in Cook, DuPage, Kane, Lake, McHenry or Will County. Free consultation. |
| CPS `/blog` | 276 / 0 / 52.7 | Inherited Property Guides for Illinois Families | Guides to selling an inherited or probate house in the Chicago area: back taxes, mortgages, heirs who disagree, condos, timelines and costs. |
| CPS `blog/probate-real-estate-specialist-cook-county` | 53 / 0 / 44.9 | What Does a Probate Real Estate Specialist Do? | What is different about a probate sale, what a specialist handles that a general agent may not, and the questions to ask before you hire one. |
| CPS `blog/probate-real-estate-agent-oak-park` | 46 / 0 / 37.1 | Selling a Probate Home in Oak Park: Taxes, Rules, Costs | Oak Park's $8 per $1,000 transfer tax, village closing requirements, historic districts, and what executors should budget for before listing. |
| CPS `blog/selling-hoarder-house-probate-chicago` | 39 / 0 / 47.7 | Selling a Hoarder House in Probate in Chicago | Secure it, assess before clearing, choose a cleanup plan, and price for the right buyers. Vacant-building rules and disclosures for executors. |

Why the CPS homepage title changes: the agent searches are CPS's largest winnable group (about 400 impressions: "probate real estate agent" 196, "probate realtor" 57, "probate realtor near me" 43, "probate real estate services" 37 and others) and they sit at positions 38–85. The current title, "Chicago Probate Specialist – Inherited Property Experts", contains none of the words "real estate", "agent" or "realtor". Use "Realtor" only if both brokers are members and the brokerage's rules for the term are met; otherwise "agent" and "broker".

**Left out on purpose:** `sell-inherited-property-chicago` and `how-to-sell-a-house-in-probate-in-illinois` (being merged), and IPD profiles whose impressions are noise (the firm named "Chicago Estate Lawyers" at position 68; one profile with 708 impressions from the automated name search).

---

## 5. Plan for the six CPS county pages

### Shared decisions

- **Address pattern:** `/inherited-property/cook-county`, `/inherited-property/dupage-county` and so on, with a short index at `/inherited-property`. Linked from the homepage "areas we serve" section and the footer.
- **Search each page is built for:** "sell inherited house [county] county" first, "probate real estate agent [county] county" second.
- **How they avoid being near-copies:** the statewide steps stay on one page each (the IPD legal guide and the CPS timeline post) and the county pages link to them. At least two-thirds of each county page is material that is true only of that county: court, towns, local taxes and stamps, housing stock, market figures.
- **Each page links to** the matching IPD county page for families who still need an attorney (tracked, as Phase 3 set up), and to any CPS town article inside that county.
- **Market figures** come from MRED or the Illinois REALTORS monthly county report at the time of writing, shown with the month and the source: median sale price, median days on market, months of supply. I have not put any numbers here because I could not open those sources and will not estimate them. No testimonials or case results unless they are real and documented.
- **Legal wording** follows the Phase 3 pattern ("your attorney will…", "we work alongside…"). An attorney should read the court paragraphs before publishing.

### Build order, from the evidence

| Order | County | Why |
| --- | --- | --- |
| 1 | Cook | CPS already shows at position 6 and 13 for "how to sell inherited house / property cook county" (100 impr.) with no dedicated page. Largest IPD county page (1,236 impr.). |
| 2 | McHenry | The only collar county with real search evidence: "sell inherited house mchenry il", "selling an inherited house in mchenry il", "sell inherited house crystal lake" (47 impr. on IPD at positions 19–33). |
| 3 | DuPage | Some evidence ("probate sale inherited house dupage county timeline", "probate real estate attorney dupage county"). Second-largest IPD county page (914 impr.). |
| 4 | Will | No sell-query evidence yet. IPD county page 799 impr. Andy has had a listing there (Homer Glen). |
| 5 | Lake | No sell-query evidence yet. IPD county page 530 impr. |
| 6 | Kane | No sell-query evidence yet. IPD county page 501 impr. |

For Will, Lake and Kane the pages are being built on the model in the brief, not on demand seen in the data. That is fine, but expect them to start slowly.

### Outline every page follows

1. **Direct answer** in the first two sentences: who can sell an inherited house in this county and where the estate is handled.
2. **The court** — name, address, room, how filing works, what the title company will ask for (Letters of Office).
3. **How long a sale takes here** — link to the CPS timeline post; county note on scheduling.
4. **Towns and which county handles them** — the split towns are a real source of confusion.
5. **Local costs at closing** — state and county transfer tax, municipal transfer stamps and inspections for the main towns, property-tax timing.
6. **What estate homes here are like** — housing stock and the issues that come with it.
7. **The market right now** — dated figures with source.
8. **How we help in this county** — as-is sales, out-of-state heirs, working with the attorney. Consultation and valuation forms.
9. **Need an attorney first?** — link to the IPD county page ({N} listings).
10. **Questions** — 4 or 5 county-specific questions with FAQ markup.

True in every county (confirmed, state law and state tax): the state transfer tax is $0.50 per $500 of price and the county tax is $0.25 per $500, both customarily paid by the seller. Under independent administration the executor can usually sell without a court order (755 ILCS 5/28-8); supervised administration needs court approval. A straightforward estate takes about 9 to 12 months, but the house can often be sold well before the estate closes. State these once per page, briefly.

### Cook County

- **Target:** "how to sell inherited house cook county"; "sell inherited house [Cook suburb]"; "probate real estate agent cook county".
- **Court (confirmed, on IPD):** Circuit Court of Cook County, Probate Division. Richard J. Daley Center, 50 W. Washington St., Chicago. Clerk's probate office in Room 1202; Probate Division on the 18th floor. Clerk (312) 603-6441. E-filing required; the original will is filed in person. All Cook County estates file downtown, including the suburbs.
- **Timeline note (on IPD, reasonable):** the largest probate docket in Illinois; court dates take longer to get than in the collar counties.
- **Local costs:**
  - Chicago transfer tax: $5.25 per $500 in total, of which the buyer pays $3.75 and the seller $1.50 (**confirmed**, City of Chicago).
  - Chicago Full Payment Certificate for water and sewer before closing (**confirmed**, already in two CPS articles).
  - Suburban transfer stamps: Oak Park $8 per $1,000, seller; Evanston $5 per $1,000, seller (both already on CPS, revised by Andy). Others **to verify** from the title company list: Cicero, Berwyn, Oak Lawn, Calumet City, Skokie, Park Ridge, Des Plaines, Schaumburg, Hoffman Estates, Rolling Meadows.
  - Point-of-sale inspections in some south and west suburbs, for example Calumet City (**to verify**, town by town).
  - Property taxes: paid a year behind; first instalment is 55% of the prior year's bill, normally due about March 1; the second has been late two years running, with the 2025 bill due October 1, 2026 (**confirmed**, already on CPS; re-check each year).
  - Annual tax sale and redemption rules: link to the back-taxes article.
- **Housing stock (Andy to confirm from experience):** Chicago bungalows, two- to four-flats with tenants, condos (link to the Fannie Mae article), vacant-building registration in the city (link to the hoarder article).
- **Sub-areas worth a short section each:** Chicago; north suburbs; northwest suburbs (the export shows "probate real estate agent arlington heights / mount prospect / palatine"); south and southwest suburbs ("sell inherited house calumet city", "sell inherited property chicago south side").
- **Child pages:** Chicago guide, Evanston, Oak Park.
- **Attorney link:** IPD `/county/cook` (233 listings).

### McHenry County

- **Target:** "sell inherited house mchenry il"; "sell inherited house crystal lake"; "probate real estate agent mchenry county".
- **Court (on IPD; room details to verify with the clerk):** 22nd Judicial Circuit. McHenry County Courthouse, 2200 N. Seminary Ave., Woodstock. Clerk in Room 136, (815) 334-4190. IPD says probate hearings are at 9:30 AM in Courtroom 202. E-filing required; original will filed in person.
- **Timeline note:** lighter docket than Cook, so court dates come sooner (on IPD).
- **Towns:** Crystal Lake, McHenry, Woodstock, Algonquin, Lake in the Hills, Huntley, Cary, Harvard, Marengo. Split towns to explain: Algonquin and Huntley reach into Kane County; Barrington Hills and Fox River Grove touch Lake and Cook.
- **Local costs:** municipal transfer stamps **to verify** (Woodstock and Harvard are the ones to check). Collar-county property taxes come in two instalments, typically early June and early September (**to verify** for 2027 with the McHenry County Treasurer).
- **Housing stock (Andy to confirm):** many homes outside town limits are on private well and septic, which buyers' lenders often want tested; lake and river cottages around the Chain O'Lakes and Fox River, some in flood zones; acreage and farm parcels in the west of the county; large age-restricted communities in Huntley, where estate sales are common.
- **Attorney link:** IPD `/county/mchenry` (62 listings).

### DuPage County

- **Target:** "sell inherited house dupage county"; "probate sale inherited house dupage county timeline"; "probate real estate agent naperville / wheaton".
- **Court (on IPD; phone and floor to verify):** 18th Judicial Circuit. DuPage County Courthouse, 505 N. County Farm Rd., Wheaton. Circuit Clerk (630) 407-8700. E-filing required.
- **Timeline note:** generally efficient scheduling (on IPD). The county question in the export is specifically about timeline, so answer it near the top.
- **Towns:** Wheaton, Naperville, Downers Grove, Elmhurst, Lombard, Glen Ellyn, Hinsdale, Oak Brook, Addison, Carol Stream, Woodridge. Split towns: Naperville (DuPage and Will), Aurora (mostly Kane), Burr Ridge and Hinsdale (DuPage and Cook), Bolingbrook and Woodridge (DuPage and Will). The estate is handled in the county where the person lived, wherever the house is.
- **Local costs (from search results quoting Illinois REALTORS and village pages; to verify against the July 2026 title list):** Naperville $3 per $1,000, buyer; Glen Ellyn $3 per $1,000, seller; Carol Stream $3 per $1,000, seller; Woodridge $2.50 per $1,000, seller; Addison $2.50 per $1,000, buyer (least certain). Property taxes: two instalments, June 1 and September 1 in 2026 (**confirmed** from search results quoting the county).
- **Housing stock (Andy to confirm):** post-war ranches and split-levels that are often original inside; teardown demand in Hinsdale, Clarendon Hills, Elmhurst and parts of Downers Grove, which changes how an as-is estate home is priced and marketed.
- **Attorney link:** IPD `/county/dupage` (51 listings).

### Will County

- **Target:** "sell inherited house will county il"; "sell inherited house joliet"; "probate real estate agent joliet / plainfield".
- **Court (confirmed in Phase 1):** 12th Judicial Circuit. Will County Courthouse, 100 W. Jefferson St., Joliet. Circuit Clerk (815) 727-8592. E-filing required. The courthouse is the newer building; older pages around the web still give 14 W. Jefferson.
- **Towns:** Joliet, Plainfield, Bolingbrook, Romeoville, Lockport, New Lenox, Mokena, Frankfort, Homer Glen, Channahon. Split towns: Naperville and Bolingbrook (with DuPage), Aurora (a small part), Tinley Park and Orland Park (mostly Cook), Plainfield (a part in Kendall County, which CPS does not cover).
- **Local costs:** Bolingbrook $7.50 per $1,000, split equally between buyer and seller (from a title company list in search results; **to verify**). Joliet requires a city transfer stamp, rate **to verify** on the city's page; exempt transfers still need a stamp. Romeoville, Channahon and Peotone **to verify**. Two tax instalments, typically June and September (**to verify**).
- **Housing stock (Andy to confirm):** older homes on Joliet's east and west sides; 1990s–2000s subdivisions with homeowner associations in Plainfield, Bolingbrook and Romeoville, where an association payoff letter is needed at closing; acreage and horse properties in Homer Glen and the south of the county.
- **Attorney link:** IPD `/county/will` (52 listings).

### Lake County

- **Target:** "sell inherited house lake county il"; "sell inherited house waukegan / libertyville"; "probate real estate agent lake county il".
- **Court (on IPD; phone and floor to verify):** 19th Judicial Circuit. Lake County Courthouse, 18 N. County St., Waukegan. Circuit Clerk (847) 377-3380. The circuit publishes a probate handbook for executors (on IPD; link to it once verified). E-filing required.
- **Towns:** Waukegan, Gurnee, Libertyville, Mundelein, Vernon Hills, Lake Forest, Highland Park, Deerfield, Lake Zurich, Antioch, Zion. Split towns: Barrington, Buffalo Grove and Deerfield (with Cook).
- **Local costs:** Highland Park $5 per $1,000, seller (from a 2018 list; **to verify**). Lake Forest, Buffalo Grove, North Chicago, Mundelein and Lincolnshire **to verify**. Search results suggest Waukegan has no city transfer tax (**to verify**). Two tax instalments, typically early June and early September (**to verify**).
- **Housing stock (Andy to confirm):** a very wide price range in one county, from North Shore estates in Lake Forest and Highland Park to modest older homes in Waukegan, North Chicago and Zion; lake cottages and well-and-septic homes in the northwest (Antioch, Fox Lake, the Chain O'Lakes). One page has to speak to both ends.
- **Attorney link:** IPD `/county/lake` (67 listings).

### Kane County

- **Target:** "sell inherited house kane county il"; "sell inherited house aurora / elgin"; "probate real estate agent st charles / geneva".
- **Court (confirmed in Phase 1):** 16th Judicial Circuit. Kane County Courthouse, 100 S. 3rd St., Geneva; Probate Administration, Room 112; (630) 232-3413. The Kane County Judicial Center on Route 38 in St. Charles is a different building and does not handle probate. Say so plainly; the two were mixed up on IPD itself.
- **Towns:** Aurora, Elgin, St. Charles, Geneva, Batavia, Carpentersville, South Elgin, Elburn. Split towns: Aurora (Kane, DuPage, Will and Kendall), Elgin (Kane and Cook), Algonquin and Huntley (with McHenry).
- **Local costs:** Aurora charges a city transfer tax on the full sale price (**confirmed** that the tax exists; rate **to verify** on the city's page). Elgin and Carpentersville requirements **to verify**. Two tax instalments, June 1 and September 1 in 2026 (**confirmed** from the Kane County Treasurer's release).
- **Housing stock (Andy to confirm):** older housing in central Aurora and Elgin, including two-flats; historic districts in Elgin, St. Charles and Geneva; newer subdivisions west of Randall Road; farm parcels in the west of the county.
- **Attorney link:** IPD `/county/kane` (65 listings).

### One source to settle the local taxes

Chicago Title publishes a transfer tax list for the Chicago area, most recently dated July 1, 2026. It gives the rate, who pays, and where to get the stamp for every municipality. It could not be opened from this session. Andy's title contact can send it; every "to verify" tax above can be checked against it in a few minutes.

---

## Top 10 actions, ranked by impact

Impact means qualified inherited-property opportunities, not traffic.

1. **Build the CPS Cook County page and settle the Chicago pages.** Merge `sell-inherited-property-chicago` into `sell-inherited-house-chicago`. CPS is already at positions 6–19 for these searches with no page aimed at them. *(Lewis)*
2. **Give every CPS article its own title and description.** None has a description today, and titles run to about 100 characters. Pages at position 20 or better drew 3 clicks from about 900 impressions. *(Lewis)*
3. **Retitle the CPS homepage for the agent searches** ("probate real estate agent", "probate realtor"), about 400 impressions with no page aimed at them. *(Lewis)*
4. **Fix the IPD `/blog` index.** Own title, description and canonical tag. It holds 3,634 impressions under the homepage's title while the homepage holds 64.
5. **Turn IPD's town blog posts into city pages with listings**, and clear the duplicate pairs (Burr Ridge, Elgin, Palos Heights, Lake in the Hills). This is the 10,191-impression, zero-click group.
6. **Change the IPD attorney-profile title and description template.** Profiles are the only pages that earn clicks; 19 sit on page one with none.
7. **Draw the line on "selling an inherited house".** The IPD guide keeps the statewide legal questions and links out; CPS keeps every local page. Merge the CPS statewide how-to into the CPS timeline post and retitle it.
8. **Build the McHenry and DuPage county pages next**, then Will, Lake and Kane.
9. **Redirect the IPD posts that carry risk or no value:** three about named attorneys, one outside the six counties, two generic ("probate lawyer", "list of probate attorneys"), and the county and timeline duplicates.
10. **Remove CPS's copy of the IPD timeline page** (redirect to IPD) and retitle the six IPD county pages and the selling guide.

After approval, this map is what Phase 5 feeds to the blog pipeline: a new post is allowed only if its topic has no owner in section 2.

## Decisions needed from Andy

1. Small towns on IPD: city pages that include nearby attorneys (recommended), or redirect those posts to the county page?
2. A Chicago city page on IPD: build it, or let `/county/cook` own Chicago?
3. Which Naughton listing the `michael-naughton-attorney` post should redirect to.
4. Whether the CPS homepage title may say "Realtor", or should say "agent" and "broker".
5. The address pattern for the county pages (`/inherited-property/cook-county`).
6. Whether the Homer Glen listing pages can go.

## Still needed

- **Search Console, query and page together**, for both sites. At minimum the queries for IPD `/blog`, the six county pages and the selling guide, and for the CPS homepage. This confirms which page shows for which search before anything is redirected.
- **The Pages (indexing) report** for both sites. I suspect several IPD town posts and two IPD resource pages are not indexed.
- **The Chicago Title transfer tax list** (July 1, 2026).
- **Current county market figures** from MRED or Illinois REALTORS when each county page is written.
- **An attorney's read** of the court paragraphs for the six county pages.
- **Lewis's OK** for every CPS item.

## Sources for the new facts in this section

- Chicago transfer tax: https://chicago.gov/city/en/depts/fin/supp_info/revenue/tax_list/real_property_transfertax.html
- State and county transfer tax: https://tax.illinois.gov/research/taxinformation/property/realestate.html
- Independent administration and sale of real estate, 755 ILCS 5/28-8: https://ilga.gov/legislation/ilcs/documents/075500050K28-8.htm
- Kane County 2026 tax dates: https://www.kanecountyil.gov/Documents/Press%20Releases/Kane%20County%20Property%20Tax%20Bills%20for%202026%20-%20Key%20Dates%20and%20Details.pdf
- Cook County second instalment delay: https://news.wttw.com/2026/06/09/second-installment-2025-cook-county-property-tax-bills-will-be-2-months-late-officials
- Carol Stream transfer tax: https://carolstream.org/departments/finance/local-taxes/real-estate-transfer-tax
- Aurora transfer tax: https://www.aurora.il.us/Government-and-Engagement/Finance/Revenue-Collection/Real-Estate-Transfer-Tax
- Joliet transfer stamp: https://joliet.gov/government/departments/customer-service/real-estate-transfer
- Highland Park transfer tax: https://cityhpil.com/government/city_departments/finance/real_estate_transfer_tax.php
- Municipal transfer tax lists (not opened; quoted in search results): https://www.illinoisrealtors.org/wp-content/uploads/2024/01/TransferTax_OneSheet_JAN2024.pdf · https://cmetro.ctic.com/CTRSCMetro/media/CT-RS-CMetro/Transfer-Tax-List-July-1,-2026.pdf

These came from search results that quote the pages; the pages themselves could not be opened from this session. Court addresses and phone numbers are as already published on IPD.

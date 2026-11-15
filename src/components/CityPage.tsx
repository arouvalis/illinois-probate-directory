import Link from "next/link";
import AttorneyList from "@/components/AttorneyList";
import AttorneySearch from "@/components/AttorneySearch";
import EstateHouseBlock from "@/components/EstateHouseBlock";
import { getCityGuideHtml } from "@/lib/cityGuide";
import { COURTS, getCityListings, joinList, type CityPageConfig } from "@/lib/cityPages";

const SITE = "https://www.illinoisprobatedirectory.com";

const ALL_COUNTIES = ["Cook", "DuPage", "Kane", "Lake", "McHenry", "Will"];

// A city page: the town's own listings, then (for small towns) a separately
// labelled list of attorneys in neighboring towns, then the local guide from
// src/content/city/<slug>.md. Each page's settings live in its own page.tsx.
export default function CityPage({ config }: { config: CityPageConfig }) {
  const { local, nearby, nearbyTowns } = getCityListings(config);
  const guideHtml = getCityGuideHtml(config.slug);
  const courts = config.counties.map((c) => COURTS[c]);
  const main = courts[0];
  const placement = `city_${config.slug.replace(/-probate-attorney$/, "").replace(/-/g, "_")}`;
  const block = <EstateHouseBlock placement={placement} />;
  const listingWord = (n: number) => (n === 1 ? "Listing" : "Listings");
  const verified = local.filter((a) => a.probate_verified === "YES").length;
  const freeConsult = local.filter((a) => a.free_consultation === "YES").length;
  const otherCounties = ALL_COUNTIES.filter((c) => !config.counties.includes(c));

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Probate Attorneys in ${config.city}, Illinois`,
      url: `${SITE}/city/${config.slug}`,
      about: { "@type": "City", name: `${config.city}, Illinois` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: `${main.county} County`, item: `${SITE}/county/${main.countySlug}` },
        { "@type": "ListItem", position: 3, name: config.city, item: `${SITE}/city/${config.slug}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="bg-gradient-to-r from-navy-800 to-navy-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/county/${main.countySlug}`} className="hover:text-white transition-colors">
              {main.county} County
            </Link>
            <span>/</span>
            <span>{config.city}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
            Probate Attorneys in {config.city}, Illinois
          </h1>
          <p className="text-gray-200 max-w-2xl leading-relaxed">{config.intro}</p>
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div>
              <span className="text-2xl font-bold">{local.length}</span>
              <span className="text-gray-300 ml-1.5">{listingWord(local.length)} in {config.city}</span>
            </div>
            {nearby.length > 0 ? (
              <div>
                <span className="text-2xl font-bold">{nearby.length}</span>
                <span className="text-gray-300 ml-1.5">Nearby {listingWord(nearby.length)}</span>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-2xl font-bold">{verified}</span>
                  <span className="text-gray-300 ml-1.5">Probate Verified</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">{freeConsult}</span>
                  <span className="text-gray-300 ml-1.5">Free Consultations</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            {config.searchable ? (
              <AttorneySearch
                attorneys={local}
                totalCount={local.length}
                placeholder="Search by name or firm…"
                insert={block}
              />
            ) : local.length > 0 ? (
              <AttorneyList
                attorneys={local}
                heading={`${local.length} Probate Attorney ${listingWord(local.length)} in ${config.city}`}
                gridClassName="space-y-4"
                insert={block}
              />
            ) : (
              block
            )}

            {nearby.length > 0 && (
              <section className="mt-12 pt-10 border-t border-gray-200" aria-label={`Attorneys near ${config.city}`}>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  The offices below are <strong>not in {config.city}</strong>. They are in{" "}
                  {joinList(nearbyTowns)}, the neighboring towns. Each card shows the office&apos;s
                  town. An Illinois attorney can handle an estate in any county, so a nearby office
                  can file a {config.city} estate.
                </p>
                <AttorneyList
                  attorneys={nearby}
                  heading={`Nearby: ${nearby.length} ${listingWord(nearby.length)} in Neighboring Towns`}
                  gridClassName="space-y-4"
                />
              </section>
            )}

            {guideHtml && (
              <article
                className="prose prose-lg max-w-none mt-12 pt-10 border-t border-gray-200 prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-gold-600"
                dangerouslySetInnerHTML={{ __html: guideHtml }}
              />
            )}
          </div>

          <aside className="lg:w-64 shrink-0 space-y-6">
            {courts.map((court) => (
              <div key={court.county} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-serif font-bold text-navy-800 mb-3">{court.county} County Probate Court</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  {court.building}<br />
                  {court.street}<br />
                  {court.cityLine}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {courts.length > 1
                    ? `For ${config.city} residents who lived on the ${court.county} County side.`
                    : `All ${court.county} County probate cases are filed here, including estates from ${config.city}.`}
                </p>
                <Link
                  href={`/county/${court.countySlug}`}
                  className="inline-block mt-3 text-sm text-navy-700 font-semibold hover:underline"
                >
                  All {court.county} County listings →
                </Link>
              </div>
            ))}

            {config.seeAlso && config.seeAlso.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-serif font-bold text-navy-800 mb-4">Nearby Town Pages</h3>
                <ul className="space-y-2">
                  {config.seeAlso.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-navy-700 hover:text-navy-900 hover:underline">
                        {l.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="font-serif font-bold text-navy-800 mb-4">Other Counties</h3>
              <ul className="space-y-2">
                {otherCounties.map((c) => (
                  <li key={c}>
                    <Link href={`/county/${COURTS[c].countySlug}`} className="text-sm text-navy-700 hover:text-navy-900 hover:underline">
                      {c} County →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-50 rounded-lg p-5 border border-navy-200">
              <h3 className="font-serif font-bold text-navy-800 mb-2">Helpful Resources</h3>
              <ul className="space-y-2">
                {[
                  { title: "How Probate Works in Illinois", href: "/resources/how-probate-works-illinois" },
                  { title: "Illinois Probate Courts by County", href: "/resources/illinois-probate-courts-by-county" },
                  { title: "Selling an Inherited House in Illinois", href: "/resources/selling-inherited-property-illinois" },
                ].map((post) => (
                  <li key={post.href}>
                    <Link href={post.href} className="text-sm text-navy-700 hover:text-navy-900 hover:underline">
                      {post.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

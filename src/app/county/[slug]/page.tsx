import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  COUNTY_SLUGS,
  getAttorneysByCounty,
  getAllAttorneys,
} from "@/lib/attorneys";
import AttorneyCard from "@/components/AttorneyCard";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(COUNTY_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const county = COUNTY_SLUGS[params.slug];
  if (!county) return {};
  return {
    title: `Probate Attorneys in ${county} County, Illinois`,
    description: `Find experienced probate attorneys in ${county} County, Illinois. Compare ratings, specializations, free consultations, and more.`,
  };
}

const COUNTY_INTROS: Record<string, string> = {
  Cook: "Cook County is home to the largest probate court in Illinois, located in Chicago at the Daley Center. The court handles thousands of estate cases annually across Chicago and its suburbs.",
  Lake: "Lake County probate cases are handled at the Lake County Courthouse in Waukegan. Attorneys here serve communities from Waukegan and Gurnee to Highland Park and Lake Forest.",
  Will: "Will County probate is administered from Joliet. Attorneys in this county serve Joliet, Naperville, Plainfield, Bolingbrook, and surrounding communities.",
  Kane: "Kane County probate cases are heard in Geneva at the Kane County Courthouse. Local attorneys handle estates across Aurora, Elgin, St. Charles, Batavia, and surrounding areas.",
  McHenry: "McHenry County probate court is located in Woodstock. Attorneys serve Crystal Lake, McHenry, Algonquin, Huntley, Marengo, and surrounding communities.",
  DuPage: "DuPage County probate is handled at the DuPage County Courthouse in Wheaton. Attorneys cover Naperville, Oak Brook, Wheaton, Downers Grove, Lisle, and surrounding suburbs.",
};

export default function CountyPage({ params }: Props) {
  const county = COUNTY_SLUGS[params.slug];
  if (!county) notFound();

  const attorneys = getAttorneysByCounty(county);
  const verified = attorneys.filter((a) => a.probate_verified === "YES");
  const freeConsult = attorneys.filter((a) => a.free_consultation === "YES");

  // Sort: verified + rated first
  const sorted = [...attorneys].sort((a, b) => {
    const aScore = (a.probate_verified === "YES" ? 10 : 0) + (a.rating ?? 0);
    const bScore = (b.probate_verified === "YES" ? 10 : 0) + (b.rating ?? 0);
    return bScore - aScore;
  });

  const allCounties = Object.entries(COUNTY_SLUGS).filter(
    ([slug]) => slug !== params.slug
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-navy-800 to-navy-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>{county} County</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
            Probate Attorneys in {county} County, Illinois
          </h1>
          <p className="text-gray-200 max-w-2xl leading-relaxed">
            {COUNTY_INTROS[county]}
          </p>
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div>
              <span className="text-2xl font-bold">{attorneys.length}</span>
              <span className="text-gray-300 ml-1.5">Total Listings</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{verified.length}</span>
              <span className="text-gray-300 ml-1.5">Probate Verified</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{freeConsult.length}</span>
              <span className="text-gray-300 ml-1.5">Free Consultations</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main listing */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-navy-800">
                {attorneys.length} Attorneys Found
              </h2>
              <span className="text-sm text-gray-400">
                Sorted by verification &amp; rating
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sorted.map((attorney) => (
                <AttorneyCard key={attorney.slug} attorney={attorney} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="font-serif font-bold text-navy-800 mb-4">
                Other Counties
              </h3>
              <ul className="space-y-2">
                {allCounties.map(([slug, name]) => {
                  const count = getAllAttorneys().filter(
                    (a) => a.source_county === name
                  ).length;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/county/${slug}`}
                        className="flex justify-between items-center text-sm text-navy-700 hover:text-navy-900 hover:underline"
                      >
                        <span>{name} County</span>
                        <span className="text-gray-400">{count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-navy-50 rounded-lg p-5 border border-navy-200">
              <h3 className="font-serif font-bold text-navy-800 mb-2">
                Not Sure Where to Start?
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Read our guide to understand the probate process before reaching
                out to an attorney.
              </p>
              <Link
                href="/resources/how-probate-works-illinois"
                className="text-navy-700 text-sm font-semibold hover:underline"
              >
                How Probate Works in Illinois →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

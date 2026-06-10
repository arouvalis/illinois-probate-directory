import type { Metadata } from "next";
import Link from "next/link";
import { getAttorneysByCity } from "@/lib/attorneys";
import AttorneyCard from "@/components/AttorneyCard";
import ForFamiliesBanner from "@/components/ForFamiliesBanner";

export const metadata: Metadata = {
  title: "Probate Attorneys in Naperville, IL | Illinois Probate Directory",
  description: "Find experienced probate attorneys in Naperville, Illinois. Naperville spans DuPage and Will counties — most probate cases are filed at the DuPage County Courthouse in Wheaton. Browse verified local attorneys.",
  alternates: { canonical: "https://www.illinoisprobatedirectory.com/city/naperville-probate-attorney" },
};

export default function NapervilleProbatePage() {
  const attorneys = getAttorneysByCity("Naperville");
  const verified = attorneys.filter((a) => a.probate_verified === "YES");
  const freeConsult = attorneys.filter((a) => a.free_consultation === "YES");

  const sorted = [...attorneys].sort((a, b) => {
    const aScore = (a.featured ? 100 : 0) + (a.probate_verified === "YES" ? 10 : 0) + (a.rating ?? 0);
    const bScore = (b.featured ? 100 : 0) + (b.probate_verified === "YES" ? 10 : 0) + (b.rating ?? 0);
    return bScore - aScore;
  });

  return (
    <>
      <section className="bg-gradient-to-r from-navy-800 to-navy-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/county/dupage-county" className="hover:text-white transition-colors">DuPage County</Link>
            <span>/</span>
            <span>Naperville</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
            Probate Attorneys in Naperville, Illinois
          </h1>
          <p className="text-gray-200 max-w-2xl leading-relaxed">
            Naperville spans both DuPage and Will counties and is one of the most
            populous suburbs in Illinois. Most Naperville probate cases are filed
            at the DuPage County Courthouse in Wheaton. Attorneys here serve
            Naperville, Lisle, Bolingbrook, and surrounding communities.
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
          <div className="flex-1 min-w-0">
            <h2 className="font-serif font-bold text-navy-800 text-xl mb-6">
              {attorneys.length} Probate Attorneys in Naperville
            </h2>
            <div className="space-y-4">
              {sorted.map((attorney) => (
                <AttorneyCard key={attorney.slug} attorney={attorney} />
              ))}
            </div>
          </div>

          <aside className="lg:w-64 shrink-0 space-y-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="font-serif font-bold text-navy-800 mb-3">
                DuPage County Probate Court
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                DuPage County Courthouse<br />
                505 N County Farm Rd<br />
                Wheaton, IL 60187
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Most Naperville probate cases are filed here. Will County residents
                file at the Will County Courthouse in Joliet.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="font-serif font-bold text-navy-800 mb-4">Browse by County</h3>
              <ul className="space-y-2">
                {[
                  { name: "DuPage County", slug: "dupage-county" },
                  { name: "Will County", slug: "will-county" },
                  { name: "Cook County", slug: "cook-county" },
                  { name: "Kane County", slug: "kane-county" },
                  { name: "Lake County", slug: "lake-county" },
                  { name: "McHenry County", slug: "mchenry-county" },
                ].map((c) => (
                  <li key={c.slug}>
                    <Link href={`/county/${c.slug}`} className="text-sm text-navy-700 hover:text-navy-900 hover:underline">
                      {c.name} →
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
                  { title: "Executor Selling a House in Illinois", href: "/blog/executor-selling-house-illinois" },
                  { title: "Selling Inherited Property in Illinois", href: "/resources/selling-inherited-property-illinois" },
                  { title: "What to Do With an Inherited House in Illinois", href: "/blog/inherited-house-illinois" },
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

      <ForFamiliesBanner />
    </>
  );
}

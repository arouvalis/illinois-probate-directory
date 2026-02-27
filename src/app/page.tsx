import type { Metadata } from "next";
import Link from "next/link";
import { COUNTY_NAMES, COUNTY_SLUG_MAP } from "@/lib/attorneys";
import CountySearchForm from "@/components/CountySearchForm";
import HomepageLeadForm from "@/components/HomepageLeadForm";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const COUNTY_DESCRIPTIONS: Record<string, string> = {
  Cook: "240 attorneys · Chicago & suburbs",
  Lake: "70 attorneys · Waukegan, Lake Forest, Libertyville",
  McHenry: "70 attorneys · Crystal Lake, Woodstock, McHenry",
  Kane: "65 attorneys · Aurora, Elgin, St. Charles",
  Will: "59 attorneys · Joliet, Naperville, Plainfield",
  DuPage: "55 attorneys · Wheaton, Naperville, Oak Brook",
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: headline + trust signals */}
            <div>
              <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
                Illinois Probate Attorney Directory
              </p>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight mb-5">
                Find a Probate Attorney<br />in Illinois
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed mb-8">
                Browse 592 verified probate attorneys across Chicagoland.
                Compare ratings, specializations, and connect directly — free.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <p>✓ 499 probate-verified listings</p>
                <p>✓ Real Google ratings &amp; reviews</p>
                <p>✓ 6 counties — Cook, Lake, Will, Kane, McHenry, DuPage</p>
              </div>

              {/* County browse — secondary action */}
              <div className="mt-8">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                  Or browse by county:
                </p>
                <CountySearchForm />
              </div>
            </div>

            {/* Right: lead capture form */}
            <div>
              <HomepageLeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy-700 text-white py-5">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "592", label: "Total Listings" },
            { value: "499", label: "Probate Verified" },
            { value: "91", label: "Free Consultations" },
            { value: "6", label: "Counties Covered" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What is Probate */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-heading text-center">What is Probate?</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            Probate is the legal process through which a deceased person&apos;s estate is
            administered. It involves validating the will, appointing an executor, paying
            debts, and distributing assets to heirs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📋",
                title: "Filing the Petition",
                body: "A petition is filed in the county probate court where the deceased resided. The court validates the will and appoints an executor or administrator.",
              },
              {
                icon: "🏦",
                title: "Managing the Estate",
                body: "The executor inventories assets, notifies creditors, pays outstanding debts and taxes, and manages estate property during administration.",
              },
              {
                icon: "🏠",
                title: "Distributing Assets",
                body: "After debts are settled, remaining assets — including real estate, bank accounts, and personal property — are distributed to heirs per the will or Illinois law.",
              },
            ].map((item) => (
              <div key={item.title} className="card text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-serif font-bold text-navy-800 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/resources/how-probate-works-illinois"
              className="btn-outline text-sm"
            >
              Read the Full Guide: How Probate Works in Illinois →
            </Link>
          </div>
        </div>
      </section>

      {/* County Hub Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-center">Browse Attorneys by County</h2>
          <p className="text-gray-500 text-center mb-10">
            Probate is handled at the county level in Illinois. Select your county to
            browse local attorneys.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COUNTY_NAMES.map((county) => (
              <Link
                key={county}
                href={`/county/${COUNTY_SLUG_MAP[county]}`}
                className="card group hover:border-navy-300 hover:bg-navy-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-navy-800 text-xl group-hover:text-navy-900">
                      {county} County
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {COUNTY_DESCRIPTIONS[county]}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-navy-400 group-hover:text-navy-700 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use This Directory */}
      <section className="py-16 px-4 bg-navy-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Why Use Illinois Probate Directory?
          </h2>
          <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
            Navigating probate is stressful. We make finding the right attorney easier.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              {
                title: "Probate-Specific Listings",
                body: "Every attorney in our directory has been screened for probate practice. No general-practice spam.",
              },
              {
                title: "Real Google Ratings",
                body: "Ratings and reviews pulled directly from Google Maps so you can trust what you see.",
              },
              {
                title: "Free to Use",
                body: "No registration required. Browse and connect with attorneys completely free of charge.",
              },
              {
                title: "Covers All Chicagoland Counties",
                body: "Cook, Lake, Will, Kane, McHenry, and DuPage — the counties where the vast majority of Illinois estates are probated.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-navy-700 rounded-lg p-5">
                <h3 className="font-semibold text-white text-base mb-1.5">✓ {item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource links */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-heading text-center">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Link
              href="/resources/how-probate-works-illinois"
              className="card group hover:border-navy-300 flex gap-4 items-start"
            >
              <div className="text-3xl">⚖️</div>
              <div>
                <h3 className="font-serif font-bold text-navy-800 text-lg group-hover:text-navy-900">
                  How Probate Works in Illinois
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  A step-by-step guide to the Illinois probate process, timelines, and costs.
                </p>
              </div>
            </Link>
            <Link
              href="/resources/selling-inherited-property-illinois"
              className="card group hover:border-navy-300 flex gap-4 items-start"
            >
              <div className="text-3xl">🏠</div>
              <div>
                <h3 className="font-serif font-bold text-navy-800 text-lg group-hover:text-navy-900">
                  Selling Inherited Property in Illinois
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  What you need to know about selling a home or real estate you inherited through probate.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where do I file for probate in Cook County Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Probate cases in Cook County are filed at the Richard J. Daley Center, 50 W. Washington St., Chicago, IL 60602. The Clerk's Probate Division office is on the 12th floor, Room 1202. Phone: (312) 603-6441.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost to file for probate in Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Illinois probate filing fees vary by county. Cook County filing fees are approximately $250–$350. DuPage County ranges from $300–$400. Will County ranges from $350–$450. Lake County ranges from $300–$400. Kane County ranges from $250–$350. McHenry County ranges from $300–$400.",
      },
    },
    {
      "@type": "Question",
      name: "Is e-filing required for probate in Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, mandatory electronic filing is required for probate cases in most Illinois counties including Cook, DuPage, Will, Lake, Kane, and McHenry. Original wills are an exception and must be filed in person at the Circuit Clerk's office.",
      },
    },
    {
      "@type": "Question",
      name: "What is the small estate affidavit threshold in Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of August 15, 2025, the Illinois small estate affidavit threshold increased to $150,000 for personal property excluding real estate. Estates at or below this value with no real estate can avoid formal probate using a notarized affidavit.",
      },
    },
    {
      "@type": "Question",
      name: "How long does probate take in Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A straightforward Illinois probate case typically takes 9 to 12 months. The minimum timeline is driven by the mandatory 6-month creditor claims period. Complex or contested estates can take 12 to 24 months or longer.",
      },
    },
  ],
};

const counties = [
  {
    name: "Cook County",
    courthouse: "Richard J. Daley Center",
    address: "50 W. Washington St., Chicago, IL 60602",
    floor: "12th Floor, Room 1202 (Clerk); 18th Floor (Probate Division)",
    phone: "(312) 603-6441",
    hours: "Mon–Fri, 8:30 AM–4:30 PM",
    filingFee: "$250–$350",
    eFiling: "Required",
    timeline: "9–12 months",
    link: "/county/cook",
  },
  {
    name: "DuPage County",
    courthouse: "DuPage County Courthouse",
    address: "505 N. County Farm Rd., Wheaton, IL 60187",
    floor: "Clerk's Office, 1st Floor",
    phone: "(630) 407-8700",
    hours: "Mon–Fri, 8:00 AM–4:30 PM",
    filingFee: "$300–$400",
    eFiling: "Required",
    timeline: "9–12 months",
    link: "/county/dupage",
  },
  {
    name: "Lake County",
    courthouse: "Lake County Courthouse",
    address: "18 N. County St., Waukegan, IL 60085",
    floor: "Circuit Clerk's Office, 1st Floor",
    phone: "(847) 377-3380",
    hours: "Mon–Fri, 8:30 AM–4:30 PM",
    filingFee: "$300–$400",
    eFiling: "Required",
    timeline: "9–12 months",
    link: "/county/lake",
  },
  {
    name: "Will County",
    courthouse: "Will County Courthouse",
    address: "14 W. Jefferson St., Joliet, IL 60432",
    floor: "Circuit Clerk's Office",
    phone: "(815) 727-8592",
    hours: "Mon–Fri, 8:30 AM–4:30 PM",
    filingFee: "$350–$450",
    eFiling: "Required",
    timeline: "9–12 months",
    link: "/county/will",
  },
  {
    name: "Kane County",
    courthouse: "Kane County Judicial Center",
    address: "37W777 IL-38, St. Charles, IL 60175",
    floor: "Circuit Clerk's Office",
    phone: "(630) 232-3413",
    hours: "Mon–Fri, 8:30 AM–4:30 PM",
    filingFee: "$250–$350",
    eFiling: "Required",
    timeline: "9–12 months",
    link: "/county/kane",
  },
  {
    name: "McHenry County",
    courthouse: "McHenry County Courthouse",
    address: "2200 N. Seminary Ave., Woodstock, IL 60098",
    floor: "Room 136 (Clerk); Courtroom 202 (Probate Hearings)",
    phone: "(815) 334-4190",
    hours: "Mon–Fri, 8:30 AM–4:30 PM",
    filingFee: "$300–$400",
    eFiling: "Required",
    timeline: "9–12 months",
    link: "/county/mchenry",
  },
];

export const metadata: Metadata = {
  title: "Illinois Probate Courts by County – Locations, Fees & Filing Info (2026)",
  description:
    "Illinois probate court addresses, phone numbers, filing fees, and e-filing requirements for Cook, DuPage, Lake, Will, Kane, and McHenry counties. Updated June 2026.",
  alternates: {
    canonical:
      "https://www.illinoisprobatedirectory.com/resources/illinois-probate-courts-by-county",
  },
};

export default function IllinoisProbateCourtsByCountyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-navy-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-600">Illinois Probate Courts by County</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 leading-tight mb-4">
          Illinois Probate Courts by County
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Courthouse locations, filing fees, phone numbers, and e-filing requirements
          for Illinois's most active probate counties.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Last updated: June 2026 — Verify current fees with the Circuit Clerk before filing.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 not-prose">
          {[
            { label: "Counties Covered", value: "6" },
            { label: "Typical Filing Fee", value: "$250–$450" },
            { label: "Typical Timeline", value: "9–12 months" },
            { label: "Small Estate Threshold", value: "$150,000" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-navy-50 border border-navy-100 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-navy-800">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="not-prose overflow-x-auto mb-10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white">
                <th className="text-left p-3 font-semibold">County</th>
                <th className="text-left p-3 font-semibold">Address</th>
                <th className="text-left p-3 font-semibold">Phone</th>
                <th className="text-left p-3 font-semibold">Filing Fee</th>
                <th className="text-left p-3 font-semibold">E-Filing</th>
                <th className="text-left p-3 font-semibold">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {counties.map((county, i) => (
                <tr key={county.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 font-semibold text-navy-800">
                    <Link href={county.link} className="hover:underline">
                      {county.name}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">
                    <div>{county.courthouse}</div>
                    <div className="text-xs text-gray-400">{county.address}</div>
                    <div className="text-xs text-gray-400">{county.floor}</div>
                  </td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{county.phone}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{county.filingFee}</td>
                  <td className="p-3 text-gray-600">{county.eFiling}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{county.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-serif font-bold text-navy-800 mb-6">
          County-by-County Details
        </h2>

        <div className="not-prose space-y-6 mb-10">
          {counties.map((county) => (
            <div key={county.name} className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-serif font-bold text-navy-800 mb-3">
                {county.name} Probate Court
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-navy-700">Courthouse:</span>{" "}
                  {county.courthouse}
                </div>
                <div>
                  <span className="font-semibold text-navy-700">Address:</span>{" "}
                  {county.address}
                </div>
                <div>
                  <span className="font-semibold text-navy-700">Floor/Room:</span>{" "}
                  {county.floor}
                </div>
                <div>
                  <span className="font-semibold text-navy-700">Phone:</span>{" "}
                  {county.phone}
                </div>
                <div>
                  <span className="font-semibold text-navy-700">Hours:</span>{" "}
                  {county.hours}
                </div>
                <div>
                  <span className="font-semibold text-navy-700">Filing Fee:</span>{" "}
                  {county.filingFee}
                </div>
                <div>
                  <span className="font-semibold text-navy-700">E-Filing:</span>{" "}
                  {county.eFiling}
                </div>
                <div>
                  <span className="font-semibold text-navy-700">Typical Timeline:</span>{" "}
                  {county.timeline}
                </div>
              </div>
              <div className="mt-4">
                <Link href={county.link} className="text-sm text-gold-600 hover:underline font-medium">
                  Find probate attorneys in {county.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 not-prose">
          <h3 className="font-serif font-bold text-navy-800 text-lg mb-3">
            Important Notes
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 list-disc list-outside ml-4">
            <li>
              Filing fees shown are estimates. Contact the Circuit Clerk directly for
              the current fee schedule before filing.
            </li>
            <li>
              All Illinois counties require mandatory e-filing for probate cases through
              the statewide{" "}
              
                href="https://efile.illinoiscourts.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 hover:underline"
              >
                eFileIL system
              </a>
              . Original wills must be filed in person.
            </li>
            <li>
              The Illinois small estate affidavit threshold increased to{" "}
              <strong>$150,000</strong> for decedents dying on or after August 15, 2025
              (755 ILCS 5/25-1).
            </li>
            <li>
              All Illinois counties observe a mandatory{" "}
              <strong>6-month creditor claims period</strong> following first publication
              of notice.
            </li>
            <li>
              Illinois courts generally require a licensed attorney to open a formal
              probate estate. Self-represented parties may handle small estate affidavits.
            </li>
          </ul>
        </div>

        <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 not-prose">
          <h2 className="font-serif font-bold text-navy-800 text-xl mb-2">
            Find a Probate Attorney in Your County
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Browse verified probate attorneys across Illinois — filtered by county,
            rating, and specialization.
          </p>
          <div className="flex flex-wrap gap-3">
            {counties.map((county) => (
              <Link
                key={county.link}
                href={county.link}
                className="btn-primary text-sm py-2 px-4"
              >
                {county.name}
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
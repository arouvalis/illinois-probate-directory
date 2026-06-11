import type { Metadata } from "next";
import Link from "next/link";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does probate take in Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A straightforward Illinois probate case typically takes 9 to 12 months. The minimum timeline is set by the mandatory 6-month creditor claims period under Illinois law (755 ILCS 5/18-3). Complex or contested estates can take 12 to 24 months or longer.",
      },
    },
    {
      "@type": "Question",
      name: "How long does probate take in Cook County Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cook County probate typically takes 9 to 12 months for a simple estate under independent administration. Complex estates with disputes, real estate in multiple states, or tax issues can take 12 to 24 months or longer. Cook County processes thousands of estates annually and is one of the busiest probate courts in the United States.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum time for probate in Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The minimum probate timeline in Illinois is approximately 6 months, driven by the mandatory creditor claims period under 755 ILCS 5/18-3. In practice, most estates take 9 to 12 months when accounting for court scheduling, inventory filing, and final accounting.",
      },
    },
    {
      "@type": "Question",
      name: "Does probate take longer in some Illinois counties than others?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cook County probate can take longer due to higher case volume and court scheduling delays. Smaller counties like McHenry, Kane, and DuPage often move faster because of lighter dockets. However, all Illinois counties are bound by the same 6-month creditor claims period.",
      },
    },
    {
      "@type": "Question",
      name: "How can I speed up probate in Illinois?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To speed up Illinois probate: use independent administration rather than supervised administration, file the inventory within the required 60 days, publish creditor notice promptly after receiving Letters of Office, respond quickly to court requests, and work with an experienced probate attorney who knows local court procedures.",
      },
    },
  ],
};

const counties = [
  {
    name: "Cook County",
    simpleTimeline: "9–12 months",
    complexTimeline: "12–24+ months",
    smallEstate: "30–60 days",
    caseVolume: "Very High",
    notes: "Largest probate docket in Illinois. Court scheduling delays are common. Independent administration strongly recommended to avoid supervised administration backlogs.",
    link: "/county/cook",
  },
  {
    name: "DuPage County",
    simpleTimeline: "9–12 months",
    complexTimeline: "12–18 months",
    smallEstate: "30–60 days",
    caseVolume: "High",
    notes: "Second most populous county. Generally efficient court scheduling. Mandatory e-filing through I2File or eFileIL. Inventory due within 60 days of appointment.",
    link: "/county/dupage",
  },
  {
    name: "Lake County",
    simpleTimeline: "9–12 months",
    complexTimeline: "12–18 months",
    smallEstate: "30–60 days",
    caseVolume: "Moderate-High",
    notes: "19th Judicial Circuit provides a Probate Court Handbook for executors. Court scheduling is generally faster than Cook County. Strong preference for independent administration.",
    link: "/county/lake",
  },
  {
    name: "Will County",
    simpleTimeline: "9–12 months",
    complexTimeline: "12–24 months",
    smallEstate: "30–60 days",
    caseVolume: "Moderate-High",
    notes: "Fast-growing southwestern suburb. Caseload increasing annually. Early pilot county for mandatory e-filing. Inventory due within 60 days.",
    link: "/county/will",
  },
  {
    name: "Kane County",
    simpleTimeline: "9–12 months",
    complexTimeline: "12–18 months",
    smallEstate: "30–60 days",
    caseVolume: "Moderate",
    notes: "16th Judicial Circuit. Generally efficient for straightforward estates. Court located in St. Charles. Lighter docket than Cook or DuPage typically means faster scheduling.",
    link: "/county/kane",
  },
  {
    name: "McHenry County",
    simpleTimeline: "9–12 months",
    complexTimeline: "12–18 months",
    smallEstate: "30–60 days",
    caseVolume: "Moderate",
    notes: "Probate hearings held at 9:30 AM in Courtroom 202, Woodstock courthouse. Lighter docket means faster court dates. Mandatory e-filing with original wills filed in person at Room 136.",
    link: "/county/mchenry",
  },
];

const phases = [
  {
    phase: "1",
    name: "File Petition & Open Estate",
    timing: "Week 1–2",
    description: "File petition with Circuit Court, attend hearing, receive Letters of Office.",
  },
  {
    phase: "2",
    name: "Publish Creditor Notice",
    timing: "Week 2–3",
    description: "Publish notice in local newspaper once a week for 3 consecutive weeks. First publication within 14 days of Letters of Office.",
  },
  {
    phase: "3",
    name: "File Inventory",
    timing: "Within 60 days",
    description: "File complete inventory of all estate assets with the court.",
  },
  {
    phase: "4",
    name: "Creditor Claims Period",
    timing: "Months 1–6",
    description: "Mandatory 6-month period for creditors to file claims (755 ILCS 5/18-3). Cannot distribute assets until this period closes.",
  },
  {
    phase: "5",
    name: "Pay Debts & Taxes",
    timing: "Months 6–9",
    description: "Pay valid creditor claims, estate expenses, and any Illinois or federal estate tax obligations.",
  },
  {
    phase: "6",
    name: "Distribute Assets & Close",
    timing: "Months 9–12",
    description: "Distribute remaining assets to beneficiaries, file final accounting with court, receive court order closing the estate.",
  },
];

export const metadata: Metadata = {
  title: "Illinois Probate Timeline by County – How Long Does Probate Take? (2026)",
  description:
    "Illinois probate takes 9–12 months in most counties. See county-by-county timelines for Cook, DuPage, Lake, Will, Kane, and McHenry, plus a phase-by-phase breakdown of the process.",
  alternates: {
    canonical:
      "https://www.illinoisprobatedirectory.com/resources/illinois-probate-timeline-by-county",
  },
};

export default function IllinoisProbateTimelineByCountyPage() {
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
        <span className="text-gray-600">Illinois Probate Timeline by County</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 leading-tight mb-4">
          Illinois Probate Timeline by County
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          How long probate takes in Cook, DuPage, Lake, Will, Kane, and McHenry counties —
          plus a phase-by-phase breakdown of the Illinois probate process.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Last updated: June 2026 — Timelines are estimates. Actual duration depends on estate complexity and court scheduling.
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 not-prose">
          {[
            { label: "Simple Estate", value: "9–12 mo" },
            { label: "Complex Estate", value: "12–24+ mo" },
            { label: "Small Estate Affidavit", value: "30–60 days" },
            { label: "Creditor Claims Period", value: "6 months" },
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

        {/* Timeline Table */}
        <div className="not-prose overflow-x-auto mb-10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white">
                <th className="text-left p-3 font-semibold">County</th>
                <th className="text-left p-3 font-semibold">Simple Estate</th>
                <th className="text-left p-3 font-semibold">Complex Estate</th>
                <th className="text-left p-3 font-semibold">Small Estate</th>
                <th className="text-left p-3 font-semibold">Case Volume</th>
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
                  <td className="p-3 text-gray-600">{county.simpleTimeline}</td>
                  <td className="p-3 text-gray-600">{county.complexTimeline}</td>
                  <td className="p-3 text-gray-600">{county.smallEstate}</td>
                  <td className="p-3 text-gray-600">{county.caseVolume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phase Breakdown */}
        <h2 className="text-2xl font-serif font-bold text-navy-800 mb-6">
          Illinois Probate Phase-by-Phase Timeline
        </h2>
        <div className="not-prose space-y-4 mb-10">
          {phases.map((item) => (
            <div key={item.phase} className="flex gap-4 border border-gray-200 rounded-xl p-5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-sm">
                {item.phase}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-navy-800">{item.name}</h3>
                  <span className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full border border-navy-100">
                    {item.timing}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* County Details */}
        <h2 className="text-2xl font-serif font-bold text-navy-800 mb-6">
          County-by-County Notes
        </h2>
        <div className="not-prose space-y-4 mb-10">
          {counties.map((county) => (
            <div key={county.name} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-navy-800">{county.name}</h3>
                <span className="text-xs text-gray-500">Simple: {county.simpleTimeline}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{county.notes}</p>
              <Link href={county.link} className="text-sm text-gold-600 hover:underline font-medium">
                Find probate attorneys in {county.name} →
              </Link>
            </div>
          ))}
        </div>

        {/* What Slows Probate */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 not-prose">
          <h3 className="font-serif font-bold text-navy-800 text-lg mb-3">
            What Makes Illinois Probate Take Longer
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 list-disc list-outside ml-4">
            <li><strong>Contested wills or heir disputes</strong> — litigation adds months or years</li>
            <li><strong>Real estate in multiple states</strong> — requires ancillary probate in each state</li>
            <li><strong>Illinois estate tax</strong> — estates over $4 million require a tax return within 9 months</li>
            <li><strong>Supervised administration</strong> — court approval required for each action; avoid when possible</li>
            <li><strong>Missing heirs or creditors</strong> — extended search periods delay closing</li>
            <li><strong>Cook County court volume</strong> — high caseload can delay hearing dates by weeks</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 not-prose">
          <h2 className="font-serif font-bold text-navy-800 text-xl mb-2">
            Find a Probate Attorney in Your County
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            An experienced probate attorney can keep your estate on track and avoid
            the delays that extend timelines by months.
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
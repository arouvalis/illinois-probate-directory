import type { Metadata } from "next";
import Link from "next/link";
import ForFamiliesContactForm from "@/components/ForFamiliesContactForm";
import { cpsUrl } from "@/lib/cps";

export const metadata: Metadata = {
  title: "What Happens to a House During Illinois Probate",
  description:
    "A short, plain guide to an inherited house in Illinois probate: who is responsible for it, vacancy, insurance, cleanout, and when a sale needs court approval.",
  alternates: { canonical: "https://www.illinoisprobatedirectory.com/for-families" },
};

const TOPICS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who is responsible for the house",
    body: (
      <>
        <p>
          If the house was in the deceased person&apos;s name alone, it usually becomes part of the
          probate estate. Once the court appoints an executor or administrator and issues Letters
          of Office, that person is responsible for the house until it is sold or transferred to
          the heirs.
        </p>
        <p>
          Until Letters of Office are issued, nobody has authority to sell the house or sign a
          listing agreement for the estate, even a person named as executor in the will.
        </p>
      </>
    ),
  },
  {
    title: "Vacancy",
    body: (
      <>
        <p>
          Probate takes months, and the house is often empty the whole time. A vacant house needs
          someone to check on it regularly, keep the heat on in winter so pipes don&apos;t freeze,
          collect or forward the mail, and keep up the lawn and snow removal.
        </p>
        <p>
          Change or secure the locks if several people have keys. Some municipalities have their
          own rules for vacant buildings, so check with the local building department if the
          house will sit empty for long.
        </p>
      </>
    ),
  },
  {
    title: "Insurance",
    body: (
      <>
        <p>
          Tell the homeowner&apos;s insurance company that the owner has died and whether anyone
          is living in the house. Many homeowner&apos;s policies limit or exclude some coverage
          once a house has been vacant for a set period, often 30 or 60 days.
        </p>
        <p>
          Ask the insurer what the policy covers while the house is empty and whether a
          vacant-home policy or endorsement is needed. Get the answer in writing and keep the
          premiums paid.
        </p>
      </>
    ),
  },
  {
    title: "Cleanout",
    body: (
      <>
        <p>
          The contents of the house belong to the estate too. Nothing should be removed, given
          away or thrown out until the executor has authority and has made a record of what is
          there. The will may leave specific items to specific people, and valuable items may
          need an appraisal.
        </p>
        <p>
          After that, a cleanout usually combines family members taking what they were left, an
          estate sale or donation, and a haul-away service for the rest. Keep receipts.
          Reasonable costs of looking after estate property are generally paid by the estate.
        </p>
      </>
    ),
  },
  {
    title: "Selling, and when the court has to approve",
    body: (
      <>
        <p>
          Most Illinois estates are handled under independent administration. In that case the
          executor can generally sell the house without asking the court to approve the sale
          first, unless the will or a court order says otherwise.
        </p>
        <p>
          Under supervised administration, the executor needs the court&apos;s approval to sell.
          An interested person can also ask the court to end independent administration. In
          either case the title company will ask for the Letters of Office before closing, and
          the sale proceeds go to the estate, not directly to the heirs.
        </p>
        <p>
          The estate&apos;s attorney can tell you which kind of administration applies. For the
          full process, see{" "}
          <Link
            href="/resources/selling-inherited-property-illinois"
            className="text-navy-700 underline hover:text-navy-900"
          >
            Selling an Inherited House in Illinois
          </Link>
          .
        </p>
      </>
    ),
  },
];

export default function ForFamiliesPage() {
  return (
    <>
      {/* Intro */}
      <section className="bg-gradient-to-r from-navy-800 to-navy-700 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Inherited Property</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-4">
            What Happens to a House During Illinois Probate
          </h1>
          <p className="text-gray-200 leading-relaxed">
            When an estate includes a house, someone has to look after it while probate runs:
            keep it insured, keep it secure, deal with what&apos;s inside, and decide whether to
            sell. This page covers the basics.
          </p>
        </div>
      </section>

      {/* Explainer */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {TOPICS.map((topic) => (
            <div key={topic.title}>
              <h2 className="text-xl font-serif font-bold text-navy-800 mb-2">{topic.title}</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">{topic.body}</div>
            </div>
          ))}
          <p className="text-sm text-gray-500 italic">
            This page is general information, not legal, tax or insurance advice. Every estate
            is different. Ask the estate&apos;s attorney about your situation, or{" "}
            <Link href="/" className="underline hover:text-navy-800">
              find a probate attorney in the directory
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Property resource: Chicago Probate Specialist */}
      <section
        id="property-help"
        aria-labelledby="property-help-heading"
        className="py-12 px-4 bg-gray-50 border-y border-gray-200"
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Property resource &middot; real estate brokerage, not a law firm
          </p>
          <h2
            id="property-help-heading"
            className="text-2xl font-serif font-bold text-navy-900 mb-6"
          >
            Real estate help: Chicago Probate Specialist
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Chicago Probate Specialist is a real estate service for inherited and probate
                property in Cook, DuPage, Kane, Lake, McHenry and Will counties. It is run by
                Andy Rouvalis, a licensed Illinois real estate broker with HomeSmart Connect,
                who also publishes this directory.
              </p>
              <p>
                It handles the real estate side only and does not give legal advice. Using it
                is optional, and it has no bearing on the attorney listings in this directory.
              </p>
              <p>
                <a
                  href={cpsUrl("for_families")}
                  target="_blank"
                  rel="noopener"
                  className="btn-primary"
                >
                  Visit ChicagoProbateSpecialist.com
                </a>
              </p>
              <div className="border-t border-gray-200 pt-4 text-sm">
                <p className="font-semibold text-navy-800 mb-1">Where this form goes</p>
                <p>
                  Requests sent with the form on this page go to Andy Rouvalis of Chicago
                  Probate Specialist, a licensed Illinois real estate broker. They do not go to
                  an attorney.
                </p>
                <p className="mt-3">
                  Prefer to call Andy?{" "}
                  <a
                    href="tel:8722402639"
                    className="text-navy-700 font-semibold underline hover:text-navy-900 whitespace-nowrap"
                  >
                    872-240-2639
                  </a>
                </p>
              </div>
            </div>

            <div>
              <ForFamiliesContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Probate Works in Illinois – Step-by-Step Guide",
  description:
    "A complete guide to the Illinois probate process: filing, timelines, costs, small estate affidavits, and how to find a probate attorney.",
  alternates: { canonical: "/resources/how-probate-works-illinois" },
};

export default function HowProbateWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-navy-700 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">How Probate Works in Illinois</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 leading-tight mb-4">
          How Probate Works in Illinois
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          A complete step-by-step guide for families navigating estate administration.
        </p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">What is Probate?</h2>
            <p>
              Probate is the court-supervised legal process through which a deceased person&apos;s
              estate is administered. It involves validating the will (if one exists), appointing
              an executor or administrator to manage the estate, notifying creditors, paying debts
              and taxes, and distributing remaining assets to heirs or beneficiaries.
            </p>
            <p className="mt-3">
              In Illinois, probate cases are filed in the Circuit Court of the county where
              the deceased person resided at the time of death. Each county has its own
              probate division — in Cook County, this is the Probate Division of the Circuit
              Court of Cook County, located at the Richard J. Daley Center in Chicago.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              When is Probate Required in Illinois?
            </h2>
            <p>
              Not all estates require probate. In Illinois, probate is generally required when:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li>The deceased owned real estate in their name alone (without a transfer-on-death deed).</li>
              <li>The total value of individually owned assets exceeds $100,000.</li>
              <li>There are debts that creditors need to resolve through a formal process.</li>
              <li>There is a dispute among heirs or beneficiaries.</li>
            </ul>
            <p className="mt-3">
              Assets that pass outside of probate include jointly held property, life insurance
              proceeds with a named beneficiary, retirement accounts (IRA, 401k), payable-on-death
              bank accounts, and assets held in a living trust.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              The Illinois Probate Process: Step by Step
            </h2>
            <div className="space-y-5">
              {[
                {
                  step: "1",
                  title: "File a Petition with the Probate Court",
                  body: "The executor named in the will (or a family member if there is no will) files a petition with the Circuit Court in the county where the deceased lived. The court verifies the will's validity and officially opens the estate.",
                },
                {
                  step: "2",
                  title: "Appointment of Executor or Administrator",
                  body: "The court appoints an executor (if named in the will) or an administrator (if there is no will). This person has legal authority to act on behalf of the estate.",
                },
                {
                  step: "3",
                  title: "Inventory and Appraisal of Assets",
                  body: "The executor creates a complete inventory of all estate assets — real estate, bank accounts, investments, vehicles, personal property — and their estimated values.",
                },
                {
                  step: "4",
                  title: "Notify Creditors",
                  body: "Illinois law requires the executor to publish a notice to creditors in a local newspaper for three consecutive weeks. Creditors then have six months from the date of publication to file claims against the estate.",
                },
                {
                  step: "5",
                  title: "Pay Debts, Taxes, and Expenses",
                  body: "Valid creditor claims, estate administration expenses, and any applicable taxes (Illinois estate tax, federal estate tax) are paid from estate assets before distributions to heirs.",
                },
                {
                  step: "6",
                  title: "File Estate Tax Returns (if applicable)",
                  body: "Illinois imposes an estate tax on estates valued over $4 million. Federal estate tax applies to estates over the federal exemption threshold (currently $13.61 million per person). An estate attorney can advise whether returns must be filed.",
                },
                {
                  step: "7",
                  title: "Distribute Assets to Heirs",
                  body: "After all debts and taxes are settled, the executor distributes remaining assets to beneficiaries named in the will, or per Illinois intestacy law if there is no will.",
                },
                {
                  step: "8",
                  title: "Close the Estate",
                  body: "The executor files a final accounting with the court showing all income, expenses, and distributions. Once approved, the court issues an order closing the estate.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-800 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              How Long Does Probate Take in Illinois?
            </h2>
            <p>
              A straightforward Illinois probate case typically takes <strong>6 to 12 months</strong>.
              The minimum timeline is driven by the six-month creditor claim period required by
              Illinois law (755 ILCS 5/18-3). Complex estates — those with disputed wills,
              real estate in multiple states, business interests, or contested debts — can take
              2 to 3 years or longer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              What Does Probate Cost in Illinois?
            </h2>
            <p>Typical costs include:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-outside ml-5">
              <li><strong>Court filing fees:</strong> $200–$500 depending on estate size and county</li>
              <li><strong>Publication fees:</strong> $100–$300 for required creditor notices</li>
              <li><strong>Attorney fees:</strong> Often 2–4% of the gross estate value, or charged hourly</li>
              <li><strong>Executor fees:</strong> The executor is entitled to reasonable compensation from the estate</li>
              <li><strong>Appraisal fees:</strong> Required for real estate, business interests, or unusual assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              Small Estate Affidavit in Illinois
            </h2>
            <p>
              If the total value of the estate (excluding real estate and jointly held
              assets) is <strong>$100,000 or less</strong>, Illinois allows heirs to
              collect assets using a Small Estate Affidavit (755 ILCS 5/25-1) — no
              formal probate required. This is a signed, notarized document that can
              be presented to banks and other institutions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              Do I Need an Attorney for Illinois Probate?
            </h2>
            <p>
              Illinois does not technically require an attorney for probate. However,
              most executors hire one for good reason: probate involves legal filings,
              court appearances, creditor negotiations, and tax decisions that carry
              personal liability if mishandled. An experienced probate attorney can
              help you avoid costly mistakes and move the process along efficiently.
            </p>
          </section>

          <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 mt-8">
            <h2 className="font-serif font-bold text-navy-800 text-xl mb-2">
              Ready to Find a Probate Attorney?
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Browse our directory of verified probate attorneys across Illinois — filtered
              by county, rating, and specialization.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                ["Cook County", "/county/cook-county"],
                ["Lake County", "/county/lake-county"],
                ["Will County", "/county/will-county"],
                ["Kane County", "/county/kane-county"],
                ["McHenry County", "/county/mchenry-county"],
                ["DuPage County", "/county/dupage-county"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="btn-primary text-sm py-2 px-4">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

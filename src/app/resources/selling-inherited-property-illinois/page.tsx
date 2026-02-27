import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Selling Inherited Property in Illinois – Complete Guide",
  description:
    "Everything you need to know about selling inherited real estate in Illinois: probate, stepped-up basis, capital gains tax, and working with attorneys.",
  alternates: { canonical: "/resources/selling-inherited-property-illinois" },
};

export default function SellingInheritedPropertyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-navy-700 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Selling Inherited Property in Illinois</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 leading-tight mb-4">
          Selling Inherited Property in Illinois
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          A practical guide for heirs and executors navigating the sale of inherited real estate.
        </p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">Overview</h2>
            <p>
              Inheriting real estate in Illinois can be both a financial opportunity and a
              logistical challenge. Whether you&apos;ve inherited a Chicago condo, a suburban
              home, or vacant land downstate, the process of selling that property involves
              legal, tax, and practical steps that are different from a typical home sale.
            </p>
            <p className="mt-3">
              This guide covers the key steps, from determining whether probate is required
              to understanding your tax obligations when you sell.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              Step 1: Determine If Probate Is Required
            </h2>
            <p>
              Before any inherited property can be sold, you must establish legal authority
              to sell it. That authority depends on how the property was titled:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li>
                <strong>Solely in the deceased&apos;s name:</strong> Probate is almost certainly
                required. The estate must go through the probate process before the executor
                has legal authority to sell.
              </li>
              <li>
                <strong>Joint tenancy with right of survivorship:</strong> The surviving
                co-owner automatically inherits the property. No probate needed — file
                an Affidavit of Surviving Joint Tenant with the county recorder.
              </li>
              <li>
                <strong>Transfer-on-Death (TOD) deed:</strong> Illinois allows TOD deeds
                that transfer real estate directly to named beneficiaries without probate.
                If the deceased recorded a TOD deed, the beneficiary can sell after recording
                an Affidavit of Survivorship.
              </li>
              <li>
                <strong>In a living trust:</strong> Property held in a revocable living trust
                avoids probate. The successor trustee can sell immediately per the trust terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              Step 2: Get the Property Into Your Name (or the Estate&apos;s Name)
            </h2>
            <p>
              If probate is required, the court will issue Letters of Office (also called
              Letters Testamentary or Letters of Administration), which give the executor
              legal authority to manage and sell estate property.
            </p>
            <p className="mt-3">
              The executor does not necessarily need to transfer the deed into their own
              name — they can sell directly from the estate. However, the court may need
              to approve the sale if the will requires it or if heirs object.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              Step 3: Understand the Stepped-Up Cost Basis
            </h2>
            <p>
              One of the most important tax advantages of inheriting property is the
              <strong> stepped-up cost basis</strong>. When you inherit real estate,
              your tax basis is generally reset to the fair market value of the property
              on the date of the deceased&apos;s death — not what they originally paid for it.
            </p>
            <p className="mt-3">
              <strong>Example:</strong> Your parent bought a home in Oak Park in 1985
              for $80,000. At the time of their death, it&apos;s worth $450,000. Your stepped-up
              basis is $450,000. If you sell it quickly for $450,000, you owe zero
              capital gains tax on the appreciation that occurred during your parent&apos;s
              lifetime.
            </p>
            <p className="mt-3">
              Capital gains tax only applies to appreciation that occurs <em>after</em> you
              inherit the property. This makes selling inherited property shortly after
              inheriting it often the most tax-efficient option.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              Step 4: Consider Illinois-Specific Tax Issues
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-navy-800 mb-1">Illinois Estate Tax</h3>
                <p className="text-sm">
                  Illinois taxes estates valued over $4 million at rates up to 16%.
                  If the estate owes estate tax, it must be paid before assets are
                  distributed — which can affect how quickly property can be sold.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-navy-800 mb-1">Illinois Income Tax on Gains</h3>
                <p className="text-sm">
                  Illinois taxes capital gains as ordinary income at a flat 4.95% state rate,
                  in addition to federal capital gains tax (0%, 15%, or 20% depending on
                  your income). Short-term gains (property held less than 1 year) are taxed
                  as ordinary income federally.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-navy-800 mb-1">Transfer Tax</h3>
                <p className="text-sm">
                  Illinois imposes a real estate transfer tax of $0.50 per $500 of sales
                  price ($1.00 per $1,000). Chicago adds an additional city transfer tax.
                  These are typically paid at closing.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              Step 5: Prepare the Property for Sale
            </h2>
            <p>
              Inherited properties are often sold &quot;as-is&quot; — especially when the
              estate lacks funds for repairs or when multiple heirs want a quick resolution.
              Options include:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li><strong>Traditional MLS listing:</strong> Best for maximizing price if the property is in good condition or heirs have time.</li>
              <li><strong>As-is sale to a cash buyer:</strong> Faster closing, no repairs required. Common when the property needs significant work.</li>
              <li><strong>Auction:</strong> Can be efficient for estates with multiple heirs who need a clear, objective sale process.</li>
            </ul>
            <p className="mt-3">
              Illinois law requires sellers to disclose known material defects. Even in
              an estate sale, executors must comply with disclosure requirements to the
              extent they have knowledge of the property&apos;s condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              When Multiple Heirs Are Involved
            </h2>
            <p>
              If multiple heirs inherit a property together and disagree on whether to sell
              (or for how much), any co-owner can file a <strong>partition action</strong>
              in Illinois court. A partition action forces the sale of the property and
              division of proceeds — but it&apos;s costly and time-consuming. Mediation
              and early legal counsel can help resolve disagreements before they escalate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">
              The Role of a Probate Attorney in the Sale
            </h2>
            <p>
              A probate attorney can:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-outside ml-5">
              <li>Obtain Letters of Office authorizing the executor to sell</li>
              <li>Draft or review the real estate sale contract</li>
              <li>Coordinate with the title company on probate-related title issues</li>
              <li>Handle creditor claims that affect proceeds from the sale</li>
              <li>Advise on tax filings required after the sale</li>
              <li>Represent the estate if other heirs challenge the sale</li>
            </ul>
          </section>

          <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 mt-8">
            <h2 className="font-serif font-bold text-navy-800 text-xl mb-2">
              Need a Probate Attorney for an Inherited Property?
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Find an experienced probate attorney in your Illinois county who can help
              you navigate the legal side of selling inherited real estate.
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

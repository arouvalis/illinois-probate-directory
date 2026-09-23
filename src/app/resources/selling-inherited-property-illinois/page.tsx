import type { Metadata } from "next";
import Link from "next/link";
import ForFamiliesBanner from "@/components/ForFamiliesBanner";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need probate to sell an inherited house in Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It depends on how the house was titled. If it was in the deceased's name alone, probate is required before the executor or administrator has authority to sell. Houses held in joint tenancy, passed by a recorded Transfer on Death Instrument, or held in a living trust pass outside probate."
      }
    },
    {
      "@type": "Question",
      "name": "Can an executor sell a house without beneficiary approval in Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Generally yes. Independent administration is the default in Illinois, and it lets the executor list, negotiate, and close a sale without court approval or every beneficiary's consent. A beneficiary who objects can ask the court to terminate independent administration, which puts the sale under court supervision."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to sell a house in probate in Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Getting Letters of Office typically takes several weeks, and under independent administration the house can often be sold within a few months after that. The estate itself usually takes 9 to 14 months to close because the creditor claims period runs at least six months."
      }
    },
    {
      "@type": "Question",
      "name": "What is the stepped-up basis on an inherited house?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you inherit real estate, your tax basis is generally reset to the property's fair market value on the date of death. Selling soon after inheriting often means little or no taxable gain on appreciation that occurred during the deceased's lifetime."
      }
    },
    {
      "@type": "Question",
      "name": "What taxes apply to an inherited house in Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Illinois has no inheritance tax. Illinois taxes estates over $4 million, and the federal estate tax applies only to estates above $15 million in 2026. At sale, Illinois charges a state transfer tax of $0.50 per $500 and a county transfer tax of $0.25 per $500, and Chicago and some suburbs add their own."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if heirs disagree about selling an inherited house in Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If the house is in probate, the executor generally has authority to sell in the estate's best interest, and serious disputes go to the probate judge. If heirs already co-own the house, any co-owner can file a partition action, though mediation is usually faster and cheaper."
      }
    }
  ]
};

export const metadata: Metadata = {
  title: "Selling an Inherited House in Illinois: Complete Guide",
  description:
    "How to sell an inherited house in Illinois: when probate is required, executor authority, beneficiary approval, timelines, taxes, and what to do when heirs disagree.",
  alternates: { canonical: "https://www.illinoisprobatedirectory.com/resources/selling-inherited-property-illinois" },
};

export default function SellingInheritedPropertyPage() {
  return (
    <>
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-navy-700 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Selling Inherited Property in Illinois</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 leading-tight mb-4">
          Selling an Inherited House in Illinois: A Complete Guide for Heirs and Executors
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Who can sell, when probate is required, how long it takes, and what it means for taxes.{" "}
          <span className="text-gray-400">Last updated: September 2026</span>
        </p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <p>{"Inheriting a house in Illinois usually means handling two things at once: the legal process of transferring or selling the property, and the physical property itself, with its bills, repairs, and a lifetime of belongings inside. This guide covers the legal side step by step, whether you're an executor selling on behalf of an estate or an heir trying to understand what happens next."}</p>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"The Short Answer"}</h2>
            <p>{"Yes, an inherited house in Illinois can be sold, but only by the person with legal authority to sign. Who that is depends on how the property was titled when the owner died:"}</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li><strong>{"Titled in the deceased's name alone:"}</strong>{" the executor or administrator appointed by the probate court sells it, once the court issues Letters of Office."}</li>
              <li><strong>{"Joint tenancy or tenancy by the entirety:"}</strong>{" the surviving owner already owns it and can sell it."}</li>
              <li><strong>{"Transfer on Death Instrument (TODI):"}</strong>{" the named beneficiary sells it, after recording the required acceptance."}</li>
              <li><strong>{"Living trust:"}</strong>{" the successor trustee sells it under the terms of the trust, without court involvement."}</li>
            </ul>
            <p className="mt-3">{"When the house is sold through probate, the sale proceeds belong to the estate, not to any individual heir, until debts and expenses are paid and the estate distributes what's left."}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Step 1: Find Out Whether the House Needs Probate"}</h2>
            <p>{"Start with the deed. You can get a copy from the recorder's office in the county where the property is located. How the property was titled decides everything that follows."}</p>
            <p className="mt-3"><strong>{"Titled solely in the deceased's name."}</strong>{" Probate is required before anyone can sell. This is true even for a modest estate. Illinois' small estate affidavit can transfer up to $150,000 in personal property for deaths on or after August 15, 2025 ($100,000 for earlier deaths), but it cannot transfer real estate at all."}</p>
            <p className="mt-3"><strong>{"Joint tenancy or tenancy by the entirety."}</strong>{" The surviving owner takes full title automatically at death, with no probate. The survivor typically records proof of death with the county recorder, and the title company handling a later sale will say exactly what it needs."}</p>
            <p className="mt-3"><strong>{"Transfer on Death Instrument (TODI)."}</strong>{" Illinois allows owners to record a TODI naming who receives the property at death. After the owner dies, the beneficiary records a "}<strong>{"Notice of Death Affidavit and Acceptance of Transfer on Death Instrument"}</strong>{" with the county recorder, along with any supporting death documentation the recorder or title company requires. The acceptance is what makes the transfer effective, and Illinois law gives beneficiaries a two-year window to record it, so it shouldn't be left to the last minute. Cook County publishes a courtesy form for this filing. Note that this is a different filing from the survivorship paperwork used for joint tenancy."}</p>
            <p className="mt-3"><strong>{"Living trust."}</strong>{" If the house was deeded into a revocable living trust, the successor trustee can sell it according to the trust's terms. No court case is needed."}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Step 2: Get Legal Authority to Sell (If Probate Is Required)"}</h2>
            <p>{"If the house has to go through probate, someone must open an estate in the circuit court of the county where the deceased lived. The court appoints an "}<strong>{"executor"}</strong>{" (if there's a will) or an "}<strong>{"administrator"}</strong>{" (if there isn't) and issues "}<strong>{"Letters of Office"}</strong>{", the document that gives that person legal authority to act for the estate. Getting Letters typically takes several weeks, depending on the county."}</p>
            <p className="mt-3">{"Until Letters are issued, no one can sign a listing agreement or sales contract for the house, and that includes the person named in the will. Families can still use that time well: securing the property, sorting belongings, and getting an agent's opinion of value."}</p>
            <h3 className="text-xl font-serif font-semibold text-navy-800 mt-6 mb-2">{"Independent vs. Supervised Administration"}</h3>
            <p>{"How much freedom the executor has depends on the type of administration:"}</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li><strong>{"Independent administration"}</strong>{" is the default in Illinois. Unless an interested person objects or the court orders supervision, the executor can list, negotiate, and close the sale of estate real estate without going back to court for approval."}</li>
              <li><strong>{"Supervised administration"}</strong>{" keeps the court involved. The executor generally needs the court to approve the sale before closing, which adds time. It's more common in contested estates."}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Do the Beneficiaries Have to Agree?"}</h2>
            <p>{"Not necessarily. An executor's legal duty runs to the estate as a whole, not to any one beneficiary's preferences. If selling the house is needed to pay debts, divide the estate fairly, or close the estate, an executor with independent authority can generally proceed without every heir signing off."}</p>
            <p className="mt-3">{"That doesn't mean disagreements don't matter. A beneficiary who objects can ask the court to terminate independent administration, which puts the sale under court supervision. Disputes also create personal liability risk for the executor if the sale isn't handled carefully. It's usually wise to involve the court, or at least your attorney, when:"}</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li>{"The offer is significantly below appraised value"}</li>
              <li>{"A beneficiary has formally objected"}</li>
              <li>{"The will has specific instructions about the property"}</li>
              <li>{"There's a question about whether the property belongs to the estate at all"}</li>
              <li>{"An heir is living in the house and won't leave"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Step 3: The Sale, Step by Step"}</h2>
            <p><strong>{"1. Secure and insure the property."}</strong>{" Change the locks, keep utilities on to prevent frozen pipes, and call the homeowner's insurance carrier right away. Many standard policies limit coverage once a home sits vacant, and vacant homes are exactly the ones that suffer water damage and break-ins."}</p>
            <p className="mt-3"><strong>{"2. Establish the value."}</strong>{" Get an appraisal of the property's value as of the date of death. It serves two purposes: it protects the executor against claims that the house was undersold, and it documents the heirs' stepped-up tax basis (covered below)."}</p>
            <p className="mt-3"><strong>{"3. Choose how to sell."}</strong>{" Inherited homes usually sell one of three ways:"}</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li><strong>{"Listing on the MLS"}</strong>{" typically brings the highest price, especially if the house is in reasonable condition and the estate can carry it for a few months."}</li>
              <li><strong>{"An as-is sale to a cash buyer"}</strong>{" closes faster with no repairs, which is common when the house needs major work or the heirs live out of state."}</li>
              <li><strong>{"Auction"}</strong>{" gives families who disagree on value a transparent, objective result."}</li>
            </ul>
            <p className="mt-3"><strong>{"4. List and disclose."}</strong>{" The executor signs the listing and contract in their representative capacity. Estates are generally exempt from Illinois' standard residential disclosure form, but an executor still can't hide known defects, so be honest about anything you know."}</p>
            <p className="mt-3"><strong>{"5. Accept an offer."}</strong>{" Under independent administration, the executor can accept and move forward. Under supervised administration, the accepted offer goes to the court for approval before closing."}</p>
            <p className="mt-3"><strong>{"6. Close."}</strong>{" The title company will require current Letters of Office, or the trust or TODI documents if the house passed outside probate. The mortgage, property taxes, and closing costs are paid at closing, and the net proceeds go into the estate account."}</p>
            <p className="mt-3"><strong>{"7. Distribute."}</strong>{" After valid creditor claims, taxes, and expenses are paid, the remaining funds are distributed to heirs under the will or Illinois intestacy law."}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"How Long Does It Take?"}</h2>
            <p>{"The sale itself can often happen within a few months of Letters being issued. Under independent administration, the executor doesn't have to wait for the estate to close before selling."}</p>
            <p className="mt-3">{"The estate as a whole takes longer. After Letters are issued, notice to creditors is published, and the claims period runs at least six months from the first publication. The estate generally can't make final distributions until that period ends. For a straightforward estate with cooperative heirs, expect roughly 9 to 14 months from opening the estate to final distribution. Contested estates, title problems, or out-of-state heirs can stretch that to two years or more."}</p>
            <p className="mt-3">{"Ways to keep things moving:"}</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li>{"Open the estate promptly rather than waiting months after the death"}</li>
              <li>{"Use independent administration when possible"}</li>
              <li>{"Work with an attorney who knows the local probate court's procedures"}</li>
              <li>{"Start preparing the property while Letters are pending"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Keep, Rent, or Sell?"}</h2>
            <p>{"Not every heir wants to sell, and the right choice depends on the house and on the family."}</p>
            <p className="mt-3"><strong>{"Keeping the house"}</strong>{" can make sense if an heir wants to live there and can afford it. Federal law generally prevents a lender from calling a mortgage due just because the home passes to a relative at death, but someone has to keep making the payments."}</p>
            <p className="mt-3"><strong>{"Renting it out"}</strong>{" can produce income, but it makes you a landlord, subject to Illinois and local landlord-tenant rules, and it usually requires repairs before the house is rentable."}</p>
            <p className="mt-3"><strong>{"Selling"}</strong>{" turns the house into cash that can be divided cleanly, and it's often the most tax-efficient option (see below)."}</p>
            <p className="mt-3">{"Whatever you decide, the house costs money every month while you decide: property taxes, insurance, utilities, maintenance, and mortgage payments. Property tax exemptions the deceased qualified for may not continue. For estates without much cash, these carrying costs are often what makes the decision."}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Taxes on an Inherited House in Illinois"}</h2>
            <p><strong>{"Illinois has no inheritance tax."}</strong>{" Heirs don't owe tax just for receiving property."}</p>
            <p className="mt-3"><strong>{"Stepped-up basis."}</strong>{" When you inherit real estate, your tax basis is generally reset to the property's fair market value on the date of death, not what the original owner paid. If your parent bought a home in Oak Park in 1985 for $80,000 and it was worth $450,000 when they died, your basis is $450,000. Sell it for $450,000 and there's no capital gain on the decades of appreciation. You're taxed only on any gain above the date-of-death value."}</p>
            <p className="mt-3"><strong>{"Estate tax."}</strong>{" Illinois taxes estates over $4 million, one of the lowest thresholds in the country, at rates up to 16%. The federal estate tax applies only to estates above $15 million in 2026. Any estate tax owed must be addressed before assets are distributed."}</p>
            <p className="mt-3"><strong>{"Transfer taxes."}</strong>{" Illinois charges a state transfer tax of $0.50 per $500 of the sale price, plus a county transfer tax of $0.25 per $500. Chicago and some suburbs add their own municipal transfer taxes. These are paid at closing."}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"When Heirs Disagree"}</h2>
            <p>{"Disagreements over an inherited house are common: one sibling wants to sell, another wants to keep it, a third lives in it. How they're resolved depends on how the house passed."}</p>
            <p className="mt-3"><strong>{"If the house is in probate,"}</strong>{" the executor generally has authority to sell in the estate's best interest, and serious disputes go to the probate judge. If an heir living in the home won't leave, the executor may need a court order to get possession."}</p>
            <p className="mt-3"><strong>{"If the heirs already co-own the house"}</strong>{" (for example, because it passed outside probate to several people), any co-owner can file a "}<strong>{"partition action"}</strong>{" asking an Illinois court to divide or force the sale of the property. Partition works, but it's slow and expensive. Mediation or an early conversation with a probate attorney usually resolves things faster and for less."}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Executor Mistakes That Create Personal Liability"}</h2>
            <p>{"Illinois executors can be held personally liable for mismanaging an estate. With real estate, the most common mistakes are:"}</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li>{"Signing a contract before Letters of Office are issued"}</li>
              <li>{"Selling without court approval when supervised administration requires it"}</li>
              <li>{"Underpricing the house to sell quickly, which can breach the executor's fiduciary duty"}</li>
              <li>{"Letting the property deteriorate or go uninsured while it's vacant"}</li>
              <li>{"Distributing sale proceeds before creditor claims and taxes are resolved"}</li>
              <li>{"Failing to keep beneficiaries informed"}</li>
            </ul>
            <p className="mt-3">{"The best protection is documentation: a date-of-death appraisal, written records of offers and communications, and an attorney confirming your authority before you sign."}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Where a Probate Attorney Fits"}</h2>
            <p>{"Illinois executors can technically handle probate without a lawyer, but when real estate is involved it rarely makes sense. A probate attorney can:"}</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li>{"Open the estate and obtain Letters of Office"}</li>
              <li>{"Advise whether independent administration is available"}</li>
              <li>{"Review the sale contract and work with the title company on probate title requirements"}</li>
              <li>{"Handle creditor claims that affect the sale proceeds"}</li>
              <li>{"Guide required tax filings"}</li>
              <li>{"Represent the estate if an heir challenges the sale"}</li>
            </ul>
            <p className="mt-3">{"Attorney fees in Illinois probate are typically paid from the estate, not out of the executor's pocket."}</p>
          </section>

          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-3">{"Need Help With the Property Itself?"}</h2>
            <p>{"The legal process is only half of it. Executors and heirs also end up handling the house itself: a lifetime of belongings to sort, repairs, a vacant property to watch over, and a sale to coordinate, often from out of state. "}<Link href="/for-families" className="text-navy-700 underline hover:text-navy-900">{"We help Illinois families with exactly that"}</Link>{", from cleanout through closing. We work alongside your probate attorney, not around them."}</p>
            <Link href="/for-families" className="btn-primary text-sm py-2 px-4 inline-block mt-4">{"Get help with an inherited property"}</Link>
          </section>

          <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 mt-8">
            <h2 className="font-serif font-bold text-navy-800 text-xl mb-2">
              Find a Probate Attorney in Your County
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Browse Illinois probate attorneys by county. Many offer free initial consultations.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                ["Cook County", "/county/cook"],
                ["DuPage County", "/county/dupage"],
                ["Lake County", "/county/lake"],
                ["Will County", "/county/will"],
                ["Kane County", "/county/kane"],
                ["McHenry County", "/county/mchenry"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="btn-primary text-sm py-2 px-4">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 italic">{"This guide is general information, not legal or tax advice. Every estate is different. Talk with an Illinois probate attorney and a tax professional about your specific situation."}</p>
        </div>
      </article>
    </div>
    <ForFamiliesBanner />
    </>
  );
}

import type { Metadata } from "next";
import ForFamiliesContactForm from "@/components/ForFamiliesContactForm";

export const metadata: Metadata = {
  title: "Help With Probate Property | Illinois Probate Directory",
  description: "Dealing with an estate that includes property? We help Illinois families with probate property sales, cleanout, valuation, and more. Personally reviewed — no automated responses.",
  alternates: { canonical: "https://www.illinoisprobatedirectory.com/for-families" },
};

export default function ForFamiliesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-700 via-amber-600 to-amber-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-100 text-sm font-semibold uppercase tracking-widest mb-4">
            For Families
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight mb-5">
            Dealing with an estate that includes property?
          </h1>
          <p className="text-lg text-amber-50 leading-relaxed max-w-2xl mx-auto">
            Many probate properties sit vacant for months. We help Illinois families
            with everything from property maintenance and cleanout to full sale
            coordination — working alongside your attorney, not around them.
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-10 px-4 bg-amber-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🏠", label: "Property Sale Coordination" },
            { icon: "🧹", label: "Cleanout & Junk Removal" },
            { icon: "📋", label: "Property Valuation" },
            { icon: "🤝", label: "Works With Your Attorney" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-navy-800">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + side copy */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: context */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-navy-900 mb-4">
              Every inquiry is personally reviewed
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You won&apos;t get an automated response. When you submit this form,
              it goes directly to Andy Rouvalis — a probate real estate specialist
              who works with Illinois families navigating estate property.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Whether the property is vacant, needs cleanout, is ready to sell,
              or you&apos;re still figuring out next steps — reach out and we&apos;ll
              help you understand your options.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              We work directly with your probate attorney and the estate — no
              conflict, no confusion.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Prefer to call?</p>
              <a
                href="tel:8722402639"
                className="text-amber-700 font-bold text-lg hover:text-amber-800 transition-colors whitespace-nowrap"
              >
                872-240-2639
              </a>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <ForFamiliesContactForm />
          </div>

        </div>
      </section>
    </>
  );
}

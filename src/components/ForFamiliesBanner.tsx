import Link from "next/link";

export default function ForFamiliesBanner() {
  return (
    <section className="py-16 px-4 bg-amber-50 border-y border-amber-100">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left: copy */}
          <div>
            <p className="text-amber-700 text-sm font-semibold uppercase tracking-widest mb-3">
              For Families
            </p>
            <h2 className="text-3xl font-serif font-bold text-navy-900 leading-tight mb-4">
              Dealing with an estate that includes property?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you&apos;re navigating probate and real estate is part of the picture,
              we can help you understand your options. Many probate properties sit
              vacant for months. We help families with everything from property
              maintenance and cleanout to full sale coordination.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              We work alongside your attorney, not around them.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Every inquiry submitted through this directory is personally reviewed.
              You won&apos;t get an automated response.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Link
                href="/for-families"
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Get Help With the Property Side &rarr;
              </Link>
              <a
                href="tel:8722402639"
                className="text-amber-700 font-semibold text-sm hover:text-amber-800 transition-colors whitespace-nowrap"
              >
                or call 872-240-2639
              </a>
            </div>
          </div>

          {/* Right: trust signals */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-amber-100">
            <h3 className="font-serif font-bold text-navy-800 text-lg mb-5">
              How we help families
            </h3>
            <ul className="space-y-4">
              {[
                {
                  icon: "🏠",
                  title: "Property Sale Coordination",
                  body: "Traditional or off-market — we handle the real estate side so the estate can close.",
                },
                {
                  icon: "🧹",
                  title: "Cleanout & Junk Removal",
                  body: "Vacant properties need attention. We coordinate cleanout and maintenance while the estate settles.",
                },
                {
                  icon: "📋",
                  title: "Property Valuation",
                  body: "Understand what the property is worth before making any decisions.",
                },
                {
                  icon: "🤝",
                  title: "Works With Your Attorney",
                  body: "We coordinate directly with the estate attorney — no conflict, no confusion.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3 items-start">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-navy-800 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

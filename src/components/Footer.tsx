import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-3">
              Illinois Probate Directory
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting families navigating probate with experienced Illinois
              probate attorneys. Serving Cook, Lake, Will, Kane, McHenry, and
              DuPage counties.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Browse by County</h4>
            <ul className="space-y-1.5 text-sm">
              {[
                ["Cook County", "/county/cook-county"],
                ["Lake County", "/county/lake-county"],
                ["Will County", "/county/will-county"],
                ["Kane County", "/county/kane-county"],
                ["McHenry County", "/county/mchenry-county"],
                ["DuPage County", "/county/dupage-county"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Resources</h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href="/resources/how-probate-works-illinois"
                  className="hover:text-white transition-colors"
                >
                  How Probate Works in Illinois
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/selling-inherited-property-illinois"
                  className="hover:text-white transition-colors"
                >
                  Selling Inherited Property in Illinois
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-700 pt-6 text-xs text-gray-500 text-center">
          <p>
            &copy; {new Date().getFullYear()} IllinoisProbateDirectory.com &mdash;
            Attorney listings are provided for informational purposes only. This
            site does not constitute legal advice. Always consult a licensed attorney.
          </p>
        </div>
      </div>
    </footer>
  );
}

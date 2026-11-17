// "Verify your listing": an attorney checks the details we show for their
// firm and gives an email address for client inquiries. Linked quietly from
// every attorney profile and from campaign emails (?src=email).
// Kept out of search results; never shows an attorney's email address.
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAttorneyBySlug, parseSpecializations, cleanWebsite } from "@/lib/attorneys";
import VerifyListingForm from "@/components/VerifyListingForm";

interface Props {
  params: { slug: string };
}

// Built the first time each one is opened, then kept, so the site build does
// not grow by one page per listing.
export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: Props): Metadata {
  const attorney = getAttorneyBySlug(params.slug);
  return {
    title: attorney ? `Verify the listing for ${attorney.name}` : "Verify your listing",
    robots: { index: false, follow: false },
  };
}

export default function VerifyListingPage({ params }: Props) {
  const attorney = getAttorneyBySlug(params.slug);
  if (!attorney) notFound();

  const website = cleanWebsite(attorney.website);
  const specs = parseSpecializations(attorney.specializations_found);
  const rows: Array<[string, string]> = [
    ["Name", attorney.name ?? ""],
    ["Address", [attorney.street, [attorney.city, attorney.state].filter(Boolean).join(", "), attorney.postal_code].filter(Boolean).join(", ").replace(/, (\d{5})$/, " $1")],
    ["Phone", attorney.phone ?? "None listed"],
    ["Website", website ? website.replace(/^https?:\/\//, "").replace(/\/$/, "") : "None listed"],
    ["County", `${attorney.source_county} County`],
    ["Practice areas", specs.length ? specs.join(", ") : "None listed"],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-navy-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/attorney/${attorney.slug}`} className="hover:text-navy-700 transition-colors truncate">{attorney.name}</Link>
        <span>/</span>
        <span className="text-gray-600">Verify listing</span>
      </nav>

      <h1 className="font-serif font-bold text-navy-900 text-2xl sm:text-3xl leading-tight mb-2">
        Verify your listing
      </h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        If you are with {attorney.name}, check the details below and tell us where to send client inquiries.
        The listing is free, and people who message you through it are put in touch with you directly.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-serif font-bold text-navy-800 text-lg mb-4">What your listing shows now</h2>
            <dl className="space-y-3">
              {rows.map(([term, value]) => (
                <div key={term}>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{term}</dt>
                  <dd className="text-sm text-gray-800 break-words">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm mt-5">
              <Link href={`/attorney/${attorney.slug}`} className="text-navy-700 hover:underline">View the full listing →</Link>
            </p>
          </div>
        </div>
        <div className="lg:col-span-3">
          <VerifyListingForm
            attorneySlug={attorney.slug}
            attorneyName={attorney.name ?? "your firm"}
            phone={attorney.phone ?? ""}
            website={website ?? ""}
            county={attorney.source_county}
          />
        </div>
      </div>
    </div>
  );
}

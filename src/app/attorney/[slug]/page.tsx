import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import AttorneyPhoto from "@/components/AttorneyPhoto";
import {
  getAllAttorneys,
  getAttorneyBySlug,
  parseSpecializations,
  cleanWebsite,
  COUNTY_SLUG_MAP,
} from "@/lib/attorneys";
import AttorneyMessageForm from "@/components/AttorneyMessageForm";
import ChecklistForm from "@/components/ChecklistForm";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllAttorneys().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const attorney = getAttorneyBySlug(params.slug);
  if (!attorney) return {};
  return {
    title: `${attorney.name} – Probate Attorney in ${attorney.city}, Illinois`,
    description: `${attorney.name} is a probate attorney in ${attorney.city}, ${attorney.state}. ${
      attorney.specializations_found
        ? `Specializes in: ${attorney.specializations_found}.`
        : ""
    } ${attorney.free_consultation === "YES" ? "Free consultation available." : ""}`,
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
            rating >= star
              ? "text-yellow-400"
              : rating >= star - 0.5
              ? "text-yellow-300"
              : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function parseAbout(raw: string | null): Record<string, Record<string, boolean>> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AttorneyPage({ params }: Props) {
  const attorney = getAttorneyBySlug(params.slug);
  if (!attorney) notFound();

  const specs = parseSpecializations(attorney.specializations_found);
  const rating = attorney.rating ? Number(attorney.rating.toFixed(1)) : null;
  const isFreeConsult = attorney.free_consultation === "YES";
  const isVerified = attorney.probate_verified === "YES";
  const about = parseAbout(attorney.about);
  const countySlug = COUNTY_SLUG_MAP[attorney.source_county];
  const website = cleanWebsite(attorney.website);

  const accessibilityFeatures = about?.Accessibility
    ? Object.entries(about.Accessibility)
        .filter(([, val]) => val === true)
        .map(([key]) => key)
    : [];

  const otherFeatures = about?.Other
    ? Object.entries(about.Other)
        .filter(([, val]) => val === true)
        .map(([key]) => key)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-navy-700 transition-colors">Home</Link>
        <span>/</span>
        {countySlug ? (
          <>
            <Link href={`/county/${countySlug}`} className="hover:text-navy-700 transition-colors">
              {attorney.source_county} County
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-gray-600 truncate">{attorney.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <AttorneyPhoto
              website={website}
              name={attorney.name}
            />
            <div className="p-6">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="font-serif font-bold text-navy-900 text-2xl sm:text-3xl leading-tight flex-1">
                  {attorney.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {isVerified && (
                    <span className="bg-navy-100 text-navy-800 text-xs font-semibold px-3 py-1 rounded-full">
                      ✓ Probate Verified
                    </span>
                  )}
                  {isFreeConsult && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Free Consultation
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-500 mb-4">
                {attorney.street && `${attorney.street}, `}
                {attorney.city}, {attorney.state} {attorney.postal_code}
              </p>

              {rating !== null && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={rating} />
                  <span className="font-bold text-gray-800">{rating}</span>
                  {attorney.reviews && (
                    <span className="text-sm text-gray-400">
                      ({Math.round(attorney.reviews)} reviews)
                    </span>
                  )}
                </div>
              )}

              {specs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Practice Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specs.map((s) => (
                      <span
                        key={s}
                        className="bg-navy-50 text-navy-700 text-sm px-3 py-1 rounded-full capitalize border border-navy-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact info */}
          {(attorney.phone || website) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-serif font-bold text-navy-800 text-lg mb-4">
                Contact Information
              </h2>
              <div className="flex flex-wrap gap-6">
                {attorney.phone && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <a
                      href={`tel:${attorney.phone}`}
                      className="text-navy-700 font-semibold text-lg hover:underline flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {attorney.phone}
                    </a>
                  </div>
                )}
                {website && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Website
                    </p>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-700 hover:underline text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility & Features */}
          {(accessibilityFeatures.length > 0 || otherFeatures.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-serif font-bold text-navy-800 text-lg mb-4">
                Office Features
              </h2>
              {accessibilityFeatures.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Accessibility
                  </p>
                  <ul className="space-y-1">
                    {accessibilityFeatures.map((f) => (
                      <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {otherFeatures.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Other
                  </p>
                  <ul className="space-y-1">
                    {otherFeatures.map((f) => (
                      <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Working hours */}
          {attorney.working_hours && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-serif font-bold text-navy-800 text-lg mb-3">
                Hours
              </h2>
              <p className="text-sm text-gray-500">
                {(() => {
                  try {
                    const h = JSON.parse(attorney.working_hours!);
                    return Object.entries(h)
                      .map(([day, times]) => `${day}: ${(times as string[]).join(", ")}`)
                      .join(" · ");
                  } catch {
                    return attorney.working_hours;
                  }
                })()}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                * Hours shown may reflect the day of the data export. Verify directly with the firm.
              </p>
            </div>
          )}
        </div>

        {/* Right column — lead capture forms */}
        <div className="space-y-5">
          {/* Send a message form */}
          <AttorneyMessageForm
            attorneyName={attorney.name ?? ""}
            attorneySlug={attorney.slug}
          />

          {/* Checklist lead form */}
          <ChecklistForm
            attorneyName={attorney.name ?? ""}
            attorneySlug={attorney.slug}
          />

          {attorney.languages && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Languages
              </p>
              <p className="text-sm text-gray-700">{attorney.languages}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-500">Disclaimer:</strong> This
              directory is for informational purposes only. Listing here does not
              constitute an endorsement or legal referral. Always conduct your
              own due diligence before hiring an attorney.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Attorney, parseSpecializations } from "@/lib/attorneys";

interface Props {
  attorney: Attorney;
}

export default function AttorneyCard({ attorney }: Props) {
  const specs = parseSpecializations(attorney.specializations_found).slice(0, 3);
  const rating = attorney.rating ? Number(attorney.rating.toFixed(1)) : null;
  const isFreeConsult = attorney.free_consultation === "YES";

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-serif font-bold text-navy-800 text-lg leading-snug">
            {attorney.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {attorney.city}, {attorney.state}
          </p>
        </div>
        {isFreeConsult && (
          <span className="shrink-0 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            Free Consult
          </span>
        )}
      </div>

      {rating !== null && (
        <div className="flex items-center gap-1.5">
          <div className="flex text-yellow-400 text-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {rating >= star ? "★" : rating >= star - 0.5 ? "½" : "☆"}
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{rating}</span>
          {attorney.reviews && (
            <span className="text-sm text-gray-400">
              ({Math.round(attorney.reviews)} reviews)
            </span>
          )}
        </div>
      )}

      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specs.map((s) => (
            <span
              key={s}
              className="bg-navy-50 text-navy-700 text-xs px-2.5 py-1 rounded-full capitalize"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-2">
        <Link
          href={`/attorney/${attorney.slug}`}
          className="btn-primary text-sm py-2 px-5 text-center w-full block"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

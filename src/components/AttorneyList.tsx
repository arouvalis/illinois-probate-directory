"use client";

import { useMemo, useState } from "react";
import AttorneyCard from "./AttorneyCard";
import type { Attorney } from "@/lib/attorneys";

type SortKey = "name" | "city" | "rating";

const byName = (a: Attorney, b: Attorney) =>
  (a.name ?? "").localeCompare(b.name ?? "", "en", { sensitivity: "base" });

const SORTS: Record<SortKey, { label: string; compare: (a: Attorney, b: Attorney) => number }> = {
  name: { label: "Name (A–Z)", compare: byName },
  city: {
    label: "City (A–Z)",
    compare: (a, b) => (a.city ?? "").localeCompare(b.city ?? "") || byName(a, b),
  },
  rating: {
    label: "Google rating",
    // Highest rating first; ties go to the listing with more reviews; unrated listings last.
    compare: (a, b) =>
      (b.rating ?? -1) - (a.rating ?? -1) || (b.reviews ?? 0) - (a.reviews ?? 0) || byName(a, b),
  },
};

interface Props {
  attorneys: Attorney[];
  heading: string;
  gridClassName?: string;
}

/**
 * A grid of attorney cards with a "Sort by" control. The default order is
 * alphabetical by name, which is neutral: nobody is placed first because of a
 * rating. Visitors can choose to sort by Google rating themselves.
 */
export default function AttorneyList({
  attorneys,
  heading,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5",
}: Props) {
  const [sort, setSort] = useState<SortKey>("name");
  const sorted = useMemo(() => [...attorneys].sort(SORTS[sort].compare), [attorneys, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-serif font-bold text-navy-800">{heading}</h2>
        {attorneys.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-gray-500">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              {(Object.keys(SORTS) as SortKey[]).map((key) => (
                <option key={key} value={key}>{SORTS[key].label}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className={gridClassName}>
        {sorted.map((attorney) => (
          <AttorneyCard key={attorney.slug} attorney={attorney} />
        ))}
      </div>
    </div>
  );
}

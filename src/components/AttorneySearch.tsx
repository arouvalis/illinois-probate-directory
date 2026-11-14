"use client";

import { useState, useMemo, type ReactNode } from "react";
import AttorneyList from "./AttorneyList";
import type { Attorney } from "@/lib/attorneys";

interface Props {
  attorneys: Attorney[];
  totalCount?: number;
  placeholder?: string;
  /** Passed to AttorneyList: shown after the 9th listing (or the last, if fewer). */
  insert?: ReactNode;
}

export default function AttorneySearch({
  attorneys,
  totalCount,
  placeholder = "Search by name, firm, or city…",
  insert,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return attorneys;
    return attorneys.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
    );
  }, [query, attorneys]);

  const total = totalCount ?? attorneys.length;

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">
            No attorneys matched &ldquo;{query}&rdquo;. Try a different name or city.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-3 text-sm text-navy-700 font-semibold hover:underline"
          >
            Clear search
          </button>
          {insert && <div className="mt-10 text-left">{insert}</div>}
        </div>
      ) : (
        <AttorneyList
          attorneys={filtered}
          insert={insert}
          heading={
            query
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`
              : `${total} Attorney Listings`
          }
        />
      )}
    </div>
  );
}

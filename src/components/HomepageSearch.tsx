"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AttorneyCard from "./AttorneyCard";
import type { Attorney } from "@/lib/attorneys";

interface Props {
  attorneys: Attorney[];
}

export default function HomepageSearch({ attorneys }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return attorneys.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
    );
  }, [query, attorneys]);

  const hasQuery = query.trim().length > 0;

  return (
    <section className="py-12 px-4 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-serif font-bold text-navy-800 mb-2 text-center">
          Search All Attorneys
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Search by attorney name, firm name, or city across all 6 counties.
        </p>

        {/* Search input */}
        <div className="relative max-w-xl mx-auto mb-8">
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
            placeholder="Search by name, firm, or city…"
            className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
          {hasQuery && (
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

        {/* Results */}
        {hasQuery && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filtered.length === 0
                ? `No attorneys matched "${query}".`
                : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`}
            </p>
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">
                Try a different name or city, or{" "}
                <Link href="/" className="text-navy-700 hover:underline" onClick={() => setQuery("")}>
                  browse by county
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.slice(0, 12).map((attorney) => (
                  <AttorneyCard key={attorney.slug} attorney={attorney} />
                ))}
              </div>
            )}
            {filtered.length > 12 && (
              <p className="text-center text-sm text-gray-400 mt-6">
                Showing top 12 results. Browse by county to see all.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

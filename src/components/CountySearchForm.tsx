"use client";

import { useRouter } from "next/navigation";
import { COUNTY_NAMES, COUNTY_SLUG_MAP } from "@/lib/attorneys";

export default function CountySearchForm() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const select = e.currentTarget.querySelector("select") as HTMLSelectElement;
    if (select.value) router.push(select.value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <select
        name="county"
        defaultValue=""
        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
      >
        <option value="" disabled>Select a county…</option>
        {COUNTY_NAMES.map((county) => (
          <option key={county} value={`/county/${COUNTY_SLUG_MAP[county]}`}>
            {county} County
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-navy-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors text-sm whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
}

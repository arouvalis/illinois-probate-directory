"use client";

import { useState } from "react";

const COUNTIES = ["Cook", "Lake", "Will", "Kane", "McHenry", "DuPage", "Other"];

interface FormData {
  name: string;
  email: string;
  phone: string;
  county: string;
  hasRealEstate: string;
}

export default function HomepageLeadForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    county: "",
    hasRealEstate: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formType: "homepage" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl p-8 max-w-lg mx-auto shadow-2xl text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif font-bold text-navy-800 text-xl mb-2">
          We received your request!
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thanks, {form.name}. We&apos;ll match you with qualified probate attorneys
          in {form.county === "Other" ? "your area" : `${form.county} County`} shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 max-w-lg mx-auto shadow-2xl">
      <h2 className="font-serif font-bold text-navy-900 text-xl mb-1 text-center">
        Get Help Finding the Right Probate Attorney in Illinois
      </h2>
      <p className="text-gray-400 text-sm text-center mb-5">
        Free. No obligation. Takes 30 seconds.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">
            Phone Number (optional)
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
            placeholder="(312) 555-0100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">
            County <span className="text-red-500">*</span>
          </label>
          <select
            name="county"
            required
            value={form.county}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">Select your county…</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c === "Other" ? "Other Illinois County" : `${c} County`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-navy-800 mb-2">
            Does the estate include real estate? <span className="text-red-500">*</span>
          </p>
          <div className="flex gap-5">
            {["Yes", "No", "Not Sure"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="hasRealEstate"
                  value={opt}
                  required
                  checked={form.hasRealEstate === opt}
                  onChange={handleChange}
                  className="text-navy-700 focus:ring-navy-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-700 text-white py-3 px-6 rounded-lg font-bold text-base hover:bg-navy-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting…" : "Get Free Attorney Matches →"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          No spam. Your info is never sold or shared.
        </p>
      </form>
    </div>
  );
}

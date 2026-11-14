"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { EMPTY_LEAD_DETAILS, type LeadDetails } from "@/lib/leadOptions";
import LeadDetailFields, { Honeypot } from "./LeadDetailFields";
const COUNTIES = ["Cook", "Lake", "Will", "Kane", "McHenry", "DuPage", "Other"];

interface FormData {
  name: string;
  email: string;
  phone: string;
  county: string;
}

export default function HomepageLeadForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    county: "",
  });
  const [details, setDetails] = useState<LeadDetails>(EMPTY_LEAD_DETAILS);
  const [trap, setTrap] = useState("");
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
        body: JSON.stringify({ ...form, ...details, formType: "homepage", company_website: trap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
      trackEvent("generate_lead", { form_name: "homepage", lead_path: "find_attorney", has_real_estate: details.hasRealEstate || undefined });
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
          Thanks, {form.name}. Your request went to Andy Rouvalis, who runs this directory. He reads
          every request himself and will email you at {form.email} with probate attorneys
          in {form.county === "Other" ? "your area" : `${form.county} County`} to consider.
        </p>
      </div>
    );
  }

  return (
    <div id="lead-form" className="bg-white rounded-xl p-6 max-w-lg mx-auto shadow-2xl">
      <h2 className="font-serif font-bold text-navy-900 text-xl mb-1 text-center">
        Get Help Finding the Right Probate Attorney in Illinois
      </h2>
      <p className="text-gray-400 text-sm text-center mb-5">
        Free. No obligation. Tell us your county and we&apos;ll email you attorneys to consider.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <Honeypot value={trap} onChange={setTrap} />
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

        <LeadDetailFields
          idPrefix="hp"
          values={details}
          onChange={(name, value) => setDetails((prev) => ({ ...prev, [name]: value }))}
        />

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
          {loading ? "Submitting…" : "Help Me Find an Attorney →"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          No spam. Your details are never sold. Your request goes to Andy Rouvalis, who runs this directory.
        </p>
      </form>
    </div>
  );
}

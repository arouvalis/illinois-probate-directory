"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { EMPTY_LEAD_DETAILS, type LeadDetails } from "@/lib/leadOptions";
import LeadDetailFields, { Honeypot } from "./LeadDetailFields";

interface Props {
  attorneySlug: string;
}

export default function ChecklistForm({ attorneySlug }: Props) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [details, setDetails] = useState<LeadDetails>(EMPTY_LEAD_DETAILS);
  const [trap, setTrap] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        body: JSON.stringify({ ...form, ...details, formType: "checklist", attorneySlug, company_website: trap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
      trackEvent("generate_lead", {
        form_name: "checklist",
        lead_path: "checklist",
        has_real_estate: details.hasRealEstate || undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center" role="status">
        <p className="font-semibold text-blue-800 text-sm mb-1">Checklist sent</p>
        <p className="text-blue-700 text-xs">
          We emailed the Illinois Probate Checklist to {form.email}. If you don&apos;t see it in a few
          minutes, check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-navy-50 border border-navy-100 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-2xl mt-0.5">📋</div>
        <div>
          <h2 className="font-serif font-bold text-navy-800 text-base">
            Get Our Free Illinois Probate Checklist
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            The steps of Illinois probate in one short list, emailed to you right away.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 relative">
        <Honeypot value={trap} onChange={setTrap} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cl-name" className="block text-xs font-medium text-navy-800 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cl-name"
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label htmlFor="cl-email" className="block text-xs font-medium text-navy-800 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="cl-email"
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        <LeadDetailFields
          idPrefix="cl"
          compact
          values={details}
          onChange={(name, value) => setDetails((prev) => ({ ...prev, [name]: value }))}
        />

        {error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-navy-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending…" : "Send Me the Free Checklist"}
        </button>
        <p className="text-[11px] text-gray-400 text-center leading-snug">
          Your request also goes to the person who runs this directory.
        </p>
      </form>
    </div>
  );
}

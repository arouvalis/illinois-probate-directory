"use client";

import { useState } from "react";

interface Props {
  attorneyName: string;
  attorneySlug: string;
}

interface FormData {
  name: string;
  email: string;
  hasRealEstate: string;
}

export default function ChecklistForm({ attorneyName, attorneySlug }: Props) {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    hasRealEstate: "",
  });
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
        body: JSON.stringify({ ...form, formType: "checklist", attorneyName, attorneySlug }),
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
        <p className="font-semibold text-blue-800 text-sm mb-1">Checklist on its way!</p>
        <p className="text-blue-700 text-xs">
          We&apos;ll email the Illinois Probate Checklist to {form.email} shortly.
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
            A step-by-step guide to navigating probate in Illinois — sent to your inbox.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-navy-800 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
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
            <label className="block text-xs font-medium text-navy-800 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
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

        <div>
          <p className="text-xs font-medium text-navy-800 mb-1.5">
            Does the estate include real estate? <span className="text-red-500">*</span>
          </p>
          <div className="flex gap-4">
            {["Yes", "No", "Not Sure"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
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
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">
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
      </form>
    </div>
  );
}

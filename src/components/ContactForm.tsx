"use client";

import { useState } from "react";

interface ContactFormProps {
  attorneyName: string;
  attorneySlug: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  county: string;
  description: string;
  hasRealEstate: string;
}

interface RevealedContact {
  phone: string | null;
  website: string | null;
}

export default function ContactForm({ attorneyName, attorneySlug }: ContactFormProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<RevealedContact | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    county: "",
    description: "",
    hasRealEstate: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attorneyName, attorneySlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Contact details returned from server — never in initial page HTML
      setRevealed({ phone: data.phone ?? null, website: data.website ?? null });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-navy-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-800 transition-colors duration-200 flex items-center justify-center gap-2 text-base"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Get Contact Info &amp; Send Message
      </button>
    );
  }

  if (submitted && revealed) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-green-800 font-semibold text-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Message Sent Successfully
        </div>
        <p className="text-green-700 text-sm">
          Your message has been sent. Here is the attorney&apos;s contact information:
        </p>
        <div className="bg-white rounded border border-green-200 p-4 space-y-3">
          {revealed.phone && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</p>
              <a
                href={`tel:${revealed.phone}`}
                className="text-navy-700 font-semibold text-lg hover:underline flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {revealed.phone}
              </a>
            </div>
          )}
          {revealed.website && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Website</p>
              <a
                href={revealed.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-700 hover:underline text-sm break-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {revealed.website.replace(/^https?:\/\//, "").split("?")[0]}
              </a>
            </div>
          )}
          {!revealed.phone && !revealed.website && (
            <p className="text-gray-500 text-sm italic">Contact details not available for this listing.</p>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Expect a response within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-navy-200 bg-navy-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-navy-800 text-lg">Send a Message</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close form"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">
              Your Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
              placeholder="(312) 555-0123"
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
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="">Select county…</option>
              {["Cook", "Lake", "Will", "Kane", "McHenry", "DuPage", "Other"].map((c) => (
                <option key={c} value={c}>{c} County</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">
            Brief Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white resize-none"
            placeholder="Briefly describe your situation…"
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-navy-800 mb-2">
            Does the estate include real estate? <span className="text-red-500">*</span>
          </p>
          <div className="flex flex-wrap gap-4">
            {["Yes", "No", "Not Sure"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
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
          className="w-full bg-navy-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending…" : "Send Message & Reveal Contact Info"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Your information is only shared with the attorney you contact.
        </p>
      </form>
    </div>
  );
}

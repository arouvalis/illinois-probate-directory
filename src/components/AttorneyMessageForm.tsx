"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { EMPTY_LEAD_DETAILS, type LeadDetails } from "@/lib/leadOptions";
import LeadDetailFields, { Honeypot } from "./LeadDetailFields";

interface Props {
  attorneyName: string;
  attorneySlug: string;
  /** True when we have an email address on file for this attorney. */
  hasEmailOnFile: boolean;
}

export default function AttorneyMessageForm({ attorneyName, attorneySlug, hasEmailOnFile }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", description: "" });
  const [details, setDetails] = useState<LeadDetails>(EMPTY_LEAD_DETAILS);
  const [trap, setTrap] = useState("");
  const [loading, setLoading] = useState(false);
  // Set from the server's answer, so the confirmation describes what actually happened.
  const [delivery, setDelivery] = useState<"attorney" | "owner" | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        body: JSON.stringify({ ...form, ...details, attorneySlug, company_website: trap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDelivery(data.delivery === "attorney" ? "attorney" : "owner");
      trackEvent("generate_lead", {
        form_name: "attorney_message",
        lead_path: "contact_attorney",
        delivery: data.delivery === "attorney" ? "attorney_email" : "owner_call",
        has_real_estate: details.hasRealEstate || undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (delivery) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center" role="status">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {delivery === "attorney" ? (
          <>
            <p className="font-semibold text-green-800 mb-1">Message sent</p>
            <p className="text-green-700 text-sm">
              We emailed your message to {attorneyName}. They will reply to you directly at {form.email}.
              Response times are up to the firm.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-green-800 mb-1">Request received</p>
            <p className="text-green-700 text-sm">
              We&apos;ve received your request and will connect you with {attorneyName} within 1 business day.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-serif font-bold text-navy-800 text-lg mb-1">
        Send This Attorney a Message
      </h2>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        {hasEmailOnFile
          ? `Your message is emailed to ${attorneyName}. The person who runs this directory also receives a copy.`
          : `We don't have an email address for ${attorneyName} yet, so your message comes to us and we pass it to the firm within 1 business day.`}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <Honeypot value={trap} onChange={setTrap} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="am-name" className="block text-sm font-medium text-navy-800 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="am-name"
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label htmlFor="am-email" className="block text-sm font-medium text-navy-800 mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              id="am-email"
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="am-phone" className="block text-sm font-medium text-navy-800 mb-1">
            Your Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="am-phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            placeholder="(312) 555-0123"
          />
        </div>

        <div>
          <label htmlFor="am-description" className="block text-sm font-medium text-navy-800 mb-1">
            Message <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="am-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none"
            placeholder="Briefly describe your situation…"
          />
        </div>

        <LeadDetailFields
          idPrefix="am"
          values={details}
          onChange={(name, value) => setDetails((prev) => ({ ...prev, [name]: value }))}
        />

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending…" : "Send Message"}
        </button>

        {(details.hasRealEstate === "Yes" || details.hasRealEstate === "Not Sure") && (
          <p className="text-sm text-gray-500">
            <a href="/for-families" data-property-placement="attorney_form" className="underline hover:text-navy-800">Estate includes a house? See what to expect →</a>
          </p>
        )}
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { trackEvent, trackEventWhenReady } from "@/lib/analytics";
import { Honeypot } from "./LeadDetailFields";

const COUNTIES = ["Cook", "DuPage", "Kane", "Lake", "McHenry", "Will"];

interface Props {
  attorneySlug: string;
  attorneyName: string;
  phone: string;
  website: string;
  county: string;
}

const label = "block text-sm font-medium text-navy-800 mb-1";
const input =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500";
const required = <span className="text-red-500">*</span>;
const optional = <span className="text-gray-400 font-normal">(optional)</span>;

/** Campaign label from the link, e.g. /verify-listing/some-firm?src=email */
function readSrc(): string {
  const raw = new URLSearchParams(window.location.search).get("src") ?? "";
  return /^[A-Za-z0-9_-]{1,40}$/.test(raw) ? raw.toLowerCase() : "direct";
}

export default function VerifyListingForm({ attorneySlug, attorneyName, phone, website, county }: Props) {
  const [form, setForm] = useState({ contactName: "", email: "", phone, website, corrections: "" });
  const [counties, setCounties] = useState<string[]>(COUNTIES.includes(county) ? [county] : []);
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [src, setSrc] = useState("direct");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");

  // GA4: one verify_listing_start each time the page is opened.
  useEffect(() => {
    const s = readSrc();
    setSrc(s);
    trackEventWhenReady("verify_listing_start", { src: s, listing: attorneySlug });
  }, [attorneySlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, counties, consent, src, attorneySlug, company_website: trap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSentTo(form.email);
      trackEvent("verify_listing_submit", { src, listing: attorneySlug });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6" role="status">
        <p className="font-semibold text-green-800 mb-1">Check your inbox</p>
        <p className="text-green-700 text-sm leading-relaxed">
          We sent a confirmation link to {sentTo}. Nothing changes until you open it and press Confirm.
          The link works for 7 days. If it doesn&apos;t arrive in a few minutes, check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-serif font-bold text-navy-800 text-lg mb-1">Confirm your details</h2>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Your email address is used only to send you inquiries from people who contact {attorneyName} through
          this directory. It is never shown on the site.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <Honeypot value={trap} onChange={setTrap} />

          <div>
            <label htmlFor="vl-contactName" className={label}>Attorney or firm contact name {required}</label>
            <input id="vl-contactName" type="text" name="contactName" required maxLength={120} value={form.contactName} onChange={handleChange} className={input} autoComplete="name" />
          </div>

          <div>
            <label htmlFor="vl-email" className={label}>Email for client inquiries {required}</label>
            <input id="vl-email" type="email" name="email" required maxLength={200} value={form.email} onChange={handleChange} className={input} autoComplete="email" placeholder="name@yourfirm.com" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vl-phone" className={label}>Phone {optional}</label>
              <input id="vl-phone" type="tel" name="phone" maxLength={40} value={form.phone} onChange={handleChange} className={input} autoComplete="tel" />
            </div>
            <div>
              <label htmlFor="vl-website" className={label}>Website {optional}</label>
              <input id="vl-website" type="text" name="website" maxLength={200} value={form.website} onChange={handleChange} className={input} inputMode="url" />
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-navy-800 mb-2">Counties served {optional}</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COUNTIES.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={counties.includes(c)}
                    onChange={(e) => setCounties((prev) => (e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)))}
                    className="rounded text-navy-700 focus:ring-navy-500"
                  />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="vl-corrections" className={label}>Corrections to your listing {optional}</label>
            <textarea id="vl-corrections" name="corrections" rows={3} maxLength={2000} value={form.corrections} onChange={handleChange} className={`${input} resize-none`} placeholder="Anything wrong or out of date: name, address, practice areas, hours…" />
          </div>

          <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-800">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 rounded text-navy-700 focus:ring-navy-500" />
            <span>I&apos;d like to receive client inquiries from IllinoisProbateDirectory.com {required}</span>
          </label>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2" role="alert">{error}</p>
          )}

          <button type="submit" disabled={loading} className="w-full bg-navy-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Sending…" : "Send me a confirmation link"}
          </button>
          <p className="text-xs text-gray-500 leading-relaxed">
            We email a link to the address above. Nothing changes until you confirm it, and the person who runs
            the directory reviews each request. There is no charge.
          </p>
        </form>
      </div>

      <RemovalRequest attorneySlug={attorneySlug} attorneyName={attorneyName} />
    </div>
  );
}

/** Goes to the site owner only. Nothing is removed automatically. */
function RemovalRequest({ attorneySlug, attorneyName }: { attorneySlug: string; attorneyName: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [trap, setTrap] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listing-removal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attorneySlug, company_website: trap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
      trackEvent("listing_removal_request", { listing: attorneySlug });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-5" role="status">
        Your removal request was sent to the person who runs the directory. Listings are not removed
        automatically; they will review it and may contact the firm to confirm.
      </p>
    );
  }

  return (
    <details className="bg-gray-50 rounded-xl border border-gray-200 p-5">
      <summary className="cursor-pointer text-sm text-gray-600 hover:text-navy-800 select-none">
        Prefer not to be listed? Ask for this listing to be removed
      </summary>
      <form onSubmit={handleSubmit} className="space-y-3 mt-4 relative">
        <Honeypot value={trap} onChange={setTrap} />
        <p className="text-xs text-gray-500 leading-relaxed">
          This sends a request for {attorneyName} to the person who runs the directory. Nothing is removed
          automatically; requests are reviewed by hand.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="rm-name" className={label}>Your name {required}</label>
            <input id="rm-name" type="text" name="name" required maxLength={120} value={form.name} onChange={handleChange} className={input} />
          </div>
          <div>
            <label htmlFor="rm-email" className={label}>Your email {required}</label>
            <input id="rm-email" type="email" name="email" required maxLength={200} value={form.email} onChange={handleChange} className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="rm-phone" className={label}>Phone {optional}</label>
          <input id="rm-phone" type="tel" name="phone" maxLength={40} value={form.phone} onChange={handleChange} className={input} />
        </div>
        <div>
          <label htmlFor="rm-message" className={label}>Reason {optional}</label>
          <textarea id="rm-message" name="message" rows={2} maxLength={2000} value={form.message} onChange={handleChange} className={`${input} resize-none`} />
        </div>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2" role="alert">{error}</p>
        )}
        <button type="submit" disabled={loading} className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-60">
          {loading ? "Sending…" : "Send removal request"}
        </button>
      </form>
    </details>
  );
}

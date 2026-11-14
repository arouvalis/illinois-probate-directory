// INTERNAL attorney records (data/attorney-records.json). Server-side only:
// never import this from a "use client" component, or attorney emails and
// notes would be shipped to the browser.
import records from "../../data/attorney-records.json";

export interface AttorneyRecord {
  email?: string;
  phone_override?: string;
  referral_preference?: string;
  last_verified?: string;
  leads_sent?: number;
  outcomes?: string;
  notes?: string;
}

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

export function getAttorneyRecord(slug: string): AttorneyRecord | null {
  if (!slug || slug.startsWith("_")) return null;
  const rec = (records as Record<string, unknown>)[slug];
  return rec && typeof rec === "object" ? (rec as AttorneyRecord) : null;
}

/**
 * The address a "contact this attorney" lead should be emailed to, or null
 * when we have none (the lead then goes to the site owner to pass on by phone).
 *
 * ATTORNEY_EMAIL_OVERRIDE is a testing switch: when set, every attorney is
 * treated as having that address, so the "we have an email" path can be tried
 * on a preview deployment without emailing a real law firm.
 */
export function getAttorneyLeadEmail(slug: string): string | null {
  const override = process.env.ATTORNEY_EMAIL_OVERRIDE?.trim();
  if (override) return EMAIL_RE.test(override) ? override : null;
  const rec = getAttorneyRecord(slug);
  if (!rec?.email) return null;
  if ((rec.referral_preference ?? "").trim().toLowerCase() === "do not send") return null;
  const email = rec.email.trim();
  return EMAIL_RE.test(email) ? email : null;
}

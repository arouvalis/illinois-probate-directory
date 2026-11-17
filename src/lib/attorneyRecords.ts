// INTERNAL attorney records (data/attorney-records.json). Server-side only:
// never import this from a "use client" component, or attorney emails and
// notes would be shipped to the browser.
import records from "../../data/attorney-records.json";
import { getVerifiedListing } from "./verifyListing";

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
 * The address on file in data/attorney-records.json only. This is what is
 * known when the site is built; use resolveAttorneyLeadEmail when sending.
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

/**
 * The address a "contact this attorney" lead should be emailed to, or null
 * when we have none (the lead then goes to the site owner to pass on by phone).
 *
 * Order: the testing override; then "do not send" in attorney-records.json,
 * which always wins; then an email the attorney verified and the owner
 * approved (saved in the database, so it works without a redeploy); then the
 * email typed into attorney-records.json by hand.
 */
export async function resolveAttorneyLeadEmail(slug: string): Promise<string | null> {
  const override = process.env.ATTORNEY_EMAIL_OVERRIDE?.trim();
  if (override) return EMAIL_RE.test(override) ? override : null;
  const rec = getAttorneyRecord(slug);
  if ((rec?.referral_preference ?? "").trim().toLowerCase() === "do not send") return null;
  try {
    const verified = (await getVerifiedListing(slug))?.email?.trim();
    if (verified && EMAIL_RE.test(verified)) return verified;
  } catch (err) {
    // If the database cannot be reached the lead still goes out, by the older route.
    console.error("Could not read the verified email for", slug, err);
  }
  return getAttorneyLeadEmail(slug);
}

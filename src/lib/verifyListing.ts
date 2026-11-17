// "Verify your listing": an attorney confirms their details and gives an email
// address for client inquiries.
//
//   1. They submit the form        -> request saved, confirmation link emailed to them.
//   2. They click the link         -> the site owner is emailed approve / reject links.
//   3. The owner approves          -> the email is saved as that listing's lead address.
//
// Nothing about lead routing changes before step 3, and the public listing is
// never changed by this flow. Every link carries a signature made with
// VERIFY_LISTING_SECRET, so a link cannot be made up or altered.
//
// Server-side only: this file handles attorney email addresses, which are
// never shown on the site.
import { createHmac, randomBytes, timingSafeEqual, createHash } from "crypto";
import { storeConfigured, storeGet, storeSet, storeDelete } from "./store";
import { COUNTY_NAMES } from "./attorneys";

export type VerifyStatus = "pending_email" | "awaiting_approval" | "approved" | "rejected" | "revoked";
export type LinkAction = "confirm" | "approve" | "reject" | "revoke";

export interface VerifyRequest {
  id: string;
  slug: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  counties: string[];
  corrections: string;
  /** Where the visitor came from, e.g. "email" for a campaign link. */
  src: string;
  status: VerifyStatus;
  createdAt: string;
  confirmedAt?: string;
  decidedAt?: string;
}

/** What is saved for a listing once the owner approves. Internal, never published. */
export interface VerifiedListing {
  email: string;
  contact_name: string;
  phone: string;
  website: string;
  counties: string[];
  consent_at: string;
  approved_at: string;
  request_id: string;
}

export const CONFIRM_DAYS = 7;
const DAY = 24 * 60 * 60;
const CONFIRM_TTL = CONFIRM_DAYS * DAY;
const APPROVAL_TTL = 90 * DAY;

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

// ── Signed links ────────────────────────────────────────────────────────────

function secret(): string | null {
  const s = process.env.VERIFY_LISTING_SECRET?.trim();
  if (s && s.length >= 16) return s;
  return process.env.NODE_ENV !== "production" ? "local-development-only-secret" : null;
}

/** False when the database or the signing secret is missing on the live site. */
export function verifyAvailable(): boolean {
  return storeConfigured() && secret() !== null;
}

export function sign(action: LinkAction, id: string): string {
  const key = secret();
  if (!key) throw new Error("VERIFY_LISTING_SECRET is not set");
  return createHmac("sha256", key).update(`${action}.${id}`).digest("base64url");
}

export function signatureValid(action: LinkAction, id: string, sig: unknown): boolean {
  if (typeof sig !== "string" || !secret() || !/^[a-f0-9]{32}$/.test(id)) return false;
  const expected = Buffer.from(sign(action, id));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** The address links in emails point to: the live site, or the preview being tested. */
export function siteBase(req: Request): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_ENV === "production") return "https://www.illinoisprobatedirectory.com";
  const preview = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;
  return process.env.NODE_ENV === "production" ? "https://www.illinoisprobatedirectory.com" : new URL(req.url).origin;
}

export function confirmLink(base: string, id: string): string {
  return `${base}/verify-listing/confirm?id=${id}&sig=${sign("confirm", id)}`;
}

export function reviewLink(base: string, id: string, action: "approve" | "reject" | "revoke"): string {
  return `${base}/verify-listing/review?id=${id}&action=${action}&sig=${sign(action, id)}`;
}

// ── Form input ──────────────────────────────────────────────────────────────

function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  const stripped = multiline
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    : value.replace(/[\u0000-\u001F\u007F]+/g, " ");
  return stripped.trim().slice(0, max);
}

/** Campaign label from ?src=, e.g. "email". Letters, digits, dash and underscore only. */
export function cleanSrc(value: unknown): string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(value) ? value.toLowerCase() : "direct";
}

export type VerifyInput = Pick<VerifyRequest, "contactName" | "email" | "phone" | "website" | "counties" | "corrections" | "src">;

export function parseVerifyInput(body: Record<string, unknown>): { ok: true; input: VerifyInput } | { ok: false; error: string } {
  const contactName = clean(body.contactName, 120);
  const email = clean(body.email, 200).toLowerCase();
  if (!contactName) return { ok: false, error: "Please enter the attorney or firm contact name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (body.consent !== true) {
    return { ok: false, error: "Please tick the box to confirm you'd like to receive client inquiries." };
  }
  const counties = Array.isArray(body.counties)
    ? COUNTY_NAMES.filter((c) => (body.counties as unknown[]).includes(c))
    : [];
  return {
    ok: true,
    input: {
      contactName,
      email,
      phone: clean(body.phone, 40),
      website: clean(body.website, 200),
      counties,
      corrections: clean(body.corrections, 2000, true),
      src: cleanSrc(body.src),
    },
  };
}

// ── Stored requests and approved listings ───────────────────────────────────

export function newRequestId(): string {
  return randomBytes(16).toString("hex");
}

export function emailKey(email: string): string {
  return createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 24);
}

export function getRequest(id: string): Promise<VerifyRequest | null> {
  return storeGet<VerifyRequest>(`verify:req:${id}`);
}

export function saveRequest(req: VerifyRequest): Promise<void> {
  // An unconfirmed request disappears after a week; a confirmed one waits 90
  // days for a decision; decided requests are kept as a record.
  const ttl = req.status === "pending_email" ? CONFIRM_TTL : req.status === "awaiting_approval" ? APPROVAL_TTL : undefined;
  return storeSet(`verify:req:${req.id}`, req, ttl);
}

export function deleteRequest(id: string): Promise<void> {
  return storeDelete(`verify:req:${id}`);
}

export function getVerifiedListing(slug: string): Promise<VerifiedListing | null> {
  return storeGet<VerifiedListing>(`attorney:${slug}`);
}

export function saveVerifiedListing(slug: string, listing: VerifiedListing): Promise<void> {
  return storeSet(`attorney:${slug}`, listing);
}

export function deleteVerifiedListing(slug: string): Promise<void> {
  return storeDelete(`attorney:${slug}`);
}

// ── Help for the owner's review ─────────────────────────────────────────────

const FREE_MAIL = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com", "comcast.net", "sbcglobal.net", "att.net", "msn.com", "live.com", "me.com", "proton.me", "protonmail.com"];

/** One line telling the owner whether the email looks like it belongs to the firm. */
export function emailDomainNote(email: string, listingWebsite: string | null): string {
  const domain = email.split("@")[1] ?? "";
  let host = "";
  try {
    host = listingWebsite ? new URL(/^https?:\/\//.test(listingWebsite) ? listingWebsite : `https://${listingWebsite}`).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  if (host && (domain === host || domain.endsWith(`.${host}`) || host.endsWith(`.${domain}`))) {
    return `Matches the website on the listing (${host}).`;
  }
  if (FREE_MAIL.includes(domain)) {
    return `A free email provider (${domain}), so it cannot be matched to the firm's website${host ? ` (${host})` : ""}. Consider calling the firm to confirm.`;
  }
  return host
    ? `DOES NOT MATCH the website on the listing (${host}). Consider calling the firm to confirm.`
    : `Cannot be checked: the listing has no website. Consider calling the firm to confirm.`;
}

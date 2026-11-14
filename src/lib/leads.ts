// Shared server-side lead handling: cleaning input, spam checks, and the
// wording that is common to every lead email.
import {
  REAL_ESTATE_OPTIONS,
  PROBATE_STAGE_OPTIONS,
  TIMELINE_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from "./leadOptions";

export interface Lead {
  name: string;
  email: string;
  phone: string;
  message: string;
  county: string;
  hasRealEstate: string;
  propertyLocation: string;
  probateStage: string;
  timeline: string;
  relationship: string;
}

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const COUNTIES = ["Cook", "Lake", "Will", "Kane", "McHenry", "DuPage", "Other"];

function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  const stripped = multiline
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    : value.replace(/[\u0000-\u001F\u007F]+/g, " ");
  return stripped.trim().slice(0, max);
}

function oneOf(value: unknown, allowed: readonly string[]): string {
  return typeof value === "string" && allowed.includes(value) ? value : "";
}

export type ParseResult =
  | { ok: true; lead: Lead }
  | { ok: false; spam: true }
  | { ok: false; spam: false; error: string };

/** Only name and email are required. Everything else is optional. */
export function parseLead(body: Record<string, unknown>): ParseResult {
  // Honeypot: a field real visitors never see. Bots fill it in.
  if (clean(body.company_website, 200)) return { ok: false, spam: true };

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  if (!name || !email) return { ok: false, spam: false, error: "Please enter your name and email." };
  if (!EMAIL_RE.test(email)) return { ok: false, spam: false, error: "Please enter a valid email address." };

  return {
    ok: true,
    lead: {
      name,
      email,
      phone: clean(body.phone, 40),
      message: clean(body.message ?? body.description, 4000, true),
      county: oneOf(body.county, COUNTIES),
      hasRealEstate: oneOf(body.hasRealEstate, REAL_ESTATE_OPTIONS),
      propertyLocation: clean(body.propertyLocation, 120),
      probateStage: oneOf(body.probateStage, PROBATE_STAGE_OPTIONS),
      timeline: oneOf(body.timeline, TIMELINE_OPTIONS),
      relationship: oneOf(body.relationship, RELATIONSHIP_OPTIONS),
    },
  };
}

/** A lead is a property lead when the visitor says the estate includes real estate. */
export function isPropertyLead(lead: Lead): boolean {
  return lead.hasRealEstate === "Yes";
}

export function withPropertyFlag(subject: string, property: boolean): string {
  return property ? `PROPERTY LEAD: ${subject}` : subject;
}

export function countyLabel(county: string): string {
  if (!county) return "Not provided";
  return county === "Other" ? "Other Illinois county" : `${county} County`;
}

/** The visitor's details, laid out the same way in every email. */
export function leadDetailsBlock(lead: Lead, opts: { county?: boolean } = {}): string {
  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone || "Not provided"],
  ];
  if (opts.county) rows.push(["County", countyLabel(lead.county)]);
  rows.push(
    ["Estate includes real estate", lead.hasRealEstate || "Not answered"],
    ["Property city or ZIP", lead.propertyLocation || "Not provided"],
    ["Stage of probate", lead.probateStage || "Not provided"],
    ["Timeline", lead.timeline || "Not provided"],
    ["Relationship to the estate", lead.relationship || "Not provided"],
  );
  const width = Math.max(...rows.map(([label]) => label.length)) + 1;
  const lines = rows.map(([label, value]) => `  ${(label + ":").padEnd(width + 1)}${value}`);
  return `${lines.join("\n")}\n\nMessage:\n${lead.message || "No message provided"}`;
}

// Best-effort rate limit: at most 5 submissions per 10 minutes from one address.
// It lives in memory, so it resets when the server restarts; it slows down
// floods, it is not a guarantee.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function rateLimited(req: Request): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export const TOO_MANY = "Too many requests. Please wait a few minutes and try again.";

// Unsubscribe list for campaign emails (scripts/send-campaign.js).
//
// Every campaign email carries a link like /unsubscribe?t=<token>. The sender
// script saves the token next to the recipient's email address before it sends,
// so the link never contains the address itself (it would otherwise end up in
// analytics and browser history). Pressing the button on that page saves the
// address here, and the sender script skips it from then on.
//
// Server-side only: this file handles email addresses.
import { createHash } from "crypto";
import { storeGet, storeSet } from "./store";

export interface UnsubscribeToken {
  email: string;
  campaign?: string;
  slug?: string;
}

export interface Unsubscribed {
  email: string;
  at: string;
  /** "page" (the button), "one-click" (the mail program's own unsubscribe button) or "manual". */
  via: string;
  campaign?: string;
}

const TOKEN_RE = /^[a-f0-9]{32}$/;

// The same short fingerprint the verify-listing limits use; kept in step with
// emailKey in scripts/lib/campaign.js.
function emailKey(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24);
}

/** The recipient a link belongs to, or null if the link is not one we sent. */
export async function lookupUnsubscribeToken(token: unknown): Promise<UnsubscribeToken | null> {
  if (typeof token !== "string" || !TOKEN_RE.test(token)) return null;
  const found = await storeGet<UnsubscribeToken>(`unsubtoken:${token}`);
  return found && typeof found.email === "string" && found.email.includes("@") ? found : null;
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  return (await storeGet<Unsubscribed>(`unsub:${emailKey(email)}`)) !== null;
}

export async function recordUnsubscribe(found: UnsubscribeToken, via: string): Promise<void> {
  const key = `unsub:${emailKey(found.email)}`;
  // Keep the first date if they press the button twice.
  if (await storeGet<Unsubscribed>(key)) return;
  const entry: Unsubscribed = {
    email: found.email.trim().toLowerCase(),
    at: new Date().toISOString(),
    via,
    ...(found.campaign ? { campaign: found.campaign } : {}),
  };
  await storeSet(key, entry);
}

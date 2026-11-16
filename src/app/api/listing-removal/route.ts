// "Remove this listing" requests. They go to the site owner only. Nothing is
// removed or changed automatically.
import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp, OWNER_EMAIL } from "@/lib/email";
import { getAttorneyBySlug } from "@/lib/attorneys";
import { parseLead, rateLimited, TOO_MANY } from "@/lib/leads";

const SITE = "https://www.illinoisprobatedirectory.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseLead(body);
    if (!parsed.ok) {
      if (parsed.spam) return NextResponse.json({ ok: true });
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    if (rateLimited(req)) return NextResponse.json({ error: TOO_MANY }, { status: 429 });

    const attorney = getAttorneyBySlug(typeof body.attorneySlug === "string" ? body.attorneySlug : "");
    if (!attorney) return NextResponse.json({ error: "We couldn't find that listing." }, { status: 400 });

    const { lead } = parsed;
    const result = await sendEmail({
      to: OWNER_EMAIL,
      replyTo: lead.email,
      subject: `LISTING REMOVAL REQUEST: ${attorney.name ?? attorney.slug}`,
      text: `
LISTING REMOVAL REQUEST
=======================
Someone asked for this listing to be removed. It came only to you and nothing has been changed. Their email address has not been checked, so confirm with the firm (by phone, using the number on the listing) before removing anything.

Listing:   ${attorney.name ?? attorney.slug}
City:      ${attorney.city ?? "Not on file"}
Phone:     ${attorney.phone ?? "Not on file"}
Page:      ${SITE}/attorney/${attorney.slug}

Requested by:  ${lead.name}
Email:         ${lead.email}
Phone:         ${lead.phone || "Not provided"}

Reason:
${lead.message || "None given"}

Replying to this email writes to ${lead.email}.

Sent ${ctTimestamp()}
      `.trim(),
    });
    if (!result.ok) return NextResponse.json({ error: "We couldn't send your request. Please try again." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Listing removal API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

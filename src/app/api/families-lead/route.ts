// The /for-families form: help with an estate property. Goes to the site owner
// and is always a property lead.
import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp, OWNER_EMAIL } from "@/lib/email";
import { parseLead, withPropertyFlag, leadDetailsBlock, countyLabel, rateLimited, TOO_MANY } from "@/lib/leads";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseLead(body);
    if (!parsed.ok) {
      if (parsed.spam) return NextResponse.json({ ok: true });
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    if (rateLimited(req)) return NextResponse.json({ error: TOO_MANY }, { status: 429 });

    const lead = { ...parsed.lead, hasRealEstate: parsed.lead.hasRealEstate || "Yes (asked on the For-Families page)" };
    const text = `
PROPERTY HELP REQUEST (For-Families page)
=========================================
This visitor asked for help with an estate property. It came only to you.

${leadDetailsBlock(lead, { county: true })}

Replying to this email writes to the visitor (${lead.email}).

Sent ${ctTimestamp()}
    `.trim();

    const result = await sendEmail({
      to: OWNER_EMAIL,
      replyTo: lead.email,
      subject: withPropertyFlag(`For-Families request: ${lead.name}${lead.county ? `, ${countyLabel(lead.county)}` : ""}`, true),
      text,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Families lead API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

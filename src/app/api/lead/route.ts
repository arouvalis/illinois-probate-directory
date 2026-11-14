// Two forms post here:
// - formType "homepage"  -> the "help me find an attorney" path. Goes to the site owner.
// - formType "checklist" -> emails the checklist to the visitor, then tells the site owner.
import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp, OWNER_EMAIL } from "@/lib/email";
import { getAttorneyBySlug } from "@/lib/attorneys";
import { CHECKLIST_SUBJECT, checklistEmailText } from "@/lib/checklist";
import { parseLead, isPropertyLead, withPropertyFlag, leadDetailsBlock, countyLabel, rateLimited, TOO_MANY } from "@/lib/leads";

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

    const { lead } = parsed;
    const property = isPropertyLead(lead);

    if (body.formType === "homepage") {
      if (!lead.county) {
        return NextResponse.json({ error: "Please choose a county." }, { status: 400 });
      }
      const text = `
FIND ME AN ATTORNEY
===================
This visitor asked for help finding a probate attorney. It came only to you.
The visitor was told you will reply by email with attorney options.

${leadDetailsBlock(lead, { county: true })}

Replying to this email writes to the visitor (${lead.email}).

Sent ${ctTimestamp()}
      `.trim();

      const result = await sendEmail({
        to: OWNER_EMAIL,
        replyTo: lead.email,
        subject: withPropertyFlag(`FIND ME AN ATTORNEY: ${lead.name}, ${countyLabel(lead.county)}`, property),
        text,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body.formType === "checklist") {
      // 1. Send the visitor what the form promised. If this fails, the form shows an error.
      const sent = await sendEmail({
        to: lead.email,
        subject: CHECKLIST_SUBJECT,
        text: checklistEmailText(lead.name),
      });
      if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 500 });

      // 2. Tell the site owner. The visitor already has the checklist, so a failure here is only logged.
      const attorney = getAttorneyBySlug(typeof body.attorneySlug === "string" ? body.attorneySlug : "");
      const text = `
CHECKLIST REQUEST
=================
The Illinois Probate Checklist was emailed to this visitor automatically. Nothing else was promised.
${attorney ? `\nThey were viewing: ${attorney.name}\n${SITE}/attorney/${attorney.slug}\n` : ""}
${leadDetailsBlock(lead)}

Sent ${ctTimestamp()}
      `.trim();
      const notice = await sendEmail({
        to: OWNER_EMAIL,
        replyTo: lead.email,
        subject: withPropertyFlag(`Checklist request: ${lead.name}${attorney ? ` (viewing ${attorney.name})` : ""}`, property),
        text,
      });
      if (!notice.ok) console.error("Checklist was sent, but the owner notice failed for", lead.email);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown form." }, { status: 400 });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

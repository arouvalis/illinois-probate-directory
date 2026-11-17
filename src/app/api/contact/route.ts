// "Contact this attorney" path.
// - Attorney email on file  -> emailed to the attorney; the site owner gets a
//                              separate copy, which alone carries the PROPERTY LEAD flag.
// - No attorney email       -> emailed to the site owner, flagged CALL THIS ATTORNEY.
// The response says which happened so the form can show an accurate confirmation.
import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp, OWNER_EMAIL } from "@/lib/email";
import { getAttorneyBySlug } from "@/lib/attorneys";
import { resolveAttorneyLeadEmail, getAttorneyRecord } from "@/lib/attorneyRecords";
import { parseLead, isPropertyLead, withPropertyFlag, leadDetailsBlock, rateLimited, TOO_MANY } from "@/lib/leads";

const SITE = "https://www.illinoisprobatedirectory.com";

export const dynamic = "force-dynamic";

// Lets the message form say truthfully where a message will go. Answers only
// yes or no; the address itself never leaves the server.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!getAttorneyBySlug(slug)) return NextResponse.json({ emailOnFile: false });
  return NextResponse.json({ emailOnFile: (await resolveAttorneyLeadEmail(slug)) !== null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseLead(body);
    if (!parsed.ok) {
      // Bots get a normal-looking answer and nothing is sent.
      if (parsed.spam) return NextResponse.json({ ok: true, delivery: "owner" });
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    if (rateLimited(req)) return NextResponse.json({ error: TOO_MANY }, { status: 429 });

    // The attorney is looked up from our own data, never taken from the browser.
    const attorney = getAttorneyBySlug(typeof body.attorneySlug === "string" ? body.attorneySlug : "");
    if (!attorney) return NextResponse.json({ error: "We couldn't find that attorney listing." }, { status: 400 });

    const { lead } = parsed;
    const attorneyName = attorney.name ?? "Attorney";
    const pageUrl = `${SITE}/attorney/${attorney.slug}`;
    const property = isPropertyLead(lead);
    const attorneyEmail = await resolveAttorneyLeadEmail(attorney.slug);

    if (attorneyEmail) {
      const text = `
${attorneyName},

A visitor to IllinoisProbateDirectory.com sent you this message from your listing page:
${pageUrl}

To answer them, just reply to this email. Your reply goes straight to ${lead.name} (${lead.email}).

${leadDetailsBlock(lead)}

About this email: IllinoisProbateDirectory.com is a free directory of Illinois probate attorneys. There is no charge for this inquiry. Andy Rouvalis, who runs the directory, receives a copy of each inquiry. To change where inquiries are sent, or to stop receiving them, write to ${OWNER_EMAIL}.

Sent ${ctTimestamp()}
      `.trim();

      // The attorney's email never carries the PROPERTY LEAD flag.
      const result = await sendEmail({
        to: attorneyEmail,
        replyTo: lead.email,
        subject: `New probate inquiry for ${attorneyName} from ${lead.name}`,
        text,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

      // Separate copy for the site owner. The attorney already has the lead, so a
      // failure here is logged and the visitor still sees the true confirmation.
      const copy = await sendEmail({
        to: OWNER_EMAIL,
        replyTo: lead.email,
        subject: withPropertyFlag(`SENT TO ATTORNEY: ${attorneyName} (lead from ${lead.name})`, property),
        text: `
SENT TO ATTORNEY
================
This lead was emailed to ${attorneyName} at ${attorneyEmail}. This is your own copy; the attorney cannot see it.
The visitor was told the message was emailed to the attorney, who will reply directly.

Attorney:  ${attorneyName}
Phone:     ${getAttorneyRecord(attorney.slug)?.phone_override || attorney.phone || "Not on file"}
Listing:   ${pageUrl}

Lead details:
${leadDetailsBlock(lead)}

--- What the attorney received ---
${text}
        `.trim(),
      });
      if (!copy.ok) console.error("Lead was sent to the attorney, but the owner copy failed:", attorney.slug, lead.email);
      return NextResponse.json({ ok: true, delivery: "attorney" });
    }

    const record = getAttorneyRecord(attorney.slug);
    const phone = record?.phone_override || attorney.phone || "NO PHONE ON FILE";
    const text = `
CALL THIS ATTORNEY
==================
We have no email on file for this attorney, so this lead came only to you.
The visitor was told: "We've received your request and will connect you with ${attorneyName} within 1 business day."

Attorney:  ${attorneyName}
Phone:     ${phone}
Website:   ${attorney.website || "Not on file"}
Listing:   ${pageUrl}
${record?.referral_preference ? `Referral preference: ${record.referral_preference}\n` : ""}${record?.notes ? `Notes: ${record.notes}\n` : ""}
Lead details:
${leadDetailsBlock(lead)}

Replying to this email writes to the visitor (${lead.email}).

Sent ${ctTimestamp()}
    `.trim();

    const result = await sendEmail({
      to: OWNER_EMAIL,
      replyTo: lead.email,
      subject: withPropertyFlag(`CALL THIS ATTORNEY: ${attorneyName}, ${phone} (lead from ${lead.name})`, property),
      text,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, delivery: "owner" });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

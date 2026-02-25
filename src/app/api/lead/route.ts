import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, county, hasRealEstate, formType, attorneyName, attorneySlug } = body;

    if (!name || !email || !hasRealEstate) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    let subject: string;
    let emailBody: string;

    if (formType === "homepage") {
      if (!county) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      subject = `New Homepage Lead: ${name} — ${county} County`;
      emailBody = `
New Homepage Lead — IllinoisProbateDirectory.com
================================================

Lead Details:
  Name:    ${name}
  Email:   ${email}
  Phone:   ${phone || "Not provided"}
  County:  ${county}

*** Real Estate in Estate: ${hasRealEstate} ***

Sent at: ${ctTimestamp()}
      `.trim();
    } else {
      // checklist
      subject = `New Checklist Lead: ${name}${attorneyName ? ` (viewing ${attorneyName})` : ""}`;
      emailBody = `
New Checklist Lead — IllinoisProbateDirectory.com
=================================================

${attorneyName ? `Viewing Attorney: ${attorneyName}\nPage:            https://illinoisprobatedirectory.com/attorney/${attorneySlug ?? ""}\n` : ""}
Lead Details:
  Name:    ${name}
  Email:   ${email}

*** Real Estate in Estate: ${hasRealEstate} ***

Sent at: ${ctTimestamp()}
      `.trim();
    }

    const result = await sendEmail({ subject, text: emailBody, replyTo: email });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

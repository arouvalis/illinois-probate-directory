import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, county, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const subject = `New For-Families Lead: ${name}${county ? " — " + county + " County" : ""}`;
    const emailBody = `
New For-Families Lead — IllinoisProbateDirectory.com
====================================================
Source: For-Families Page

Lead Details:
  Name:    ${name}
  Email:   ${email}
  Phone:   ${phone || "Not provided"}
  County:  ${county || "Not provided"}

Message:
${message || "No message provided"}

*** source: for-families ***

Sent at: ${ctTimestamp()}
    `.trim();

    const result = await sendEmail({ subject, text: emailBody, replyTo: email });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Families lead API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

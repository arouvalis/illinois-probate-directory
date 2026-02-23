import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, description, hasRealEstate, attorneyName, attorneySlug } = body;

    if (!name || !email || !hasRealEstate) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const emailBody = `
New Attorney Message — IllinoisProbateDirectory.com
====================================================

Attorney:    ${attorneyName ?? "Unknown"}
Page:        https://illinoisprobatedirectory.com/attorney/${attorneySlug ?? ""}

Lead Details:
  Name:              ${name}
  Email:             ${email}
  Phone:             ${phone || "Not provided"}
  Message:           ${description || "Not provided"}

*** Real Estate in Estate: ${hasRealEstate} ***

Sent at: ${ctTimestamp()}
    `.trim();

    const result = await sendEmail({
      subject: `New Message Lead: ${name} → ${attorneyName ?? "Attorney"}`,
      text: emailBody,
      replyTo: email,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

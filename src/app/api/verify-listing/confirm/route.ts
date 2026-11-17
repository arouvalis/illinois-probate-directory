// Step 2 of "Verify your listing": the attorney pressed Confirm on the page
// their emailed link opened. The site owner is now asked to approve or reject.
// Lead routing still does not change here.
import { NextResponse } from "next/server";
import { sendEmail, ctTimestamp, OWNER_EMAIL } from "@/lib/email";
import { getAttorneyBySlug, cleanWebsite } from "@/lib/attorneys";
import { getAttorneyRecord } from "@/lib/attorneyRecords";
import {
  signatureValid,
  getRequest,
  saveRequest,
  getVerifiedListing,
  reviewLink,
  siteBase,
  emailDomainNote,
} from "@/lib/verifyListing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!signatureValid("confirm", id, body.sig)) {
      return NextResponse.json({ error: "This link is not valid." }, { status: 403 });
    }
    const request = await getRequest(id);
    if (!request) return NextResponse.json({ error: "This link has expired. Please fill in the form again." }, { status: 410 });
    if (request.status !== "pending_email") return NextResponse.json({ ok: true, already: true, src: request.src, slug: request.slug });

    const attorney = getAttorneyBySlug(request.slug);
    if (!attorney) return NextResponse.json({ error: "We couldn't find that listing." }, { status: 400 });

    const confirmed = { ...request, status: "awaiting_approval" as const, confirmedAt: new Date().toISOString() };
    await saveRequest(confirmed);

    const base = siteBase(req);
    const name = attorney.name ?? "Attorney";
    const current = await getVerifiedListing(request.slug).catch(() => null);
    const emailOnFile = current?.email || getAttorneyRecord(request.slug)?.email || "none";
    const listingWebsite = cleanWebsite(attorney.website);
    const row = (label: string, now: string, submitted: string) =>
      `${label}\n    Listing now: ${now || "none"}\n    Submitted:   ${submitted || "left blank"}${
        submitted && submitted.trim().toLowerCase() !== now.trim().toLowerCase() ? "   <-- different" : ""
      }`;

    const result = await sendEmail({
      to: OWNER_EMAIL,
      replyTo: request.email,
      subject: `APPROVE LISTING CHANGE: ${name} (${attorney.city ?? "Illinois"})`,
      text: `
VERIFY YOUR LISTING: APPROVAL NEEDED
====================================
${request.contactName} filled in the "Verify your listing" form for ${name} and confirmed the email address below by clicking the link we sent to it.

Nothing has changed yet. Leads for this listing still go ${emailOnFile === "none" ? "to you (CALL THIS ATTORNEY)" : `to ${emailOnFile}`}.

APPROVE: send this listing's "Contact this attorney" leads to ${request.email}, with you copied
${reviewLink(base, request.id, "approve")}

REJECT: change nothing
${reviewLink(base, request.id, "reject")}

Each link opens a page with one button to press. The links are signed and work only for this request.

Listing:   ${name}
Page:      ${base}/attorney/${attorney.slug}

Contact name:  ${request.contactName}
Email:         ${request.email}
               Email on file now: ${emailOnFile}
               Email domain check: ${emailDomainNote(request.email, listingWebsite)}

${row("Phone", attorney.phone ?? "", request.phone)}

${row("Website", listingWebsite ?? "", request.website)}

Counties served
    Listing now: ${attorney.source_county}
    Submitted:   ${request.counties.join(", ") || "none ticked"}

Wants client inquiries from the directory: Yes (box ticked)

Corrections they asked for:
${request.corrections || "None"}

What approving does: saves the email (never shown on the site) so leads go straight to them. It does NOT change the public listing. Phone, website, county and other corrections above are for you to make by hand in the listing data if you agree with them.

Came from: ${request.src}
Form sent:       ${new Date(request.createdAt).toLocaleString("en-US", { timeZone: "America/Chicago" })} CT
Email confirmed: ${ctTimestamp()}

LATER, IF NEEDED: stop sending leads to this address (works only after you have approved)
${reviewLink(base, request.id, "revoke")}

Replying to this email writes to ${request.email}.
      `.trim(),
    });
    if (!result.ok) {
      // Put it back so the attorney can press Confirm again.
      await saveRequest(request).catch(() => {});
      return NextResponse.json({ error: "Something went wrong on our side. Please try the button again in a minute." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, src: request.src, slug: request.slug });
  } catch (err) {
    console.error("Verify listing confirm API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

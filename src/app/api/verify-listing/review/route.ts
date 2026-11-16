// Step 3 of "Verify your listing": the site owner approves, rejects, or later
// switches off a verified email. Only reachable with a signed link from the
// owner's own email.
import { NextResponse } from "next/server";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { getAttorneyBySlug } from "@/lib/attorneys";
import {
  signatureValid,
  getRequest,
  saveRequest,
  getVerifiedListing,
  saveVerifiedListing,
  deleteVerifiedListing,
  siteBase,
} from "@/lib/verifyListing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";
    const action = body.action;
    if ((action !== "approve" && action !== "reject" && action !== "revoke") || !signatureValid(action, id, body.sig)) {
      return NextResponse.json({ error: "This link is not valid." }, { status: 403 });
    }
    const request = await getRequest(id);
    if (!request) return NextResponse.json({ error: "This request no longer exists (requests are kept 90 days)." }, { status: 410 });
    const now = new Date().toISOString();

    if (action === "revoke") {
      const current = await getVerifiedListing(request.slug);
      if (request.status !== "approved" || current?.request_id !== request.id) {
        return NextResponse.json({ error: "There is nothing to switch off: this request is not the one currently in use for the listing." }, { status: 409 });
      }
      await deleteVerifiedListing(request.slug);
      await saveRequest({ ...request, status: "revoked", decidedAt: now });
      return NextResponse.json({ ok: true, status: "revoked" });
    }

    if (request.status !== "awaiting_approval") {
      return NextResponse.json({ error: `This request was already ${request.status === "pending_email" ? "left unconfirmed" : request.status}.` }, { status: 409 });
    }

    if (action === "reject") {
      await saveRequest({ ...request, status: "rejected", decidedAt: now });
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    const attorney = getAttorneyBySlug(request.slug);
    if (!attorney) return NextResponse.json({ error: "That listing is no longer in the directory." }, { status: 400 });

    await saveVerifiedListing(request.slug, {
      email: request.email,
      contact_name: request.contactName,
      phone: request.phone,
      website: request.website,
      counties: request.counties,
      consent_at: request.confirmedAt ?? request.createdAt,
      approved_at: now,
      request_id: request.id,
    });
    await saveRequest({ ...request, status: "approved", decidedAt: now });

    const name = attorney.name ?? "your firm";
    const notice = await sendEmail({
      to: request.email,
      replyTo: OWNER_EMAIL,
      subject: `Your ${name} listing is verified`,
      text: `
${request.contactName},

Your request for the ${name} listing on IllinoisProbateDirectory.com has been approved.

From now on, when someone uses "Send This Attorney a Message" on your listing, their message is emailed to this address. Reply to that email and your answer goes straight to the person. There is no charge.

Your listing: ${siteBase(req)}/attorney/${attorney.slug}

Your email address is not shown on the site. Andy Rouvalis, who runs the directory, receives a copy of each inquiry. Any corrections you asked for are reviewed by hand.

To change this address or stop receiving inquiries, reply to this email.

Andy Rouvalis
IllinoisProbateDirectory.com
      `.trim(),
    });
    return NextResponse.json({ ok: true, status: "approved", attorneyNotified: notice.ok });
  } catch (err) {
    console.error("Verify listing review API error:", err);
    return NextResponse.json({ error: "Server error. Nothing may have been saved; please try the button again." }, { status: 500 });
  }
}

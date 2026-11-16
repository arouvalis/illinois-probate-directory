// Step 1 of "Verify your listing": the attorney submits the form.
// The request is saved and a confirmation link is emailed to the address they
// entered. Nothing else happens until that link is used.
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getAttorneyBySlug } from "@/lib/attorneys";
import { rateLimited, TOO_MANY } from "@/lib/leads";
import { storeCount } from "@/lib/store";
import {
  parseVerifyInput,
  verifyAvailable,
  newRequestId,
  saveRequest,
  deleteRequest,
  confirmLink,
  siteBase,
  emailKey,
  CONFIRM_DAYS,
  type VerifyRequest,
} from "@/lib/verifyListing";

const UNAVAILABLE = "Listing verification isn't available right now. Please try again later.";
const DAY = 24 * 60 * 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Bots that fill the hidden field get a normal-looking answer and nothing is sent.
    if (typeof body.company_website === "string" && body.company_website.trim()) return NextResponse.json({ ok: true });

    const attorney = getAttorneyBySlug(typeof body.attorneySlug === "string" ? body.attorneySlug : "");
    if (!attorney) return NextResponse.json({ error: "We couldn't find that listing." }, { status: 400 });

    const parsed = parseVerifyInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    if (rateLimited(req)) return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    if (!verifyAvailable()) {
      console.error("Verify listing: the database or VERIFY_LISTING_SECRET is not configured.");
      return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
    }

    const { input } = parsed;
    // So the form cannot be used to flood a listing or someone's inbox:
    // at most 5 requests per listing and 3 per email address in a day.
    const perListing = await storeCount(`limit:listing:${attorney.slug}`, DAY);
    const perEmail = await storeCount(`limit:email:${emailKey(input.email)}`, DAY);
    if (perListing > 5 || perEmail > 3) return NextResponse.json({ error: TOO_MANY }, { status: 429 });

    const request: VerifyRequest = {
      id: newRequestId(),
      slug: attorney.slug,
      ...input,
      status: "pending_email",
      createdAt: new Date().toISOString(),
    };
    await saveRequest(request);

    const name = attorney.name ?? "your firm";
    const result = await sendEmail({
      to: input.email,
      subject: `Confirm your email for the ${name} listing`,
      text: `
${input.contactName},

Someone, hopefully you, asked to verify the listing for ${name} on IllinoisProbateDirectory.com and gave this email address for client inquiries.

To confirm this address, open this link and press the Confirm button:
${confirmLink(siteBase(req), request.id)}

The link works for ${CONFIRM_DAYS} days. Nothing changes until you confirm. After that, the person who runs the directory reviews the request before any inquiries are sent to you.

Your email address is never shown on the site.

If you did not ask for this, ignore this email and nothing will happen.

IllinoisProbateDirectory.com is a free directory of Illinois probate attorneys, run by Andy Rouvalis.
      `.trim(),
    });
    if (!result.ok) {
      await deleteRequest(request.id).catch(() => {});
      return NextResponse.json({ error: "We couldn't send the confirmation email. Please check the address and try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Verify listing API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

// The site owner's approve / reject page, opened from the signed links in the
// approval email. Opening it changes nothing; pressing the button does.
import type { Metadata } from "next";
import { getAttorneyBySlug } from "@/lib/attorneys";
import { signatureValid, getRequest, getVerifiedListing } from "@/lib/verifyListing";
import { ReviewButton } from "@/components/VerifyListingActions";

export const metadata: Metadata = { title: "Review listing request", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const HEADINGS = { approve: "Approve this listing change?", reject: "Reject this listing change?", revoke: "Stop sending leads to this address?" } as const;

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-serif font-bold text-navy-900 text-2xl sm:text-3xl mb-4">{heading}</h1>
      <div className="space-y-4 text-gray-700">{children}</div>
    </div>
  );
}

export default async function ReviewPage({ searchParams }: { searchParams: { id?: string; action?: string; sig?: string } }) {
  const id = typeof searchParams.id === "string" ? searchParams.id : "";
  const sig = typeof searchParams.sig === "string" ? searchParams.sig : "";
  const action = searchParams.action;
  if ((action !== "approve" && action !== "reject" && action !== "revoke") || !signatureValid(action, id, sig)) {
    return <Shell heading="This link is not valid"><p>Use the link exactly as it appears in the approval email.</p></Shell>;
  }
  const request = await getRequest(id).catch(() => null);
  if (!request) {
    return <Shell heading="Request not found"><p>This request no longer exists. Undecided requests are kept for 90 days.</p></Shell>;
  }
  const attorney = getAttorneyBySlug(request.slug);
  const name = attorney?.name ?? request.slug;

  let blocked = "";
  if (action === "revoke") {
    const current = await getVerifiedListing(request.slug).catch(() => null);
    if (request.status === "revoked") blocked = "This address was already switched off.";
    else if (request.status !== "approved" || current?.request_id !== request.id) blocked = "There is nothing to switch off: this request was never approved, or a newer one has replaced it.";
  } else if (request.status !== "awaiting_approval") {
    blocked = `This request was already ${request.status}. Nothing more to do.`;
  }

  return (
    <Shell heading={blocked ? "Nothing to do" : HEADINGS[action]}>
      <dl className="bg-white rounded-xl border border-gray-200 p-5 text-sm space-y-2">
        {([
          ["Listing", name],
          ["Contact name", request.contactName],
          ["Email", request.email],
          ["Phone", request.phone || "left blank"],
          ["Website", request.website || "left blank"],
          ["Counties served", request.counties.join(", ") || "none ticked"],
          ["Corrections", request.corrections || "None"],
        ] as const).map(([term, value]) => (
          <div key={term} className="grid grid-cols-3 gap-2">
            <dt className="text-gray-500">{term}</dt>
            <dd className="col-span-2 text-gray-900 break-words whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
      </dl>
      {blocked ? (
        <p>{blocked}</p>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            {action === "approve" && `Approving sends this listing's "Contact this attorney" leads to ${request.email}, with you copied. The email is never shown on the site, and the public listing is not changed.`}
            {action === "reject" && "Rejecting changes nothing. Leads keep going where they go today."}
            {action === "revoke" && "Leads for this listing will come to you again as CALL THIS ATTORNEY."}
          </p>
          <ReviewButton id={id} sig={sig} action={action} />
        </>
      )}
    </Shell>
  );
}

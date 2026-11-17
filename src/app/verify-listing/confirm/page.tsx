// The page an attorney lands on from the confirmation link in their email.
// Opening it changes nothing; pressing the button confirms the address.
import type { Metadata } from "next";
import { getAttorneyBySlug } from "@/lib/attorneys";
import { signatureValid, getRequest } from "@/lib/verifyListing";
import { ConfirmEmailButton } from "@/components/VerifyListingActions";

export const metadata: Metadata = { title: "Confirm your email", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-serif font-bold text-navy-900 text-2xl sm:text-3xl mb-4">{heading}</h1>
      <div className="space-y-4 text-gray-700">{children}</div>
    </div>
  );
}

export default async function ConfirmPage({ searchParams }: { searchParams: { id?: string; sig?: string } }) {
  const id = typeof searchParams.id === "string" ? searchParams.id : "";
  const sig = typeof searchParams.sig === "string" ? searchParams.sig : "";
  if (!signatureValid("confirm", id, sig)) {
    return <Shell heading="This link is not valid"><p>Please use the link exactly as it appears in the email we sent you.</p></Shell>;
  }
  const request = await getRequest(id).catch(() => null);
  if (!request) {
    return <Shell heading="This link has expired"><p>Confirmation links work for 7 days. Please go back to your listing and fill in the form again.</p></Shell>;
  }
  const name = getAttorneyBySlug(request.slug)?.name ?? "your firm";
  if (request.status !== "pending_email") {
    return (
      <Shell heading="Already confirmed">
        <p>This email address was already confirmed for the {name} listing. There is nothing more to do.</p>
      </Shell>
    );
  }
  return (
    <Shell heading="Confirm your email">
      <p>
        You asked to receive client inquiries for the <strong>{name}</strong> listing at{" "}
        <strong>{request.email}</strong>.
      </p>
      <p className="text-sm text-gray-500">
        After you confirm, the person who runs the directory reviews the request. Your email address is never shown on the site.
      </p>
      <ConfirmEmailButton id={id} sig={sig} email={request.email} />
    </Shell>
  );
}

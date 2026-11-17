// Where the "Unsubscribe" link in a campaign email lands. Opening it changes
// nothing; pressing the button saves the address so it is skipped from then on.
import type { Metadata } from "next";
import { lookupUnsubscribeToken, isUnsubscribed, type UnsubscribeToken } from "@/lib/unsubscribe";
import { UnsubscribeButton } from "@/components/UnsubscribeButton";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-serif font-bold text-navy-900 text-2xl sm:text-3xl mb-4">{heading}</h1>
      <div className="space-y-4 text-gray-700">{children}</div>
    </div>
  );
}

const REPLY_INSTEAD = "Please reply to the email you received with the word “unsubscribe” and we will take you off the list by hand.";

export default async function UnsubscribePage({ searchParams }: { searchParams: { t?: string } }) {
  const token = typeof searchParams.t === "string" ? searchParams.t : "";
  let found: UnsubscribeToken | null = null;
  let already = false;
  try {
    found = await lookupUnsubscribeToken(token);
    if (found) already = await isUnsubscribed(found.email);
  } catch (err) {
    console.error("Unsubscribe page error:", err);
    return <Shell heading="Unsubscribe isn't available right now"><p>{REPLY_INSTEAD}</p></Shell>;
  }
  if (!found) {
    return (
      <Shell heading="This link is not valid">
        <p>Please use the link exactly as it appears in the email we sent you.</p>
        <p>{REPLY_INSTEAD}</p>
      </Shell>
    );
  }
  if (already) {
    return (
      <Shell heading="Already unsubscribed">
        <p><strong>{found.email}</strong> is already off our email list. There is nothing more to do.</p>
      </Shell>
    );
  }
  return (
    <Shell heading="Unsubscribe">
      <p>
        Stop emails from Illinois Probate Directory to <strong>{found.email}</strong>?
      </p>
      <p className="text-sm text-gray-500">Your listing on the directory is not affected.</p>
      <UnsubscribeButton token={token} email={found.email} />
    </Shell>
  );
}
